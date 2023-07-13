/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event emitted when a supposedly CBOR payload message could not
 * be encoded.
 */
import { ClientEvent, ClientEventOptions } from '../../../core/events/client-event';
export declare const CBOR_ENCODING_ERROR_EVENT_TYPE = "cbor-encoding-error";
/**
 * @see CborEncodingErrorEvent
 */
export interface CborEncodingErrorEventDetails {
    /**
     * The underlying CBOR encoding error.
     */
    readonly error: unknown;
}
/**
 * Event emitted by MemorelayCore when it handles an HTTP upgrade request by
 * having its ws.WebSocketServer upgrade the connection to a ws.WebSocket.
 */
export declare class CborEncodingErrorEvent extends ClientEvent<typeof CBOR_ENCODING_ERROR_EVENT_TYPE, CborEncodingErrorEventDetails> {
    static readonly type: typeof CBOR_ENCODING_ERROR_EVENT_TYPE;
    constructor(details: CborEncodingErrorEventDetails, options?: ClientEventOptions);
}
