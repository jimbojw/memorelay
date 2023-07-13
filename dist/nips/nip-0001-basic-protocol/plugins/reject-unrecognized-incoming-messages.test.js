"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for rejectUnrecognizedIncomingMessages().
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
const reject_unrecognized_incoming_messages_1 = require("./reject-unrecognized-incoming-messages");
const incoming_generic_message_event_1 = require("../events/incoming-generic-message-event");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const bad_message_error_event_1 = require("../events/bad-message-error-event");
describe('rejectUnrecognizedIncomingMessages()', () => {
    describe('#IncomingGenericMessageEvent', () => {
        it('should ignore events with defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(reject_unrecognized_incoming_messages_1.rejectUnrecognizedIncomingMessages);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(bad_message_error_event_1.BadMessageErrorEvent, mockHandlerFn);
            const incomingGenericMessageEvent = new incoming_generic_message_event_1.IncomingGenericMessageEvent({
                genericMessage: ['BAD_MESSAGE'],
            });
            incomingGenericMessageEvent.preventDefault();
            memorelayClient.emitEvent(incomingGenericMessageEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
        it('should emit an error when message type is unrecognized', () => __awaiter(void 0, void 0, void 0, function* () {
            const testMessageTypes = [
                'AUTH',
                'EVENT',
                'CLOSE',
                'NOTICE',
                'REQ',
                'UNKNOWN',
            ];
            for (const messageType of testMessageTypes) {
                const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(reject_unrecognized_incoming_messages_1.rejectUnrecognizedIncomingMessages);
                const mockHandlerFn = jest.fn();
                memorelayClient.onEvent(bad_message_error_event_1.BadMessageErrorEvent, mockHandlerFn);
                const incomingGenericMessageEvent = new incoming_generic_message_event_1.IncomingGenericMessageEvent({
                    genericMessage: [messageType],
                });
                memorelayClient.emitEvent(incomingGenericMessageEvent);
                expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);
                expect(mockHandlerFn).not.toHaveBeenCalled();
                yield Promise.resolve();
                expect(mockHandlerFn.mock.calls).toHaveLength(1);
                const badMessageError = mockHandlerFn.mock.calls[0][0];
                expect(badMessageError).toBeInstanceOf(bad_message_error_event_1.BadMessageErrorEvent);
            }
        }));
    });
});
