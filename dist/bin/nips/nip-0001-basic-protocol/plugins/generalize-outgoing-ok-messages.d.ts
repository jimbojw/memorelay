/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for re-casting outgoing OK messages
 * as generic messages.
 */
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
/**
 * Memorelay plugin for re-casting outgoing OK messages as generic messages.
 * @param hub Event hub for inter-component communication.
 * @event OutgoingGenericMessageEvent
 */
export declare function generalizeOutgoingOKMessages(hub: MemorelayHub): Disconnectable;
