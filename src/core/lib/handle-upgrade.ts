/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Handle HTTP-to-WebSocket upgrade requests.
 */

import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { pathToRegexp } from 'path-to-regexp';
import { WebSocket, WebSocketServer } from 'ws';

import { UpgradeHandler } from '../types/upgrade-handler';
import { WebSocketConnectedEvent } from '../events/web-socket-connected-event';
import { MemorelayHub } from './memorelay-hub';

/**
 * Return a handler for upgrading HTTP client connections to WebSockets.
 * @param hub Event emitter through which to broadcast upgrades.
 * @param path Optional Express path to match. Defaults to '/'.
 * @param webSocketServer WebSocket server for handling upgrades.
 * @returns Upgrade handler function.
 */
export function handleUpgrade(
  webSocketServer: WebSocketServer,
  hub: MemorelayHub,
  path = '/'
): UpgradeHandler {
  // Upgrade path string to regex for testing.
  const regex = pathToRegexp(path);

  return (request: IncomingMessage, socket: Socket, head: Buffer) => {
    if (!request.url) {
      throw new Error('url missing');
    }

    // NOTE: The WHATWG URL standard requires a base, but its value doesn't
    // matter to us since we only need the path.
    const { pathname } = new URL(request.url, 'http://dummy');
    if (!regex.test(pathname)) {
      // Nothing to do here. The incoming message URL does not match.
      return;
    }

    webSocketServer.handleUpgrade(
      request,
      socket,
      head,
      (webSocket: WebSocket) => {
        hub.emitEvent(
          new WebSocketConnectedEvent(
            { webSocket, request },
            { targetEmitter: hub }
          )
        );
      }
    );
  };
}
