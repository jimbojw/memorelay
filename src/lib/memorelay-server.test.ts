/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the MemorelayServer class.
 */

import { createExpectingLogger } from './create-expecting-logger';
import { MemorelayServer } from './memorelay-server';

import { createLogger, LogEntry } from 'winston';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

describe('MemorelayServer', () => {
  it('should be a constructor function', () => {
    expect(typeof MemorelayServer).toBe('function');
    const logger = createLogger();
    const server = new MemorelayServer(3000, logger);
    expect(server instanceof MemorelayServer).toBe(true);
  });

  describe('listen', () => {
    it('should begin listening for WebSocket connections', async () => {
      const expectedLogs: LogEntry[] = [
        { level: 'info', message: 'Memorelay listening on port 3000' },
      ];

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const server = new MemorelayServer(3000, fakeLogger);

      expect(await server.listen()).toBe(true);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);

      // Needed to prevent jest warning about worker processes.
      await server.stop();
    });

    it('should return false if already listening', async () => {
      const expectedLogs: LogEntry[] = [
        { level: 'info', message: 'Memorelay listening on port 3000' },
      ];

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const server = new MemorelayServer(3000, fakeLogger);

      await server.listen();

      expect(await server.listen()).toBe(false);

      const actualLogs = await actualLogsPromise;

      expect(await server.listen()).toBe(false);

      expect(actualLogs).toEqual(expectedLogs);

      // Needed to prevent jest warning about worker processes.
      await server.stop();
    });
  });

  describe('stop', () => {
    it('should return false if never listening', async () => {
      const { fakeLogger } = createExpectingLogger(0);

      const server = new MemorelayServer(3000, fakeLogger);

      expect(await server.stop()).toBe(false);
    });

    it('should stop the server from listening', async () => {
      const expectedLogs: LogEntry[] = [
        { level: 'info', message: 'Memorelay listening on port 3000' },
        { level: 'info', message: 'Memorelay closed' },
      ];

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const server = new MemorelayServer(3000, fakeLogger);

      await server.listen();

      expect(await server.stop()).toBe(true);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });

    it('should return false if the server has already stopped', async () => {
      const expectedLogs: LogEntry[] = [
        { level: 'info', message: 'Memorelay listening on port 3000' },
        { level: 'info', message: 'Memorelay closed' },
      ];

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const server = new MemorelayServer(3000, fakeLogger);

      await server.listen();

      await server.stop();

      expect(await server.stop()).toBe(false);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });
  });

  describe('connect', () => {
    it('should accept a connecting WebSocket', async () => {
      const expectedLogs: LogEntry[] = [
        { level: 'http', message: 'OPEN (%d|%s) %s' },
      ];

      const ws = new WebSocket(null);

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const server = new MemorelayServer(3000, fakeLogger);

      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;

      server.connect(ws, fakeMessage);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });
  });
});
