"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the increaseClientMaxEventListeners().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const setup_test_hub_and_client_1 = require("../../test/setup-test-hub-and-client");
const increase_client_max_event_listeners_1 = require("./increase-client-max-event-listeners");
const memorelay_client_created_event_1 = require("../events/memorelay-client-created-event");
const memorelay_client_disconnect_event_1 = require("../events/memorelay-client-disconnect-event");
describe('increaseClientMaxEventListeners()', () => {
    it('should throw a RangeError if passed an invalid count', () => {
        for (const invalidIncreaseCount of [NaN, 0, Infinity]) {
            expect(() => {
                (0, increase_client_max_event_listeners_1.increaseClientMaxEventListeners)(invalidIncreaseCount);
            }).toThrow(RangeError);
        }
    });
    describe('#MemorelayClientCreatedEvent', () => {
        it('should increase max listeners by specified amount', () => {
            const memorelayClient = (0, setup_test_hub_and_client_1.setupTestClient)();
            const initialMaxEventListeners = memorelayClient.maxEventListeners;
            const increaseCount = 100;
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)((0, increase_client_max_event_listeners_1.increaseClientMaxEventListeners)(increaseCount));
            hub.emitEvent(new memorelay_client_created_event_1.MemorelayClientCreatedEvent({ memorelayClient }));
            expect(memorelayClient.maxEventListeners).toBe(initialMaxEventListeners + increaseCount);
        });
        it('should do nothing when defaultPrevented', () => {
            const memorelayClient = (0, setup_test_hub_and_client_1.setupTestClient)();
            const initialMaxEventListeners = memorelayClient.maxEventListeners;
            const increaseCount = 100;
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)((0, increase_client_max_event_listeners_1.increaseClientMaxEventListeners)(increaseCount));
            const memorelayClientCreatedEvent = new memorelay_client_created_event_1.MemorelayClientCreatedEvent({
                memorelayClient,
            });
            memorelayClientCreatedEvent.preventDefault();
            hub.emitEvent(memorelayClientCreatedEvent);
            expect(memorelayClient.maxEventListeners).toBe(initialMaxEventListeners);
        });
    });
    describe('#MemorelayClientDisconnectEvent', () => {
        it('trigger disconnect', () => {
            const memorelayClient = (0, setup_test_hub_and_client_1.setupTestClient)();
            const initialMaxEventListeners = memorelayClient.maxEventListeners;
            const increaseCount = 100;
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)((0, increase_client_max_event_listeners_1.increaseClientMaxEventListeners)(increaseCount));
            hub.emitEvent(new memorelay_client_created_event_1.MemorelayClientCreatedEvent({ memorelayClient }));
            memorelayClient.emitEvent(new memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent({ memorelayClient }));
            expect(memorelayClient.maxEventListeners).toBe(initialMaxEventListeners);
        });
        it('should do nothing when defaultPrevented', () => {
            const memorelayClient = (0, setup_test_hub_and_client_1.setupTestClient)();
            const initialMaxEventListeners = memorelayClient.maxEventListeners;
            const increaseCount = 100;
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)((0, increase_client_max_event_listeners_1.increaseClientMaxEventListeners)(increaseCount));
            hub.emitEvent(new memorelay_client_created_event_1.MemorelayClientCreatedEvent({ memorelayClient }));
            const memorelayClientDisconnectEvent = new memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent({
                memorelayClient,
            });
            memorelayClientDisconnectEvent.preventDefault();
            memorelayClient.emitEvent(memorelayClientDisconnectEvent);
            expect(memorelayClient.maxEventListeners).toBe(initialMaxEventListeners + increaseCount);
        });
    });
});
