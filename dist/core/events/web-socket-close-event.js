"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Wrapper for WebSocket 'close' event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketCloseEvent = exports.WEB_SOCKET_CLOSE_EVENT_TYPE = void 0;
const client_event_1 = require("./client-event");
exports.WEB_SOCKET_CLOSE_EVENT_TYPE = 'web-socket-close';
/**
 * Event emitted by a MemorelayClient when its connected WebSocket emits a
 * 'message' event.
 */
class WebSocketCloseEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.WEB_SOCKET_CLOSE_EVENT_TYPE, details, options);
    }
}
WebSocketCloseEvent.type = exports.WEB_SOCKET_CLOSE_EVENT_TYPE;
exports.WebSocketCloseEvent = WebSocketCloseEvent;
