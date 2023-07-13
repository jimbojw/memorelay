"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies a relay NOTICE message on its way out to the client.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutgoingNoticeMessageEvent = exports.OUTGOING_NOTICE_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.OUTGOING_NOTICE_MESSAGE_EVENT_TYPE = 'outgoing-notice-message';
/**
 * Event emitted when a NOTICE message is on its way out to the connected
 * client. The default handler for this event will create an
 * OutgoingGenericMessageEvent linked to it.
 */
class OutgoingNoticeMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.OUTGOING_NOTICE_MESSAGE_EVENT_TYPE, details, options);
    }
}
OutgoingNoticeMessageEvent.type = exports.OUTGOING_NOTICE_MESSAGE_EVENT_TYPE;
exports.OutgoingNoticeMessageEvent = OutgoingNoticeMessageEvent;
