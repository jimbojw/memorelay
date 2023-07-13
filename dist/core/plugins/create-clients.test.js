"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the createClients().
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
const create_clients_1 = require("./create-clients");
const memorelay_client_created_event_1 = require("../events/memorelay-client-created-event");
const web_socket_connected_event_1 = require("../events/web-socket-connected-event");
const memorelay_hub_1 = require("../lib/memorelay-hub");
const duplicate_web_socket_error_event_1 = require("../events/duplicate-web-socket-error-event");
describe('createClients()', () => {
    describe('#WebSocketConnectedEvent', () => {
        it('should trigger MemorelayClientCreatedEvent', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = new memorelay_hub_1.MemorelayHub(create_clients_1.createClients).connect();
            const mockCreatedHandlerFn = jest.fn();
            hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, mockCreatedHandlerFn);
            const mockRequest = {};
            const mockOnFn = jest.fn();
            const mockWebSocket = { on: mockOnFn };
            const webSocketConnectedEvent = new web_socket_connected_event_1.WebSocketConnectedEvent({
                webSocket: mockWebSocket,
                request: mockRequest,
            });
            hub.emitEvent(webSocketConnectedEvent);
            yield Promise.resolve();
            expect(mockCreatedHandlerFn.mock.calls).toHaveLength(1);
            const [event] = mockCreatedHandlerFn.mock.calls[0];
            expect(event).toBeInstanceOf(memorelay_client_created_event_1.MemorelayClientCreatedEvent);
            expect(event.parentEvent).toBe(webSocketConnectedEvent);
            expect(event.targetEmitter).toBe(hub);
            const { memorelayClient } = event.details;
            expect(memorelayClient.webSocket).toBe(mockWebSocket);
            expect(memorelayClient.request).toBe(mockRequest);
            expect(webSocketConnectedEvent.defaultPrevented).toBe(true);
        }));
        it('should do nothing when defaultPrevented', () => {
            const hub = new memorelay_hub_1.MemorelayHub(create_clients_1.createClients).connect();
            const mockCreatedHandlerFn = jest.fn();
            hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, mockCreatedHandlerFn);
            const mockRequest = {};
            const mockWebSocket = {};
            const webSocketConnectedEvent = new web_socket_connected_event_1.WebSocketConnectedEvent({
                webSocket: mockWebSocket,
                request: mockRequest,
            });
            webSocketConnectedEvent.preventDefault();
            hub.emitEvent(webSocketConnectedEvent);
            expect(mockCreatedHandlerFn.mock.calls).toHaveLength(0);
        });
        it('should emit an error when duplicate WebSocket is detected', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = new memorelay_hub_1.MemorelayHub(create_clients_1.createClients).connect();
            const mockOnFn = jest.fn();
            const mockWebSocket = { on: mockOnFn };
            const mockRequest = {};
            hub.emitEvent(new web_socket_connected_event_1.WebSocketConnectedEvent({
                webSocket: mockWebSocket,
                request: mockRequest,
            }));
            const mockHandlerFn = jest.fn();
            hub.onEvent(duplicate_web_socket_error_event_1.DuplicateWebSocketErrorEvent, mockHandlerFn);
            // Duplicate WebSocket connected event.
            hub.emitEvent(new web_socket_connected_event_1.WebSocketConnectedEvent({
                webSocket: mockWebSocket,
                request: mockRequest,
            }));
            expect(mockHandlerFn).not.toHaveBeenCalled();
            yield Promise.resolve();
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const duplicateWebSocketErrorEvent = mockHandlerFn.mock.calls[0][0];
            expect(duplicateWebSocketErrorEvent.details.webSocket).toBe(mockWebSocket);
        }));
    });
});
