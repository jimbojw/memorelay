"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event signaling intent to send data to a ws WebSocket.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketSendEvent = exports.WEB_SOCKET_SEND_EVENT_TYPE = void 0;
const client_event_1 = require("./client-event");
exports.WEB_SOCKET_SEND_EVENT_TYPE = 'web-socket-send';
/**
 * Event emitted on a MemorelayClient when there's a buffer to be sent out.
 */
class WebSocketSendEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.WEB_SOCKET_SEND_EVENT_TYPE, details, options);
    }
}
WebSocketSendEvent.type = exports.WEB_SOCKET_SEND_EVENT_TYPE;
exports.WebSocketSendEvent = WebSocketSendEvent;
