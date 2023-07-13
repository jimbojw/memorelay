"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for parsing incoming WebSocket message
 * payloads as generic JSON client messages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIncomingJsonMessages = void 0;
const incoming_generic_message_event_1 = require("../events/incoming-generic-message-event");
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const web_socket_message_event_1 = require("../../../core/events/web-socket-message-event");
const buffer_to_generic_message_1 = require("../lib/buffer-to-generic-message");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
const bad_message_error_event_1 = require("../events/bad-message-error-event");
/**
 * Memorelay plugin for parsing incoming WebSocket 'message' payload buffers as
 * JSON-encoded generic Nostr messages.
 *
 * A generic Nostr message is an array whose first element is a string
 * indicating which kind of message it is.  Remaining array elements depend on
 * the type of message and other factors.
 * @param hub Event hub for inter-component communication.
 * @event IncomingGenericMessageEvent When a payload buffer could be parsed.
 * @event BadMessageError When a message payload buffer could not be parsed.
 * @returns Handler for disconnection.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function parseIncomingJsonMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, handleClientCreated);
    function handleClientCreated(memorelayClientCreatedEvent) {
        const { memorelayClient } = memorelayClientCreatedEvent.details;
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(web_socket_message_event_1.WebSocketMessageEvent, (webSocketMessageEvent) => {
            if (webSocketMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
            }
            webSocketMessageEvent.preventDefault();
            queueMicrotask(() => {
                const { data } = webSocketMessageEvent.details;
                const buffer = Array.isArray(data)
                    ? Buffer.concat(data)
                    : data;
                const eventOptions = {
                    parentEvent: webSocketMessageEvent,
                    targetEmitter: memorelayClient,
                };
                try {
                    const genericMessage = (0, buffer_to_generic_message_1.bufferToGenericMessage)(buffer);
                    memorelayClient.emitEvent(new incoming_generic_message_event_1.IncomingGenericMessageEvent({ genericMessage }, eventOptions));
                }
                catch (error) {
                    const badMessageError = error;
                    memorelayClient.emitEvent(new bad_message_error_event_1.BadMessageErrorEvent({ badMessageError, badMessage: buffer }, eventOptions));
                }
            });
        }));
    }
}
exports.parseIncomingJsonMessages = parseIncomingJsonMessages;
