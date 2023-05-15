/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay WebSocket server.
 */
/// <reference types="node" />
import { Subscriber } from './subscriber';
import { Logger } from 'winston';
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
export declare class MemorelayServer {
    readonly port: number;
    readonly logger: Logger;
    /**
     * WebSocketServer to listen for connections.
     */
    private webSocketServer?;
    /**
     * Backing Memorelay instance for managing received events.
     */
    private readonly memorelay;
    /**
     * Mapping from WebSockets to the connected Subscriber objects.
     */
    private readonly subscribers;
    constructor(port: number, logger: Logger);
    /**
     * Begin listening for WebSocket connections.
     * @returns A promise which resolves to whether the listening was successful.
     */
    listen(): Promise<boolean>;
    /**
     * Stop listening for WebSocket connections.
     * @returns A promise that resolves to whether the stopping was successful.
     */
    stop(): Promise<boolean>;
    /**
     * Accept an incoming WebSocket connection. Should generally only be called by
     * the WebSocketServer's 'connection' event handler.
     * @param webSocket The WebSocket client that has connected.
     * @param incomingMessage The incoming http request.
     * @returns The connected Subscriber object.
     * @throws If the webSocket is already connected.
     */
    connect(webSocket: WebSocket, incomingMessage: IncomingMessage): Subscriber;
}
