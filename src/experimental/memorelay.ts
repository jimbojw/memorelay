/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay entry point.
 */

import { MemorelayHub } from './core/memorelay-hub';
import { createClients } from './plugins/create-clients';
import {
  parseIncomingJsonMessages,
  validateIncomingEventMessages,
  validateIncomingReqMessages,
} from './plugins/nip-01-basic-protocol';

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

    // Upgrade connected WebSockets to full MemorelayClient instances.
    createClients(this);

    // Parse incoming WebSocket 'message' buffers as generic Nostr messages.
    parseIncomingJsonMessages(this);

    // Validate and upgrade incoming EVENT and REQ messages.
    validateIncomingEventMessages(this);
    validateIncomingReqMessages(this);

    return this;
  }
}
