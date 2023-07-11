/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview EventEmitter with an extra capacity for emitting BasicEvents.
 */

import { defaultMaxListeners, EventEmitter } from 'events';
import { BasicEvent } from '../events/basic-event';
import { BasicError } from '../errors/basic-error';
import { Disconnectable } from '../types/disconnectable';
import { onWithHandler } from './on-with-handler';
import { PreflightEvent } from '../events/preflight-event';
import { PreflightErrorEvent } from '../events/preflight-error-event';

export class BasicEventEmitter<
  EventType extends BasicEvent = BasicEvent,
  ErrorType extends BasicError = BasicError
> {
  /**
   * Maximum number of event listeners known to be permitted without warning.
   *
   * NOTE: Node v19 introduced the getMaxListeners() module function to support
   * determining the maxListeners of an emitter. In the future, using that would
   * be better than keeping a copy, as it would be impervious to circumvention.
   */
  private maxEventListenersValue = defaultMaxListeners;

  get maxEventListeners(): number {
    return this.maxEventListenersValue;
  }

  set maxEventListeners(maxEventListeners: number) {
    this.maxEventListenersValue = maxEventListeners;
    this.internalEmitter.setMaxListeners(this.maxEventListeners);
  }

  readonly internalEmitter = new EventEmitter();

  /**
   * Emits the provided BasicEvent then returns it.
   * @param basicEvent The event to emit using its type as eventName.
   * @returns The same provided BasicEvent for chaining.
   */
  emitEvent(basicEvent: EventType): EventType {
    if (!(basicEvent instanceof PreflightEvent)) {
      const preflightEvent = new PreflightEvent({ event: basicEvent });
      this.internalEmitter.emit(preflightEvent.type, preflightEvent);
    }
    this.internalEmitter.emit(basicEvent.type, basicEvent);
    return basicEvent;
  }

  /**
   * Listen for a BasicEvent.
   * @param basicEventType Type of event to listen for.
   * @param callbackFn Callback function to invoke when event is emitted.
   * @returns this.
   */
  onEvent<
    T extends
      | EventType
      | PreflightEvent<EventType>
      | PreflightErrorEvent<ErrorType>
  >(
    basicEventType: { type: string },
    callbackFn: (basicEvent: T) => void
  ): Disconnectable {
    return onWithHandler(this.internalEmitter, basicEventType.type, callbackFn);
  }

  /**
   * Emits the provided object then returns the object.
   * @param error The error object to emit. Must have a type string.
   * @returns The same error object which was passed in.
   */
  emitError(error: ErrorType) {
    const preflightErrorEvent = new PreflightErrorEvent({ error });
    this.internalEmitter.emit(preflightErrorEvent.type, preflightErrorEvent);
    this.internalEmitter.emit(error.type, error);
    return error;
  }

  /**
   * Listen for an Error.
   * @param basicEventType Type of error to listen for.
   * @param callbackFn Callback function to invoke when error is emitted.
   * @returns this.
   */
  onError<E extends ErrorType>(
    errorType: { type: string },
    callbackFn: (error: E) => void
  ): Disconnectable {
    return onWithHandler(this.internalEmitter, errorType.type, callbackFn);
  }
}
