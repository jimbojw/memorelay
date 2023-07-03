/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for broadcastIncomingEventMessages().
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { MemorelayHub } from '../../core/memorelay-hub';
import { broadcastIncomingEventMessages } from './broadcast-incoming-event-messages';
import { MemorelayClient } from '../../core/memorelay-client';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { BroadcastEventMessageEvent } from '../../events/broadcast-event-message-event';
import { IncomingEventMessageEvent } from '../../events/incoming-event-message-event';
import { EventMessage } from '../../../lib/message-types';
import { WebSocketCloseEvent } from '../../events/web-socket-close-event';

describe('broadcastIncomingEventMessages()', () => {
  it('should broadcast incoming EVENT messages to other clients', async () => {
    const hub = new BasicEventEmitter() as MemorelayHub;
    broadcastIncomingEventMessages(hub);

    const clientList = new Array(5).fill(0).map(() => {
      return new MemorelayClient({} as WebSocket, {} as IncomingMessage);
    });

    for (const memorelayClient of clientList) {
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));
    }

    const mockBroadcastEventHandler = jest.fn<
      MemorelayClient,
      [BroadcastEventMessageEvent]
    >();
    for (const memorelayClient of clientList) {
      memorelayClient.onEvent(
        BroadcastEventMessageEvent,
        mockBroadcastEventHandler
      );
    }

    // Emit from the third (index=2) client.
    clientList[2].emitEvent(
      new IncomingEventMessageEvent({
        eventMessage: ['EVENT', 'MOCK'] as unknown as EventMessage,
      })
    );

    // Since broadcast messages are done using queueMicrotask(), we need to wait
    // until they've finished emitting.
    await Promise.resolve();

    // Only should receive four broadcast events (index 0, 1, 3 and 4).
    expect(mockBroadcastEventHandler.mock.calls).toHaveLength(4);
  });

  it('should forget client when WebSocket closes', async () => {
    const hub = new BasicEventEmitter() as MemorelayHub;
    broadcastIncomingEventMessages(hub);

    const clientList = new Array(5).fill(0).map(() => {
      return new MemorelayClient({} as WebSocket, {} as IncomingMessage);
    });

    for (const memorelayClient of clientList) {
      hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));
    }

    const mockBroadcastEventHandler = jest.fn<
      MemorelayClient,
      [BroadcastEventMessageEvent]
    >();
    for (const memorelayClient of clientList) {
      memorelayClient.onEvent(
        BroadcastEventMessageEvent,
        mockBroadcastEventHandler
      );
    }

    // Close three of the five clients.
    for (const index of [0, 2, 4]) {
      const memorelayClient = clientList[index];
      memorelayClient.emitEvent(new WebSocketCloseEvent({ code: 1000 }));
    }

    clientList[1].emitEvent(
      new IncomingEventMessageEvent({
        eventMessage: ['EVENT', 'MOCK'] as unknown as EventMessage,
      })
    );

    // Since broadcast messages are done using queueMicrotask(), we need to wait
    // until they've finished emitting.
    await Promise.resolve();

    // Only the fourth client (index=3) should have received the broadcast.
    expect(mockBroadcastEventHandler.mock.calls).toHaveLength(1);
  });
});
