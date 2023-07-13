/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for MemorelayHub.
 */

import { IncomingMessage, ServerResponse } from 'http';

import { MemorelayHub } from './memorelay-hub';
import { HttpServerRequestEvent } from '../events/http-server-request-event';

describe('MemorelayHub', () => {
  it('should be a constructor function', () => {
    expect(typeof MemorelayHub).toBe('function');
    const memorelayHub = new MemorelayHub();
    expect(memorelayHub instanceof MemorelayHub).toBe(true);
  });

  describe('handleUpgrade()', () => {
    it('should return a handler function', () => {
      const memorelayHub = new MemorelayHub();
      const handlerFunction = memorelayHub.handleUpgrade();
      expect(typeof handlerFunction).toBe('function');
    });
  });

  describe('handleRequest()', () => {
    it('should return a handler function', () => {
      const memorelayHub = new MemorelayHub();
      const handlerFunction = memorelayHub.handleRequest();

      const mockHandlerFn = jest.fn<unknown, [HttpServerRequestEvent]>();
      memorelayHub.onEvent(HttpServerRequestEvent, mockHandlerFn);

      const mockRequest = {} as IncomingMessage;
      const mockResponse = {} as ServerResponse;
      handlerFunction(mockRequest, mockResponse);

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const httpServerRequestEvent = mockHandlerFn.mock.calls[0][0];
      expect(httpServerRequestEvent).toBeInstanceOf(HttpServerRequestEvent);

      const { details } = httpServerRequestEvent;
      expect(details.request).toBe(mockRequest);
      expect(details.response).toBe(mockResponse);
    });

    it('should invoke nextFn if provided', () => {
      const memorelayHub = new MemorelayHub();
      const handlerFunction = memorelayHub.handleRequest();

      const mockHandlerFn = jest.fn<unknown, [HttpServerRequestEvent]>();
      memorelayHub.onEvent(HttpServerRequestEvent, mockHandlerFn);

      const mockNextFn = jest.fn<unknown, []>();

      const mockRequest = {} as IncomingMessage;
      const mockResponse = {} as ServerResponse;
      handlerFunction(mockRequest, mockResponse, mockNextFn);

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const httpServerRequestEvent = mockHandlerFn.mock.calls[0][0];
      expect(httpServerRequestEvent).toBeInstanceOf(HttpServerRequestEvent);

      const { details } = httpServerRequestEvent;
      expect(details.request).toBe(mockRequest);
      expect(details.response).toBe(mockResponse);
    });
  });
});
