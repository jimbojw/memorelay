"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for MemorelayClient instances.
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
const memorelay_client_1 = require("./memorelay-client");
const events_1 = require("events");
const web_socket_message_event_1 = require("../events/web-socket-message-event");
const web_socket_close_event_1 = require("../events/web-socket-close-event");
const memorelay_client_disconnect_event_1 = require("../events/memorelay-client-disconnect-event");
const web_socket_send_event_1 = require("../events/web-socket-send-event");
describe('MemorelayClient', () => {
    describe('webSocket#message', () => {
        it('should emit a WebSocketMessageEvent', () => {
            const request = {};
            const webSocket = new events_1.EventEmitter();
            const memorelayClient = new memorelay_client_1.MemorelayClient(webSocket, request).connect();
            const mockEmitBasicFn = jest.fn();
            memorelayClient.emitEvent = mockEmitBasicFn;
            const data = Buffer.from('MESSAGE_DATA');
            webSocket.emit('message', data, false);
            expect(mockEmitBasicFn.mock.calls).toHaveLength(1);
            expect(mockEmitBasicFn.mock.calls[0][0]).toBeInstanceOf(web_socket_message_event_1.WebSocketMessageEvent);
        });
    });
    describe('webSocket#close', () => {
        it('should emit a WebSocketCloseEvent', () => {
            const request = {};
            const webSocket = new events_1.EventEmitter();
            const memorelayClient = new memorelay_client_1.MemorelayClient(webSocket, request).connect();
            const mockEmitBasicFn = jest.fn();
            memorelayClient.emitEvent = mockEmitBasicFn;
            // @see https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
            const NORMAL_CLOSURE_CODE = 1000;
            webSocket.emit('close', NORMAL_CLOSURE_CODE);
            expect(mockEmitBasicFn.mock.calls).toHaveLength(1);
            const webSocketCloseEvent = mockEmitBasicFn.mock.calls[0][0];
            expect(webSocketCloseEvent).toBeInstanceOf(web_socket_close_event_1.WebSocketCloseEvent);
            expect(webSocketCloseEvent.details.code).toBe(NORMAL_CLOSURE_CODE);
            expect(webSocketCloseEvent.targetEmitter).toBe(memorelayClient);
        });
    });
    describe('#WebSocketSendEvent', () => {
        it('should send the attached buffer', () => {
            const mockSendFn = jest.fn();
            const mockWebSocket = new events_1.EventEmitter();
            mockWebSocket.send = mockSendFn;
            const mockRequest = {};
            const memorelayClient = new memorelay_client_1.MemorelayClient(mockWebSocket, mockRequest);
            memorelayClient.connect();
            const buffer = Buffer.from('GREETINGS');
            const webSocketSendEvent = new web_socket_send_event_1.WebSocketSendEvent({ buffer });
            memorelayClient.emitEvent(webSocketSendEvent);
            expect(mockSendFn).toHaveBeenCalledTimes(1);
            expect(mockSendFn.mock.calls[0][0]).toBe(buffer);
        });
        it('should not send when defaultPrevented', () => {
            const mockSendFn = jest.fn();
            const mockWebSocket = new events_1.EventEmitter();
            mockWebSocket.send = mockSendFn;
            const mockRequest = {};
            const memorelayClient = new memorelay_client_1.MemorelayClient(mockWebSocket, mockRequest);
            memorelayClient.connect();
            const buffer = Buffer.from('GREETINGS');
            const webSocketSendEvent = new web_socket_send_event_1.WebSocketSendEvent({ buffer });
            webSocketSendEvent.preventDefault();
            memorelayClient.emitEvent(webSocketSendEvent);
            expect(mockSendFn).not.toHaveBeenCalled();
        });
    });
    describe('#WebSocketCloseEvent', () => {
        it('should emit a MemorelayClientDisconnectEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = {};
            const webSocket = new events_1.EventEmitter();
            const memorelayClient = new memorelay_client_1.MemorelayClient(webSocket, request).connect();
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent, mockHandlerFn);
            const webSocketCloseEvent = new web_socket_close_event_1.WebSocketCloseEvent({ code: 1000 });
            memorelayClient.emitEvent(webSocketCloseEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const memorelayClientDisconnectEvent = mockHandlerFn.mock.calls[0][0];
            expect(memorelayClientDisconnectEvent.parentEvent).toBe(webSocketCloseEvent);
            expect(memorelayClientDisconnectEvent.targetEmitter).toBe(memorelayClient);
        }));
        it('should do nothing when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = {};
            const webSocket = new events_1.EventEmitter();
            const memorelayClient = new memorelay_client_1.MemorelayClient(webSocket, request).connect();
            const mockHandlerFn = jest.fn();
            memorelayClient.onEvent(memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent, mockHandlerFn);
            const webSocketCloseEvent = new web_socket_close_event_1.WebSocketCloseEvent({ code: 1000 });
            webSocketCloseEvent.preventDefault();
            memorelayClient.emitEvent(webSocketCloseEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(0);
        }));
    });
    describe('#MemorelayClientDisconnectEvent', () => {
        it('should trigger disconnect()', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = {};
            const webSocket = new events_1.EventEmitter();
            const memorelayClient = new memorelay_client_1.MemorelayClient(webSocket, request).connect();
            const mockDisconnectFn = jest.fn();
            memorelayClient.disconnect = mockDisconnectFn;
            memorelayClient.emitEvent(new memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent({ memorelayClient }));
            yield Promise.resolve();
            expect(mockDisconnectFn).toHaveBeenCalledTimes(1);
        }));
        it('should do nothing when defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = {};
            const webSocket = new events_1.EventEmitter();
            const memorelayClient = new memorelay_client_1.MemorelayClient(webSocket, request).connect();
            const mockDisconnectFn = jest.fn();
            memorelayClient.disconnect = mockDisconnectFn;
            const memorelayClientDisconnectEvent = new memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent({ memorelayClient });
            memorelayClientDisconnectEvent.preventDefault();
            memorelayClient.emitEvent(memorelayClientDisconnectEvent);
            yield Promise.resolve();
            expect(mockDisconnectFn).toHaveBeenCalledTimes(0);
        }));
    });
});
