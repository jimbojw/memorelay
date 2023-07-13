/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview EventEmitter with an extra capacity for emitting BasicEvents.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { BasicEvent } from '../events/basic-event';
import { Disconnectable } from '../types/disconnectable';
import { PreflightEvent } from '../events/preflight-event';
export declare class BasicEventEmitter<EventType extends BasicEvent = BasicEvent> {
    /**
     * Maximum number of event listeners known to be permitted without warning.
     *
     * NOTE: Node v19 introduced the getMaxListeners() module function to support
     * determining the maxListeners of an emitter. In the future, using that would
     * be better than keeping a copy, as it would be impervious to circumvention.
     */
    private maxEventListenersValue;
    get maxEventListeners(): number;
    set maxEventListeners(maxEventListeners: number);
    readonly internalEmitter: EventEmitter;
    /**
     * Emits the provided BasicEvent then returns it.
     * @param basicEvent The event to emit using its type as eventName.
     * @returns The same provided BasicEvent for chaining.
     */
    emitEvent(basicEvent: EventType): EventType;
    /**
     * Listen for a BasicEvent.
     * @param basicEventType Type of event to listen for.
     * @param callbackFn Callback function to invoke when event is emitted.
     * @returns this.
     */
    onEvent<T extends EventType | PreflightEvent<EventType>>(basicEventType: {
        type: string;
    }, callbackFn: (basicEvent: T) => void): Disconnectable;
}
