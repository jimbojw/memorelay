/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Types related to plugins.
 */

import { MemorelayHub } from '../lib/memorelay-hub';
import { Disconnectable } from './disconnectable';

/**
 * A standard plugin function takes a hub and returns a disconnectable handler.
 */
export type PluginFn = (hub: MemorelayHub) => Disconnectable;
