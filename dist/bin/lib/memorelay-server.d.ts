/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay WebSocket server.
 */
/// <reference types="node" />
import { RelayInformationDocument } from './relay-information-document';
import { Subscriber } from './subscriber';
import { Logger } from 'winston';
import { IncomingMessage, ServerResponse } from 'http';
import { WebSocket } from 'ws';
export declare class MemorelayServer {
    readonly port: number;
    readonly logger: Logger;
    /**
     * HTTP server to listen for connections.
     */
    private readonly httpServer;
    /**
     * WebSocketServer to listen for connections.
     */
    private readonly webSocketServer;
    /**
     * Backing coordinator instance for managing received events.
     */
    private readonly coordinator;
    /**
     * Mapping from WebSockets to the connected Subscriber objects.
     */
    private readonly subscribers;
    /**
     * Promise for the active call to `listen()`.
     */
    private listeningPromise?;
    /**
     * Promise for the active call to `stop()`.
     */
    private stoppingPromise?;
    /**
     * @param port TCP port on which to listen.
     * @param logger Logger to use for reporting.
     */
    constructor(port: number, logger: Logger);
    /**
     * Begin listening for HTTP connections.
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
    /**
     * Handle an incoming http request.
     */
    handleRequest(request: IncomingMessage, response: ServerResponse): void;
    /**
     * Send the NIP-11 relay information document.
     */
    sendRelayDocument(request: IncomingMessage, response: ServerResponse): void;
    /**
     * Return the NIP-11 relay information document.
     */
    getRelayDocument(): RelayInformationDocument;
}
