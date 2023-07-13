/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendStoredEventsToSubscribers().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { OutgoingEOSEMessageEvent } from '../events/outgoing-eose-message-event';
import { OutgoingEventMessageEvent } from '../events/outgoing-event-message-event';
import { EventsDatabase } from '../lib/events-database';
import { sendStoredEventsToSubscribers } from './send-stored-events-to-subscribers';

describe('sendStoredEventsToSubscribers()', () => {
  describe('#IncomingReqMessageEvent', () => {
    it('should send stored events to subscribers', async () => {
      const eventsDatabase = new EventsDatabase();
      const testEvent = createSignedTestEvent({ content: 'TEST' });
      eventsDatabase.addEvent(testEvent);

      const { memorelayClient } = setupTestHubAndClient(
        sendStoredEventsToSubscribers(eventsDatabase)
      );

      const mockEventHandlerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      memorelayClient.onEvent(OutgoingEventMessageEvent, mockEventHandlerFn);

      const mockEOSEHandlerFn = jest.fn<unknown, [OutgoingEOSEMessageEvent]>();
      memorelayClient.onEvent(OutgoingEOSEMessageEvent, mockEOSEHandlerFn);

      const incomingReqMessageEvent = new IncomingReqMessageEvent({
        reqMessage: ['REQ', 'SUBSCRIPTION_ID'],
      });
      memorelayClient.emitEvent(incomingReqMessageEvent);

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
      const eventsDatabase = new EventsDatabase();
      const testEvent = createSignedTestEvent({ content: 'TEST' });
      eventsDatabase.addEvent(testEvent);

      const { memorelayClient } = setupTestHubAndClient(
        sendStoredEventsToSubscribers(eventsDatabase)
      );

      const mockEventHandlerFn = jest.fn<
        unknown,
        [OutgoingEventMessageEvent]
      >();
      memorelayClient.onEvent(OutgoingEventMessageEvent, mockEventHandlerFn);

      const mockEOSEHandlerFn = jest.fn<unknown, [OutgoingEOSEMessageEvent]>();
      memorelayClient.onEvent(OutgoingEOSEMessageEvent, mockEOSEHandlerFn);

      const incomingReqMessageEvent = new IncomingReqMessageEvent({
        reqMessage: ['REQ', 'SUBSCRIPTION_ID'],
      });
      incomingReqMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingReqMessageEvent);

      await Promise.resolve();

      expect(mockEventHandlerFn).not.toHaveBeenCalled();
      expect(mockEOSEHandlerFn).not.toHaveBeenCalled();
    });
  });
});
