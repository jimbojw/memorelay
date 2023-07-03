/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for parseIncomingJsonMessages().
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { WebSocketMessageEvent } from '../../events/web-socket-message-event';
import { MemorelayClient } from '../../core/memorelay-client';
import { parseIncomingJsonMessages } from './parse-incoming-json-messages';
import { IncomingGenericMessageEvent } from '../../events/incoming-generic-message-event';
import { BadMessageError } from '../../errors/bad-message-error';

describe('parseIncomingJsonMessages()', () => {
  it('should parse a JSON WebSocket message', () => {
    const hub = new BasicEventEmitter();
    parseIncomingJsonMessages(hub);

    const mockRequest = {} as IncomingMessage;
    const mockWebSocket = {} as WebSocket;
    const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
    hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

    const mockMessageHandler = jest.fn<
      unknown,
      [IncomingGenericMessageEvent]
    >();
    memorelayClient.on(IncomingGenericMessageEvent.type, mockMessageHandler);

    memorelayClient.emitEvent(
      new WebSocketMessageEvent({
        data: Buffer.from('["PAYLOAD","IGNORE"]'),
        isBinary: false,
      })
    );

    expect(mockMessageHandler.mock.calls).toHaveLength(1);
    const incomingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
    expect(incomingGenericMessageEvent).toBeInstanceOf(
      IncomingGenericMessageEvent
    );
    expect(incomingGenericMessageEvent.details.genericMessage).toEqual([
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
    hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

    const mockMessageHandler = jest.fn<
      unknown,
      [IncomingGenericMessageEvent]
    >();
    memorelayClient.on(IncomingGenericMessageEvent.type, mockMessageHandler);

    memorelayClient.emitEvent(
      new WebSocketMessageEvent({
        data: [Buffer.from('["COMBINED",'), Buffer.from('"BUFFER"]')],
        isBinary: false,
      })
    );

    expect(mockMessageHandler.mock.calls).toHaveLength(1);
    const incomingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
    expect(incomingGenericMessageEvent).toBeInstanceOf(
      IncomingGenericMessageEvent
    );
    expect(incomingGenericMessageEvent.details.genericMessage).toEqual([
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
    hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

    const mockMessageHandler = jest.fn<
      unknown,
      [IncomingGenericMessageEvent]
    >();
    memorelayClient.on(IncomingGenericMessageEvent.type, mockMessageHandler);

    const webSocketMessageEvent = new WebSocketMessageEvent({
      data: Buffer.from('["PAYLOAD","IGNORE"]'),
      isBinary: false,
    });
    webSocketMessageEvent.preventDefault();

    memorelayClient.emitEvent(webSocketMessageEvent);

    expect(mockMessageHandler.mock.calls).toHaveLength(0);
  });

  it('should emit an error when WebSocket message cannot be parsed', () => {
    const hub = new BasicEventEmitter();
    parseIncomingJsonMessages(hub);

    const mockRequest = {} as IncomingMessage;
    const mockWebSocket = {} as WebSocket;
    const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
    hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

    const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
    memorelayClient.on(BadMessageError.type, mockErrorHandler);

    memorelayClient.emitEvent(
      new WebSocketMessageEvent({
        data: Buffer.from('UNPARSEABLE_MESSAGE_PAYLOAD'),
        isBinary: false,
      })
    );

    expect(mockErrorHandler.mock.calls).toHaveLength(1);
  });
});
