/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function to disconnect and clear an array of Handlers.
 */

import { Disconnectable } from '../types/disconnectable';

/**
 * Disconnect all handlers and empty the array..
 * @param handlers List of handlers to clear.
 */
export function disconnectAll(handlers: Disconnectable[]) {
  handlers.splice(0).forEach((handler) => {
    handler.disconnect();
  });
}
