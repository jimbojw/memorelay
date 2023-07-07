/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function to disconnect and clear an array of Handlers.
 */

import { Handler } from '../../experimental/types/handler';

/**
 * Returns a function which when called will remove all elements from the
 * provided array of handlers and call .disconnect() for each one.
 * @param handlers List of handlers to clear.
 * @returns Function which will clear all handlers.
 */
export function clearHandlers(handlers: Handler[]): () => void {
  return () => {
    handlers.splice(0).forEach((handler) => {
      handler.disconnect();
    });
  };
}