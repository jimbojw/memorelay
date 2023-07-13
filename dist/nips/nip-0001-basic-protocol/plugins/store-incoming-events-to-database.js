"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin to store incoming events to the database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeIncomingEventsToDatabase = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
const will_add_event_to_database_event_1 = require("../events/will-add-event-to-database-event");
const did_add_event_to_database_event_1 = require("../events/did-add-event-to-database-event");
const incoming_event_message_event_1 = require("../events/incoming-event-message-event");
/**
 * Memorelay plugin for storing incoming events.
 * @param eventsDatabase Shared database of events.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function storeIncomingEventsToDatabase(eventsDatabase) {
    return (hub) => {
        return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
            (0, auto_disconnect_1.autoDisconnect)(memorelayClient, 
            // Upgrade incoming message event to a WillAddEventToDatabaseEvent.
            memorelayClient.onEvent(incoming_event_message_event_1.IncomingEventMessageEvent, (incomingEventMessageEvent) => {
                if (incomingEventMessageEvent.defaultPrevented) {
                    return; // Preempted by another listener.
                }
                const event = incomingEventMessageEvent.details.clientEventMessage[1];
                queueMicrotask(() => {
                    if (!eventsDatabase.hasEvent(event.id)) {
                        memorelayClient.emitEvent(new will_add_event_to_database_event_1.WillAddEventToDatabaseEvent({ event }, {
                            parentEvent: incomingEventMessageEvent,
                            targetEmitter: memorelayClient,
                        }));
                    }
                });
            }), 
            // Add event to database.
            memorelayClient.onEvent(will_add_event_to_database_event_1.WillAddEventToDatabaseEvent, (willAddEventToDatabaseEvent) => {
                if (willAddEventToDatabaseEvent.defaultPrevented) {
                    return; // Preempted by another listener.
                }
                willAddEventToDatabaseEvent.preventDefault();
                const { event } = willAddEventToDatabaseEvent.details;
                if (!eventsDatabase.hasEvent(event.id)) {
                    eventsDatabase.addEvent(event);
                    queueMicrotask(() => {
                        memorelayClient.emitEvent(new did_add_event_to_database_event_1.DidAddEventToDatabaseEvent({ event }, {
                            parentEvent: willAddEventToDatabaseEvent,
                            targetEmitter: memorelayClient,
                        }));
                    });
                }
            }));
        });
    };
}
exports.storeIncomingEventsToDatabase = storeIncomingEventsToDatabase;
