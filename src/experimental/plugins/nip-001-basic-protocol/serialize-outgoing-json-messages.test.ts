/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for serializeOutgoingJsonMessages().
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { BasicEventEmitter } from '../../../core/lib/basic-event-emitter';
import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { serializeOutgoingJsonMessages } from './serialize-outgoing-json-messages';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { OutgoingGenericMessageEvent } from '../../../nip-0001-basic-protocol/events/outgoing-generic-message-event';
import { MemorelayClientDisconnectEvent } from '../../../core/events/memorelay-client-disconnect-event';

describe('serializeOutgoingJsonMessages()', () => {
  describe('#OutgoingGenericMessageEvent', () => {
    it('should serialize and send a generic message', () => {
      const hub = new BasicEventEmitter();
      serializeOutgoingJsonMessages(hub as MemorelayHub);

      const mockSendFn = jest.fn<unknown, [Buffer]>();
      const mockWebSocket = {} as WebSocket;
      mockWebSocket.send = mockSendFn;
      const mockRequest = {} as IncomingMessage;
      const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      const outgoingGenericMessage = new OutgoingGenericMessageEvent({
        genericMessage: ['OUTGOING', 'MESSAGE'],
      });
      memorelayClient.emitEvent(outgoingGenericMessage);

      expect(outgoingGenericMessage.defaultPrevented).toBe(true);

      expect(mockSendFn.mock.calls).toHaveLength(1);
      const [sentBuffer] = mockSendFn.mock.calls[0];
      expect(sentBuffer.toString('utf-8')).toBe('["OUTGOING","MESSAGE"]');
    });

    it('should ignore outgoing message when defaultPrevented', () => {
      const hub = new BasicEventEmitter();
      serializeOutgoingJsonMessages(hub as MemorelayHub);

      const mockSendFn = jest.fn<unknown, [Buffer]>();
      const mockWebSocket = {} as WebSocket;
      mockWebSocket.send = mockSendFn;
      const mockRequest = {} as IncomingMessage;
      const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      const outgoingGenericMessage = new OutgoingGenericMessageEvent({
        genericMessage: ['PREVENT', 'ME'],
      });

      outgoingGenericMessage.preventDefault(); // Prevent sending.

      memorelayClient.emitEvent(outgoingGenericMessage);

      expect(mockSendFn.mock.calls).toHaveLength(0);
    });
  });

  describe('#MemorelayClientDisconnectEvent', () => {
    it('should trigger disconnect', async () => {
      const hub = new BasicEventEmitter();
      serializeOutgoingJsonMessages(hub as MemorelayHub);

      const mockSendFn = jest.fn<unknown, [Buffer]>();
      const mockWebSocket = {} as WebSocket;
      mockWebSocket.send = mockSendFn;
      const mockRequest = {} as IncomingMessage;
      const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      memorelayClient.emitEvent(
        new MemorelayClientDisconnectEvent({
          memorelayClient,
        })
      );

      memorelayClient.emitEvent(
        new OutgoingGenericMessageEvent({
          genericMessage: ['NEVER', 'RECEIVED'],
        })
      );

      await Promise.resolve();

      expect(mockSendFn.mock.calls).toHaveLength(0);
    });
  });
});
