/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview EXPERIMENTAL - Memorelay plugin to implement CBOR.
 */
import { MemorelayHub } from '../../core/lib/memorelay-hub';
/**
 * Plugin setup function. Establishes listeners on a Memorelay instance.
 * @param hub The Memorelay instance to connect to.
 */
export declare function cborPlugin(hub: MemorelayHub): import("../../core/types/disconnectable").Disconnectable;
