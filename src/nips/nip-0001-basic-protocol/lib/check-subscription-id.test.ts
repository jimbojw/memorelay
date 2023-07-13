/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for checkSubscriptionId().
 */

import { checkSubscriptionId } from './check-subscription-id';

describe('checkSubscriptionId()', () => {
  it('should throw if subscription id is empty', () => {
    expect(() => {
      checkSubscriptionId('');
    }).toThrow('bad msg: subscription id is empty');
  });

  it('should throw if subscription id is too long', () => {
    expect(() => {
      checkSubscriptionId(new Array(65).fill(0).join(''));
    }).toThrow('bad msg: subscription id is too long');
  });
});
