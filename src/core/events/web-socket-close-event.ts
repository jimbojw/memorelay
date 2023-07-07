/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Wrapper for WebSocket 'close' event.
 */

import { ClientEvent, ClientEventOptions } from './client-event';

export const WEB_SOCKET_CLOSE_EVENT_TYPE = 'web-socket-close';

/**
 * @see WebSocketCloseEvent
 */
export interface WebSocketCloseEventDetails {
  /**
   * Numeric code indicating the reason for closinig.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
   */
  readonly code: number;
}

/**
 * Event emitted by a MemorelayClient when its connected WebSocket emits a
 * 'message' event.
 */
export class WebSocketCloseEvent extends ClientEvent<
  typeof WEB_SOCKET_CLOSE_EVENT_TYPE,
  WebSocketCloseEventDetails
> {
  static readonly type: typeof WEB_SOCKET_CLOSE_EVENT_TYPE =
    WEB_SOCKET_CLOSE_EVENT_TYPE;
  constructor(
    details: WebSocketCloseEventDetails,
    options?: ClientEventOptions
  ) {
    super(WEB_SOCKET_CLOSE_EVENT_TYPE, details, options);
  }
}
