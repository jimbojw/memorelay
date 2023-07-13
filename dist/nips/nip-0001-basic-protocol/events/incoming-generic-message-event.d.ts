/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming generic Nostr event.
 */
import { GenericMessage } from '../types/generic-message';
import { ClientEvent, ClientEventOptions } from '../../../core/events/client-event';
export declare const INCOMING_GENERIC_MESSAGE_EVENT_TYPE = "incoming-generic-message";
/**
 * @see IncomingGenericMessageEvent
 */
export interface IncomingGenericMessageEventDetails {
    /**
     * The incoming generic Nostr message.
     */
    readonly genericMessage: GenericMessage;
}
/**
 * Event emitted when a MemorelayClient has received a properly formed,
 * incoming, gerenic Nostr message. Generally this will be in response to a
 * previously received WebSocket 'message' event.
 */
export declare class IncomingGenericMessageEvent extends ClientEvent<typeof INCOMING_GENERIC_MESSAGE_EVENT_TYPE, IncomingGenericMessageEventDetails> {
    static readonly type: typeof INCOMING_GENERIC_MESSAGE_EVENT_TYPE;
    constructor(details: IncomingGenericMessageEventDetails, options?: ClientEventOptions);
}
