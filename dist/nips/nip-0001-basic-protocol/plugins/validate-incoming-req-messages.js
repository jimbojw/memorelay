"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for validating incoming generic Nostr
 * messages of type 'REQ'.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIncomingReqMessages = void 0;
const incoming_req_message_event_1 = require("../events/incoming-req-message-event");
const incoming_generic_message_event_1 = require("../events/incoming-generic-message-event");
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const check_client_req_message_1 = require("../lib/check-client-req-message");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
const bad_message_error_event_1 = require("../events/bad-message-error-event");
/**
 * Memorelay core plugin for validating incoming, generic Nostr messages of type
 * 'REQ'. Incoming generic messages of any other type are ignored.
 * @param hub Event hub for inter-component communication.
 * @event IncomingReqMessageEvent When a generic message is an REQ message.
 * @event BadMessageError When a REQ message is malformed.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function validateIncomingReqMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(incoming_generic_message_event_1.IncomingGenericMessageEvent, (incomingGenericMessageEvent) => {
            if (incomingGenericMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
            }
            const { genericMessage } = incomingGenericMessageEvent.details;
            if (genericMessage[0] !== 'REQ') {
                return; // The incoming message is not a 'REQ' message.
            }
            incomingGenericMessageEvent.preventDefault();
            const eventOptions = {
                parentEvent: incomingGenericMessageEvent,
                targetEmitter: memorelayClient,
            };
            queueMicrotask(() => {
                try {
                    const reqMessage = (0, check_client_req_message_1.checkClientReqMessage)(genericMessage);
                    memorelayClient.emitEvent(new incoming_req_message_event_1.IncomingReqMessageEvent({ reqMessage }, eventOptions));
                }
                catch (error) {
                    const badMessageError = error;
                    memorelayClient.emitEvent(new bad_message_error_event_1.BadMessageErrorEvent({ badMessageError, badMessage: genericMessage }, eventOptions));
                }
            });
        }));
    });
}
exports.validateIncomingReqMessages = validateIncomingReqMessages;
