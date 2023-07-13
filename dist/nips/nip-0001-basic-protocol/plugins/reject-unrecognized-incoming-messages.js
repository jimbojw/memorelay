"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for rejecting incoming messages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectUnrecognizedIncomingMessages = void 0;
const bad_message_error_1 = require("../errors/bad-message-error");
const incoming_generic_message_event_1 = require("../events/incoming-generic-message-event");
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
const bad_message_error_event_1 = require("../events/bad-message-error-event");
/**
 * Memorelay plugin which rejects any incoming message by emitting a
 * BadMessageError.
 *
 * This plugin is intended to follow other plugins which identify message types
 * and emit specific incoming events. Note: order is important. If this plugin
 * is incorrectly connected before a plugin that intends to implement an event
 * type, the later will already see defaultPrevented, and a BadMessageError will
 * already be outbound.
 * @param hub Event hub for inter-component communication.
 * @event BadMessageError When an incoming generic message is unrecognized.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function rejectUnrecognizedIncomingMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(incoming_generic_message_event_1.IncomingGenericMessageEvent, (incomingGenericMessageEvent) => {
            if (incomingGenericMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
            }
            incomingGenericMessageEvent.preventDefault();
            queueMicrotask(() => {
                memorelayClient.emitEvent(new bad_message_error_event_1.BadMessageErrorEvent({
                    badMessageError: new bad_message_error_1.BadMessageError('unrecognized message type'),
                    badMessage: incomingGenericMessageEvent.details.genericMessage,
                }, {
                    parentEvent: incomingGenericMessageEvent,
                    targetEmitter: memorelayClient,
                }));
            });
        }));
    });
}
exports.rejectUnrecognizedIncomingMessages = rejectUnrecognizedIncomingMessages;
