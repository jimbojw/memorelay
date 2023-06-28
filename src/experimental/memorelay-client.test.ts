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
    it('should attempt to parse raw message', () => {
      const request = {} as Request;
      const webSocket = new EventEmitter() as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request);

      const mockProcessFn = jest.fn();
      memorelayClient.processRawMessage = mockProcessFn;

      const data = Buffer.from('MESSAGE_DATA');
      webSocket.emit('message', data, false);

      expect(mockProcessFn.mock.calls).toHaveLength(1);

      const params = (mockProcessFn.mock.calls as [Buffer, boolean][])[0];

      expect(params[0]).toBe(data);
      expect(params[1]).toBe(false);
    });
  });
});
