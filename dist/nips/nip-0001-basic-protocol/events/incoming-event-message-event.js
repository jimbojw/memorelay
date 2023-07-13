"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming generic Nostr event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingEventMessageEvent = exports.INCOMING_EVENT_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.INCOMING_EVENT_MESSAGE_EVENT_TYPE = 'incoming-event-message';
/**
 * Event emitted when a MemorelayClient has received a properly formed,
 * incoming, EVENT Nostr message.
 */
class IncomingEventMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.INCOMING_EVENT_MESSAGE_EVENT_TYPE, details, options);
    }
}
IncomingEventMessageEvent.type = exports.INCOMING_EVENT_MESSAGE_EVENT_TYPE;
exports.IncomingEventMessageEvent = IncomingEventMessageEvent;
