/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for basicProtocol().
 */

import { basicProtocol } from '.';
import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { MemorelayHub } from '../../core/memorelay-hub';
import { setupTestHub } from '../../test/setup-hub-and-memorelay-client';

describe('basicProtocol()', () => {
  it('should increase maxEventListeners of hub', () => {
    const hub = setupTestHub();
    const initialMaxEventListeners = hub.maxEventListeners;

    basicProtocol(hub);

    expect(hub.maxEventListeners).toBeGreaterThan(initialMaxEventListeners);
  });

  describe('disconnect()', () => {
    it('should restore maxEventListeners of hub', () => {
      const hub = setupTestHub();
      const initialMaxEventListeners = hub.maxEventListeners;

      const { disconnect } = basicProtocol(hub);
      disconnect();

      expect(hub.maxEventListeners).toBe(initialMaxEventListeners);
    });
  });

  it('should implement the basic Nostr protocol per NIP-01', () => {
    basicProtocol(new BasicEventEmitter() as MemorelayHub);

    // TODO(jimbo): Add integration tests.
  });
});
