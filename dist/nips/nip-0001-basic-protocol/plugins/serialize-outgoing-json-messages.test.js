"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for serializeOutgoingJsonMessages().
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
const serialize_outgoing_json_messages_1 = require("./serialize-outgoing-json-messages");
const outgoing_generic_message_event_1 = require("../events/outgoing-generic-message-event");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const web_socket_send_event_1 = require("../../../core/events/web-socket-send-event");
const buffer_to_generic_message_1 = require("../lib/buffer-to-generic-message");
describe('serializeOutgoingJsonMessages()', () => {
    describe('#OutgoingGenericMessageEvent', () => {
        it('should serialize a generic message', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(serialize_outgoing_json_messages_1.serializeOutgoingJsonMessages);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(web_socket_send_event_1.WebSocketSendEvent, mockHandlerFn);
            const outgoingGenericMessage = new outgoing_generic_message_event_1.OutgoingGenericMessageEvent({
                genericMessage: ['OUTGOING', 'MESSAGE'],
            });
            memorelayClient.emitEvent(outgoingGenericMessage);
            expect(outgoingGenericMessage.defaultPrevented).toBe(true);
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const [webSocketSendEvent] = mockHandlerFn.mock.calls[0];
            expect(webSocketSendEvent).toBeInstanceOf(web_socket_send_event_1.WebSocketSendEvent);
            expect(webSocketSendEvent.parentEvent).toBe(outgoingGenericMessage);
            const { buffer } = webSocketSendEvent.details;
            expect((0, buffer_to_generic_message_1.bufferToGenericMessage)(buffer)).toEqual(outgoingGenericMessage.details.genericMessage);
        }));
        it('should not serialize when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const { memorelayClient } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(serialize_outgoing_json_messages_1.serializeOutgoingJsonMessages);
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(web_socket_send_event_1.WebSocketSendEvent, mockHandlerFn);
            const outgoingGenericMessage = new outgoing_generic_message_event_1.OutgoingGenericMessageEvent({
                genericMessage: ['OUTGOING', 'MESSAGE'],
            });
            outgoingGenericMessage.preventDefault();
            memorelayClient.emitEvent(outgoingGenericMessage);
            expect(outgoingGenericMessage.defaultPrevented).toBe(true);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
