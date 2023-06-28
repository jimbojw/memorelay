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

  describe('runRawMessageHandlers', () => {
    it('should return false if there are no handlers', async () => {
      const request = {} as Request;
      const webSocket = { on: jest.fn() } as unknown as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request);

      const data = Buffer.from('EXAMPLE_BUFFER');
      const isBinary = false;

      const result = await memorelayClient.runRawMessageHandlers(
        data,
        isBinary
      );

      expect(result).toBe(false);
    });

    it('should should throw if a handler provides no buffer', async () => {
      const request = {} as Request;
      const webSocket = { on: jest.fn() } as unknown as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request);

      memorelayClient.rawMessageHandlers.push((data, isBinary, next) => {
        // Simulate user calling 'done' without providing a buffer.
        (next as (status: string) => void)('done');
      });

      const data = Buffer.from('EXAMPLE_BUFFER');
      const isBinary = false;

      await expect(
        memorelayClient.runRawMessageHandlers(data, isBinary)
      ).rejects.toThrow('buffer');
    });

    it('should return handler-provided buffer', async () => {
      const request = {} as Request;
      const webSocket = { on: jest.fn() } as unknown as WebSocket;
      const memorelayClient = new MemorelayClient(webSocket, request);

      const replacementBuffer = Buffer.from('REPLACEMENT_DATA');
      const replacementIsBinary = true;
      memorelayClient.rawMessageHandlers.push((data, isBinary, next) => {
        next('done', replacementBuffer, replacementIsBinary);
      });

      const data = Buffer.from('EXAMPLE_BUFFER');
      const isBinary = false;

      const result = await memorelayClient.runRawMessageHandlers(
        data,
        isBinary
      );

      expect(result).toEqual({
        buffer: replacementBuffer,
        isBinary: replacementIsBinary,
      });
    });
  });
});
