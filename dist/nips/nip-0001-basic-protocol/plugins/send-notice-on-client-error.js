"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin for sending a NOTICE message to a client in response to
 * a BadMessageError emitted elsewhere.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNoticeOnClientError = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
const bad_message_error_event_1 = require("../events/bad-message-error-event");
const outgoing_notice_message_event_1 = require("../events/outgoing-notice-message-event");
/**
 * Memorelay plugin which responds to ClientErrors (such as BadMessageErrors)
 * emitted elsewhere by issuing a NOTICE message to the client which produced
 * the error.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function sendNoticeOnClientError(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(bad_message_error_event_1.BadMessageErrorEvent, (badMessageErrorEvent) => {
            if (badMessageErrorEvent.defaultPrevented) {
                return; // Preempted by another listener.
            }
            const { message } = badMessageErrorEvent.details.badMessageError;
            queueMicrotask(() => {
                memorelayClient.emitEvent(new outgoing_notice_message_event_1.OutgoingNoticeMessageEvent({
                    relayNoticeMessage: ['NOTICE', `ERROR: ${message}`],
                }, {
                    parentEvent: badMessageErrorEvent,
                    targetEmitter: memorelayClient,
                }));
            });
        }));
    });
}
exports.sendNoticeOnClientError = sendNoticeOnClientError;
