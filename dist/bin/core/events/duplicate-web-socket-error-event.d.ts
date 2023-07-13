/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event emitted when a duplicate WebSocket is detected.
 */
import { WebSocket } from 'ws';
import { RelayEvent, RelayEventOptions } from './relay-event';
export declare const DUPLICATE_WEB_SOCKET_ERROR_EVENT_TYPE = "duplicate-web-socket-error";
/**
 * @see DuplicateWebSocketErrorEvent
 */
export interface DuplicateWebSocketErrorEventDetails {
    /**
     * The duplicate ws WebSocket.
     */
    readonly webSocket: WebSocket;
}
/**
 * Event emitted by MemorelayCore when it handles an HTTP upgrade request by
 * having its ws.WebSocketServer upgrade the connection to a ws.WebSocket.
 */
export declare class DuplicateWebSocketErrorEvent extends RelayEvent<typeof DUPLICATE_WEB_SOCKET_ERROR_EVENT_TYPE, DuplicateWebSocketErrorEventDetails> {
    static readonly type: typeof DUPLICATE_WEB_SOCKET_ERROR_EVENT_TYPE;
    constructor(details: DuplicateWebSocketErrorEventDetails, options?: RelayEventOptions);
}
