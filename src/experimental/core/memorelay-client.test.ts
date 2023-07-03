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
import { BasicEvent } from '../events/basic-event';
import { WebSocketCloseEvent } from '../events/web-socket-close-event';

describe('MemorelayClient', () => {
  it('should be a constructor function', () => {
    expect(typeof MemorelayClient).toBe('function');
    const webSocket = { on: jest.fn() } as unknown as WebSocket;
    const request = {} as Request;
    const memorelay = new MemorelayClient(webSocket, request);
    expect(memorelay instanceof MemorelayClient).toBe(true);
    expect(memorelay.webSocket).toBe(webSocket);
    expect(memorelay.request).toBe(request);
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
      memorelayClient.emitBasic = mockEmitBasicFn;

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
      memorelayClient.emitBasic = mockEmitBasicFn;

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
});
