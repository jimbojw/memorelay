/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay entry point.
 */

import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { pathToRegexp } from 'path-to-regexp';
import { WebSocket, WebSocketServer } from 'ws';

import { MemorelayClient } from './memorelay-client';
import { WebSocketServerConnectionEvent } from './events/web-socket-server-connection-event';
import { MemorelayClientCreatedEvent } from './events/memorelay-client-created-event';
import { DuplicateWebSocketError } from './errors/duplicate-web-socket-error';
import {
  BasicEventEmitter,
  BasicEventHandler,
} from './events/basic-event-emitter';

/**
 * Handler for an 'upgrade' event, which signals that a connected HTTP client is
 * requesting to upgrade the connection to a WebSocket.
 */
export type UpgradeHandler = (
  incomingMessage: IncomingMessage,
  socket: Socket,
  head: Buffer
) => void;

/**
 * Symbol for accessing the internal WebSocket server instance.
 */
export const WEBSOCKET_SERVER = Symbol('webSocketServer');

/**
 * Memorelay main class. Allows for configurable Nostr relay behavior.
 */
export class Memorelay extends BasicEventEmitter {
  /**
   * WebSocket server for handling requests.
   */
  private readonly webSocketServer = new WebSocketServer({ noServer: true });

  /**
   * Expose webSocketServer for testing.
   * @see WEBSOCKET_SERVER
   */
  readonly [WEBSOCKET_SERVER] = this.webSocketServer;

  /**
   * Mapping from WebSocket instances to MemorelayClient objects.
   */
  private readonly webSocketClientMap = new Map<WebSocket, MemorelayClient>();

  /**
   * Bound event listeners. Will be connected to their respective targets when
   * connect() is called.
   */
  protected readonly handlers: BasicEventHandler[] = [
    /**
     * When the Memorelay's WebSocketServer emits a 'connection' event, wrap it
     * in a WebSocketServerConnectionEvent and emit that. This gives other
     * listeners a chance to preventDefault().
     */
    {
      target: this.webSocketServer,
      type: 'connection',
      handler: (webSocket: WebSocket, request: IncomingMessage) => {
        this.emitBasic(
          new WebSocketServerConnectionEvent({ webSocket, request })
        );
      },
    },

    {
      target: this,
      type: WebSocketServerConnectionEvent.type,
      handler: (event: WebSocketServerConnectionEvent) => {
        this.handleWebSocketServerConnection(event);
      },
    },

    {
      target: this,
      type: MemorelayClientCreatedEvent.type,
      handler: (event: MemorelayClientCreatedEvent) => {
        !event.defaultPrevented && event.details.memorelayClient.connect();
      },
    },
  ];

  /**
   * Handler for self-emitted, WebSocketServerConnectionEvents which wrap
   * underlying WebSocket 'connection' events. This provides an opportunity for
   * other listeners to call preventDefault().
   *
   * @param event
   * @returns
   */
  handleWebSocketServerConnection(event: WebSocketServerConnectionEvent) {
    if (event.defaultPrevented) {
      return; // Client creation was prevented by a listener.
    }

    const { webSocket, request } = event.details;

    if (this.webSocketClientMap.has(webSocket)) {
      const error = new DuplicateWebSocketError(webSocket);
      this.emit(error.type, error);
      return;
    }

    const memorelayClient = new MemorelayClient(webSocket, request);
    this.webSocketClientMap.set(webSocket, memorelayClient);

    this.emitBasic(
      new MemorelayClientCreatedEvent({
        memorelayClient,
      })
    );
  }

  /**
   * Return a handler for upgrading HTTP client connections to WebSockets.
   *
   * Usage:
   *
   *   const memorelay = new Memorelay();
   *   const app = express();
   *   const server = app.listen(PORT);
   *   server.on('upgrade', memorelay.handleUpgrade());
   *
   * @param path Optional Express path to match. Defaults to '/'.
   * @returns Upgrade handler function.
   */
  handleUpgrade(path = '/'): UpgradeHandler {
    // Upgrade path string to regex.
    const regex = pathToRegexp(path);

    return (request: IncomingMessage, socket: Socket, head: Buffer) => {
      if (!request.url) {
        throw new Error('url missing');
      }

      // NOTE: The WHATWG URL standard requires a base, but its value doesn't
      // matter to us since we only need the path.
      const { pathname } = new URL(request.url, 'http://dummy');
      if (!regex.test(pathname)) {
        // Nothing to do here. The incoming message URL does not match.
        return;
      }

      this.webSocketServer.handleUpgrade(
        request,
        socket,
        head,
        (webSocket: WebSocket) => {
          this.webSocketServer.emit('connection', webSocket, request);
        }
      );
    };
  }
}
