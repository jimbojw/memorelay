"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Handle HTTP-to-WebSocket upgrade requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpgrade = void 0;
const path_to_regexp_1 = require("path-to-regexp");
const web_socket_connected_event_1 = require("../events/web-socket-connected-event");
/**
 * Return a handler for upgrading HTTP client connections to WebSockets.
 * @param hub Event emitter through which to broadcast upgrades.
 * @param path Optional Express path to match. Defaults to '/'.
 * @param webSocketServer WebSocket server for handling upgrades.
 * @returns Upgrade handler function.
 */
function handleUpgrade(webSocketServer, hub, path = '/') {
    // Upgrade path string to regex for testing.
    const regex = (0, path_to_regexp_1.pathToRegexp)(path);
    return (request, socket, head) => {
        if (!request.url) {
            throw new Error('url missing');
        }
        // NOTE: The WHATWG URL standard requires a base, but its value doesn't
        // matter to us since we only need the path.
        const { pathname } = new URL(request.url, 'http://dummy');
        if (!regex.test(pathname)) {
            // Nothing to do here. The incoming message URL does not match.
            return;
        }
        webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
            hub.emitEvent(new web_socket_connected_event_1.WebSocketConnectedEvent({ webSocket, request }, { targetEmitter: hub }));
        });
    };
}
exports.handleUpgrade = handleUpgrade;
