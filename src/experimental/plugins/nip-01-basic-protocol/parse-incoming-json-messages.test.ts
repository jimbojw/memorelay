/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for parseIncomingJsonMessages().
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { BasicEventEmitter } from '../../events/basic-event-emitter';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { WebSocketMessageEvent } from '../../events/web-socket-message-event';
import { MemorelayClient } from '../../memorelay-client';
import { parseIncomingJsonMessages } from './parse-incoming-json-messages';
import { IncomingMessageEvent } from '../../events/incoming-message-event';
import { BadMessageError } from '../../../lib/bad-message-error';

describe('parseIncomingJsonMessages()', () => {
  it('should be a function', () => {
    expect(typeof parseIncomingJsonMessages).toBe('function');
  });

  it('should listen for client connections', () => {
    const mockOnFn = jest.fn<unknown, [string, () => void]>();
    const mockHub = { on: mockOnFn } as unknown as BasicEventEmitter;
    parseIncomingJsonMessages(mockHub);
    expect(mockOnFn.mock.calls).toHaveLength(1);
    const [type, callback] = mockOnFn.mock.calls[0];
    expect(type).toBe(MemorelayClientCreatedEvent.type);
    expect(typeof callback).toBe('function');
  });

  it('should listen for WebSocket messages', () => {
    const hub = new BasicEventEmitter();
    parseIncomingJsonMessages(hub);

    const mockOnFn = jest.fn<unknown, [string, () => void]>();
    const mockClient = { on: mockOnFn } as unknown as MemorelayClient;
    hub.emitBasic(
      new MemorelayClientCreatedEvent({ memorelayClient: mockClient })
    );

    expect(mockOnFn.mock.calls).toHaveLength(1);
    const [type, callback] = mockOnFn.mock.calls[0];
    expect(type).toBe(WebSocketMessageEvent.type);
    expect(typeof callback).toBe('function');
  });

  it('should parse a JSON WebSocket message', () => {
    const hub = new BasicEventEmitter();
    parseIncomingJsonMessages(hub);

    const mockRequest = {} as IncomingMessage;
    const mockWebSocket = {} as WebSocket;
    const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
    hub.emitBasic(new MemorelayClientCreatedEvent({ memorelayClient }));

    const mockMessageHandler = jest.fn<unknown, [IncomingMessageEvent]>();
    memorelayClient.on(IncomingMessageEvent.type, mockMessageHandler);

    memorelayClient.emitBasic(
      new WebSocketMessageEvent({
        data: Buffer.from('["PAYLOAD","IGNORE"]'),
        isBinary: false,
      })
    );

    expect(mockMessageHandler.mock.calls).toHaveLength(1);
    const incomingMessageEvent = mockMessageHandler.mock.calls[0][0];
    expect(incomingMessageEvent).toBeInstanceOf(IncomingMessageEvent);
    expect(incomingMessageEvent.details.incomingMessage).toEqual([
      'PAYLOAD',
      'IGNORE',
    ]);
  });

  it('should combine WebSocket message buffers', () => {
    const hub = new BasicEventEmitter();
    parseIncomingJsonMessages(hub);

    const mockRequest = {} as IncomingMessage;
    const mockWebSocket = {} as WebSocket;
    const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
    hub.emitBasic(new MemorelayClientCreatedEvent({ memorelayClient }));

    const mockMessageHandler = jest.fn<unknown, [IncomingMessageEvent]>();
    memorelayClient.on(IncomingMessageEvent.type, mockMessageHandler);

    memorelayClient.emitBasic(
      new WebSocketMessageEvent({
        data: [Buffer.from('["COMBINED",'), Buffer.from('"BUFFER"]')],
        isBinary: false,
      })
    );

    expect(mockMessageHandler.mock.calls).toHaveLength(1);
    const incomingMessageEvent = mockMessageHandler.mock.calls[0][0];
    expect(incomingMessageEvent).toBeInstanceOf(IncomingMessageEvent);
    expect(incomingMessageEvent.details.incomingMessage).toEqual([
      'COMBINED',
      'BUFFER',
    ]);
  });

  it('should ignore a WebSocket message when defaultPrevented', () => {
    const hub = new BasicEventEmitter();
    parseIncomingJsonMessages(hub);

    const mockRequest = {} as IncomingMessage;
    const mockWebSocket = {} as WebSocket;
    const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
    hub.emitBasic(new MemorelayClientCreatedEvent({ memorelayClient }));

    const mockMessageHandler = jest.fn<unknown, [IncomingMessageEvent]>();
    memorelayClient.on(IncomingMessageEvent.type, mockMessageHandler);

    const webSocketMessageEvent = new WebSocketMessageEvent({
      data: Buffer.from('["PAYLOAD","IGNORE"]'),
      isBinary: false,
    });
    webSocketMessageEvent.preventDefault();

    memorelayClient.emitBasic(webSocketMessageEvent);

    expect(mockMessageHandler.mock.calls).toHaveLength(0);
  });

  it('should emit an error when WebSocket message cannot be parsed', () => {
    const hub = new BasicEventEmitter();
    parseIncomingJsonMessages(hub);

    const mockRequest = {} as IncomingMessage;
    const mockWebSocket = {} as WebSocket;
    const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
    hub.emitBasic(new MemorelayClientCreatedEvent({ memorelayClient }));

    const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
    memorelayClient.on(BadMessageError.type, mockErrorHandler);

    memorelayClient.emitBasic(
      new WebSocketMessageEvent({
        data: Buffer.from('UNPARSEABLE_MESSAGE_PAYLOAD'),
        isBinary: false,
      })
    );

    expect(mockErrorHandler.mock.calls).toHaveLength(1);
  });
});
