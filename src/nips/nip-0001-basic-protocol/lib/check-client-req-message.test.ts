/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for checkClientReqMessage().
 */

import { checkClientReqMessage } from './check-client-req-message';

describe('checkClientReqMessage()', () => {
  it('should throw if not passed a REQ message', () => {
    expect(() => {
      checkClientReqMessage(['FOO']);
    }).toThrow('bad msg: wrong message type');
  });

  it('should throw if subscription id is missing', () => {
    expect(() => {
      checkClientReqMessage(['REQ']);
    }).toThrow('bad msg: subscription id missing');
  });

  it('should throw if subscription id is not a string', () => {
    expect(() => {
      checkClientReqMessage(['REQ', {}]);
    }).toThrow('bad msg: subscription id is not a string');
  });

  it('should throw if filter is invalid', () => {
    expect(() => {
      checkClientReqMessage(['REQ', '1', { invalid: 'filter' }]);
    }).toThrow('bad msg: unexpected filter field');
  });
});
