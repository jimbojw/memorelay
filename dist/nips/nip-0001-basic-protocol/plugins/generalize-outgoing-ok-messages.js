"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for re-casting outgoing OK messages
 * as generic messages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalizeOutgoingOKMessages = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const outgoing_generic_message_event_1 = require("../events/outgoing-generic-message-event");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
/**
 * Memorelay plugin for re-casting outgoing OK messages as generic messages.
 * @param hub Event hub for inter-component communication.
 * @event OutgoingGenericMessageEvent
 */
function generalizeOutgoingOKMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, (memorelayClientCreatedEvent) => {
        const { memorelayClient } = memorelayClientCreatedEvent.details;
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, (outgoingOKMessageEvent) => {
            if (outgoingOKMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
            }
            outgoingOKMessageEvent.preventDefault();
            queueMicrotask(() => {
                memorelayClient.emitEvent(new outgoing_generic_message_event_1.OutgoingGenericMessageEvent({
                    genericMessage: outgoingOKMessageEvent.details.okMessage,
                }, {
                    parentEvent: outgoingOKMessageEvent,
                    targetEmitter: memorelayClient,
                }));
            });
        }));
    });
}
exports.generalizeOutgoingOKMessages = generalizeOutgoingOKMessages;
