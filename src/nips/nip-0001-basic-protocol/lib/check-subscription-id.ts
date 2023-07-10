/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a subscription id is valid.
 */

import { BadMessageError } from '../errors/bad-message-error';

/**
 * Check whether the subscription id is valid.
 * @param subscriptionId Possibly valid subscription id.
 * @throws BadMessageError if the id is invalid.
 */
export function checkSubscriptionId(subscriptionId: unknown) {
  if (subscriptionId === undefined) {
    throw new BadMessageError('subscription id missing');
  }

  if (typeof subscriptionId !== 'string') {
    throw new BadMessageError('subscription id is not a string');
  }

  if (!subscriptionId) {
    throw new BadMessageError('subscription id is empty');
  }

  if (subscriptionId.length > 64) {
    throw new BadMessageError('subscription id is too long');
  }
}
