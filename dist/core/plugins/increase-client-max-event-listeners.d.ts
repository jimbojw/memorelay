/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for increasing the maximum allowable
 * number of listeners on clients.
 */
import { PluginFn } from '../types/plugin-types';
import { MemorelayHub } from '../lib/memorelay-hub';
/**
 * Memorelay core plugin for increasing the maximum number of allowed listeners
 * on connected clients.
 */
export declare function increaseClientMaxEventListeners(increaseCount: number): PluginFn<MemorelayHub>;
