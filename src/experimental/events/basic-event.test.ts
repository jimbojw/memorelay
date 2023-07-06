/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for BasicEvent.
 */

import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { BasicEvent } from './basic-event';

describe('BasicEvent', () => {
  it('should have properties match constructor params', () => {
    const eventType = 'abcde';
    const mockOriginatorTag = {};
    const mockParentEvent = {} as BasicEvent;
    const mockTargetEmitter = {} as BasicEventEmitter;
    const mockDetails = {};

    const basicEvent = new BasicEvent(eventType, mockDetails, {
      originatorTag: mockOriginatorTag,
      parentEvent: mockParentEvent,
      targetEmitter: mockTargetEmitter,
    });

    expect(basicEvent.type).toBe(eventType);
    expect(basicEvent.details).toBe(mockDetails);
    expect(basicEvent.originatorTag).toBe(mockOriginatorTag);
    expect(basicEvent.parentEvent).toBe(mockParentEvent);
    expect(basicEvent.targetEmitter).toBe(mockTargetEmitter);
  });

  it('should not have default prevented to begin with', () => {
    const basicEvent = new BasicEvent('test', undefined);
    expect(basicEvent.defaultPrevented).toBe(false);
  });

  describe('preventDefault()', () => {
    it('should cause default prevented to be true', () => {
      const basicEvent = new BasicEvent('test', undefined);
      basicEvent.preventDefault();
      expect(basicEvent.defaultPrevented).toBe(true);
    });

    it('should allow multiple calls without further effect', () => {
      const basicEvent = new BasicEvent('test', undefined);
      basicEvent.preventDefault();
      basicEvent.preventDefault();
      basicEvent.preventDefault();
      expect(basicEvent.defaultPrevented).toBe(true);
    });
  });
});
