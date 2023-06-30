/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Events having to do with raw WebSockets.
 */

import { IncomingMessage } from 'http';
import { RawData, WebSocket } from 'ws';

import { BasicEvent } from './basic-event';

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
  constructor(details: WebSocketServerConnectionEventDetails) {
    super('web-socket-server-connection', details);
  }
}

export interface WebSocketMessageEventDetails {
  /**
   * Raw WebSocket data. May be a Buffer, an ArrayBuffer, or a Buffer[] (array
   * of Buffers).
   */
  readonly data: RawData;

  /**
   * Whether the connected client flagged the incoming payload data as binary.
   *
   * NOTE: This is not inferred from the data content. It is explicitly set
   * arbitrarily by the client.
   */
  readonly isBinary: boolean;
}

/**
 * Event emitted by a MemorelayClient when its connected WebSocket emits a
 * 'message' event.
 */
export class WebSocketMessageEvent extends BasicEvent<
  'web-socket-message',
  WebSocketMessageEventDetails
> {
  constructor(details: WebSocketMessageEventDetails) {
    super('web-socket-message', details);
  }
}
