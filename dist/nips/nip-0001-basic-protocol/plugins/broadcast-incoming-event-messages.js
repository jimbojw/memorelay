"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for broadcasting an incoming EVENT
 * message from one client to others.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastIncomingEventMessages = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const incoming_event_message_event_1 = require("../events/incoming-event-message-event");
const broadcast_event_message_event_1 = require("../events/broadcast-event-message-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
/**
 * Memorelay plugin for broadcasting incoming EVENT messages from one client to
 * all other connected clients.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function broadcastIncomingEventMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(incoming_event_message_event_1.IncomingEventMessageEvent, (incomingEventMessageEvent) => {
            if (incomingEventMessageEvent.defaultPrevented) {
                return; // Preempted by another listener.
            }
            queueMicrotask(() => {
                hub.emitEvent(new broadcast_event_message_event_1.BroadcastEventMessageEvent({
                    clientEventMessage: incomingEventMessageEvent.details.clientEventMessage,
                    memorelayClient,
                }, { parentEvent: incomingEventMessageEvent, targetEmitter: hub }));
            });
        }));
    });
}
exports.broadcastIncomingEventMessages = broadcastIncomingEventMessages;
