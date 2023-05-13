/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Main entry point for Memorelay library.
 */
import { Filter, Event as NostrEvent } from 'nostr-tools';
export declare class Memorelay {
    /**
     * Map of events keyed by id known to this memorelay instance.
     */
    private readonly eventsMap;
    /**
     * Counter to keep track of the next subscription id to use.
     */
    private nextSubscriptionId;
    /**
     * Map of subscriptions.
     */
    private readonly subscriptionsMap;
    /**
     * Returns whether the provided event is in memory.
     * @param event The event to check.
     */
    hasEvent(event: NostrEvent): boolean;
    /**
     * Add the given event to the events map and return whether successful.
     * @param event The event to add.
     * @returns Whether the event was added.
     * @throws BadEventError if the incoming object is not a valid, signed event.
     */
    addEvent(event: NostrEvent): boolean;
    /**
     * Delete the event from the events map and return whether successful.
     * @param event The event to add.
     * @returns Whether the event was deleted.
     */
    deleteEvent(event: NostrEvent): boolean;
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
