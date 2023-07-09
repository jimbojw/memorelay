/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for basic logging.
 */

import { Logger } from 'winston';
import { IncomingMessage } from 'http';

import { Memorelay } from '../../memorelay';
import { MemorelayClientCreatedEvent } from '../../core/events/memorelay-client-created-event';
import { BadMessageError } from '../../nips/nip-0001-basic-protocol/errors/bad-message-error';
import { MemorelayClient } from '../../core/lib/memorelay-client';
import { WebSocketConnectedEvent } from '../../core/events/web-socket-connected-event';
import { WebSocketCloseEvent } from '../../core/events/web-socket-close-event';

import { Disconnectable } from '../../core/types/disconnectable';
import { MemorelayHub } from '../../core/lib/memorelay-hub';
import { ConnectableEventEmitter } from '../../core/lib/connectable-event-emitter';
import { MemorelayClientDisconnectEvent } from '../../core/events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../core/lib/clear-handlers';
import { BasicEvent } from '../../core/events/basic-event';
import { BasicError } from '../../core/errors/basic-error';
import { HttpServerRequestEvent } from '../../core/events/http-server-request-event';

export interface LoggingPluginOptions {
  /**
   * Instance to use for logging Memorelay events.
   */
  logger: Logger;

  /**
   * Memorelay instance to log.
   */
  memorelay: MemorelayHub;

  /**
   * Mapping from event types to logging levels. Set value to undefined to
   * prevent logging of that event type entirely.
   */
  levels?: Record<string, string | undefined>;
}

export class LoggingPlugin extends ConnectableEventEmitter {
  readonly logger: Logger;
  readonly memorelay: Memorelay;
  readonly levels: Record<string, string | undefined>;

  constructor(options: LoggingPluginOptions) {
    super();
    this.logger = options.logger;
    this.memorelay = options.memorelay;
    this.levels = Object.assign({}, options.levels);
  }

  override setupHandlers() {
    return [
      this.memorelay.onEvent(WebSocketConnectedEvent, this.logEvent('silly')),

      this.memorelay.onEvent(
        MemorelayClientCreatedEvent,
        this.logEvent('silly')
      ),

      this.memorelay.onEvent(HttpServerRequestEvent, this.logEvent('silly')),

      this.logMemorelayClientEvents(),
    ];
  }

  logEvent(defaultLevel?: string) {
    return (event: BasicEvent) => {
      const level = this.levels[event.type] ?? defaultLevel;
      if (level) {
        const key = getRequestKey(getEventRequest(event));
        this.logger.log(level, `(${key}): ${event.type}`);
      }
    };
  }

  logClientError(memorelayClient: MemorelayClient, defaultLevel?: string) {
    const key = getRequestKey(memorelayClient.request);
    return (error: BasicError) => {
      const level = this.levels[error.type] ?? defaultLevel;
      if (level) {
        this.logger.log(level, `(${key}): ${error.message}`);
      }
    };
  }

  logMemorelayClientEvents() {
    return this.memorelay.onEvent(
      MemorelayClientCreatedEvent,
      ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
        const handlers: Disconnectable[] = [];

        handlers.push(
          memorelayClient.onEvent(WebSocketCloseEvent, this.logEvent('silly')),
          memorelayClient.onError(
            BadMessageError,
            this.logClientError(memorelayClient, 'silly')
          ),
          memorelayClient.onEvent(
            MemorelayClientDisconnectEvent,
            this.logEvent('silly')
          ),
          memorelayClient.onEvent(
            MemorelayClientDisconnectEvent,
            clearHandlers(handlers)
          )
        );

        return { disconnect: clearHandlers(handlers) };
      }
    );
  }
}

/**
 * Given an event, search through itself and its parents for the original
 * request that spawned it.
 * @param event The event to search.
 * @returns Found request, or undefined if one couldn't be found.
 */
function getEventRequest(event: BasicEvent): IncomingMessage | undefined {
  const details = event.details as
    | { request?: IncomingMessage; memorelayClient?: MemorelayClient }
    | undefined;
  return (
    details?.request ??
    details?.memorelayClient?.request ??
    (event.parentEvent && getEventRequest(event.parentEvent))
  );
}

/**
 * Given a request, return the hex-encoded first few bytes of the
 * sec-websocket-key header value, or the defaultValue if the header is
 * undefined.
 * @param request The request to investigate.
 * @param defaultValue Optional default value to use if header is undefined.
 * @returns The sec-websocket-key header or defaultValue.
 */
function getRequestKey(request?: IncomingMessage, defaultValue = 'undefined') {
  const secWebSocketKey = request?.headers['sec-websocket-key'];
  if (!secWebSocketKey) {
    return defaultValue;
  }
  return Buffer.from(secWebSocketKey, 'base64').subarray(0, 4).toString('hex');
}
