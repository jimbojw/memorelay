"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for re-casting outgoing NOTICE messages
 * as generic messages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalizeOutgoingNoticeMessages = void 0;
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const outgoing_generic_message_event_1 = require("../events/outgoing-generic-message-event");
const outgoing_notice_message_event_1 = require("../events/outgoing-notice-message-event");
const auto_disconnect_1 = require("../../../core/lib/auto-disconnect");
/**
 * Memorelay plugin for re-casting outgoing NOTICE messages as generic messages.
 * @param hub Event hub for inter-component communication.
 * @event OutgoingGenericMessageEvent
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
function generalizeOutgoingNoticeMessages(hub) {
    return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, (memorelayClientCreatedEvent) => {
        const { memorelayClient } = memorelayClientCreatedEvent.details;
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, memorelayClient.onEvent(outgoing_notice_message_event_1.OutgoingNoticeMessageEvent, (outgoingNoticeMessageEvent) => {
            if (outgoingNoticeMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
            }
            outgoingNoticeMessageEvent.preventDefault();
            queueMicrotask(() => {
                memorelayClient.emitEvent(new outgoing_generic_message_event_1.OutgoingGenericMessageEvent({
                    genericMessage: outgoingNoticeMessageEvent.details.relayNoticeMessage,
                }, {
                    parentEvent: outgoingNoticeMessageEvent,
                    targetEmitter: memorelayClient,
                }));
            });
        }));
    });
}
exports.generalizeOutgoingNoticeMessages = generalizeOutgoingNoticeMessages;
