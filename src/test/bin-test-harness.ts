/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Test harness object for spawning child processes based on the
 * Memorelay main CLI entry point (bin.ts).
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { WebSocket } from 'ws';

import { getPortFromLogMessage } from './get-port-from-log-message';

export class BinTestHarness {
  /**
   * Port that the child process bound. Determined from log message.
   */
  boundPort?: number;

  /**
   * Reference to the spawned child process.
   */
  childProcess?: ChildProcess;

  /**
   * First logged message after child process startup.
   */
  logMessage?: string;

  /**
   * Set of WebSockets opened by this object.
   */
  readonly webSockets = new Set<WebSocket>();

  /**
   * Set up the child process.
   */
  async setup() {
    const childProcess = (this.childProcess = spawn('ts-node', [
      path.join(__dirname, '..', 'bin.ts'),
      '--no-color',
      '--port=0',
    ]));

    // Wait for child process to spawn.
    await new Promise<void>((resolve, reject) => {
      childProcess.on('spawn', resolve);
      childProcess.on('error', reject);
    });

    childProcess.removeAllListeners('spawn');
    childProcess.removeAllListeners('error');

    const logMessage = (this.logMessage = await new Promise<string>(
      (resolve, reject) => {
        childProcess.stdout.on('data', (data: Buffer) => {
          resolve(data.toString('utf-8'));
        });
        childProcess.on('error', reject);
      }
    ));

    childProcess.stdout.removeAllListeners('data');
    childProcess.removeAllListeners('error');

    this.boundPort = getPortFromLogMessage(logMessage);
  }

  /**
   * Teardown the child process.
   */
  async teardown() {
    if (!this.childProcess) {
      throw new Error('child process not found');
    }

    // Close all open WebSockets.
    await Promise.all(
      [...this.webSockets.values()].map((webSocket) =>
        this.closeWebSocket(webSocket)
      )
    );

    const childProcess = this.childProcess;

    // Interrupt child process and wait for exit.
    await new Promise<void>((resolve, reject) => {
      childProcess.on('error', reject);
      childProcess.on('exit', resolve);
      childProcess.kill('SIGINT');
    });

    childProcess.removeAllListeners('error');
    childProcess.removeAllListeners('exit');
  }

  /**
   * Open a WebSocket to the bound port and return it.
   * @returns The opened WebSocket.
   */
  async openWebSocket(): Promise<WebSocket> {
    if (this.boundPort === undefined) {
      throw new Error('bound port missing');
    }

    const webSocket = new WebSocket(`ws://localhost:${this.boundPort}`);
    this.webSockets.add(webSocket);

    // Wait for WebSocket to connect.
    await new Promise<void>((resolve, reject) => {
      webSocket.on('open', resolve);
      webSocket.on('error', reject);
    });

    webSocket.removeAllListeners('open');
    webSocket.removeAllListeners('error');

    return webSocket;
  }

  /**
   * Close a previously opened WebSocket.
   * @param webSocket The WebSocket to close.
   */
  async closeWebSocket(webSocket: WebSocket) {
    if (!this.webSockets.has(webSocket)) {
      throw new Error('web socket not recognized');
    }

    await new Promise<void>((resolve, reject) => {
      webSocket.on('close', resolve);
      webSocket.on('error', reject);
      webSocket.close();
    });

    this.webSockets.delete(webSocket);
  }
}
