/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the verifyEvent() utility function.
 */

import { verifyEvent } from './verify-event';

import { Event as NostrEvent } from 'nostr-tools';

describe('verifyEvent()', () => {
  it('should be a function', () => {
    expect(typeof verifyEvent).toBe('function');
  });

  it('should not throw given a valid event', () => {
    expect(() => {
      verifyEvent({
        content: 'BRB, turning on the miners',
        created_at: 1683474317,
        id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
        kind: 1,
        pubkey:
          '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
        sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
        tags: [],
      });
    }).not.toThrow();
  });

  it('should throw given an event missing basic, required fields', () => {
    expect(() => {
      verifyEvent({
        content: 'BRB, turning on the miners',
        created_at: 1683474317,
        id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
        /* kind: 1, */
        pubkey:
          '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
        sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
        tags: [],
      } as unknown as NostrEvent);
    }).toThrow('event invalid');

    expect(() => {
      verifyEvent({
        content: 'BRB, turning on the miners',
        /* created_at: 1683474317, */
        id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
        kind: 1,
        pubkey:
          '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
        sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
        tags: [],
      } as unknown as NostrEvent);
    }).toThrow('event invalid');
  });

  it('should throw given an event with incorrect field value types', () => {
    expect(() => {
      verifyEvent({
        content: 'BRB, turning on the miners',
        created_at: 1683474317,
        id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
        kind: 'INCORRECT_KIND_TYPE', // kind: 1,
        pubkey:
          '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
        sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
        tags: [],
      } as unknown as NostrEvent);
    }).toThrow('event invalid');

    expect(() => {
      verifyEvent({
        content: 'BRB, turning on the miners',
        created_at: 1683474317,
        id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
        kind: 1,
        pubkey:
          '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
        sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
        tags: 'INCORRECT_TAGS_VALUE_TYPE', // tags: [],
      } as unknown as NostrEvent);
    }).toThrow('event invalid');
  });

  it('should throw given an event without a signature', () => {
    expect(() => {
      verifyEvent({
        content: 'BRB, turning on the miners',
        created_at: 1683474317,
        id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
        kind: 1,
        pubkey:
          '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
        /* sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd', */
        tags: [],
      } as unknown as NostrEvent);
    }).toThrow('event signature missing');
  });

  it('should throw given an event without a bad signature', () => {
    expect(() => {
      verifyEvent({
        content: 'BRB, turning on the miners',
        created_at: 1683474317,
        id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
        kind: 1,
        pubkey:
          '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
        sig: 'INCORRECT_SIGNATURE', // sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
        tags: [],
      } as unknown as NostrEvent);
    }).toThrow('bad signature');
  });
});
