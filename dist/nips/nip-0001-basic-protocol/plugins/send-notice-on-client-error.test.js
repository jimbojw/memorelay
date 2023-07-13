"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendNoticeOnClientError().
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
const outgoing_notice_message_event_1 = require("../events/outgoing-notice-message-event");
const send_notice_on_client_error_1 = require("./send-notice-on-client-error");
describe('sendNoticeOnClientError()', () => {
    describe('#BadMessageError', () => {
        it('should emit an outgoing NOTICE message', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(send_notice_on_client_error_1.sendNoticeOnClientError);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_notice_message_event_1.OutgoingNoticeMessageEvent, mockHandlerFn);
            memorelayClient.emitEvent(new bad_message_error_event_1.BadMessageErrorEvent({
                badMessageError: new bad_message_error_1.BadMessageError('EXAMPLE'),
                badMessage: 'EXAMPLE',
            }));
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const outgoingNoticeMessageEvent = mockHandlerFn.mock.calls[0][0];
            expect(outgoingNoticeMessageEvent.details.relayNoticeMessage).toEqual([
                'NOTICE',
                'ERROR: bad msg: EXAMPLE',
            ]);
        }));
        it('should not emit when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(send_notice_on_client_error_1.sendNoticeOnClientError);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_notice_message_event_1.OutgoingNoticeMessageEvent, mockHandlerFn);
            const badMessageErrorEvent = new bad_message_error_event_1.BadMessageErrorEvent({
                badMessageError: new bad_message_error_1.BadMessageError('EXAMPLE'),
                badMessage: 'EXAMPLE',
            });
            badMessageErrorEvent.preventDefault();
            memorelayClient.emitEvent(badMessageErrorEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
