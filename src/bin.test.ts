/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Integration tests for binary (entry point bin.ts).
 */

import {
  bufferToClientMessage,
  bufferToRelayMessage,
} from './lib/buffer-to-message';

import { Event as NostrEvent } from 'nostr-tools';
import path from 'path';
import { spawn } from 'child_process';
import { WebSocket } from 'ws';
import { OKMessage } from './lib/message-types';

const EXAMPLE_SIGNED_EVENT: NostrEvent = Object.freeze({
  content: 'BRB, turning on the miners',
  created_at: 1683474317,
  id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
  kind: 1,
  pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
  sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
  tags: [],
});

/**
 * Ensure each test gets a unique TCP port so that they can run in parallel
 * without colliding.
 */
let nextPortNumber = 4040;

describe('bin.ts', () => {
  it.concurrent('should start up cleanly', async () => {
    const PORT = `${nextPortNumber++}`;
    const result = await new Promise<boolean>((resolve, reject) => {
      const childProcess = spawn('ts-node', [
        path.join(__dirname, 'bin.ts'),
        '--port',
        PORT,
      ]);
      childProcess.on('spawn', () => {
        resolve(true);
        childProcess.kill();
      });
      childProcess.on('error', reject);
    });

    expect(result).toBe(true);
  });

  it.concurrent('should stop cleanly', async () => {
    const PORT = `${nextPortNumber++}`;
    const childProcess = spawn('ts-node', [
      path.join(__dirname, 'bin.ts'),
      '--port',
      PORT,
    ]);

    // Wait for child process to spawn.
    await new Promise<void>((resolve, reject) => {
      childProcess.on('spawn', resolve);
      childProcess.on('error', reject);
    });

    childProcess.removeAllListeners();

    // Kill child process.
    await new Promise<void>((resolve, reject) => {
      childProcess.on('error', reject);
      childProcess.on('exit', resolve);
      const innerResult = childProcess.kill('SIGINT');
      expect(innerResult).toBe(true);
    });
  });

  it.concurrent('should listen on desired port', async () => {
    const PORT = `${nextPortNumber++}`;

    const childProcess = spawn('ts-node', [
      path.join(__dirname, 'bin.ts'),
      '--port',
      PORT,
      '--no-color',
    ]);

    await new Promise<void>((resolve, reject) => {
      childProcess.on('spawn', resolve);
      childProcess.on('error', reject);
    });

    childProcess.removeAllListeners();

    const logMessage = await new Promise<string>((resolve, reject) => {
      childProcess.stdout.on('data', (data: Buffer) => {
        resolve(data.toString('utf-8'));
      });
      childProcess.on('error', reject);
    });

    childProcess.removeAllListeners();

    expect(logMessage).toContain(`Memorelay listening on port ${PORT}`);

    const webSocket = new WebSocket(`ws://localhost:${PORT}`);

    // Wait for WebSocket to connect.
    await new Promise<void>((resolve, reject) => {
      webSocket.on('open', resolve);
      webSocket.on('error', reject);
    });

    webSocket.removeAllListeners();

    // Wait for WebSocket to close.
    await new Promise<void>((resolve, reject) => {
      webSocket.on('close', resolve);
      webSocket.on('error', reject);
      webSocket.close();
    });

    // Kill memorelay child process.
    await new Promise<void>((resolve, reject) => {
      childProcess.on('error', reject);
      childProcess.on('exit', resolve);
      const innerResult = childProcess.kill('SIGINT');
      expect(innerResult).toBe(true);
    });
  });

  it.concurrent('should receive event from client', async () => {
    const PORT = `${nextPortNumber++}`;

    const childProcess = spawn('ts-node', [
      path.join(__dirname, 'bin.ts'),
      '--port',
      PORT,
      '--no-color',
      '--log-level',
      'verbose',
    ]);

    await new Promise<void>((resolve, reject) => {
      childProcess.on('spawn', resolve);
      childProcess.on('error', reject);
    });

    childProcess.removeAllListeners();

    // Wait for first logged message (signals startup).
    await new Promise<string>((resolve, reject) => {
      childProcess.stdout.on('data', resolve);
      childProcess.on('error', reject);
    });

    childProcess.removeAllListeners();
    childProcess.stdout.removeAllListeners();

    const webSocket = new WebSocket(`ws://localhost:${PORT}`);

    const webSocketConnectPromise = new Promise<void>((resolve, reject) => {
      webSocket.on('open', resolve);
      webSocket.on('error', reject);
    });

    const childProcessConnectPromise = new Promise<string>(
      (resolve, reject) => {
        childProcess.stdout.on('data', (data: Buffer) => {
          resolve(data.toString('utf-8'));
        });
        childProcess.on('error', reject);
      }
    );

    const [, childProcessConnectedLogMessage] = await Promise.all([
      webSocketConnectPromise,
      childProcessConnectPromise,
    ]);

    webSocket.removeAllListeners();
    childProcess.removeAllListeners();
    childProcess.stdout.removeAllListeners();

    // Expect the connected client to have triggered an http level log message.
    expect(childProcessConnectedLogMessage).toContain('http: OPEN');
    expect(childProcessConnectedLogMessage).toContain(`localhost:${PORT}`);

    const childProcessEventPromise = new Promise<string>((resolve, reject) => {
      childProcess.stdout.on('data', (data: Buffer) => {
        resolve(data.toString('utf-8'));
      });
      childProcess.on('error', reject);
    });

    const webSocketOKMessagePromise = new Promise<OKMessage>(
      (resolve, reject) => {
        webSocket.once('message', (buffer: Buffer) => {
          resolve(bufferToRelayMessage(buffer) as OKMessage);
        });
        webSocket.once('error', reject);
      }
    );

    webSocket.send(
      Buffer.from(JSON.stringify(['EVENT', EXAMPLE_SIGNED_EVENT]), 'utf-8')
    );

    const [childProcessEventLogMessage, webSocketOKMessage] = await Promise.all(
      [childProcessEventPromise, webSocketOKMessagePromise]
    );

    childProcess.removeAllListeners();
    childProcess.stdout.removeAllListeners();
    webSocket.removeAllListeners();

    expect(childProcessEventLogMessage).toContain(
      `verbose: EVENT ${EXAMPLE_SIGNED_EVENT.id}`
    );

    expect(webSocketOKMessage).toEqual([
      'OK',
      EXAMPLE_SIGNED_EVENT.id,
      true,
      '',
    ]);

    // Wait for WebSocket to close.
    await new Promise<void>((resolve, reject) => {
      webSocket.once('close', resolve);
      webSocket.once('error', reject);
      webSocket.close();
    });

    // Kill memorelay child process.
    await new Promise<void>((resolve, reject) => {
      childProcess.once('error', reject);
      childProcess.once('exit', resolve);
      const innerResult = childProcess.kill('SIGINT');
      expect(innerResult).toBe(true);
    });
  });

  it.concurrent('should forward event from sender to subscribers', async () => {
    const PORT = `${nextPortNumber++}`;

    const childProcess = spawn('ts-node', [
      path.join(__dirname, 'bin.ts'),
      '--port',
      PORT,
      '--no-color',
      '--log-level',
      'verbose',
    ]);

    // Startup.
    await new Promise<void>((resolve, reject) => {
      childProcess.on('spawn', resolve);
      childProcess.on('error', reject);
    });
    childProcess.removeAllListeners();
    await new Promise<string>((resolve, reject) => {
      childProcess.stdout.on('data', resolve);
      childProcess.on('error', reject);
    });
    childProcess.removeAllListeners();
    childProcess.stdout.removeAllListeners();

    // Wait for the listener to finish connecting.
    const listenerWebSocket = new WebSocket(`ws://localhost:${PORT}`);
    const [, listenerConnectLogMessage] = await Promise.all([
      new Promise<void>((resolve, reject) => {
        listenerWebSocket.on('open', resolve);
        listenerWebSocket.on('error', reject);
      }),
      new Promise<string>((resolve, reject) => {
        childProcess.stdout.on('data', (data: Buffer) => {
          resolve(data.toString('utf-8'));
        });
        childProcess.on('error', reject);
      }),
    ]);
    listenerWebSocket.removeAllListeners();
    childProcess.removeAllListeners();
    childProcess.stdout.removeAllListeners();

    // Expect the connected listener to have triggered an http log message.
    expect(listenerConnectLogMessage).toContain('http: OPEN');

    // Have listener subscribe using a REQ message, wait for log on child
    // process.
    const listenerReqLogMessage = await new Promise<string>(
      (resolve, reject) => {
        childProcess.stdout.on('data', (data: Buffer) => {
          resolve(data.toString('utf-8'));
        });
        childProcess.on('error', reject);
        listenerWebSocket.send(
          Buffer.from(JSON.stringify(['REQ', '1']), 'utf-8')
        );
      }
    );
    childProcess.removeAllListeners();
    childProcess.stdout.removeAllListeners();

    // Confirm REQ received.
    expect(listenerReqLogMessage).toContain('verbose: REQ 1');

    // Connect the sender WebSocket.
    const senderWebSocket = new WebSocket(`ws://localhost:${PORT}`);
    const [, senderConnectLogMessage] = await Promise.all([
      new Promise<void>((resolve, reject) => {
        senderWebSocket.on('open', resolve);
        senderWebSocket.on('error', reject);
      }),
      new Promise<string>((resolve, reject) => {
        childProcess.stdout.on('data', (data: Buffer) => {
          resolve(data.toString('utf-8'));
        });
        childProcess.on('error', reject);
      }),
    ]);
    senderWebSocket.removeAllListeners();
    childProcess.removeAllListeners();
    childProcess.stdout.removeAllListeners();

    // Expect the connected sender to have triggered an http log message.
    expect(senderConnectLogMessage).toContain('http: OPEN');

    // Have sender send an EVENT message, and confirm that it was received by
    // the listener.
    const listenerData = await new Promise<Buffer>((resolve, reject) => {
      listenerWebSocket.on('message', resolve);
      listenerWebSocket.on('error', reject);
      senderWebSocket.send(
        Buffer.from(JSON.stringify(['EVENT', EXAMPLE_SIGNED_EVENT]), 'utf-8')
      );
    });
    listenerWebSocket.removeAllListeners();

    const listenerMessage = bufferToClientMessage(listenerData);

    expect(listenerMessage[0]).toBe('EVENT');
    expect(listenerMessage[1]).toEqual(EXAMPLE_SIGNED_EVENT);

    // Wait for WebSockets to close.
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        listenerWebSocket.on('close', resolve);
        listenerWebSocket.on('error', reject);
        listenerWebSocket.close();
      }),
      new Promise<void>((resolve, reject) => {
        senderWebSocket.on('close', resolve);
        senderWebSocket.on('error', reject);
        senderWebSocket.close();
      }),
    ]);

    // Kill memorelay child process.
    await new Promise<void>((resolve, reject) => {
      childProcess.on('error', reject);
      childProcess.on('exit', resolve);
      const innerResult = childProcess.kill('SIGINT');
      expect(innerResult).toBe(true);
    });
  });
});
