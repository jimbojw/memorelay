"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Generalize outgoing OK messages as generic.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalizeOutgoingOKMessage = void 0;
const outgoing_generic_message_event_1 = require("../../nip-0001-basic-protocol/events/outgoing-generic-message-event");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
/**
 * After an OutgoingOKMessage, emit an OutgoingGeneralMessageEvent.
 * @param memorelayClient The client to plug into.
 * @returns Handler.
 * @emits OutgoingGeneralMessageEvent
 */
function generalizeOutgoingOKMessage(memorelayClient) {
    return memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, (outgoingGenericMessageEvent) => {
        if (outgoingGenericMessageEvent.defaultPrevented) {
            return; // Preempted by another listener.
        }
        queueMicrotask(() => {
            memorelayClient.emitEvent(new outgoing_generic_message_event_1.OutgoingGenericMessageEvent({
                genericMessage: outgoingGenericMessageEvent.details.okMessage,
            }, {
                parentEvent: outgoingGenericMessageEvent,
                targetEmitter: memorelayClient,
            }));
        });
    });
}
exports.generalizeOutgoingOKMessage = generalizeOutgoingOKMessage;
