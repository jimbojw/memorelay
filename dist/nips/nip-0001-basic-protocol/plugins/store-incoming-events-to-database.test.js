"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for storeIncomingEventsToDatabase().
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const signed_test_event_1 = require("../../../test/signed-test-event");
const did_add_event_to_database_event_1 = require("../events/did-add-event-to-database-event");
const incoming_event_message_event_1 = require("../events/incoming-event-message-event");
const will_add_event_to_database_event_1 = require("../events/will-add-event-to-database-event");
const events_database_1 = require("../lib/events-database");
const store_incoming_events_to_database_1 = require("./store-incoming-events-to-database");
describe('storeIncomingEventsToDatabase()', () => {
    describe('#IncomingEventMessageEvent', () => {
        it('should emit a WillAddEventToDatabaseEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventsDatabase = new events_database_1.EventsDatabase();
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)((0, store_incoming_events_to_database_1.storeIncomingEventsToDatabase)(eventsDatabase));
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(will_add_event_to_database_event_1.WillAddEventToDatabaseEvent, mockHandlerFn);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const incomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            });
            memorelayClient.emitEvent(incomingEventMessageEvent);
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const willAddEventToDatabaseEvent = mockHandlerFn.mock.calls[0][0];
            expect(willAddEventToDatabaseEvent).toBeInstanceOf(will_add_event_to_database_event_1.WillAddEventToDatabaseEvent);
            expect(willAddEventToDatabaseEvent.parentEvent).toBe(incomingEventMessageEvent);
        }));
        it('should not emit when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventsDatabase = new events_database_1.EventsDatabase();
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)((0, store_incoming_events_to_database_1.storeIncomingEventsToDatabase)(eventsDatabase));
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(will_add_event_to_database_event_1.WillAddEventToDatabaseEvent, mockHandlerFn);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const incomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            });
            incomingEventMessageEvent.preventDefault();
            memorelayClient.emitEvent(incomingEventMessageEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
    describe('#WillAddEventToDatabaseEvent', () => {
        it('should add event to database', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventsDatabase = new events_database_1.EventsDatabase();
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)((0, store_incoming_events_to_database_1.storeIncomingEventsToDatabase)(eventsDatabase));
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(did_add_event_to_database_event_1.DidAddEventToDatabaseEvent, mockHandlerFn);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            expect(eventsDatabase.hasEvent(testEvent.id)).toBe(false);
            const willAddEventToDatabaseEvent = new will_add_event_to_database_event_1.WillAddEventToDatabaseEvent({
                event: testEvent,
            });
            memorelayClient.emitEvent(willAddEventToDatabaseEvent);
            expect(mockHandlerFn).not.toHaveBeenCalled();
            expect(eventsDatabase.hasEvent(testEvent.id)).toBe(true);
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const didAddEventToDatabaseEvent = mockHandlerFn.mock.calls[0][0];
            expect(didAddEventToDatabaseEvent).toBeInstanceOf(did_add_event_to_database_event_1.DidAddEventToDatabaseEvent);
            expect(didAddEventToDatabaseEvent.parentEvent).toBe(willAddEventToDatabaseEvent);
        }));
        it('should not add when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventsDatabase = new events_database_1.EventsDatabase();
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)((0, store_incoming_events_to_database_1.storeIncomingEventsToDatabase)(eventsDatabase));
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(did_add_event_to_database_event_1.DidAddEventToDatabaseEvent, mockHandlerFn);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const willAddEventToDatabaseEvent = new will_add_event_to_database_event_1.WillAddEventToDatabaseEvent({
                event: testEvent,
            });
            willAddEventToDatabaseEvent.preventDefault();
            memorelayClient.emitEvent(willAddEventToDatabaseEvent);
            expect(eventsDatabase.hasEvent(testEvent.id)).toBe(false);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
