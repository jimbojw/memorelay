"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for parseIncomingJsonMessages().
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
const memorelay_client_created_event_1 = require("../../../core/events/memorelay-client-created-event");
const web_socket_message_event_1 = require("../../../core/events/web-socket-message-event");
const memorelay_client_1 = require("../../../core/lib/memorelay-client");
const parse_incoming_json_messages_1 = require("./parse-incoming-json-messages");
const incoming_generic_message_event_1 = require("../events/incoming-generic-message-event");
const bad_message_error_event_1 = require("../events/bad-message-error-event");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
describe('parseIncomingJsonMessages()', () => {
    describe('#WebSocketMessageEvent', () => {
        it('should parse a JSON WebSocket message', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(parse_incoming_json_messages_1.parseIncomingJsonMessages);
            const mockRequest = {};
            const mockWebSocket = {};
            const memorelayClient = new memorelay_client_1.MemorelayClient(mockWebSocket, mockRequest);
            hub.emitEvent(new memorelay_client_created_event_1.MemorelayClientCreatedEvent({ memorelayClient }));
            const mockMessageHandler = jest.fn();
            memorelayClient.onEvent(incoming_generic_message_event_1.IncomingGenericMessageEvent, mockMessageHandler);
            const webSocketMessageEvent = new web_socket_message_event_1.WebSocketMessageEvent({
                data: Buffer.from('["PAYLOAD","IGNORE"]'),
                isBinary: false,
            });
            memorelayClient.emitEvent(webSocketMessageEvent);
            expect(mockMessageHandler).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockMessageHandler).toHaveBeenCalledTimes(1);
            const incomingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
            expect(incomingGenericMessageEvent).toBeInstanceOf(incoming_generic_message_event_1.IncomingGenericMessageEvent);
            expect(incomingGenericMessageEvent.details.genericMessage).toEqual([
                'PAYLOAD',
                'IGNORE',
            ]);
            expect(incomingGenericMessageEvent.parentEvent).toBe(webSocketMessageEvent);
            expect(incomingGenericMessageEvent.targetEmitter).toBe(memorelayClient);
        }));
        it('should combine WebSocket message buffers', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(parse_incoming_json_messages_1.parseIncomingJsonMessages);
            const mockRequest = {};
            const mockWebSocket = {};
            const memorelayClient = new memorelay_client_1.MemorelayClient(mockWebSocket, mockRequest);
            hub.emitEvent(new memorelay_client_created_event_1.MemorelayClientCreatedEvent({ memorelayClient }));
            const mockMessageHandler = jest.fn();
            memorelayClient.onEvent(incoming_generic_message_event_1.IncomingGenericMessageEvent, mockMessageHandler);
            memorelayClient.emitEvent(new web_socket_message_event_1.WebSocketMessageEvent({
                data: [Buffer.from('["COMBINED",'), Buffer.from('"BUFFER"]')],
                isBinary: false,
            }));
            expect(mockMessageHandler).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockMessageHandler).toHaveBeenCalledTimes(1);
            const incomingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
            expect(incomingGenericMessageEvent).toBeInstanceOf(incoming_generic_message_event_1.IncomingGenericMessageEvent);
            expect(incomingGenericMessageEvent.details.genericMessage).toEqual([
                'COMBINED',
                'BUFFER',
            ]);
        }));
        it('should ignore a WebSocket message when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(parse_incoming_json_messages_1.parseIncomingJsonMessages);
            const mockRequest = {};
            const mockWebSocket = {};
            const memorelayClient = new memorelay_client_1.MemorelayClient(mockWebSocket, mockRequest);
            hub.emitEvent(new memorelay_client_created_event_1.MemorelayClientCreatedEvent({ memorelayClient }));
            const mockMessageHandler = jest.fn();
            memorelayClient.onEvent(incoming_generic_message_event_1.IncomingGenericMessageEvent, mockMessageHandler);
            const webSocketMessageEvent = new web_socket_message_event_1.WebSocketMessageEvent({
                data: Buffer.from('["PAYLOAD","IGNORE"]'),
                isBinary: false,
            });
            webSocketMessageEvent.preventDefault();
            memorelayClient.emitEvent(webSocketMessageEvent);
            yield Promise.resolve();
            expect(mockMessageHandler).not.toHaveBeenCalled();
        }));
        it('should emit an error when WebSocket message cannot be parsed', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(parse_incoming_json_messages_1.parseIncomingJsonMessages);
            const mockRequest = {};
            const mockWebSocket = {};
            const memorelayClient = new memorelay_client_1.MemorelayClient(mockWebSocket, mockRequest);
            hub.emitEvent(new memorelay_client_created_event_1.MemorelayClientCreatedEvent({ memorelayClient }));
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(bad_message_error_event_1.BadMessageErrorEvent, mockHandlerFn);
            memorelayClient.emitEvent(new web_socket_message_event_1.WebSocketMessageEvent({
                data: Buffer.from('UNPARSEABLE_MESSAGE_PAYLOAD'),
                isBinary: false,
            }));
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
        }));
    });
});
