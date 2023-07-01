/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Wrapper for WebSocketServer 'connection' event.
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { BasicEvent } from './basic-event';

export const WEB_SOCKET_CONNECTED_EVENT_TYPE = 'web-socket-connected';

/**
 * @see WebSocketConnectedEvent
 */
export interface WebSocketConnectedEventDetails {
  /**
   * The newly connected ws WebSocket.
   */
  readonly webSocket: WebSocket;

  /**
   * The initiating HTTP request which caused the upgrade to WebSocket.
   */
  readonly request: IncomingMessage;
}

/**
 * Event emitted by MemorelayCore when it handles an HTTP upgrade request by
 * having its ws.WebSocketServer upgrade the connection to a ws.WebSocket.
 */
export class WebSocketConnectedEvent extends BasicEvent<
  typeof WEB_SOCKET_CONNECTED_EVENT_TYPE,
  WebSocketConnectedEventDetails
> {
  static readonly type: typeof WEB_SOCKET_CONNECTED_EVENT_TYPE =
    WEB_SOCKET_CONNECTED_EVENT_TYPE;
  constructor(details: WebSocketConnectedEventDetails) {
    super(WEB_SOCKET_CONNECTED_EVENT_TYPE, details);
  }
}
