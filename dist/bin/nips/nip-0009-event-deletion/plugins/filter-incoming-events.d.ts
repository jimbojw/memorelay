/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Filter incoming events so that known deleted events make it no
 * further.
 */
import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
import { EventDeletionDatabase } from '../lib/event-deletion-database';
/**
 * Filter incoming event messages so that known deleted events make it no
 * further into the flow.
 * @param eventDeletionDatabase Event deletion database.
 * @param memorelayClient Client that may be sending or receiving events.
 * @returns Handler for disconnection.
 */
export declare function filterIncomingEvents(eventDeletionDatabase: EventDeletionDatabase, memorelayClient: MemorelayClient): Disconnectable;
