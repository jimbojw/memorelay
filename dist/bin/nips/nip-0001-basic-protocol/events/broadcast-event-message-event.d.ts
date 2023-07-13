/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal a Nostr EVENT message being broadcasted from
 * one client to others.
 */
import { ClientEventMessage } from '../types/client-event-message';
import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { RelayEvent, RelayEventOptions } from '../../../core/events/relay-event';
export declare const BROADCAST_EVENT_MESSAGE_EVENT_TYPE = "broadcast-event-message";
/**
 * @see BroadcastEventMessageEvent
 */
export interface BroadcastEventMessageEventDetails {
    /**
     * The incoming Nostr EVENT message.
     */
    readonly clientEventMessage: ClientEventMessage;
    /**
     * The originating Memorelay instance.
     */
    readonly memorelayClient: MemorelayClient;
}
/**
 * Event emitted to communicate an EVENT message between connected clients.
 * Generally, the client named in the event details will be different from the
 * emitter of the event.
 */
export declare class BroadcastEventMessageEvent extends RelayEvent<typeof BROADCAST_EVENT_MESSAGE_EVENT_TYPE, BroadcastEventMessageEventDetails> {
    static readonly type: typeof BROADCAST_EVENT_MESSAGE_EVENT_TYPE;
    constructor(details: BroadcastEventMessageEventDetails, options?: RelayEventOptions);
}
