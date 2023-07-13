/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send OK message after event is added to the database.
 */
import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
/**
 * After a DidAddEventToDatabaseEvent, send an OutgoingOKMessageEvent.
 * @param memorelayClient The client to plug into.
 * @returns Handler.
 * @emits OutgoingOKMessageEvent
 */
export declare function sendOKAfterDatabaseAdd(memorelayClient: MemorelayClient): Disconnectable;
