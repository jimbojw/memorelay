/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the increaseClientMaxEventListeners().
 */

import {
  setupTestClient,
  setupTestHub,
} from '../../test/setup-test-hub-and-client';
import { increaseClientMaxEventListeners } from './increase-client-max-event-listeners';
import { MemorelayClientCreatedEvent } from '../events/memorelay-client-created-event';
import { MemorelayClientDisconnectEvent } from '../events/memorelay-client-disconnect-event';

describe('increaseClientMaxEventListeners()', () => {
  it('should throw a RangeError if passed an invalid count', () => {
    for (const invalidIncreaseCount of [NaN, 0, Infinity]) {
      expect(() => {
        increaseClientMaxEventListeners(invalidIncreaseCount);
      }).toThrow(RangeError);
    }
  });

  describe('#MemorelayClientCreatedEvent', () => {
    it('should increase max listeners by specified amount', () => {
      const memorelayClient = setupTestClient();
      const initialMaxEventListeners = memorelayClient.maxEventListeners;

      const increaseCount = 100;
      const hub = setupTestHub(increaseClientMaxEventListeners(increaseCount));

      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      expect(memorelayClient.maxEventListeners).toBe(
        initialMaxEventListeners + increaseCount
      );
    });

    it('should do nothing when defaultPrevented', () => {
      const memorelayClient = setupTestClient();
      const initialMaxEventListeners = memorelayClient.maxEventListeners;

      const increaseCount = 100;
      const hub = setupTestHub(increaseClientMaxEventListeners(increaseCount));

      const memorelayClientCreatedEvent = new MemorelayClientCreatedEvent({
        memorelayClient,
      });
      memorelayClientCreatedEvent.preventDefault();
      hub.emitEvent(memorelayClientCreatedEvent);

      expect(memorelayClient.maxEventListeners).toBe(initialMaxEventListeners);
    });
  });

  describe('#MemorelayClientDisconnectEvent', () => {
    it('trigger disconnect', () => {
      const memorelayClient = setupTestClient();
      const initialMaxEventListeners = memorelayClient.maxEventListeners;

      const increaseCount = 100;
      const hub = setupTestHub(increaseClientMaxEventListeners(increaseCount));

      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      memorelayClient.emitEvent(
        new MemorelayClientDisconnectEvent({ memorelayClient })
      );

      expect(memorelayClient.maxEventListeners).toBe(initialMaxEventListeners);
    });

    it('should do nothing when defaultPrevented', () => {
      const memorelayClient = setupTestClient();
      const initialMaxEventListeners = memorelayClient.maxEventListeners;

      const increaseCount = 100;
      const hub = setupTestHub(increaseClientMaxEventListeners(increaseCount));

      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      const memorelayClientDisconnectEvent = new MemorelayClientDisconnectEvent(
        {
          memorelayClient,
        }
      );
      memorelayClientDisconnectEvent.preventDefault();
      memorelayClient.emitEvent(memorelayClientDisconnectEvent);

      expect(memorelayClient.maxEventListeners).toBe(
        initialMaxEventListeners + increaseCount
      );
    });
  });
});
