/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay entry point.
 */

import { MemorelayHub } from './memorelay-hub';
import { createClients } from './create-clients';
import { parseIncomingJsonMessages } from './parse-incoming-json-messages';

/**
 * Memorelay main class. Extends MemorelayHub and attaches default behavior.
 */
export class Memorelay extends MemorelayHub {
  /**
   * Install default plugins, which will begin listening for various events.
   *
   * Connecting is delayed until connect() is called because the underlying
   * EventEmitter will invoke handlers as they appear. This gives API users a
   * chance to add their own listeners, which will be invoked first.
   * @returns
   */
  connect(): this {
    super.connect();
    createClients(this);
    parseIncomingJsonMessages(this);
    return this;
  }
}
