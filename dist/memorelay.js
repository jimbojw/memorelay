"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay entry point.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memorelay = void 0;
const memorelay_hub_1 = require("./core/lib/memorelay-hub");
const create_clients_1 = require("./core/plugins/create-clients");
const plugins_1 = require("./nips/nip-0001-basic-protocol/plugins");
const plugins_2 = require("./nips/nip-0009-event-deletion/plugins");
const relay_information_document_1 = require("./nips/nip-0011-relay-information-document/plugins/relay-information-document");
const plugins_3 = require("./nips/nip-0020-command-results/plugins");
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
class Memorelay extends memorelay_hub_1.MemorelayHub {
    constructor(...plugins) {
        super(...plugins, ...[
            // NIP-20 command results.
            plugins_3.commandResults,
            // NIP-11 relay information document requests.
            relay_information_document_1.relayInformationDocument,
            // NIP-05 event deletion.
            plugins_2.eventDeletion,
            // NIP-01 basic Nostr protocol support.
            plugins_1.basicProtocol,
            // (Core) Create MemorelayClient instances from connected WebSockets.
            create_clients_1.createClients,
        ]);
    }
}
exports.Memorelay = Memorelay;
