"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event emitted when a duplicate WebSocket is detected.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateWebSocketErrorEvent = exports.DUPLICATE_WEB_SOCKET_ERROR_EVENT_TYPE = void 0;
const relay_event_1 = require("./relay-event");
exports.DUPLICATE_WEB_SOCKET_ERROR_EVENT_TYPE = 'duplicate-web-socket-error';
/**
 * Event emitted by MemorelayCore when it handles an HTTP upgrade request by
 * having its ws.WebSocketServer upgrade the connection to a ws.WebSocket.
 */
class DuplicateWebSocketErrorEvent extends relay_event_1.RelayEvent {
    constructor(details, options) {
        super(exports.DUPLICATE_WEB_SOCKET_ERROR_EVENT_TYPE, details, options);
    }
}
DuplicateWebSocketErrorEvent.type = exports.DUPLICATE_WEB_SOCKET_ERROR_EVENT_TYPE;
exports.DuplicateWebSocketErrorEvent = DuplicateWebSocketErrorEvent;
