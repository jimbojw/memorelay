/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Events originating from WebSocketServers.
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { BasicEvent } from './basic-event';

/**
 * @see WebSocketServerConnectionEvent
 */
export interface WebSocketServerConnectionEventDetails {
  /**
   * The newly upgraded ws WebSocket.
   */
  readonly webSocket: WebSocket;

  /**
   * The initiating HTTP request which caused the upgrade to WebSocket.
   */
  readonly request: IncomingMessage;
}

/**
 * Memorelay event emitted when a connected WebSocketServer emits a 'connection'
 * event signaling a newly connected client.
 *
 * The default next action that Memorelay will take is to create a
 * MemorelayClient and emit a MemorelayClientCreatedEvent. Calling
 * preventDefault() on this event prevents the MemorelayClient instance from
 * being created.
 */
export class WebSocketServerConnectionEvent extends BasicEvent<
  'web-socket-server-connection',
  WebSocketServerConnectionEventDetails
> {
  static readonly type = 'web-socket-server-connection';
  constructor(details: WebSocketServerConnectionEventDetails) {
    super('web-socket-server-connection', details);
  }
}
