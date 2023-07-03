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
> extends EventEmitter {
  /**
   * Emits the provided BasicEvent then returns it.
   * @param basicEvent The event to emit using its type as eventName.
   * @returns The same provided BasicEvent for chaining.
   */
  emitEvent(basicEvent: EventType): EventType {
    this.emit(basicEvent.type, basicEvent);
    return basicEvent;
  }

  /**
   * Listen for a BasicEvent.
   * @param basicEventType Type of event to listen for.
   * @param callbackFn Callback function to invoke when event is emitted.
   * @returns this.
   */
  onEvent(
    basicEventType: string,
    callbackFn: (basicEvent: EventType) => void
  ): this {
    return this.on(basicEventType, callbackFn);
  }

  /**
   * Emits the provided object then returns the object.
   * @param error The error object to emit. Must have a type string.
   * @returns The same error object which was passed in.
   */
  emitError(error: ErrorType) {
    this.emit(error.type, error);
    return error;
  }

  /**
   * Listen for an Error.
   * @param basicEventType Type of error to listen for.
   * @param callbackFn Callback function to invoke when error is emitted.
   * @returns this.
   */
  onError(errorType: string, callbackFn: (error: ErrorType) => void): this {
    return this.on(errorType, callbackFn);
  }
}
