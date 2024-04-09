/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for filterIncomingEvents().
 */

import { Kind, generatePrivateKey } from 'nostr-tools';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { IncomingEventMessageEvent } from '../../nip-0001-basic-protocol/events/incoming-event-message-event';
import { EventDeletionDatabase } from '../lib/event-deletion-database';
import { filterIncomingEvents } from './filter-incoming-events';
import { DidAddEventToDatabaseEvent } from '../../nip-0001-basic-protocol/events/did-add-event-to-database-event';

describe('filterIncomingEvents()', () => {
  describe('#IncomingEventMessageEvent', () => {
    it('should filter deleted incoming events', () => {
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

      filterIncomingEvents(eventDeletionDatabase, memorelayClient);

      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(incomingEventMessageEvent);

      expect(incomingEventMessageEvent.defaultPrevented).toBe(true);
    });

    it('should emit synthetic "did add" database event', async () => {
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

      filterIncomingEvents(eventDeletionDatabase, memorelayClient);

      const mockDidAddHandlerFn = jest.fn<
        unknown,
        [DidAddEventToDatabaseEvent]
      >();
      memorelayClient.onEvent(DidAddEventToDatabaseEvent, mockDidAddHandlerFn);

      memorelayClient.emitEvent(
        new IncomingEventMessageEvent({
          clientEventMessage: ['EVENT', testEvent],
        })
      );

      expect(mockDidAddHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockDidAddHandlerFn).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when defaultPrevented', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();

      const spy = jest.spyOn(eventDeletionDatabase, 'isDeleted');

      const testEvent = createSignedTestEvent({ content: 'TEST' });

      const { memorelayClient } = setupTestHubAndClient();

      filterIncomingEvents(eventDeletionDatabase, memorelayClient);

      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      incomingEventMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingEventMessageEvent);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
