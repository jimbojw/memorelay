/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendStoredEventsToSubscribers().
 */

import { MemorelayClient } from '../../../core/lib/memorelay-client';
import {
  setupTestClient,
  setupTestHub,
} from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { BroadcastEventMessageEvent } from '../events/broadcast-event-message-event';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { OutgoingEOSEMessageEvent } from '../events/outgoing-eose-message-event';
import { OutgoingEventMessageEvent } from '../events/outgoing-event-message-event';
import { sendStoredEventsToSubscribers } from './send-stored-events-to-subscribers';

describe('sendStoredEventsToSubscribers()', () => {
  it('should send stored events to subscribers', async () => {
    const hub = setupTestHub(sendStoredEventsToSubscribers);

    const mockSenderClient = {} as MemorelayClient;
    const testEvent = createSignedTestEvent({ content: 'STORE ME' });

    hub.emitEvent(
      new BroadcastEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
        memorelayClient: mockSenderClient,
      })
    );

    const receiverClient = setupTestClient(hub);

    const mockOutgoingEventHandlerFn = jest.fn<
      unknown,
      [OutgoingEventMessageEvent]
    >();
    receiverClient.onEvent(
      OutgoingEventMessageEvent,
      mockOutgoingEventHandlerFn
    );

    const mockOutgoingEOSEHandlerFn = jest.fn<
      unknown,
      [OutgoingEOSEMessageEvent]
    >();
    receiverClient.onEvent(OutgoingEOSEMessageEvent, mockOutgoingEOSEHandlerFn);

    receiverClient.emitEvent(
      new IncomingReqMessageEvent({ reqMessage: ['REQ', 'SUBSCRIPTION_ID'] })
    );

    await Promise.resolve();

    expect(mockOutgoingEventHandlerFn).toHaveBeenCalledTimes(1);

    const outgoingEventMessageEvent =
      mockOutgoingEventHandlerFn.mock.calls[0][0];
    expect(outgoingEventMessageEvent.details.relayEventMessage).toEqual([
      'EVENT',
      'SUBSCRIPTION_ID',
      testEvent,
    ]);

    await Promise.resolve();

    expect(mockOutgoingEOSEHandlerFn).toHaveBeenCalledTimes(1);

    const outgoingEOSEMessageEvent = mockOutgoingEOSEHandlerFn.mock.calls[0][0];
    expect(outgoingEOSEMessageEvent.details.relayEOSEMessage).toEqual([
      'EOSE',
      'SUBSCRIPTION_ID',
    ]);
  });

  describe('#BroadcastEventMessageEvent', () => {
    it('should not store when defaultPrevented', async () => {
      const hub = setupTestHub(sendStoredEventsToSubscribers);

      const mockSenderClient = {} as MemorelayClient;
      const testEvent = createSignedTestEvent({ content: 'STORE ME' });

      const broadcastEventMessageEvent = new BroadcastEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
        memorelayClient: mockSenderClient,
      });
      broadcastEventMessageEvent.preventDefault();
      hub.emitEvent(broadcastEventMessageEvent);

      const receiverClient = setupTestClient(hub);

      const mockOutgoingEventHandlerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      receiverClient.onEvent(
        OutgoingEventMessageEvent,
        mockOutgoingEventHandlerFn
      );

      const mockOutgoingEOSEHandlerFn = jest.fn<
        unknown,
        [OutgoingEOSEMessageEvent]
      >();
      receiverClient.onEvent(
        OutgoingEOSEMessageEvent,
        mockOutgoingEOSEHandlerFn
      );

      receiverClient.emitEvent(
        new IncomingReqMessageEvent({ reqMessage: ['REQ', 'SUBSCRIPTION_ID'] })
      );

      await Promise.resolve();

      expect(mockOutgoingEventHandlerFn).not.toHaveBeenCalled();
      expect(mockOutgoingEOSEHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingEOSEMessageEvent =
        mockOutgoingEOSEHandlerFn.mock.calls[0][0];
      expect(outgoingEOSEMessageEvent.details.relayEOSEMessage).toEqual([
        'EOSE',
        'SUBSCRIPTION_ID',
      ]);
    });

    it('should ignore duplicate events', async () => {
      const hub = setupTestHub(sendStoredEventsToSubscribers);

      const mockSenderClient = {} as MemorelayClient;
      const testEvent = createSignedTestEvent({ content: 'STORE ME' });

      hub.emitEvent(
        new BroadcastEventMessageEvent({
          clientEventMessage: ['EVENT', testEvent],
          memorelayClient: mockSenderClient,
        })
      );

      // DUPLICATE.
      hub.emitEvent(
        new BroadcastEventMessageEvent({
          clientEventMessage: ['EVENT', testEvent],
          memorelayClient: mockSenderClient,
        })
      );

      const receiverClient = setupTestClient(hub);

      const mockOutgoingEventHandlerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      receiverClient.onEvent(
        OutgoingEventMessageEvent,
        mockOutgoingEventHandlerFn
      );

      const mockOutgoingEOSEHandlerFn = jest.fn<
        unknown,
        [OutgoingEOSEMessageEvent]
      >();
      receiverClient.onEvent(
        OutgoingEOSEMessageEvent,
        mockOutgoingEOSEHandlerFn
      );

      receiverClient.emitEvent(
        new IncomingReqMessageEvent({ reqMessage: ['REQ', 'SUBSCRIPTION_ID'] })
      );

      await Promise.resolve();

      expect(mockOutgoingEventHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingEventMessageEvent =
        mockOutgoingEventHandlerFn.mock.calls[0][0];
      expect(outgoingEventMessageEvent.details.relayEventMessage).toEqual([
        'EVENT',
        'SUBSCRIPTION_ID',
        testEvent,
      ]);

      await Promise.resolve();

      expect(mockOutgoingEOSEHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingEOSEMessageEvent =
        mockOutgoingEOSEHandlerFn.mock.calls[0][0];
      expect(outgoingEOSEMessageEvent.details.relayEOSEMessage).toEqual([
        'EOSE',
        'SUBSCRIPTION_ID',
      ]);
    });
  });
  describe('#IncomingReqMessageEvent', () => {
    it('it should ignore REQ messages with defaultPrevented', async () => {
      const hub = setupTestHub(sendStoredEventsToSubscribers);

      const mockSenderClient = {} as MemorelayClient;
      const testEvent = createSignedTestEvent({ content: 'STORE ME' });

      hub.emitEvent(
        new BroadcastEventMessageEvent({
          clientEventMessage: ['EVENT', testEvent],
          memorelayClient: mockSenderClient,
        })
      );

      const receiverClient = setupTestClient(hub);

      const mockOutgoingEventHandlerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      receiverClient.onEvent(
        OutgoingEventMessageEvent,
        mockOutgoingEventHandlerFn
      );

      const mockOutgoingEOSEHandlerFn = jest.fn<
        unknown,
        [OutgoingEOSEMessageEvent]
      >();
      receiverClient.onEvent(
        OutgoingEOSEMessageEvent,
        mockOutgoingEOSEHandlerFn
      );

      const incomingReqMessageEvent = new IncomingReqMessageEvent({
        reqMessage: ['REQ', 'SUBSCRIPTION_ID'],
      });
      incomingReqMessageEvent.preventDefault();
      receiverClient.emitEvent(incomingReqMessageEvent);

      await Promise.resolve();

      expect(mockOutgoingEventHandlerFn).not.toHaveBeenCalled();
      expect(mockOutgoingEOSEHandlerFn).not.toHaveBeenCalled();
    });
  });
});
