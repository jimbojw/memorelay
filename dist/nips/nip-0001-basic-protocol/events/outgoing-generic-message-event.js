"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies a message on its way out to the client.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutgoingGenericMessageEvent = exports.OUTGOING_GENERIC_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.OUTGOING_GENERIC_MESSAGE_EVENT_TYPE = 'outgoing-generic-message';
/**
 * Event emitted when a message is on its way out to the connected WebSocket.
 * The default handler for this event will serialize the message as JSON, then
 * push it down the wire.
 */
class OutgoingGenericMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.OUTGOING_GENERIC_MESSAGE_EVENT_TYPE, details, options);
    }
}
OutgoingGenericMessageEvent.type = exports.OUTGOING_GENERIC_MESSAGE_EVENT_TYPE;
exports.OutgoingGenericMessageEvent = OutgoingGenericMessageEvent;
