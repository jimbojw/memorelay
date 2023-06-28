/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay entry point.
 */

import { NextFunction, Request, RequestHandler, Response } from 'express';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { pathToRegexp } from 'path-to-regexp';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { EventEmitter } from 'events';

import { RelayInformationDocument } from '../lib/relay-information-document';
import {
  RawMessageHandler,
  RawMessageHandlerNextFunction,
} from './middleware-types';
import { MemorelayClient } from './memorelay-client';

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
 *
 * Interaction modes:
 *
 * - Events - Instances of this class will emit events to which the upstream
 *   code can listen. By their nature, events are asynchronous and are meant to
 *   be informative, not transformative.
 * - Middleware - Memorelay instances offer Express-style middleware hooks to
 *   allow upstream code to alter the data flow. This capability also powers
 *   internal mechanisms such as implementing Nostr NIP features.
 *
 * @event websocket-error An 'error' event raised by a WebSocket. Params: err,
 * webSocket, request.
 */
export class Memorelay extends EventEmitter {
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
   * Middleware handlers for WebSocket raw 'message' events.
   * @see RawMessageHandler
   */
  private readonly webSocketRawMessageHandlers: RawMessageHandler[] = [];

  constructor() {
    super();
    this.webSocketServer.on(
      'connection',
      (webSocket: WebSocket, request: IncomingMessage) => {
        if (this.webSocketClientMap.has(webSocket)) {
          throw new Error('duplicate WebSocket detected');
        }
        const memorelayClient: MemorelayClient = { webSocket, request };
        this.webSocketClientMap.set(webSocket, memorelayClient);
        webSocket.on('error', (err: unknown) => {
          this.emit('websocket-error', err, webSocket, request);
        });
        webSocket.on('message', (data: RawData, isBinary: boolean) => {
          void this.processWebSocketRawMessage(memorelayClient, data, isBinary);
        });
      }
    );
  }

  /**
   * Process a WebSocket raw 'message' by invoking registered middleware
   * handlers.
   */
  async processWebSocketRawMessage(
    memorelayClient: MemorelayClient,
    data: RawData,
    isBinary: boolean
  ) {
    interface Results {
      status?: 'done';
      buffer?: Buffer;
      isBinary?: boolean;
    }
    for (const webSocketRawMessageHandler of this.webSocketRawMessageHandlers) {
      let resolve: (results: Results) => void;
      const promise = new Promise<Results>((resolveArg) => {
        resolve = resolveArg;
      });
      const nextFunction: RawMessageHandlerNextFunction = (
        status?: 'done',
        buffer?: Buffer,
        isBinary?: boolean
      ) => {
        resolve({ status, buffer, isBinary });
      };
      webSocketRawMessageHandler(memorelayClient, data, isBinary, nextFunction);
      const results = await promise;
      if (results.status === 'done') {
        // TODO(jimbo): Use middleware-generated results to proceed.
        break;
      }
    }
    console.log(memorelayClient, isBinary, data);
  }

  /**
   * Generate and return the NIP-11 relay information document.
   * @see https://github.com/nostr-protocol/nips/blob/master/11.md
   */
  getRelayDocument(): RelayInformationDocument {
    return {
      supported_nips: [1, 9, 11, 20],
    };
  }

  /**
   * Return an Express middleware function for handling NIP-11 Nostr relay
   * document requests.
   *
   * Usage:
   *
   *   const memorelay = new Memorelay();
   *   const app = express();
   *   app.use('/', memorelay.sendRelayDocument);
   *
   * @see https://github.com/nostr-protocol/nips/blob/master/11.md
   * @return Express request handler.
   */
  get sendRelayDocument(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.header('Accept') !== 'application/nostr+json') {
        next();
        return;
      }

      if (
        req.method !== 'HEAD' &&
        req.method !== 'GET' &&
        req.method !== 'OPTIONS'
      ) {
        res
          .status(501)
          .send({ error: `Method not implemented: ${req.method}` });
        return;
      }

      if (req.header('Access-Control-Request-Headers')) {
        // TODO(jimbo): Should the list of allowed headers be restricted?
        res.set('Access-Control-Allow-Headers', '*');
      }
      res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.set('Access-Control-Allow-Origin', '*');

      if (req.method === 'OPTIONS') {
        next();
        return;
      }

      res
        .set('Content-Type', 'application/nostr+json')
        .status(200)
        .send(this.getRelayDocument());
    };
  }

  /**
   * Return a handler for upgrading HTTP client connections to WebSockets.
   *
   * Usage:
   *
   *   const memorelay = new Memorelay();
   *   const app = express();
   *   const server = app.listen(PORT);
   *   server.on('upgrade', memorelay.handleUpgrade()));
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
