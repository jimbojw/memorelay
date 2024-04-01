"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send an OK message after a bad incoming EVENT message.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOKAfterBadEvent = void 0;
const bad_message_error_event_1 = require("../events/bad-message-error-event");
const check_generic_message_1 = require("../lib/check-generic-message");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
/**
 * After a BadMessageErrorEvent where an EVENT object was malformed, send an
 * OutgoingOKMessageEvent.
 * @param hub Event hub for inter-component communication.
 * @emits OutgoingOKMessageEvent
 */
function sendOKAfterBadEvent(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, (memorelayClientCreatedEvent) => {
        const { memorelayClient } = memorelayClientCreatedEvent.details;
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(bad_message_error_event_1.BadMessageErrorEvent, (badMessageErrorEvent) => {
            if (badMessageErrorEvent.defaultPrevented) {
                return; // Preempted by another listener.
            }
            const { badMessageError, badMessage } = badMessageErrorEvent.details;
            try {
                const genericMessage = (0, check_generic_message_1.checkGenericMessage)(badMessage);
                if (genericMessage[0] !== 'EVENT') {
                    return; // The bad message wasn't an EVENT message.
                }
                badMessageErrorEvent.preventDefault();
                const maybeEventObject = genericMessage[1];
                const eventId = maybeEventObject &&
                    typeof maybeEventObject === 'object' &&
                    'id' in maybeEventObject &&
                    typeof maybeEventObject.id === 'string'
                    ? maybeEventObject.id
                    : 'undefined';
                queueMicrotask(() => {
                    memorelayClient.emitEvent(new outgoing_ok_message_event_1.OutgoingOKMessageEvent({
                        okMessage: [
                            'OK',
                            eventId,
                            false,
                            `invalid: ${badMessageError.message}`,
                        ],
                    }, {
                        parentEvent: badMessageErrorEvent,
                        targetEmitter: memorelayClient,
                    }));
                });
            }
            catch (err) {
                // Nothing for us to do if the cause of the BadMessageError
                // doesn't meet the qualifications of even a generic message.
                return;
            }
        }));
    });
}
exports.sendOKAfterBadEvent = sendOKAfterBadEvent;
