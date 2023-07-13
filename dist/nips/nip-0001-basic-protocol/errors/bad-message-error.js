"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error type for bad messages incoming from a client.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadMessageError = void 0;
class BadMessageError extends Error {
    constructor(reason) {
        super(`bad msg: ${reason}`);
    }
}
exports.BadMessageError = BadMessageError;
