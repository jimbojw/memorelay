"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event signaling that the indicated subscription could not be
 * found.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionNotFoundEvent = exports.SUBSCRIPTION_NOT_FOUND_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.SUBSCRIPTION_NOT_FOUND_EVENT_TYPE = 'subscription-not-found';
/**
 * Event emitted when an indicated subscription id could not be found. This
 * would happen if the relay received a CLOSE message with an unrecognized
 * subscription id.
 */
class SubscriptionNotFoundEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.SUBSCRIPTION_NOT_FOUND_EVENT_TYPE, details, options);
    }
}
SubscriptionNotFoundEvent.type = exports.SUBSCRIPTION_NOT_FOUND_EVENT_TYPE;
exports.SubscriptionNotFoundEvent = SubscriptionNotFoundEvent;
