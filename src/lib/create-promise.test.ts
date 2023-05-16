/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for createPromise() utility function.
 */

import { createPromise } from './create-promise';

describe('createPromise', () => {
  it('should be a function', () => {
    expect(typeof createPromise).toBe('function');
  });

  it('should return an object of the expected type', () => {
    const result = createPromise();
    expect(result).toBeDefined();
    expect(result.promise instanceof Promise).toBe(true);
    expect(typeof result.resolve).toBe('function');
    expect(typeof result.reject).toBe('function');
  });

  describe('resolve', () => {
    it('should resolve the promise', async () => {
      const { promise, resolve } = createPromise<number>();

      queueMicrotask(() => {
        resolve(123);
      });

      const result = await promise;

      expect(result).toBe(123);
    });
  });

  describe('reject', () => {
    it('should reject the promise', async () => {
      const { promise, reject } = createPromise<number>();

      queueMicrotask(() => {
        reject(new Error('REJECTED'));
      });

      try {
        await promise;
        fail('Promise should have been rejected');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
