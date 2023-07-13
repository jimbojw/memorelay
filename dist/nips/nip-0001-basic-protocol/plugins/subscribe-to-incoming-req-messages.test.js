"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for subscribeToReqMessages().
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
const subscribe_to_incoming_req_messages_1 = require("./subscribe-to-incoming-req-messages");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const outgoing_generic_message_event_1 = require("../events/outgoing-generic-message-event");
const incoming_req_message_event_1 = require("../events/incoming-req-message-event");
const signed_test_event_1 = require("../../../test/signed-test-event");
const broadcast_event_message_event_1 = require("../events/broadcast-event-message-event");
const incoming_close_message_event_1 = require("../events/incoming-close-message-event");
const memorelay_client_disconnect_event_1 = require("../../../core/events/memorelay-client-disconnect-event");
const outgoing_event_message_event_1 = require("../events/outgoing-event-message-event");
const memorelay_client_1 = require("../../../core/lib/memorelay-client");
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const subscription_not_found_event_1 = require("../events/subscription-not-found-event");
describe('subscribeToReqMessages()', () => {
    describe('#MemorelayClientCreatedEvent', () => {
        it('should increase the maxEventListeners of hub', () => {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages);
            const initialMaxEventListeners = hub.maxEventListeners;
            hub.emitEvent(new memorelay_client_created_event_1.MemorelayClientCreatedEvent({
                memorelayClient: new memorelay_client_1.MemorelayClient({}, {}),
            }));
            expect(hub.maxEventListeners).toBeGreaterThan(initialMaxEventListeners);
        });
    });
    describe('#IncomingReqMessageEvent', () => {
        it('should begin a subscription', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages);
            const subscribingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const sendingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const mockOutgoingListenerFn = jest.fn();
            subscribingClient.onEvent(outgoing_event_message_event_1.OutgoingEventMessageEvent, mockOutgoingListenerFn);
            subscribingClient.emitEvent(new incoming_req_message_event_1.IncomingReqMessageEvent({ reqMessage: ['REQ', 'SUBSCRIPTION_ID'] }));
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST EVENT' });
            const broadcastEventMessageEvent = new broadcast_event_message_event_1.BroadcastEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
                memorelayClient: sendingClient,
            });
            hub.emitEvent(broadcastEventMessageEvent);
            yield Promise.resolve();
            expect(mockOutgoingListenerFn).toHaveBeenCalledTimes(1);
            const outgoingEventMessageEvent = mockOutgoingListenerFn.mock.calls[0][0];
            expect(outgoingEventMessageEvent.details.relayEventMessage).toEqual([
                'EVENT',
                'SUBSCRIPTION_ID',
                testEvent,
            ]);
            expect(outgoingEventMessageEvent.parentEvent).toBe(broadcastEventMessageEvent);
            expect(outgoingEventMessageEvent.targetEmitter).toBe(subscribingClient);
        }));
        it('should not begin a subscription when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages);
            const subscribingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const sendingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const mockOutgoingListenerFn = jest.fn();
            subscribingClient.onEvent(outgoing_event_message_event_1.OutgoingEventMessageEvent, mockOutgoingListenerFn);
            const incomingReqMessageEvent = new incoming_req_message_event_1.IncomingReqMessageEvent({
                reqMessage: ['REQ', 'SUBSCRIPTION_ID'],
            });
            incomingReqMessageEvent.preventDefault();
            subscribingClient.emitEvent(incomingReqMessageEvent);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST EVENT' });
            const broadcastEventMessageEvent = new broadcast_event_message_event_1.BroadcastEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
                memorelayClient: sendingClient,
            });
            hub.emitEvent(broadcastEventMessageEvent);
            yield Promise.resolve();
            expect(mockOutgoingListenerFn).not.toHaveBeenCalled();
        }));
    });
    describe('#IncomingCloseMessageEvent', () => {
        it('should close a subscription', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages);
            const subscribingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const sendingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const mockOutgoingListenerFn = jest.fn();
            subscribingClient.onEvent(outgoing_event_message_event_1.OutgoingEventMessageEvent, mockOutgoingListenerFn);
            subscribingClient.emitEvent(new incoming_req_message_event_1.IncomingReqMessageEvent({ reqMessage: ['REQ', 'SUBSCRIPTION_ID'] }));
            subscribingClient.emitEvent(new incoming_close_message_event_1.IncomingCloseMessageEvent({
                closeMessage: ['CLOSE', 'SUBSCRIPTION_ID'],
            }));
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST EVENT' });
            hub.emitEvent(new broadcast_event_message_event_1.BroadcastEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
                memorelayClient: sendingClient,
            }));
            yield Promise.resolve();
            expect(mockOutgoingListenerFn).not.toHaveBeenCalled();
        }));
        it('should not close a subscription when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages);
            const subscribingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const sendingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const mockOutgoingListenerFn = jest.fn();
            subscribingClient.onEvent(outgoing_event_message_event_1.OutgoingEventMessageEvent, mockOutgoingListenerFn);
            subscribingClient.emitEvent(new incoming_req_message_event_1.IncomingReqMessageEvent({ reqMessage: ['REQ', 'SUBSCRIPTION_ID'] }));
            const incomingCloseMessageEvent = new incoming_close_message_event_1.IncomingCloseMessageEvent({
                closeMessage: ['CLOSE', 'SUBSCRIPTION_ID'],
            });
            incomingCloseMessageEvent.preventDefault();
            subscribingClient.emitEvent(incomingCloseMessageEvent);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST EVENT' });
            hub.emitEvent(new broadcast_event_message_event_1.BroadcastEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
                memorelayClient: sendingClient,
            }));
            yield Promise.resolve();
            expect(mockOutgoingListenerFn).toHaveBeenCalledTimes(1);
        }));
        it('should trigger an error for unknown subscription id', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages);
            const subscribingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const mockHandlerFn = jest.fn();
            subscribingClient.onEvent(subscription_not_found_event_1.SubscriptionNotFoundEvent, mockHandlerFn);
            subscribingClient.emitEvent(new incoming_close_message_event_1.IncomingCloseMessageEvent({
                closeMessage: ['CLOSE', 'UNKNOWN_SUBSCRIPTION_ID'],
            }));
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
        }));
    });
    describe('#BroadcastEventMessageEvent', () => {
        it('should send only matching events', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages);
            const subscribingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const sendingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const mockOutgoingListenerFn = jest.fn();
            subscribingClient.onEvent(outgoing_event_message_event_1.OutgoingEventMessageEvent, mockOutgoingListenerFn);
            subscribingClient.emitEvent(new incoming_req_message_event_1.IncomingReqMessageEvent({
                reqMessage: ['REQ', 'FILTERED_SUBSCRIPTION_ID', { kinds: [1001] }],
            }));
            [
                (0, signed_test_event_1.createSignedTestEvent)({ kind: 1000, content: 'NO MATCH' }),
                (0, signed_test_event_1.createSignedTestEvent)({ kind: 1001, content: 'MATCHES' }),
                (0, signed_test_event_1.createSignedTestEvent)({ kind: 1002, content: 'NO MATCH' }),
            ].forEach((testEvent) => {
                hub.emitEvent(new broadcast_event_message_event_1.BroadcastEventMessageEvent({
                    clientEventMessage: ['EVENT', testEvent],
                    memorelayClient: sendingClient,
                }));
            });
            yield Promise.resolve();
            expect(mockOutgoingListenerFn).toHaveBeenCalledTimes(1);
            const outgoingEventMessageEvent = mockOutgoingListenerFn.mock.calls[0][0];
            const [, outgoingSubscriptionId, outgoingEvent] = outgoingEventMessageEvent.details.relayEventMessage;
            expect(outgoingSubscriptionId).toBe('FILTERED_SUBSCRIPTION_ID');
            expect(outgoingEvent.content).toBe('MATCHES');
        }));
        it('should send to large numbers of clients', () => __awaiter(void 0, void 0, void 0, function* () {
            // TODO(jimbo): Assert that process.emitWarning() was not called.
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages);
            const sendingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const subscribingClients = new Array(1000)
                .fill(0)
                .map(() => (0, setup_test_hub_and_client_1.setupTestClient)(hub));
            const mockOutgoingListenerFn = jest.fn();
            subscribingClients.forEach((subscribingClient, index) => {
                subscribingClient.onEvent(outgoing_event_message_event_1.OutgoingEventMessageEvent, mockOutgoingListenerFn);
                subscribingClient.emitEvent(new incoming_req_message_event_1.IncomingReqMessageEvent({
                    reqMessage: ['REQ', `SUB INDEX: ${index}`],
                }));
            });
            const blastEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'BLAST EVENT' });
            hub.emitEvent(new broadcast_event_message_event_1.BroadcastEventMessageEvent({
                clientEventMessage: ['EVENT', blastEvent],
                memorelayClient: sendingClient,
            }));
            yield Promise.resolve();
            expect(mockOutgoingListenerFn).toHaveBeenCalledTimes(subscribingClients.length);
            mockOutgoingListenerFn.mock.calls.forEach(([outgoingEventMessageEvent], index) => {
                const [, subscriptionId, relayEvent] = outgoingEventMessageEvent.details.relayEventMessage;
                expect(subscriptionId).toBe(`SUB INDEX: ${index}`);
                expect(relayEvent).toEqual(blastEvent);
            });
        }));
    });
    describe('#MemorelayClientDisconnectEvent', () => {
        it('should trigger disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages);
            const subscribingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const sendingClient = (0, setup_test_hub_and_client_1.setupTestClient)(hub);
            const mockOutgoingListenerFn = jest.fn();
            subscribingClient.onEvent(outgoing_generic_message_event_1.OutgoingGenericMessageEvent, mockOutgoingListenerFn);
            subscribingClient.emitEvent(new incoming_req_message_event_1.IncomingReqMessageEvent({
                reqMessage: ['REQ', 'FILTERED_SUBSCRIPTION_ID', { kinds: [1001] }],
            }));
            subscribingClient.emitEvent(new memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent({
                memorelayClient: subscribingClient,
            }));
            [
                (0, signed_test_event_1.createSignedTestEvent)({ kind: 1000, content: 'NO MATCH' }),
                (0, signed_test_event_1.createSignedTestEvent)({ kind: 1001, content: 'MATCHES' }),
                (0, signed_test_event_1.createSignedTestEvent)({ kind: 1002, content: 'NO MATCH' }),
            ].forEach((testEvent) => {
                hub.emitEvent(new broadcast_event_message_event_1.BroadcastEventMessageEvent({
                    clientEventMessage: ['EVENT', testEvent],
                    memorelayClient: sendingClient,
                }));
            });
            yield Promise.resolve();
            expect(mockOutgoingListenerFn).not.toHaveBeenCalled();
        }));
        it('should restore maxEventListeners of hub', () => {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(subscribe_to_incoming_req_messages_1.subscribeToIncomingReqMessages);
            const initialMaxEventListeners = hub.maxEventListeners;
            const memorelayClient = new memorelay_client_1.MemorelayClient({}, {});
            hub.emitEvent(new memorelay_client_created_event_1.MemorelayClientCreatedEvent({ memorelayClient }));
            memorelayClient.emitEvent(new memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent({ memorelayClient }));
            expect(hub.maxEventListeners).toBe(initialMaxEventListeners);
        });
    });
});
