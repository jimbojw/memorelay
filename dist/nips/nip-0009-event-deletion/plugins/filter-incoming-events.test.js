"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for filterIncomingEvents().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const nostr_tools_1 = require("nostr-tools");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const signed_test_event_1 = require("../../../test/signed-test-event");
const incoming_event_message_event_1 = require("../../nip-0001-basic-protocol/events/incoming-event-message-event");
const event_deletion_database_1 = require("../lib/event-deletion-database");
const filter_incoming_events_1 = require("./filter-incoming-events");
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
