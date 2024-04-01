"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendOKAfterBadEvent().
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
const bad_message_error_1 = require("../errors/bad-message-error");
const bad_message_error_event_1 = require("../events/bad-message-error-event");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
const send_ok_after_bad_event_messages_1 = require("./send-ok-after-bad-event-messages");
describe('sendOKAfterBadEvent()', () => {
    describe('#BadMessageErrorEvent', () => {
        it('should send an outgoing OK message event', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(send_ok_after_bad_event_messages_1.sendOKAfterBadEvent);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, mockHandlerFn);
            const badMessageErrorEvent = new bad_message_error_event_1.BadMessageErrorEvent({
                badMessageError: new bad_message_error_1.BadMessageError('REASON'),
                badMessage: ['EVENT', { id: 'EVENT_ID' }],
            });
            memorelayClient.emitEvent(badMessageErrorEvent);
            expect(badMessageErrorEvent.defaultPrevented).toBe(true);
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const outgoingOKMessageEvent = mockHandlerFn.mock.calls[0][0];
            expect(outgoingOKMessageEvent).toBeInstanceOf(outgoing_ok_message_event_1.OutgoingOKMessageEvent);
            expect(outgoingOKMessageEvent.parentEvent).toBe(badMessageErrorEvent);
            expect(outgoingOKMessageEvent.details.okMessage).toEqual([
                'OK',
                'EVENT_ID',
                false,
                'invalid: bad msg: REASON',
            ]);
        }));
        it('should not send when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(send_ok_after_bad_event_messages_1.sendOKAfterBadEvent);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, mockHandlerFn);
            const badMessageErrorEvent = new bad_message_error_event_1.BadMessageErrorEvent({
                badMessageError: new bad_message_error_1.BadMessageError('REASON'),
                badMessage: ['EVENT', { id: 'EVENT_ID' }],
            });
            badMessageErrorEvent.preventDefault();
            memorelayClient.emitEvent(badMessageErrorEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
        it('should send an outgoing OK even if EVENT lacks id', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(send_ok_after_bad_event_messages_1.sendOKAfterBadEvent);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, mockHandlerFn);
            const badMessageErrorEvent = new bad_message_error_event_1.BadMessageErrorEvent({
                badMessageError: new bad_message_error_1.BadMessageError('REASON'),
                badMessage: ['EVENT', null],
            });
            memorelayClient.emitEvent(badMessageErrorEvent);
            expect(badMessageErrorEvent.defaultPrevented).toBe(true);
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const outgoingOKMessageEvent = mockHandlerFn.mock.calls[0][0];
            expect(outgoingOKMessageEvent).toBeInstanceOf(outgoing_ok_message_event_1.OutgoingOKMessageEvent);
            expect(outgoingOKMessageEvent.parentEvent).toBe(badMessageErrorEvent);
            expect(outgoingOKMessageEvent.details.okMessage).toEqual([
                'OK',
                'undefined',
                false,
                'invalid: bad msg: REASON',
            ]);
        }));
        it('should not send if not an EVENT message', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(send_ok_after_bad_event_messages_1.sendOKAfterBadEvent);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, mockHandlerFn);
            const badMessageErrorEvent = new bad_message_error_event_1.BadMessageErrorEvent({
                badMessageError: new bad_message_error_1.BadMessageError('REASON'),
                badMessage: ['UNKNOWN'],
            });
            memorelayClient.emitEvent(badMessageErrorEvent);
            expect(badMessageErrorEvent.defaultPrevented).toBe(false);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
        it('should not send if payload is not a generic message', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(send_ok_after_bad_event_messages_1.sendOKAfterBadEvent);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, mockHandlerFn);
            const badMessageErrorEvent = new bad_message_error_event_1.BadMessageErrorEvent({
                badMessageError: new bad_message_error_1.BadMessageError('REASON'),
                badMessage: 'NOT_AN_OBJECT',
            });
            memorelayClient.emitEvent(badMessageErrorEvent);
            expect(badMessageErrorEvent.defaultPrevented).toBe(false);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
