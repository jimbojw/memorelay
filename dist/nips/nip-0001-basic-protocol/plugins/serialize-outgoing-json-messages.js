"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for serializing outgoing generic messages
 * as JSON and sending to the WebSocket.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeOutgoingJsonMessages = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const outgoing_generic_message_event_1 = require("../events/outgoing-generic-message-event");
const object_to_json_buffer_1 = require("../lib/object-to-json-buffer");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
const web_socket_send_event_1 = require("../../../core/events/web-socket-send-event");
/**
 * Memorelay core plugin for serializing generic, outgoing Nostr messages as
 * JSON and sending them to the WebSocket.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function serializeOutgoingJsonMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, (memorelayClientCreatedEvent) => {
        const { memorelayClient } = memorelayClientCreatedEvent.details;
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(outgoing_generic_message_event_1.OutgoingGenericMessageEvent, (outgoingGenericMessage) => {
            if (outgoingGenericMessage.defaultPrevented) {
                return; // Preempted by another handler.
            }
            outgoingGenericMessage.preventDefault();
            const { genericMessage } = outgoingGenericMessage.details;
            const buffer = (0, object_to_json_buffer_1.objectToJsonBuffer)(genericMessage);
            queueMicrotask(() => {
                memorelayClient.emitEvent(new web_socket_send_event_1.WebSocketSendEvent({ buffer }, {
                    parentEvent: outgoingGenericMessage,
                    targetEmitter: memorelayClient,
                }));
            });
        }));
    });
}
exports.serializeOutgoingJsonMessages = serializeOutgoingJsonMessages;
