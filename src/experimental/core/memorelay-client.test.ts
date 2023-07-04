/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for MemorelayClient instances.
 */

import { WebSocket } from 'ws';
import { HANDLERS, MemorelayClient } from './memorelay-client';
import { Request } from 'express';
import { EventEmitter } from 'events';
import { WebSocketMessageEvent } from '../events/web-socket-message-event';
import { WebSocketCloseEvent } from '../events/web-socket-close-event';
import { MemorelayClientDisconnectEvent } from '../events/memorelay-client-disconnect-event';

describe('MemorelayClient', () => {
  describe('connect()', () => {
    it('should connect handlers', () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request);
      const handlers = memorelayClient[HANDLERS];

      expect(handlers).toHaveLength(0);
      expect(webSocket.eventNames()).toHaveLength(0);
      expect(memorelayClient.internalEmitter.eventNames()).toHaveLength(0);

      memorelayClient.connect();

      expect(handlers.length).toBeGreaterThan(0);
      expect(webSocket.eventNames().length).toBeGreaterThan(0);
      expect(
        memorelayClient.internalEmitter.eventNames().length
      ).toBeGreaterThan(0);
    });

    it('should only connect once', () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request);
      const handlers = memorelayClient[HANDLERS];

      memorelayClient.connect();

      const handlersLength = handlers.length;
      const webSocketEventNamesLength = webSocket.eventNames().length;
      const internalEventNamesLength =
        memorelayClient.internalEmitter.eventNames().length;

      memorelayClient.connect();

      expect(handlers).toHaveLength(handlersLength);
      expect(webSocket.eventNames()).toHaveLength(webSocketEventNamesLength);
      expect(memorelayClient.internalEmitter.eventNames()).toHaveLength(
        internalEventNamesLength
      );
    });
  });

  describe('disconnect()', () => {
    it('should do nothing if not connected', () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request);
      const handlers = memorelayClient[HANDLERS];

      memorelayClient.disconnect();

      expect(handlers).toHaveLength(0);
      expect(webSocket.eventNames()).toHaveLength(0);
      expect(memorelayClient.internalEmitter.eventNames()).toHaveLength(0);
    });

    it('should remove handlers after connecting', () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request);
      const handlers = memorelayClient[HANDLERS];

      memorelayClient.connect();

      memorelayClient.disconnect();

      expect(handlers).toHaveLength(0);
      expect(webSocket.eventNames()).toHaveLength(0);
      expect(memorelayClient.internalEmitter.eventNames()).toHaveLength(0);
    });
  });

  describe('webSocket#message', () => {
    it('should emit a WebSocketMessageEvent', () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request).connect();

      const mockEmitBasicFn = jest.fn<
        WebSocketMessageEvent,
        [WebSocketMessageEvent]
      >();
      memorelayClient.emitEvent = mockEmitBasicFn;

      const data = Buffer.from('MESSAGE_DATA');
      webSocket.emit('message', data, false);

      expect(mockEmitBasicFn.mock.calls).toHaveLength(1);

      expect(mockEmitBasicFn.mock.calls[0][0]).toBeInstanceOf(
        WebSocketMessageEvent
      );
    });
  });

  describe('webSocket#close', () => {
    it('should emit a WebSocketCloseEvent', () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request).connect();

      const mockEmitBasicFn = jest.fn<
        WebSocketCloseEvent,
        [WebSocketCloseEvent]
      >();
      memorelayClient.emitEvent = mockEmitBasicFn;

      // @see https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
      const NORMAL_CLOSURE_CODE = 1000;
      webSocket.emit('close', NORMAL_CLOSURE_CODE);

      expect(mockEmitBasicFn.mock.calls).toHaveLength(1);

      expect(mockEmitBasicFn.mock.calls[0][0]).toBeInstanceOf(
        WebSocketCloseEvent
      );
      expect(mockEmitBasicFn.mock.calls[0][0].details.code).toBe(
        NORMAL_CLOSURE_CODE
      );
    });
  });

  describe('#WebSocketCloseEvent', () => {
    it('should emit a MemorelayClientDisconnectEvent', async () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request).connect();

      const mockHandlerFn = jest.fn<
        unknown,
        [MemorelayClientDisconnectEvent]
      >();
      memorelayClient.onEvent(MemorelayClientDisconnectEvent, mockHandlerFn);

      memorelayClient.emitEvent(new WebSocketCloseEvent({ code: 1000 }));

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when defaultPrevented', async () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request).connect();

      const mockHandlerFn = jest.fn<
        unknown,
        [MemorelayClientDisconnectEvent]
      >();
      memorelayClient.onEvent(MemorelayClientDisconnectEvent, mockHandlerFn);

      const webSocketCloseEvent = new WebSocketCloseEvent({ code: 1000 });
      webSocketCloseEvent.preventDefault();
      memorelayClient.emitEvent(webSocketCloseEvent);

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(0);
    });
  });

  describe('#MemorelayClientDisconnectEvent', () => {
    it('should trigger disconnect()', async () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request).connect();

      const mockDisconnectFn = jest.fn<MemorelayClient, []>();
      memorelayClient.disconnect = mockDisconnectFn;

      memorelayClient.emitEvent(
        new MemorelayClientDisconnectEvent({ memorelayClient })
      );

      await Promise.resolve();

      expect(mockDisconnectFn).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when defaultPrevented', async () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request).connect();

      const mockDisconnectFn = jest.fn<MemorelayClient, []>();
      memorelayClient.disconnect = mockDisconnectFn;

      const memorelayClientDisconnectEvent = new MemorelayClientDisconnectEvent(
        { memorelayClient }
      );

      memorelayClientDisconnectEvent.preventDefault();
      memorelayClient.emitEvent(memorelayClientDisconnectEvent);

      await Promise.resolve();

      expect(mockDisconnectFn).toHaveBeenCalledTimes(0);
    });
  });
});
