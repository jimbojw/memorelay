"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming EVENT was detected as a duplicate.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateEventMessageEvent = exports.DUPLICATE_EVENT_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.DUPLICATE_EVENT_MESSAGE_EVENT_TYPE = 'duplicate-event-message';
/**
 * Event emitted when an incoming EVENT payload was determined to be a duplicate
 * event.
 */
class DuplicateEventMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.DUPLICATE_EVENT_MESSAGE_EVENT_TYPE, details, options);
    }
}
DuplicateEventMessageEvent.type = exports.DUPLICATE_EVENT_MESSAGE_EVENT_TYPE;
exports.DuplicateEventMessageEvent = DuplicateEventMessageEvent;
