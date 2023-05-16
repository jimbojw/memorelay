/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function for creating a Promise and returning it and
 * both its resolve and reject functions.
 */
export type ResolveFunction<T> = (result: T) => void;
export type RejectFunction = (error: unknown) => void;
export interface CreatePromiseResult<T> {
    promise: Promise<T>;
    resolve: ResolveFunction<T>;
    reject: RejectFunction;
}
/**
 * Create a new Promise and return it along with functions that can be used to
 * either resolve or reject the promise.
 * @returns The Promise and its resolve and reject functions.
 */
export declare function createPromise<T = unknown>(): CreatePromiseResult<T>;
