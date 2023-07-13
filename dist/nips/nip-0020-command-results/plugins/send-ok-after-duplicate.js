"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin to implement NIP-20 Command Results.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOKAfterDuplicate = void 0;
const duplicate_event_message_event_1 = require("../../nip-0001-basic-protocol/events/duplicate-event-message-event");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
/**
 * After a DuplicateEventMessageEvent, send an OutgoingOKMessageEvent.
 * @param memorelayClient The client to plug into.
 * @returns Handler.
 * @emits OutgoingOKMessageEvent
 */
function sendOKAfterDuplicate(memorelayClient) {
    return memorelayClient.onEvent(duplicate_event_message_event_1.DuplicateEventMessageEvent, (duplicateEventMessageEvent) => {
        if (duplicateEventMessageEvent.defaultPrevented) {
            return; // Preempted by another listener.
        }
        const { event } = duplicateEventMessageEvent.details;
        queueMicrotask(() => {
            memorelayClient.emitEvent(new outgoing_ok_message_event_1.OutgoingOKMessageEvent({ okMessage: ['OK', event.id, true, 'duplicate:'] }, {
                parentEvent: duplicateEventMessageEvent,
                targetEmitter: memorelayClient,
            }));
        });
    });
}
exports.sendOKAfterDuplicate = sendOKAfterDuplicate;
