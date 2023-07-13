"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for autoDisconnect().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const setup_test_hub_and_client_1 = require("../../test/setup-test-hub-and-client");
const memorelay_client_disconnect_event_1 = require("../events/memorelay-client-disconnect-event");
const auto_disconnect_1 = require("./auto-disconnect");
describe('autoDisconnect()', () => {
    it('should automatically disconnect handlers', () => {
        const memorelayClient = (0, setup_test_hub_and_client_1.setupTestClient)();
        const mockDisconnectFn = jest.fn();
        (0, auto_disconnect_1.autoDisconnect)(memorelayClient, {
            disconnect: mockDisconnectFn,
        });
        memorelayClient.emitEvent(new memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent({ memorelayClient }));
        expect(mockDisconnectFn).toHaveBeenCalledTimes(1);
    });
});
