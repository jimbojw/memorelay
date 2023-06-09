/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Basic Event to be extended for different purposes.
 */
export interface BasicEventOptions<EmitterType = unknown> {
    /**
     * Object marking the originator of the event. Plugins can use this field to
     * perform strict equality checks to find out whether the plugin itself
     * emitted an event.
     */
    readonly originatorTag?: unknown;
    /**
     * Parent event which in some way caused this event to come into being.
     */
    readonly parentEvent?: BasicEvent;
    /**
     * Emitter on which the event is intended to be emitted.
     */
    readonly targetEmitter?: EmitterType;
}
/**
 * A Memorelay BasicEvent takes its design from the DOM native CustomEvent. It
 * supports basic DOM Event functionality such as preventDefault(), and carries
 * an arbitrary, optional payload object.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
export declare class BasicEvent<EventType extends string = string, DetailsType = unknown, EmitterType = unknown> {
    readonly type: EventType;
    readonly details: DetailsType;
    /**
     * Object denoting the originator of the event.
     */
    readonly originatorTag?: unknown;
    /**
     * Parent event which in some way caused this event to be created.
     */
    readonly parentEvent?: BasicEvent;
    /**
     * Intended emitter of this event.
     */
    readonly targetEmitter?: EmitterType;
    /**
     * Whether any recipient has called preventDefault();
     */
    private isDefaultPrevented;
    /**
     * @param type The name of the event, case-sensitive.
     * @param details Object containing payload information about this event.
     * @param options Optional event settings.
     */
    constructor(type: EventType, details: DetailsType, options?: BasicEventOptions<EmitterType>);
    /**
     * Same concept as the DOM standard Event's defaultPrevented getter.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/defaultPrevented
     */
    get defaultPrevented(): boolean;
    /**
     * Same concept as the DOM standard Event's preventDefault(). Recipient
     * handlers for this kind of event can call preventDefault() to stop the
     * natural subsequent behavior.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
     */
    preventDefault(): void;
}
