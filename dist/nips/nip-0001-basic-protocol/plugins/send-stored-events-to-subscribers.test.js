"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendStoredEventsToSubscribers().
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
const incoming_req_message_event_1 = require("../events/incoming-req-message-event");
const outgoing_eose_message_event_1 = require("../events/outgoing-eose-message-event");
const outgoing_event_message_event_1 = require("../events/outgoing-event-message-event");
const events_database_1 = require("../lib/events-database");
const send_stored_events_to_subscribers_1 = require("./send-stored-events-to-subscribers");
describe('sendStoredEventsToSubscribers()', () => {
    describe('#IncomingReqMessageEvent', () => {
        it('should send stored events to subscribers', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventsDatabase = new events_database_1.EventsDatabase();
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            eventsDatabase.addEvent(testEvent);
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)((0, send_stored_events_to_subscribers_1.sendStoredEventsToSubscribers)(eventsDatabase));
            const mockEventHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_event_message_event_1.OutgoingEventMessageEvent, mockEventHandlerFn);
            const mockEOSEHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_eose_message_event_1.OutgoingEOSEMessageEvent, mockEOSEHandlerFn);
            const incomingReqMessageEvent = new incoming_req_message_event_1.IncomingReqMessageEvent({
                reqMessage: ['REQ', 'SUBSCRIPTION_ID'],
            });
            memorelayClient.emitEvent(incomingReqMessageEvent);
            expect(mockEventHandlerFn).not.toHaveBeenCalled();
            expect(mockEOSEHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockEventHandlerFn).toHaveBeenCalledTimes(1);
            const outgoingEventMessageEvent = mockEventHandlerFn.mock.calls[0][0];
            expect(outgoingEventMessageEvent).toBeInstanceOf(outgoing_event_message_event_1.OutgoingEventMessageEvent);
            expect(outgoingEventMessageEvent.parentEvent).toBe(incomingReqMessageEvent);
            expect(mockEOSEHandlerFn).toHaveBeenCalledTimes(1);
            const outgoingEOSEMessageEvent = mockEOSEHandlerFn.mock.calls[0][0];
            expect(outgoingEOSEMessageEvent).toBeInstanceOf(outgoing_eose_message_event_1.OutgoingEOSEMessageEvent);
            expect(outgoingEOSEMessageEvent.parentEvent).toBe(incomingReqMessageEvent);
        }));
        it('should not send stored events when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventsDatabase = new events_database_1.EventsDatabase();
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            eventsDatabase.addEvent(testEvent);
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)((0, send_stored_events_to_subscribers_1.sendStoredEventsToSubscribers)(eventsDatabase));
            const mockEventHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_event_message_event_1.OutgoingEventMessageEvent, mockEventHandlerFn);
            const mockEOSEHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_eose_message_event_1.OutgoingEOSEMessageEvent, mockEOSEHandlerFn);
            const incomingReqMessageEvent = new incoming_req_message_event_1.IncomingReqMessageEvent({
                reqMessage: ['REQ', 'SUBSCRIPTION_ID'],
            });
            incomingReqMessageEvent.preventDefault();
            memorelayClient.emitEvent(incomingReqMessageEvent);
            yield Promise.resolve();
            expect(mockEventHandlerFn).not.toHaveBeenCalled();
            expect(mockEOSEHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
