"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Scaffolding for setting up hubs and clients in tests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTestHubAndClient = exports.setupTestClient = exports.setupTestHub = void 0;
const memorelay_client_1 = require("../core/lib/memorelay-client");
const memorelay_client_created_event_1 = require("../core/events/memorelay-client-created-event");
const memorelay_hub_1 = require("../core/lib/memorelay-hub");
/**
 * Test harness to setup a test hub with one or more plugins under test.
 */
function setupTestHub(...pluginFns) {
    const hub = new memorelay_hub_1.MemorelayHub(...pluginFns).connect();
    return hub;
}
exports.setupTestHub = setupTestHub;
/**
 * Test harness to create a client and emit it through the hub.
 * @param hub Hub through which to emit the new client.
 */
function setupTestClient(hub) {
    const mockRequest = {};
    const mockWebSocket = {};
    const memorelayClient = new memorelay_client_1.MemorelayClient(mockWebSocket, mockRequest);
    if (hub) {
        hub.emitEvent(new memorelay_client_created_event_1.MemorelayClientCreatedEvent({ memorelayClient }, { targetEmitter: hub }));
    }
    return memorelayClient;
}
exports.setupTestClient = setupTestClient;
/**
 * Convenience method for setting up an event emitter hub and a MemorelayClient
 * wrapping a mock WebSocket. This construction is useful for streamlining tests
 * that want to operate on MemorelayClient events.
 * @param pluginFns Functions to invoke before emitting the client. This is
 * where the code under test will generally be ran.
 * @returns An object with both the created hub and memorelayClient.
 */
function setupTestHubAndClient(...pluginFns) {
    const hub = setupTestHub(...pluginFns);
    const memorelayClient = setupTestClient(hub);
    return { hub, memorelayClient };
}
exports.setupTestHubAndClient = setupTestHubAndClient;
