/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the Memorelay class.
 */

import { MemorelayCoordinator } from './memorelay-coordinator';

import { Filter, Event as NostrEvent } from 'nostr-tools';
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
    expect(typeof MemorelayCoordinator).toBe('function');

    const coordinator = new MemorelayCoordinator();
    expect(coordinator instanceof MemorelayCoordinator).toBe(true);
  });

  describe('addEvent', () => {
    it('should return true for a previously unknown event', () => {
      const coordinator = new MemorelayCoordinator();
      expect(coordinator.addEvent(EXAMPLE_SIGNED_EVENT)).toBe(true);
    });

    it('should return false when adding a known event', () => {
      const coordinator = new MemorelayCoordinator();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      expect(coordinator.addEvent(EXAMPLE_SIGNED_EVENT)).toBe(false);
    });

    it('should throw when adding an invalid event object', () => {
      const coordinator = new MemorelayCoordinator();
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

    it('should invoke callback of unfiltered subscriptions', async () => {
      const coordinator = new MemorelayCoordinator();

      const invocations: { event: NostrEvent }[] = [];
      const callbackFn = (event: NostrEvent) => {
        invocations.push({ event });
      };

      coordinator.subscribe(callbackFn);

      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);

      // Same execution thread, should not have been invoked yet.
      expect(invocations).toEqual([]);

      // Awaiting a promise should put us after the queued invocation.
      await Promise.resolve();

      // Now the callback function should have been invoked.
      expect(invocations).toEqual([{ event: EXAMPLE_SIGNED_EVENT }]);

      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);

      await Promise.resolve();

      expect(invocations).toEqual([
        { event: EXAMPLE_SIGNED_EVENT },
        { event: ALTERNATIVE_SIGNED_EVENT },
      ]);
    });

    it('should NOT invoke callback for late subscription', async () => {
      const coordinator = new MemorelayCoordinator();

      const invocations: { event: NostrEvent }[] = [];
      const callbackFn = (event: NostrEvent) => {
        invocations.push({ event });
      };

      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);

      // Add subscription strictly after the event was added.
      coordinator.subscribe(callbackFn);

      // Same execution thread, should not have been invoked yet.
      expect(invocations).toEqual([]);

      // Awaiting a promise should put us after the queued invocation.
      await Promise.resolve();

      // Now the callback function should STILL not have been invoked.
      expect(invocations).toEqual([]);
    });

    it('should invoke callback only if subscription filter matches', async () => {
      const coordinator = new MemorelayCoordinator();

      const invocations: { event: NostrEvent }[] = [];
      const callbackFn = (event: NostrEvent) => {
        invocations.push({ event });
      };

      coordinator.subscribe(callbackFn, [{ ids: ['8e'] }]);

      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);

      await Promise.resolve();

      // Callback function should NOT be invoked for 'f9' event.
      expect(invocations).toEqual([]);

      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);

      await Promise.resolve();

      // Callback function SHOULD be invoked for '8e' event.
      expect(invocations).toEqual([{ event: ALTERNATIVE_SIGNED_EVENT }]);
    });

    it('should NOT invoke callback if subscription is removed', async () => {
      const coordinator = new MemorelayCoordinator();

      const invocations: { event: NostrEvent }[] = [];
      const callbackFn = (event: NostrEvent) => {
        invocations.push({ event });
      };

      const subscriptionNumber = coordinator.subscribe(callbackFn);

      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);

      expect(invocations).toEqual([]);

      // Remove the subscription. Still same execution thread.
      coordinator.unsubscribe(subscriptionNumber);

      expect(invocations).toEqual([]);

      await Promise.resolve();

      // Callback function should STILL not have been invoked, since the
      // subscription was removed before the invocation could have happened.
      expect(invocations).toEqual([]);
    });
  });

  describe('hasEvent', () => {
    it('should return false for an unknown event', () => {
      const coordinator = new MemorelayCoordinator();
      expect(coordinator.hasEvent(EXAMPLE_SIGNED_EVENT)).toBe(false);
    });

    it('should return true for a known event', () => {
      const coordinator = new MemorelayCoordinator();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      expect(coordinator.hasEvent(EXAMPLE_SIGNED_EVENT)).toBe(true);
    });
  });

  describe('deleteEvent', () => {
    it('should return false for an unknown event', () => {
      const coordinator = new MemorelayCoordinator();
      expect(coordinator.deleteEvent(EXAMPLE_SIGNED_EVENT)).toBe(false);
    });

    it('should return true for a known event', () => {
      const coordinator = new MemorelayCoordinator();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      expect(coordinator.deleteEvent(EXAMPLE_SIGNED_EVENT)).toBe(true);
    });
  });

  describe('matchFilters', () => {
    it('should return an empty array when no events are known', () => {
      const coordinator = new MemorelayCoordinator();
      expect(coordinator.matchFilters()).toEqual([]);
      expect(coordinator.matchFilters([])).toEqual([]);
      expect(coordinator.matchFilters([{}])).toEqual([]);
      expect(coordinator.matchFilters([{ kinds: [1] }])).toEqual([]);
      expect(
        coordinator.matchFilters([{ ids: ['6'] }, { kinds: [1] }])
      ).toEqual([]);
    });

    it('should find all events when no filters are provided', () => {
      const coordinator = new MemorelayCoordinator();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);

      const EXPECTED_RESULTS = [EXAMPLE_SIGNED_EVENT, ALTERNATIVE_SIGNED_EVENT];

      expect(coordinator.matchFilters()).toEqual(EXPECTED_RESULTS);
      expect(coordinator.matchFilters([])).toEqual(EXPECTED_RESULTS);
      expect(coordinator.matchFilters([{}])).toEqual(EXPECTED_RESULTS);
    });

    it('should find only events up to the limit', () => {
      const coordinator = new MemorelayCoordinator();
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);

      const EXPECTED_RESULTS = [ALTERNATIVE_SIGNED_EVENT];

      expect(coordinator.matchFilters([{ limit: 1 }])).toEqual(
        EXPECTED_RESULTS
      );
    });

    it('should find newest events irrespective of order added', () => {
      const coordinator = new MemorelayCoordinator();

      // Adding the later, 'alternative' event first.
      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);

      const EXPECTED_RESULTS = [ALTERNATIVE_SIGNED_EVENT];

      expect(coordinator.matchFilters([{ limit: 1 }])).toEqual(
        EXPECTED_RESULTS
      );
    });

    it('should not find deleted events', () => {
      const coordinator = new MemorelayCoordinator();

      coordinator.addEvent(ALTERNATIVE_SIGNED_EVENT);
      coordinator.addEvent(EXAMPLE_SIGNED_EVENT);
      coordinator.deleteEvent(ALTERNATIVE_SIGNED_EVENT);

      const EXPECTED_RESULTS = [EXAMPLE_SIGNED_EVENT];

      expect(coordinator.matchFilters([{ limit: 1 }])).toEqual(
        EXPECTED_RESULTS
      );
    });

    it('should find only events that match filters', () => {
      const coordinator = new MemorelayCoordinator();
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
      const coordinator = new MemorelayCoordinator();

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

  describe('subscribe', () => {
    it('should return a subscriptionNumber for a new subscription', () => {
      const coordinator = new MemorelayCoordinator();

      const invocations: { event: NostrEvent }[] = [];
      const callbackFn = (event: NostrEvent) => {
        invocations.push({ event });
      };

      const subscriptionNumber = coordinator.subscribe(callbackFn);

      expect(Number.isInteger(subscriptionNumber)).toBe(true);
      expect(invocations).toEqual([]);
    });

    it('should return a different subscriptionNumber each time', () => {
      const coordinator = new MemorelayCoordinator();

      const invocations: { event: NostrEvent }[] = [];
      const callbackFn = (event: NostrEvent) => {
        invocations.push({ event });
      };

      const firstSubscriptionNumber = coordinator.subscribe(callbackFn);
      const secondSubscriptionNumber = coordinator.subscribe(callbackFn);

      expect(Number.isInteger(firstSubscriptionNumber)).toBe(true);
      expect(Number.isInteger(secondSubscriptionNumber)).toBe(true);
      expect(firstSubscriptionNumber === secondSubscriptionNumber).toBe(false);
      expect(invocations).toEqual([]);
    });

    it('should throw if an invalid filter is passed', () => {
      const coordinator = new MemorelayCoordinator();

      const invocations: { event: NostrEvent }[] = [];
      const callbackFn = (event: NostrEvent) => {
        invocations.push({ event });
      };

      const invalidFilter = {
        UNEXPECETED_FIELD: 'UNEXPECTED_VALUE',
      } as unknown as Filter;

      let subscriptionNumber: number | undefined = undefined;

      expect(() => {
        subscriptionNumber = coordinator.subscribe(callbackFn, [invalidFilter]);
      }).toThrow('unexpected filter field');

      expect(subscriptionNumber).toBeUndefined();
    });
  });

  describe('unsubscribe', () => {
    it('should return false when there are no subscriptions', () => {
      const coordinator = new MemorelayCoordinator();
      expect(coordinator.unsubscribe(0)).toBe(false);
      expect(coordinator.unsubscribe(1)).toBe(false);
    });

    it('should return true when there is a matching subscription', () => {
      const coordinator = new MemorelayCoordinator();

      const invocations: { event: NostrEvent }[] = [];
      const callbackFn = (event: NostrEvent) => {
        invocations.push({ event });
      };

      const subscriptionNumber = coordinator.subscribe(callbackFn);

      expect(coordinator.unsubscribe(subscriptionNumber)).toBe(true);
      expect(invocations).toEqual([]);
    });

    it('should return false for an already removed subscription', () => {
      const coordinator = new MemorelayCoordinator();

      const invocations: { event: NostrEvent }[] = [];
      const callbackFn = (event: NostrEvent) => {
        invocations.push({ event });
      };

      const subscriptionNumber = coordinator.subscribe(callbackFn);

      coordinator.unsubscribe(subscriptionNumber);

      expect(coordinator.unsubscribe(subscriptionNumber)).toBe(false);
      expect(invocations).toEqual([]);
    });

    it('should throw if the subscription id is invalid', () => {
      const coordinator = new MemorelayCoordinator();
      expect(() => {
        coordinator.unsubscribe('NOT_A_NUMBER' as unknown as number);
      }).toThrow(RangeError);
    });
  });
});
