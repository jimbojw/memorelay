/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay event hub.
 */

import { IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer } from 'ws';

import { UpgradeHandler } from '../types/upgrade-handler';
import { handleUpgrade } from './handle-upgrade';
import { RelayEvent } from '../events/relay-event';
import { RelayError } from '../errors/relay-error';
import { ConnectableEventEmitter } from './connectable-event-emitter';
import { Disconnectable } from '../types/disconnectable';
import { HttpServerRequestEvent } from '../events/http-server-request-event';
import { NextFunction } from 'express';

/**
 * Symbol for accessing the internal WebSocket server instance.
 */
export const WEBSOCKET_SERVER = Symbol('webSocketServer');

/**
 * Hub that underlies the Memorelay main class. Provides handler methods for
 * responding to HTTP requests and upgrading WebSocket connections.
 * @see Memorelay
 */
export class MemorelayHub extends ConnectableEventEmitter<
  RelayEvent,
  RelayError
> {
  /**
   * WebSocket server for handling requests.
   */
  private readonly webSocketServer = new WebSocketServer({ noServer: true });

  /**
   * Expose webSocketServer for testing.
   * @see WEBSOCKET_SERVER
   */
  readonly [WEBSOCKET_SERVER] = this.webSocketServer;

  constructor(readonly setupHandlers: () => Disconnectable[]) {
    super();
  }

  /**
   * Return a handler for responding to regular HTTP requests.
   *
   * Usage:
   *
   *   const memorelay = new Memorelay();
   *   const httpServer = createServer(memorelay.handleRequest());
   *   httpServer.on('upgrade', memorelay.handleUpgrade());
   *   httpServer.listen({ port: 3000 });
   */
  handleRequest() {
    return (
      request: IncomingMessage,
      response: ServerResponse,
      nextFn?: NextFunction
    ) => {
      const httpServerRequestEvent = new HttpServerRequestEvent(
        { request, response },
        { targetEmitter: this }
      );
      this.emitEvent(httpServerRequestEvent);
      if (nextFn && !httpServerRequestEvent.defaultPrevented) {
        nextFn();
      }
    };
  }

  /**
   * Return a handler for upgrading HTTP client connections to WebSockets.
   *
   * Usage:
   *
   *   const memorelay = new Memorelay();
   *   const httpServer = createServer(memorelay.handleRequest());
   *   httpServer.on('upgrade', memorelay.handleUpgrade());
   *   httpServer.listen({ port: 3000 });
   *
   * @param path Optional Express path to match. Defaults to '/'.
   * @returns Upgrade handler function.
   */
  handleUpgrade(path = '/'): UpgradeHandler {
    return handleUpgrade(this.webSocketServer, this, path);
  }
}
