"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send OK message after event is added to the database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOKAfterDatabaseAdd = void 0;
const did_add_event_to_database_event_1 = require("../events/did-add-event-to-database-event");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
/**
 * After a DidAddEventToDatabaseEvent, send an OutgoingOKMessageEvent.
 * @param hub Event hub for inter-component communication.
 * @emits OutgoingOKMessageEvent
 */
function sendOKAfterDatabaseAdd(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, (memorelayClientCreatedEvent) => {
        const { memorelayClient } = memorelayClientCreatedEvent.details;
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(did_add_event_to_database_event_1.DidAddEventToDatabaseEvent, (didAddEventToDatabaseEvent) => {
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
        }));
    });
}
exports.sendOKAfterDatabaseAdd = sendOKAfterDatabaseAdd;
