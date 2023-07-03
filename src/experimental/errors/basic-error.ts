/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error type for emitting through BasicEventEmitter.
 */

export abstract class BasicError extends Error {
  abstract get type(): string;
}
