"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for handleUpgrade().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const node_mocks_http_1 = require("node-mocks-http");
const handle_upgrade_1 = require("./handle-upgrade");
const web_socket_connected_event_1 = require("../events/web-socket-connected-event");
const memorelay_hub_1 = require("./memorelay-hub");
describe('handleUpgrade()', () => {
    it('should return a handler function', () => {
        const mockWebSocketServer = {};
        const mockBasicEventEmitter = {};
        const handlerFunction = (0, handle_upgrade_1.handleUpgrade)(mockWebSocketServer, mockBasicEventEmitter);
        expect(typeof handlerFunction).toBe('function');
    });
    it('should throw if request url is missing', () => {
        const mockWebSocketServer = {};
        const mockHub = {};
        const handlerFunction = (0, handle_upgrade_1.handleUpgrade)(mockWebSocketServer, mockHub);
        const request = (0, node_mocks_http_1.createRequest)({});
        const socket = {};
        const head = Buffer.from('');
        expect(() => {
            handlerFunction(request, socket, head);
        }).toThrow('url');
    });
    it('should attempt to upgrade a socket when paths match', () => {
        ['/foo', '/foo/', '/foo?bar=baz', '/foo#hash'].map((url) => {
            const request = (0, node_mocks_http_1.createRequest)({
                method: 'GET',
                url,
                headers: {
                    Connection: 'upgrade',
                    'Sec-Websocket-Key': 'FAKE_WEBSOCKET_KEY',
                    'Sec-Websocket-Version': '13',
                },
            });
            const socket = {};
            const head = Buffer.from('');
            const mockHub = {};
            const mockHandleUpgradeFn = jest.fn();
            const mockWebSocketServer = {
                handleUpgrade: mockHandleUpgradeFn,
            };
            const handlerFunction = (0, handle_upgrade_1.handleUpgrade)(mockWebSocketServer, mockHub, '/foo');
            handlerFunction(request, socket, head);
            expect(mockHandleUpgradeFn.mock.calls).toHaveLength(1);
            const connectedCallbackFn = mockHandleUpgradeFn.mock.calls[0][3];
            const mockEmitBasicFn = jest.fn();
            mockHub.emitEvent = mockEmitBasicFn;
            connectedCallbackFn();
            expect(mockEmitBasicFn.mock.calls).toHaveLength(1);
            expect(mockEmitBasicFn.mock.calls[0][0]).toBeInstanceOf(web_socket_connected_event_1.WebSocketConnectedEvent);
        });
    });
    it('should not attempt to upgrade a socket when paths differ', () => {
        ['/', '/bar', '/foo/bar', '/?/foo', '/xxx#/foo'].map((url) => {
            const request = (0, node_mocks_http_1.createRequest)({
                method: 'GET',
                url,
                headers: {
                    Connection: 'upgrade',
                    'Sec-Websocket-Key': 'FAKE_WEBSOCKET_KEY',
                    'Sec-Websocket-Version': '13',
                },
            });
            const socket = {};
            const head = Buffer.from('');
            const mockHandleUpgradeFn = jest.fn();
            const mockWebSocketServer = {
                handleUpgrade: mockHandleUpgradeFn,
            };
            const hub = new memorelay_hub_1.MemorelayHub();
            const handlerFunction = (0, handle_upgrade_1.handleUpgrade)(mockWebSocketServer, hub, '/foo');
            handlerFunction(request, socket, head);
            expect(mockHandleUpgradeFn.mock.calls).toHaveLength(0);
        });
    });
});
