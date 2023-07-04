/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the buffer to message functions.
 */

import {
  bufferToClientMessage,
  bufferToGenericMessage,
  bufferToRelayMessage,
} from './buffer-to-message';
import {
  RelayNoticeMessage,
  RelayOKMessage,
  ClientReqMessage,
} from './message-types';

// A valid event id consisting of all zeros.
const ZERO_ID = Array(64).fill(0).join('');

// An identifier that exceeds the 32-byte (64 char) expected length.
const LONG_ID = Array(65).fill('f').join('');

/**
 * Utility function to turn an object into a buffer.
 */
function objectToBuffer(payloadJson: unknown) {
  return Buffer.from(JSON.stringify(payloadJson), 'utf-8');
}

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
      bufferToGenericMessage(objectToBuffer({}));
    }).toThrow('bad msg: message was not an array');
  });

  it('should reject empty array message', () => {
    expect(() => {
      bufferToGenericMessage(objectToBuffer([]));
    }).toThrow('bad msg: message type missing');
  });

  it('should reject message with non-string event type', () => {
    expect(() => {
      bufferToGenericMessage(objectToBuffer([{}]));
    }).toThrow('bad msg: message type was not a string');

    expect(() => {
      bufferToGenericMessage(objectToBuffer([null]));
    }).toThrow('bad msg: message type was not a string');

    expect(() => {
      bufferToGenericMessage(objectToBuffer([12]));
    }).toThrow('bad msg: message type was not a string');
  });
});

describe('bufferToClientMessage', () => {
  it('should be a function', () => {
    expect(typeof bufferToClientMessage).toBe('function');
  });

  it('should reject message with unrecognized event type', () => {
    expect(() => {
      bufferToClientMessage(objectToBuffer(['event']));
    }).toThrow('bad msg: unrecognized event type');

    expect(() => {
      bufferToClientMessage(objectToBuffer(['hello']));
    }).toThrow('bad msg: unrecognized event type');

    expect(() => {
      bufferToClientMessage(objectToBuffer(['rEq']));
    }).toThrow('bad msg: unrecognized event type');
  });

  describe('EVENT', () => {
    it('should reject EVENT message without an event', () => {
      expect(() => {
        bufferToClientMessage(objectToBuffer(['EVENT']));
      }).toThrow('bad msg: event missing');
    });

    it('should reject EVENT message with invalid event', () => {
      expect(() => {
        bufferToClientMessage(objectToBuffer(['EVENT', null]));
      }).toThrow('bad msg: event invalid');

      expect(() => {
        bufferToClientMessage(objectToBuffer(['EVENT', {}]));
      }).toThrow('bad msg: event invalid');

      expect(() => {
        bufferToClientMessage(
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
        bufferToClientMessage(payload);
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
        bufferToClientMessage(payload);
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

      const message = bufferToClientMessage(payload);

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
          bufferToClientMessage(objectToBuffer([messageType]));
        }).toThrow('bad msg: subscription id missing');
      });
    });

    it(`should reject ${messageType} message with a non-string subscription id`, () => {
      expect(() => {
        bufferToClientMessage(objectToBuffer([messageType, null]));
      }).toThrow('bad msg: subscription id is not a string');

      expect(() => {
        bufferToClientMessage(objectToBuffer([messageType, 55]));
      }).toThrow('bad msg: subscription id is not a string');

      expect(() => {
        bufferToClientMessage(objectToBuffer([messageType, {}]));
      }).toThrow('bad msg: subscription id is not a string');

      expect(() => {
        bufferToClientMessage(objectToBuffer([messageType, ['123']]));
      }).toThrow('bad msg: subscription id is not a string');
    });

    it(`should reject ${messageType} message with long subscription id`, () => {
      expect(() => {
        bufferToClientMessage(objectToBuffer([messageType, LONG_ID]));
      }).toThrow('bad msg: subscription id is too long');
    });

    it(`should accept ${messageType} message with valid subscription id`, () => {
      const subscriptionId = new Array(64).fill('x').join('');
      const payload = objectToBuffer([messageType, subscriptionId]);
      const message = bufferToClientMessage(payload);
      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe(messageType);
      expect(message[1]).toBe(subscriptionId);
    });
  });

  describe('REQ', () => {
    it('should reject REQ message with non-object filters', () => {
      expect(() => {
        bufferToClientMessage(objectToBuffer(['REQ', 'SUBSCRIPTION_ID', null]));
      }).toThrow('bad msg: filter must be an object');

      expect(() => {
        bufferToClientMessage(
          objectToBuffer(['REQ', 'SUBSCRIPTION_ID', 'FILTER'])
        );
      }).toThrow('bad msg: filter must be an object');

      expect(() => {
        bufferToClientMessage(
          objectToBuffer(['REQ', 'SUBSCRIPTION_ID', 54321])
        );
      }).toThrow('bad msg: filter must be an object');

      expect(() => {
        bufferToClientMessage(objectToBuffer(['REQ', 'SUBSCRIPTION_ID', []]));
      }).toThrow('bad msg: filter must be an object');
    });

    it('should accept REQ message with one filter', () => {
      const payload = objectToBuffer(['REQ', 'SUBSCRIPTION_ID', {}]);
      const message = bufferToClientMessage(payload) as ClientReqMessage;
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
      const message = bufferToClientMessage(payload) as ClientReqMessage;
      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe('REQ');
      expect(message[1]).toBe('SUBSCRIPTION_ID');
      expect(message[2]).toEqual({ ids: ['1'] });
      expect(message[3]).toEqual({ authors: ['2'] });
    });
  });
});

describe('bufferToRelayMessage', () => {
  it('should be a function', () => {
    expect(typeof bufferToRelayMessage).toBe('function');
  });

  it('should reject message with unrecognized event type', () => {
    expect(() => {
      bufferToRelayMessage(objectToBuffer(['event']));
    }).toThrow('bad msg: unrecognized event type');

    expect(() => {
      bufferToRelayMessage(objectToBuffer(['hello']));
    }).toThrow('bad msg: unrecognized event type');

    expect(() => {
      bufferToRelayMessage(objectToBuffer(['Notice']));
    }).toThrow('bad msg: unrecognized event type');
  });

  describe('EVENT', () => {
    it('should reject EVENT message without subscription id', () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['EVENT']));
      }).toThrow('bad msg: subscription id missing');
    });

    it('should reject EVENT message without an event', () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['EVENT', 'SUBSCRIPTION_ID']));
      }).toThrow('bad msg: event missing');
    });

    it('should reject EVENT message with invalid event', () => {
      expect(() => {
        bufferToRelayMessage(
          objectToBuffer(['EVENT', 'SUBSCRIPTION_ID', null])
        );
      }).toThrow('bad msg: event invalid');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['EVENT', 'SUBSCRIPTION_ID', {}]));
      }).toThrow('bad msg: event invalid');

      expect(() => {
        bufferToRelayMessage(
          objectToBuffer([
            'EVENT',
            'SUBSCRIPTION_ID',
            { kind: 1, content: 'hello' },
          ])
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
      const payload = objectToBuffer([
        'EVENT',
        'SUBSCRIPTION_ID',
        unsignedEvent,
      ]);
      expect(() => {
        bufferToRelayMessage(payload);
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
      const payload = objectToBuffer([
        'EVENT',
        'SUBSCRIPTION_ID',
        unsignedEvent,
      ]);
      expect(() => {
        bufferToRelayMessage(payload);
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
      const payload = objectToBuffer(['EVENT', 'SUBSCRIPTION_ID', event]);

      const message = bufferToRelayMessage(payload);

      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe('EVENT');
      expect(message[1]).toBe('SUBSCRIPTION_ID');
      expect(message[2]).toEqual(event);
      expect(message[2]).not.toBe(event);
    });
  });

  describe('EOSE', () => {
    it(`should reject EOSE message without a subscription id`, () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['EOSE']));
      }).toThrow('bad msg: subscription id missing');
    });

    it(`should reject EOSE message with a non-string subscription id`, () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['EOSE', null]));
      }).toThrow('bad msg: subscription id is not a string');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['EOSE', 55]));
      }).toThrow('bad msg: subscription id is not a string');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['EOSE', {}]));
      }).toThrow('bad msg: subscription id is not a string');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['EOSE', ['123']]));
      }).toThrow('bad msg: subscription id is not a string');
    });

    it(`should reject EOSE message with long subscription id`, () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['EOSE', LONG_ID]));
      }).toThrow('bad msg: subscription id is too long');
    });

    it(`should accept EOSE message with valid subscription id`, () => {
      const subscriptionId = new Array(64).fill('x').join('');
      const payload = objectToBuffer(['EOSE', subscriptionId]);
      const message = bufferToRelayMessage(payload);
      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe('EOSE');
      expect(message[1]).toBe(subscriptionId);
    });
  });

  describe('NOTICE', () => {
    it('should reject NOTICE message with missing notice', () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['NOTICE']));
      }).toThrow('bad msg: notice message missing');
    });

    it('should reject NOTICE message with non-string notice', () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['NOTICE', null]));
      }).toThrow('bad msg: notice message type mismatch');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['NOTICE', 5]));
      }).toThrow('bad msg: notice message type mismatch');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['NOTICE', {}]));
      }).toThrow('bad msg: notice message type mismatch');
    });

    it('should accept NOTICE message with description', () => {
      const payload = objectToBuffer(['NOTICE', 'some reason']);
      const message = bufferToRelayMessage(payload) as RelayNoticeMessage;
      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe('NOTICE');
      expect(message[1]).toBe('some reason');
    });

    it('should reject NOTICE message with extra elements', () => {
      expect(() => {
        bufferToRelayMessage(
          objectToBuffer(['NOTICE', 'reason', 'EXTRA ELEMENT'])
        );
      }).toThrow('bad msg: extra elements detected');
    });
  });

  describe('OK', () => {
    it('should reject OK message with missing event id', () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['OK']));
      }).toThrow('bad msg: event id missing');
    });

    it('should reject OK message with malformed id', () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['OK', null]));
      }).toThrow('bad msg: event id type mismatch');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['OK', 5]));
      }).toThrow('bad msg: event id type mismatch');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['OK', 'abcde']));
      }).toThrow('bad msg: event id malformed');
    });

    it('should reject OK message missing status', () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['OK', ZERO_ID]));
      }).toThrow('bad msg: status missing');
    });

    it('should reject OK message with non-boolean status', () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['OK', ZERO_ID, null]));
      }).toThrow('bad msg: status type mismatch');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['OK', ZERO_ID, 7]));
      }).toThrow('bad msg: status type mismatch');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['OK', ZERO_ID, 'false']));
      }).toThrow('bad msg: status type mismatch');
    });

    it('should reject OK message missing description', () => {
      expect(() => {
        bufferToRelayMessage(objectToBuffer(['OK', ZERO_ID, true]));
      }).toThrow('bad msg: description missing');

      expect(() => {
        bufferToRelayMessage(objectToBuffer(['OK', ZERO_ID, false]));
      }).toThrow('bad msg: description missing');
    });

    it('should accept OK message with empty description', () => {
      const payload = objectToBuffer(['OK', ZERO_ID, true, '']);
      const message = bufferToRelayMessage(payload) as RelayOKMessage;
      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe('OK');
      expect(message[1]).toBe(ZERO_ID);
      expect(message[2]).toBe(true);
      expect(message[3]).toBe('');
    });

    it('should accept OK message marking duplicate', () => {
      const payload = objectToBuffer(['OK', ZERO_ID, true, 'duplicate:']);
      const message = bufferToRelayMessage(payload) as RelayOKMessage;
      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe('OK');
      expect(message[1]).toBe(ZERO_ID);
      expect(message[2]).toBe(true);
      expect(message[3]).toBe('duplicate:');
    });

    it('should accept OK message marking deleted event', () => {
      const payload = objectToBuffer(['OK', ZERO_ID, true, 'deleted:']);
      const message = bufferToRelayMessage(payload) as RelayOKMessage;
      expect(Array.isArray(message)).toBe(true);
      expect(message[0]).toBe('OK');
      expect(message[1]).toBe(ZERO_ID);
      expect(message[2]).toBe(true);
      expect(message[3]).toBe('deleted:');
    });

    it('should reject OK message with missing reason', () => {
      expect(() => {
        bufferToRelayMessage(
          objectToBuffer(['OK', ZERO_ID, true, 'no reason'])
        );
      }).toThrow('bad msg: reason missing');

      expect(() => {
        bufferToRelayMessage(
          objectToBuffer(['OK', ZERO_ID, true, ':no reason'])
        );
      }).toThrow('bad msg: reason missing');

      expect(() => {
        bufferToRelayMessage(
          objectToBuffer(['OK', ZERO_ID, true, '     :  no reason'])
        );
      }).toThrow('bad msg: reason missing');
    });

    it('should reject OK message with unrecognized reason', () => {
      expect(() => {
        bufferToRelayMessage(
          objectToBuffer(['OK', ZERO_ID, true, 'unspecified: no reason'])
        );
      }).toThrow('bad msg: unrecognized reason: unspecified');
    });
  });
});
