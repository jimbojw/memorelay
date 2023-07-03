/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility scaffolding to streamline tests.
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { BasicEventEmitter } from '../core/basic-event-emitter';
import { MemorelayClient } from '../core/memorelay-client';
import { MemorelayClientCreatedEvent } from '../events/memorelay-client-created-event';

/**
 * Convenience method for setting up an event emitter hub and a MemorelayClient
 * wrapping a mock WebSocket. This construction is useful for streamlining tests
 * that want to operate on MemorelayClient events.
 * @param setupFn Function to invoke before emitting the client. This is where
 * the code under test will generally be ran.
 * @returns An object with both the created hub and memorelayClient.
 */
export function setupHubAndMemorelayClient(
  setupFn: (hub: BasicEventEmitter) => void
): {
  hub: BasicEventEmitter;
  memorelayClient: MemorelayClient;
} {
  const hub = new BasicEventEmitter();
  setupFn(hub);

  const mockRequest = {} as IncomingMessage;
  const mockWebSocket = {} as WebSocket;
  const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
  hub.emitEvent(new MemorelayClientCreatedEvent({ memorelayClient }));
  return { hub, memorelayClient };
}
