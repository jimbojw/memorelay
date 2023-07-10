/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendNoticeOnClientError().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { BadMessageError } from '../errors/bad-message-error';
import { OutgoingNoticeMessageEvent } from '../events/outgoing-notice-message-event';
import { sendNoticeOnClientError } from './send-notice-on-client-error';

describe('sendNoticeOnClientError()', () => {
  describe('#BadMessageError', () => {
    it('should emit an outgoing NOTICE message', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        sendNoticeOnClientError
      );

      const mockHandlerFn = jest.fn<unknown, [OutgoingNoticeMessageEvent]>();
      memorelayClient.onEvent(OutgoingNoticeMessageEvent, mockHandlerFn);

      memorelayClient.emitError(new BadMessageError('EXAMPLE'));

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const {
        details: { relayNoticeMessage },
      } = mockHandlerFn.mock.calls[0][0];

      expect(relayNoticeMessage).toEqual(['NOTICE', 'ERROR: bad msg: EXAMPLE']);
    });
  });
});
