"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for filterIncomingEvents().
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
const nostr_tools_1 = require("nostr-tools");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const signed_test_event_1 = require("../../../test/signed-test-event");
const incoming_event_message_event_1 = require("../../nip-0001-basic-protocol/events/incoming-event-message-event");
const event_deletion_database_1 = require("../lib/event-deletion-database");
const filter_incoming_events_1 = require("./filter-incoming-events");
const did_add_event_to_database_event_1 = require("../../nip-0001-basic-protocol/events/did-add-event-to-database-event");
describe('filterIncomingEvents()', () => {
    describe('#IncomingEventMessageEvent', () => {
        it('should filter deleted incoming events', () => {
            const eventDeletionDatabase = new event_deletion_database_1.EventDeletionDatabase();
            const authorSecretKey = (0, nostr_tools_1.generatePrivateKey)();
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' }, authorSecretKey);
            const deletionEvent = (0, signed_test_event_1.createSignedTestEvent)({
                kind: nostr_tools_1.Kind.EventDeletion,
                content: 'DELETION',
                tags: [['e', testEvent.id]],
            }, authorSecretKey);
            eventDeletionDatabase.addEvent(testEvent);
            eventDeletionDatabase.addEvent(deletionEvent);
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
            (0, filter_incoming_events_1.filterIncomingEvents)(eventDeletionDatabase, memorelayClient);
            const incomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            });
            memorelayClient.emitEvent(incomingEventMessageEvent);
            expect(incomingEventMessageEvent.defaultPrevented).toBe(true);
        });
        it('should emit synthetic "did add" database event', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventDeletionDatabase = new event_deletion_database_1.EventDeletionDatabase();
            const authorSecretKey = (0, nostr_tools_1.generatePrivateKey)();
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' }, authorSecretKey);
            const deletionEvent = (0, signed_test_event_1.createSignedTestEvent)({
                kind: nostr_tools_1.Kind.EventDeletion,
                content: 'DELETION',
                tags: [['e', testEvent.id]],
            }, authorSecretKey);
            eventDeletionDatabase.addEvent(testEvent);
            eventDeletionDatabase.addEvent(deletionEvent);
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
            (0, filter_incoming_events_1.filterIncomingEvents)(eventDeletionDatabase, memorelayClient);
            const mockDidAddHandlerFn = jest.fn();
            memorelayClient.onEvent(did_add_event_to_database_event_1.DidAddEventToDatabaseEvent, mockDidAddHandlerFn);
            memorelayClient.emitEvent(new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            }));
            expect(mockDidAddHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockDidAddHandlerFn).toHaveBeenCalledTimes(1);
        }));
        it('should do nothing when defaultPrevented', () => {
            const eventDeletionDatabase = new event_deletion_database_1.EventDeletionDatabase();
            const spy = jest.spyOn(eventDeletionDatabase, 'isDeleted');
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
            (0, filter_incoming_events_1.filterIncomingEvents)(eventDeletionDatabase, memorelayClient);
            const incomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            });
            incomingEventMessageEvent.preventDefault();
            memorelayClient.emitEvent(incomingEventMessageEvent);
            expect(spy).not.toHaveBeenCalled();
        });
    });
});
