"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether an object conforms to Nostr message structure.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGenericMessage = void 0;
const bad_message_error_1 = require("../errors/bad-message-error");
/**
 * Check whether an unknown object conforms to the basic Nostr structure of a
 * message. If the object does not conform, this function throws a
 * BatMessageError to indicate in what way it failed.
 * @param object The object to check.
 * @returns The tested object, cast as a GenericMessage.
 * @throws BadMessageError if the object is not a message.
 */
function checkGenericMessage(maybeMessage) {
    if (!Array.isArray(maybeMessage)) {
        throw new bad_message_error_1.BadMessageError('message was not an array');
    }
    if (!maybeMessage.length) {
        throw new bad_message_error_1.BadMessageError('message type missing');
    }
    const eventType = maybeMessage[0];
    if (typeof eventType !== 'string') {
        throw new bad_message_error_1.BadMessageError('message type was not a string');
    }
    return maybeMessage;
}
exports.checkGenericMessage = checkGenericMessage;
