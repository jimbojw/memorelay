/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Events emitted by Memorelay.
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
 * Event emitted by a MemorelayClient when its connected WebSocket emits a
 * 'message' event.
 */
export class MemorelayClientCreatedEvent extends BasicEvent<
  'memorelay-client-created',
  MemorelayClientCreatedEventDetails
> {
  static type = 'memorelay-client-created';
  constructor(details: MemorelayClientCreatedEventDetails) {
    super('memorelay-client-created', details);
  }
}
