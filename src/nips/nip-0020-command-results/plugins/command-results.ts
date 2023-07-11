/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin to implement NIP-20 Command Results.
 */

import { clearHandlers } from '../../../core/lib/clear-handlers';
import { Disconnectable } from '../../../core/types/disconnectable';

/**
 * Given an event emitter hub (presumed to be a Memorelay instance), attach
 * handlers to implement NIP-20.
 * @param hub Basic event emitter, often a Memorelay instance.
 * @returns Handler for disconnection.
 */
export function basicProtocol(/*hub: MemorelayHub*/): Disconnectable {
  const handlers: Disconnectable[] = [];

  // TODO(jimbo): Push handlers to implement NIP.

  return { disconnect: clearHandlers(handlers) };
}
