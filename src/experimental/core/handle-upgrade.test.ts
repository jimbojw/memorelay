/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for handleUpgrade().
 */

import { createRequest, MockRequest } from 'node-mocks-http';
import { Socket } from 'net';
import { Request } from 'express';
import { WebSocketServer } from 'ws';

import { BasicEventEmitter } from './basic-event-emitter';
import { handleUpgrade } from './handle-upgrade';
import { BasicEvent } from '../events/basic-event';
import { WebSocketConnectedEvent } from '../events/web-socket-connected-event';

describe('handleUpgrade()', () => {
  it('should return a handler function', () => {
    const mockWebSocketServer = {} as WebSocketServer;
    const mockBasicEventEmitter = {} as BasicEventEmitter;
    const handlerFunction = handleUpgrade(
      mockWebSocketServer,
      mockBasicEventEmitter
    );
    expect(typeof handlerFunction).toBe('function');
  });

  it('should throw if request url is missing', () => {
    const mockWebSocketServer = {} as WebSocketServer;
    const mockBasicEventEmitter = {} as BasicEventEmitter;
    const handlerFunction = handleUpgrade(
      mockWebSocketServer,
      mockBasicEventEmitter
    );

    const request: MockRequest<Request> = createRequest({});

    const socket = {} as Socket;
    const head = Buffer.from('');

    expect(() => {
      handlerFunction(request, socket, head);
    }).toThrow('url');
  });

  it('should attempt to upgrade a socket when paths match', () => {
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

      const mockBasicEventEmitter = {} as BasicEventEmitter;

      const mockHandleUpgradeFn = jest.fn<
        unknown,
        [Request, Socket, Buffer, () => void]
      >();
      const mockWebSocketServer = {
        handleUpgrade: mockHandleUpgradeFn,
      } as unknown as WebSocketServer;

      const handlerFunction = handleUpgrade(
        mockWebSocketServer,
        mockBasicEventEmitter,
        '/foo'
      );

      handlerFunction(request, socket, head);

      expect(mockHandleUpgradeFn.mock.calls).toHaveLength(1);

      const connectedCallbackFn = mockHandleUpgradeFn.mock.calls[0][3];

      const mockEmitBasicFn = jest.fn<BasicEvent, [BasicEvent]>();
      mockBasicEventEmitter.emitEvent = mockEmitBasicFn;

      connectedCallbackFn();

      expect(mockEmitBasicFn.mock.calls).toHaveLength(1);
      expect(mockEmitBasicFn.mock.calls[0][0]).toBeInstanceOf(
        WebSocketConnectedEvent
      );
    });
  });

  it('should not attempt to upgrade a socket when paths differ', () => {
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

      const mockHandleUpgradeFn = jest.fn<
        unknown,
        [Request, Socket, Buffer, () => void]
      >();
      const mockWebSocketServer = {
        handleUpgrade: mockHandleUpgradeFn,
      } as unknown as WebSocketServer;

      const basicEventEmitter = new BasicEventEmitter();
      const handlerFunction = handleUpgrade(
        mockWebSocketServer,
        basicEventEmitter,
        '/foo'
      );

      handlerFunction(request, socket, head);

      expect(mockHandleUpgradeFn.mock.calls).toHaveLength(0);
    });
  });
});
