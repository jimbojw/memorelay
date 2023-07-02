/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the createClients() Memorelay core plugin.
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { createClients } from './create-clients';
import { BasicEventEmitter } from './events/basic-event-emitter';
import { MemorelayClientCreatedEvent } from './events/memorelay-client-created-event';
import { WebSocketConnectedEvent } from './events/web-socket-connected-event';
import { DuplicateWebSocketError } from './errors/duplicate-web-socket-error';

describe('createClients()', () => {
  it('should be a function', () => {
    expect(typeof createClients).toBe('function');
  });

  it('should listen for WebSocketConnectedEvents', () => {
    const mockOnFn = jest.fn<unknown, [string, () => void]>();
    const mockHub = { on: mockOnFn } as unknown as BasicEventEmitter;

    createClients(mockHub);

    expect(mockOnFn.mock.calls).toHaveLength(1);

    expect(mockOnFn.mock.calls[0][0]).toBe(WebSocketConnectedEvent.type);
    expect(typeof mockOnFn.mock.calls[0][1]).toBe('function');
  });

  describe('#WebSocketConnectedEvent', () => {
    it('should trigger MemorelayClientCreatedEvent', () => {
      const hub = new BasicEventEmitter();

      createClients(hub);

      const mockCreatedHandlerFn = jest.fn<
        unknown,
        [MemorelayClientCreatedEvent]
      >();
      hub.on(MemorelayClientCreatedEvent.type, mockCreatedHandlerFn);

      const mockRequest = {} as IncomingMessage;
      const mockOnFn = jest.fn<unknown, [string, () => void]>();
      const mockWebSocket = { on: mockOnFn } as unknown as WebSocket;

      const webSocketConnectedEvent = new WebSocketConnectedEvent({
        webSocket: mockWebSocket,
        request: mockRequest,
      });
      hub.emitBasic(webSocketConnectedEvent);

      expect(mockCreatedHandlerFn.mock.calls).toHaveLength(1);

      const [event] = mockCreatedHandlerFn.mock.calls[0];
      expect(event).toBeInstanceOf(MemorelayClientCreatedEvent);

      const { memorelayClient } = event.details;
      expect(memorelayClient.webSocket).toBe(mockWebSocket);
      expect(memorelayClient.request).toBe(mockRequest);

      expect(webSocketConnectedEvent.defaultPrevented).toBe(true);
    });

    it('should do nothing when defaultPrevented', () => {
      const hub = new BasicEventEmitter();

      createClients(hub);

      const mockCreatedHandlerFn = jest.fn<
        unknown,
        [MemorelayClientCreatedEvent]
      >();
      hub.on(MemorelayClientCreatedEvent.type, mockCreatedHandlerFn);

      const mockRequest = {} as IncomingMessage;
      const mockWebSocket = {} as WebSocket;

      const webSocketConnectedEvent = new WebSocketConnectedEvent({
        webSocket: mockWebSocket,
        request: mockRequest,
      });

      webSocketConnectedEvent.preventDefault();

      hub.emitBasic(webSocketConnectedEvent);

      expect(mockCreatedHandlerFn.mock.calls).toHaveLength(0);
    });

    it('should emit an error when duplicate WebSocket is detected', () => {
      const hub = new BasicEventEmitter();

      createClients(hub);

      const mockOnFn = jest.fn<unknown, [string, () => void]>();
      const mockWebSocket = { on: mockOnFn } as unknown as WebSocket;
      const mockRequest = {} as IncomingMessage;

      hub.emitBasic(
        new WebSocketConnectedEvent({
          webSocket: mockWebSocket,
          request: mockRequest,
        })
      );

      const mockErrorHandlerFn = jest.fn<unknown, [DuplicateWebSocketError]>();
      hub.on(DuplicateWebSocketError.type, mockErrorHandlerFn);

      expect(mockErrorHandlerFn.mock.calls).toHaveLength(0);

      // Duplicate WebSocket connected event.
      hub.emitBasic(
        new WebSocketConnectedEvent({
          webSocket: mockWebSocket,
          request: mockRequest,
        })
      );

      expect(mockErrorHandlerFn.mock.calls).toHaveLength(1);
    });
  });
});
