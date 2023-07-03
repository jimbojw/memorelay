/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay event hub.
 */

import { WebSocketServer } from 'ws';

import { BasicEventEmitter } from './basic-event-emitter';
import { UpgradeHandler } from '../types/upgrade-handler';
import { handleUpgrade } from './handle-upgrade';
import { RelayEvent } from '../events/relay-event';
import { RelayError } from '../errors/relay-error';

/**
 * Symbol for accessing the internal WebSocket server instance.
 */
export const WEBSOCKET_SERVER = Symbol('webSocketServer');

/**
 * Memorelay main class. Allows for configurable Nostr relay behavior.
 */
export class MemorelayHub extends BasicEventEmitter<RelayEvent, RelayError> {
  /**
   * WebSocket server for handling requests.
   */
  private readonly webSocketServer = new WebSocketServer({ noServer: true });

  /**
   * Expose webSocketServer for testing.
   * @see WEBSOCKET_SERVER
   */
  readonly [WEBSOCKET_SERVER] = this.webSocketServer;

  /**
   * Return a handler for upgrading HTTP client connections to WebSockets.
   *
   * Usage:
   *
   *   const memorelay = new Memorelay();
   *   const app = express();
   *   const server = app.listen(PORT);
   *   server.on('upgrade', memorelay.handleUpgrade());
   *
   * @param path Optional Express path to match. Defaults to '/'.
   * @returns Upgrade handler function.
   */
  handleUpgrade(path = '/'): UpgradeHandler {
    return handleUpgrade(this.webSocketServer, this, path);
  }
}
