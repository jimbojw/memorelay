/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for checkOKMessage().
 */

import { checkOKMessage } from './check-ok-message';

// A valid event id consisting of all zeros.
const ZERO_ID = Array(64).fill(0).join('');

describe('checkOKMessage()', () => {
  it('should reject OK message with missing event id', () => {
    expect(() => {
      checkOKMessage(['OK']);
    }).toThrow('bad msg: event id missing');
  });

  it('should reject OK message with malformed id', () => {
    expect(() => {
      checkOKMessage(['OK', null]);
    }).toThrow('bad msg: event id type mismatch');

    expect(() => {
      checkOKMessage(['OK', 5]);
    }).toThrow('bad msg: event id type mismatch');

    expect(() => {
      checkOKMessage(['OK', 'abcde']);
    }).toThrow('bad msg: event id malformed');
  });

  it('should reject OK message missing status', () => {
    expect(() => {
      checkOKMessage(['OK', ZERO_ID]);
    }).toThrow('bad msg: status missing');
  });

  it('should reject OK message with non-boolean status', () => {
    expect(() => {
      checkOKMessage(['OK', ZERO_ID, null]);
    }).toThrow('bad msg: status type mismatch');

    expect(() => {
      checkOKMessage(['OK', ZERO_ID, 7]);
    }).toThrow('bad msg: status type mismatch');

    expect(() => {
      checkOKMessage(['OK', ZERO_ID, 'false']);
    }).toThrow('bad msg: status type mismatch');
  });

  it('should reject OK message missing description', () => {
    expect(() => {
      checkOKMessage(['OK', ZERO_ID, true]);
    }).toThrow('bad msg: description missing');

    expect(() => {
      checkOKMessage(['OK', ZERO_ID, false]);
    }).toThrow('bad msg: description missing');
  });

  it('should accept OK message with empty description', () => {
    const okMessage: ['OK', ...unknown[]] = ['OK', ZERO_ID, true, ''];
    expect(checkOKMessage(okMessage)).toBe(okMessage);
  });

  it('should accept OK message marking duplicate', () => {
    const okMessage: ['OK', ...unknown[]] = ['OK', ZERO_ID, true, 'duplicate:'];
    expect(checkOKMessage(okMessage)).toBe(okMessage);
  });

  it('should accept OK message marking deleted event', () => {
    const okMessage: ['OK', ...unknown[]] = ['OK', ZERO_ID, true, 'deleted:'];
    expect(checkOKMessage(okMessage)).toBe(okMessage);
  });

  it('should reject OK message with missing reason', () => {
    expect(() => {
      checkOKMessage(['OK', ZERO_ID, true, 'no reason']);
    }).toThrow('bad msg: reason missing');

    expect(() => {
      checkOKMessage(['OK', ZERO_ID, true, ':no reason']);
    }).toThrow('bad msg: reason missing');

    expect(() => {
      checkOKMessage(['OK', ZERO_ID, true, '     :  no reason']);
    }).toThrow('bad msg: reason missing');
  });

  it('should reject OK message with unrecognized reason', () => {
    expect(() => {
      checkOKMessage(['OK', ZERO_ID, true, 'unspecified: no reason']);
    }).toThrow('bad msg: unrecognized reason: unspecified');
  });
});
