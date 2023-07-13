"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming CLOSE Nostr event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingCloseMessageEvent = exports.INCOMING_CLOSE_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.INCOMING_CLOSE_MESSAGE_EVENT_TYPE = 'incoming-close-message';
/**
 * Event emitted when a MemorelayClient has received a properly formed,
 * incoming, REQ Nostr message.
 */
class IncomingCloseMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.INCOMING_CLOSE_MESSAGE_EVENT_TYPE, details, options);
    }
}
IncomingCloseMessageEvent.type = exports.INCOMING_CLOSE_MESSAGE_EVENT_TYPE;
exports.IncomingCloseMessageEvent = IncomingCloseMessageEvent;
