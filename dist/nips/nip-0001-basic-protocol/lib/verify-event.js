"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function to verify a Nostr event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEvent = void 0;
const nostr_tools_1 = require("nostr-tools");
const bad_event_error_1 = require("../errors/bad-event-error");
/**
 * Verify that an object is a valid Nostr event and has a verified signature.
 * @throws BadEventError if any checks fail.
 */
function verifyEvent(event) {
    if (!(0, nostr_tools_1.validateEvent)(event)) {
        throw new bad_event_error_1.BadEventError('event invalid');
    }
    if (!event.sig) {
        throw new bad_event_error_1.BadEventError('event signature missing');
    }
    if (!(0, nostr_tools_1.verifySignature)(event)) {
        throw new bad_event_error_1.BadEventError('bad signature');
    }
}
exports.verifyEvent = verifyEvent;
