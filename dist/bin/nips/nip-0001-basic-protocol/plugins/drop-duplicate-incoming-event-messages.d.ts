/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin to drop duplicate incoming EVENT messages.
 */
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
/**
 * Memorelay plugin to drop incoming EVENT messages if it has been seen before.
 * @param hub Event hub for inter-component communication.
 */
export declare function dropDuplicateIncomingEventMessages(hub: MemorelayHub): Disconnectable;
