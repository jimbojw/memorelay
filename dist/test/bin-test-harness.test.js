"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for BinTestHarness.
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
const bin_test_harness_1 = require("./bin-test-harness");
describe('BinTestHarness', () => {
    describe('teardown()', () => {
        it('should throw if called before child process is created', () => __awaiter(void 0, void 0, void 0, function* () {
            const binTestHarness = new bin_test_harness_1.BinTestHarness();
            try {
                yield binTestHarness.teardown();
            }
            catch (err) {
                expect(err.message).toMatch('child process missing');
            }
        }));
    });
    describe('openWebSocket()', () => {
        it('should throw if bound port is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const binTestHarness = new bin_test_harness_1.BinTestHarness();
            try {
                yield binTestHarness.openWebSocket();
            }
            catch (err) {
                expect(err.message).toMatch('bound port missing');
            }
        }));
    });
    describe('closeWebSocket()', () => {
        it('should throw if object passed was not self-created', () => __awaiter(void 0, void 0, void 0, function* () {
            const binTestHarness = new bin_test_harness_1.BinTestHarness();
            try {
                yield binTestHarness.closeWebSocket({});
            }
            catch (err) {
                expect(err.message).toMatch('web socket not recognized');
            }
        }));
    });
});
