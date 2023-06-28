/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for main Memorelay entry point.
 */

import {
  createRequest,
  createResponse,
  MockRequest,
  MockResponse,
  RequestMethod,
} from 'node-mocks-http';
import { Socket } from 'net';
import { Request, Response } from 'express';

import { Memorelay, WEBSOCKET_SERVER } from './memorelay';

describe('Memorelay', () => {
  it('should be a constructor function', () => {
    expect(typeof Memorelay).toBe('function');
    const memorelay = new Memorelay();
    expect(memorelay instanceof Memorelay).toBe(true);
  });

  describe('getRelayDocument', () => {
    it('should return a properly formatted relay document', () => {
      const memorelay = new Memorelay();
      const relayDocument = memorelay.getRelayDocument();
      expect(typeof relayDocument).toBe('object');
      expect(Array.isArray(relayDocument.supported_nips)).toBe(true);
      expect(relayDocument.supported_nips?.includes(1)).toBe(true);
      expect(relayDocument.supported_nips?.includes(9)).toBe(true);
      expect(relayDocument.supported_nips?.includes(11)).toBe(true);
      expect(relayDocument.supported_nips?.includes(20)).toBe(true);
    });
  });

  describe('sendRelayDocument', () => {
    it('should return an Express middleware handler function', () => {
      const memorelay = new Memorelay();
      const handlerFunction = memorelay.sendRelayDocument;
      expect(typeof handlerFunction).toBe('function');
    });

    it('should send the relay document', () => {
      const memorelay = new Memorelay();
      const handlerFunction = memorelay.sendRelayDocument;

      const request: MockRequest<Request> = createRequest({
        method: 'GET',
        url: '/',
        headers: { accept: 'application/nostr+json' },
      });
      const response: MockResponse<Response> = createResponse();

      const nextFunction = () => {
        throw new Error('unexpected function call');
      };

      handlerFunction(request, response, nextFunction);

      expect(response.statusCode).toBe(200);
      expect(response._isEndCalled()).toBe(true);
      expect(response._getData()).toEqual(memorelay.getRelayDocument());

      const headers = response._getHeaders();

      expect(headers['access-control-allow-methods']).toBeDefined();
      expect(headers['access-control-allow-methods']).toContain('GET');
      expect(headers['access-control-allow-methods']).toContain('HEAD');
      expect(headers['access-control-allow-methods']).toContain('OPTIONS');

      expect(headers['access-control-allow-origin']).toBeDefined();
    });

    it('should respond to preflight requests', () => {
      const memorelay = new Memorelay();
      const handlerFunction = memorelay.sendRelayDocument;

      const request: MockRequest<Request> = createRequest({
        method: 'OPTIONS',
        url: '/',
        headers: {
          accept: 'application/nostr+json',
          'access-control-request-headers': 'Accept',
        },
      });
      const response: MockResponse<Response> = createResponse();

      const nextFunction = jest.fn();

      handlerFunction(request, response, nextFunction);

      expect(nextFunction.mock.calls).toHaveLength(1);

      expect(response.statusCode).toBe(200);
      expect(response._isEndCalled()).toBe(false);

      const headers = response._getHeaders();

      expect(headers['access-control-allow-headers']).toBeDefined();

      expect(headers['access-control-allow-methods']).toBeDefined();
      expect(headers['access-control-allow-methods']).toContain('GET');
      expect(headers['access-control-allow-methods']).toContain('HEAD');
      expect(headers['access-control-allow-methods']).toContain('OPTIONS');

      expect(headers['access-control-allow-origin']).toBeDefined();
    });

    it('should reject unsupported methods', () => {
      const memorelay = new Memorelay();
      const handlerFunction = memorelay.sendRelayDocument;

      (['PUT', 'POST', 'DELETE'] as RequestMethod[]).map((method) => {
        const request: MockRequest<Request> = createRequest({
          method,
          url: '/',
          headers: { accept: 'application/nostr+json' },
        });
        const response: MockResponse<Response> = createResponse();

        const nextFunction = () => {
          throw new Error('unexpected function call');
        };

        handlerFunction(request, response, nextFunction);

        expect(response.statusCode).toBe(501);
        expect(response._isEndCalled()).toBe(true);
      });
    });

    it('should ignore unrelated requests', () => {
      const memorelay = new Memorelay();
      const handlerFunction = memorelay.sendRelayDocument;

      (['GET', 'HEAD', 'PUT', 'POST', 'DELETE'] as RequestMethod[]).map(
        (method) => {
          const request: MockRequest<Request> = createRequest({
            method,
            url: '/',
            // NOTE: No 'Accept' header specified.
          });
          const response: MockResponse<Response> = createResponse();

          const nextFunction = jest.fn();

          handlerFunction(request, response, nextFunction);

          expect(response._isEndCalled()).toBe(false);
          expect(nextFunction.mock.calls).toHaveLength(1);
        }
      );
    });
  });

  describe('handleUpgrade', () => {
    it('should return a handler function', () => {
      const memorelay = new Memorelay();
      const handlerFunction = memorelay.handleUpgrade();
      expect(typeof handlerFunction).toBe('function');
    });

    it('should throw if request url is missing', () => {
      const memorelay = new Memorelay();
      const handlerFunction = memorelay.handleUpgrade();

      const request: MockRequest<Request> = createRequest({});

      const socket = {} as Socket;
      const head = Buffer.from('');

      expect(() => {
        handlerFunction(request, socket, head);
      }).toThrow('url');
    });

    it('should attempt to upgrade a socket when paths match', () => {
      const memorelay = new Memorelay();
      const handlerFunction = memorelay.handleUpgrade('/foo');

      ['/foo', '/foo/', '/foo?bar=baz', '/foo#hash'].map((url) => {
        const request: MockRequest<Request> = createRequest({
          method: 'GET',
          url,
          headers: {
            Connection: 'upgrade',
            'Sec-Websocket-Key': 'FAKE_WEBSOCKET_KEY',
            'Sec-Websocket-Version': '13',
          },
        });
        const socket = {} as Socket;
        const head = Buffer.from('');

        const mockWSSHandleUpgradeFn = jest.fn();
        memorelay[WEBSOCKET_SERVER].handleUpgrade = mockWSSHandleUpgradeFn;

        handlerFunction(request, socket, head);

        expect(mockWSSHandleUpgradeFn.mock.calls).toHaveLength(1);

        const connectedCallbackFn = (
          mockWSSHandleUpgradeFn.mock.calls as [
            Request,
            Socket,
            Buffer,
            () => void
          ][]
        )[0][3] as () => void;

        const mockEmitFn = jest.fn();
        memorelay[WEBSOCKET_SERVER].emit = mockEmitFn;

        connectedCallbackFn();

        expect(mockEmitFn.mock.calls).toHaveLength(1);
      });
    });

    it('should not attempt to upgrade a socket when paths differ', () => {
      const memorelay = new Memorelay();
      const handlerFunction = memorelay.handleUpgrade('/foo');

      ['/', '/bar', '/foo/bar', '/?/foo', '/xxx#/foo'].map((url) => {
        const request: MockRequest<Request> = createRequest({
          method: 'GET',
          url,
          headers: {
            Connection: 'upgrade',
            'Sec-Websocket-Key': 'FAKE_WEBSOCKET_KEY',
            'Sec-Websocket-Version': '13',
          },
        });
        const socket = {} as Socket;
        const head = Buffer.from('');

        const mockWSSHandleUpgradeFn = jest.fn();
        memorelay[WEBSOCKET_SERVER].handleUpgrade = mockWSSHandleUpgradeFn;

        handlerFunction(request, socket, head);

        expect(mockWSSHandleUpgradeFn.mock.calls).toHaveLength(0);
      });
    });
  });
});
