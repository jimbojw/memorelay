"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for re-casting outgoing EOSE messages as
 * generic messages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalizeOutgoingEOSEMessages = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const outgoing_generic_message_event_1 = require("../events/outgoing-generic-message-event");
const outgoing_eose_message_event_1 = require("../events/outgoing-eose-message-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
/**
 * Memorelay plugin for re-casting outgoing EOSE messages as generic messages.
 * @param hub Event hub for inter-component communication.
 * @event OutgoingGenericMessageEvent
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function generalizeOutgoingEOSEMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, (memorelayClientCreatedEvent) => {
        const { memorelayClient } = memorelayClientCreatedEvent.details;
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(outgoing_eose_message_event_1.OutgoingEOSEMessageEvent, (outgoingEOSEMessageEvent) => {
            if (outgoingEOSEMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
            }
            outgoingEOSEMessageEvent.preventDefault();
            queueMicrotask(() => {
                memorelayClient.emitEvent(new outgoing_generic_message_event_1.OutgoingGenericMessageEvent({
                    genericMessage: outgoingEOSEMessageEvent.details.relayEOSEMessage,
                }, {
                    parentEvent: outgoingEOSEMessageEvent,
                    targetEmitter: memorelayClient,
                }));
            });
        }));
    });
}
exports.generalizeOutgoingEOSEMessages = generalizeOutgoingEOSEMessages;
