/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A client connected to a Memorelay.
 */

import { RawData, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { EventEmitter } from 'events';

import {
  RawMessageHandler,
  RawMessageHandlerNextFunction,
} from './middleware-types';
import { BadBufferError } from './bad-buffer-error';

export class MemorelayClient extends EventEmitter {
  /**
   * Middleware handlers for WebSocket raw 'message' events. API users can
   * modify this list directly.
   * @see RawMessageHandler
   */
  readonly rawMessageHandlers: RawMessageHandler[] = [];

  /**
   * @param webSocket The associated WebSocket for this client.
   * @param request The HTTP request from which the WebSocket was upgraded.
   */
  constructor(
    readonly webSocket: WebSocket,
    readonly request: IncomingMessage
  ) {
    super();
    webSocket.on('message', (data: RawData, isBinary: boolean) => {
      void this.processRawMessage(data, isBinary);
    });
  }

  /**
   * Process a raw 'message' by invoking registered middleware handlers.
   */
  async processRawMessage(data: RawData, isBinary: boolean) {
    const middlewareResult = await this.runRawMessageHandlers(data, isBinary);

    if (middlewareResult) {
      // TODO(jimbo): Send result buffer to blob parsing step.
      return;
    }

    if (!(data instanceof Buffer)) {
      this.emit('error', new BadBufferError(data, isBinary));
      return;
    }
  }

  /**
   * Run raw message middleware handlers in order. If any invoke the next()
   * function with 'done' and provide a buffer, return it.
   *
   * @param data The RawData accompanying the WebSocket 'message'.
   * @param isBinary Whether the WebSocket 'message' was flagged as binary data
   * by the client.
   */
  async runRawMessageHandlers(
    data: RawData,
    isBinary: boolean
  ): Promise<false | { buffer: Buffer; isBinary: boolean }> {
    interface Results {
      status?: 'done';
      buffer?: Buffer;
      isBinary?: boolean;
    }
    for (const rawMessageHandler of this.rawMessageHandlers) {
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
      rawMessageHandler(data, isBinary, nextFunction);
      const results = await promise;
      if (results.status === 'done') {
        if (!results.buffer) {
          throw new Error('buffer missing');
        }
        return {
          buffer: results.buffer,
          isBinary: results.isBinary ?? isBinary,
        };
      }
    }

    // None of middleware called next('done',...).
    return false;
  }
}
