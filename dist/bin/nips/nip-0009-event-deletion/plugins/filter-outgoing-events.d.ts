/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Filter outgoing events so that deleted events are not emitted.
 */
import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
import { EventDeletionDatabase } from '../lib/event-deletion-database';
/**
 * Filter outgoing event messages so that deleted events are not emitted.
 * @param eventDeletionDatabase Event deletion database.
 * @param memorelayClient Client that may be sending or receiving events.
 * @returns Handler for disconnection.
 */
export declare function filterOutgoingEvents(eventDeletionDatabase: EventDeletionDatabase, memorelayClient: MemorelayClient): Disconnectable;
