"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr CLOSE message syntax.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkClientCloseMessage = void 0;
const bad_message_error_1 = require("../errors/bad-message-error");
const check_subscription_id_1 = require("./check-subscription-id");
/**
 * Given an incoming message, check whether it conforms to the Nostr CLOSE
 * message type.
 * @param maybeCloseMessage Potential ClientCloseMessage to check.
 * @returns The same incoming message, but cast as ClientCloseMessage.
 * @throws BadMessageError if the incoming message is malformed.
 */
function checkClientCloseMessage(maybeCloseMessage) {
    if (maybeCloseMessage[0] !== 'CLOSE') {
        throw new bad_message_error_1.BadMessageError('wrong message type');
    }
    (0, check_subscription_id_1.checkSubscriptionId)(maybeCloseMessage[1]);
    if (maybeCloseMessage.length > 2) {
        throw new bad_message_error_1.BadMessageError('extra elements detected');
    }
    return maybeCloseMessage;
}
exports.checkClientCloseMessage = checkClientCloseMessage;
