/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Create an http server with express and upgrade it with
 * memorelay generated middleware.
 */

import express, { Request, Response } from 'express';

import { Memorelay } from './memorelay';

const memorelay = new Memorelay();

const PORT = 3000;

const app = express();

app.use('/', memorelay.sendRelayDocument());

app.get('/', (req: Request, res: Response) => {
  res.send('HELLO WORLD');
});

app.listen(PORT, () => {
  console.log(`LISTENING:${PORT}`);
});
