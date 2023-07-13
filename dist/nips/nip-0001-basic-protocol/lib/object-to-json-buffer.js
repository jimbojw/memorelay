"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Serialize an object as a Buffer containing JSON.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectToJsonBuffer = void 0;
/**
 * Utility function to turn an object into a buffer.
 */
function objectToJsonBuffer(payloadJson) {
    return Buffer.from(JSON.stringify(payloadJson), 'utf-8');
}
exports.objectToJsonBuffer = objectToJsonBuffer;
