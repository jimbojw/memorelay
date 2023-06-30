/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Events having to do with raw WebSockets.
 */

import { RawData } from 'ws';

import { BasicEvent } from './basic-event';

/**
 * Memorelay event emitted when a connected WebSocket emits a 'message' event.
 */
export type WebSocketMessageEvent = BasicEvent<
  /**
   * The event's type string.
   */
  'web-socket-message',
  {
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
>;
