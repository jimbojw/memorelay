"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for dropDuplicateIncomingEventMessages().
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
const drop_duplicate_incoming_event_messages_1 = require("./drop-duplicate-incoming-event-messages");
const incoming_event_message_event_1 = require("../events/incoming-event-message-event");
const signed_test_event_1 = require("../../../test/signed-test-event");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const duplicate_event_message_event_1 = require("../events/duplicate-event-message-event");
describe('dropDuplicateIncomingEventMessages()', () => {
    describe('#IncomingEventMessageEvent', () => {
        it('should drop duplicate incoming EVENT messages', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(drop_duplicate_incoming_event_messages_1.dropDuplicateIncomingEventMessages);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(duplicate_event_message_event_1.DuplicateEventMessageEvent, mockHandlerFn);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'DUPLICATE ME' });
            const firstIncomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            });
            memorelayClient.emitEvent(firstIncomingEventMessageEvent);
            expect(firstIncomingEventMessageEvent.defaultPrevented).toBe(false);
            yield Promise.resolve();
            // The first time the testEvent is seen by the plugin, it should allow the
            // message to pass through untouched.
            expect(mockHandlerFn).not.toHaveBeenCalled();
            // Duplicate event message.
            const secondIncomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            });
            memorelayClient.emitEvent(secondIncomingEventMessageEvent);
            expect(secondIncomingEventMessageEvent.defaultPrevented).toBe(true);
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const duplicateEventMessageEvent = mockHandlerFn.mock.calls[0][0];
            expect(duplicateEventMessageEvent).toBeInstanceOf(duplicate_event_message_event_1.DuplicateEventMessageEvent);
            expect(duplicateEventMessageEvent.details.event).toBe(testEvent);
            expect(duplicateEventMessageEvent.parentEvent).toBe(secondIncomingEventMessageEvent);
        }));
        it('should ignore incoming EVENT message when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(drop_duplicate_incoming_event_messages_1.dropDuplicateIncomingEventMessages);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(duplicate_event_message_event_1.DuplicateEventMessageEvent, mockHandlerFn);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'DUPLICATE ME' });
            const firstIncomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            });
            firstIncomingEventMessageEvent.preventDefault();
            memorelayClient.emitEvent(firstIncomingEventMessageEvent);
            const secondIncomingEventMessageEvent = new incoming_event_message_event_1.IncomingEventMessageEvent({
                clientEventMessage: ['EVENT', testEvent],
            });
            memorelayClient.emitEvent(secondIncomingEventMessageEvent);
            expect(secondIncomingEventMessageEvent.defaultPrevented).toBe(false);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
