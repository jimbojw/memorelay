/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to encapsulate a BadMessageError.
 */

import {
  ClientEvent,
  ClientEventOptions,
} from '../../../core/events/client-event';
import { BadEventError } from '../errors/bad-event-error';

export const BAD_MESSAGE_ERROR_EVENT_TYPE = 'bad-message-error';

/**
 * @see BadMessageErrorEvent
 */
export interface BadMessageErrorEventDetails {
  /**
   * The payload BadMessageError.
   */
  readonly badMessageError: BadEventError;

  /**
   * The object which caused the error.
   */
  readonly badMessage: unknown;
}

/**
 * Event to encapsulate a BadMessageError thrown by some check function.
 */
export class BadMessageErrorEvent extends ClientEvent<
  typeof BAD_MESSAGE_ERROR_EVENT_TYPE,
  BadMessageErrorEventDetails
> {
  static readonly type: typeof BAD_MESSAGE_ERROR_EVENT_TYPE =
    BAD_MESSAGE_ERROR_EVENT_TYPE;
  constructor(
    details: BadMessageErrorEventDetails,
    options?: ClientEventOptions
  ) {
    super(BAD_MESSAGE_ERROR_EVENT_TYPE, details, options);
  }
}
