/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay entry point.
 */

import { MemorelayClientCreatedEvent } from './events/memorelay-client-created-event';
import { BasicEventHandler } from './events/basic-event-emitter';
import { MemorelayHub } from './memorelay-hub';
import { createClients } from './create-clients';

/**
 * Memorelay main class. Extends MemorelayHub and attaches default behavior.
 */
export class Memorelay extends MemorelayHub {
  constructor() {
    super();
    createClients(this);
  }
  /**
   * Bound event listeners. Will be connected to their respective targets when
   * connect() is called.
   */
  protected readonly handlers: BasicEventHandler[] = [
    {
      target: this,
      type: MemorelayClientCreatedEvent.type,
      handler: (event: MemorelayClientCreatedEvent) => {
        !event.defaultPrevented && event.details.memorelayClient.connect();
      },
    },
  ];
}
