/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the Subscriber class.
 */

import { bufferToRelayMessage } from './buffer-to-message';
import { createExpectingLogger } from './create-expecting-logger';
import {
  ClientMessage,
  ClientCloseMessage,
  ClientEventMessage,
  RelayMessage,
  ClientReqMessage,
} from './message-types';
import { MemorelayCoordinator } from './memorelay-coordinator';
import { messageToBuffer } from './message-to-buffer';
import { signEvent } from './sign-event';
import { Subscriber } from './subscriber';

import {
  Kind,
  Event as NostrEvent,
  generatePrivateKey,
  getPublicKey,
} from 'nostr-tools';
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

      const memorelay = new MemorelayCoordinator();
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

      const memorelay = new MemorelayCoordinator();
      new Subscriber(webSocket, fakeMessage, fakeLogger, memorelay);

      webSocket.emit('close');

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });

    it('should unsubscribe from all subscriptions', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentData: Buffer[] = [];
      webSocket.send = (sentData: Buffer) => {
        webSocketSentData.push(sentData);
      };

      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;
      const { fakeLogger } = createExpectingLogger();

      const memorelay = new MemorelayCoordinator();

      const unsubscribedNumbers: number[] = [];
      memorelay.subscribe = () => {
        return 123;
      };
      memorelay.unsubscribe = (subscriptionNumber: number) => {
        unsubscribedNumbers.push(subscriptionNumber);
        return subscriptionNumber === 123;
      };

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleReqMessage(['REQ', 'SUBSCRIBER_ID']);

      expect(webSocketSentData).toEqual([
        messageToBuffer(['EOSE', 'SUBSCRIBER_ID']),
      ]);

      webSocket.emit('close');

      await Promise.resolve();

      expect(unsubscribedNumbers).toEqual([123]);
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

      const memorelay = new MemorelayCoordinator();
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
      const memorelay = new MemorelayCoordinator();
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
      const memorelay = new MemorelayCoordinator();
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

      const webSocketSentData: Buffer[] = [];
      webSocket.send = (sentData: Buffer) => {
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

      const memorelay = new MemorelayCoordinator();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleMessage(
        messageToBuffer(['BAD_MESSAGE_TYPE'] as unknown as ClientMessage)
      );

      expect(webSocketSentData).toEqual([
        JSON.stringify(['NOTICE', 'ERROR: bad msg: unrecognized event type']),
      ]);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });

    it('should log a message when a Nostr message is received', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentMessages: RelayMessage[] = [];
      webSocket.send = (sentData: Buffer) => {
        webSocketSentMessages.push(bufferToRelayMessage(sentData));
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

      const memorelay = new MemorelayCoordinator();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleMessage(
        messageToBuffer(['EVENT', EXAMPLE_SIGNED_EVENT])
      );

      // WebSocket should not have received any sent data.
      expect(webSocketSentMessages).toEqual([
        ['OK', EXAMPLE_SIGNED_EVENT.id, true, ''],
      ]);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });

    it('should call handleEventMessage() for EVENT messages', () => {
      const webSocket = new WebSocket(null);
      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;
      const { fakeLogger } = createExpectingLogger();
      const memorelay = new MemorelayCoordinator();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      const handleEventMessageParams: ClientEventMessage[] = [];
      subscriber.handleEventMessage = (eventMessage: ClientEventMessage) => {
        handleEventMessageParams.push(eventMessage);
      };

      subscriber.handleMessage(
        messageToBuffer(['EVENT', EXAMPLE_SIGNED_EVENT])
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
      const memorelay = new MemorelayCoordinator();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      const handleReqMessageParams: ClientReqMessage[] = [];
      subscriber.handleReqMessage = (reqMessage: ClientReqMessage) => {
        handleReqMessageParams.push(reqMessage);
      };

      subscriber.handleMessage(messageToBuffer(['REQ', 'SUBSCRIPTION_ID']));

      expect(handleReqMessageParams).toEqual([['REQ', 'SUBSCRIPTION_ID']]);
    });

    it('should call handleCloseMessage() for CLOSE messages', () => {
      const webSocket = new WebSocket(null);
      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;
      const { fakeLogger } = createExpectingLogger();
      const memorelay = new MemorelayCoordinator();
      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      const handleCloseMessageParams: ClientCloseMessage[] = [];
      subscriber.handleCloseMessage = (closeMessage: ClientCloseMessage) => {
        handleCloseMessageParams.push(closeMessage);
      };

      subscriber.handleMessage(messageToBuffer(['CLOSE', 'SUBSCRIPTION_ID']));

      expect(handleCloseMessageParams).toEqual([['CLOSE', 'SUBSCRIPTION_ID']]);
    });
  });

  describe('handleEventMessage', () => {
    it('should log and notify duplicate events', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentData: Buffer[] = [];
      webSocket.send = (sentData: Buffer) => {
        webSocketSentData.push(sentData);
      };

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

      const memorelay = new MemorelayCoordinator();
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

      // WebSocket should not have received any sent data.
      expect(webSocketSentData).toEqual([
        messageToBuffer(['OK', EXAMPLE_SIGNED_EVENT.id, true, 'duplicate:']),
      ]);
    });

    it('should log and forward previously unseen events', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentMessages: RelayMessage[] = [];
      webSocket.send = (sentData: Buffer) => {
        webSocketSentMessages.push(bufferToRelayMessage(sentData));
      };

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

      const memorelay = new MemorelayCoordinator();

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleEventMessage(['EVENT', EXAMPLE_SIGNED_EVENT]);

      expect(memorelay.hasEvent(EXAMPLE_SIGNED_EVENT.id)).toBe(true);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);

      // WebSocket should not have received any sent data.
      expect(webSocketSentMessages).toEqual([
        ['OK', EXAMPLE_SIGNED_EVENT.id, true, ''],
      ]);
    });

    it('should reject and notify deleted events', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentMessages: RelayMessage[] = [];
      webSocket.send = (sentData: Buffer) => {
        webSocketSentMessages.push(bufferToRelayMessage(sentData));
      };

      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;

      const expectedLogs: LogEntry[] = [
        { level: 'http', message: 'OPEN (%s) %s' },
        { level: 'debug', message: 'EVENT %s (deleted)' },
      ];

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const secretKey = generatePrivateKey();
      const pubkey = getPublicKey(secretKey);

      const startTime = Math.floor(Date.now() / 1000);

      const targetEvent = signEvent(
        {
          kind: Kind.Text,
          created_at: startTime + 10,
          tags: [],
          content: 'TARGET TEXT EVENT',
          pubkey,
        },
        secretKey
      );

      const deleteEvent = signEvent(
        {
          kind: Kind.EventDeletion,
          created_at: startTime + 20,
          tags: [['e', targetEvent.id]],
          content: 'DELETE TARGET EVENT',
          pubkey,
        },
        secretKey
      );

      const memorelay = new MemorelayCoordinator();
      memorelay.addEvent(deleteEvent);

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleEventMessage(['EVENT', targetEvent]);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);

      // WebSocket should not have received any sent data.
      expect(webSocketSentMessages).toEqual([
        ['OK', targetEvent.id, false, 'deleted:'],
      ]);
    });
  });

  describe('handleReqMessage', () => {
    it('should set up a subscription to receive later events', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentData: Buffer[] = [];
      webSocket.send = (sentData: Buffer) => {
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

      const memorelay = new MemorelayCoordinator();

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleReqMessage(['REQ', 'SUBSCRIPTION_ID']);

      expect(webSocketSentData.length).toBe(1);
      expect(webSocketSentData[0]).toEqual(
        messageToBuffer(['EOSE', 'SUBSCRIPTION_ID'])
      );

      memorelay.addEvent(EXAMPLE_SIGNED_EVENT);

      // Callbacks are invoked with queueMicrotask(), so awaiting a promise
      // gives that time to finish.
      await Promise.resolve();

      expect(webSocketSentData.length).toBe(2);
      expect(webSocketSentData[1]).toEqual(
        messageToBuffer(['EVENT', 'SUBSCRIPTION_ID', EXAMPLE_SIGNED_EVENT])
      );

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });

    it('should set up a subscription and receive past events', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentData: Buffer[] = [];
      webSocket.send = (sentData: Buffer) => {
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

      const memorelay = new MemorelayCoordinator();
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
        messageToBuffer(['EVENT', 'SUBSCRIPTION_ID', EXAMPLE_SIGNED_EVENT])
      );
      expect(webSocketSentData[1]).toEqual(
        messageToBuffer(['EOSE', 'SUBSCRIPTION_ID'])
      );

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });
  });

  describe('handleCloseMessage', () => {
    it('should notify if the subscription does not exist', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentData: Buffer[] = [];
      webSocket.send = (sentData: Buffer) => {
        webSocketSentData.push(sentData);
      };

      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;

      const { fakeLogger } = createExpectingLogger();

      const memorelay = new MemorelayCoordinator();

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleCloseMessage(['CLOSE', 'SUBSCRIPTION_ID']);

      await Promise.resolve();

      expect(webSocketSentData).toEqual([
        messageToBuffer([
          'NOTICE',
          "ERROR: subscription not found: 'SUBSCRIPTION_ID'",
        ]),
      ]);
    });

    it('should close existing subscription', async () => {
      const webSocket = new WebSocket(null);

      const webSocketSentData: Buffer[] = [];
      webSocket.send = (sentData: Buffer) => {
        webSocketSentData.push(sentData);
      };

      const fakeMessage = {
        headers: { 'sec-websocket-key': 'FAKE_WEBSOCKET_KEY' },
      } as unknown as IncomingMessage;

      const expectedLogs: LogEntry[] = [
        { level: 'http', message: 'OPEN (%s) %s' },
        { level: 'verbose', message: 'REQ %s' },
        { level: 'verbose', message: 'CLOSE %s' },
      ];

      const { fakeLogger, actualLogsPromise } = createExpectingLogger(
        expectedLogs.length
      );

      const memorelay = new MemorelayCoordinator();
      memorelay.subscribe = () => {
        return 123;
      };
      const unsubscribedNumbers: number[] = [];
      memorelay.unsubscribe = (subscriptionNumber: number) => {
        unsubscribedNumbers.push(subscriptionNumber);
        return subscriptionNumber === 123;
      };

      const subscriber = new Subscriber(
        webSocket,
        fakeMessage,
        fakeLogger,
        memorelay
      );

      subscriber.handleReqMessage(['REQ', 'SUBSCRIPTION_ID']);

      expect(webSocketSentData.length).toBe(1);
      expect(webSocketSentData[0]).toEqual(
        messageToBuffer(['EOSE', 'SUBSCRIPTION_ID'])
      );

      subscriber.handleCloseMessage(['CLOSE', 'SUBSCRIPTION_ID']);

      expect(unsubscribedNumbers).toEqual([123]);

      const actualLogs = await actualLogsPromise;

      expect(actualLogs).toEqual(expectedLogs);
    });
  });
});
