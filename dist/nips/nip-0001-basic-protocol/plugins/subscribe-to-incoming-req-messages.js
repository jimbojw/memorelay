"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for subscribing to REQ messages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeToIncomingReqMessages = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const incoming_req_message_event_1 = require("../events/incoming-req-message-event");
const nostr_tools_1 = require("nostr-tools");
const incoming_close_message_event_1 = require("../events/incoming-close-message-event");
const broadcast_event_message_event_1 = require("../events/broadcast-event-message-event");
const memorelay_client_disconnect_event_1 = require("../../../core/events/memorelay-client-disconnect-event");
const outgoing_event_message_event_1 = require("../events/outgoing-event-message-event");
const subscription_not_found_event_1 = require("../events/subscription-not-found-event");
const disconnect_all_1 = require("../../../core/lib/disconnect-all");
/**
 * Memorelay core plugin for subscribing to REQ messages. Note that this plugin
 * does not handle sending stored events. It only handles the subscriptions for
 * new events.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function subscribeToIncomingReqMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
        const subscriptions = new Map();
        const handlers = [];
        // Since every new client will add a listener on the hub, and there could
        // be many clients, we increment the hub's maxEventListeners.
        hub.maxEventListeners += 1;
        // Then, on disconnect, in addition to clearing the handlers, we undo the
        // addition to the maxEventListeners value.
        function disconnect() {
            (0, disconnect_all_1.disconnectAll)(handlers);
            hub.maxEventListeners -= 1; // Restore previous maxEventListeners.
        }
        handlers.push(
        // Subscribe on incoming REQ event.
        memorelayClient.onEvent(incoming_req_message_event_1.IncomingReqMessageEvent, handleReqMessage), 
        // Cancel subscription on CLOSE event.
        memorelayClient.onEvent(incoming_close_message_event_1.IncomingCloseMessageEvent, handleCloseMessage), 
        // Listen for broadcasted EVENTs from other connected clients.
        hub.onEvent(broadcast_event_message_event_1.BroadcastEventMessageEvent, handleBroadcastEventMessage), 
        // Clean up on disconnect.
        memorelayClient.onEvent(memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent, disconnect));
        function handleReqMessage(incomingReqMessageEvent) {
            if (incomingReqMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
            }
            const [, subscriptionId, ...filters] = incomingReqMessageEvent.details.reqMessage;
            subscriptions.set(subscriptionId, filters);
        }
        function handleCloseMessage(incomingCloseMessageEvent) {
            if (incomingCloseMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
            }
            const [, subscriptionId] = incomingCloseMessageEvent.details
                .closeMessage;
            if (!subscriptions.has(subscriptionId)) {
                queueMicrotask(() => {
                    memorelayClient.emitEvent(new subscription_not_found_event_1.SubscriptionNotFoundEvent({ subscriptionId }, {
                        parentEvent: incomingCloseMessageEvent,
                        targetEmitter: memorelayClient,
                    }));
                });
                return;
            }
            subscriptions.delete(subscriptionId);
        }
        function handleBroadcastEventMessage(broadcastEventMessageEvent) {
            const broadcastDetails = broadcastEventMessageEvent.details;
            if (broadcastDetails.memorelayClient === memorelayClient) {
                return; // Nothing to do. This client originated this broadcast event.
            }
            const [, broadcastEvent] = broadcastDetails.clientEventMessage;
            for (const [subscriptionId, filters] of subscriptions.entries()) {
                if (!filters.length || (0, nostr_tools_1.matchFilters)(filters, broadcastEvent)) {
                    queueMicrotask(() => {
                        memorelayClient.emitEvent(new outgoing_event_message_event_1.OutgoingEventMessageEvent({
                            relayEventMessage: [
                                'EVENT',
                                subscriptionId,
                                broadcastEvent,
                            ],
                        }, {
                            parentEvent: broadcastEventMessageEvent,
                            targetEmitter: memorelayClient,
                        }));
                    });
                }
            }
        }
    });
}
exports.subscribeToIncomingReqMessages = subscribeToIncomingReqMessages;
