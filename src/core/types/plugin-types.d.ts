/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Types related to plugins.
 */

import { BasicEventEmitter } from '../lib/basic-event-emitter';
import { Disconnectable } from './disconnectable';

/**
 * A standard plugin function takes a hub and returns a disconnectable handler.
 */
export type PluginFn<EmitterType extends BasicEventEmitter> = (
  hub: EmitterType
) => Disconnectable;
