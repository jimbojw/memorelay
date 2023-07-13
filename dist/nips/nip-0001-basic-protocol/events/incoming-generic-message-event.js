"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming generic Nostr event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingGenericMessageEvent = exports.INCOMING_GENERIC_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.INCOMING_GENERIC_MESSAGE_EVENT_TYPE = 'incoming-generic-message';
/**
 * Event emitted when a MemorelayClient has received a properly formed,
 * incoming, gerenic Nostr message. Generally this will be in response to a
 * previously received WebSocket 'message' event.
 */
class IncomingGenericMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.INCOMING_GENERIC_MESSAGE_EVENT_TYPE, details, options);
    }
}
IncomingGenericMessageEvent.type = exports.INCOMING_GENERIC_MESSAGE_EVENT_TYPE;
exports.IncomingGenericMessageEvent = IncomingGenericMessageEvent;
