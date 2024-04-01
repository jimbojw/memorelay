/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send an OK message after a bad incoming EVENT message.
 */
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
/**
 * After a BadMessageErrorEvent where an EVENT object was malformed, send an
 * OutgoingOKMessageEvent.
 * @param hub Event hub for inter-component communication.
 * @emits OutgoingOKMessageEvent
 */
export declare function sendOKAfterBadEvent(hub: MemorelayHub): Disconnectable;
