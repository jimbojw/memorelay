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
export declare const HANDLERS: unique symbol;
/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
export declare class ConnectableEventEmitter<EventType extends BasicEvent = BasicEvent> extends BasicEventEmitter<EventType> implements Disconnectable {
    plugins?: PluginFn<typeof this>[];
    private handlers?;
    get [HANDLERS](): Disconnectable[] | undefined;
    set [HANDLERS](handlers: Disconnectable[] | undefined);
    get isConnected(): boolean;
    /**
     * Connect event handlers. This is delayed until connect() is called in order
     * to give others a chance to listen first.
     * @returns this
     */
    connect(): this;
    /**
     * Disconnect all event handlers.
     * @returns this.
     */
    disconnect(): this;
}
