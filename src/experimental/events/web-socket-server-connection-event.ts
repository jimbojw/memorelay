/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Wrapper for WebSocketServer 'connection' event.
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { BasicEvent } from './basic-event';

export const WEB_SOCKET_SERVER_CONNECTION_EVENT_TYPE =
  'web-socket-server-connection';

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
 * event signaling a newly connected WebSocket.
 *
 * The default next action that Memorelay will take is to create a
 * MemorelayClient and emit a MemorelayClientCreatedEvent. Calling
 * preventDefault() on this event prevents the MemorelayClient instance from
 * being created.
 */
export class WebSocketServerConnectionEvent extends BasicEvent<
  typeof WEB_SOCKET_SERVER_CONNECTION_EVENT_TYPE,
  WebSocketServerConnectionEventDetails
> {
  static readonly type: typeof WEB_SOCKET_SERVER_CONNECTION_EVENT_TYPE =
    WEB_SOCKET_SERVER_CONNECTION_EVENT_TYPE;
  constructor(details: WebSocketServerConnectionEventDetails) {
    super(WEB_SOCKET_SERVER_CONNECTION_EVENT_TYPE, details);
  }
}
