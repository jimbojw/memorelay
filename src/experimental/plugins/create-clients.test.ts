/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the createClients() Memorelay core plugin.
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { createClients } from './create-clients';
import { BasicEventEmitter } from '../core/basic-event-emitter';
import { MemorelayClientCreatedEvent } from '../events/memorelay-client-created-event';
import { WebSocketConnectedEvent } from '../events/web-socket-connected-event';
import { DuplicateWebSocketError } from '../errors/duplicate-web-socket-error';

describe('createClients()', () => {
  describe('#WebSocketConnectedEvent', () => {
    it('should trigger MemorelayClientCreatedEvent', async () => {
      const hub = new BasicEventEmitter();

      createClients(hub);

      const mockCreatedHandlerFn = jest.fn<
        unknown,
        [MemorelayClientCreatedEvent]
      >();
      hub.onEvent(MemorelayClientCreatedEvent.type, mockCreatedHandlerFn);

      const mockRequest = {} as IncomingMessage;
      const mockOnFn = jest.fn<unknown, [string, () => void]>();
      const mockWebSocket = { on: mockOnFn } as unknown as WebSocket;

      const webSocketConnectedEvent = new WebSocketConnectedEvent({
        webSocket: mockWebSocket,
        request: mockRequest,
      });
      hub.emitEvent(webSocketConnectedEvent);

      await Promise.resolve();

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
      hub.onEvent(MemorelayClientCreatedEvent.type, mockCreatedHandlerFn);

      const mockRequest = {} as IncomingMessage;
      const mockWebSocket = {} as WebSocket;

      const webSocketConnectedEvent = new WebSocketConnectedEvent({
        webSocket: mockWebSocket,
        request: mockRequest,
      });

      webSocketConnectedEvent.preventDefault();

      hub.emitEvent(webSocketConnectedEvent);

      expect(mockCreatedHandlerFn.mock.calls).toHaveLength(0);
    });

    it('should emit an error when duplicate WebSocket is detected', () => {
      const hub = new BasicEventEmitter();

      createClients(hub);

      const mockOnFn = jest.fn<unknown, [string, () => void]>();
      const mockWebSocket = { on: mockOnFn } as unknown as WebSocket;
      const mockRequest = {} as IncomingMessage;

      hub.emitEvent(
        new WebSocketConnectedEvent({
          webSocket: mockWebSocket,
          request: mockRequest,
        })
      );

      const mockErrorHandlerFn = jest.fn<unknown, [DuplicateWebSocketError]>();
      hub.onError(DuplicateWebSocketError.type, mockErrorHandlerFn);

      expect(mockErrorHandlerFn.mock.calls).toHaveLength(0);

      // Duplicate WebSocket connected event.
      hub.emitEvent(
        new WebSocketConnectedEvent({
          webSocket: mockWebSocket,
          request: mockRequest,
        })
      );

      expect(mockErrorHandlerFn.mock.calls).toHaveLength(1);
      const error = mockErrorHandlerFn.mock.calls[0][0];
      expect(error.webSocket).toBe(mockWebSocket);
    });
  });
});
