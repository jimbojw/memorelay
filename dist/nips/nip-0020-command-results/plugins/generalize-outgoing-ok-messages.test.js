"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for generalizeOutgoingOKMessages().
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
const outgoing_generic_message_event_1 = require("../../nip-0001-basic-protocol/events/outgoing-generic-message-event");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
const generalize_outgoing_ok_messages_1 = require("./generalize-outgoing-ok-messages");
describe('generalizeOutgoingOKMessages()', () => {
    describe('#OutgoingOKMessageEvent', () => {
        it('should send an outgoing generic message event', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
            (0, generalize_outgoing_ok_messages_1.generalizeOutgoingOKMessage)(memorelayClient);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_generic_message_event_1.OutgoingGenericMessageEvent, mockHandlerFn);
            const outgoingOKMessageEvent = new outgoing_ok_message_event_1.OutgoingOKMessageEvent({
                okMessage: ['OK', 'EVENT_ID', true, 'EXPLANATION'],
            });
            memorelayClient.emitEvent(outgoingOKMessageEvent);
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const outgoingGenericMessageEvent = mockHandlerFn.mock.calls[0][0];
            expect(outgoingGenericMessageEvent).toBeInstanceOf(outgoing_generic_message_event_1.OutgoingGenericMessageEvent);
            expect(outgoingGenericMessageEvent.parentEvent).toBe(outgoingOKMessageEvent);
        }));
        it('should not send when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
            (0, generalize_outgoing_ok_messages_1.generalizeOutgoingOKMessage)(memorelayClient);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_generic_message_event_1.OutgoingGenericMessageEvent, mockHandlerFn);
            const outgoingOKMessageEvent = new outgoing_ok_message_event_1.OutgoingOKMessageEvent({
                okMessage: ['OK', 'EVENT_ID', true, 'EXPLANATION'],
            });
            outgoingOKMessageEvent.preventDefault();
            memorelayClient.emitEvent(outgoingOKMessageEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
