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
    const basicEvent = new BasicEvent();
    expect(basicEvent).toBeInstanceOf(BasicEvent);
  });

  it('should not have default prevented to begin with', () => {
    const basicEvent = new BasicEvent();
    expect(basicEvent.defaultPrevented).toBe(false);
  });

  describe('preventDefault()', () => {
    it('should cause default prevented to be true', () => {
      const basicEvent = new BasicEvent();
      basicEvent.preventDefault();
      expect(basicEvent.defaultPrevented).toBe(true);
    });

    it('should allow multiple calls without further effect', () => {
      const basicEvent = new BasicEvent();
      basicEvent.preventDefault();
      basicEvent.preventDefault();
      basicEvent.preventDefault();
      expect(basicEvent.defaultPrevented).toBe(true);
    });
  });
});
