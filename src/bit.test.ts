/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Integration tests for binary (entry point bin.ts).
 */

import path from 'path';
import { spawn } from 'child_process';

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

    await new Promise<void>((resolve, reject) => {
      childProcess.on('spawn', resolve);
      childProcess.on('error', reject);
    });

    childProcess.removeAllListeners();

    await new Promise<void>((resolve, reject) => {
      childProcess.on('error', reject);
      childProcess.on('exit', resolve);
      const innerResult = childProcess.kill('SIGINT');
      expect(innerResult).toBe(true);
    });
  });
});
