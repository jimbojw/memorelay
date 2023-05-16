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
export function createPromise<T = unknown>(): CreatePromiseResult<T> {
  // Must assign a value to combat TS 2454 'used before being assigned'.
  let resolveOrUndefined: ResolveFunction<T> | undefined = undefined;
  let rejectOrUndefined: RejectFunction | undefined = undefined;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolveOrUndefined = promiseResolve;
    rejectOrUndefined = promiseReject;
  });

  // Laborious re-casting to combat TS 2322 'not assignable' and TS 2352
  // 'Conversion of type' errors.
  const resolve = resolveOrUndefined as unknown as ResolveFunction<T>;
  const reject = rejectOrUndefined as unknown as RejectFunction;

  return { promise, resolve, reject };
}
