"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for filterOutgoingEvents().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const nostr_tools_1 = require("nostr-tools");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const signed_test_event_1 = require("../../../test/signed-test-event");
const event_deletion_database_1 = require("../lib/event-deletion-database");
const filter_outgoing_events_1 = require("./filter-outgoing-events");
const outgoing_event_message_event_1 = require("../../nip-0001-basic-protocol/events/outgoing-event-message-event");
describe('filterOutgoingEvents()', () => {
    describe('#OutgoingEventMessageEvent', () => {
        it('should filter deleted outgoing events', () => {
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
            (0, filter_outgoing_events_1.filterOutgoingEvents)(eventDeletionDatabase, memorelayClient);
            const outgoingEventMessageEvent = new outgoing_event_message_event_1.OutgoingEventMessageEvent({
                relayEventMessage: ['EVENT', 'SUBSCRIPTION_ID', testEvent],
            });
            memorelayClient.emitEvent(outgoingEventMessageEvent);
            expect(outgoingEventMessageEvent.defaultPrevented).toBe(true);
        });
        it('should do nothing when defaultPrevented', () => {
            const eventDeletionDatabase = new event_deletion_database_1.EventDeletionDatabase();
            const spy = jest.spyOn(eventDeletionDatabase, 'isDeleted');
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
            (0, filter_outgoing_events_1.filterOutgoingEvents)(eventDeletionDatabase, memorelayClient);
            const outgoingEventMessageEvent = new outgoing_event_message_event_1.OutgoingEventMessageEvent({
                relayEventMessage: ['EVENT', 'SUBSCRIPTION_ID', testEvent],
            });
            outgoingEventMessageEvent.preventDefault();
            memorelayClient.emitEvent(outgoingEventMessageEvent);
            expect(spy).not.toHaveBeenCalled();
        });
    });
});
