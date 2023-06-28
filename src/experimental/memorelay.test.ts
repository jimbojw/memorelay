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
import { Request, Response } from 'express';

import { Memorelay } from './memorelay';

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
  });
});
