/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal a Nostr EVENT message being broadcasted from
 * one client to others.
 */

import { EventMessage } from '../../lib/message-types';
import { MemorelayClient } from '../core/memorelay-client';
import { BasicEvent } from './basic-event';

export const BROADCAST_EVENT_MESSAGE_EVENT_TYPE = 'broadcast-event-message';

/**
 * @see BroadcastEventMessageEvent
 */
export interface BroadcastEventMessageEventDetails {
  /**
   * The incoming Nostr EVENT message.
   */
  readonly eventMessage: EventMessage;

  /**
   * The originating Memorelay instance.
   */
  readonly memorelayClient: MemorelayClient;
}

/**
 * Event emitted to communicate an EVENT message between connected clients.
 * Generally, the client named in the event details will be different from the
 * emitter of the event.
 */
export class BroadcastEventMessageEvent extends BasicEvent<
  typeof BROADCAST_EVENT_MESSAGE_EVENT_TYPE,
  BroadcastEventMessageEventDetails
> {
  static readonly type: typeof BROADCAST_EVENT_MESSAGE_EVENT_TYPE =
    BROADCAST_EVENT_MESSAGE_EVENT_TYPE;
  constructor(details: BroadcastEventMessageEventDetails) {
    super(BROADCAST_EVENT_MESSAGE_EVENT_TYPE, details);
  }
}