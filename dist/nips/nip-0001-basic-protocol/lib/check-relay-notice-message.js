"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr relay NOTICE message
 * syntax.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRelayNoticeMessage = void 0;
const bad_message_error_1 = require("../errors/bad-message-error");
/**
 * Given a message, check whether it conforms to the outgoing relay NOTICE
 * message type.
 * @param maybeRelayNoticeMessage Potential RelayNoticeMessage to check.
 * @returns The same message, but cast as RelayNoticeMessage.
 * @throws BadMessageError if the message is malformed.
 */
function checkRelayNoticeMessage(maybeRelayNoticeMessage) {
    if (maybeRelayNoticeMessage.length < 2) {
        throw new bad_message_error_1.BadMessageError('notice message missing');
    }
    if (typeof maybeRelayNoticeMessage[1] !== 'string') {
        throw new bad_message_error_1.BadMessageError('notice message type mismatch');
    }
    if (maybeRelayNoticeMessage.length > 2) {
        throw new bad_message_error_1.BadMessageError('extra elements detected');
    }
    return maybeRelayNoticeMessage;
}
exports.checkRelayNoticeMessage = checkRelayNoticeMessage;
