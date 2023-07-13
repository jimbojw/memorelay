"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin to implement NIP-09 Event Deletion.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventDeletion = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
const clear_handlers_1 = require("../../../core/lib/clear-handlers");
const relay_information_document_event_1 = require("../../nip-0011-relay-information-document/events/relay-information-document-event");
const event_deletion_database_1 = require("../lib/event-deletion-database");
const add_incoming_events_to_database_1 = require("./add-incoming-events-to-database");
const filter_incoming_events_1 = require("./filter-incoming-events");
const filter_outgoing_events_1 = require("./filter-outgoing-events");
/**
 * Attach handlers to implement NIP-09 Event Deletion.
 * @param hub Event hub, often a Memorelay instance.
 * @returns Handler for disconnection.
 */
function eventDeletion(hub) {
    const eventDeletionDatabase = new event_deletion_database_1.EventDeletionDatabase();
    const handlers = [];
    const disconnect = (0, clear_handlers_1.clearHandlers)(handlers);
    handlers.push(
    // Signal support for NIP-09 in response to a NIP-11 relay info doc request.
    hub.onEvent(relay_information_document_event_1.RelayInformationDocumentEvent, (relayInformationDocumentEvent) => {
        const { relayInformationDocument } = relayInformationDocumentEvent.details;
        if (!relayInformationDocument.supported_nips) {
            relayInformationDocument.supported_nips = [];
        }
        relayInformationDocument.supported_nips.push(9);
    }), 
    // Attach additional handlers to each created client.
    hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, (0, add_incoming_events_to_database_1.addIncomingEventsToDatabase)(eventDeletionDatabase, memorelayClient), (0, filter_incoming_events_1.filterIncomingEvents)(eventDeletionDatabase, memorelayClient), (0, filter_outgoing_events_1.filterOutgoingEvents)(eventDeletionDatabase, memorelayClient));
    }));
    return { disconnect };
}
exports.eventDeletion = eventDeletion;
