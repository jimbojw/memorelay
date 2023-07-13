"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for createPromise() utility function.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_promise_1 = require("./create-promise");
describe('createPromise', () => {
    it('should be a function', () => {
        expect(typeof create_promise_1.createPromise).toBe('function');
    });
    it('should return an object of the expected type', () => {
        const result = (0, create_promise_1.createPromise)();
        expect(result).toBeDefined();
        expect(result.promise instanceof Promise).toBe(true);
        expect(typeof result.resolve).toBe('function');
        expect(typeof result.reject).toBe('function');
    });
    describe('resolve', () => {
        it('should resolve the promise', () => __awaiter(void 0, void 0, void 0, function* () {
            const { promise, resolve } = (0, create_promise_1.createPromise)();
            queueMicrotask(() => {
                resolve(123);
            });
            const result = yield promise;
            expect(result).toBe(123);
        }));
    });
    describe('reject', () => {
        it('should reject the promise', () => __awaiter(void 0, void 0, void 0, function* () {
            const { promise, reject } = (0, create_promise_1.createPromise)();
            queueMicrotask(() => {
                reject(new Error('REJECTED'));
            });
            try {
                yield promise;
                fail('Promise should have been rejected');
            }
            catch (err) {
                expect(err).toBeInstanceOf(Error);
            }
        }));
    });
});
