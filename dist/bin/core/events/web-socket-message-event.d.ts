/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Wrapper for WebSocket 'message' event.
 */
import { RawData } from 'ws';
import { ClientEvent, ClientEventOptions } from './client-event';
export declare const WEB_SOCKET_MESSAGE_EVENT_TYPE = "web-socket-message";
/**
 * @see WebSocketMessageEvent
 */
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
export declare class WebSocketMessageEvent extends ClientEvent<typeof WEB_SOCKET_MESSAGE_EVENT_TYPE, WebSocketMessageEventDetails> {
    static readonly type: typeof WEB_SOCKET_MESSAGE_EVENT_TYPE;
    constructor(details: WebSocketMessageEventDetails, options?: ClientEventOptions);
}
