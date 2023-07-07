/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Create an http server with express and upgrade it with
 * memorelay generated middleware.
 */

import express, { Request, Response } from 'express';

import { Memorelay } from '../memorelay';
import { relayInformationDocument } from '../nip-0011-relay-information-document/plugins/relay-information-document';
import { loggingPlugin } from '../contrib/logging/logging-plugin';
import { cborPlugin } from '../contrib/cbor/cbor-plugin';

const PORT = 3000;

const memorelay = new Memorelay();

cborPlugin(memorelay);
loggingPlugin('silly')(memorelay);

memorelay.connect();

const app = express();

app.use('/', relayInformationDocument(memorelay));

app.get('/', (req: Request, res: Response) => {
  res.send('HELLO WORLD');
});

const server = app.listen(PORT, () => {
  console.log(`LISTENING:${PORT}`);
});

server.on('upgrade', memorelay.handleUpgrade());