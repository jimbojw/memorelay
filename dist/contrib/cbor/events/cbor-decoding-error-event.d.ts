/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event emitted when a supposedly CBOR payload message could not
 * be decoded.
 */
import { ClientEvent, ClientEventOptions } from '../../../core/events/client-event';
export declare const CBOR_DECODING_ERROR_EVENT_TYPE = "cbor-decoding-error";
/**
 * @see CborDecodingErrorEvent
 */
export interface CborDecodingErrorEventDetails {
    /**
     * The underlying CBOR decoding error.
     */
    readonly error: unknown;
}
/**
 * Event emitted by MemorelayCore when it handles an HTTP upgrade request by
 * having its ws.WebSocketServer upgrade the connection to a ws.WebSocket.
 */
export declare class CborDecodingErrorEvent extends ClientEvent<typeof CBOR_DECODING_ERROR_EVENT_TYPE, CborDecodingErrorEventDetails> {
    static readonly type: typeof CBOR_DECODING_ERROR_EVENT_TYPE;
    constructor(details: CborDecodingErrorEventDetails, options?: ClientEventOptions);
}
