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
        // TODO(jimbo): Use middleware-generated results to proceed.
        break;
      }
    }

    // TODO(jimbo): Proceed to next phase of message handling.
  }
}
