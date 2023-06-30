/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A client connected to a Memorelay.
 */

import { RawData, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

import { bufferToClientMessage } from '../lib/buffer-to-message';
import { BadMessageError } from '../lib/bad-message-error';
import { WebSocketMessageEvent } from './events/web-socket-events';
import { BasicEventEmitter } from './events/basic-event-emitter';
import { MemorelayClientMessageEvent } from './events/memorelay-client-events';

/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
export class MemorelayClient extends BasicEventEmitter {
  /**
   * @param webSocket The associated WebSocket for this client.
   * @param request The HTTP request from which the WebSocket was upgraded.
   */
  constructor(
    readonly webSocket: WebSocket,
    readonly request: IncomingMessage
  ) {
    super();
  }

  /**
   * Initialize client by attaching listeners.
   */
  init() {
    this.webSocket.on('message', (data: RawData, isBinary: boolean) => {
      this.emitBasic(new WebSocketMessageEvent({ data, isBinary }));
    });

    this.on('web-socket-message', (event: WebSocketMessageEvent) => {
      this.handleWebSocketMessage(event);
    });

    // TODO(jimbo): Listen for more WebSocket events.
    // TODO(jimbo): Emit an 'init' event.
  }

  /**
   * Handly a previously emitted WebSocketMessageEvent. By sending the raw
   * WebSocket 'message' event through this process, the client gives other
   * listeners a chance to call preventDefault() first.
   *
   * @param event Wrapped WebSocket message event.
   */
  handleWebSocketMessage(event: WebSocketMessageEvent) {
    if (event.defaultPrevented) {
      return; // Default behavior was prevented.
    }

    const { data } = event.details;
    const buffer = Array.isArray(data) ? Buffer.concat(data) : (data as Buffer);

    try {
      const clientMessage = bufferToClientMessage(buffer);
      this.emitBasic(new MemorelayClientMessageEvent({ clientMessage }));
    } catch (error) {
      if (!(error instanceof BadMessageError)) {
        throw error; // Unexpected error type. Fail hard.
      }
      this.emitError(error);
    }
  }
}
