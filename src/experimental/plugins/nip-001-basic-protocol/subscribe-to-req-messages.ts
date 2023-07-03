/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for subscribing to REQ messages.
 */

import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { MemorelayHub } from '../../core/memorelay-hub';
import { IncomingReqMessageEvent } from '../../events/incoming-req-message-event';

/**
 * Memorelay core plugin for subscribing to REQ messages. Note that this plugin
 * does not handle sending stored events. It only handles the subscriptions for
 * new events.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function subscribeToReqMessages(hub: MemorelayHub) {
  hub.onEvent(MemorelayClientCreatedEvent, handleClientCreated);

  function handleClientCreated(
    memorelayClientCreatedEvent: MemorelayClientCreatedEvent
  ) {
    const { memorelayClient } = memorelayClientCreatedEvent.details;
    memorelayClient.onEvent(IncomingReqMessageEvent, handleReqMessage);

    function handleReqMessage(
      incomingReqMessageEvent: IncomingReqMessageEvent
    ) {
      if (incomingReqMessageEvent.defaultPrevented) {
        return; // Preempted by another handler.
      }

      // TODO(jimbo): Implement plugin.
    }
  }
}
