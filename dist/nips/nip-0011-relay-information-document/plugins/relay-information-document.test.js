"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for relayInformationDocument().
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_mocks_http_1 = require("node-mocks-http");
const http_server_request_event_1 = require("../../../core/events/http-server-request-event");
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const relay_information_document_event_1 = require("../events/relay-information-document-event");
const relay_information_document_1 = require("./relay-information-document");
describe('relayInformationDocument()', () => {
    describe('#HttpServerRequestEvent', () => {
        describe('Accept: application/nostr+json', () => {
            describe('Method: GET', () => {
                it('should return relay information document', () => __awaiter(void 0, void 0, void 0, function* () {
                    const hub = (0, setup_test_hub_and_client_1.setupTestHub)(relay_information_document_1.relayInformationDocument);
                    const mockRequest = (0, node_mocks_http_1.createRequest)({
                        method: 'GET',
                        headers: { accept: 'application/nostr+json' },
                    });
                    const mockResponse = (0, node_mocks_http_1.createResponse)();
                    hub.emitEvent(new http_server_request_event_1.HttpServerRequestEvent({
                        request: mockRequest,
                        response: mockResponse,
                    }));
                    yield Promise.resolve();
                    expect(mockResponse.statusCode).toBe(200);
                    const responseText = mockResponse._getData();
                    const doc = JSON.parse(responseText);
                    expect(doc.supported_nips).toContain(1);
                    expect(doc.supported_nips).toContain(11);
                }));
                it('should incorporate other plugin changes to document', () => __awaiter(void 0, void 0, void 0, function* () {
                    const hub = (0, setup_test_hub_and_client_1.setupTestHub)(relay_information_document_1.relayInformationDocument);
                    hub.onEvent(relay_information_document_event_1.RelayInformationDocumentEvent, ({ details: { relayInformationDocument: doc }, }) => {
                        var _a;
                        // Pretend to add support for event deletion.
                        (_a = doc.supported_nips) === null || _a === void 0 ? void 0 : _a.push(9);
                    });
                    const mockRequest = (0, node_mocks_http_1.createRequest)({
                        method: 'GET',
                        headers: { accept: 'application/nostr+json' },
                    });
                    const mockResponse = (0, node_mocks_http_1.createResponse)();
                    hub.emitEvent(new http_server_request_event_1.HttpServerRequestEvent({
                        request: mockRequest,
                        response: mockResponse,
                    }));
                    yield Promise.resolve();
                    expect(mockResponse.statusCode).toBe(200);
                    const responseText = mockResponse._getData();
                    const doc = JSON.parse(responseText);
                    expect(doc.supported_nips).toContain(1);
                    expect(doc.supported_nips).toContain(9);
                    expect(doc.supported_nips).toContain(11);
                }));
            });
            describe('Method: GET|HEAD|OPTIONS', () => {
                it('should respond with Access-Control-Allow-* headers', () => {
                    const hub = (0, setup_test_hub_and_client_1.setupTestHub)(relay_information_document_1.relayInformationDocument);
                    for (const includeAccessControlRequestHeaders of [true, false]) {
                        for (const method of [
                            'GET',
                            'HEAD',
                            'OPTIONS',
                        ]) {
                            const headers = { accept: 'application/nostr+json' };
                            if (includeAccessControlRequestHeaders) {
                                headers['access-control-request-headers'] =
                                    'Accept, Content-Type';
                            }
                            const mockRequest = (0, node_mocks_http_1.createRequest)({
                                method,
                                headers,
                            });
                            const mockResponse = (0, node_mocks_http_1.createResponse)();
                            const httpServerRequestEvent = new http_server_request_event_1.HttpServerRequestEvent({
                                request: mockRequest,
                                response: mockResponse,
                            });
                            hub.emitEvent(httpServerRequestEvent);
                            expect(httpServerRequestEvent.defaultPrevented).toBe(true);
                            expect(mockResponse.statusCode).toBe(200);
                            const accessControlAllowMethods = mockResponse.getHeader('Access-Control-Allow-Methods');
                            expect(accessControlAllowMethods).toContain('GET');
                            expect(accessControlAllowMethods).toContain('HEAD');
                            expect(accessControlAllowMethods).toContain('OPTIONS');
                            expect(mockResponse.getHeader('Access-Control-Allow-Origin')).toBe('*');
                            if (includeAccessControlRequestHeaders) {
                                expect(mockResponse.getHeader('Access-Control-Allow-Headers')).toBe('*');
                            }
                        }
                    }
                });
            });
            describe('Method: undefined', () => {
                it('should respond with 400 Bad Request', () => __awaiter(void 0, void 0, void 0, function* () {
                    const hub = (0, setup_test_hub_and_client_1.setupTestHub)(relay_information_document_1.relayInformationDocument);
                    const mockHandlerFn = jest.fn();
                    hub.onEvent(relay_information_document_event_1.RelayInformationDocumentEvent, mockHandlerFn);
                    const mockRequest = (0, node_mocks_http_1.createRequest)({
                        headers: { accept: 'application/nostr+json' },
                    });
                    // Force the request method to be undefined. Technically, Node's http
                    // library permits the possibility, even though in practice it should
                    // be impossible.
                    mockRequest.method = undefined;
                    const mockResponse = (0, node_mocks_http_1.createResponse)();
                    const httpServerRequestEvent = new http_server_request_event_1.HttpServerRequestEvent({
                        request: mockRequest,
                        response: mockResponse,
                    });
                    hub.emitEvent(httpServerRequestEvent);
                    expect(httpServerRequestEvent.defaultPrevented).toBe(true);
                    expect(mockResponse.statusCode).toBe(400);
                    yield Promise.resolve();
                    expect(mockHandlerFn).not.toHaveBeenCalled();
                }));
            });
            describe('Method: <other>', () => {
                it('should respond with 501 Not Implemented', () => __awaiter(void 0, void 0, void 0, function* () {
                    const hub = (0, setup_test_hub_and_client_1.setupTestHub)(relay_information_document_1.relayInformationDocument);
                    const mockHandlerFn = jest.fn();
                    hub.onEvent(relay_information_document_event_1.RelayInformationDocumentEvent, mockHandlerFn);
                    for (const method of ['DELETE', 'POST', 'PUT']) {
                        const mockRequest = (0, node_mocks_http_1.createRequest)({
                            method,
                            headers: { accept: 'application/nostr+json' },
                        });
                        const mockResponse = (0, node_mocks_http_1.createResponse)();
                        const httpServerRequestEvent = new http_server_request_event_1.HttpServerRequestEvent({
                            request: mockRequest,
                            response: mockResponse,
                        });
                        hub.emitEvent(httpServerRequestEvent);
                        expect(httpServerRequestEvent.defaultPrevented).toBe(true);
                        expect(mockResponse.statusCode).toBe(501);
                        yield Promise.resolve();
                        expect(mockHandlerFn).not.toHaveBeenCalled();
                    }
                }));
            });
        });
        it('should do nothing if defaultPrevented', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(relay_information_document_1.relayInformationDocument);
            const mockHandlerFn = jest.fn();
            hub.onEvent(relay_information_document_event_1.RelayInformationDocumentEvent, mockHandlerFn);
            const mockRequest = (0, node_mocks_http_1.createRequest)({
                method: 'GET',
                headers: { accept: 'application/nostr+json' },
            });
            const httpServerRequestEvent = new http_server_request_event_1.HttpServerRequestEvent({
                request: mockRequest,
                response: (0, node_mocks_http_1.createResponse)(),
            });
            httpServerRequestEvent.preventDefault();
            hub.emitEvent(httpServerRequestEvent);
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
        it('should ignore unrelated requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const hub = (0, setup_test_hub_and_client_1.setupTestHub)(relay_information_document_1.relayInformationDocument);
            const mockHandlerFn = jest.fn();
            hub.onEvent(relay_information_document_event_1.RelayInformationDocumentEvent, mockHandlerFn);
            const mockRequest = (0, node_mocks_http_1.createRequest)({
                method: 'GET',
                headers: { accept: 'application/json' }, // NOT application/nostr+json.
            });
            hub.emitEvent(new http_server_request_event_1.HttpServerRequestEvent({
                request: mockRequest,
                response: (0, node_mocks_http_1.createResponse)(),
            }));
            yield Promise.resolve();
            expect(mockHandlerFn).not.toHaveBeenCalled();
        }));
    });
});
