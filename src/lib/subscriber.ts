/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A connected Subscriber to a MemorelayServer.
 */

import { WebSocket } from 'ws';

export class Subscriber {
  constructor(private readonly webSocket: WebSocket) {}
}
