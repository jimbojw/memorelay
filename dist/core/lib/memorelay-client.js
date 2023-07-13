"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A client connected to a Memorelay.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemorelayClient = exports.invokeDisconnectOnEvent = exports.emitDisconnectOnClose = exports.sendWebSocketBufferOnEvent = exports.upgradeWebSocketCloseEvent = exports.upgradeWebSocketMessageEvent = void 0;
const web_socket_message_event_1 = require("../events/web-socket-message-event");
const web_socket_close_event_1 = require("../events/web-socket-close-event");
const on_with_handler_1 = require("./on-with-handler");
const memorelay_client_disconnect_event_1 = require("../events/memorelay-client-disconnect-event");
const connectable_event_emitter_1 = require("./connectable-event-emitter");
const web_socket_send_event_1 = require("../events/web-socket-send-event");
/**
 * MemorelayClient plugin which upgrades ws WebSocket 'message' events to
 * WebSocketMessageEvent instances.
 * @param memorelayClient The client on which to upgrade events.
 * @returns Plugin function for MemorelayClient.
 * @emits WebSocketMessageEvent
 */
function upgradeWebSocketMessageEvent(memorelayClient) {
    return (0, on_with_handler_1.onWithHandler)(memorelayClient.webSocket, 'message', (data, isBinary) => {
        memorelayClient.emitEvent(new web_socket_message_event_1.WebSocketMessageEvent({ data, isBinary }, {
            targetEmitter: memorelayClient,
            parentEvent: memorelayClient.parentEvent,
        }));
    });
}
exports.upgradeWebSocketMessageEvent = upgradeWebSocketMessageEvent;
/**
 * MemorelayClient plugin which upgrades ws WebSocket 'close' events to
 * WebSocketCloseEvent instances.
 * @param memorelayClient The client on which to upgrade events.
 * @returns Plugin function for MemorelayClient.
 * @emits WebSocketCloseEvent
 */
function upgradeWebSocketCloseEvent(memorelayClient) {
    return (0, on_with_handler_1.onWithHandler)(memorelayClient.webSocket, 'close', (code) => {
        memorelayClient.emitEvent(new web_socket_close_event_1.WebSocketCloseEvent({ code }, {
            targetEmitter: memorelayClient,
            parentEvent: memorelayClient.parentEvent,
        }));
    });
}
exports.upgradeWebSocketCloseEvent = upgradeWebSocketCloseEvent;
/**
 * MemorelayClient plugin which responds to a WebSocketSendEvent by sending the
 * buffer.
 * @param memorelayClient The client on which to listen.
 * @returns Handler.
 */
function sendWebSocketBufferOnEvent(memorelayClient) {
    return memorelayClient.onEvent(web_socket_send_event_1.WebSocketSendEvent, (webSocketSendEvent) => {
        if (webSocketSendEvent.defaultPrevented) {
            return; // Preempted by another handler.
        }
        const { buffer } = webSocketSendEvent.details;
        memorelayClient.webSocket.send(buffer);
    });
}
exports.sendWebSocketBufferOnEvent = sendWebSocketBufferOnEvent;
/**
 * MemorelayClient plugin which responds to a WebSocketCloseEvent by emitting
 * MemoRelayClientDisconnectEvent.
 * @param memorelayClient The client on which to listen.
 * @returns Handler.
 * @emits MemoRelayClientDisconnectEvent
 */
function emitDisconnectOnClose(memorelayClient) {
    return memorelayClient.onEvent(web_socket_close_event_1.WebSocketCloseEvent, (webSocketCloseEvent) => {
        if (webSocketCloseEvent.defaultPrevented) {
            return; // Preempted by another handler.
        }
        queueMicrotask(() => {
            memorelayClient.emitEvent(new memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent({ memorelayClient }, { parentEvent: webSocketCloseEvent, targetEmitter: memorelayClient }));
        });
    });
}
exports.emitDisconnectOnClose = emitDisconnectOnClose;
/**
 * MemorelayClient plugin which responds to a MemoRelayClientDisconnectEvent by
 * calling the instance's disconnect() method.
 * @param memorelayClient The client on which to listen.
 * @returns Handler.
 */
function invokeDisconnectOnEvent(memorelayClient) {
    return memorelayClient.onEvent(memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent, (memorelayClientDisconnectedEvent) => {
        if (memorelayClientDisconnectedEvent.defaultPrevented) {
            return; // Preempted by another handler.
        }
        memorelayClient.disconnect();
    });
}
exports.invokeDisconnectOnEvent = invokeDisconnectOnEvent;
/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
class MemorelayClient extends connectable_event_emitter_1.ConnectableEventEmitter {
    /**
     * @param webSocket The associated WebSocket for this client.
     * @param request The HTTP request from which the WebSocket was upgraded.
     * @param parentEvent Optional parent event that spawned the client.
     */
    constructor(webSocket, request, parentEvent) {
        super();
        this.webSocket = webSocket;
        this.request = request;
        this.parentEvent = parentEvent;
        this.plugins = [
            // Upgrade native WebSocket 'message' events to WebSocketMessageEvents.
            upgradeWebSocketMessageEvent,
            // Upgrade native WebSocket 'close' events to WebSocketCloseEvents.
            upgradeWebSocketCloseEvent,
            // On WebSocketSendEvent, send the attached buffer.
            sendWebSocketBufferOnEvent,
            // On WebSocketCloseEvent, trigger MemorelayClientDisconnectEvent.
            emitDisconnectOnClose,
            // On MemorelayClientDisconnectEvent, disconnect.
            invokeDisconnectOnEvent,
        ];
    }
}
exports.MemorelayClient = MemorelayClient;
