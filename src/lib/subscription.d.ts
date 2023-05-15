/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Type specification for a subscription.
 */

import { Filter, Event as NostrEvent } from 'nostr-tools';

/**
 * Represents a subscription for events.
 */
export interface Subscription {
  /**
   * Callback function to invoke when an event is added that matches this
   * subscription's filters (if any).
   * @param event The recently added event.
   */
  readonly callbackFn: (event: NostrEvent) => void;

  /**
   * Optional array of filters, at least one of which must match in order for
   * the callback function to be invoked.
   */
  readonly filters?: Filter[];

  /**
   * Unique numeric id for this subscription in the context of the Memorelay
   * instance which created it.
   */
  readonly subscriptionNumber: number;
}
