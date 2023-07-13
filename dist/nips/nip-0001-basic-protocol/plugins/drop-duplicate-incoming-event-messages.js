"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin to drop duplicate incoming EVENT messages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropDuplicateIncomingEventMessages = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const incoming_event_message_event_1 = require("../events/incoming-event-message-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
const duplicate_event_message_event_1 = require("../events/duplicate-event-message-event");
/**
 * Memorelay plugin to drop incoming EVENT messages if it has been seen before.
 * @param hub Event hub for inter-component communication.
 */
function dropDuplicateIncomingEventMessages(hub) {
    const seenEventIds = {};
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(incoming_event_message_event_1.IncomingEventMessageEvent, (incomingEventMessageEvent) => {
            if (incomingEventMessageEvent.defaultPrevented) {
                return; // Preempted by another listener.
            }
            const [, { id: incomingEventId }] = incomingEventMessageEvent.details.clientEventMessage;
            if (incomingEventId in seenEventIds) {
                incomingEventMessageEvent.preventDefault();
                queueMicrotask(() => {
                    memorelayClient.emitEvent(new duplicate_event_message_event_1.DuplicateEventMessageEvent({
                        event: incomingEventMessageEvent.details.clientEventMessage[1],
                    }, {
                        parentEvent: incomingEventMessageEvent,
                        targetEmitter: memorelayClient,
                    }));
                });
                return;
            }
            seenEventIds[incomingEventId] = true;
        }));
    });
}
exports.dropDuplicateIncomingEventMessages = dropDuplicateIncomingEventMessages;
