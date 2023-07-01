/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for main Memorelay entry point.
 */

import { MemorelayHub } from './memorelay-hub';

describe('MemorelayHub', () => {
  it('should be a constructor function', () => {
    expect(typeof MemorelayHub).toBe('function');
    const memorelayHub = new MemorelayHub();
    expect(memorelayHub instanceof MemorelayHub).toBe(true);
  });

  describe('handleUpgrade', () => {
    it('should return a handler function', () => {
      const memorelayHub = new MemorelayHub();
      const handlerFunction = memorelayHub.handleUpgrade();
      expect(typeof handlerFunction).toBe('function');
    });
  });
});
