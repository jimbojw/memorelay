/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for BadBufferError.
 */

import { BadBufferError } from './bad-buffer-error';

describe('BadBufferError', () => {
  it('should be a constructor function', () => {
    expect(typeof BadBufferError).toBe('function');
    const data = new ArrayBuffer(0);
    const isBinary = true;
    const badBufferError = new BadBufferError(data, isBinary);
    expect(badBufferError instanceof BadBufferError).toBe(true);
  });
});
