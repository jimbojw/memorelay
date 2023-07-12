/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendNoticeOnClientError().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { BadMessageError } from '../errors/bad-message-error';
import { BadMessageErrorEvent } from '../events/bad-message-error-event';
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

      memorelayClient.emitEvent(
        new BadMessageErrorEvent({
          badMessageError: new BadMessageError('EXAMPLE'),
          badMessage: 'EXAMPLE',
        })
      );

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingNoticeMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(outgoingNoticeMessageEvent.details.relayNoticeMessage).toEqual([
        'NOTICE',
        'ERROR: bad msg: EXAMPLE',
      ]);
    });

    it('should not emit when defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        sendNoticeOnClientError
      );

      const mockHandlerFn = jest.fn<unknown, [OutgoingNoticeMessageEvent]>();
      memorelayClient.onEvent(OutgoingNoticeMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('EXAMPLE'),
        badMessage: 'EXAMPLE',
      });
      badMessageErrorEvent.preventDefault();
      memorelayClient.emitEvent(badMessageErrorEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
