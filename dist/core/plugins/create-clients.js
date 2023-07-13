"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for upgrading connected WebSockets to
 * MemorelayClient instances.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClients = void 0;
const memorelay_client_1 = require("../lib/memorelay-client");
const web_socket_connected_event_1 = require("../events/web-socket-connected-event");
const memorelay_client_created_event_1 = require("../events/memorelay-client-created-event");
const duplicate_web_socket_error_event_1 = require("../events/duplicate-web-socket-error-event");
/**
 * Core plugin to create MemorelayClient instances out of connected WebSockets.
 * @param hub Event hub for inter-plugin communication.
 * @return Plugin function.
 */
function createClients(hub) {
    const webSocketClientMap = new Map();
    return hub.onEvent(web_socket_connected_event_1.WebSocketConnectedEvent, (webSocketConnectedEvent) => {
        if (webSocketConnectedEvent.defaultPrevented) {
            return; // Client creation preempted by another listener.
        }
        const { webSocket, request } = webSocketConnectedEvent.details;
        if (webSocketClientMap.has(webSocket)) {
            queueMicrotask(() => {
                hub.emitEvent(new duplicate_web_socket_error_event_1.DuplicateWebSocketErrorEvent({ webSocket }));
            });
            return;
        }
        const memorelayClient = new memorelay_client_1.MemorelayClient(webSocket, request, webSocketConnectedEvent);
        webSocketClientMap.set(webSocket, memorelayClient);
        const memorelayClientCreatedEvent = new memorelay_client_created_event_1.MemorelayClientCreatedEvent({ memorelayClient }, { parentEvent: webSocketConnectedEvent, targetEmitter: hub });
        webSocketConnectedEvent.preventDefault();
        queueMicrotask(() => {
            hub.emitEvent(memorelayClientCreatedEvent);
            if (!memorelayClientCreatedEvent.defaultPrevented) {
                memorelayClient.connect();
            }
        });
    });
}
exports.createClients = createClients;
