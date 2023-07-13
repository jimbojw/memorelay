"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies an OK message on its way out to the client.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutgoingOKMessageEvent = exports.OUTGOING_OK_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.OUTGOING_OK_MESSAGE_EVENT_TYPE = 'outgoing-ok-message';
/**
 * Event emitted when an OK Command Result message is on its way out to the
 * connected WebSocket. The default handler for this event will generalize this
 * to a new OutgoingGenericMessageEvent.
 */
class OutgoingOKMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.OUTGOING_OK_MESSAGE_EVENT_TYPE, details, options);
    }
}
OutgoingOKMessageEvent.type = exports.OUTGOING_OK_MESSAGE_EVENT_TYPE;
exports.OutgoingOKMessageEvent = OutgoingOKMessageEvent;
