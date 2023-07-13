"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function for signing an event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.signEvent = void 0;
const nostr_tools_1 = require("nostr-tools");
/**
 * Given an unsigned event, compute and set its `id` and `sig` fields and return
 * the object.
 * @param unsignedEvent The event to sign.
 * @param secretKey The secret key to sign with.
 * @returns The same event, but signed.
 */
function signEvent(unsignedEvent, secretKey) {
    const identifiedEvent = unsignedEvent;
    identifiedEvent.id = (0, nostr_tools_1.getEventHash)(unsignedEvent);
    const signedEvent = identifiedEvent;
    signedEvent.sig = (0, nostr_tools_1.signEvent)(identifiedEvent, secretKey);
    return signedEvent;
}
exports.signEvent = signEvent;
