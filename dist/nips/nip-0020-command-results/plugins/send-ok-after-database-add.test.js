"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendOKAfterDatabaseAdd().
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
const did_add_event_to_database_event_1 = require("../../nip-0001-basic-protocol/events/did-add-event-to-database-event");
const outgoing_ok_message_event_1 = require("../events/outgoing-ok-message-event");
const send_ok_after_database_add_1 = require("./send-ok-after-database-add");
describe('sendOKAfterDatabaseAdd()', () => {
    describe('#DidAddEventToDatabaseEvent', () => {
        it('should send an outgoing OK message event', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
            (0, send_ok_after_database_add_1.sendOKAfterDatabaseAdd)(memorelayClient);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, mockHandlerFn);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const didAddEventToDatabaseEvent = new did_add_event_to_database_event_1.DidAddEventToDatabaseEvent({
                event: testEvent,
            });
            memorelayClient.emitEvent(didAddEventToDatabaseEvent);
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const outgoingOKMessageEvent = mockHandlerFn.mock.calls[0][0];
            expect(outgoingOKMessageEvent).toBeInstanceOf(outgoing_ok_message_event_1.OutgoingOKMessageEvent);
            expect(outgoingOKMessageEvent.parentEvent).toBe(didAddEventToDatabaseEvent);
        }));
        it('should not send when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)();
            (0, send_ok_after_database_add_1.sendOKAfterDatabaseAdd)(memorelayClient);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(outgoing_ok_message_event_1.OutgoingOKMessageEvent, mockHandlerFn);
            const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST' });
            const didAddEventToDatabaseEvent = new did_add_event_to_database_event_1.DidAddEventToDatabaseEvent({
                event: testEvent,
            });
            didAddEventToDatabaseEvent.preventDefault();
            memorelayClient.emitEvent(didAddEventToDatabaseEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
