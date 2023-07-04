/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A client connected to a Memorelay.
 */

import { RawData, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

import { WebSocketMessageEvent } from '../events/web-socket-message-event';
import { WebSocketCloseEvent } from '../events/web-socket-close-event';
import { ClientEvent } from '../events/client-event';
import { ClientError } from '../errors/client-error';
import { onWithHandler } from './on-with-handler';
import { MemorelayClientDisconnectEvent } from '../events/memorelay-client-disconnect-event';
import { ConnectableEventEmitter } from './connectable-event-emitter';

/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
export class MemorelayClient<
  PluginClientEvent extends ClientEvent = ClientEvent,
  PluginClientError extends ClientError = ClientError
> extends ConnectableEventEmitter<
  PluginClientEvent | ClientEvent,
  PluginClientError | ClientError
> {
  /**
   * @param webSocket The associated WebSocket for this client.
   * @param request The HTTP request from which the WebSocket was upgraded.
   */
  constructor(
    readonly webSocket: WebSocket,
    readonly request: IncomingMessage
  ) {
    super(() => [
      // Upgrade native WebSocket 'message' events to WebSocketMessageEvents.
      onWithHandler(
        this.webSocket,
        'message',
        (data: RawData, isBinary: boolean) => {
          this.emitEvent(new WebSocketMessageEvent({ data, isBinary }));
        }
      ),

      // Upgrade native WebSocket 'close' events to WebSocketCloseEvents.
      onWithHandler(this.webSocket, 'close', (code: number) => {
        this.emitEvent(new WebSocketCloseEvent({ code }));
      }),

      // On WebSocketCloseEvent, trigger MemorelayClientDisconnectEvent.
      this.onEvent(
        WebSocketCloseEvent,
        (webSocketCloseEvent: WebSocketCloseEvent) => {
          queueMicrotask(() => {
            if (webSocketCloseEvent.defaultPrevented) {
              return; // Preempted by another handler.
            }
            this.emitEvent(
              new MemorelayClientDisconnectEvent({ memorelayClient: this })
            );
          });
        }
      ),

      // On MemorelayClientDisconnectEvent, disconnect.
      this.onEvent(
        MemorelayClientDisconnectEvent,
        (memorelayClientDisconnectedEvent: MemorelayClientDisconnectEvent) => {
          queueMicrotask(() => {
            if (memorelayClientDisconnectedEvent.defaultPrevented) {
              return; // Preempted by another handler.
            }
            this.disconnect();
          });
        }
      ),
    ]);
  }
}
