/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A connected Subscriber to a MemorelayServer.
 */

import { IncomingMessage } from 'http';
import { Logger } from 'winston';
import { WebSocket } from 'ws';

export class Subscriber {
  constructor(
    private readonly webSocket: WebSocket,
    private readonly incomingMessage: IncomingMessage,
    private readonly logger: Logger
  ) {
    const { headers, url: path } = incomingMessage;
    const secWebsocketKey = headers['sec-websocket-key'];
    const url = `${headers.host ?? ''}${path ?? '/'}`;

    this.logger.log('http', 'OPEN (%s) %s', secWebsocketKey, url);

    this.webSocket.on('close', (code) => {
      this.logger.log('http', 'CLOSE (%s) %s', secWebsocketKey, code);
    });

    this.webSocket.on('error', (error) => {
      this.logger.log('error', error);
    });

    this.webSocket.on('message', (data: Buffer) => {
      this.handleMessage(data);
    });
  }

  /**
   * Handle an incoming WebSocket message.
   * @param data Buffer of incoming message data.
   */
  handleMessage(data: Buffer) {
    if (!(data instanceof Buffer)) {
      throw new Error('unexpected message data type');
    }
  }
}
