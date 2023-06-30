/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error type for bad messages.
 */

export class BadMessageError extends Error {
  readonly type = 'bad-message-error';
  constructor(private readonly reason: string) {
    super();
  }
  get message(): string {
    return `bad msg: ${this.reason}`;
  }
}
