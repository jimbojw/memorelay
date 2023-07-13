"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Filter outgoing events so that deleted events are not emitted.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterOutgoingEvents = void 0;
const outgoing_event_message_event_1 = require("../../nip-0001-basic-protocol/events/outgoing-event-message-event");
/**
 * Filter outgoing event messages so that deleted events are not emitted.
 * @param eventDeletionDatabase Event deletion database.
 * @param memorelayClient Client that may be sending or receiving events.
 * @returns Handler for disconnection.
 */
function filterOutgoingEvents(eventDeletionDatabase, memorelayClient) {
    return memorelayClient.onEvent(outgoing_event_message_event_1.OutgoingEventMessageEvent, (outgoingEventMessageEvent) => {
        if (outgoingEventMessageEvent.defaultPrevented) {
            return; // Preempted by another listener.
        }
        const relayEventMessage = outgoingEventMessageEvent.details
            .relayEventMessage;
        const outgoingEvent = relayEventMessage[2];
        if (eventDeletionDatabase.isDeleted(outgoingEvent.id)) {
            outgoingEventMessageEvent.preventDefault();
            // TODO(jimbo): Should this emit something?
        }
    });
}
exports.filterOutgoingEvents = filterOutgoingEvents;
