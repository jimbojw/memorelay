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
import { DidAddEventToDatabaseEvent } from '../events/did-add-event-to-database-event';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { OutgoingEOSEMessageEvent } from '../events/outgoing-eose-message-event';
import { OutgoingEventMessageEvent } from '../events/outgoing-event-message-event';
import { WillAddEventToDatabaseEvent } from '../events/will-add-event-to-database-event';
import { sendStoredEventsToSubscribers } from './send-stored-events-to-subscribers';

describe('sendStoredEventsToSubscribers()', () => {
  describe('#BroadcastEventMessageEvent', () => {
    it('should emit a WillAddEventToDatabaseEvent', async () => {
      const hub = setupTestHub(sendStoredEventsToSubscribers);

      const mockHandlerFn = jest.fn<unknown, [WillAddEventToDatabaseEvent]>();
      hub.onEvent(WillAddEventToDatabaseEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const mockClient = {} as MemorelayClient;
      const broadcastEventMessageEvent = new BroadcastEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
        memorelayClient: mockClient,
      });
      hub.emitEvent(broadcastEventMessageEvent);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const willAddEventToDatabaseEvent = mockHandlerFn.mock.calls[0][0];
      expect(willAddEventToDatabaseEvent).toBeInstanceOf(
        WillAddEventToDatabaseEvent
      );
      expect(willAddEventToDatabaseEvent.parentEvent).toBe(
        broadcastEventMessageEvent
      );
    });

    it('should not emit when defaultPrevented', async () => {
      const hub = setupTestHub(sendStoredEventsToSubscribers);

      const mockHandlerFn = jest.fn<unknown, [WillAddEventToDatabaseEvent]>();
      hub.onEvent(WillAddEventToDatabaseEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const mockClient = {} as MemorelayClient;
      const broadcastEventMessageEvent = new BroadcastEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
        memorelayClient: mockClient,
      });
      broadcastEventMessageEvent.preventDefault();
      hub.emitEvent(broadcastEventMessageEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });

  describe('#WillAddEventToDatabaseEvent', () => {
    it('should add event to database', async () => {
      const hub = setupTestHub(sendStoredEventsToSubscribers);

      const mockHandlerFn = jest.fn<unknown, [DidAddEventToDatabaseEvent]>();
      hub.onEvent(DidAddEventToDatabaseEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const willAddEventToDatabaseEvent = new WillAddEventToDatabaseEvent({
        event: testEvent,
      });
      hub.emitEvent(willAddEventToDatabaseEvent);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const didAddEventToDatabaseEvent = mockHandlerFn.mock.calls[0][0];
      expect(didAddEventToDatabaseEvent).toBeInstanceOf(
        DidAddEventToDatabaseEvent
      );
      expect(didAddEventToDatabaseEvent.parentEvent).toBe(
        willAddEventToDatabaseEvent
      );
    });

    it('should not add when defaultPrevented', async () => {
      const hub = setupTestHub(sendStoredEventsToSubscribers);

      const mockHandlerFn = jest.fn<unknown, [DidAddEventToDatabaseEvent]>();
      hub.onEvent(DidAddEventToDatabaseEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const willAddEventToDatabaseEvent = new WillAddEventToDatabaseEvent({
        event: testEvent,
      });
      willAddEventToDatabaseEvent.preventDefault();
      hub.emitEvent(willAddEventToDatabaseEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });

  describe('MemorelayClient#IncomingReqMessageEvent', () => {
    it('should send stored events to subscribers', async () => {
      const hub = setupTestHub(sendStoredEventsToSubscribers);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const willAddEventToDatabaseEvent = new WillAddEventToDatabaseEvent({
        event: testEvent,
      });
      hub.emitEvent(willAddEventToDatabaseEvent);

      const testClient = setupTestClient(hub);

      const mockEventHandlerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      testClient.onEvent(OutgoingEventMessageEvent, mockEventHandlerFn);

      const mockEOSEHandlerFn = jest.fn<unknown, [OutgoingEOSEMessageEvent]>();
      testClient.onEvent(OutgoingEOSEMessageEvent, mockEOSEHandlerFn);

      const incomingReqMessageEvent = new IncomingReqMessageEvent({
        reqMessage: ['REQ', 'SUBSCRIPTION_ID'],
      });
      testClient.emitEvent(incomingReqMessageEvent);

      expect(mockEventHandlerFn).not.toHaveBeenCalled();
      expect(mockEOSEHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockEventHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingEventMessageEvent = mockEventHandlerFn.mock.calls[0][0];
      expect(outgoingEventMessageEvent).toBeInstanceOf(
        OutgoingEventMessageEvent
      );
      expect(outgoingEventMessageEvent.parentEvent).toBe(
        incomingReqMessageEvent
      );

      expect(mockEOSEHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingEOSEMessageEvent = mockEOSEHandlerFn.mock.calls[0][0];
      expect(outgoingEOSEMessageEvent).toBeInstanceOf(OutgoingEOSEMessageEvent);
      expect(outgoingEOSEMessageEvent.parentEvent).toBe(
        incomingReqMessageEvent
      );
    });

    it('should not send stored events when defaultPrevented', async () => {
      const hub = setupTestHub(sendStoredEventsToSubscribers);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const willAddEventToDatabaseEvent = new WillAddEventToDatabaseEvent({
        event: testEvent,
      });
      hub.emitEvent(willAddEventToDatabaseEvent);

      const testClient = setupTestClient(hub);

      const mockEventHandlerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      testClient.onEvent(OutgoingEventMessageEvent, mockEventHandlerFn);

      const mockEOSEHandlerFn = jest.fn<unknown, [OutgoingEOSEMessageEvent]>();
      testClient.onEvent(OutgoingEOSEMessageEvent, mockEOSEHandlerFn);

      const incomingReqMessageEvent = new IncomingReqMessageEvent({
        reqMessage: ['REQ', 'SUBSCRIPTION_ID'],
      });
      incomingReqMessageEvent.preventDefault();
      testClient.emitEvent(incomingReqMessageEvent);

      await Promise.resolve();

      expect(mockEventHandlerFn).not.toHaveBeenCalled();
      expect(mockEOSEHandlerFn).not.toHaveBeenCalled();
    });
  });
});
