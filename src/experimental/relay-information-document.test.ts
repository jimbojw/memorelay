/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for relayInformationDocument().
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
import { relayInformationDocument } from './relay-information-document';

describe('relayInformationDocument', () => {
  it('should return an Express middleware handler function', () => {
    const memorelay = new Memorelay();
    const handlerFunction = relayInformationDocument(memorelay);
    expect(typeof handlerFunction).toBe('function');
  });

  it('should send the relay document', () => {
    const memorelay = new Memorelay();
    const handlerFunction = relayInformationDocument(memorelay);

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
    expect(response._getData()).toEqual({ supported_nips: [1, 11] });

    const headers = response._getHeaders();

    expect(headers['access-control-allow-methods']).toBeDefined();
    expect(headers['access-control-allow-methods']).toContain('GET');
    expect(headers['access-control-allow-methods']).toContain('HEAD');
    expect(headers['access-control-allow-methods']).toContain('OPTIONS');

    expect(headers['access-control-allow-origin']).toBeDefined();
  });

  it('should respond to preflight requests', () => {
    const memorelay = new Memorelay();
    const handlerFunction = relayInformationDocument(memorelay);

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
    const handlerFunction = relayInformationDocument(memorelay);

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
    const handlerFunction = relayInformationDocument(memorelay);

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
