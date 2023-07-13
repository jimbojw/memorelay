/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Preflight event emitted before another (non-preflight) event.
 */
import { BasicEvent, BasicEventOptions } from './basic-event';
export declare const PREFLIGHT_EVENT_TYPE = "preflight-event";
/**
 * @see PreflightEvent
 */
export interface PreflightEventDetails<EventType extends BasicEvent = BasicEvent> {
    /**
     * Basic event that's about to be emitted.
     */
    readonly event: EventType;
}
/**
 * Just before a non-preflight event will be emitted, a BasicEventEmitter will
 * emit a preflight event containing that event in its details. This allows for
 * meta-event programming, such as logging, to become aware of previously
 * unknown event types.
 */
export declare class PreflightEvent<EventType extends BasicEvent = BasicEvent> extends BasicEvent<typeof PREFLIGHT_EVENT_TYPE, PreflightEventDetails<EventType>> {
    static readonly type: typeof PREFLIGHT_EVENT_TYPE;
    constructor(details: PreflightEventDetails<EventType>, options?: BasicEventOptions);
}
