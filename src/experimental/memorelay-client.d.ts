/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A client connected to a Memorelay.
 */

import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';

export interface MemorelayClient {
  /**
   * The associated WebSocket for this client.
   */
  readonly webSocket: WebSocket;

  /**
   * The HTTP request from which the associated WebSocket was upgraded.
   */
  readonly request: IncomingMessage;
}
