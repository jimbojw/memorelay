/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for increasing the maximum allowable
 * number of listeners on clients.
 */

import { MemorelayClientCreatedEvent } from '../events/memorelay-client-created-event';
import { PluginFn } from '../types/plugin-types';
import { MemorelayHub } from '../lib/memorelay-hub';
import { MemorelayClientDisconnectEvent } from '../events/memorelay-client-disconnect-event';

/**
 * Memorelay core plugin for increasing the maximum number of allowed listeners
 * on connected clients.
 */
export function increaseClientMaxEventListeners(
  increaseCount: number
): PluginFn {
  if (!Number.isInteger(increaseCount) || increaseCount < 1) {
    throw new RangeError('increase count must be a positive integer');
  }

  return (hub: MemorelayHub) => {
    return hub.onEvent(
      MemorelayClientCreatedEvent,
      (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
        if (memorelayClientCreatedEvent.defaultPrevented) {
          return; // Preempted by another listener.
        }

        const { memorelayClient } = memorelayClientCreatedEvent.details;
        memorelayClient.maxEventListeners += increaseCount;
        const handler = memorelayClient.onEvent(
          MemorelayClientDisconnectEvent,
          (memorelayClientDisconnectEvent: MemorelayClientDisconnectEvent) => {
            if (memorelayClientDisconnectEvent.defaultPrevented) {
              return; // Preempted by another listener.
            }

            handler.disconnect();
            memorelayClient.maxEventListeners -= increaseCount;
          }
        );
      }
    );
  };
}
