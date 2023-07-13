/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for filterOutgoingEvents().
 */

import { Kind, generatePrivateKey } from 'nostr-tools';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { EventDeletionDatabase } from '../lib/event-deletion-database';
import { filterOutgoingEvents } from './filter-outgoing-events';
import { OutgoingEventMessageEvent } from '../../nip-0001-basic-protocol/events/outgoing-event-message-event';

describe('filterOutgoingEvents()', () => {
  describe('#OutgoingEventMessageEvent', () => {
    it('should filter deleted outgoing events', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();

      const authorSecretKey = generatePrivateKey();
      const testEvent = createSignedTestEvent(
        { content: 'TEST' },
        authorSecretKey
      );
      const deletionEvent = createSignedTestEvent(
        {
          kind: Kind.EventDeletion,
          content: 'DELETION',
          tags: [['e', testEvent.id]],
        },
        authorSecretKey
      );

      eventDeletionDatabase.addEvent(testEvent);
      eventDeletionDatabase.addEvent(deletionEvent);

      const { memorelayClient } = setupTestHubAndClient();

      filterOutgoingEvents(eventDeletionDatabase, memorelayClient);

      const outgoingEventMessageEvent = new OutgoingEventMessageEvent({
        relayEventMessage: ['EVENT', 'SUBSCRIPTION_ID', testEvent],
      });
      memorelayClient.emitEvent(outgoingEventMessageEvent);

      expect(outgoingEventMessageEvent.defaultPrevented).toBe(true);
    });

    it('should do nothing when defaultPrevented', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();

      const spy = jest.spyOn(eventDeletionDatabase, 'isDeleted');

      const testEvent = createSignedTestEvent({ content: 'TEST' });

      const { memorelayClient } = setupTestHubAndClient();

      filterOutgoingEvents(eventDeletionDatabase, memorelayClient);

      const outgoingEventMessageEvent = new OutgoingEventMessageEvent({
        relayEventMessage: ['EVENT', 'SUBSCRIPTION_ID', testEvent],
      });
      outgoingEventMessageEvent.preventDefault();
      memorelayClient.emitEvent(outgoingEventMessageEvent);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
