/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the Memorelay class.
 */

import { Memorelay } from './memorelay';

import { Event as NostrEvent } from 'nostr-tools';
import { BadEventError } from './verify-event';

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

describe('Memorelay', () => {
  it('should be a constructor function', () => {
    expect(typeof Memorelay).toBe('function');

    const memorelay = new Memorelay();
    expect(memorelay instanceof Memorelay).toBe(true);
  });

  describe('addEvent', () => {
    it('should return true for a previously unknown event', () => {
      const memorelay = new Memorelay();
      expect(memorelay.addEvent(EXAMPLE_SIGNED_EVENT)).toBe(true);
    });

    it('should return false when adding a known event', () => {
      const memorelay = new Memorelay();
      memorelay.addEvent(EXAMPLE_SIGNED_EVENT);
      expect(memorelay.addEvent(EXAMPLE_SIGNED_EVENT)).toBe(false);
    });

    it('should throw when adding an invalid event object', () => {
      const memorelay = new Memorelay();
      expect(() => {
        memorelay.addEvent({} as NostrEvent);
      }).toThrow(BadEventError);

      expect(() => {
        memorelay.addEvent(undefined as unknown as NostrEvent);
      }).toThrow(BadEventError);

      expect(() => {
        memorelay.addEvent(EXAMPLE_SIGNED_EVENT.id as unknown as NostrEvent);
      }).toThrow(BadEventError);
    });
  });

  describe('hasEvent', () => {
    it('should return false for an unknown event', () => {
      const memorelay = new Memorelay();
      expect(memorelay.hasEvent(EXAMPLE_SIGNED_EVENT)).toBe(false);
    });

    it('should return true for a known event', () => {
      const memorelay = new Memorelay();
      memorelay.addEvent(EXAMPLE_SIGNED_EVENT);
      expect(memorelay.hasEvent(EXAMPLE_SIGNED_EVENT)).toBe(true);
    });
  });

  describe('deleteEvent', () => {
    it('should return false for an unknown event', () => {
      const memorelay = new Memorelay();
      expect(memorelay.deleteEvent(EXAMPLE_SIGNED_EVENT)).toBe(false);
    });

    it('should return true for a known event', () => {
      const memorelay = new Memorelay();
      memorelay.addEvent(EXAMPLE_SIGNED_EVENT);
      expect(memorelay.deleteEvent(EXAMPLE_SIGNED_EVENT)).toBe(true);
    });
  });

  describe('matchFilters', () => {
    it('should return an empty array when no events are known', () => {
      const memorelay = new Memorelay();
      expect(memorelay.matchFilters()).toEqual([]);
      expect(memorelay.matchFilters([])).toEqual([]);
      expect(memorelay.matchFilters([{}])).toEqual([]);
      expect(memorelay.matchFilters([{ kinds: [1] }])).toEqual([]);
      expect(memorelay.matchFilters([{ ids: ['6'] }, { kinds: [1] }])).toEqual(
        []
      );
    });

    it('should find all events when no filters are provided', () => {
      const memorelay = new Memorelay();
      memorelay.addEvent(EXAMPLE_SIGNED_EVENT);
      memorelay.addEvent(ALTERNATIVE_SIGNED_EVENT);

      const EXPECTED_RESULTS = [EXAMPLE_SIGNED_EVENT, ALTERNATIVE_SIGNED_EVENT];

      expect(memorelay.matchFilters()).toEqual(EXPECTED_RESULTS);
      expect(memorelay.matchFilters([])).toEqual(EXPECTED_RESULTS);
      expect(memorelay.matchFilters([{}])).toEqual(EXPECTED_RESULTS);
    });

    it('should find only events that match filters', () => {
      const memorelay = new Memorelay();
      memorelay.addEvent(EXAMPLE_SIGNED_EVENT);
      memorelay.addEvent(ALTERNATIVE_SIGNED_EVENT);

      expect(memorelay.matchFilters([{ ids: ['f9'] }])).toEqual([
        EXAMPLE_SIGNED_EVENT,
      ]);
      expect(memorelay.matchFilters([{ ids: ['8e'] }])).toEqual([
        ALTERNATIVE_SIGNED_EVENT,
      ]);
      expect(memorelay.matchFilters([{ ids: ['XX'] }])).toEqual([]);
    });
  });
});
