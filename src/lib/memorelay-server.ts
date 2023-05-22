/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay WebSocket server.
 */

import { InternalError } from './internal-error';
import { MemorelayCoordinator } from './memorelay-coordinator';
import { RelayInformationDocument } from './relay-information-document';
import { Subscriber } from './subscriber';

import { createServer } from 'http';
import { Logger } from 'winston';
import { IncomingMessage, ServerResponse } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { CreatePromiseResult, createPromise } from './create-promise';

export class MemorelayServer {
  /**
   * HTTP server to listen for connections.
   */
  private readonly httpServer = createServer((request, response) => {
    this.handleRequest(request, response);
  });

  /**
   * WebSocketServer to listen for connections.
   */
  private readonly webSocketServer = new WebSocketServer({ noServer: true });

  /**
   * Backing coordinator instance for managing received events.
   */
  private readonly coordinator = new MemorelayCoordinator();

  /**
   * Mapping from WebSockets to the connected Subscriber objects.
   */
  private readonly subscribers = new Map<WebSocket, Subscriber>();

  /**
   * Promise for the active call to `listen()`.
   */
  private listeningPromise?: CreatePromiseResult<boolean>;

  /**
   * Promise for the active call to `stop()`.
   */
  private stoppingPromise?: CreatePromiseResult<boolean>;

  /**
   * @param port TCP port on which to listen.
   * @param logger Logger to use for reporting.
   */
  constructor(readonly port: number, readonly logger: Logger) {
    this.httpServer.on('upgrade', (request, socket, head) => {
      if (request.url === undefined) {
        this.logger.log('warning', 'Request url is undefined');
        socket.destroy();
        return;
      }

      if (request.url !== '/') {
        this.logger.log(
          'verbose',
          `Rejecting WebSocket upgrade on non-root path: ${request.url}`
        );
        socket.destroy();
        return;
      }

      this.webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
        this.webSocketServer.emit('connection', webSocket, request);
      });
    });

    this.httpServer.on('error', (error: unknown) => {
      this.logger.log('error', error);
      if (this.listeningPromise) {
        this.listeningPromise.reject(error);
      }
    });

    this.webSocketServer.on('connection', (webSocket, request) => {
      this.connect(webSocket, request);
    });
  }

  /**
   * Begin listening for HTTP connections.
   * @returns A promise which resolves to whether the listening was successful.
   */
  async listen(): Promise<boolean> {
    if (this.listeningPromise || this.httpServer.listening) {
      return Promise.resolve(false);
    }
    this.listeningPromise = createPromise<boolean>();
    const { promise, resolve } = this.listeningPromise;
    this.httpServer.listen({ port: this.port }, () => {
      this.logger.log('info', `Memorelay listening on port ${this.port}`);
      resolve(true);
      this.listeningPromise = undefined;
    });
    return promise;
  }

  /**
   * Stop listening for WebSocket connections.
   * @returns A promise that resolves to whether the stopping was successful.
   */
  async stop(): Promise<boolean> {
    if (this.stoppingPromise || !this.httpServer.listening) {
      return Promise.resolve(false);
    }
    this.stoppingPromise = createPromise<boolean>();
    const { promise, resolve, reject } = this.stoppingPromise;
    this.httpServer.close((error) => {
      this.stoppingPromise = undefined;
      if (error) {
        reject(error);
        return;
      }
      this.logger.log('info', 'Memorelay closed');
      resolve(true);
    });
    return promise;
  }

  /**
   * Accept an incoming WebSocket connection. Should generally only be called by
   * the WebSocketServer's 'connection' event handler.
   * @param webSocket The WebSocket client that has connected.
   * @param incomingMessage The incoming http request.
   * @returns The connected Subscriber object.
   * @throws If the webSocket is already connected.
   */
  connect(webSocket: WebSocket, incomingMessage: IncomingMessage): Subscriber {
    if (this.subscribers.has(webSocket)) {
      throw new Error('websocket is already connected');
    }

    const subscriber = new Subscriber(
      webSocket,
      incomingMessage,
      this.logger,
      this.coordinator
    );
    this.subscribers.set(webSocket, subscriber);

    webSocket.on('close', () => {
      if (!this.subscribers.has(webSocket)) {
        throw new InternalError('close event received for missing websocket');
      }
      this.subscribers.delete(webSocket);
    });

    return subscriber;
  }

  /**
   * Handle an incoming http request.
   */
  handleRequest(request: IncomingMessage, response: ServerResponse) {
    if (request.method !== 'HEAD' && request.method !== 'GET') {
      response.writeHead(501, { 'Content-Type': 'text/plain' });
      response.write(
        `Method not implemented: ${request.method ?? 'undefined'}`
      );
      response.end();
    }

    if (request.headers.accept === 'application/nostr+json') {
      this.sendRelayDocument(request, response);
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write('memorelay');
    response.end();
  }

  /**
   * Send the NIP-11 relay information document.
   */
  sendRelayDocument(request: IncomingMessage, response: ServerResponse) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    if (request.method === 'GET') {
      response.write(JSON.stringify(this.getRelayDocument()));
    }
    response.end();
  }

  /**
   * Return the NIP-11 relay information document.
   */
  getRelayDocument(): RelayInformationDocument {
    return {
      supported_nips: [1, 9, 11],
    };
  }
}
