/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay entry point.
 */

import { MemorelayHub } from './core/lib/memorelay-hub';
import { createClients } from './core/plugins/create-clients';
import { PluginFn } from './core/types/plugin-types';
import { basicProtocol } from './nips/nip-0001-basic-protocol/plugins';
import { eventDeletion } from './nips/nip-0009-event-deletion/plugins';
import { relayInformationDocument } from './nips/nip-0011-relay-information-document/plugins/relay-information-document';

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
  constructor(...plugins: PluginFn<MemorelayHub>[]) {
    super(
      ...plugins,
      ...[
        // NIP-11 relay information document requests.
        relayInformationDocument,

        // NIP-05 event deletion.
        eventDeletion,

        // NIP-01 basic Nostr protocol support.
        basicProtocol,

        // (Core) Create MemorelayClient instances from connected WebSockets.
        createClients,
      ]
    );
  }
}
