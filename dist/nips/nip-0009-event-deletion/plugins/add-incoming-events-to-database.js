"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Add incoming events to the event deletion database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addIncomingEventsToDatabase = void 0;
const incoming_event_message_event_1 = require("../../nip-0001-basic-protocol/events/incoming-event-message-event");
/**
 * Add incoming events to the database.
 * @param eventDeletionDatabase Event deletion database.
 * @param memorelayClient Client that may be sending or receiving events.
 * @returns Handler for disconnection.
 */
function addIncomingEventsToDatabase(eventDeletionDatabase, memorelayClient) {
    return memorelayClient.onEvent(incoming_event_message_event_1.IncomingEventMessageEvent, (incomingEventMessageEvent) => {
        if (incomingEventMessageEvent.defaultPrevented) {
            return; // Preempted by another listener.
        }
        eventDeletionDatabase.addEvent(incomingEventMessageEvent.details.clientEventMessage[1]);
    });
}
exports.addIncomingEventsToDatabase = addIncomingEventsToDatabase;
