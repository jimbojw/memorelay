/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for subscribeToReqMessages().
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { subscribeToIncomingReqMessages } from './subscribe-to-incoming-req-messages';
import {
  setupTestClient,
  setupTestHub,
} from '../../test/setup-hub-and-memorelay-client';
import { OutgoingGenericMessageEvent } from '../../events/outgoing-generic-message-event';
import { IncomingReqMessageEvent } from '../../events/incoming-req-message-event';
import { createSignedTestEvent } from '../../test/signed-test-event';
import { BroadcastEventMessageEvent } from '../../events/broadcast-event-message-event';
import { IncomingCloseMessageEvent } from '../../events/incoming-close-message-event';
import { SubscriptionNotFoundError } from '../../errors/subscription-not-found-error';
import { MemorelayClientDisconnectEvent } from '../../events/memorelay-client-disconnect-event';
import { OutgoingEventMessageEvent } from '../../events/outgoing-event-message-event';
import { MemorelayClient } from '../../core/memorelay-client';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';

describe('subscribeToReqMessages()', () => {
  describe('#MemorelayClientCreatedEvent', () => {
    it('should increase the maxEventListeners of hub', () => {
      const hub = setupTestHub(subscribeToIncomingReqMessages);

      const initialMaxEventListeners = hub.maxEventListeners;

      hub.emitEvent(
        new MemorelayClientCreatedEvent({
          memorelayClient: new MemorelayClient(
            {} as WebSocket,
            {} as IncomingMessage
          ),
        })
      );

      expect(hub.maxEventListeners).toBeGreaterThan(initialMaxEventListeners);
    });
  });

  describe('#IncomingReqMessageEvent', () => {
    it('should begin a subscription', async () => {
      const hub = setupTestHub(subscribeToIncomingReqMessages);
      const subscribingClient = setupTestClient(hub);
      const sendingClient = setupTestClient(hub);

      const mockOutgoingListenerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      subscribingClient.onEvent(
        OutgoingEventMessageEvent,
        mockOutgoingListenerFn
      );

      subscribingClient.emitEvent(
        new IncomingReqMessageEvent({ reqMessage: ['REQ', 'SUBSCRIPTION_ID'] })
      );

      const testEvent = createSignedTestEvent({ content: 'TEST EVENT' });
      const broadcastEventMessageEvent = new BroadcastEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
        memorelayClient: sendingClient,
      });
      hub.emitEvent(broadcastEventMessageEvent);

      await Promise.resolve();

      expect(mockOutgoingListenerFn).toHaveBeenCalledTimes(1);
      const outgoingEventMessageEvent = mockOutgoingListenerFn.mock.calls[0][0];
      expect(outgoingEventMessageEvent.details.relayEventMessage).toEqual([
        'EVENT',
        'SUBSCRIPTION_ID',
        testEvent,
      ]);
      expect(outgoingEventMessageEvent.parentEvent).toBe(
        broadcastEventMessageEvent
      );
      expect(outgoingEventMessageEvent.targetEmitter).toBe(subscribingClient);
    });

    it('should not begin a subscription when defaultPrevented', async () => {
      const hub = setupTestHub(subscribeToIncomingReqMessages);
      const subscribingClient = setupTestClient(hub);
      const sendingClient = setupTestClient(hub);

      const mockOutgoingListenerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      subscribingClient.onEvent(
        OutgoingEventMessageEvent,
        mockOutgoingListenerFn
      );

      const incomingReqMessageEvent = new IncomingReqMessageEvent({
        reqMessage: ['REQ', 'SUBSCRIPTION_ID'],
      });
      incomingReqMessageEvent.preventDefault();
      subscribingClient.emitEvent(incomingReqMessageEvent);

      const testEvent = createSignedTestEvent({ content: 'TEST EVENT' });
      const broadcastEventMessageEvent = new BroadcastEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
        memorelayClient: sendingClient,
      });
      hub.emitEvent(broadcastEventMessageEvent);

      await Promise.resolve();

      expect(mockOutgoingListenerFn).not.toHaveBeenCalled();
    });
  });

  describe('#IncomingCloseMessageEvent', () => {
    it('should close a subscription', async () => {
      const hub = setupTestHub(subscribeToIncomingReqMessages);
      const subscribingClient = setupTestClient(hub);
      const sendingClient = setupTestClient(hub);

      const mockOutgoingListenerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      subscribingClient.onEvent(
        OutgoingEventMessageEvent,
        mockOutgoingListenerFn
      );

      subscribingClient.emitEvent(
        new IncomingReqMessageEvent({ reqMessage: ['REQ', 'SUBSCRIPTION_ID'] })
      );

      subscribingClient.emitEvent(
        new IncomingCloseMessageEvent({
          closeMessage: ['CLOSE', 'SUBSCRIPTION_ID'],
        })
      );

      const testEvent = createSignedTestEvent({ content: 'TEST EVENT' });
      hub.emitEvent(
        new BroadcastEventMessageEvent({
          clientEventMessage: ['EVENT', testEvent],
          memorelayClient: sendingClient,
        })
      );

      await Promise.resolve();

      expect(mockOutgoingListenerFn).not.toHaveBeenCalled();
    });

    it('should not close a subscription when defaultPrevented', async () => {
      const hub = setupTestHub(subscribeToIncomingReqMessages);
      const subscribingClient = setupTestClient(hub);
      const sendingClient = setupTestClient(hub);

      const mockOutgoingListenerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      subscribingClient.onEvent(
        OutgoingEventMessageEvent,
        mockOutgoingListenerFn
      );

      subscribingClient.emitEvent(
        new IncomingReqMessageEvent({ reqMessage: ['REQ', 'SUBSCRIPTION_ID'] })
      );

      const incomingCloseMessageEvent = new IncomingCloseMessageEvent({
        closeMessage: ['CLOSE', 'SUBSCRIPTION_ID'],
      });
      incomingCloseMessageEvent.preventDefault();
      subscribingClient.emitEvent(incomingCloseMessageEvent);

      const testEvent = createSignedTestEvent({ content: 'TEST EVENT' });
      hub.emitEvent(
        new BroadcastEventMessageEvent({
          clientEventMessage: ['EVENT', testEvent],
          memorelayClient: sendingClient,
        })
      );

      await Promise.resolve();

      expect(mockOutgoingListenerFn).toHaveBeenCalledTimes(1);
    });

    it('should trigger an error for unknown subscription id', () => {
      const hub = setupTestHub(subscribeToIncomingReqMessages);
      const subscribingClient = setupTestClient(hub);

      const mockErrorListenerFn = jest.fn<
        unknown,
        [SubscriptionNotFoundError]
      >();
      subscribingClient.onError(SubscriptionNotFoundError, mockErrorListenerFn);

      subscribingClient.emitEvent(
        new IncomingCloseMessageEvent({
          closeMessage: ['CLOSE', 'UNKNOWN_SUBSCRIPTION_ID'],
        })
      );

      expect(mockErrorListenerFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('#BroadcastEventMessageEvent', () => {
    it('should send only matching events', async () => {
      const hub = setupTestHub(subscribeToIncomingReqMessages);
      const subscribingClient = setupTestClient(hub);
      const sendingClient = setupTestClient(hub);

      const mockOutgoingListenerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      subscribingClient.onEvent(
        OutgoingEventMessageEvent,
        mockOutgoingListenerFn
      );

      subscribingClient.emitEvent(
        new IncomingReqMessageEvent({
          reqMessage: ['REQ', 'FILTERED_SUBSCRIPTION_ID', { kinds: [1001] }],
        })
      );

      [
        createSignedTestEvent({ kind: 1000, content: 'NO MATCH' }),
        createSignedTestEvent({ kind: 1001, content: 'MATCHES' }),
        createSignedTestEvent({ kind: 1002, content: 'NO MATCH' }),
      ].forEach((testEvent) => {
        hub.emitEvent(
          new BroadcastEventMessageEvent({
            clientEventMessage: ['EVENT', testEvent],
            memorelayClient: sendingClient,
          })
        );
      });

      await Promise.resolve();

      expect(mockOutgoingListenerFn).toHaveBeenCalledTimes(1);
      const outgoingEventMessageEvent = mockOutgoingListenerFn.mock.calls[0][0];
      const [, outgoingSubscriptionId, outgoingEvent] =
        outgoingEventMessageEvent.details.relayEventMessage;
      expect(outgoingSubscriptionId).toBe('FILTERED_SUBSCRIPTION_ID');
      expect(outgoingEvent.content).toBe('MATCHES');
    });

    it('should send to large numbers of clients', async () => {
      // TODO(jimbo): Assert that process.emitWarning() was not called.
      const hub = setupTestHub(subscribeToIncomingReqMessages);
      const sendingClient = setupTestClient(hub);
      const subscribingClients = new Array(1000)
        .fill(0)
        .map(() => setupTestClient(hub));

      const mockOutgoingListenerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      subscribingClients.forEach((subscribingClient, index) => {
        subscribingClient.onEvent(
          OutgoingEventMessageEvent,
          mockOutgoingListenerFn
        );
        subscribingClient.emitEvent(
          new IncomingReqMessageEvent({
            reqMessage: ['REQ', `SUB INDEX: ${index}`],
          })
        );
      });

      const blastEvent = createSignedTestEvent({ content: 'BLAST EVENT' });
      hub.emitEvent(
        new BroadcastEventMessageEvent({
          clientEventMessage: ['EVENT', blastEvent],
          memorelayClient: sendingClient,
        })
      );

      await Promise.resolve();

      expect(mockOutgoingListenerFn).toHaveBeenCalledTimes(
        subscribingClients.length
      );

      mockOutgoingListenerFn.mock.calls.forEach(
        ([outgoingEventMessageEvent], index) => {
          const [, subscriptionId, relayEvent] =
            outgoingEventMessageEvent.details.relayEventMessage;
          expect(subscriptionId).toBe(`SUB INDEX: ${index}`);
          expect(relayEvent).toEqual(blastEvent);
        }
      );
    });
  });

  describe('#MemorelayClientDisconnectEvent', () => {
    it('should trigger disconnect', async () => {
      const hub = setupTestHub(subscribeToIncomingReqMessages);
      const subscribingClient = setupTestClient(hub);
      const sendingClient = setupTestClient(hub);

      const mockOutgoingListenerFn = jest.fn<
        unknown,
        [OutgoingGenericMessageEvent]
      >();
      subscribingClient.onEvent(
        OutgoingGenericMessageEvent,
        mockOutgoingListenerFn
      );

      subscribingClient.emitEvent(
        new IncomingReqMessageEvent({
          reqMessage: ['REQ', 'FILTERED_SUBSCRIPTION_ID', { kinds: [1001] }],
        })
      );

      subscribingClient.emitEvent(
        new MemorelayClientDisconnectEvent({
          memorelayClient: subscribingClient,
        })
      );

      [
        createSignedTestEvent({ kind: 1000, content: 'NO MATCH' }),
        createSignedTestEvent({ kind: 1001, content: 'MATCHES' }),
        createSignedTestEvent({ kind: 1002, content: 'NO MATCH' }),
      ].forEach((testEvent) => {
        hub.emitEvent(
          new BroadcastEventMessageEvent({
            clientEventMessage: ['EVENT', testEvent],
            memorelayClient: sendingClient,
          })
        );
      });

      await Promise.resolve();

      expect(mockOutgoingListenerFn).not.toHaveBeenCalled();
    });

    it('should restore maxEventListeners of hub', () => {
      const hub = setupTestHub(subscribeToIncomingReqMessages);

      const initialMaxEventListeners = hub.maxEventListeners;

      const memorelayClient = new MemorelayClient(
        {} as WebSocket,
        {} as IncomingMessage
      );

      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      memorelayClient.emitEvent(
        new MemorelayClientDisconnectEvent({ memorelayClient })
      );

      expect(hub.maxEventListeners).toBe(initialMaxEventListeners);
    });
  });
});
