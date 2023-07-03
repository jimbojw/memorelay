/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay entry point.
 */

import { MemorelayHub } from './core/memorelay-hub';
import { RelayError } from './errors/relay-error';
import { RelayEvent } from './events/relay-event';
import { createClients } from './plugins/create-clients';
import { basicProtocol } from './plugins/nip-001-basic-protocol';

/**
 * Memorelay main class. Extends MemorelayHub and attaches default behavior.
 */
export class Memorelay<
  PluginRelayEvent extends RelayEvent = RelayEvent,
  PluginRelayError extends RelayError = RelayError
> extends MemorelayHub<
  PluginRelayEvent | RelayEvent,
  PluginRelayError | RelayError
> {
  /**
   * Install default plugins, which will begin listening for various events.
   *
   * Connecting is delayed until connect() is called because the underlying
   * EventEmitter will invoke handlers as they appear. This gives API users a
   * chance to add their own listeners, which will be invoked first.
   * @returns this
   */
  connect(): this {
    // Upgrade connected WebSockets to full MemorelayClient instances.
    createClients(this);

    // Implement basic Nostr protocol support.
    basicProtocol(this);

    return this;
  }
}
