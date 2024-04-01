/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send OK message after event is added to the database.
 */
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
/**
 * After a DidAddEventToDatabaseEvent, send an OutgoingOKMessageEvent.
 * @param hub Event hub for inter-component communication.
 * @emits OutgoingOKMessageEvent
 */
export declare function sendOKAfterDatabaseAdd(hub: MemorelayHub): Disconnectable;
