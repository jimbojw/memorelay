"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies a relay EOSE message on its way out to the client.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutgoingEOSEMessageEvent = exports.OUTGOING_EOSE_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.OUTGOING_EOSE_MESSAGE_EVENT_TYPE = 'outgoing-eose-message';
/**
 * Event emitted when an EOSE message is on its way out to the connected
 * client. The default handler for this event will create an
 * OutgoingGenericMessageEvent linked to it.
 */
class OutgoingEOSEMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.OUTGOING_EOSE_MESSAGE_EVENT_TYPE, details, options);
    }
}
OutgoingEOSEMessageEvent.type = exports.OUTGOING_EOSE_MESSAGE_EVENT_TYPE;
exports.OutgoingEOSEMessageEvent = OutgoingEOSEMessageEvent;
