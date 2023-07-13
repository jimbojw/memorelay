/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event signaling intent to send data to a ws WebSocket.
 */
/// <reference types="node" />
import { ClientEvent, ClientEventOptions } from './client-event';
export declare const WEB_SOCKET_SEND_EVENT_TYPE = "web-socket-send";
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
export declare class WebSocketSendEvent extends ClientEvent<typeof WEB_SOCKET_SEND_EVENT_TYPE, WebSocketSendEventDetails> {
    static readonly type: typeof WEB_SOCKET_SEND_EVENT_TYPE;
    constructor(details: WebSocketSendEventDetails, options?: ClientEventOptions);
}
