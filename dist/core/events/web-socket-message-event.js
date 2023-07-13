"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Wrapper for WebSocket 'message' event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketMessageEvent = exports.WEB_SOCKET_MESSAGE_EVENT_TYPE = void 0;
const client_event_1 = require("./client-event");
exports.WEB_SOCKET_MESSAGE_EVENT_TYPE = 'web-socket-message';
/**
 * Event emitted by a MemorelayClient when its connected WebSocket emits a
 * 'message' event.
 */
class WebSocketMessageEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.WEB_SOCKET_MESSAGE_EVENT_TYPE, details, options);
    }
}
WebSocketMessageEvent.type = exports.WEB_SOCKET_MESSAGE_EVENT_TYPE;
exports.WebSocketMessageEvent = WebSocketMessageEvent;
