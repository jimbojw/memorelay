/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Coordinator object for tracking events and subscriptions.
 */

import { InternalError } from './internal-error';
import { Subscription } from './subscription';
import { verifyEvent } from './verify-event';
import { verifyFilters } from './verify-filters';

import binarySearch from 'binary-search';
import { Filter, Event as NostrEvent, matchFilters } from 'nostr-tools';

/**
 * A Map keyed by event.id and whose value is the NostrEvent.
 */
type EventsMap = Map<string, NostrEvent>;

/**
 * Record binding a created_at time to a map of events that have that created_at
 * value.
 */
interface CreatedAtEventsRecord {
  createdAt: number;
  eventsMap: EventsMap;
}

/**
 * Comparator function for binary searching an array of events sorted by their
 * created_at values.
 * @param event The event in the sorted array being evaluated.
 * @param createdAt The needle created_at value being searched for.
 * @returns A number indicating the direction of the comparison.
 */
function compareCreatedAt(event: CreatedAtEventsRecord, createdAt: number) {
  return event.createdAt - createdAt;
}

export class MemorelayCoordinator {
  /**
   * Map of events keyed by id known to this memorelay instance.
   */
  private readonly eventsMap: EventsMap = new Map();

  /**
   * Array of EventsMaps sorted by the `created_at` field. Used for performing
   * ordered queries.
   */
  private readonly eventsByCreatedAt: CreatedAtEventsRecord[] = [];

  /**
   * Counter to keep track of the next subscription number to use.
   */
  private nextSubscriptionNumber = 0;

  /**
   * Map of subscriptions.
   */
  private readonly subscriptionsMap = new Map<number, Subscription>();

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

    const result = binarySearch(
      this.eventsByCreatedAt,
      event.created_at,
      (a, b) => a.createdAt - b
    );

    if (result < 0) {
      const eventsMap = new Map<string, NostrEvent>();
      eventsMap.set(event.id, event);
      this.eventsByCreatedAt.splice(~result, 0, {
        createdAt: event.created_at,
        eventsMap,
      });
    }

    const index = result < 0 ? ~result : result;
    this.eventsByCreatedAt[index].eventsMap.set(event.id, event);

    for (const [
      ,
      { callbackFn, filters, subscriptionNumber: subscriptionId },
    ] of this.subscriptionsMap) {
      queueMicrotask(() => {
        if (!this.subscriptionsMap.has(subscriptionId)) {
          // Short-circuit if this subscription has been removed.
          return;
        }
        if (!filters || filters.length < 1 || matchFilters(filters, event)) {
          callbackFn(event);
        }
      });
    }
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

    const index = binarySearch(
      this.eventsByCreatedAt,
      event.created_at,
      compareCreatedAt
    );

    if (index < 0) {
      throw new InternalError('created_at events map missing');
    }

    const { eventsMap } = this.eventsByCreatedAt[index];
    if (!eventsMap.has(event.id)) {
      throw new InternalError('could not find event to delete');
    }
    eventsMap.delete(event.id);

    if (!eventsMap.size) {
      // Remove record if there are no events at this created_at left.
      this.eventsByCreatedAt.splice(index, 1);
    }

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
    filters && verifyFilters(filters);
    const matchingEvents: NostrEvent[] = [];
    for (const [, event] of this.eventsMap) {
      if (!filters || filters.length < 1 || matchFilters(filters, event)) {
        matchingEvents.push(event);
      }
    }
    return matchingEvents;
  }

  /**
   * Subscribe to events matching the optional filters list. Only newly added
   * events AFTER the subscription is made will trigger the callback function.
   * @param callbackFn Function to invoke when events are added that match
   * the filter(s).
   * @param filters Optional list of filters to match. If omitted or empty, then
   * all added events will trigger the callback.
   * @returns Unique subscription index number to be used with unsubscribe.
   */
  subscribe(
    callbackFn: (event: NostrEvent) => void,
    filters?: Filter[]
  ): number {
    filters && verifyFilters(filters);
    const subscriptionId = this.nextSubscriptionNumber++;
    if (this.subscriptionsMap.has(subscriptionId)) {
      throw new InternalError('subscription id conflict');
    }
    this.subscriptionsMap.set(subscriptionId, {
      callbackFn,
      filters,
      subscriptionNumber: subscriptionId,
    });
    return subscriptionId;
  }

  /**
   * Unsubscribe from the previously established subscription. If there was no
   * such subscription with the provided id, then false is returned.
   * @param subscriptionId Unique subscription id number previously returned by
   * a call to subscribe().
   * @returns Whether the subscription was removed.
   * @throws RangeError if the provided subscription id is invalid.
   */
  unsubscribe(subscriptionId: number): boolean {
    if (!Number.isInteger(subscriptionId)) {
      throw new RangeError('invalid subscription id');
    }
    if (!this.subscriptionsMap.has(subscriptionId)) {
      return false;
    }
    this.subscriptionsMap.delete(subscriptionId);
    return true;
  }
}
