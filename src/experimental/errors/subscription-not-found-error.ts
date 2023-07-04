/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error type when a subscription cannot be found.
 */

import { BasicError } from './basic-error';

export const SUBSCRIPTION_NOT_FOUND_ERROR_TYPE = 'subscription-not-found-error';

export class SubscriptionNotFoundError extends BasicError {
  static readonly type = SUBSCRIPTION_NOT_FOUND_ERROR_TYPE;

  constructor(subscriptionId: string) {
    super(`subscription not found: ${subscriptionId}`);
  }

  get type() {
    return SubscriptionNotFoundError.type;
  }
}
