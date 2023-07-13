"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for MemorelayHub.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const memorelay_hub_1 = require("./memorelay-hub");
const http_server_request_event_1 = require("../events/http-server-request-event");
describe('MemorelayHub', () => {
    it('should be a constructor function', () => {
        expect(typeof memorelay_hub_1.MemorelayHub).toBe('function');
        const memorelayHub = new memorelay_hub_1.MemorelayHub();
        expect(memorelayHub instanceof memorelay_hub_1.MemorelayHub).toBe(true);
    });
    describe('handleUpgrade()', () => {
        it('should return a handler function', () => {
            const memorelayHub = new memorelay_hub_1.MemorelayHub();
            const handlerFunction = memorelayHub.handleUpgrade();
            expect(typeof handlerFunction).toBe('function');
        });
    });
    describe('handleRequest()', () => {
        it('should return a handler function', () => {
            const memorelayHub = new memorelay_hub_1.MemorelayHub();
            const handlerFunction = memorelayHub.handleRequest();
            const mockHandlerFn = jest.fn();
            memorelayHub.onEvent(http_server_request_event_1.HttpServerRequestEvent, mockHandlerFn);
            const mockRequest = {};
            const mockResponse = {};
            handlerFunction(mockRequest, mockResponse);
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const httpServerRequestEvent = mockHandlerFn.mock.calls[0][0];
            expect(httpServerRequestEvent).toBeInstanceOf(http_server_request_event_1.HttpServerRequestEvent);
            const { details } = httpServerRequestEvent;
            expect(details.request).toBe(mockRequest);
            expect(details.response).toBe(mockResponse);
        });
        it('should invoke nextFn if provided', () => {
            const memorelayHub = new memorelay_hub_1.MemorelayHub();
            const handlerFunction = memorelayHub.handleRequest();
            const mockHandlerFn = jest.fn();
            memorelayHub.onEvent(http_server_request_event_1.HttpServerRequestEvent, mockHandlerFn);
            const mockNextFn = jest.fn();
            const mockRequest = {};
            const mockResponse = {};
            handlerFunction(mockRequest, mockResponse, mockNextFn);
            expect(mockHandlerFn).toHaveBeenCalledTimes(1);
            const httpServerRequestEvent = mockHandlerFn.mock.calls[0][0];
            expect(httpServerRequestEvent).toBeInstanceOf(http_server_request_event_1.HttpServerRequestEvent);
            const { details } = httpServerRequestEvent;
            expect(details.request).toBe(mockRequest);
            expect(details.response).toBe(mockResponse);
        });
    });
});
