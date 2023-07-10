/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for relayInformationDocument().
 */

import {
  Headers,
  RequestMethod,
  createRequest,
  createResponse,
} from 'node-mocks-http';

import { HttpServerRequestEvent } from '../../../core/events/http-server-request-event';
import { setupTestHub } from '../../../test/setup-test-hub-and-client';
import { RelayInformationDocumentEvent } from '../events/relay-information-document-event';
import { relayInformationDocument } from './relay-information-document';
import { RelayInformationDocument } from '../types/relay-information-document';

describe('relayInformationDocument()', () => {
  describe('#HttpServerRequestEvent', () => {
    describe('Accept: application/nostr+json', () => {
      describe('Method: GET', () => {
        it('should return relay information document', async () => {
          const hub = setupTestHub(relayInformationDocument);

          const mockRequest = createRequest({
            method: 'GET',
            headers: { accept: 'application/nostr+json' },
          });

          const mockResponse = createResponse();

          hub.emitEvent(
            new HttpServerRequestEvent({
              request: mockRequest,
              response: mockResponse,
            })
          );

          await Promise.resolve();

          expect(mockResponse.statusCode).toBe(200);
          const responseText = mockResponse._getData() as string;
          const doc = JSON.parse(responseText) as RelayInformationDocument;
          expect(doc.supported_nips).toContain(1);
          expect(doc.supported_nips).toContain(11);
        });

        it('should incorporate other plugin changes to document', async () => {
          const hub = setupTestHub(relayInformationDocument);

          hub.onEvent(
            RelayInformationDocumentEvent,
            ({
              details: { relayInformationDocument: doc },
            }: RelayInformationDocumentEvent) => {
              // Pretend to add support for event deletion.
              doc.supported_nips?.push(9);
            }
          );

          const mockRequest = createRequest({
            method: 'GET',
            headers: { accept: 'application/nostr+json' },
          });

          const mockResponse = createResponse();

          hub.emitEvent(
            new HttpServerRequestEvent({
              request: mockRequest,
              response: mockResponse,
            })
          );

          await Promise.resolve();

          expect(mockResponse.statusCode).toBe(200);
          const responseText = mockResponse._getData() as string;
          const doc = JSON.parse(responseText) as RelayInformationDocument;
          expect(doc.supported_nips).toContain(1);
          expect(doc.supported_nips).toContain(9);
          expect(doc.supported_nips).toContain(11);
        });
      });

      describe('Method: GET|HEAD|OPTIONS', () => {
        it('should respond with Access-Control-Allow-* headers', () => {
          const hub = setupTestHub(relayInformationDocument);

          for (const includeAccessControlRequestHeaders of [true, false]) {
            for (const method of [
              'GET',
              'HEAD',
              'OPTIONS',
            ] as RequestMethod[]) {
              const headers: Headers = { accept: 'application/nostr+json' };

              if (includeAccessControlRequestHeaders) {
                headers['access-control-request-headers'] =
                  'Accept, Content-Type';
              }

              const mockRequest = createRequest({
                method,
                headers,
              });

              const mockResponse = createResponse();

              const httpServerRequestEvent = new HttpServerRequestEvent({
                request: mockRequest,
                response: mockResponse,
              });
              hub.emitEvent(httpServerRequestEvent);

              expect(httpServerRequestEvent.defaultPrevented).toBe(true);

              expect(mockResponse.statusCode).toBe(200);

              const accessControlAllowMethods = mockResponse.getHeader(
                'Access-Control-Allow-Methods'
              );
              expect(accessControlAllowMethods).toContain('GET');
              expect(accessControlAllowMethods).toContain('HEAD');
              expect(accessControlAllowMethods).toContain('OPTIONS');

              expect(
                mockResponse.getHeader('Access-Control-Allow-Origin')
              ).toBe('*');

              if (includeAccessControlRequestHeaders) {
                expect(
                  mockResponse.getHeader('Access-Control-Allow-Headers')
                ).toBe('*');
              }
            }
          }
        });
      });

      describe('Method: undefined', () => {
        it('should respond with 400 Bad Request', async () => {
          const hub = setupTestHub(relayInformationDocument);

          const mockHandlerFn = jest.fn<
            unknown,
            [RelayInformationDocumentEvent]
          >();
          hub.onEvent(RelayInformationDocumentEvent, mockHandlerFn);

          const mockRequest = createRequest({
            headers: { accept: 'application/nostr+json' },
          });

          // Force the request method to be undefined. Technically, Node's http
          // library permits the possibility, even though in practice it should
          // be impossible.
          mockRequest.method = undefined as unknown as RequestMethod;

          const mockResponse = createResponse();

          const httpServerRequestEvent = new HttpServerRequestEvent({
            request: mockRequest,
            response: mockResponse,
          });
          hub.emitEvent(httpServerRequestEvent);

          expect(httpServerRequestEvent.defaultPrevented).toBe(true);
          expect(mockResponse.statusCode).toBe(400);

          await Promise.resolve();

          expect(mockHandlerFn).not.toHaveBeenCalled();
        });
      });

      describe('Method: <other>', () => {
        it('should respond with 501 Not Implemented', async () => {
          const hub = setupTestHub(relayInformationDocument);

          const mockHandlerFn = jest.fn<
            unknown,
            [RelayInformationDocumentEvent]
          >();
          hub.onEvent(RelayInformationDocumentEvent, mockHandlerFn);

          for (const method of ['DELETE', 'POST', 'PUT'] as RequestMethod[]) {
            const mockRequest = createRequest({
              method,
              headers: { accept: 'application/nostr+json' },
            });

            const mockResponse = createResponse();

            const httpServerRequestEvent = new HttpServerRequestEvent({
              request: mockRequest,
              response: mockResponse,
            });
            hub.emitEvent(httpServerRequestEvent);

            expect(httpServerRequestEvent.defaultPrevented).toBe(true);
            expect(mockResponse.statusCode).toBe(501);

            await Promise.resolve();

            expect(mockHandlerFn).not.toHaveBeenCalled();
          }
        });
      });
    });

    it('should do nothing if defaultPrevented', async () => {
      const hub = setupTestHub(relayInformationDocument);

      const mockHandlerFn = jest.fn<unknown, [RelayInformationDocumentEvent]>();
      hub.onEvent(RelayInformationDocumentEvent, mockHandlerFn);

      const mockRequest = createRequest({
        method: 'GET',
        headers: { accept: 'application/nostr+json' },
      });
      const httpServerRequestEvent = new HttpServerRequestEvent({
        request: mockRequest,
        response: createResponse(),
      });
      httpServerRequestEvent.preventDefault();
      hub.emitEvent(httpServerRequestEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });

    it('should ignore unrelated requests', async () => {
      const hub = setupTestHub(relayInformationDocument);

      const mockHandlerFn = jest.fn<unknown, [RelayInformationDocumentEvent]>();
      hub.onEvent(RelayInformationDocumentEvent, mockHandlerFn);

      const mockRequest = createRequest({
        method: 'GET',
        headers: { accept: 'application/json' }, // NOT application/nostr+json.
      });
      hub.emitEvent(
        new HttpServerRequestEvent({
          request: mockRequest,
          response: createResponse(),
        })
      );

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
