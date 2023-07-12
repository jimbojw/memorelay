/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for main Memorelay entry point.
 */

import { MemorelayHub } from './core/lib/memorelay-hub';
import { Disconnectable } from './core/types/disconnectable';
import { Memorelay } from './memorelay';

describe('Memorelay', () => {
  it('should take plugins', () => {
    const mockPluginFn = jest.fn<Disconnectable, [MemorelayHub]>();

    const memorelay = new Memorelay(mockPluginFn);

    expect(memorelay.plugins).toContain(mockPluginFn);
    expect(mockPluginFn).not.toHaveBeenCalled();

    memorelay.connect();

    expect(mockPluginFn).toHaveBeenCalledTimes(1);
  });

  describe('connect()', () => {
    it('should establish all default Nostr relay functionality', () => {
      const memorelay = new Memorelay();
      memorelay.connect();

      // TODO(jimbo): Add integration tests.
    });
  });
});
