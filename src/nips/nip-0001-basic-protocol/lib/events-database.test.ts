/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the Memorelay class.
 */

import { EventsDatabase } from './events-database';

import { Filter, Event as NostrEvent } from 'nostr-tools';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { BadEventError } from '../errors/bad-event-error';

const EXAMPLE_SIGNED_EVENT: NostrEvent = Object.freeze({
  content: 'BRB, turning on the miners',
  created_at: 1683474317,
  id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
  kind: 1,
  pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
  sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
  tags: [],
});

const ALTERNATIVE_SIGNED_EVENT: NostrEvent = Object.freeze({
  content: 'You think these fees are high? Wait until tomorrow. 🤩',
  created_at: 1683490147,
  id: '8e2c17383f674109524008d47735c56ae17020b7a57982b0d1ed7c8e652380ad',
  kind: 1,
  pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
  sig: '1617946d16b77815a1016c391de3101b04f2a034d6603cbcc924aac1012ea9d4d393bb959ac039a59c0d2461b5d6de09b81837f2bef284bf2243b4599d27cae6',
  tags: [],
});

describe('EventsDatabase', () => {
  describe('addEvent', () => {
    it('should return true for a previously unknown event', () => {
      const coordinator = new EventsDatabase();
      expect(coordinator.addEvent(EXAMPLE_SIGNED_EVENT)).toBe(true);
    });

    it('should be able to add events with same created_at stamp', () => {
      const coordinator = new EventsDatabase();
      expect(coordinator.addEvent(EXAMPLE_SIGNED_EVENT)).toBe(true);
      const collidingEvent = createSignedTestEvent({
        content: 'same created_at as previous',
        created_at: EXAMPLE_SIGNED_EVENT.created_at,
      });
      expect(coordinator.addEvent(collidingEvent)).toBe(true);
    });

    it('should return false when adding a known event', () => {
      const coordinator = new EventsDatabase();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      expect(coordinator.addEvent(EXAMPLE_SIGNED_EVENT)).toBe(false);
    });

    it('should throw when adding an invalid event object', () => {
      const coordinator = new EventsDatabase();
      expect(() => {
        coordinator.addEvent({} as NostrEvent);
      }).toThrow(BadEventError);

      expect(() => {
        coordinator.addEvent(undefined as unknown as NostrEvent);
      }).toThrow(BadEventError);

      expect(() => {
        coordinator.addEvent(EXAMPLE_SIGNED_EVENT.id as unknown as NostrEvent);
      }).toThrow(BadEventError);
    });
  });

  describe('hasEvent', () => {
    it('should return false for an unknown event', () => {
      const coordinator = new EventsDatabase();
      expect(coordinator.hasEvent(EXAMPLE_SIGNED_EVENT.id)).toBe(false);
    });

    it('should return true for a known event', () => {
      const coordinator = new EventsDatabase();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      expect(coordinator.hasEvent(EXAMPLE_SIGNED_EVENT.id)).toBe(true);
    });
  });

  describe('deleteEvent', () => {
    it('should return false for an unknown event', () => {
      const coordinator = new EventsDatabase();
      expect(coordinator.deleteEvent(EXAMPLE_SIGNED_EVENT.id)).toBe(false);
    });

    it('should return true for a known event', () => {
      const coordinator = new EventsDatabase();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      expect(coordinator.deleteEvent(EXAMPLE_SIGNED_EVENT.id)).toBe(true);
    });
  });

  describe('matchFilters', () => {
    it('should return an empty array when no events are known', () => {
      const coordinator = new EventsDatabase();
      expect(coordinator.matchFilters()).toEqual([]);
      expect(coordinator.matchFilters([])).toEqual([]);
      expect(coordinator.matchFilters([{}])).toEqual([]);
      expect(coordinator.matchFilters([{ kinds: [1] }])).toEqual([]);
      expect(
        coordinator.matchFilters([{ ids: ['6'] }, { kinds: [1] }])
      ).toEqual([]);
    });

    it('should find all events when no filters are provided', () => {
      const coordinator = new EventsDatabase();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);

      const EXPECTED_RESULTS = [EXAMPLE_SIGNED_EVENT, ALTERNATIVE_SIGNED_EVENT];

      expect(coordinator.matchFilters()).toEqual(EXPECTED_RESULTS);
      expect(coordinator.matchFilters([])).toEqual(EXPECTED_RESULTS);
      expect(coordinator.matchFilters([{}])).toEqual(EXPECTED_RESULTS);
    });

    it('should find only events up to the limit', () => {
      const coordinator = new EventsDatabase();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);

      const EXPECTED_RESULTS = [ALTERNATIVE_SIGNED_EVENT];

      expect(coordinator.matchFilters([{ limit: 1 }])).toEqual(
        EXPECTED_RESULTS
      );
    });

    it('should find newest events irrespective of order added', () => {
      const coordinator = new EventsDatabase();

      // Adding the later, 'alternative' event first.
      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);

      const EXPECTED_RESULTS = [ALTERNATIVE_SIGNED_EVENT];

      expect(coordinator.matchFilters([{ limit: 1 }])).toEqual(
        EXPECTED_RESULTS
      );
    });

    it('should not find deleted events', () => {
      const coordinator = new EventsDatabase();

      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      coordinator.deleteEvent(ALTERNATIVE_SIGNED_EVENT.id);

      const EXPECTED_RESULTS = [EXAMPLE_SIGNED_EVENT];

      expect(coordinator.matchFilters([{ limit: 1 }])).toEqual(
        EXPECTED_RESULTS
      );
    });

    it('should find only events that match filters', () => {
      const coordinator = new EventsDatabase();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);

      expect(coordinator.matchFilters([{ ids: ['f9'] }])).toEqual([
        EXAMPLE_SIGNED_EVENT,
      ]);
      expect(coordinator.matchFilters([{ ids: ['8e'] }])).toEqual([
        ALTERNATIVE_SIGNED_EVENT,
      ]);
      expect(coordinator.matchFilters([{ ids: ['XX'] }])).toEqual([]);
    });

    it('should throw if a filter is invalid', () => {
      const coordinator = new EventsDatabase();

      expect(() => {
        coordinator.matchFilters([
          { INVALID_KEY: ['UNEXPECTED VALUE'] } as unknown as Filter,
        ]);
      }).toThrow('unexpected filter field');

      expect(() => {
        coordinator.matchFilters([
          {},
          { INVALID_KEY: ['UNEXPECTED VALUE'] } as unknown as Filter,
          { kinds: [1] },
        ]);
      }).toThrow('unexpected filter field');
    });
  });
});
