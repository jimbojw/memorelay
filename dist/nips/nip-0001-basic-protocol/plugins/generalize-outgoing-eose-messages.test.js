"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for generalizeOutgoingEOSEMessages().
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
const generalize_outgoing_eose_messages_1 = require("./generalize-outgoing-eose-messages");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const outgoing_generic_message_event_1 = require("../events/outgoing-generic-message-event");
const outgoing_eose_message_event_1 = require("../events/outgoing-eose-message-event");
describe('generalizeOutgoingEOSEMessages()', () => {
    describe('#OutgoingEOSEMessageEvent', () => {
        it('should send an OutgoingEOSEMessageEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(generalize_outgoing_eose_messages_1.generalizeOutgoingEOSEMessages);
            const mockMessageHandler = jest.fn();
            memorelayClient.onEvent(outgoing_generic_message_event_1.OutgoingGenericMessageEvent, mockMessageHandler);
            const outgoingEOSEMessageEvent = new outgoing_eose_message_event_1.OutgoingEOSEMessageEvent({
                relayEOSEMessage: ['EOSE', 'SUBSCRIPTION_ID'],
            });
            memorelayClient.emitEvent(outgoingEOSEMessageEvent);
            yield Promise.resolve();
            expect(outgoingEOSEMessageEvent.defaultPrevented).toBe(true);
            expect(mockMessageHandler.mock.calls).toHaveLength(1);
            const outgoingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
            expect(outgoingGenericMessageEvent).toBeInstanceOf(outgoing_generic_message_event_1.OutgoingGenericMessageEvent);
            expect(outgoingGenericMessageEvent.details.genericMessage).toEqual([
                'EOSE',
                'SUBSCRIPTION_ID',
            ]);
            expect(outgoingGenericMessageEvent.parentEvent).toBe(outgoingEOSEMessageEvent);
            expect(outgoingGenericMessageEvent.targetEmitter).toBe(memorelayClient);
        }));
        it('should ignore an outgoing EVENT message if defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(generalize_outgoing_eose_messages_1.generalizeOutgoingEOSEMessages);
            const mockMessageHandler = jest.fn();
            memorelayClient.onEvent(outgoing_generic_message_event_1.OutgoingGenericMessageEvent, mockMessageHandler);
            const outgoingEOSEMessageEvent = new outgoing_eose_message_event_1.OutgoingEOSEMessageEvent({
                relayEOSEMessage: ['EOSE', 'SUBSCRIPTION_ID'],
            });
            outgoingEOSEMessageEvent.preventDefault();
            memorelayClient.emitEvent(outgoingEOSEMessageEvent);
            yield Promise.resolve();
            expect(mockMessageHandler.mock.calls).toHaveLength(0);
        }));
    });
});
