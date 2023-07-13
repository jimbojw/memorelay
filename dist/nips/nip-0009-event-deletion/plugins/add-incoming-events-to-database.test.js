"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for addIncomingEventsToDatabase().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const signed_test_event_1 = require("../../../test/signed-test-event");
const incoming_event_message_event_1 = require("../../nip-0001-basic-protocol/events/incoming-event-message-event");
const event_deletion_database_1 = require("../lib/event-deletion-database");
const add_incoming_events_to_database_1 = require("./add-incoming-events-to-database");
describe('addIncomingEventsToDatabase()', () => {
    describe('#IncomingEventMessageEvent', () => {
        it('should add incoming event to the database', () => {
            const eventDeletionDatabase = new event_deletion_database_1.EventDeletionDatabase();
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
            (0, add_incoming_events_to_database_1.addIncomingEventsToDatabase)(eventDeletionDatabase, memorelayClient);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const incomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            });
            memorelayClient.emitEvent(incomingEventMessageEvent);
            expect(eventDeletionDatabase.hasEvent(testEvent.id)).toBe(true);
        });
        it('should not add when defaultPrevented', () => {
            const eventDeletionDatabase = new event_deletion_database_1.EventDeletionDatabase();
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
            (0, add_incoming_events_to_database_1.addIncomingEventsToDatabase)(eventDeletionDatabase, memorelayClient);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const incomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            });
            incomingEventMessageEvent.preventDefault();
            memorelayClient.emitEvent(incomingEventMessageEvent);
            expect(eventDeletionDatabase.hasEvent(testEvent.id)).toBe(false);
        });
    });
});
