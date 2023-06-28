/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Type information for Memorelay middleware.
 */

import { RawData, WebSocket } from 'ws';

/**
 * Signature for the next() Callback function for WebSocketRawMessageHandler.
 *
 * @param status Set to 'done' if no further middleware should be invoked.
 * @param buffer Result of processing the RawData into a unified Buffer.
 * @param isBinary Whether the buffer contains binary data.
 */
export type WebSocketRawMessageHandlerNextFunction = (
  status?: 'done',
  buffer?: Buffer,
  isBinary?: boolean
) => void;

/**
 * WebSocket raw message middleware signature.
 *
 * When a ws WebSocket receives a 'message' event, it comes with two parameters:
 *
 * - data - The incoming binary data. The ws `RawData` type allows this to be a
 *   true Buffer, an ArrayBuffer, or an array of Buffers (Buffer[]).
 * - isBinary - A boolean value signaling whether the `data` parameter came with
 *   the binary flag set. Note that this field is set by the connecting client.
 *   It is not determined programmatically by the receiver.
 *
 * This middleware function allows the implementer to decide whether and how to
 * proceed by calling the next() function with appropriate parameters.
 *
 * @param webSocket The WebSocket that emitted the 'message' event.
 * @param data The incoming raw data.
 * @param isBinary Whether the client flagged this content as binary.
 * @see WebSocketRawMessageHandlerNextFunction
 */
export type WebSocketRawMessageHandler = (
  webSocket: WebSocket,
  data: RawData,
  isBinary: boolean,
  next: WebSocketRawMessageHandlerNextFunction
) => void;
