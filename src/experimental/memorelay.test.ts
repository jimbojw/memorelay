/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for main Memorelay entry point.
 */

import { Memorelay } from './memorelay';

describe('Memorelay', () => {
  it('should be a constructor function', () => {
    const memorelay = new Memorelay();
    expect(memorelay instanceof Memorelay).toBe(true);
  });

  describe('connect()', () => {
    it('should establish all default Nostr relay functionality', () => {
      const memorelay = new Memorelay();
      memorelay.connect();

      // TODO(jimbo): Add integration tests.
    });
  });
});
