"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr relay EOSE message
 * syntax.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRelayEOSEMessage = void 0;
const bad_message_error_1 = require("../errors/bad-message-error");
const check_subscription_id_1 = require("./check-subscription-id");
/**
 * Given an message, check whether it conforms to the outgoing relay EOSE
 * message type.
 * @param maybeRelayEOSEMessage Potential RelayEOSEMessage to check.
 * @returns The same message, but cast as RelayEOSEMessage.
 * @throws BadMessageError if the message is malformed.
 */
function checkRelayEOSEMessage(maybeRelayEOSEMessage) {
    if (maybeRelayEOSEMessage.length < 2) {
        throw new bad_message_error_1.BadMessageError('subscription id missing');
    }
    (0, check_subscription_id_1.checkSubscriptionId)(maybeRelayEOSEMessage[1]);
    if (maybeRelayEOSEMessage.length > 2) {
        throw new bad_message_error_1.BadMessageError('extra elements detected');
    }
    return maybeRelayEOSEMessage;
}
exports.checkRelayEOSEMessage = checkRelayEOSEMessage;
