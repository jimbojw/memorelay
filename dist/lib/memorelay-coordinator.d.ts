/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Coordinator object for tracking events and subscriptions.
 */
import { Filter, Event as NostrEvent } from 'nostr-tools';
export declare class MemorelayCoordinator {
    /**
     * Map of events keyed by id known to this memorelay instance.
     */
    private readonly eventsMap;
    /**
     * Array of EventsMaps sorted by the `created_at` field. Used for performing
     * ordered queries.
     */
    private readonly eventsByCreatedAt;
    /**
     * Counter to keep track of the next subscription number to use.
     */
    private nextSubscriptionNumber;
    /**
     * Map of subscriptions.
     */
    private readonly subscriptionsMap;
    /**
     * Returns whether the provided event is in memory.
     * @param eventId The id of the event to check.
     */
    hasEvent(eventId: string): boolean;
    /**
     * Add the given event to the events map and return whether successful.
     * @param event The event to add.
     * @returns Whether the event was added.
     * @throws BadEventError if the incoming object is not a valid, signed event.
     */
    addEvent(event: NostrEvent): boolean;
    /**
     * Delete the event from the events map and return whether successful.
     * @param eventId The id of the event to delete.
     * @returns Whether the event was deleted.
     */
    deleteEvent(eventId: string): boolean;
    /**
     * Find and return all events which match the provided array of filters. If
     * the filters array is not provided, or if it is an empty array, then no
     * criteria are enforced and all events will match.
     * @param filters Optional array of Filter objects to test.
     * @returns An array of matching events.
     */
    matchFilters(filters?: Filter[]): NostrEvent[];
    /**
     * Subscribe to events matching the optional filters list. Only newly added
     * events AFTER the subscription is made will trigger the callback function.
     * @param callbackFn Function to invoke when events are added that match
     * the filter(s).
     * @param filters Optional list of filters to match. If omitted or empty, then
     * all added events will trigger the callback.
     * @returns Unique subscription index number to be used with unsubscribe.
     */
    subscribe(callbackFn: (event: NostrEvent) => void, filters?: Filter[]): number;
    /**
     * Unsubscribe from the previously established subscription. If there was no
     * such subscription with the provided id, then false is returned.
     * @param subscriptionId Unique subscription id number previously returned by
     * a call to subscribe().
     * @returns Whether the subscription was removed.
     * @throws RangeError if the provided subscription id is invalid.
     */
    unsubscribe(subscriptionId: number): boolean;
}
