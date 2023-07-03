/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A client connected to a Memorelay.
 */

import { RawData, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

import { WebSocketMessageEvent } from '../events/web-socket-message-event';
import { BasicEventEmitter } from './basic-event-emitter';
import { WebSocketCloseEvent } from '../events/web-socket-close-event';
import { ClientEvent } from '../events/client-event';
import { ClientError } from '../errors/client-error';

/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
export class MemorelayClient extends BasicEventEmitter<
  ClientEvent,
  ClientError
> {
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
   * Connect event handlers. This is delayed until connect() is called in order
   * to give others a chance to listen first.
   * @returns this
   */
  connect(): this {
    this.webSocket.on('message', (data: RawData, isBinary: boolean) => {
      this.emitEvent(new WebSocketMessageEvent({ data, isBinary }));
    });

    this.webSocket.on('close', (code: number) => {
      this.emitEvent(new WebSocketCloseEvent({ code }));
    });

    return this;
  }
}
