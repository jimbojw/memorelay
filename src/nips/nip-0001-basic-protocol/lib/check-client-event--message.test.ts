/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for checkClientEventMessage().
 */

import { createSignedTestEvent } from '../../../test/signed-test-event';
import { checkClientEventMessage } from './check-client-event-message';

describe('checkClientEventMessage()', () => {
  it('should throw if not passed an EVENT message', () => {
    expect(() => {
      checkClientEventMessage(['FOO']);
    }).toThrow('bad msg: wrong message type');
  });

  it('should throw if event is missing', () => {
    expect(() => {
      checkClientEventMessage(['EVENT']);
    }).toThrow('bad msg: event missing');
  });

  it('should throw if event signature is missing', () => {
    const unsignedTestEvent = createSignedTestEvent({ content: 'TEST EVENT' });
    (unsignedTestEvent as unknown as { sig: unknown }).sig = undefined;
    expect(() => {
      checkClientEventMessage(['EVENT', unsignedTestEvent]);
    }).toThrow('bad msg: event signature missing');
  });

  it('should throw if event signature is invalid', () => {
    const testEvent = createSignedTestEvent({ content: 'TEST EVENT' });
    (testEvent as unknown as { sig: unknown }).sig = 'INVALID SIGNATURE';
    expect(() => {
      checkClientEventMessage(['EVENT', testEvent]);
    }).toThrow('bad msg: bad signature');
  });

  it('should throw if not passed extra array elements', () => {
    const testEvent = createSignedTestEvent({ content: 'TEST EVENT' });
    expect(() => {
      checkClientEventMessage(['EVENT', testEvent, 'EXTRA']);
    }).toThrow('bad msg: extra elements detected');
  });
});
