"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function for creating a Promise and returning it and
 * both its resolve and reject functions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromise = void 0;
/**
 * Create a new Promise and return it along with functions that can be used to
 * either resolve or reject the promise.
 * @returns The Promise and its resolve and reject functions.
 */
function createPromise() {
    // Must assign a value to combat TS 2454 'used before being assigned'.
    let resolveOrUndefined = undefined;
    let rejectOrUndefined = undefined;
    const promise = new Promise((promiseResolve, promiseReject) => {
        resolveOrUndefined = promiseResolve;
        rejectOrUndefined = promiseReject;
    });
    // Laborious re-casting to combat TS 2322 'not assignable' and TS 2352
    // 'Conversion of type' errors.
    const resolve = resolveOrUndefined;
    const reject = rejectOrUndefined;
    return { promise, resolve, reject };
}
exports.createPromise = createPromise;
