"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for validating incoming generic Nostr
 * messages of type 'EVENT'.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIncomingEventMessages = void 0;
const incoming_event_message_event_1 = require("../events/incoming-event-message-event");
const incoming_generic_message_event_1 = require("../events/incoming-generic-message-event");
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const check_client_event_message_1 = require("../lib/check-client-event-message");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
const bad_message_error_event_1 = require("../events/bad-message-error-event");
/**
 * Memorelay core plugin for validating incoming, generic Nostr messages of type
 * 'EVENT'. Incoming generic messages of any other type are ignored.
 * @param hub Event hub for inter-component communication.
 * @event IncomingEventMessageEvent When a generic message is an EVENT message.
 * @event BadMessageError When an EVENT message is malformed.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function validateIncomingEventMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(incoming_generic_message_event_1.IncomingGenericMessageEvent, (incomingGenericMessageEvent) => {
            if (incomingGenericMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
            }
            const { genericMessage } = incomingGenericMessageEvent.details;
            if (genericMessage[0] !== 'EVENT') {
                return; // The incoming message is not an 'EVENT'.
            }
            incomingGenericMessageEvent.preventDefault();
            const eventOptions = {
                parentEvent: incomingGenericMessageEvent,
                targetEmitter: memorelayClient,
            };
            queueMicrotask(() => {
                try {
                    const eventMessage = (0, check_client_event_message_1.checkClientEventMessage)(genericMessage);
                    memorelayClient.emitEvent(new incoming_event_message_event_1.IncomingEventMessageEvent({ clientEventMessage: eventMessage }, eventOptions));
                }
                catch (error) {
                    const badMessageError = error;
                    memorelayClient.emitEvent(new bad_message_error_event_1.BadMessageErrorEvent({ badMessageError, badMessage: genericMessage }, eventOptions));
                }
            });
        }));
    });
}
exports.validateIncomingEventMessages = validateIncomingEventMessages;
