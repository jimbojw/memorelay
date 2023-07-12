/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event signaling intent to send data to a ws WebSocket.
 */

import { RawData } from 'ws';

import { ClientEvent, ClientEventOptions } from './client-event';

export const WEB_SOCKET_SEND_EVENT_TYPE = 'web-socket-send';

/**
 * @see WebSocketSendEvent
 */
export interface WebSocketSendEventDetails {
  /**
   * Outgoing buffer to send.
   */
  readonly buffer: Buffer;
}

/**
 * Event emitted on a MemorelayClient when there's a buffer to be sent out.
 */
export class WebSocketSendEvent extends ClientEvent<
  typeof WEB_SOCKET_SEND_EVENT_TYPE,
  WebSocketSendEventDetails
> {
  static readonly type: typeof WEB_SOCKET_SEND_EVENT_TYPE =
    WEB_SOCKET_SEND_EVENT_TYPE;
  constructor(
    details: WebSocketSendEventDetails,
    options?: ClientEventOptions
  ) {
    super(WEB_SOCKET_SEND_EVENT_TYPE, details, options);
  }
}
