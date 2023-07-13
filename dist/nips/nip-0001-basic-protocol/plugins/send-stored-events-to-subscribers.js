"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for sending stored events to subscribers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStoredEventsToSubscribers = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const incoming_req_message_event_1 = require("../events/incoming-req-message-event");
const outgoing_event_message_event_1 = require("../events/outgoing-event-message-event");
const outgoing_eose_message_event_1 = require("../events/outgoing-eose-message-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
/**
 * Memorelay plugin for sending stored events to incoming subscribers. Note that
 * this plugin does not handle later, live events. It only handles sending
 * previously stored events.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function sendStoredEventsToSubscribers(eventsDatabase) {
    return (hub) => {
        return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
            (0, auto_disconnect_1.autoDisconnect)(memorelayClient, 
            // Subscribe on incoming REQ event.
            memorelayClient.onEvent(incoming_req_message_event_1.IncomingReqMessageEvent, (incomingReqMessageEvent) => {
                if (incomingReqMessageEvent.originatorTag ===
                    sendStoredEventsToSubscribers) {
                    return; // Ignore self-emitted events.
                }
                if (incomingReqMessageEvent.defaultPrevented) {
                    return; // Preempted by another handler.
                }
                incomingReqMessageEvent.preventDefault();
                const [, subscriptionId, ...filters] = incomingReqMessageEvent.details.reqMessage;
                const matchingEvents = eventsDatabase.matchFilters(filters);
                for (const matchingEvent of matchingEvents) {
                    queueMicrotask(() => {
                        memorelayClient.emitEvent(new outgoing_event_message_event_1.OutgoingEventMessageEvent({
                            relayEventMessage: [
                                'EVENT',
                                subscriptionId,
                                matchingEvent,
                            ],
                        }, {
                            parentEvent: incomingReqMessageEvent,
                            targetEmitter: memorelayClient,
                        }));
                    });
                }
                queueMicrotask(() => {
                    memorelayClient.emitEvent(new outgoing_eose_message_event_1.OutgoingEOSEMessageEvent({
                        relayEOSEMessage: ['EOSE', subscriptionId],
                    }, {
                        parentEvent: incomingReqMessageEvent,
                        targetEmitter: memorelayClient,
                    }));
                });
                queueMicrotask(() => {
                    memorelayClient.emitEvent(new incoming_req_message_event_1.IncomingReqMessageEvent(incomingReqMessageEvent.details, {
                        originatorTag: sendStoredEventsToSubscribers,
                        parentEvent: incomingReqMessageEvent,
                        targetEmitter: memorelayClient,
                    }));
                });
            }));
        });
    };
}
exports.sendStoredEventsToSubscribers = sendStoredEventsToSubscribers;
