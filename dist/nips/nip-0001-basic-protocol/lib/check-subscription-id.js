"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a subscription id is valid.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSubscriptionId = void 0;
const bad_message_error_1 = require("../errors/bad-message-error");
/**
 * Check whether the subscription id is valid.
 * @param subscriptionId Possibly valid subscription id.
 * @throws BadMessageError if the id is invalid.
 */
function checkSubscriptionId(subscriptionId) {
    if (subscriptionId === undefined) {
        throw new bad_message_error_1.BadMessageError('subscription id missing');
    }
    if (typeof subscriptionId !== 'string') {
        throw new bad_message_error_1.BadMessageError('subscription id is not a string');
    }
    if (!subscriptionId) {
        throw new bad_message_error_1.BadMessageError('subscription id is empty');
    }
    if (subscriptionId.length > 64) {
        throw new bad_message_error_1.BadMessageError('subscription id is too long');
    }
}
exports.checkSubscriptionId = checkSubscriptionId;
