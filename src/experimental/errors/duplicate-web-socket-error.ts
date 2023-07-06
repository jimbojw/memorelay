/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error emitted when a duplicate WebSocket is detected.
 */

import { WebSocket } from 'ws';
import { RelayError } from './relay-error';

export const DUPLICATE_WEB_SOCKET_ERROR_TYPE = 'duplicate-websocket-error';

/**
 * Error emitted when a Memorelay's WebSocketServer has emitted a 'connection'
 * event, but the WebSocket has already been used as the basis for a previous
 * MemorelayClient.
 */
export class DuplicateWebSocketError extends RelayError {
  static readonly type = DUPLICATE_WEB_SOCKET_ERROR_TYPE;

  constructor(
    readonly webSocket: WebSocket,
    message = 'duplicate websocket detected'
  ) {
    super(message);
  }

  get type() {
    return DuplicateWebSocketError.type;
  }
}
