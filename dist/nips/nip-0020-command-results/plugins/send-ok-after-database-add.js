"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send OK message after event is added to the database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOKAfterDatabaseAdd = void 0;
const did_add_event_to_database_event_1 = require("../../nip-0001-basic-protocol/events/did-add-event-to-database-event");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
/**
 * After a DidAddEventToDatabaseEvent, send an OutgoingOKMessageEvent.
 * @param memorelayClient The client to plug into.
 * @returns Handler.
 * @emits OutgoingOKMessageEvent
 */
function sendOKAfterDatabaseAdd(memorelayClient) {
    return memorelayClient.onEvent(did_add_event_to_database_event_1.DidAddEventToDatabaseEvent, (didAddEventToDatabaseEvent) => {
        if (didAddEventToDatabaseEvent.defaultPrevented) {
            return; // Preempted by another listener.
        }
        const { event } = didAddEventToDatabaseEvent.details;
        queueMicrotask(() => {
            memorelayClient.emitEvent(new outgoing_ok_message_event_1.OutgoingOKMessageEvent({ okMessage: ['OK', event.id, true, ''] }, {
                parentEvent: didAddEventToDatabaseEvent,
                targetEmitter: memorelayClient,
            }));
        });
    });
}
exports.sendOKAfterDatabaseAdd = sendOKAfterDatabaseAdd;
