/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for getPortFromLogMessage().
 */

import { getPortFromLogMessage } from './get-port-from-log-message';

describe('getPortFromLogMessage()', () => {
  it('should throw if port number missing', () => {
    const badLogMessages = [
      'STRING WITH NO TRAILING NUMBERS',
      'STRING WITH FEWER THAN FOUR TRAILING NUMBERS: 123',
      'STRING WITH EXTRA TEXT AFTER PORT NUMBER: 1234 <EXTRA>',
    ];

    for (const badLogMessage of badLogMessages) {
      expect(() => {
        getPortFromLogMessage(badLogMessage);
      }).toThrow('port number missing');
    }
  });
});
