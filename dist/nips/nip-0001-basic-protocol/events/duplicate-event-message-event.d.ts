/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming EVENT was detected as a duplicate.
 */
import { ClientEvent, ClientEventOptions } from '../../../core/events/client-event';
import { Event as NostrEvent } from 'nostr-tools';
export declare const DUPLICATE_EVENT_MESSAGE_EVENT_TYPE = "duplicate-event-message";
/**
 * @see DuplicateEventMessageEvent
 */
export interface DuplicateEventMessageEventDetails {
    /**
     * The event that was determined to be a duplicate.
     */
    readonly event: NostrEvent;
}
/**
 * Event emitted when an incoming EVENT payload was determined to be a duplicate
 * event.
 */
export declare class DuplicateEventMessageEvent extends ClientEvent<typeof DUPLICATE_EVENT_MESSAGE_EVENT_TYPE, DuplicateEventMessageEventDetails> {
    static readonly type: typeof DUPLICATE_EVENT_MESSAGE_EVENT_TYPE;
    constructor(details: DuplicateEventMessageEventDetails, options?: ClientEventOptions);
}
