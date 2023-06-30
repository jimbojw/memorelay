/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event emitted by Memorelay when it creates a MemorelayClient.
 */

import { MemorelayClient } from '../memorelay-client';
import { BasicEvent } from './basic-event';

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
export class MemorelayClientCreatedEvent extends BasicEvent<
  'memorelay-client-created',
  MemorelayClientCreatedEventDetails
> {
  static readonly type = 'memorelay-client-created';
  constructor(details: MemorelayClientCreatedEventDetails) {
    super('memorelay-client-created', details);
  }
}
