"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Parse an incoming Buffer as a generic Nostr message.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferToGenericMessage = void 0;
const bad_message_error_1 = require("../errors/bad-message-error");
const check_generic_message_1 = require("./check-generic-message");
/**
 * Parse a payload data buffer as a generic message.
 * @param payloadRawData Buffer of raw data, typically from a WebSocket.
 * @returns Parsed generic message.
 * @throws BadMessageError if the payload is unparseable or fails to conform to
 * the structure of a Nostr message.
 */
function bufferToGenericMessage(payloadRawData) {
    const payloadString = payloadRawData.toString('utf-8');
    let payloadJson;
    try {
        payloadJson = JSON.parse(payloadString);
    }
    catch (err) {
        throw new bad_message_error_1.BadMessageError('unparseable message');
    }
    return (0, check_generic_message_1.checkGenericMessage)(payloadJson);
}
exports.bufferToGenericMessage = bufferToGenericMessage;
