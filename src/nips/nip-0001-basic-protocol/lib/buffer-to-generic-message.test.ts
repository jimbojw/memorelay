/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for bufferToGenericMessage().
 */

import { bufferToGenericMessage } from './buffer-to-generic-message';
import { objectToJsonBuffer } from './object-to-json-buffer';

describe('bufferToGenericMessage', () => {
  it('should be a function', () => {
    expect(typeof bufferToGenericMessage).toBe('function');
  });

  it('should reject non-JSON message', () => {
    expect(() => {
      bufferToGenericMessage(Buffer.from('hello world', 'utf-8'));
    }).toThrow('bad msg: unparseable message');
  });

  it('should reject non-Array message', () => {
    expect(() => {
      bufferToGenericMessage(objectToJsonBuffer({}));
    }).toThrow('bad msg: message was not an array');
  });

  it('should reject empty array message', () => {
    expect(() => {
      bufferToGenericMessage(objectToJsonBuffer([]));
    }).toThrow('bad msg: message type missing');
  });

  it('should reject message with non-string event type', () => {
    expect(() => {
      bufferToGenericMessage(objectToJsonBuffer([{}]));
    }).toThrow('bad msg: message type was not a string');

    expect(() => {
      bufferToGenericMessage(objectToJsonBuffer([null]));
    }).toThrow('bad msg: message type was not a string');

    expect(() => {
      bufferToGenericMessage(objectToJsonBuffer([12]));
    }).toThrow('bad msg: message type was not a string');
  });
});
