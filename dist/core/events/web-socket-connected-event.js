"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Wrapper for WebSocketServer 'connection' event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketConnectedEvent = exports.WEB_SOCKET_CONNECTED_EVENT_TYPE = void 0;
const relay_event_1 = require("./relay-event");
exports.WEB_SOCKET_CONNECTED_EVENT_TYPE = 'web-socket-connected';
/**
 * Event emitted by MemorelayCore when it handles an HTTP upgrade request by
 * having its ws.WebSocketServer upgrade the connection to a ws.WebSocket.
 */
class WebSocketConnectedEvent extends relay_event_1.RelayEvent {
    constructor(details, options) {
        super(exports.WEB_SOCKET_CONNECTED_EVENT_TYPE, details, options);
    }
}
WebSocketConnectedEvent.type = exports.WEB_SOCKET_CONNECTED_EVENT_TYPE;
exports.WebSocketConnectedEvent = WebSocketConnectedEvent;
