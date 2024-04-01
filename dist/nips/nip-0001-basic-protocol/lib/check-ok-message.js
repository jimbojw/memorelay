"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether an incoming OK message is valid.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOKMessage = void 0;
const bad_message_error_1 = require("../errors/bad-message-error");
/**
 * Check whether a generic Nostr message meets the criteria for an OK Command
 * Results message.
 * @param genericMessage Generic message with 'OK' message type.
 * @returns The same incoming generic message, cast as a RelayOKMessage.
 * @throws BadMessageError if the OK message is malformed.
 */
function checkOKMessage(genericMessage) {
    if (genericMessage.length < 2) {
        throw new bad_message_error_1.BadMessageError('event id missing');
    }
    const eventId = genericMessage[1];
    if (typeof eventId !== 'string') {
        throw new bad_message_error_1.BadMessageError('event id type mismatch');
    }
    if (eventId.length !== 64) {
        throw new bad_message_error_1.BadMessageError('event id malformed');
    }
    if (genericMessage.length < 3) {
        throw new bad_message_error_1.BadMessageError('status missing');
    }
    const status = genericMessage[2];
    if (typeof status !== 'boolean') {
        throw new bad_message_error_1.BadMessageError('status type mismatch');
    }
    if (genericMessage.length < 4) {
        throw new bad_message_error_1.BadMessageError('description missing');
    }
    const description = genericMessage[3];
    if (typeof description !== 'string') {
        throw new bad_message_error_1.BadMessageError('description type mismatch');
    }
    if (description.length) {
        const colonIndex = description.indexOf(':');
        if (colonIndex < 1) {
            throw new bad_message_error_1.BadMessageError('reason missing');
        }
        const reason = description.substring(0, colonIndex).trim();
        if (!reason.length) {
            throw new bad_message_error_1.BadMessageError('reason missing');
        }
        if (reason !== 'duplicate' && reason !== 'deleted') {
            throw new bad_message_error_1.BadMessageError(`unrecognized reason: ${reason}`);
        }
    }
    if (genericMessage.length > 4) {
        throw new bad_message_error_1.BadMessageError('extra elements detected');
    }
    return genericMessage;
}
exports.checkOKMessage = checkOKMessage;
