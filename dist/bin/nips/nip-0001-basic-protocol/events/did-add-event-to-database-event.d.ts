/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal that an EVENT was successfully added to the
 * stored events database.
 */
import { Event as NostrEvent } from 'nostr-tools';
import { ClientEvent, ClientEventOptions } from '../../../core/events/client-event';
export declare const DID_ADD_EVENT_TO_DATABASE_EVENT_TYPE = "did-add-event-to-database";
/**
 * @see DidAddEventToDatabaseEvent
 */
export interface DidAddEventToDatabaseEventDetails {
    /**
     * The EVENT that was just added to the database.
     */
    readonly event: NostrEvent;
}
/**
 * Event emitted when an event has just been added to the database.
 */
export declare class DidAddEventToDatabaseEvent extends ClientEvent<typeof DID_ADD_EVENT_TO_DATABASE_EVENT_TYPE, DidAddEventToDatabaseEventDetails> {
    static readonly type: typeof DID_ADD_EVENT_TO_DATABASE_EVENT_TYPE;
    constructor(details: DidAddEventToDatabaseEventDetails, options?: ClientEventOptions);
}
