"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal that an EVENT was successfully added to the
 * stored events database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DidAddEventToDatabaseEvent = exports.DID_ADD_EVENT_TO_DATABASE_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.DID_ADD_EVENT_TO_DATABASE_EVENT_TYPE = 'did-add-event-to-database';
/**
 * Event emitted when an event has just been added to the database.
 */
class DidAddEventToDatabaseEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.DID_ADD_EVENT_TO_DATABASE_EVENT_TYPE, details, options);
    }
}
DidAddEventToDatabaseEvent.type = exports.DID_ADD_EVENT_TO_DATABASE_EVENT_TYPE;
exports.DidAddEventToDatabaseEvent = DidAddEventToDatabaseEvent;
