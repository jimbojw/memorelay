/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for upgrading connected WebSockets to
 * MemorelayClient instances.
 */

import { WebSocket } from 'ws';

import { MemorelayClient } from '../lib/memorelay-client';
import { WebSocketConnectedEvent } from '../events/web-socket-connected-event';
import { MemorelayClientCreatedEvent } from '../events/memorelay-client-created-event';
import { MemorelayHub } from '../lib/memorelay-hub';
import { DuplicateWebSocketErrorEvent } from '../events/duplicate-web-socket-error-event';

/**
 * Core plugin to create MemorelayClient instances out of connected WebSockets.
 * @param hub Event hub for inter-plugin communication.
 * @return Plugin function.
 */
export function createClients(hub: MemorelayHub) {
  const webSocketClientMap = new Map<WebSocket, MemorelayClient>();

  return hub.onEvent(
    WebSocketConnectedEvent,
    (webSocketConnectedEvent: WebSocketConnectedEvent) => {
      if (webSocketConnectedEvent.defaultPrevented) {
        return; // Client creation preempted by another listener.
      }

      const { webSocket, request } = webSocketConnectedEvent.details;

      if (webSocketClientMap.has(webSocket)) {
        queueMicrotask(() => {
          hub.emitEvent(new DuplicateWebSocketErrorEvent({ webSocket }));
        });
        return;
      }

      const memorelayClient = new MemorelayClient(
        webSocket,
        request,
        webSocketConnectedEvent
      );
      webSocketClientMap.set(webSocket, memorelayClient);

      const memorelayClientCreatedEvent = new MemorelayClientCreatedEvent(
        { memorelayClient },
        { parentEvent: webSocketConnectedEvent, targetEmitter: hub }
      );

      webSocketConnectedEvent.preventDefault();

      queueMicrotask(() => {
        hub.emitEvent(memorelayClientCreatedEvent);
        if (!memorelayClientCreatedEvent.defaultPrevented) {
          memorelayClient.connect();
        }
      });
    }
  );
}
