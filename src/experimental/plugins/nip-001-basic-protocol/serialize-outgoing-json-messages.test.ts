/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for serializeOutgoingJsonMessages().
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { MemorelayClient } from '../../core/memorelay-client';
import { serializeOutgoingJsonMessages } from './serialize-outgoing-json-messages';
import { MemorelayHub } from '../../core/memorelay-hub';
import { OutgoingGenericMessageEvent } from '../../events/outgoing-generic-message-event';

describe('serializeOutgoingJsonMessages()', () => {
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
