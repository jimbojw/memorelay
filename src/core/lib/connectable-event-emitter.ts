/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A wrapper around BasicEventEmitter for performing complete
 * connect() and disconnect().
 */

import { BasicEventEmitter } from './basic-event-emitter';
import { Disconnectable } from '../types/disconnectable';
import { BasicEvent } from '../events/basic-event';
import { PluginFn } from '../types/plugin-types';

/**
 * Symbol for accessing the internal handlers list in tests.
 */
export const HANDLERS = Symbol('handlers');

/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
export class ConnectableEventEmitter<EventType extends BasicEvent = BasicEvent>
  extends BasicEventEmitter<EventType>
  implements Disconnectable
{
  plugins?: PluginFn<typeof this>[];

  private handlers?: Disconnectable[];

  get [HANDLERS](): Disconnectable[] | undefined {
    return this.handlers;
  }

  set [HANDLERS](handlers: Disconnectable[] | undefined) {
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
      this.handlers = [];
      for (const pluginFn of this.plugins ?? []) {
        this.handlers.push(pluginFn(this));
      }
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
