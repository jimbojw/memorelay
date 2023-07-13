"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Database for handling event deletions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDeletionDatabase = void 0;
const nostr_tools_1 = require("nostr-tools");
/**
 * Storage and indexing of events in the context of their possible deletion.
 *
 * A deletion event is a Nostr note with kind=5. The event may contain 'e' tags
 * which indicate the intent to delete events with those ids.
 * @see https://github.com/nostr-protocol/nips/blob/master/09.md
 */
class EventDeletionDatabase {
    constructor() {
        /**
         * Set of event ids known to be successfully deleted. Any id in this set will
         * not appear elsewhere in this database.
         */
        this.knownDeletedIdsSet = new Set();
        /**
         * Mapping from a non-deleted event id to its kind.
         */
        this.eventIdToKindMap = new Map();
        /**
         * Mapping from a non-deleted event id to its author's pubkey.
         */
        this.eventIdToAuthorPubkeyMap = new Map();
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
        this.unknownEventIdToDeletingPubkeysMap = new Map();
    }
    /**
     * Add a Nostr event to the database.
     * @param event The event to add.
     */
    addEvent(event) {
        const eventId = event.id;
        if (this.hasEvent(eventId)) {
            return; // Event is already known.
        }
        const kind = event.kind;
        this.setEventKind(eventId, kind);
        this.setEventPubkey(eventId, event.pubkey);
        if (kind === nostr_tools_1.Kind.EventDeletion) {
            this.recordDeletionEvent(event);
        }
        else {
            this.checkDeletionAttempts(event);
        }
    }
    /**
     * @returns Number of known events.
     */
    get size() {
        return this.knownDeletedIdsSet.size + this.eventIdToKindMap.size;
    }
    /**
     * Record the deletion event.
     * @param deletionEvent The deletion event to record.
     */
    recordDeletionEvent(deletionEvent) {
        if (deletionEvent.kind !== nostr_tools_1.Kind.EventDeletion) {
            throw new Error('event must be a deletion event');
        }
        const pubkey = deletionEvent.pubkey;
        for (const tag of deletionEvent.tags) {
            const tagType = tag[0];
            if (tagType !== 'e') {
                // TODO(jimbo): Support NIP-33 'a' tags.
                continue;
            }
            this.recordDeletionAttempt(pubkey, tag[1]);
        }
    }
    /**
     * Check whether any prior deletion attempts apply to this non-deletion event.
     * @param nonDeletionEvent
     */
    checkDeletionAttempts(nonDeletionEvent) {
        if (nonDeletionEvent.kind === nostr_tools_1.Kind.EventDeletion) {
            throw new Error('event must not be a deletion event');
        }
        const { id: eventId, pubkey } = nonDeletionEvent;
        if (this.hasAttemptedDeletion(pubkey, eventId)) {
            // A prior deletion attempt was made by the author, so this event is now
            // known to be deleted.
            this.recordSuccessfulDeletion(eventId);
        }
        else {
            // All prior deletion attempts are known to have been invalid. Purge them.
            this.clearDeletionAttempts(eventId);
        }
    }
    /**
     * Returns true if the pubkey has previously attempted to delete the indicated
     * event.
     * @param pubkey
     * @param eventId
     */
    hasAttemptedDeletion(pubkey, eventId) {
        var _a, _b;
        return ((_b = (_a = this.unknownEventIdToDeletingPubkeysMap.get(eventId)) === null || _a === void 0 ? void 0 : _a.has(pubkey)) !== null && _b !== void 0 ? _b : false);
    }
    /**
     * Return whether we've seen the event.
     * @param eventId The id of the event.
     * @returns Whether the event has been seen.
     */
    hasEvent(eventId) {
        if (this.knownDeletedIdsSet.has(eventId)) {
            return true;
        }
        return this.eventIdToKindMap.has(eventId);
    }
    /**
     * Record the attempt of a pubkey to delete a given event.
     * @param pubkey The deleting pubkey.
     * @param eventId The target event id to delete.
     */
    recordDeletionAttempt(pubkey, eventId) {
        if (this.isDeleted(eventId)) {
            return; // Nothing to do, the event is already known to be deleted.
        }
        if (!this.hasEvent(eventId)) {
            // This event is unknown to us, so all we can do is note that this pubkey
            // tried to delete this eventId and check back later.
            let deletingPubkeysSet = this.unknownEventIdToDeletingPubkeysMap.get(eventId);
            if (!deletingPubkeysSet) {
                deletingPubkeysSet = new Set();
                this.unknownEventIdToDeletingPubkeysMap.set(eventId, deletingPubkeysSet);
            }
            deletingPubkeysSet.add(pubkey);
            return;
        }
        if (this.getEventPubkey(eventId) === pubkey &&
            this.getEventKind(eventId) !== nostr_tools_1.Kind.EventDeletion) {
            this.recordSuccessfulDeletion(eventId);
        }
    }
    /**
     * Get the kind of an event, or undefined if unknown.
     * @param eventId The id of the event.
     */
    getEventKind(eventId) {
        return this.eventIdToKindMap.get(eventId);
    }
    /**
     * Set the kind of an event.
     * @param eventId The id of the event.
     * @param kind The kind of the event.
     */
    setEventKind(eventId, kind) {
        this.eventIdToKindMap.set(eventId, kind);
    }
    /**
     * Get the author pubkey of an event, or undefined if unknown.
     * @param eventId The id of the event.
     */
    getEventPubkey(eventId) {
        return this.eventIdToAuthorPubkeyMap.get(eventId);
    }
    /**
     * Set the pubkey of an event.
     * @param eventId The id of the event.
     * @param pubkey The author pubkey of the event.
     */
    setEventPubkey(eventId, pubkey) {
        this.eventIdToAuthorPubkeyMap.set(eventId, pubkey);
    }
    /**
     * Record a successful deletion and clean up.
     * @param eventId Id of the event to mark deleted.
     */
    recordSuccessfulDeletion(eventId) {
        this.knownDeletedIdsSet.add(eventId);
        this.eventIdToAuthorPubkeyMap.delete(eventId);
        this.eventIdToKindMap.delete(eventId);
        this.clearDeletionAttempts(eventId);
    }
    /**
     * Clear any previous attempts to delet the event specified.
     * @param eventId Event that may have previously had deletion attempts.
     */
    clearDeletionAttempts(eventId) {
        const deletingPubkeysSet = this.unknownEventIdToDeletingPubkeysMap.get(eventId);
        if (deletingPubkeysSet) {
            deletingPubkeysSet.clear();
            this.unknownEventIdToDeletingPubkeysMap.delete(eventId);
        }
    }
    /**
     * Determine whether an event has been deleted.
     * @param eventId
     */
    isDeleted(eventId) {
        return this.knownDeletedIdsSet.has(eventId);
    }
}
exports.EventDeletionDatabase = EventDeletionDatabase;
