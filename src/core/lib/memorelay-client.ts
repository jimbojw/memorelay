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
import { onWithHandler } from './on-with-handler';
import { MemorelayClientDisconnectEvent } from '../events/memorelay-client-disconnect-event';
import { ConnectableEventEmitter } from './connectable-event-emitter';
import { Disconnectable } from '../types/disconnectable';
import { BasicEvent } from '../events/basic-event';
import { WebSocketSendEvent } from '../events/web-socket-send-event';

/**
 * MemorelayClient plugin which upgrades ws WebSocket 'message' events to
 * WebSocketMessageEvent instances.
 * @param memorelayClient The client on which to upgrade events.
 * @returns Plugin function for MemorelayClient.
 * @emits WebSocketMessageEvent
 */
export function upgradeWebSocketMessageEvent(
  memorelayClient: MemorelayClient
): Disconnectable {
  return onWithHandler(
    memorelayClient.webSocket,
    'message',
    (data: RawData, isBinary: boolean) => {
      memorelayClient.emitEvent(
        new WebSocketMessageEvent(
          { data, isBinary },
          {
            targetEmitter: memorelayClient,
            parentEvent: memorelayClient.parentEvent,
          }
        )
      );
    }
  );
}

/**
 * MemorelayClient plugin which upgrades ws WebSocket 'close' events to
 * WebSocketCloseEvent instances.
 * @param memorelayClient The client on which to upgrade events.
 * @returns Plugin function for MemorelayClient.
 * @emits WebSocketCloseEvent
 */
export function upgradeWebSocketCloseEvent(
  memorelayClient: MemorelayClient
): Disconnectable {
  return onWithHandler(memorelayClient.webSocket, 'close', (code: number) => {
    memorelayClient.emitEvent(
      new WebSocketCloseEvent(
        { code },
        {
          targetEmitter: memorelayClient,
          parentEvent: memorelayClient.parentEvent,
        }
      )
    );
  });
}

/**
 * MemorelayClient plugin which responds to a WebSocketSendEvent by sending the
 * buffer.
 * @param memorelayClient The client on which to listen.
 * @returns Handler.
 */
export function sendWebSocketBufferOnEvent(
  memorelayClient: MemorelayClient
): Disconnectable {
  return memorelayClient.onEvent(
    WebSocketSendEvent,
    (webSocketSendEvent: WebSocketSendEvent) => {
      if (webSocketSendEvent.defaultPrevented) {
        return; // Preempted by another handler.
      }
      const { buffer } = webSocketSendEvent.details;
      memorelayClient.webSocket.send(buffer);
    }
  );
}

/**
 * MemorelayClient plugin which responds to a WebSocketCloseEvent by emitting
 * MemoRelayClientDisconnectEvent.
 * @param memorelayClient The client on which to listen.
 * @returns Handler.
 * @emits MemoRelayClientDisconnectEvent
 */
export function emitDisconnectOnClose(
  memorelayClient: MemorelayClient
): Disconnectable {
  return memorelayClient.onEvent(
    WebSocketCloseEvent,
    (webSocketCloseEvent: WebSocketCloseEvent) => {
      if (webSocketCloseEvent.defaultPrevented) {
        return; // Preempted by another handler.
      }
      queueMicrotask(() => {
        memorelayClient.emitEvent(
          new MemorelayClientDisconnectEvent(
            { memorelayClient },
            { parentEvent: webSocketCloseEvent, targetEmitter: memorelayClient }
          )
        );
      });
    }
  );
}

/**
 * MemorelayClient plugin which responds to a MemoRelayClientDisconnectEvent by
 * calling the instance's disconnect() method.
 * @param memorelayClient The client on which to listen.
 * @returns Handler.
 */
export function invokeDisconnectOnEvent(
  memorelayClient: MemorelayClient
): Disconnectable {
  return memorelayClient.onEvent(
    MemorelayClientDisconnectEvent,
    (memorelayClientDisconnectedEvent: MemorelayClientDisconnectEvent) => {
      if (memorelayClientDisconnectedEvent.defaultPrevented) {
        return; // Preempted by another handler.
      }
      memorelayClient.disconnect();
    }
  );
}

/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
export class MemorelayClient extends ConnectableEventEmitter<ClientEvent> {
  plugins = [
    // Upgrade native WebSocket 'message' events to WebSocketMessageEvents.
    upgradeWebSocketMessageEvent,

    // Upgrade native WebSocket 'close' events to WebSocketCloseEvents.
    upgradeWebSocketCloseEvent,

    // On WebSocketSendEvent, send the attached buffer.
    sendWebSocketBufferOnEvent,

    // On WebSocketCloseEvent, trigger MemorelayClientDisconnectEvent.
    emitDisconnectOnClose,

    // On MemorelayClientDisconnectEvent, disconnect.
    invokeDisconnectOnEvent,
  ];

  /**
   * @param webSocket The associated WebSocket for this client.
   * @param request The HTTP request from which the WebSocket was upgraded.
   * @param parentEvent Optional parent event that spawned the client.
   */
  constructor(
    readonly webSocket: WebSocket,
    readonly request: IncomingMessage,
    readonly parentEvent?: BasicEvent
  ) {
    super();
  }
}
