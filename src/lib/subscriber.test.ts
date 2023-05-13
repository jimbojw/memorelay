/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the Subscriber class.
 */

import { createExpectingLogger } from './create-expecting-logger';
import { Subscriber } from './subscriber';

import { LogEntry } from 'winston';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import { BadMessageError } from './bad-message-error';

describe('Subscriber', () => {
  it('should be a constructor function', () => {
    expect(typeof Subscriber).toBe('function');
  });

  describe('constructor', () => {
    it('should create a Subscriber and log expected messages', async () => {
      const webSocket = new WebSocket(null);
      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;

      const expectedLogs: LogEntry[] = [
        { level: 'http', message: 'OPEN (%s) %s' },
      ];
      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const subscriber = new Subscriber(webSocket, fakeMessage, fakeLogger);

      expect(subscriber instanceof Subscriber).toBe(true);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });
  });

  describe('on(close)', () => {
    it('should log closing message', async () => {
      const webSocket = new WebSocket(null);
      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;
      const expectedLogs: LogEntry[] = [
        { level: 'http', message: 'OPEN (%s) %s' },
        { level: 'http', message: 'CLOSE (%s) %s' },
      ];
      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      new Subscriber(webSocket, fakeMessage, fakeLogger);

      webSocket.emit('close');

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });
  });

  describe('on(error)', () => {
    it('should log error message', async () => {
      const webSocket = new WebSocket(null);
      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;

      const expectedLogs: LogEntry[] = [
        { level: 'http', message: 'OPEN (%s) %s' },
        { level: 'error', message: 'ERROR_MESSAGE' },
      ];
      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      new Subscriber(webSocket, fakeMessage, fakeLogger);

      webSocket.emit('error', 'ERROR_MESSAGE');

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });
  });

  describe('on(message)', () => {
    it('should invoke handleMessage() method', async () => {
      const webSocket = new WebSocket(null);
      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;
      const { fakeLogger } = createExpectingLogger(0);
      const subscriber = new Subscriber(webSocket, fakeMessage, fakeLogger);

      const actualInvocationData: Buffer[] = [];
      subscriber.handleMessage = (data: Buffer) => {
        actualInvocationData.push(data);
      };

      const bufferPayload = Buffer.from('EXAMPLE_BUFFER', 'utf-8');
      webSocket.emit('message', bufferPayload);

      // One spin of the event loop to allow handleMessage() to be invoked.
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(actualInvocationData).toEqual([bufferPayload]);
    });
  });

  describe('handleMessage', () => {
    it('should throw when payload is not a Buffer', () => {
      const webSocket = new WebSocket(null);
      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;
      const { fakeLogger } = createExpectingLogger(0);
      const subscriber = new Subscriber(webSocket, fakeMessage, fakeLogger);

      expect(() => {
        subscriber.handleMessage(undefined as unknown as Buffer);
      }).toThrow('unexpected message data type');

      expect(() => {
        subscriber.handleMessage([0, 1, 2] as unknown as Buffer);
      }).toThrow('unexpected message data type');

      expect(() => {
        subscriber.handleMessage([
          Buffer.from('NESTED_BUFFER', 'utf-8'),
        ] as unknown as Buffer);
      }).toThrow('unexpected message data type');
    });

    it('should log an error when not a Nostr message', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentData: string[] = [];
      webSocket.send = (sentData: string) => {
        webSocketSentData.push(sentData);
      };

      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;

      const expectedLogs: LogEntry[] = [
        { level: 'http', message: 'OPEN (%s) %s' },
        { level: 'verbose', message: 'bad msg: unrecognized event type' },
      ];
      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const subscriber = new Subscriber(webSocket, fakeMessage, fakeLogger);

      subscriber.handleMessage(
        Buffer.from(JSON.stringify(['BAD_MESSAGE_TYPE']), 'utf-8')
      );

      expect(webSocketSentData).toEqual([
        JSON.stringify(['NOTICE', 'ERROR: bad msg: unrecognized event type']),
      ]);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });

    it('should log a message when a Nostr message is received', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentData: string[] = [];
      webSocket.send = (sentData: string) => {
        webSocketSentData.push(sentData);
      };

      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;

      const expectedLogs: LogEntry[] = [
        { level: 'http', message: 'OPEN (%s) %s' },
        { level: 'silly', message: 'MESSAGE (CLOSE)' },
      ];
      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const subscriber = new Subscriber(webSocket, fakeMessage, fakeLogger);

      subscriber.handleMessage(
        Buffer.from(JSON.stringify(['CLOSE', '1']), 'utf-8')
      );

      // WebSocket should not have received any sent data.
      expect(webSocketSentData).toEqual([]);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });
  });
});
