"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies a relay EVENT message on its way out to the client.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutgoingEventMessageEvent = exports.OUTGOING_EVENT_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.OUTGOING_EVENT_MESSAGE_EVENT_TYPE = 'outgoing-event-message';
/**
 * Event emitted when a NOTICE message is on its way out to the connected
 * client. The default handler for this event will create an
 * OutgoingGenericMessageEvent linked to it.
 */
class OutgoingEventMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.OUTGOING_EVENT_MESSAGE_EVENT_TYPE, details, options);
    }
}
OutgoingEventMessageEvent.type = exports.OUTGOING_EVENT_MESSAGE_EVENT_TYPE;
exports.OutgoingEventMessageEvent = OutgoingEventMessageEvent;
