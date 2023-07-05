/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for broadcastIncomingEventMessages().
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { MemorelayClient } from '../../core/memorelay-client';
import { MemorelayHub } from '../../core/memorelay-hub';
import { BroadcastEventMessageEvent } from '../../events/broadcast-event-message-event';
import { broadcastIncomingEventMessages } from './broadcast-incoming-event-messages';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { IncomingEventMessageEvent } from '../../events/incoming-event-message-event';
import { ClientEventMessage } from '../../../lib/message-types';
import { createSignedTestEvent } from '../../test/signed-test-event';
import { MemorelayClientDisconnectEvent } from '../../events/memorelay-client-disconnect-event';

describe('broadcastIncomingEventMessages()', () => {
  describe('#IncomingEventMessageEvent', () => {
    it('should broadcast incoming EVENT messages up to the hub', async () => {
      const hub = new MemorelayHub(() => []);
      broadcastIncomingEventMessages(hub);

      const mockHandlerFn = jest.fn<unknown, [BroadcastEventMessageEvent]>();
      hub.onEvent(BroadcastEventMessageEvent, mockHandlerFn);

      const mockRequest = {} as IncomingMessage;
      const mockWebSocket = {} as WebSocket;
      const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      const eventMessage: ClientEventMessage = [
        'EVENT',
        createSignedTestEvent({ content: 'testing testing' }),
      ];
      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: eventMessage,
      });
      memorelayClient.emitEvent(incomingEventMessageEvent);

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);
      const broadcastEventMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(broadcastEventMessageEvent).toBeInstanceOf(
        BroadcastEventMessageEvent
      );
      expect(broadcastEventMessageEvent.details.clientEventMessage).toBe(
        eventMessage
      );
      expect(broadcastEventMessageEvent.details.memorelayClient).toBe(
        memorelayClient
      );
      expect(broadcastEventMessageEvent.parentEvent).toBe(
        incomingEventMessageEvent
      );
      expect(broadcastEventMessageEvent.targetEmitter).toBe(hub);
    });
  });

  describe('#MemorelayClientDisconnectEvent', () => {
    it('should trigger disconnect', async () => {
      const hub = new MemorelayHub(() => []);
      broadcastIncomingEventMessages(hub);

      const mockHandlerFn = jest.fn<unknown, [BroadcastEventMessageEvent]>();
      hub.onEvent(BroadcastEventMessageEvent, mockHandlerFn);

      const mockRequest = {} as IncomingMessage;
      const mockWebSocket = {} as WebSocket;
      const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));

      memorelayClient.emitEvent(
        new MemorelayClientDisconnectEvent({ memorelayClient })
      );

      const eventMessage: ClientEventMessage = [
        'EVENT',
        createSignedTestEvent({ content: 'testing testing' }),
      ];
      memorelayClient.emitEvent(
        new IncomingEventMessageEvent({ clientEventMessage: eventMessage })
      );

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
