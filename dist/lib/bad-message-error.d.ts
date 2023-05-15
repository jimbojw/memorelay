/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error type for bad messages.
 */
export declare class BadMessageError extends Error {
    private readonly reason;
    constructor(reason: string);
    get message(): string;
}
