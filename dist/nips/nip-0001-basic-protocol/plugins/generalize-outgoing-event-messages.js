"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for re-casting outgoing EVENT messages as
 * generic messages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalizeOutgoingEventMessages = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const outgoing_event_message_event_1 = require("../events/outgoing-event-message-event");
const outgoing_generic_message_event_1 = require("../events/outgoing-generic-message-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
/**
 * Memorelay plugin for re-casting outgoing EVENT messages as generic messages.
 * @param hub Event hub for inter-component communication.
 * @event OutgoingGenericMessageEvent
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function generalizeOutgoingEventMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, (memorelayClientCreatedEvent) => {
        const { memorelayClient } = memorelayClientCreatedEvent.details;
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(outgoing_event_message_event_1.OutgoingEventMessageEvent, (outgoingEventMessageEvent) => {
            if (outgoingEventMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
            }
            outgoingEventMessageEvent.preventDefault();
            queueMicrotask(() => {
                memorelayClient.emitEvent(new outgoing_generic_message_event_1.OutgoingGenericMessageEvent({
                    genericMessage: outgoingEventMessageEvent.details.relayEventMessage,
                }, {
                    parentEvent: outgoingEventMessageEvent,
                    targetEmitter: memorelayClient,
                }));
            });
        }));
    });
}
exports.generalizeOutgoingEventMessages = generalizeOutgoingEventMessages;
