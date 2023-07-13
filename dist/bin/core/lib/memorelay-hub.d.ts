/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay event hub.
 */
/// <reference types="ws" />
import { IncomingMessage, ServerResponse } from 'http';
import { UpgradeHandler } from '../types/upgrade-handler';
import { RelayEvent } from '../events/relay-event';
import { ConnectableEventEmitter } from './connectable-event-emitter';
import { NextFunction } from 'express';
import { PluginFn } from '../types/plugin-types';
/**
 * Symbol for accessing the internal WebSocket server instance.
 */
export declare const WEBSOCKET_SERVER: unique symbol;
/**
 * Hub that underlies the Memorelay main class. Provides handler methods for
 * responding to HTTP requests and upgrading WebSocket connections.
 * @see Memorelay
 */
export declare class MemorelayHub extends ConnectableEventEmitter<RelayEvent> {
    /**
     * WebSocket server for handling requests.
     */
    private readonly webSocketServer;
    /**
     * Expose webSocketServer for testing.
     * @see WEBSOCKET_SERVER
     */
    readonly [WEBSOCKET_SERVER]: import("ws").Server<import("ws").WebSocket>;
    constructor(...plugins: PluginFn<MemorelayHub>[]);
    /**
     * Return a handler for responding to regular HTTP requests.
     *
     * Usage:
     *
     *   const memorelay = new Memorelay();
     *   const httpServer = createServer(memorelay.handleRequest());
     *   httpServer.on('upgrade', memorelay.handleUpgrade());
     *   httpServer.listen({ port: 3000 });
     */
    handleRequest(): (request: IncomingMessage, response: ServerResponse, nextFn?: NextFunction) => void;
    /**
     * Return a handler for upgrading HTTP client connections to WebSockets.
     *
     * Usage:
     *
     *   const memorelay = new Memorelay();
     *   const httpServer = createServer(memorelay.handleRequest());
     *   httpServer.on('upgrade', memorelay.handleUpgrade());
     *   httpServer.listen({ port: 3000 });
     *
     * @param path Optional Express path to match. Defaults to '/'.
     * @returns Upgrade handler function.
     */
    handleUpgrade(path?: string): UpgradeHandler;
}
