/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility scaffolding to streamline tests.
 */

import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { MemorelayClient } from '../../core/lib/memorelay-client';
import { MemorelayClientCreatedEvent } from '../events/memorelay-client-created-event';
import { MemorelayHub } from '../../core/lib/memorelay-hub';

/**
 * Convenience method for setting up an event emitter hub and a MemorelayClient
 * wrapping a mock WebSocket. This construction is useful for streamlining tests
 * that want to operate on MemorelayClient events.
 * @param pluginFns Functions to invoke before emitting the client. This is
 * where the code under test will generally be ran.
 * @returns An object with both the created hub and memorelayClient.
 */
export function setupTestHubAndClient(
  ...pluginFns: ((hub: MemorelayHub) => void)[]
): {
  hub: MemorelayHub;
  memorelayClient: MemorelayClient;
} {
  const hub = setupTestHub(...pluginFns);
  const memorelayClient = setupTestClient(hub);
  return { hub, memorelayClient };
}

/**
 * Test harness to setup a test hub with one or more plugins under test.
 */
export function setupTestHub(
  ...pluginFns: ((hub: MemorelayHub) => void)[]
): MemorelayHub {
  const hub = new MemorelayHub(() => []);
  pluginFns.forEach((pluginFn) => {
    pluginFn(hub);
  });
  return hub;
}

/**
 * Test harness to create a client and emit it through the hub.
 * @param hub Hub through which to emit the new client.
 */
export function setupTestClient(hub: MemorelayHub): MemorelayClient {
  const mockRequest = {} as IncomingMessage;
  const mockWebSocket = {} as WebSocket;
  const memorelayClient = new MemorelayClient(mockWebSocket, mockRequest);
  hub.emitEvent(
    new MemorelayClientCreatedEvent({ memorelayClient }, { targetEmitter: hub })
  );
  return memorelayClient;
}
