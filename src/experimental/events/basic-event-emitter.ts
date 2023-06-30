/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview EventEmitter with an extra capacity for emitting BasicEvents.
 */

import { EventEmitter } from 'events';
import { BasicEvent } from './basic-event';

export interface BasicEventHandler {
  target: EventEmitter;
  type: string;
  handler: (...args: any[]) => void;
}

export class BasicEventEmitter extends EventEmitter {
  protected readonly handlers: Readonly<BasicEventHandler[]>;

  constructor(handlers?: BasicEventHandler[]) {
    super();
    this.handlers = handlers ?? [];
  }

  /**
   * Connects all event listeners. Rather than setting up listeners immediately
   * upon construction, initialization is delayed until connect() is called to
   * give other listeners a chance to get in line first.
   */
  connect(): this {
    for (const { target, type, handler } of this.handlers) {
      target.on(type, handler);
    }
    return this;
  }

  /**
   * Disconnects all event listeners.
   */
  disconnect(): this {
    for (const { target, type, handler } of this.handlers) {
      target.off(type, handler);
    }
    return this;
  }

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
