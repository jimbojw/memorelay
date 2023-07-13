"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error type for malformed Nostr EVENTs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadEventError = void 0;
/**
 * Error thrown when a Nostr event is determined to be invalid or failed
 * verification.
 */
class BadEventError extends Error {
}
exports.BadEventError = BadEventError;
