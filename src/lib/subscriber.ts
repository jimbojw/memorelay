/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A connected Subscriber to a MemorelayServer.
 */

import { IncomingMessage } from 'http';
import { Logger } from 'winston';
import { WebSocket } from 'ws';
import { ClientMessage, bufferToMessage } from './buffer-to-message';

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
   * @param payloadDataBuffer Buffer of incoming message data.
   */
  handleMessage(payloadDataBuffer: Buffer) {
    if (!(payloadDataBuffer instanceof Buffer)) {
      throw new Error('unexpected message data type');
    }

    let clientMessage: ClientMessage;
    try {
      clientMessage = bufferToMessage(payloadDataBuffer);
    } catch (err) {
      const errorMessage = (err as Error).message;
      this.logger.log('verbose', `${errorMessage}`);
      this.webSocket.send(JSON.stringify(['NOTICE', `ERROR: ${errorMessage}`]));
      return;
    }

    const messageType = clientMessage[0];
    this.logger.log('silly', `MESSAGE (${messageType})`);
  }
}
