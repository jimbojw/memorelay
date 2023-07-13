"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event signaling immanent disconnect of remaining listeners.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemorelayClientDisconnectEvent = exports.MEMORELAY_CLIENT_DISCONNECT_EVENT_TYPE = void 0;
const client_event_1 = require("./client-event");
exports.MEMORELAY_CLIENT_DISCONNECT_EVENT_TYPE = 'memorelay-client-disconnect';
/**
 * Event signaling the immanent disconnect of a MemorelayClient. The default
 * behavior will be to remove all listeners on itself and its assigned
 * WebSocket.
 */
class MemorelayClientDisconnectEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.MEMORELAY_CLIENT_DISCONNECT_EVENT_TYPE, details, options);
    }
}
MemorelayClientDisconnectEvent.type = exports.MEMORELAY_CLIENT_DISCONNECT_EVENT_TYPE;
exports.MemorelayClientDisconnectEvent = MemorelayClientDisconnectEvent;
