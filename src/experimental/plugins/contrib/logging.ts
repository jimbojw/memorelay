/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for basic logging.
 */

import { Logger, createLogger, format, transports } from 'winston';
import { Memorelay } from '../../memorelay';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { BadMessageError } from '../../../lib/bad-message-error';
import { MemorelayClient } from '../../core/memorelay-client';

/**
 * Rudimentary logging plugin for seeing what's going on under the hood.
 *
 * Usage:
 *
 *   const memorelay = new Memorelay().connect();
 *   loggingPlugin('silly')(memorelay);
 *
 * @param level Log level to display.
 * @returns Memorelay plugin function.
 */
export function loggingPlugin(level = 'warn'): (memorelay: Memorelay) => void {
  const formatOptions = [
    format.colorize(),
    format.timestamp(),
    format.splat(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp as string}] ${level}: ${message as string}`;
    }),
  ];

  const logger = createLogger({
    transports: [new transports.Console({ level })],
    format: format.combine(...formatOptions),
  });

  return (memorelay: Memorelay) => {
    logMemorelayClientCreated(memorelay, logger);
    memorelay.on(
      MemorelayClientCreatedEvent.type,
      ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
        logBadMessageError(memorelayClient, logger);
      }
    );
  };
}

function logMemorelayClientCreated(
  memorelay: Memorelay,
  logger: Logger,
  level = 'silly'
) {
  memorelay.on(
    MemorelayClientCreatedEvent.type,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { request } = memorelayClientCreatedEvent.details.memorelayClient;
      const key = request.headers['sec-websocket-key'];
      logger.log(level, `client connected: ${key ?? 'undefined'}`);
    }
  );
}

function logBadMessageError(
  memorelayClient: MemorelayClient,
  logger: Logger,
  level = 'debug'
) {
  memorelayClient.on(
    BadMessageError.type,
    (badMessageError: BadMessageError) => {
      logger.log(level, badMessageError.message);
    }
  );
}
