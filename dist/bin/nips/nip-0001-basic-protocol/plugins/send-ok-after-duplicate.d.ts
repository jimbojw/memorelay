/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send OK after duplicate event.
 */
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
/**
 * After a DuplicateEventMessageEvent, send an OutgoingOKMessageEvent.
 * @param hub Event hub for inter-component communication.
 * @emits OutgoingOKMessageEvent
 */
export declare function sendOKAfterDuplicate(hub: MemorelayHub): Disconnectable;
