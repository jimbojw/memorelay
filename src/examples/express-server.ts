/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Create an http server with express and upgrade it with
 * memorelay generated middleware.
 */

import { createLogger, format, transports } from 'winston';
import express, { Request, Response } from 'express';

import { Memorelay } from '../memorelay';
import { LoggingPlugin } from '../contrib/logging/logging-plugin';
import { cborPlugin } from '../contrib/cbor/cbor-plugin';

const PORT = 3000;
const LOG_LEVEL = process.env.LOG_LEVEL ?? 'silly';

const memorelay = new Memorelay(cborPlugin);

const logger = createLogger({
  transports: [new transports.Console({ level: LOG_LEVEL })],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.splat(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp as string}] ${level}: ${message as string}`;
    })
  ),
});

new LoggingPlugin({ logger, memorelay }).connect();

memorelay.connect();

const app = express();

app.use('/', memorelay.handleRequest());

app.get('/', (req: Request, res: Response) => {
  res.send('HELLO WORLD');
});

const server = app.listen(PORT, () => {
  console.log(`LISTENING:${PORT}`);
});

server.on('upgrade', memorelay.handleUpgrade());
