/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Database for handling event deletions.
 */

import { Kind, Event as NostrEvent } from 'nostr-tools';

/**
 * Storage and indexing of events in the context of their possible deletion.
 *
 * A deletion event is a Nostr note with kind=5. The event may contain 'e' tags
 * which indicate the intent to delete events with those ids.
 * @see https://github.com/nostr-protocol/nips/blob/master/09.md
 */
export class EventDeletionDatabase {
  /**
   * Set of event ids known to be successfully deleted. Any id in this set will
   * not appear elsewhere in this database.
   */
  readonly knownDeletedIdsSet = new Set<string>();

  /**
   * Mapping from a non-deleted event id to its kind.
   */
  readonly eventIdToKindMap = new Map<string, number>();

  /**
   * Mapping from a non-deleted event id to its author's pubkey.
   */
  readonly eventIdToAuthorPubkeyMap = new Map<string, string>();

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
  readonly unknownEventIdToDeletingPubkeysMap = new Map<string, Set<string>>();

  /**
   * Add a Nostr event to the database.
   * @param event The event to add.
   */
  addEvent(event: NostrEvent) {
    const eventId = event.id;
    if (this.hasEvent(eventId)) {
      return; // Event is already known.
    }

    const kind = event.kind;
    this.setEventKind(eventId, kind);
    this.setEventPubkey(eventId, event.pubkey);

    if (kind === Kind.EventDeletion) {
      this.recordDeletionEvent(event);
    } else {
      this.checkDeletionAttempts(event);
    }
  }

  /**
   * @returns Number of known events.
   */
  get size(): number {
    return this.knownDeletedIdsSet.size + this.eventIdToKindMap.size;
  }

  /**
   * Record the deletion event.
   * @param deletionEvent The deletion event to record.
   */
  recordDeletionEvent(deletionEvent: NostrEvent) {
    if (deletionEvent.kind !== Kind.EventDeletion) {
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
  checkDeletionAttempts(nonDeletionEvent: NostrEvent) {
    if (nonDeletionEvent.kind === Kind.EventDeletion) {
      throw new Error('event must not be a deletion event');
    }
    const { id: eventId, pubkey } = nonDeletionEvent;
    if (this.hasAttemptedDeletion(pubkey, eventId)) {
      // A prior deletion attempt was made by the author, so this event is now
      // known to be deleted.
      this.recordSuccessfulDeletion(eventId);
    } else {
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
  hasAttemptedDeletion(pubkey: string, eventId: string): boolean {
    return (
      this.unknownEventIdToDeletingPubkeysMap.get(eventId)?.has(pubkey) ?? false
    );
  }

  /**
   * Return whether we've seen the event.
   * @param eventId The id of the event.
   * @returns Whether the event has been seen.
   */
  hasEvent(eventId: string): boolean {
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
  recordDeletionAttempt(pubkey: string, eventId: string) {
    if (this.isDeleted(eventId)) {
      return; // Nothing to do, the event is already known to be deleted.
    }

    if (!this.hasEvent(eventId)) {
      // This event is unknown to us, so all we can do is note that this pubkey
      // tried to delete this eventId and check back later.
      let deletingPubkeysSet =
        this.unknownEventIdToDeletingPubkeysMap.get(eventId);
      if (!deletingPubkeysSet) {
        deletingPubkeysSet = new Set<string>();
        this.unknownEventIdToDeletingPubkeysMap.set(
          eventId,
          deletingPubkeysSet
        );
      }
      deletingPubkeysSet.add(pubkey);
      return;
    }

    if (
      this.getEventPubkey(eventId) === pubkey &&
      this.getEventKind(eventId) !== Kind.EventDeletion
    ) {
      this.recordSuccessfulDeletion(eventId);
    }
  }

  /**
   * Get the kind of an event, or undefined if unknown.
   * @param eventId The id of the event.
   */
  getEventKind(eventId: string): number | undefined {
    return this.eventIdToKindMap.get(eventId);
  }

  /**
   * Set the kind of an event.
   * @param eventId The id of the event.
   * @param kind The kind of the event.
   */
  setEventKind(eventId: string, kind: number) {
    this.eventIdToKindMap.set(eventId, kind);
  }

  /**
   * Get the author pubkey of an event, or undefined if unknown.
   * @param eventId The id of the event.
   */
  getEventPubkey(eventId: string): string | undefined {
    return this.eventIdToAuthorPubkeyMap.get(eventId);
  }

  /**
   * Set the pubkey of an event.
   * @param eventId The id of the event.
   * @param pubkey The author pubkey of the event.
   */
  setEventPubkey(eventId: string, pubkey: string) {
    this.eventIdToAuthorPubkeyMap.set(eventId, pubkey);
  }

  /**
   * Record a successful deletion and clean up.
   * @param eventId Id of the event to mark deleted.
   */
  recordSuccessfulDeletion(eventId: string) {
    this.knownDeletedIdsSet.add(eventId);
    this.eventIdToAuthorPubkeyMap.delete(eventId);
    this.eventIdToKindMap.delete(eventId);
    this.clearDeletionAttempts(eventId);
  }

  /**
   * Clear any previous attempts to delet the event specified.
   * @param eventId Event that may have previously had deletion attempts.
   */
  clearDeletionAttempts(eventId: string) {
    const deletingPubkeysSet =
      this.unknownEventIdToDeletingPubkeysMap.get(eventId);
    if (deletingPubkeysSet) {
      deletingPubkeysSet.clear();
      this.unknownEventIdToDeletingPubkeysMap.delete(eventId);
    }
  }

  /**
   * Determine whether an event has been deleted.
   * @param eventId
   */
  isDeleted(eventId: string): boolean {
    return this.knownDeletedIdsSet.has(eventId);
  }
}
