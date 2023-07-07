/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for basic logging.
 */

import { Logger, createLogger, format, transports } from 'winston';
import { Memorelay } from '../../../memorelay';
import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { BadMessageError } from '../../errors/bad-message-error';
import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { WebSocketConnectedEvent } from '../../../core/events/web-socket-connected-event';
import { WebSocketCloseEvent } from '../../../core/events/web-socket-close-event';

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
    logWebSocketConnected(memorelay, logger);

    logMemorelayClientCreated(memorelay, logger);

    memorelay.onEvent(
      MemorelayClientCreatedEvent,
      ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
        logWebSocketClose(memorelayClient, logger);
        logWebSocketError(memorelayClient, logger);
        logBadMessageError(memorelayClient, logger);
      }
    );
  };
}

function logWebSocketConnected(
  memorelay: Memorelay,
  logger: Logger,
  level = 'silly'
) {
  memorelay.onEvent(
    WebSocketConnectedEvent,
    (webSocketConnectedEvent: WebSocketConnectedEvent) => {
      const { request } = webSocketConnectedEvent.details;
      const key = request.headers['sec-websocket-key'];
      logger.log(level, `socket connected: ${key ?? 'undefined'}`);
    }
  );
}

function logMemorelayClientCreated(
  memorelay: Memorelay,
  logger: Logger,
  level = 'silly'
) {
  memorelay.onEvent(
    MemorelayClientCreatedEvent,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { request } = memorelayClientCreatedEvent.details.memorelayClient;
      const secWebSocketKey =
        request.headers['sec-websocket-key'] ?? 'undefined';
      logger.log(level, `client connected: ${secWebSocketKey}`);
    }
  );
}

function logBadMessageError(
  memorelayClient: MemorelayClient,
  logger: Logger,
  level = 'debug'
) {
  memorelayClient.onError(
    BadMessageError,
    (badMessageError: BadMessageError) => {
      logger.log(level, badMessageError.message);
    }
  );
}

function logWebSocketClose(
  memorelayClient: MemorelayClient,
  logger: Logger,
  level = 'silly'
) {
  const secWebSocketKey =
    memorelayClient.request.headers['sec-websocket-key'] ?? 'undefined';
  memorelayClient.onEvent(
    WebSocketCloseEvent,
    (webSocketCloseEvent: WebSocketCloseEvent) => {
      const { code } = webSocketCloseEvent.details;
      logger.log(level, `socket closed: ${secWebSocketKey} ${code}`);
    }
  );
}

function logWebSocketError(
  memorelayClient: MemorelayClient,
  logger: Logger,
  level = 'debug'
) {
  memorelayClient.webSocket.on('error', (error) => {
    logger.log(level, error);
  });
}
