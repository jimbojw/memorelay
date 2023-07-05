/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for MemorelayClient instances.
 */

import { WebSocket } from 'ws';
import { MemorelayClient } from './memorelay-client';
import { Request } from 'express';
import { EventEmitter } from 'events';
import { WebSocketMessageEvent } from '../events/web-socket-message-event';
import { WebSocketCloseEvent } from '../events/web-socket-close-event';
import { MemorelayClientDisconnectEvent } from '../events/memorelay-client-disconnect-event';

describe('MemorelayClient', () => {
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
      const webSocketCloseEvent = mockEmitBasicFn.mock.calls[0][0];
      expect(webSocketCloseEvent).toBeInstanceOf(WebSocketCloseEvent);
      expect(webSocketCloseEvent.details.code).toBe(NORMAL_CLOSURE_CODE);
      expect(webSocketCloseEvent.targetEmitter).toBe(memorelayClient);
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

      const webSocketCloseEvent = new WebSocketCloseEvent({ code: 1000 });
      memorelayClient.emitEvent(webSocketCloseEvent);

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);
      const memorelayClientDisconnectEvent = mockHandlerFn.mock.calls[0][0];
      expect(memorelayClientDisconnectEvent.parentEvent).toBe(
        webSocketCloseEvent
      );
      expect(memorelayClientDisconnectEvent.targetEmitter).toBe(
        memorelayClient
      );
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
