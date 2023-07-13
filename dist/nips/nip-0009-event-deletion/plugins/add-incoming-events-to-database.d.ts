/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Add incoming events to the event deletion database.
 */
import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
import { EventDeletionDatabase } from '../lib/event-deletion-database';
/**
 * Add incoming events to the database.
 * @param eventDeletionDatabase Event deletion database.
 * @param memorelayClient Client that may be sending or receiving events.
 * @returns Handler for disconnection.
 */
export declare function addIncomingEventsToDatabase(eventDeletionDatabase: EventDeletionDatabase, memorelayClient: MemorelayClient): Disconnectable;
