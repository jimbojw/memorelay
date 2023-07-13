"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for hub and client scaffolding.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const memorelay_client_created_event_1 = require("../core/events/memorelay-client-created-event");
const memorelay_client_1 = require("../core/lib/memorelay-client");
const memorelay_hub_1 = require("../core/lib/memorelay-hub");
const setup_test_hub_and_client_1 = require("./setup-test-hub-and-client");
describe('setupTestHub()', () => {
    it('should create a connectable test hub', () => {
        const hub = (0, setup_test_hub_and_client_1.setupTestHub)();
        expect(hub).toBeInstanceOf(memorelay_hub_1.MemorelayHub);
        hub.connect();
    });
    it('should invoke plugin functions', () => {
        const mockPluginFn = jest.fn();
        const hub = (0, setup_test_hub_and_client_1.setupTestHub)(mockPluginFn);
        expect(mockPluginFn).toHaveBeenCalledTimes(1);
        expect(mockPluginFn).toHaveBeenCalledWith(hub);
    });
});
describe('setupTestClient()', () => {
    it('should create a test client', () => {
        const client = (0, setup_test_hub_and_client_1.setupTestClient)();
        expect(client).toBeInstanceOf(memorelay_client_1.MemorelayClient);
    });
    it('should emit created test client to hub', () => {
        const hub = new memorelay_hub_1.MemorelayHub();
        const mockHandlerFn = jest.fn();
        hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, mockHandlerFn);
        const client = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
        expect(mockHandlerFn).toHaveBeenCalledTimes(1);
        const memorelayClientCreatedEvent = mockHandlerFn.mock.calls[0][0];
        expect(memorelayClientCreatedEvent.details.memorelayClient).toBe(client);
    });
});
describe('setupTestClientAndHub()', () => {
    it('should create a test client and hub', () => {
        const { hub, memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
        expect(hub).toBeInstanceOf(memorelay_hub_1.MemorelayHub);
        expect(memorelayClient).toBeInstanceOf(memorelay_client_1.MemorelayClient);
    });
    it('should invoke plugin functions', () => {
        const mockPluginFns = [
            jest.fn(),
            jest.fn(),
        ];
        const hub = (0, setup_test_hub_and_client_1.setupTestHub)(...mockPluginFns);
        expect(mockPluginFns[0]).toHaveBeenCalledTimes(1);
        expect(mockPluginFns[0]).toHaveBeenCalledWith(hub);
        expect(mockPluginFns[1]).toHaveBeenCalledTimes(1);
        expect(mockPluginFns[1]).toHaveBeenCalledWith(hub);
    });
});
