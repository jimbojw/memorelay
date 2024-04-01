"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendOKAfterDuplicate().
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
const duplicate_event_message_event_1 = require("../events/duplicate-event-message-event");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
const send_ok_after_duplicate_1 = require("./send-ok-after-duplicate");
describe('sendOKAfterDuplicate()', () => {
    describe('#DuplicateEventMessageEvent', () => {
        it('should send an outgoing OK message event', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(send_ok_after_duplicate_1.sendOKAfterDuplicate);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, mockHandlerFn);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const duplicateEventMessageEvent = new duplicate_event_message_event_1.DuplicateEventMessageEvent({
                event: testEvent,
            });
            memorelayClient.emitEvent(duplicateEventMessageEvent);
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const outgoingOKMessageEvent = mockHandlerFn.mock.calls[0][0];
            expect(outgoingOKMessageEvent).toBeInstanceOf(outgoing_ok_message_event_1.OutgoingOKMessageEvent);
            expect(outgoingOKMessageEvent.parentEvent).toBe(duplicateEventMessageEvent);
            expect(outgoingOKMessageEvent.details.okMessage).toEqual([
                'OK',
                testEvent.id,
                true,
                'duplicate:',
            ]);
        }));
        it('should not send when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(send_ok_after_duplicate_1.sendOKAfterDuplicate);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, mockHandlerFn);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const duplicateEventMessageEvent = new duplicate_event_message_event_1.DuplicateEventMessageEvent({
                event: testEvent,
            });
            duplicateEventMessageEvent.preventDefault();
            memorelayClient.emitEvent(duplicateEventMessageEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
