/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for checkClientCloseMessage().
 */

import { checkClientCloseMessage } from './check-client-close-message';

describe('checkClientCloseMessage()', () => {
  it('should throw if not passed a CLOSE message', () => {
    expect(() => {
      checkClientCloseMessage(['FOO']);
    }).toThrow('bad msg: wrong message type');
  });

  it('should throw if not passed extra array elements', () => {
    expect(() => {
      checkClientCloseMessage(['CLOSE', '1', 'EXTRA']);
    }).toThrow('bad msg: extra elements detected');
  });
});
