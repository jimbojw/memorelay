/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin to implement NIP-09 Event Deletion.
 */
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
/**
 * Attach handlers to implement NIP-09 Event Deletion.
 * @param hub Event hub, often a Memorelay instance.
 * @returns Handler for disconnection.
 */
export declare function eventDeletion(hub: MemorelayHub): Disconnectable;
