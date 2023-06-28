/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error emitted when a Buffer was expected but something else was
 * received.
 */

import { RawData } from 'ws';

/**
 * Error emitted when a MemorelayClient's WebSocket receives a 'message' event
 * with a data payload that is not a Buffer.
 *
 * NOTE: The WebSocket RawData type allows the data payload to be a Buffer, an
 * ArrayBuffer, or a Buffer[]. It's not clear under which circumstances which
 * could be received. So for now, we prudently treat anything other than a
 * literal Buffer object as an error.
 */
export class BadBufferError extends Error {
  constructor(
    readonly data: RawData,
    readonly isBinary: boolean,
    message = 'data is not a Buffer'
  ) {
    super(message);
  }
}
