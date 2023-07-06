/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event emitted by Memorelay when it creates a MemorelayClient.
 */

import { MemorelayClient } from '../../core/lib/memorelay-client';
import { RelayEvent, RelayEventOptions } from './relay-event';

export const MEMORELAY_CLIENT_CREATED_EVENT_TYPE = 'memorelay-client-created';

/**
 * @see MemorelayClientCreatedEvent
 */
export interface MemorelayClientCreatedEventDetails {
  /**
   * The newly created MemorelayClient
   */
  readonly memorelayClient: MemorelayClient;
}

/**
 * Event emitted by Memorelay when it creates a MemorelayClient to wrap a
 * connected WebSocket. This would typically be in response to a previously
 * emitted 'connection' event on the Memorelay instance's WebSocketServer.
 */
export class MemorelayClientCreatedEvent extends RelayEvent<
  typeof MEMORELAY_CLIENT_CREATED_EVENT_TYPE,
  MemorelayClientCreatedEventDetails
> {
  static readonly type: typeof MEMORELAY_CLIENT_CREATED_EVENT_TYPE =
    MEMORELAY_CLIENT_CREATED_EVENT_TYPE;
  constructor(
    details: MemorelayClientCreatedEventDetails,
    options?: RelayEventOptions
  ) {
    super(MEMORELAY_CLIENT_CREATED_EVENT_TYPE, details, options);
  }
}
