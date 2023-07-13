/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event signaling that the indicated subscription could not be
 * found.
 */
import { ClientEvent, ClientEventOptions } from '../../../core/events/client-event';
export declare const SUBSCRIPTION_NOT_FOUND_EVENT_TYPE = "subscription-not-found";
/**
 * @see SubscriptionNotFoundEvent
 */
export interface SubscriptionNotFoundEventDetails {
    /**
     * The subscription id that could not be found.
     */
    readonly subscriptionId: string;
}
/**
 * Event emitted when an indicated subscription id could not be found. This
 * would happen if the relay received a CLOSE message with an unrecognized
 * subscription id.
 */
export declare class SubscriptionNotFoundEvent extends ClientEvent<typeof SUBSCRIPTION_NOT_FOUND_EVENT_TYPE, SubscriptionNotFoundEventDetails> {
    static readonly type: typeof SUBSCRIPTION_NOT_FOUND_EVENT_TYPE;
    constructor(details: SubscriptionNotFoundEventDetails, options?: ClientEventOptions);
}
