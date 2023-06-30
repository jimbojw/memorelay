/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for BasicEvent.
 */

import { BasicEvent } from './basic-event';

describe('BasicEvent', () => {
  it('should be a constructor function', () => {
    expect(typeof BasicEvent).toBe('function');
    const basicEvent = new BasicEvent('test');
    expect(basicEvent).toBeInstanceOf(BasicEvent);
  });

  it('should have type match constructor param', () => {
    const basicEvent = new BasicEvent('abcde');
    expect(basicEvent.type).toBe('abcde');
  });

  it('should have undefined details if unspecified', () => {
    const basicEvent = new BasicEvent('test');
    expect(basicEvent.details).toBeUndefined();
  });

  it('should have details match constructor param', () => {
    const payload = { foo: 'bar' };
    const basicEvent = new BasicEvent('test', payload);
    expect(basicEvent.details).toBe(payload);
  });

  it('should not have default prevented to begin with', () => {
    const basicEvent = new BasicEvent('test');
    expect(basicEvent.defaultPrevented).toBe(false);
  });

  describe('preventDefault()', () => {
    it('should cause default prevented to be true', () => {
      const basicEvent = new BasicEvent('test');
      basicEvent.preventDefault();
      expect(basicEvent.defaultPrevented).toBe(true);
    });

    it('should allow multiple calls without further effect', () => {
      const basicEvent = new BasicEvent('test');
      basicEvent.preventDefault();
      basicEvent.preventDefault();
      basicEvent.preventDefault();
      expect(basicEvent.defaultPrevented).toBe(true);
    });
  });
});
