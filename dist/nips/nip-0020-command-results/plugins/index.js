"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin to implement NIP-20 Command Results.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandResults = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
const clear_handlers_1 = require("../../../core/lib/clear-handlers");
const relay_information_document_event_1 = require("../../nip-0011-relay-information-document/events/relay-information-document-event");
const generalize_outgoing_ok_messages_1 = require("./generalize-outgoing-ok-messages");
const send_ok_after_bad_event_messages_1 = require("./send-ok-after-bad-event-messages");
const send_ok_after_database_add_1 = require("./send-ok-after-database-add");
const send_ok_after_duplicate_1 = require("./send-ok-after-duplicate");
/**
 * Given an event emitter hub (presumed to be a Memorelay instance), attach
 * handlers to implement NIP-20.
 * @param hub Event hub, often a Memorelay instance.
 * @returns Handler for disconnection.
 */
function commandResults(hub) {
    const handlers = [];
    const disconnect = (0, clear_handlers_1.clearHandlers)(handlers);
    handlers.push(
    // Signal support for NIP-20 in response to a NIP-11 relay info doc request.
    hub.onEvent(relay_information_document_event_1.RelayInformationDocumentEvent, (relayInformationDocumentEvent) => {
        const { relayInformationDocument } = relayInformationDocumentEvent.details;
        if (!relayInformationDocument.supported_nips) {
            relayInformationDocument.supported_nips = [];
        }
        relayInformationDocument.supported_nips.push(20);
    }), 
    // Attach NIP-20 OK response handlers to each created client.
    hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, (0, send_ok_after_database_add_1.sendOKAfterDatabaseAdd)(memorelayClient), (0, send_ok_after_duplicate_1.sendOKAfterDuplicate)(memorelayClient), (0, send_ok_after_bad_event_messages_1.sendOKAfterBadEvent)(memorelayClient), (0, generalize_outgoing_ok_messages_1.generalizeOutgoingOKMessage)(memorelayClient));
    }));
    return { disconnect };
}
exports.commandResults = commandResults;
