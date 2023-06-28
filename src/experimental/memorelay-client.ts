/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A client connected to a Memorelay.
 */

import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { EventEmitter } from 'events';

export class MemorelayClient extends EventEmitter {
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
}
