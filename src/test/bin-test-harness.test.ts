/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for BinTestHarness.
 */

import { WebSocket } from 'ws';
import { BinTestHarness } from './bin-test-harness';

describe('BinTestHarness', () => {
  describe('teardown()', () => {
    it('should throw if called before child process is created', async () => {
      const binTestHarness = new BinTestHarness();
      try {
        await binTestHarness.teardown();
      } catch (err) {
        expect((err as Error).message).toMatch('child process missing');
      }
    });
  });

  describe('openWebSocket()', () => {
    it('should throw if bound port is missing', async () => {
      const binTestHarness = new BinTestHarness();
      try {
        await binTestHarness.openWebSocket();
      } catch (err) {
        expect((err as Error).message).toMatch('bound port missing');
      }
    });
  });

  describe('closeWebSocket()', () => {
    it('should throw if object passed was not self-created', async () => {
      const binTestHarness = new BinTestHarness();
      try {
        await binTestHarness.closeWebSocket({} as WebSocket);
      } catch (err) {
        expect((err as Error).message).toMatch('web socket not recognized');
      }
    });
  });
});
