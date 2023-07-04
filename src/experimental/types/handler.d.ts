/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Object returned when setting up an event handler.
 */

/**
 * Object returned when setting up an event handler.
 */
export interface Handler {
  /**
   * When called, disconnects the previously attached listener.
   */
  disconnect: () => void;
}
