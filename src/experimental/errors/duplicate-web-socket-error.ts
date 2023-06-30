/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error emitted when a duplicate WebSocket is detected.
 */

import { WebSocket } from 'ws';

/**
 * Error emitted when a Memorelay's WebSocketServer has emitted a 'connection'
 * event, but the WebSocket has already been used as the basis for a previous
 * MemorelayClient.
 */
export class DuplicateWebSocketError extends Error {
  static type = 'duplicate-websocket-error';
  readonly type = 'duplicate-websocket-error';
  constructor(
    readonly webSocket: WebSocket,
    message = 'duplicate websocket detected'
  ) {
    super(message);
  }
}
