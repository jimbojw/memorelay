/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for storeIncomingEventsToDatabase().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { DidAddEventToDatabaseEvent } from '../events/did-add-event-to-database-event';
import { IncomingEventMessageEvent } from '../events/incoming-event-message-event';
import { WillAddEventToDatabaseEvent } from '../events/will-add-event-to-database-event';
import { EventsDatabase } from '../lib/events-database';
import { storeIncomingEventsToDatabase } from './store-incoming-events-to-database';

describe('storeIncomingEventsToDatabase()', () => {
  describe('#IncomingEventMessageEvent', () => {
    it('should emit a WillAddEventToDatabaseEvent', async () => {
      const eventsDatabase = new EventsDatabase();
      const { memorelayClient } = setupTestHubAndClient(
        storeIncomingEventsToDatabase(eventsDatabase)
      );

      const mockHandlerFn = jest.fn<unknown, [WillAddEventToDatabaseEvent]>();
      memorelayClient.onEvent(WillAddEventToDatabaseEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(incomingEventMessageEvent);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const willAddEventToDatabaseEvent = mockHandlerFn.mock.calls[0][0];
      expect(willAddEventToDatabaseEvent).toBeInstanceOf(
        WillAddEventToDatabaseEvent
      );
      expect(willAddEventToDatabaseEvent.parentEvent).toBe(
        incomingEventMessageEvent
      );
    });

    it('should not emit when defaultPrevented', async () => {
      const eventsDatabase = new EventsDatabase();
      const { memorelayClient } = setupTestHubAndClient(
        storeIncomingEventsToDatabase(eventsDatabase)
      );

      const mockHandlerFn = jest.fn<unknown, [WillAddEventToDatabaseEvent]>();
      memorelayClient.onEvent(WillAddEventToDatabaseEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      incomingEventMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingEventMessageEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });

  describe('#WillAddEventToDatabaseEvent', () => {
    it('should add event to database', async () => {
      const eventsDatabase = new EventsDatabase();
      const { memorelayClient } = setupTestHubAndClient(
        storeIncomingEventsToDatabase(eventsDatabase)
      );

      const mockHandlerFn = jest.fn<unknown, [DidAddEventToDatabaseEvent]>();
      memorelayClient.onEvent(DidAddEventToDatabaseEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      expect(eventsDatabase.hasEvent(testEvent.id)).toBe(false);

      const willAddEventToDatabaseEvent = new WillAddEventToDatabaseEvent({
        event: testEvent,
      });
      memorelayClient.emitEvent(willAddEventToDatabaseEvent);

      expect(mockHandlerFn).not.toHaveBeenCalled();
      expect(eventsDatabase.hasEvent(testEvent.id)).toBe(true);

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
      const eventsDatabase = new EventsDatabase();
      const { memorelayClient } = setupTestHubAndClient(
        storeIncomingEventsToDatabase(eventsDatabase)
      );

      const mockHandlerFn = jest.fn<unknown, [DidAddEventToDatabaseEvent]>();
      memorelayClient.onEvent(DidAddEventToDatabaseEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const willAddEventToDatabaseEvent = new WillAddEventToDatabaseEvent({
        event: testEvent,
      });
      willAddEventToDatabaseEvent.preventDefault();
      memorelayClient.emitEvent(willAddEventToDatabaseEvent);

      expect(eventsDatabase.hasEvent(testEvent.id)).toBe(false);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
