/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for upgrading connected WebSockets to
 * MemorelayClient instances.
 */
import { MemorelayHub } from '../lib/memorelay-hub';
/**
 * Core plugin to create MemorelayClient instances out of connected WebSockets.
 * @param hub Event hub for inter-plugin communication.
 * @return Plugin function.
 */
export declare function createClients(hub: MemorelayHub): import("../types/disconnectable").Disconnectable;
