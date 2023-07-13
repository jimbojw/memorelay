"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugins for implementing NIP-01.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicProtocol = void 0;
const increase_client_max_event_listeners_1 = require("../../../core/plugins/increase-client-max-event-listeners");
const clear_handlers_1 = require("../../../core/lib/clear-handlers");
const broadcast_incoming_event_messages_1 = require("./broadcast-incoming-event-messages");
const generalize_outgoing_eose_messages_1 = require("./generalize-outgoing-eose-messages");
const generalize_outgoing_event_messages_1 = require("./generalize-outgoing-event-messages");
const generalize_outgoing_notice_messages_1 = require("./generalize-outgoing-notice-messages");
const parse_incoming_json_messages_1 = require("./parse-incoming-json-messages");
const drop_duplicate_incoming_event_messages_1 = require("./drop-duplicate-incoming-event-messages");
const reject_unrecognized_incoming_messages_1 = require("./reject-unrecognized-incoming-messages");
const send_stored_events_to_subscribers_1 = require("./send-stored-events-to-subscribers");
const serialize_outgoing_json_messages_1 = require("./serialize-outgoing-json-messages");
const subscribe_to_incoming_req_messages_1 = require("./subscribe-to-incoming-req-messages");
const validate_incoming_close_messages_1 = require("./validate-incoming-close-messages");
const validate_incoming_event_messages_1 = require("./validate-incoming-event-messages");
const validate_incoming_req_messages_1 = require("./validate-incoming-req-messages");
const send_notice_on_client_error_1 = require("./send-notice-on-client-error");
const events_database_1 = require("../lib/events-database");
const store_incoming_events_to_database_1 = require("./store-incoming-events-to-database");
/**
 * Given an event emitter hub (presumed to be a Memorelay instance), attach all
 * component functionality.
 * @param hub Basic event emitter, often a Memorelay instance.
 * @returns Handler for disconnection.
 */
function basicProtocol(hub) {
    const eventsDatabase = new events_database_1.EventsDatabase();
    const plugins = [
        // Increase max event listeners for clients. This is a heuristic, as is
        // Node's built-in limit of 10 listeners per event type on an EventEmitter.
        // Programmatically increasing the number each time a listener is added
        // would defeat the purpose of the heuristic-based memory leak detection.
        (0, increase_client_max_event_listeners_1.increaseClientMaxEventListeners)(20),
        // Parse incoming WebSocket 'message' buffers as generic Nostr messages.
        parse_incoming_json_messages_1.parseIncomingJsonMessages,
        // Validate and upgrade incoming EVENT, REQ and CLOSE messages.
        validate_incoming_event_messages_1.validateIncomingEventMessages,
        validate_incoming_req_messages_1.validateIncomingReqMessages,
        validate_incoming_close_messages_1.validateIncomingCloseMessages,
        // Reject any message type other than EVENT, REQ and CLOSE.
        reject_unrecognized_incoming_messages_1.rejectUnrecognizedIncomingMessages,
        // Send NOTICE in response to a client error such as a bad message.
        send_notice_on_client_error_1.sendNoticeOnClientError,
        // Drop incoming EVENT messages where the clientEvent has been seen before.
        drop_duplicate_incoming_event_messages_1.dropDuplicateIncomingEventMessages,
        // Broadcast incoming EVENT messages to all other connected clients.
        broadcast_incoming_event_messages_1.broadcastIncomingEventMessages,
        // Store incoming events to the database.
        (0, store_incoming_events_to_database_1.storeIncomingEventsToDatabase)(eventsDatabase),
        // Send stored events to REQ subscribers.
        (0, send_stored_events_to_subscribers_1.sendStoredEventsToSubscribers)(eventsDatabase),
        // Subscribe to incoming REQ messages.
        subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages,
        // Convert outgoing EVENT, EOSE and NOTICE message events to
        // OutgoingGenericMessageEvents.
        generalize_outgoing_event_messages_1.generalizeOutgoingEventMessages,
        generalize_outgoing_eose_messages_1.generalizeOutgoingEOSEMessages,
        generalize_outgoing_notice_messages_1.generalizeOutgoingNoticeMessages,
        // Serialize outgoing generic messages and send to the WebSocket.
        serialize_outgoing_json_messages_1.serializeOutgoingJsonMessages,
    ];
    // Avoid Node's MaxListenersExceededWarning.
    hub.maxEventListeners += plugins.length;
    const handlers = plugins.map((plugin) => plugin(hub));
    return {
        disconnect: () => {
            (0, clear_handlers_1.clearHandlers)(handlers);
            hub.maxEventListeners -= plugins.length; // Restore maxListeners.
        },
    };
}
exports.basicProtocol = basicProtocol;
