/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Entry point for Memorelay server (bin file).
 */

import { MemorelayServer } from './lib/memorelay-server';

import { createLogger, format, transports } from 'winston';

// TODO(jimbo): Make these configurable.
const PORT = 3000;
const LOG_LEVEL = 'silly';

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

const server = new MemorelayServer(PORT, logger);

function reportErrorAndExit(error: unknown) {
  logger.log('error', error);
  process.exit(1);
}

function shutdownAndExit() {
  server
    .stop()
    .then((success) => {
      if (success) {
        return process.exit(0);
      }
      logger.log('warning', 'Server did not stop cleanly');
      process.exit(1);
    })
    .catch(reportErrorAndExit);
}

process.once('SIGBREAK', shutdownAndExit);
process.once('SIGINT', shutdownAndExit);
process.once('SIGTERM', shutdownAndExit);

server.listen().catch(reportErrorAndExit);
