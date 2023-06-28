/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Type information for Memorelay middleware.
 */

import { RawData } from 'ws';

/**
 * Signature for the next() Callback function for RawMessageHandler.
 *
 * @param status Set to 'done' if no further middleware should be invoked.
 * @param buffer Result of processing the RawData into a unified Buffer.
 * @param isBinary Whether the buffer contains binary data.
 * @see RawMessageHandler
 */
export type RawMessageHandlerNextFunction =
  | (() => void)
  | ((status: 'done', buffer: Buffer, isBinary?: boolean) => void);

/**
 * Middleware signature for handling raw 'message' events from clients.
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
 * @param data The incoming raw data.
 * @param isBinary Whether the client flagged this content as binary.
 * @param next Function to invoke when finished.
 * @see RawMessageHandlerNextFunction
 */
export type RawMessageHandler = (
  data: RawData,
  isBinary: boolean,
  next: RawMessageHandlerNextFunction
) => void;
