/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview EventEmitter with an extra capacity for emitting BasicEvents.
 */

import { EventEmitter } from 'events';
import { BasicEvent } from '../events/basic-event';
import { BasicError } from '../errors/basic-error';

export class BasicEventEmitter<
  EventType extends BasicEvent = BasicEvent,
  ErrorType extends BasicError = BasicError
> {
  readonly internalEmitter = new EventEmitter();

  /**
   * Emits the provided BasicEvent then returns it.
   * @param basicEvent The event to emit using its type as eventName.
   * @returns The same provided BasicEvent for chaining.
   */
  emitEvent(basicEvent: EventType): EventType {
    this.internalEmitter.emit(basicEvent.type, basicEvent);
    return basicEvent;
  }

  /**
   * Listen for a BasicEvent.
   * @param basicEventType Type of event to listen for.
   * @param callbackFn Callback function to invoke when event is emitted.
   * @returns this.
   */
  onEvent<T extends EventType>(
    basicEventType: { type: string },
    callbackFn: (basicEvent: T) => void
  ): this {
    this.internalEmitter.on(basicEventType.type, callbackFn);
    return this;
  }

  /**
   * Emits the provided object then returns the object.
   * @param error The error object to emit. Must have a type string.
   * @returns The same error object which was passed in.
   */
  emitError(error: ErrorType) {
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
  ): this {
    this.internalEmitter.on(errorType.type, callbackFn);
    return this;
  }
}
