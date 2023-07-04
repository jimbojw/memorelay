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
  constructor() {
    super(() => [
      // Upgrade connected WebSockets to full MemorelayClient instances.
      createClients(this),

      // Implement basic Nostr protocol support.
      basicProtocol(this),
    ]);
  }
}
