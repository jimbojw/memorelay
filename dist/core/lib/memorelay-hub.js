"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay event hub.
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemorelayHub = exports.WEBSOCKET_SERVER = void 0;
const ws_1 = require("ws");
const handle_upgrade_1 = require("./handle-upgrade");
const connectable_event_emitter_1 = require("./connectable-event-emitter");
const http_server_request_event_1 = require("../events/http-server-request-event");
/**
 * Symbol for accessing the internal WebSocket server instance.
 */
exports.WEBSOCKET_SERVER = Symbol('webSocketServer');
/**
 * Hub that underlies the Memorelay main class. Provides handler methods for
 * responding to HTTP requests and upgrading WebSocket connections.
 * @see Memorelay
 */
class MemorelayHub extends connectable_event_emitter_1.ConnectableEventEmitter {
    constructor(...plugins) {
        super();
        /**
         * WebSocket server for handling requests.
         */
        this.webSocketServer = new ws_1.WebSocketServer({ noServer: true });
        /**
         * Expose webSocketServer for testing.
         * @see WEBSOCKET_SERVER
         */
        this[_a] = this.webSocketServer;
        this.plugins = plugins;
    }
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
    handleRequest() {
        return (request, response, nextFn) => {
            const httpServerRequestEvent = new http_server_request_event_1.HttpServerRequestEvent({ request, response }, { targetEmitter: this });
            this.emitEvent(httpServerRequestEvent);
            if (nextFn && !httpServerRequestEvent.defaultPrevented) {
                nextFn();
            }
        };
    }
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
    handleUpgrade(path = '/') {
        return (0, handle_upgrade_1.handleUpgrade)(this.webSocketServer, this, path);
    }
}
exports.MemorelayHub = MemorelayHub;
_a = exports.WEBSOCKET_SERVER;
