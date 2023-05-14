/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the Subscriber class.
 */

import { createExpectingLogger } from './create-expecting-logger';
import { CloseMessage, EventMessage, ReqMessage } from './message-types';
import { Memorelay } from './memorelay';
import { Subscriber } from './subscriber';

import { Event as NostrEvent } from 'nostr-tools';
import { IncomingMessage } from 'http';
import { LogEntry } from 'winston';
import { WebSocket } from 'ws';

const EXAMPLE_SIGNED_EVENT: NostrEvent = Object.freeze({
  content: 'BRB, turning on the miners',
  created_at: 1683474317,
  id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
  kind: 1,
  pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
  sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
  tags: [],
});

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

      const memorelay = new Memorelay();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

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

      const memorelay = new Memorelay();
      new Subscriber(webSocket, fakeMessage, fakeLogger, memorelay);

      webSocket.emit('close');

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });

    it('should unsubscribe from all subscriptions', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentData: string[] = [];
      webSocket.send = (sentData: string) => {
        webSocketSentData.push(sentData);
      };

      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;
      const { fakeLogger } = createExpectingLogger();

      const memorelay = new Memorelay();

      const unsubscribedNumbers: number[] = [];
      memorelay.unsubscribe = (subscriptionNumber: number) => {
        unsubscribedNumbers.push(subscriptionNumber);
        return true;
      };

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleReqMessage(['REQ', 'SUBSCRIBER_ID']);

      expect(webSocketSentData).toEqual([
        Buffer.from(JSON.stringify(['EOSE', 'SUBSCRIBER_ID']), 'utf-8'),
      ]);

      webSocket.emit('close');

      await Promise.resolve();

      expect(unsubscribedNumbers).toEqual([0]);
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

      const memorelay = new Memorelay();
      new Subscriber(webSocket, fakeMessage, fakeLogger, memorelay);

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
      const { fakeLogger } = createExpectingLogger();
      const memorelay = new Memorelay();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

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
      const { fakeLogger } = createExpectingLogger();
      const memorelay = new Memorelay();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

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

      const memorelay = new Memorelay();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

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
        { level: 'silly', message: 'MESSAGE (EVENT)' },
        { level: 'verbose', message: 'EVENT %s' },
      ];
      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const memorelay = new Memorelay();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleMessage(
        Buffer.from(JSON.stringify(['EVENT', EXAMPLE_SIGNED_EVENT]), 'utf-8')
      );

      // WebSocket should not have received any sent data.
      expect(webSocketSentData).toEqual([]);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });

    it('should call handleEventMessage() for EVENT messages', () => {
      const webSocket = new WebSocket(null);
      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;
      const { fakeLogger } = createExpectingLogger();
      const memorelay = new Memorelay();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      const handleEventMessageParams: EventMessage[] = [];
      subscriber.handleEventMessage = (eventMessage: EventMessage) => {
        handleEventMessageParams.push(eventMessage);
      };

      subscriber.handleMessage(
        Buffer.from(JSON.stringify(['EVENT', EXAMPLE_SIGNED_EVENT]), 'utf-8')
      );

      expect(handleEventMessageParams).toEqual([
        ['EVENT', EXAMPLE_SIGNED_EVENT],
      ]);
    });

    it('should call handleReqMessage() for REQ messages', () => {
      const webSocket = new WebSocket(null);
      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;
      const { fakeLogger } = createExpectingLogger();
      const memorelay = new Memorelay();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      const handleReqMessageParams: ReqMessage[] = [];
      subscriber.handleReqMessage = (reqMessage: ReqMessage) => {
        handleReqMessageParams.push(reqMessage);
      };

      subscriber.handleMessage(
        Buffer.from(JSON.stringify(['REQ', 'SUBSCRIPTION_ID']), 'utf-8')
      );

      expect(handleReqMessageParams).toEqual([['REQ', 'SUBSCRIPTION_ID']]);
    });

    it('should call handleCloseMessage() for CLOSE messages', () => {
      const webSocket = new WebSocket(null);
      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;
      const { fakeLogger } = createExpectingLogger();
      const memorelay = new Memorelay();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      const handleCloseMessageParams: CloseMessage[] = [];
      subscriber.handleCloseMessage = (closeMessage: CloseMessage) => {
        handleCloseMessageParams.push(closeMessage);
      };

      subscriber.handleMessage(
        Buffer.from(JSON.stringify(['CLOSE', 'SUBSCRIPTION_ID']), 'utf-8')
      );

      expect(handleCloseMessageParams).toEqual([['CLOSE', 'SUBSCRIPTION_ID']]);
    });
  });

  describe('handleEventMessage', () => {
    it('should log and not forward duplicate events', async () => {
      const webSocket = new WebSocket(null);

      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;

      const expectedLogs: LogEntry[] = [
        { level: 'http', message: 'OPEN (%s) %s' },
        { level: 'debug', message: 'EVENT %s (duplicate)' },
      ];

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const memorelay = new Memorelay();
      memorelay.addEvent(EXAMPLE_SIGNED_EVENT);

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleEventMessage(['EVENT', EXAMPLE_SIGNED_EVENT]);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });

    it('should log and forward previously unseen events', async () => {
      const webSocket = new WebSocket(null);

      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;

      const expectedLogs: LogEntry[] = [
        { level: 'http', message: 'OPEN (%s) %s' },
        { level: 'verbose', message: 'EVENT %s' },
      ];

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const memorelay = new Memorelay();

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleEventMessage(['EVENT', EXAMPLE_SIGNED_EVENT]);

      expect(memorelay.hasEvent(EXAMPLE_SIGNED_EVENT)).toBe(true);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });
  });

  describe('handleReqMessage', () => {
    it('should set up a subscription to receive later events', async () => {
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
        { level: 'verbose', message: 'REQ %s' },
      ];

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const memorelay = new Memorelay();

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleReqMessage(['REQ', 'SUBSCRIPTION_ID']);

      expect(webSocketSentData.length).toBe(1);
      expect(webSocketSentData[0]).toEqual(
        Buffer.from(JSON.stringify(['EOSE', 'SUBSCRIPTION_ID']), 'utf-8')
      );

      memorelay.addEvent(EXAMPLE_SIGNED_EVENT);

      // Callbacks are invoked with queueMicrotask(), so awaiting a promise
      // gives that time to finish.
      await Promise.resolve();

      expect(webSocketSentData.length).toBe(2);
      expect(webSocketSentData[1]).toEqual(
        Buffer.from(JSON.stringify(['EVENT', EXAMPLE_SIGNED_EVENT]), 'utf-8')
      );

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });

    it('should set up a subscription and receive past events', async () => {
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
        { level: 'verbose', message: 'REQ %s' },
      ];

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const memorelay = new Memorelay();
      memorelay.addEvent(EXAMPLE_SIGNED_EVENT);

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleReqMessage(['REQ', 'SUBSCRIPTION_ID']);

      await Promise.resolve();

      expect(webSocketSentData.length).toBe(2);
      expect(webSocketSentData[0]).toEqual(
        Buffer.from(JSON.stringify(['EVENT', EXAMPLE_SIGNED_EVENT]), 'utf-8')
      );
      expect(webSocketSentData[1]).toEqual(
        Buffer.from(JSON.stringify(['EOSE', 'SUBSCRIPTION_ID']), 'utf-8')
      );

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });
  });
});
