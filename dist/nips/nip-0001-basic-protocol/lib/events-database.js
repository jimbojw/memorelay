"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Rudimentary database for managing events.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsDatabase = void 0;
const verify_event_1 = require("./verify-event");
const verify_filters_1 = require("./verify-filters");
const binary_search_1 = __importDefault(require("binary-search"));
const nostr_tools_1 = require("nostr-tools");
/**
 * Comparator function for binary searching an array of events sorted by their
 * created_at values.
 * @param event The event in the sorted array being evaluated.
 * @param createdAt The needle created_at value being searched for.
 * @returns A number indicating the direction of the comparison.
 */
function compareCreatedAt(event, createdAt) {
    return event.createdAt - createdAt;
}
/**
 * Database of Nostr events, indexed by id and by created_at timestamp.
 */
class EventsDatabase {
    constructor() {
        /**
         * Map of events keyed by id known to this memorelay instance.
         */
        this.eventsMap = new Map();
        /**
         * Array of EventsMaps sorted by the `created_at` field. Used for performing
         * ordered queries.
         */
        this.eventsByCreatedAt = [];
    }
    /**
     * Returns whether the provided event is in memory.
     * @param eventId The id of the event to check.
     */
    hasEvent(eventId) {
        return this.eventsMap.has(eventId);
    }
    /**
     * Add the given event to the events map and return whether successful.
     * @param event The event to add.
     * @returns Whether the event was added.
     * @throws BadEventError if the incoming object is not a valid, signed event.
     */
    addEvent(event) {
        (0, verify_event_1.verifyEvent)(event);
        if (this.hasEvent(event.id)) {
            return false;
        }
        this.eventsMap.set(event.id, event);
        // If found, the result will be the matching index. Otherwise, it will be a
        // negative number indicating the index at which the missing element should
        // be inserted.
        const result = (0, binary_search_1.default)(this.eventsByCreatedAt, event.created_at, (a, b) => a.createdAt - b);
        if (result < 0) {
            // Since an index could not be found, the insertion index is the two's
            // compliment inverse (~) of the result value.
            const insertionIndex = ~result;
            // Insert a new events map for the missing created_at value.
            const eventsMap = new Map();
            eventsMap.set(event.id, event);
            this.eventsByCreatedAt.splice(insertionIndex, 0, {
                createdAt: event.created_at,
                eventsMap,
            });
            // Insert the event into the new events map.
            this.eventsByCreatedAt[insertionIndex].eventsMap.set(event.id, event);
        }
        else {
            // Search was successful, so the found index is equal to the result.
            const foundIndex = result;
            // Insert the event into the found events map.
            this.eventsByCreatedAt[foundIndex].eventsMap.set(event.id, event);
        }
        return true;
    }
    /**
     * Delete the event from the events map and return whether successful.
     * @param eventId The id of the event to delete.
     * @returns Whether the event was deleted.
     */
    deleteEvent(eventId) {
        const event = this.eventsMap.get(eventId);
        if (!event) {
            return false;
        }
        this.eventsMap.delete(event.id);
        const index = (0, binary_search_1.default)(this.eventsByCreatedAt, event.created_at, compareCreatedAt);
        const { eventsMap } = this.eventsByCreatedAt[index];
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
    matchFilters(filters) {
        filters && (0, verify_filters_1.verifyFilters)(filters);
        let limit = Infinity;
        for (const filter of filters !== null && filters !== void 0 ? filters : []) {
            if (filter.limit !== undefined && filter.limit < limit) {
                limit = filter.limit;
            }
        }
        const matchingEvents = [];
        // Walk backwards through the eventsByCreatedAt array so that we find the
        // latest events first on our way to satisfying the limit.
        for (let index = this.eventsByCreatedAt.length - 1; index >= 0 && matchingEvents.length < limit; index--) {
            const { eventsMap } = this.eventsByCreatedAt[index];
            for (const [, event] of eventsMap) {
                if (!filters || filters.length < 1 || (0, nostr_tools_1.matchFilters)(filters, event)) {
                    matchingEvents.push(event);
                    if (matchingEvents.length >= limit) {
                        break;
                    }
                }
            }
        }
        // Because we walked backwards through the eventsByCreatedAt array, the
        // collection will be in reverse order by created_at stamp.
        matchingEvents.reverse();
        return matchingEvents;
    }
}
exports.EventsDatabase = EventsDatabase;
