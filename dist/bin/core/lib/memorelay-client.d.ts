/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A client connected to a Memorelay.
 */
/// <reference types="node" />
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { ClientEvent } from '../events/client-event';
import { ConnectableEventEmitter } from './connectable-event-emitter';
import { Disconnectable } from '../types/disconnectable';
import { BasicEvent } from '../events/basic-event';
/**
 * MemorelayClient plugin which upgrades ws WebSocket 'message' events to
 * WebSocketMessageEvent instances.
 * @param memorelayClient The client on which to upgrade events.
 * @returns Plugin function for MemorelayClient.
 * @emits WebSocketMessageEvent
 */
export declare function upgradeWebSocketMessageEvent(memorelayClient: MemorelayClient): Disconnectable;
/**
 * MemorelayClient plugin which upgrades ws WebSocket 'close' events to
 * WebSocketCloseEvent instances.
 * @param memorelayClient The client on which to upgrade events.
 * @returns Plugin function for MemorelayClient.
 * @emits WebSocketCloseEvent
 */
export declare function upgradeWebSocketCloseEvent(memorelayClient: MemorelayClient): Disconnectable;
/**
 * MemorelayClient plugin which responds to a WebSocketSendEvent by sending the
 * buffer.
 * @param memorelayClient The client on which to listen.
 * @returns Handler.
 */
export declare function sendWebSocketBufferOnEvent(memorelayClient: MemorelayClient): Disconnectable;
/**
 * MemorelayClient plugin which responds to a WebSocketCloseEvent by emitting
 * MemoRelayClientDisconnectEvent.
 * @param memorelayClient The client on which to listen.
 * @returns Handler.
 * @emits MemoRelayClientDisconnectEvent
 */
export declare function emitDisconnectOnClose(memorelayClient: MemorelayClient): Disconnectable;
/**
 * MemorelayClient plugin which responds to a MemoRelayClientDisconnectEvent by
 * calling the instance's disconnect() method.
 * @param memorelayClient The client on which to listen.
 * @returns Handler.
 */
export declare function invokeDisconnectOnEvent(memorelayClient: MemorelayClient): Disconnectable;
/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
export declare class MemorelayClient extends ConnectableEventEmitter<ClientEvent> {
    readonly webSocket: WebSocket;
    readonly request: IncomingMessage;
    readonly parentEvent?: BasicEvent<string, unknown, unknown> | undefined;
    plugins: (typeof upgradeWebSocketMessageEvent)[];
    /**
     * @param webSocket The associated WebSocket for this client.
     * @param request The HTTP request from which the WebSocket was upgraded.
     * @param parentEvent Optional parent event that spawned the client.
     */
    constructor(webSocket: WebSocket, request: IncomingMessage, parentEvent?: BasicEvent<string, unknown, unknown> | undefined);
}
