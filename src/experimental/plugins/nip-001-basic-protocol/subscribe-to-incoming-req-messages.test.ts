/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for subscribeToReqMessages().
 */

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
import { RelayEventMessage } from '../../../lib/message-types';
import { MemorelayClientDisconnectEvent } from '../../events/memorelay-client-disconnect-event';

describe('subscribeToReqMessages()', () => {
  describe('#IncomingReqMessageEvent', () => {
    it('should begin a subscription', async () => {
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
        new IncomingReqMessageEvent({ reqMessage: ['REQ', 'SUBSCRIPTION_ID'] })
      );

      const testEvent = createSignedTestEvent({ content: 'TEST EVENT' });
      hub.emitEvent(
        new BroadcastEventMessageEvent({
          eventMessage: ['EVENT', testEvent],
          memorelayClient: sendingClient,
        })
      );

      await Promise.resolve();

      expect(mockOutgoingListenerFn).toHaveBeenCalledTimes(1);
      const outgoingEventMessageEvent = mockOutgoingListenerFn.mock.calls[0][0];
      expect(outgoingEventMessageEvent.details.genericMessage).toEqual([
        'EVENT',
        'SUBSCRIPTION_ID',
        testEvent,
      ]);
    });

    it('should not begin a subscription when defaultPrevented', async () => {
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

      const incomingReqMessageEvent = new IncomingReqMessageEvent({
        reqMessage: ['REQ', 'SUBSCRIPTION_ID'],
      });
      incomingReqMessageEvent.preventDefault();
      subscribingClient.emitEvent(incomingReqMessageEvent);

      const testEvent = createSignedTestEvent({ content: 'TEST EVENT' });
      hub.emitEvent(
        new BroadcastEventMessageEvent({
          eventMessage: ['EVENT', testEvent],
          memorelayClient: sendingClient,
        })
      );

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
        [OutgoingGenericMessageEvent]
      >();
      subscribingClient.onEvent(
        OutgoingGenericMessageEvent,
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
          eventMessage: ['EVENT', testEvent],
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
        [OutgoingGenericMessageEvent]
      >();
      subscribingClient.onEvent(
        OutgoingGenericMessageEvent,
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
          eventMessage: ['EVENT', testEvent],
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

      [
        createSignedTestEvent({ kind: 1000, content: 'NO MATCH' }),
        createSignedTestEvent({ kind: 1001, content: 'MATCHES' }),
        createSignedTestEvent({ kind: 1002, content: 'NO MATCH' }),
      ].forEach((testEvent) => {
        hub.emitEvent(
          new BroadcastEventMessageEvent({
            eventMessage: ['EVENT', testEvent],
            memorelayClient: sendingClient,
          })
        );
      });

      await Promise.resolve();

      expect(mockOutgoingListenerFn).toHaveBeenCalledTimes(1);
      const outgoingEventMessageEvent = mockOutgoingListenerFn.mock.calls[0][0];
      const [, outgoingSubscriptionId, outgoingEvent] =
        outgoingEventMessageEvent.details.genericMessage as RelayEventMessage;
      expect(outgoingSubscriptionId).toBe('FILTERED_SUBSCRIPTION_ID');
      expect(outgoingEvent.content).toBe('MATCHES');
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
            eventMessage: ['EVENT', testEvent],
            memorelayClient: sendingClient,
          })
        );
      });

      await Promise.resolve();

      expect(mockOutgoingListenerFn).not.toHaveBeenCalled();
    });
  });
});
