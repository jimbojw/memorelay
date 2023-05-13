/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay WebSocket server.
 */

import { InternalError } from './internal-error';
import { Subscriber } from './subscriber';

import { Logger } from 'winston';
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

export class MemorelayServer {
  private webSocketServer?: WebSocketServer;

  /**
   * Mapping from WebSockets to the connected Subscriber objects.
   */
  private readonly subscribers = new Map<WebSocket, Subscriber>();

  constructor(readonly port: number, readonly logger: Logger) {}

  /**
   * Begin listening for WebSocket connections.
   * @returns A promise which resolves to whether the listening was successful.
   */
  async listen(): Promise<boolean> {
    if (this.webSocketServer) {
      return Promise.resolve(false);
    }

    this.webSocketServer = new WebSocketServer({ port: this.port });

    return new Promise<boolean>((resolve, reject) => {
      if (!this.webSocketServer) {
        reject(new InternalError('WebSocketServer missing'));
        return;
      }

      this.webSocketServer.on('listening', () => {
        this.logger.log('info', `Memorelay listening on port ${this.port}`);
        resolve(true);
      });

      this.webSocketServer.on('error', (error) => {
        this.logger.log('error', error);
        reject(error);
      });

      this.webSocketServer.on(
        'connection',
        (webSocket: WebSocket, incomingMessage: IncomingMessage) => {
          this.connect(webSocket, incomingMessage);
        }
      );
    });
  }

  /**
   * Stop listening for WebSocket connections.
   * @returns A promise that resolves to whether the stopping was successful.
   */
  async stop(): Promise<boolean> {
    if (!this.webSocketServer) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve, reject) => {
      if (!this.webSocketServer) {
        reject(new InternalError('WebSocketServer missing'));
        return;
      }

      this.webSocketServer.close((error) => {
        if (error) {
          this.logger.log('error', error);
          reject(error);
        } else {
          this.logger.log('info', 'Memorelay closed');
          this.webSocketServer = undefined;
          resolve(true);
        }
      });
    });
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

    const subscriber = new Subscriber(webSocket, incomingMessage, this.logger);
    this.subscribers.set(webSocket, subscriber);

    webSocket.on('close', () => {
      if (!this.subscribers.has(webSocket)) {
        throw new InternalError('close event received for missing websocket');
      }
      this.subscribers.delete(webSocket);
    });

    return subscriber;
  }
}
