/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview EXPERIMENTAL - Brainstorming API usage.
 */

import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { WebSocketMessageEvent } from '../../events/web-socket-message-event';
import { Memorelay } from '../../memorelay';

/**
 * Example plugin showing how one could implement throttling. This is not meant
 * to be a good example. Just exploring what the API might look like.
 *
 * An actual throttling implementation would probably look quite different.
 */
export function simpleThrottlePlugin(memorelay: Memorelay) {
  memorelay.on(
    MemorelayClientCreatedEvent.type,
    ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
      // Simple, scope-based throttling.
      let lastMessageTs = 0;

      memorelayClient.on(
        WebSocketMessageEvent.type,
        (event: WebSocketMessageEvent) => {
          // Compute how long it has been since the last message.
          const now = Date.now();
          const timeBetweenMs = now - lastMessageTs;
          lastMessageTs = now;

          // If it has been less than a second since the last message, drop it.
          if (timeBetweenMs < 1000) {
            // Implication: preventDefault() stops the normal processing of this
            // raw WebSocket message. But it does not stop other 'raw-message'
            // event handlers from firing.
            event.preventDefault();
          }
        }
      );
    }
  );
}
