/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event signaling immanent disconnect of remaining listeners.
 */

import { MemorelayClient } from '../core/memorelay-client';
import { BasicEvent } from './basic-event';

export const MEMORELAY_CLIENT_DISCONNECT_EVENT_TYPE =
  'memorelay-client-disconnect';

/**
 * @see MemorelayClientDisconnectEvent
 */
export interface MemorelayClientDisconnectEventDetails {
  /**
   * The MemorelayClient that's being disconnected.
   */
  readonly memorelayClient: MemorelayClient;
}

/**
 * Event signaling the immanent disconnect of a MemorelayClient. The default
 * behavior will be to remove all listeners on itself and its assigned
 * WebSocket.
 */
export class MemorelayClientDisconnectEvent extends BasicEvent<
  typeof MEMORELAY_CLIENT_DISCONNECT_EVENT_TYPE,
  MemorelayClientDisconnectEventDetails
> {
  static readonly type: typeof MEMORELAY_CLIENT_DISCONNECT_EVENT_TYPE =
    MEMORELAY_CLIENT_DISCONNECT_EVENT_TYPE;
  constructor(details: MemorelayClientDisconnectEventDetails) {
    super(MEMORELAY_CLIENT_DISCONNECT_EVENT_TYPE, details);
  }
}
