/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for EventDeletionDatabase.
 */

import { generatePrivateKey } from 'nostr-tools';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { EventDeletionDatabase } from './event-deletion-database';

describe('EventDeletionDatabase', () => {
  describe('addEvent()', () => {
    it('should do nothing if event is already known', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();
      const textEvent = createSignedTestEvent({ content: 'TEXT' });

      eventDeletionDatabase.addEvent(textEvent);
      expect(eventDeletionDatabase.size).toBe(1);

      eventDeletionDatabase.addEvent(textEvent);
      expect(eventDeletionDatabase.size).toBe(1);
    });
  });

  describe('recordDeletionEvent()', () => {
    it('should throw if presented a non-deletion event', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();
      const textEvent = createSignedTestEvent({ content: 'TEXT' });

      expect(() => {
        eventDeletionDatabase.recordDeletionEvent(textEvent);
      }).toThrow('event must be a deletion event');
    });

    it('should ignore non-e tags', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();
      const textEvent = createSignedTestEvent({
        kind: 5,
        content: 'DELETE',
        tags: [['IGNORE', 'ME']],
      });

      eventDeletionDatabase.recordDeletionEvent(textEvent);
    });
  });

  describe('recordDeletionAttempt()', () => {
    it('should do nothing if event is already deleted', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();
      const authorSecretKey = generatePrivateKey();
      const textEvent = createSignedTestEvent(
        { content: 'TEXT' },
        authorSecretKey
      );

      const firstDeletionEvent = createSignedTestEvent(
        {
          kind: 5,
          content: 'DELETE',
          tags: [['e', textEvent.id]],
        },
        authorSecretKey
      );

      eventDeletionDatabase.addEvent(textEvent);
      eventDeletionDatabase.addEvent(firstDeletionEvent);

      // Should do nothing.
      eventDeletionDatabase.recordDeletionAttempt(
        textEvent.pubkey,
        textEvent.id
      );

      expect(eventDeletionDatabase.isDeleted(textEvent.id)).toBe(true);
    });
  });

  describe('checkDeletionAttempts()', () => {
    it('should throw if presented a deletion event', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();
      const deletionEvent = createSignedTestEvent({
        kind: 5,
        content: 'DELETE',
      });

      expect(() => {
        eventDeletionDatabase.checkDeletionAttempts(deletionEvent);
      }).toThrow('event must not be a deletion event');
    });
  });

  describe('hasAttemptedDeletion()', () => {
    it('should return true after an attempt is made', () => {
      const eventDeletionDatabase = new EventDeletionDatabase();
      const authorSecretKey = generatePrivateKey();
      const textEvent = createSignedTestEvent(
        { content: 'TEXT' },
        authorSecretKey
      );

      const deletionEvent = createSignedTestEvent(
        {
          kind: 5,
          content: 'DELETE',
          tags: [['e', textEvent.id]],
        },
        authorSecretKey
      );

      eventDeletionDatabase.addEvent(deletionEvent);
      expect(
        eventDeletionDatabase.hasAttemptedDeletion(
          textEvent.pubkey,
          textEvent.id
        )
      ).toBe(true);
    });
  });

  describe('scenarios', () => {
    describe('known non-deletion event followed by valid deletion', () => {
      it('should mark known event as deleted', () => {
        const eventDeletionDatabase = new EventDeletionDatabase();
        const authorSecretKey = generatePrivateKey();
        const textEvent = createSignedTestEvent(
          { content: 'TEXT' },
          authorSecretKey
        );
        const validDeletionEvent = createSignedTestEvent(
          {
            kind: 5,
            content: 'DELETE',
            tags: [['e', textEvent.id]],
          },
          authorSecretKey
        );

        // First, add the targeted event.
        eventDeletionDatabase.addEvent(textEvent);
        expect(eventDeletionDatabase.hasEvent(textEvent.id)).toBe(true);
        expect(eventDeletionDatabase.isDeleted(textEvent.id)).toBe(false);

        // Second, add the deletion event.
        eventDeletionDatabase.addEvent(validDeletionEvent);
        expect(eventDeletionDatabase.hasEvent(validDeletionEvent.id)).toBe(
          true
        );
        expect(eventDeletionDatabase.hasEvent(textEvent.id)).toBe(true);
        expect(eventDeletionDatabase.isDeleted(textEvent.id)).toBe(true);
      });
    });

    describe('known non-deletion event followed by invalid deletion', () => {
      it('should ignore invalid deletion attempt', () => {
        const eventDeletionDatabase = new EventDeletionDatabase();

        const authorSecretKey = generatePrivateKey();
        const textEvent = createSignedTestEvent(
          { content: 'TEXT' },
          authorSecretKey
        );

        const attackerSecretKey = generatePrivateKey();
        const invalidDeletionEvent = createSignedTestEvent(
          {
            kind: 5,
            content: 'DELETE',
            tags: [['e', textEvent.id]],
          },
          attackerSecretKey
        );

        // First, add the targeted event.
        eventDeletionDatabase.addEvent(textEvent);
        expect(eventDeletionDatabase.hasEvent(textEvent.id)).toBe(true);
        expect(eventDeletionDatabase.isDeleted(textEvent.id)).toBe(false);

        // Second, add the invalid deletion event.
        eventDeletionDatabase.addEvent(invalidDeletionEvent);
        expect(eventDeletionDatabase.hasEvent(invalidDeletionEvent.id)).toBe(
          true
        );

        // Confirm that the targeted event was not deleted.
        expect(eventDeletionDatabase.hasEvent(textEvent.id)).toBe(true);
        expect(eventDeletionDatabase.isDeleted(textEvent.id)).toBe(false);
      });
    });

    describe('valid deletion event followed by targeted event', () => {
      it('should mark event as deleted', () => {
        const eventDeletionDatabase = new EventDeletionDatabase();
        const authorSecretKey = generatePrivateKey();
        const textEvent = createSignedTestEvent(
          { content: 'TEXT' },
          authorSecretKey
        );
        const validDeletionEvent = createSignedTestEvent(
          {
            kind: 5,
            content: 'DELETE',
            tags: [['e', textEvent.id]],
          },
          authorSecretKey
        );

        // First, add deletion event.
        eventDeletionDatabase.addEvent(validDeletionEvent);
        expect(eventDeletionDatabase.hasEvent(validDeletionEvent.id)).toBe(
          true
        );

        // Second, add the targeted event.
        eventDeletionDatabase.addEvent(textEvent);
        expect(eventDeletionDatabase.hasEvent(textEvent.id)).toBe(true);
        expect(eventDeletionDatabase.isDeleted(textEvent.id)).toBe(true);
      });
    });

    describe('invalid deletion event followed by targeted event', () => {
      it('should ignore invalid deletion attempt', () => {
        const eventDeletionDatabase = new EventDeletionDatabase();

        const authorSecretKey = generatePrivateKey();
        const textEvent = createSignedTestEvent(
          { content: 'TEXT' },
          authorSecretKey
        );

        const attackerSecretKey = generatePrivateKey();
        const invalidDeletionEvent = createSignedTestEvent(
          {
            kind: 5,
            content: 'DELETE',
            tags: [['e', textEvent.id]],
          },
          attackerSecretKey
        );

        // First, add the invalid deletion event.
        eventDeletionDatabase.addEvent(invalidDeletionEvent);
        expect(eventDeletionDatabase.hasEvent(invalidDeletionEvent.id)).toBe(
          true
        );

        // Second, add the targeted event.
        eventDeletionDatabase.addEvent(textEvent);
        expect(eventDeletionDatabase.hasEvent(textEvent.id)).toBe(true);
        expect(eventDeletionDatabase.isDeleted(textEvent.id)).toBe(false);
      });
    });

    describe('known deletion event followed by attempt to delete it', () => {
      it('should ignore attempt to delete deletion event', () => {
        const eventDeletionDatabase = new EventDeletionDatabase();
        const authorSecretKey = generatePrivateKey();
        const textEvent = createSignedTestEvent(
          { content: 'TEXT' },
          authorSecretKey
        );
        const validDeletionEvent = createSignedTestEvent(
          {
            kind: 5,
            content: 'DELETE',
            tags: [['e', textEvent.id]],
          },
          authorSecretKey
        );
        const invalidDeletionEvent = createSignedTestEvent(
          {
            kind: 5,
            content: 'DELETE A DELETION',
            tags: [['e', validDeletionEvent.id]],
          },
          authorSecretKey
        );

        // First, add the valid deletion event.
        eventDeletionDatabase.addEvent(validDeletionEvent);
        expect(eventDeletionDatabase.hasEvent(validDeletionEvent.id)).toBe(
          true
        );
        expect(eventDeletionDatabase.isDeleted(validDeletionEvent.id)).toBe(
          false
        );

        // Second, add the invalid deletion event.
        eventDeletionDatabase.addEvent(invalidDeletionEvent);
        expect(eventDeletionDatabase.hasEvent(invalidDeletionEvent.id)).toBe(
          true
        );

        // Confirm that the original, valid deletion event was not deleted.
        expect(eventDeletionDatabase.hasEvent(validDeletionEvent.id)).toBe(
          true
        );
        expect(eventDeletionDatabase.isDeleted(validDeletionEvent.id)).toBe(
          false
        );
      });
    });

    describe('deletion event of an unknown deletion event', () => {
      it('should ignore attempt to delete deletion event', () => {
        const eventDeletionDatabase = new EventDeletionDatabase();
        const authorSecretKey = generatePrivateKey();
        const textEvent = createSignedTestEvent(
          { content: 'TEXT' },
          authorSecretKey
        );
        const validDeletionEvent = createSignedTestEvent(
          {
            kind: 5,
            content: 'DELETE',
            tags: [['e', textEvent.id]],
          },
          authorSecretKey
        );
        const invalidDeletionEvent = createSignedTestEvent(
          {
            kind: 5,
            content: 'DELETE A DELETION',
            tags: [['e', validDeletionEvent.id]],
          },
          authorSecretKey
        );

        // First, add the invalid deletion event.
        eventDeletionDatabase.addEvent(invalidDeletionEvent);
        expect(eventDeletionDatabase.hasEvent(invalidDeletionEvent.id)).toBe(
          true
        );

        // Second, add the valid deletion event.
        eventDeletionDatabase.addEvent(validDeletionEvent);
        expect(eventDeletionDatabase.hasEvent(validDeletionEvent.id)).toBe(
          true
        );
        expect(eventDeletionDatabase.isDeleted(validDeletionEvent.id)).toBe(
          false
        );
      });
    });
  });
});
