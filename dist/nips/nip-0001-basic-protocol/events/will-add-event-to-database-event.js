"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal that an EVENT will be added to the stored
 * events database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WillAddEventToDatabaseEvent = exports.WILL_ADD_EVENT_TO_DATABASE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.WILL_ADD_EVENT_TO_DATABASE_EVENT_TYPE = 'will-add-event-to-database';
/**
 * Event emitted when an event is about to be added to the database.
 */
class WillAddEventToDatabaseEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.WILL_ADD_EVENT_TO_DATABASE_EVENT_TYPE, details, options);
    }
}
WillAddEventToDatabaseEvent.type = exports.WILL_ADD_EVENT_TO_DATABASE_EVENT_TYPE;
exports.WillAddEventToDatabaseEvent = WillAddEventToDatabaseEvent;
