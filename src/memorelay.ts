/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay entry point.
 */

import { MemorelayHub } from './core/lib/memorelay-hub';
import { createClients } from './core/plugins/create-clients';
import { basicProtocol } from './nips/nip-0001-basic-protocol/plugins';
import { relayInformationDocument } from './nips/nip-0011-relay-information-document/plugins/relay-information-document';
import { commandResults } from './nips/nip-0020-command-results/plugins/command-results';

/**
 * Memorelay main class. Extends MemorelayHub and attaches default behavior.
 *
 * Note: You MUST call connect() to attach Memorelay's event handlers. Handlers
 * are delayed until connect() to give plugins a chance to listen and be earlier
 * in the event handling stack.
 *
 * Example usage with native Node http module:
 *
 *   const memorelay = new Memorelay().connect();
 *   const httpServer = createServer(memorelay.handleRequest());
 *   httpServer.on('upgrade', memorelay.handleUpgrade());
 *   httpServer.listen({ port: 3000 });
 *
 * Example usage with Express:
 *
 *   const memorelay = new Memorelay().connect();
 *   const app = express();
 *   app.use('/', memorelay.handleRequest());
 *   app.get('/', (req, res) => {
 *     res.send('HELLO WORLD');
 *   });
 *   const server = app.listen(3000);
 *   server.on('upgrade', memorelay.handleUpgrade());
 */
export class Memorelay extends MemorelayHub {
  constructor() {
    // NOTE: EventEmitter listeners are invoked in the order in which they are
    // added. So here we attach plugins in reverse order so that the core
    // event handlers are attached last.
    super(() => [
      // Implement NIP-20 command results.
      commandResults(this),

      // Implement NIP-11 relay information document requests.
      relayInformationDocument(this),

      // Implement NIP-01 basic Nostr protocol support.
      basicProtocol(this),

      // Upgrade connected WebSockets to full MemorelayClient instances.
      createClients(this),
    ]);
  }
}
