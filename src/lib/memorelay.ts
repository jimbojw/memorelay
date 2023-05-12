/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Main entry point for Memorelay library.
 */

import { verifyEvent } from './verify-event';

import { Filter, Event as NostrEvent, matchFilters } from 'nostr-tools';

export class Memorelay {
  /**
   * Map of events keyed by id known to this memorelay instance.
   */
  private readonly eventsMap = new Map<string, NostrEvent>();

  /**
   * Returns whether the provided event is in memory.
   * @param event The event to check.
   */
  hasEvent(event: NostrEvent): boolean {
    return this.eventsMap.has(event.id);
  }

  /**
   * Add the given event to the events map and return whether successful.
   * @param event The event to add.
   * @returns Whether the event was added.
   * @throws BadEventError if the incoming object is not a valid, signed event.
   */
  addEvent(event: NostrEvent): boolean {
    verifyEvent(event);
    if (this.hasEvent(event)) {
      return false;
    }
    this.eventsMap.set(event.id, event);
    return true;
  }

  /**
   * Delete the event from the events map and return whether successful.
   * @param event The event to add.
   * @returns Whether the event was deleted.
   */
  deleteEvent(event: NostrEvent): boolean {
    if (!this.hasEvent(event)) {
      return false;
    }
    this.eventsMap.delete(event.id);
    return true;
  }

  /**
   * Find and return all events which match the provided array of filters. If
   * the filters array is not provided, or if it is an empty array, then no
   * criteria are enforced and all events will match.
   * @param filters Optional array of Filter objects to test.
   * @returns An array of matching events.
   */
  matchFilters(filters?: Filter[]): NostrEvent[] {
    const matchingEvents: NostrEvent[] = [];
    for (const [, event] of this.eventsMap) {
      if (!filters || filters.length < 1 || matchFilters(filters, event)) {
        matchingEvents.push(event);
      }
    }
    return matchingEvents;
  }
}
