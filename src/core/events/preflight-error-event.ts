/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Preflight event emitted before an error.
 */

import { BasicError } from '../errors/basic-error';
import { BasicEvent, BasicEventOptions } from './basic-event';

export const PREFLIGHT_ERROR_EVENT_TYPE = 'preflight-error-event';

/**
 * @see PreflightErrorEvent
 */
export interface PreflightErrorEventDetails<
  ErrorType extends BasicError = BasicError
> {
  /**
   * Error that's about to be emitted.
   */
  readonly error: ErrorType;
}

/**
 * Just before a error will be emitted, a BasicEventEmitter will emit a
 * preflight error event containing that error in its details. This allows for
 * meta-event programming, such as logging, to become aware of previously
 * unknown error types.
 */
export class PreflightErrorEvent<
  ErrorType extends BasicError = BasicError
> extends BasicEvent<
  typeof PREFLIGHT_ERROR_EVENT_TYPE,
  PreflightErrorEventDetails<ErrorType>
> {
  static readonly type: typeof PREFLIGHT_ERROR_EVENT_TYPE =
    PREFLIGHT_ERROR_EVENT_TYPE;
  constructor(
    details: PreflightErrorEventDetails<ErrorType>,
    options?: BasicEventOptions
  ) {
    super(PREFLIGHT_ERROR_EVENT_TYPE, details, options);
  }
}
