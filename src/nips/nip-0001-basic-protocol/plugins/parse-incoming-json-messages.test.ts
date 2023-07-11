/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for parseIncomingJsonMessages().
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { WebSocketMessageEvent } from '../../../core/events/web-socket-message-event';
import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { parseIncomingJsonMessages } from './parse-incoming-json-messages';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { BadMessageError } from '../errors/bad-message-error';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';

describe('parseIncomingJsonMessages()', () => {
  describe('#WebSocketMessageEvent', () => {
    it('should parse a JSON WebSocket message', async () => {
      const hub = new MemorelayHub(() => []);
      parseIncomingJsonMessages(hub);

      const mockRequest = {} as IncomingMessage;
      const mockWebSocket = {} as WebSocket;
      const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingGenericMessageEvent]
      >();
      memorelayClient.onEvent(IncomingGenericMessageEvent, mockMessageHandler);

      const webSocketMessageEvent = new WebSocketMessageEvent({
        data: Buffer.from('["PAYLOAD","IGNORE"]'),
        isBinary: false,
      });
      memorelayClient.emitEvent(webSocketMessageEvent);

      expect(mockMessageHandler).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockMessageHandler).toHaveBeenCalledTimes(1);
      const incomingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
      expect(incomingGenericMessageEvent).toBeInstanceOf(
        IncomingGenericMessageEvent
      );
      expect(incomingGenericMessageEvent.details.genericMessage).toEqual([
        'PAYLOAD',
        'IGNORE',
      ]);
      expect(incomingGenericMessageEvent.parentEvent).toBe(
        webSocketMessageEvent
      );
      expect(incomingGenericMessageEvent.targetEmitter).toBe(memorelayClient);
    });

    it('should combine WebSocket message buffers', async () => {
      const hub = new MemorelayHub(() => []);
      parseIncomingJsonMessages(hub);

      const mockRequest = {} as IncomingMessage;
      const mockWebSocket = {} as WebSocket;
      const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingGenericMessageEvent]
      >();
      memorelayClient.onEvent(IncomingGenericMessageEvent, mockMessageHandler);

      memorelayClient.emitEvent(
        new WebSocketMessageEvent({
          data: [Buffer.from('["COMBINED",'), Buffer.from('"BUFFER"]')],
          isBinary: false,
        })
      );

      expect(mockMessageHandler).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockMessageHandler).toHaveBeenCalledTimes(1);
      const incomingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
      expect(incomingGenericMessageEvent).toBeInstanceOf(
        IncomingGenericMessageEvent
      );
      expect(incomingGenericMessageEvent.details.genericMessage).toEqual([
        'COMBINED',
        'BUFFER',
      ]);
    });

    it('should ignore a WebSocket message when defaultPrevented', async () => {
      const hub = new MemorelayHub(() => []);
      parseIncomingJsonMessages(hub);

      const mockRequest = {} as IncomingMessage;
      const mockWebSocket = {} as WebSocket;
      const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingGenericMessageEvent]
      >();
      memorelayClient.onEvent(IncomingGenericMessageEvent, mockMessageHandler);

      const webSocketMessageEvent = new WebSocketMessageEvent({
        data: Buffer.from('["PAYLOAD","IGNORE"]'),
        isBinary: false,
      });
      webSocketMessageEvent.preventDefault();

      memorelayClient.emitEvent(webSocketMessageEvent);

      await Promise.resolve();

      expect(mockMessageHandler).not.toHaveBeenCalled();
    });

    it('should emit an error when WebSocket message cannot be parsed', async () => {
      const hub = new MemorelayHub(() => []);
      parseIncomingJsonMessages(hub);

      const mockRequest = {} as IncomingMessage;
      const mockWebSocket = {} as WebSocket;
      const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
      memorelayClient.onError(BadMessageError, mockErrorHandler);

      memorelayClient.emitEvent(
        new WebSocketMessageEvent({
          data: Buffer.from('UNPARSEABLE_MESSAGE_PAYLOAD'),
          isBinary: false,
        })
      );

      expect(mockErrorHandler).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockErrorHandler).toHaveBeenCalledTimes(1);
    });
  });
});
