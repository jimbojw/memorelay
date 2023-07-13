"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingReqMessages().
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
const validate_incoming_req_messages_1 = require("./validate-incoming-req-messages");
const incoming_generic_message_event_1 = require("../events/incoming-generic-message-event");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const incoming_req_message_event_1 = require("../events/incoming-req-message-event");
const bad_message_error_event_1 = require("../events/bad-message-error-event");
describe('validateIncomingReqMessages()', () => {
    describe('#IncomingGenericMessageEvent', () => {
        it('should validate and re-emit a REQ message', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(validate_incoming_req_messages_1.validateIncomingReqMessages);
            const mockMessageHandler = jest.fn();
            memorelayClient.onEvent(incoming_req_message_event_1.IncomingReqMessageEvent, mockMessageHandler);
            const incomingGenericMessageEvent = new incoming_generic_message_event_1.IncomingGenericMessageEvent({
                genericMessage: ['REQ', 'SUBSCRIPTION_ID'],
            });
            memorelayClient.emitEvent(incomingGenericMessageEvent);
            expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);
            expect(mockMessageHandler).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockMessageHandler).toHaveBeenCalledTimes(1);
            const incomingReqMessageEvent = mockMessageHandler.mock.calls[0][0];
            expect(incomingReqMessageEvent).toBeInstanceOf(incoming_req_message_event_1.IncomingReqMessageEvent);
            expect(incomingReqMessageEvent.details.reqMessage).toEqual([
                'REQ',
                'SUBSCRIPTION_ID',
            ]);
            expect(incomingReqMessageEvent.parentEvent).toBe(incomingGenericMessageEvent);
            expect(incomingReqMessageEvent.targetEmitter).toBe(memorelayClient);
        }));
        it('should ignore a REQ message if defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(validate_incoming_req_messages_1.validateIncomingReqMessages);
            const mockMessageHandler = jest.fn();
            memorelayClient.onEvent(incoming_req_message_event_1.IncomingReqMessageEvent, mockMessageHandler);
            const incomingGenericMessageEvent = new incoming_generic_message_event_1.IncomingGenericMessageEvent({
                genericMessage: ['REQ', 'IGNORE_ME'],
            });
            incomingGenericMessageEvent.preventDefault();
            memorelayClient.emitEvent(incomingGenericMessageEvent);
            yield Promise.resolve();
            expect(mockMessageHandler).not.toHaveBeenCalled();
        }));
        it('should ignore non-REQ messages', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(validate_incoming_req_messages_1.validateIncomingReqMessages);
            const mockMessageHandler = jest.fn();
            memorelayClient.onEvent(incoming_req_message_event_1.IncomingReqMessageEvent, mockMessageHandler);
            const incomingGenericMessageEvent = new incoming_generic_message_event_1.IncomingGenericMessageEvent({
                genericMessage: ['UNKNOWN', 12345],
            });
            memorelayClient.emitEvent(incomingGenericMessageEvent);
            expect(incomingGenericMessageEvent.defaultPrevented).toBe(false);
            yield Promise.resolve();
            expect(mockMessageHandler).not.toHaveBeenCalled();
        }));
        it('should emit an error when REQ message is malformed', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(validate_incoming_req_messages_1.validateIncomingReqMessages);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(bad_message_error_event_1.BadMessageErrorEvent, mockHandlerFn);
            const incomingGenericMessageEvent = new incoming_generic_message_event_1.IncomingGenericMessageEvent({
                genericMessage: ['REQ'], // Omit required subscription id.
            });
            memorelayClient.emitEvent(incomingGenericMessageEvent);
            expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const badMessageError = mockHandlerFn.mock.calls[0][0];
            expect(badMessageError).toBeInstanceOf(bad_message_error_event_1.BadMessageErrorEvent);
        }));
    });
});
