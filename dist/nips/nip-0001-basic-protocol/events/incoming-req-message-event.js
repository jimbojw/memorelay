"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming generic Nostr event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingReqMessageEvent = exports.INCOMING_REQ_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.INCOMING_REQ_MESSAGE_EVENT_TYPE = 'incoming-req-message';
/**
 * Event emitted when a MemorelayClient has received a properly formed,
 * incoming, REQ Nostr message.
 */
class IncomingReqMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.INCOMING_REQ_MESSAGE_EVENT_TYPE, details, options);
    }
}
IncomingReqMessageEvent.type = exports.INCOMING_REQ_MESSAGE_EVENT_TYPE;
exports.IncomingReqMessageEvent = IncomingReqMessageEvent;
