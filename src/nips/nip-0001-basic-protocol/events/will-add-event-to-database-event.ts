/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal that an EVENT will be added to the stored
 * events database.
 */

import { Event as NostrEvent } from 'nostr-tools';
import {
  ClientEvent,
  ClientEventOptions,
} from '../../../core/events/client-event';

export const WILL_ADD_EVENT_TO_DATABASE_EVENT_TYPE =
  'will-add-event-to-database';

/**
 * @see WillAddEventToDatabaseEvent
 */
export interface WillAddEventToDatabaseEventDetails {
  /**
   * The EVENT that will be added to the database.
   */
  readonly event: NostrEvent;
}

/**
 * Event emitted when an event is about to be added to the database.
 */
export class WillAddEventToDatabaseEvent extends ClientEvent<
  typeof WILL_ADD_EVENT_TO_DATABASE_EVENT_TYPE,
  WillAddEventToDatabaseEventDetails
> {
  static readonly type: typeof WILL_ADD_EVENT_TO_DATABASE_EVENT_TYPE =
    WILL_ADD_EVENT_TO_DATABASE_EVENT_TYPE;
  constructor(
    details: WillAddEventToDatabaseEventDetails,
    options?: ClientEventOptions
  ) {
    super(WILL_ADD_EVENT_TO_DATABASE_EVENT_TYPE, details, options);
  }
}
