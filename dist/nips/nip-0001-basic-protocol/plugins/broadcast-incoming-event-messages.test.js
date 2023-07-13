"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for broadcastIncomingEventMessages().
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
const broadcast_event_message_event_1 = require("../events/broadcast-event-message-event");
const broadcast_incoming_event_messages_1 = require("./broadcast-incoming-event-messages");
const incoming_event_message_event_1 = require("../events/incoming-event-message-event");
const signed_test_event_1 = require("../../../test/signed-test-event");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
describe('broadcastIncomingEventMessages()', () => {
    describe('#IncomingEventMessageEvent', () => {
        it('should broadcast incoming EVENT messages up to the hub', () => __awaiter(void 0, void 0, void 0, function* () {
            const { hub, memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(broadcast_incoming_event_messages_1.broadcastIncomingEventMessages);
            const mockHandlerFn = jest.fn();
            hub.onEvent(broadcast_event_message_event_1.BroadcastEventMessageEvent, mockHandlerFn);
            const eventMessage = [
                'EVENT',
                (0, signed_test_event_1.createSignedTestEvent)({ content: 'testing testing' }),
            ];
            const incomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: eventMessage,
            });
            memorelayClient.emitEvent(incomingEventMessageEvent);
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const broadcastEventMessageEvent = mockHandlerFn.mock.calls[0][0];
            expect(broadcastEventMessageEvent).toBeInstanceOf(broadcast_event_message_event_1.BroadcastEventMessageEvent);
            expect(broadcastEventMessageEvent.details.clientEventMessage).toBe(eventMessage);
            expect(broadcastEventMessageEvent.details.memorelayClient).toBe(memorelayClient);
            expect(broadcastEventMessageEvent.parentEvent).toBe(incomingEventMessageEvent);
            expect(broadcastEventMessageEvent.targetEmitter).toBe(hub);
        }));
        it('should NOT broadcast when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { hub, memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(broadcast_incoming_event_messages_1.broadcastIncomingEventMessages);
            const mockHandlerFn = jest.fn();
            hub.onEvent(broadcast_event_message_event_1.BroadcastEventMessageEvent, mockHandlerFn);
            const eventMessage = [
                'EVENT',
                (0, signed_test_event_1.createSignedTestEvent)({ content: 'testing testing' }),
            ];
            const incomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: eventMessage,
            });
            incomingEventMessageEvent.preventDefault();
            memorelayClient.emitEvent(incomingEventMessageEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
