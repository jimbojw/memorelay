"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr relay EVENT message
 * syntax.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRelayEventMessage = void 0;
const nostr_tools_1 = require("nostr-tools");
const bad_message_error_1 = require("../errors/bad-message-error");
const check_subscription_id_1 = require("./check-subscription-id");
/**
 * Given a message, check whether it conforms to the outgoing relay EVENT
 * message type.
 * @param maybeRelayEventMessage Potential RelayEventMessage to check.
 * @returns The same message, but cast as RelayEventMessage.
 * @throws BadMessageError if the message is malformed.
 */
function checkRelayEventMessage(maybeRelayEventMessage) {
    if (maybeRelayEventMessage.length < 2) {
        throw new bad_message_error_1.BadMessageError('subscription id missing');
    }
    (0, check_subscription_id_1.checkSubscriptionId)(maybeRelayEventMessage[1]);
    if (maybeRelayEventMessage.length < 3) {
        throw new bad_message_error_1.BadMessageError('event missing');
    }
    if (maybeRelayEventMessage.length > 3) {
        throw new bad_message_error_1.BadMessageError('extra elements detected');
    }
    const payloadEvent = maybeRelayEventMessage[2];
    if (!(0, nostr_tools_1.validateEvent)(payloadEvent)) {
        throw new bad_message_error_1.BadMessageError('event invalid');
    }
    if (!payloadEvent.sig) {
        throw new bad_message_error_1.BadMessageError('event signature missing');
    }
    if (!(0, nostr_tools_1.verifySignature)(payloadEvent)) {
        throw new bad_message_error_1.BadMessageError('bad signature');
    }
    return maybeRelayEventMessage;
}
exports.checkRelayEventMessage = checkRelayEventMessage;
