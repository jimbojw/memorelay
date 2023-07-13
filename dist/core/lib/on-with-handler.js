"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Convenience method to set up a listener and return a Handler.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onWithHandler = void 0;
/**
 * Utility function for establishing an event listener on an emitter via its
 * on() method. The returned Handler object's disconnect() method can be used to
 * remove the handler.
 *
 * NOTE: According to the Node.js EventEmitter documentation for
 * removeListener(), "When a single function has been added as a handler
 * multiple times for a single event..., removeListener() will remove the most
 * recently added instance."
 * @param emitter The emitter on which to listen.
 * @param eventType Name of the event to listen for.
 * @param callbackFn Function to invoke when event occurs.
 * @returns Handler with disconnect() method.
 * @see https://nodejs.org/api/events.html#emitterremovelistenereventname-listener
 */
function onWithHandler(emitter, eventType, callbackFn) {
    const wrapperFn = (...args) => {
        return callbackFn(...args);
    };
    emitter.on(eventType, wrapperFn);
    let removed = false;
    return {
        disconnect: () => {
            !removed && emitter.off(eventType, wrapperFn);
            removed = true;
        },
    };
}
exports.onWithHandler = onWithHandler;
