"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event emitted by Memorelay when it creates a MemorelayClient.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemorelayClientCreatedEvent = exports.MEMORELAY_CLIENT_CREATED_EVENT_TYPE = void 0;
const relay_event_1 = require("./relay-event");
exports.MEMORELAY_CLIENT_CREATED_EVENT_TYPE = 'memorelay-client-created';
/**
 * Event emitted by Memorelay when it creates a MemorelayClient to wrap a
 * connected WebSocket. This would typically be in response to a previously
 * emitted 'connection' event on the Memorelay instance's WebSocketServer.
 */
class MemorelayClientCreatedEvent extends relay_event_1.RelayEvent {
    constructor(details, options) {
        super(exports.MEMORELAY_CLIENT_CREATED_EVENT_TYPE, details, options);
    }
}
MemorelayClientCreatedEvent.type = exports.MEMORELAY_CLIENT_CREATED_EVENT_TYPE;
exports.MemorelayClientCreatedEvent = MemorelayClientCreatedEvent;
