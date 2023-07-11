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
import { MemorelayClient } from '../../core/lib/memorelay-client';

import { Disconnectable } from '../../core/types/disconnectable';
import { MemorelayHub } from '../../core/lib/memorelay-hub';
import { ConnectableEventEmitter } from '../../core/lib/connectable-event-emitter';
import { clearHandlers } from '../../core/lib/clear-handlers';
import { BasicEvent } from '../../core/events/basic-event';
import { BasicError } from '../../core/errors/basic-error';
import { PreflightEvent } from '../../core/events/preflight-event';
import { RelayEvent } from '../../core/events/relay-event';
import { ClientEvent } from '../../core/events/client-event';
import { PreflightErrorEvent } from '../../core/events/preflight-error-event';

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
  readonly hubEventTypes = new Set<string>();
  readonly hubErrorTypes = new Set<string>();

  constructor(options: LoggingPluginOptions) {
    super();
    this.logger = options.logger;
    this.memorelay = options.memorelay;
    this.levels = Object.assign({}, options.levels);
  }

  /**
   * Handle preflight events on the hub and clients by listening for the payload
   * event type.
   */
  override setupHandlers() {
    return [
      this.memorelay.onEvent(
        PreflightEvent,
        (preflightEvent: PreflightEvent<RelayEvent>) => {
          const { event } = preflightEvent.details;
          if (!this.hubEventTypes.has(event.type)) {
            this.hubEventTypes.add(event.type);
            this.memorelay.onEvent(event, this.logEvent('silly'));
          }
        }
      ),

      this.memorelay.onEvent(
        PreflightErrorEvent,
        (preflightErrorEvent: PreflightErrorEvent) => {
          const { error } = preflightErrorEvent.details;
          if (!this.hubErrorTypes.has(error.type)) {
            this.hubErrorTypes.add(error.type);
            this.memorelay.onError(error, this.logError('silly'));
          }
        }
      ),

      this.memorelay.onEvent(
        MemorelayClientCreatedEvent,
        ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
          const clientEventTypes = new Set<string>();
          const clientErrorTypes = new Set<string>();
          const handlers: Disconnectable[] = [];

          handlers.push(
            memorelayClient.onEvent(
              PreflightEvent,
              (preflightEvent: PreflightEvent<ClientEvent>) => {
                const { event } = preflightEvent.details;
                if (!clientEventTypes.has(event.type)) {
                  clientEventTypes.add(event.type);
                  handlers.push(
                    memorelayClient.onEvent(
                      event,
                      this.logClientEvent(memorelayClient, 'silly')
                    )
                  );
                }
              }
            ),
            memorelayClient.onEvent(
              PreflightErrorEvent,
              (preflightErrorEvent: PreflightErrorEvent) => {
                const { error } = preflightErrorEvent.details;
                if (!clientErrorTypes.has(error.type)) {
                  clientErrorTypes.add(error.type);
                  handlers.push(
                    memorelayClient.onError(
                      error,
                      this.logClientError(memorelayClient, 'silly')
                    )
                  );
                }
              }
            )
          );

          return { disconnect: clearHandlers(handlers) };
        }
      ),
    ];
  }

  logEvent(defaultLevel?: string) {
    return (event: BasicEvent) => {
      const level = this.levels[event.type] ?? defaultLevel;
      if (level) {
        const key = getRequestKey(getEventRequest(event));
        const depth = '.'.repeat(countAncestors(event));
        this.logger.log(level, `(${key}): ${depth}${event.type}`);
      }
    };
  }

  logError(defaultLevel?: string) {
    return (error: BasicError) => {
      const level = this.levels[error.type] ?? defaultLevel;
      if (level) {
        this.logger.log(level, `${error.type}: ${error.message}`);
      }
    };
  }

  logClientEvent(memorelayClient: MemorelayClient, defaultLevel?: string) {
    return (event: BasicEvent) => {
      const level = this.levels[event.type] ?? defaultLevel;
      if (level) {
        const key = getRequestKey(memorelayClient.request);
        const depth = '.'.repeat(countAncestors(event));
        this.logger.log(level, `(${key}): ${depth}${event.type}`);
      }
    };
  }

  logClientError(memorelayClient: MemorelayClient, defaultLevel?: string) {
    const key = getRequestKey(memorelayClient.request);
    return (error: BasicError) => {
      const level = this.levels[error.type] ?? defaultLevel;
      if (level) {
        this.logger.log(level, `(${key}): ${error.type}: ${error.message}`);
      }
    };
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

/**
 * Determine the number of ancestor events a given event has. An event with an
 * undefined parentEvent has an ancestor count of 0. An event with a parentEvent
 * has its parentEvent's ancestor count plus 1.
 * @param basicEvent
 */
function countAncestors(basicEvent: BasicEvent): number {
  let ancestorCount = 0;
  let parentEvent = basicEvent.parentEvent;
  while (parentEvent) {
    ancestorCount++;
    parentEvent = parentEvent.parentEvent;
  }
  return ancestorCount;
}
