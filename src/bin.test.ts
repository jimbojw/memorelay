/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Integration tests for binary (entry point bin.ts).
 */

import path from 'path';
import { spawn } from 'child_process';
import { WebSocket } from 'ws';

describe('bin.ts', () => {
  it('should start up cleanly', async () => {
    const result = await new Promise<boolean>((resolve, reject) => {
      const childProcess = spawn('ts-node', [path.join(__dirname, 'bin.ts')]);
      childProcess.on('spawn', () => {
        resolve(true);
        childProcess.kill();
      });
      childProcess.on('error', reject);
    });

    expect(result).toBe(true);
  });

  it('should stop cleanly', async () => {
    const childProcess = spawn('ts-node', [path.join(__dirname, 'bin.ts')]);

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

  it('should listen on desired port', async () => {
    const childProcess = spawn('ts-node', [
      path.join(__dirname, 'bin.ts'),
      '--port',
      '4040',
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

    expect(logMessage).toContain('Memorelay listening on port 4040');

    const webSocket = new WebSocket('ws://localhost:4040');

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
});
