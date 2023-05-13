/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the bufferToMessage() function.
 */

import { ReqMessage, bufferToMessage } from './buffer-to-message';

// An identifier that exceeds the 32-byte (64 char) expected length.
const LONG_ID = Array(65).fill('f').join('');

/**
 * Utility function to turn an object into a buffer.
 */
function objectToBuffer(payloadJson: unknown) {
  return Buffer.from(JSON.stringify(payloadJson), 'utf-8');
}

describe('bufferToMessage', () => {
  it('should be a function', () => {
    expect(typeof bufferToMessage).toBe('function');
  });

  it('should reject non-JSON message', () => {
    expect(() => {
      bufferToMessage(Buffer.from('hello world', 'utf-8'));
    }).toThrow('bad msg: unparseable message');
  });

  it('should reject non-Array message', () => {
    expect(() => {
      bufferToMessage(objectToBuffer({}));
    }).toThrow('bad msg: message was not an array');
  });

  it('should reject empty array message', () => {
    expect(() => {
      bufferToMessage(objectToBuffer([]));
    }).toThrow('bad msg: message type missing');
  });

  it('should reject message with non-string event type', () => {
    expect(() => {
      bufferToMessage(objectToBuffer([{}]));
    }).toThrow('bad msg: message type was not a string');

    expect(() => {
      bufferToMessage(objectToBuffer([null]));
    }).toThrow('bad msg: message type was not a string');

    expect(() => {
      bufferToMessage(objectToBuffer([12]));
    }).toThrow('bad msg: message type was not a string');
  });

  it('should reject message with unrecognized event type', () => {
    expect(() => {
      bufferToMessage(objectToBuffer(['event']));
    }).toThrow('bad msg: unrecognized event type');

    expect(() => {
      bufferToMessage(objectToBuffer(['hello']));
    }).toThrow('bad msg: unrecognized event type');

    expect(() => {
      bufferToMessage(objectToBuffer(['rEq']));
    }).toThrow('bad msg: unrecognized event type');
  });

  describe('EVENT', () => {
    it('should reject EVENT message without an event', () => {
      expect(() => {
        bufferToMessage(objectToBuffer(['EVENT']));
      }).toThrow('bad msg: event missing');
    });

    it('should reject EVENT message with invalid event', () => {
      expect(() => {
        bufferToMessage(objectToBuffer(['EVENT', null]));
      }).toThrow('bad msg: event invalid');

      expect(() => {
        bufferToMessage(objectToBuffer(['EVENT', {}]));
      }).toThrow('bad msg: event invalid');

      expect(() => {
        bufferToMessage(
          objectToBuffer(['EVENT', { kind: 1, content: 'hello' }])
        );
      }).toThrow('bad msg: event invalid');
    });

    it('should reject EVENT message with unsigned event', () => {
      const unsignedEvent = {
        content: 'BRB, turning on the miners',
        created_at: 1683474317,
        id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
        kind: 1,
        pubkey:
          '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
        tags: [],
      };
      const payload = objectToBuffer(['EVENT', unsignedEvent]);
      expect(() => {
        bufferToMessage(payload);
      }).toThrow('bad msg: event signature missing');
    });

    it('should reject EVENT message with bad signature', () => {
      const unsignedEvent = {
        content: 'BRB, turning on the miners',
        created_at: 1683474317,
        id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
        kind: 1,
        pubkey:
          '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
        sig: 'LET_ME_IN',
        tags: [],
      };
      const payload = objectToBuffer(['EVENT', unsignedEvent]);
      expect(() => {
        bufferToMessage(payload);
      }).toThrow('bad msg: bad signature');
    });

    it('should accept EVENT message with signed event', () => {
      const event = {
        content: 'BRB, turning on the miners',
        created_at: 1683474317,
        id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
        kind: 1,
        pubkey:
          '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
        sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
        tags: [],
      };
      const payload = objectToBuffer(['EVENT', event]);

      const message = bufferToMessage(payload);

      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe('EVENT');
      expect(message[1]).toEqual(event);
      expect(message[1]).not.toBe(event);
    });
  });

  ['REQ', 'CLOSE'].forEach((messageType) => {
    describe(messageType, () => {
      it(`should reject ${messageType} message without a subscription id`, () => {
        expect(() => {
          bufferToMessage(objectToBuffer([messageType]));
        }).toThrow('bad msg: subscription id missing');
      });
    });

    it(`should reject ${messageType} message with a non-string subscription id`, () => {
      expect(() => {
        bufferToMessage(objectToBuffer([messageType, null]));
      }).toThrow('bad msg: subscription id is not a string');

      expect(() => {
        bufferToMessage(objectToBuffer([messageType, 55]));
      }).toThrow('bad msg: subscription id is not a string');

      expect(() => {
        bufferToMessage(objectToBuffer([messageType, {}]));
      }).toThrow('bad msg: subscription id is not a string');

      expect(() => {
        bufferToMessage(objectToBuffer([messageType, ['123']]));
      }).toThrow('bad msg: subscription id is not a string');
    });

    it(`should reject ${messageType} message with long subscription id`, () => {
      expect(() => {
        bufferToMessage(objectToBuffer([messageType, LONG_ID]));
      }).toThrow('bad msg: subscription id is too long');
    });

    it(`should accept ${messageType} message with valid subscription id`, () => {
      const subscriptionId = new Array(64).fill('x').join('');
      const payload = objectToBuffer([messageType, subscriptionId]);
      const message = bufferToMessage(payload);
      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe(messageType);
      expect(message[1]).toBe(subscriptionId);
    });
  });

  describe('REQ', () => {
    it('should reject REQ message with non-object filters', () => {
      expect(() => {
        bufferToMessage(objectToBuffer(['REQ', 'SUBSCRIPTION_ID', null]));
      }).toThrow('bad msg: filter must be an object');

      expect(() => {
        bufferToMessage(objectToBuffer(['REQ', 'SUBSCRIPTION_ID', 'FILTER']));
      }).toThrow('bad msg: filter must be an object');

      expect(() => {
        bufferToMessage(objectToBuffer(['REQ', 'SUBSCRIPTION_ID', 54321]));
      }).toThrow('bad msg: filter must be an object');

      expect(() => {
        bufferToMessage(objectToBuffer(['REQ', 'SUBSCRIPTION_ID', []]));
      }).toThrow('bad msg: filter must be an object');
    });

    it('should accept REQ message with one filter', () => {
      const payload = objectToBuffer(['REQ', 'SUBSCRIPTION_ID', {}]);
      const message = bufferToMessage(payload) as ReqMessage;
      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe('REQ');
      expect(message[1]).toBe('SUBSCRIPTION_ID');
      expect(message[2]).toEqual({});
    });

    it('should accept REQ message with multiple filters', () => {
      const payload = objectToBuffer([
        'REQ',
        'SUBSCRIPTION_ID',
        { ids: ['1'] },
        { authors: ['2'] },
      ]);
      const message = bufferToMessage(payload) as ReqMessage;
      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe('REQ');
      expect(message[1]).toBe('SUBSCRIPTION_ID');
      expect(message[2]).toEqual({ ids: ['1'] });
      expect(message[3]).toEqual({ authors: ['2'] });
    });
  });
});
