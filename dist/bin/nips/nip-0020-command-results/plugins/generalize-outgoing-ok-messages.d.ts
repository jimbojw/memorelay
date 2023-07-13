/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Generalize outgoing OK messages as generic.
 */
import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
/**
 * After an OutgoingOKMessage, emit an OutgoingGeneralMessageEvent.
 * @param memorelayClient The client to plug into.
 * @returns Handler.
 * @emits OutgoingGeneralMessageEvent
 */
export declare function generalizeOutgoingOKMessage(memorelayClient: MemorelayClient): Disconnectable;
