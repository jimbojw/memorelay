/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay WebSocket server.
 */

import { Logger } from 'winston';
import { WebSocketServer } from 'ws';
import { InternalError } from './internal-error';

export class MemorelayServer {
  private wss?: WebSocketServer;

  constructor(readonly port: number, readonly logger: Logger) {}

  /**
   * Begin listening for WebSocket connections.
   * @returns A promise which resolves to whether the listening was successful.
   */
  async listen(): Promise<boolean> {
    if (this.wss) {
      return Promise.resolve(false);
    }

    this.wss = new WebSocketServer({ port: this.port });

    return new Promise<boolean>((resolve, reject) => {
      if (!this.wss) {
        reject(new InternalError('WebSocketServer missing'));
        return;
      }

      this.wss.on('listening', () => {
        this.logger.log('info', `Memorelay listening on port ${this.port}`);
        resolve(true);
      });

      this.wss.on('error', (error) => {
        this.logger.log('error', error);
        reject(error);
      });
    });
  }

  /**
   * Stop listening for WebSocket connections.
   * @returns A promise that resolves to whether the stopping was successful.
   */
  async stop(): Promise<boolean> {
    if (!this.wss) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve, reject) => {
      if (!this.wss) {
        reject(new InternalError('WebSocketServer missing'));
        return;
      }

      this.wss.close((error) => {
        if (error) {
          this.logger.log('error', error);
          reject(error);
        } else {
          this.logger.log('info', 'Memorelay closed');
          this.wss = undefined;
          resolve(true);
        }
      });
    });
  }
}
