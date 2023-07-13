"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for basicProtocol().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const basic_event_emitter_1 = require("../../../core/lib/basic-event-emitter");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
describe('basicProtocol()', () => {
    it('should increase maxEventListeners of hub', () => {
        const hub = (0, setup_test_hub_and_client_1.setupTestHub)();
        const initialMaxEventListeners = hub.maxEventListeners;
        (0, _1.basicProtocol)(hub);
        expect(hub.maxEventListeners).toBeGreaterThan(initialMaxEventListeners);
    });
    describe('disconnect()', () => {
        it('should restore maxEventListeners of hub', () => {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)();
            const initialMaxEventListeners = hub.maxEventListeners;
            const { disconnect } = (0, _1.basicProtocol)(hub);
            disconnect();
            expect(hub.maxEventListeners).toBe(initialMaxEventListeners);
        });
    });
    it('should implement the basic Nostr protocol per NIP-01', () => {
        (0, _1.basicProtocol)(new basic_event_emitter_1.BasicEventEmitter());
        // TODO(jimbo): Add integration tests.
    });
});
