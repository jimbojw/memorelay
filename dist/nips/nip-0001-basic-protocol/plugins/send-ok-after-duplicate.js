"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send OK after duplicate event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOKAfterDuplicate = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const duplicate_event_message_event_1 = require("../events/duplicate-event-message-event");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
/**
 * After a DuplicateEventMessageEvent, send an OutgoingOKMessageEvent.
 * @param hub Event hub for inter-component communication.
 * @emits OutgoingOKMessageEvent
 */
function sendOKAfterDuplicate(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, (memorelayClientCreatedEvent) => {
        const { memorelayClient } = memorelayClientCreatedEvent.details;
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(duplicate_event_message_event_1.DuplicateEventMessageEvent, (duplicateEventMessageEvent) => {
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
        }));
    });
}
exports.sendOKAfterDuplicate = sendOKAfterDuplicate;
