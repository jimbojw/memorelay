/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview EventEmitter with an extra capacity for emitting BasicEvents.
 */

import { EventEmitter } from 'events';
import { BasicEvent } from '../events/basic-event';

export class BasicEventEmitter extends EventEmitter {
  /**
   * Emits the provided BasicEvent then returns it.
   * @param basicEvent The event to emit using its type as eventName.
   * @returns The same provided BasicEvent for chaining.
   */
  emitBasic(basicEvent: BasicEvent): BasicEvent {
    this.emit(basicEvent.type, basicEvent);
    return basicEvent;
  }

  /**
   * Emits the provided object then returns the object.
   * @param error The error object to emit. Must have a type string.
   * @returns The same error object which was passed in.
   */
  emitError(error: { type: string }) {
    this.emit(error.type, error);
    return error;
  }
}
