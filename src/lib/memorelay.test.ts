/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the Memorelay class.
 */

import { Memorelay } from './memorelay';

import { Event as NostrEvent } from 'nostr-tools';

const EXAMPLE_SIGNED_EVENT: NostrEvent = Object.freeze({
  content: 'BRB, turning on the miners',
  created_at: 1683474317,
  id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
  kind: 1,
  pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
  sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
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
});
