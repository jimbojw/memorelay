"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a Nostr message conforms to the incoming client
 * EVENT message type.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkClientEventMessage = void 0;
const nostr_tools_1 = require("nostr-tools");
const bad_message_error_1 = require("../errors/bad-message-error");
/**
 * Given a Nostr message, check whether it conforms to the EVENT message type.
 * @param maybeEventMessage Potential EventMessage to check.
 * @returns The same incoming message, but cast as ClientEventMessage.
 * @throws BadMessageError if the incoming message is malformed.
 */
function checkClientEventMessage(maybeEventMessage) {
    if (maybeEventMessage[0] !== 'EVENT') {
        throw new bad_message_error_1.BadMessageError('wrong message type');
    }
    if (maybeEventMessage.length < 2) {
        throw new bad_message_error_1.BadMessageError('event missing');
    }
    if (maybeEventMessage.length > 2) {
        throw new bad_message_error_1.BadMessageError('extra elements detected');
    }
    const payloadEvent = maybeEventMessage[1];
    if (!(0, nostr_tools_1.validateEvent)(payloadEvent)) {
        throw new bad_message_error_1.BadMessageError('event invalid');
    }
    if (!payloadEvent.sig) {
        throw new bad_message_error_1.BadMessageError('event signature missing');
    }
    if (!(0, nostr_tools_1.verifySignature)(payloadEvent)) {
        throw new bad_message_error_1.BadMessageError('bad signature');
    }
    return maybeEventMessage;
}
exports.checkClientEventMessage = checkClientEventMessage;
