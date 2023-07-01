/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for main Memorelay entry point.
 */

import { Memorelay } from './memorelay';

describe('Memorelay', () => {
  it('should be a constructor function', () => {
    expect(typeof Memorelay).toBe('function');
    const memorelay = new Memorelay();
    expect(memorelay instanceof Memorelay).toBe(true);
  });
});
