"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for generalizeOutgoingEventMessages().
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
const generalize_outgoing_event_messages_1 = require("./generalize-outgoing-event-messages");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const signed_test_event_1 = require("../../../test/signed-test-event");
const outgoing_generic_message_event_1 = require("../events/outgoing-generic-message-event");
const outgoing_event_message_event_1 = require("../events/outgoing-event-message-event");
describe('generalizeOutgoingEventMessages()', () => {
    describe('#OutgoingEventMessageEvent', () => {
        it('should send an OutgoingEventMessageEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(generalize_outgoing_event_messages_1.generalizeOutgoingEventMessages);
            const mockMessageHandler = jest.fn();
            memorelayClient.onEvent(outgoing_generic_message_event_1.OutgoingGenericMessageEvent, mockMessageHandler);
            const nostrEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'HELLO WORLD' });
            const outgoingEventMessageEvent = new outgoing_event_message_event_1.OutgoingEventMessageEvent({
                relayEventMessage: ['EVENT', 'SUBSCRIPTION_ID', nostrEvent],
            });
            memorelayClient.emitEvent(outgoingEventMessageEvent);
            yield Promise.resolve();
            expect(outgoingEventMessageEvent.defaultPrevented).toBe(true);
            expect(mockMessageHandler.mock.calls).toHaveLength(1);
            const outgoingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
            expect(outgoingGenericMessageEvent).toBeInstanceOf(outgoing_generic_message_event_1.OutgoingGenericMessageEvent);
            expect(outgoingGenericMessageEvent.details.genericMessage).toEqual([
                'EVENT',
                'SUBSCRIPTION_ID',
                nostrEvent,
            ]);
            expect(outgoingGenericMessageEvent.parentEvent).toBe(outgoingEventMessageEvent);
            expect(outgoingGenericMessageEvent.targetEmitter).toBe(memorelayClient);
        }));
        it('should ignore an outgoing EVENT message if defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(generalize_outgoing_event_messages_1.generalizeOutgoingEventMessages);
            const mockMessageHandler = jest.fn();
            memorelayClient.onEvent(outgoing_generic_message_event_1.OutgoingGenericMessageEvent, mockMessageHandler);
            const nostrEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'HELLO WORLD' });
            const outgoingEventMessageEvent = new outgoing_event_message_event_1.OutgoingEventMessageEvent({
                relayEventMessage: ['EVENT', 'SUBSCRIPTION_ID', nostrEvent],
            });
            outgoingEventMessageEvent.preventDefault();
            memorelayClient.emitEvent(outgoingEventMessageEvent);
            yield Promise.resolve();
            expect(mockMessageHandler.mock.calls).toHaveLength(0);
        }));
    });
});
