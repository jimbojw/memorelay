"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Basic Event to be extended for different purposes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicEvent = void 0;
/**
 * A Memorelay BasicEvent takes its design from the DOM native CustomEvent. It
 * supports basic DOM Event functionality such as preventDefault(), and carries
 * an arbitrary, optional payload object.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
class BasicEvent {
    /**
     * @param type The name of the event, case-sensitive.
     * @param details Object containing payload information about this event.
     * @param options Optional event settings.
     */
    constructor(type, details, options) {
        this.type = type;
        this.details = details;
        /**
         * Whether any recipient has called preventDefault();
         */
        this.isDefaultPrevented = false;
        this.originatorTag = options === null || options === void 0 ? void 0 : options.originatorTag;
        this.parentEvent = options === null || options === void 0 ? void 0 : options.parentEvent;
        this.targetEmitter = options === null || options === void 0 ? void 0 : options.targetEmitter;
    }
    /**
     * Same concept as the DOM standard Event's defaultPrevented getter.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/defaultPrevented
     */
    get defaultPrevented() {
        return this.isDefaultPrevented;
    }
    /**
     * Same concept as the DOM standard Event's preventDefault(). Recipient
     * handlers for this kind of event can call preventDefault() to stop the
     * natural subsequent behavior.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
     */
    preventDefault() {
        this.isDefaultPrevented = true;
    }
}
exports.BasicEvent = BasicEvent;
