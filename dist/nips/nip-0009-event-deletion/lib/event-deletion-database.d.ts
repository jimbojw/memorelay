/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Database for handling event deletions.
 */
import { Event as NostrEvent } from 'nostr-tools';
/**
 * Storage and indexing of events in the context of their possible deletion.
 *
 * A deletion event is a Nostr note with kind=5. The event may contain 'e' tags
 * which indicate the intent to delete events with those ids.
 * @see https://github.com/nostr-protocol/nips/blob/master/09.md
 */
export declare class EventDeletionDatabase {
    /**
     * Set of event ids known to be successfully deleted. Any id in this set will
     * not appear elsewhere in this database.
     */
    readonly knownDeletedIdsSet: Set<string>;
    /**
     * Mapping from a non-deleted event id to its kind.
     */
    readonly eventIdToKindMap: Map<string, number>;
    /**
     * Mapping from a non-deleted event id to its author's pubkey.
     */
    readonly eventIdToAuthorPubkeyMap: Map<string, string>;
    /**
     * When we receive a kind=5 deletion event, its 'e' tags may point to event
     * ids that we haven't yet seen. In that case, we can't know whether the
     * deletion has the same author pubkey as the original. So here, for each
     * mentioned event, we store the set of all pubkeys that has tried to delete
     * it.
     *
     * Later, when we eventually see an event that has been claimed to have been
     * deleted, we can check whether that event's pubkey is in the set of pubkeys
     * that has tried to delete the event.
     *
     * Once a previously unknown event is seen for the first time, its entry in
     * this map (if any) will be removed.
     */
    readonly unknownEventIdToDeletingPubkeysMap: Map<string, Set<string>>;
    /**
     * Add a Nostr event to the database.
     * @param event The event to add.
     */
    addEvent(event: NostrEvent): void;
    /**
     * @returns Number of known events.
     */
    get size(): number;
    /**
     * Record the deletion event.
     * @param deletionEvent The deletion event to record.
     */
    recordDeletionEvent(deletionEvent: NostrEvent): void;
    /**
     * Check whether any prior deletion attempts apply to this non-deletion event.
     * @param nonDeletionEvent
     */
    checkDeletionAttempts(nonDeletionEvent: NostrEvent): void;
    /**
     * Returns true if the pubkey has previously attempted to delete the indicated
     * event.
     * @param pubkey
     * @param eventId
     */
    hasAttemptedDeletion(pubkey: string, eventId: string): boolean;
    /**
     * Return whether we've seen the event.
     * @param eventId The id of the event.
     * @returns Whether the event has been seen.
     */
    hasEvent(eventId: string): boolean;
    /**
     * Record the attempt of a pubkey to delete a given event.
     * @param pubkey The deleting pubkey.
     * @param eventId The target event id to delete.
     */
    recordDeletionAttempt(pubkey: string, eventId: string): void;
    /**
     * Get the kind of an event, or undefined if unknown.
     * @param eventId The id of the event.
     */
    getEventKind(eventId: string): number | undefined;
    /**
     * Set the kind of an event.
     * @param eventId The id of the event.
     * @param kind The kind of the event.
     */
    setEventKind(eventId: string, kind: number): void;
    /**
     * Get the author pubkey of an event, or undefined if unknown.
     * @param eventId The id of the event.
     */
    getEventPubkey(eventId: string): string | undefined;
    /**
     * Set the pubkey of an event.
     * @param eventId The id of the event.
     * @param pubkey The author pubkey of the event.
     */
    setEventPubkey(eventId: string, pubkey: string): void;
    /**
     * Record a successful deletion and clean up.
     * @param eventId Id of the event to mark deleted.
     */
    recordSuccessfulDeletion(eventId: string): void;
    /**
     * Clear any previous attempts to delet the event specified.
     * @param eventId Event that may have previously had deletion attempts.
     */
    clearDeletionAttempts(eventId: string): void;
    /**
     * Determine whether an event has been deleted.
     * @param eventId
     */
    isDeleted(eventId: string): boolean;
}
