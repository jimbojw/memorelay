/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for addIncomingEventsToDatabase().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { IncomingEventMessageEvent } from '../../nip-0001-basic-protocol/events/incoming-event-message-event';
import { EventDeletionDatabase } from '../lib/event-deletion-database';
import { addIncomingEventsToDatabase } from './add-incoming-events-to-database';

describe('addIncomingEventsToDatabase()', () => {
  describe('#IncomingEventMessageEvent', () => {
    it('should add incoming event to the database', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();
      const { memorelayClient } = setupTestHubAndClient();

      addIncomingEventsToDatabase(eventDeletionDatabase, memorelayClient);

      const testEvent = createSignedTestEvent({ content: 'TEST' });

      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(incomingEventMessageEvent);

      expect(eventDeletionDatabase.hasEvent(testEvent.id)).toBe(true);
    });

    it('should not add when defaultPrevented', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();
      const { memorelayClient } = setupTestHubAndClient();

      addIncomingEventsToDatabase(eventDeletionDatabase, memorelayClient);

      const testEvent = createSignedTestEvent({ content: 'TEST' });

      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      incomingEventMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingEventMessageEvent);

      expect(eventDeletionDatabase.hasEvent(testEvent.id)).toBe(false);
    });
  });
});
