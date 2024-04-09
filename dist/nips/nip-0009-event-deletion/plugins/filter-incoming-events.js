"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Filter incoming events so that known deleted events make it no
 * further.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterIncomingEvents = void 0;
const incoming_event_message_event_1 = require("../../nip-0001-basic-protocol/events/incoming-event-message-event");
const did_add_event_to_database_event_1 = require("../../nip-0001-basic-protocol/events/did-add-event-to-database-event");
/**
 * Filter incoming event messages so that known deleted events make it no
 * further into the flow.
 * @param eventDeletionDatabase Event deletion database.
 * @param memorelayClient Client that may be sending or receiving events.
 * @returns Handler for disconnection.
 */
function filterIncomingEvents(eventDeletionDatabase, memorelayClient) {
    return memorelayClient.onEvent(incoming_event_message_event_1.IncomingEventMessageEvent, (incomingEventMessageEvent) => {
        if (incomingEventMessageEvent.defaultPrevented) {
            return; // Preempted by another listener.
        }
        const clientEventMessage = incomingEventMessageEvent.details
            .clientEventMessage;
        const incomingEvent = clientEventMessage[1];
        if (eventDeletionDatabase.isDeleted(incomingEvent.id)) {
            incomingEventMessageEvent.preventDefault();
            // Since the incoming event is considered handled, we emit a synthetic
            // DidAddEventToDatabaseEvent to trigger downstream outgoing OK event.
            const didAddEventToDatabaseEvent = new did_add_event_to_database_event_1.DidAddEventToDatabaseEvent({
                event: clientEventMessage[1],
            });
            queueMicrotask(() => {
                memorelayClient.emitEvent(didAddEventToDatabaseEvent);
            });
        }
    });
}
exports.filterIncomingEvents = filterIncomingEvents;
