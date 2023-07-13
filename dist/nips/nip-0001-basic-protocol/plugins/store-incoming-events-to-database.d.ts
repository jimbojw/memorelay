/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin to store incoming events to the database.
 */
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { EventsDatabase } from '../lib/events-database';
import { PluginFn } from '../../../core/types/plugin-types';
/**
 * Memorelay plugin for storing incoming events.
 * @param eventsDatabase Shared database of events.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export declare function storeIncomingEventsToDatabase(eventsDatabase: EventsDatabase): PluginFn<MemorelayHub>;
