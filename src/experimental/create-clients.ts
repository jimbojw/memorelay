/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for upgrading connected WebSockets to
 * MemorelayClient instances.
 */

import { WebSocket } from 'ws';

import { MemorelayClient } from './memorelay-client';
import { BasicEventEmitter } from './events/basic-event-emitter';
import { WebSocketConnectedEvent } from './events/web-socket-connected-event';
import { DuplicateWebSocketError } from './errors/duplicate-web-socket-error';
import { MemorelayClientCreatedEvent } from './events/memorelay-client-created-event';

/**
 * Memorelay core plugin to create MemorelayClient instances out of connected
 * WebSockets.
 * @param hub Event hub for inter-handler communication.
 * @param webSocketClientMap Mapping from WebSocket instances to MemorelayClient
 * objects.
 */
export function createClients(
  hub: BasicEventEmitter,
  webSocketClientMap = new Map<WebSocket, MemorelayClient>()
) {
  hub.on(
    WebSocketConnectedEvent.type,
    (webSocketConnectedEvent: WebSocketConnectedEvent) => {
      if (webSocketConnectedEvent.defaultPrevented) {
        return; // Client creation preempted by another listener.
      }

      const { webSocket, request } = webSocketConnectedEvent.details;

      if (webSocketClientMap.has(webSocket)) {
        const error = new DuplicateWebSocketError(webSocket);
        hub.emitError(error);
        return;
      }

      const memorelayClient = new MemorelayClient(webSocket, request);
      webSocketClientMap.set(webSocket, memorelayClient);

      hub.emitBasic(
        new MemorelayClientCreatedEvent({
          memorelayClient,
        })
      );

      webSocketConnectedEvent.preventDefault();
    }
  );
}