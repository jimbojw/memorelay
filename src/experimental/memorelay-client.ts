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
import { WebSocketMessageEvent } from './events/web-socket-message-event';
import {
  BasicEventEmitter,
  BasicEventHandler,
} from './events/basic-event-emitter';
import { IncomingMessageEvent } from './events/incoming-message-event';

/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
export class MemorelayClient extends BasicEventEmitter {
  protected handlers: readonly BasicEventHandler[] = [
    {
      target: this.webSocket,
      type: 'message',
      handler: (data: RawData, isBinary: boolean) => {
        this.emitBasic(new WebSocketMessageEvent({ data, isBinary }));
      },
    },
    {
      target: this,
      type: WebSocketMessageEvent.type,
      handler: (event: WebSocketMessageEvent) => {
        this.handleWebSocketMessage(event);
      },
    },
  ];

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

  override connect(): this {
    super.connect();
    // TODO(jimbo): Emit some kind of 'connected' event.
    return this;
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
      this.emitBasic(
        new IncomingMessageEvent({ incomingMessage: clientMessage })
      );
    } catch (error) {
      if (!(error instanceof BadMessageError)) {
        throw error; // Unexpected error type. Fail hard.
      }
      this.emitError(error);
    }
  }
}
