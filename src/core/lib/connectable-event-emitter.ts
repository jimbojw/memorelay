/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A wrapper around BasicEventEmitter for performing complete
 * connect() and disconnect().
 */

import { BasicEventEmitter } from './basic-event-emitter';
import { Handler } from '../types/handler';
import { BasicEvent } from '../events/basic-event';
import { BasicError } from '../errors/basic-error';

/**
 * Symbol for accessing the internal handlers list in tests.
 */
export const HANDLERS = Symbol('handlers');

/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
export class ConnectableEventEmitter<
  EventType extends BasicEvent = BasicEvent,
  ErrorType extends BasicError = BasicError
> extends BasicEventEmitter<EventType, ErrorType> {
  private handlers?: Handler[];

  /**
   * @param setupHandlers Callback function to setup event handlers.
   */
  constructor(readonly setupHandlers: () => Handler[]) {
    super();
  }

  get [HANDLERS](): Handler[] | undefined {
    return this.handlers;
  }

  set [HANDLERS](handlers: Handler[] | undefined) {
    this.handlers = handlers;
  }

  get isConnected(): boolean {
    return this.handlers !== undefined;
  }

  /**
   * Connect event handlers. This is delayed until connect() is called in order
   * to give others a chance to listen first.
   * @returns this
   */
  connect(): this {
    if (!this.handlers) {
      const { setupHandlers } = this;
      this.handlers = setupHandlers();
    }
    return this;
  }

  /**
   * Disconnect all event handlers.
   * @returns this.
   */
  disconnect(): this {
    if (this.handlers) {
      this.handlers.forEach((handler) => {
        handler.disconnect();
      });
      this.handlers = undefined;
    }
    return this;
  }
}
