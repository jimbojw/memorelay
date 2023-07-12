/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for rejectUnrecognizedIncomingMessages().
 */

import { rejectUnrecognizedIncomingMessages } from './reject-unrecognized-incoming-messages';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { BadMessageErrorEvent } from '../events/bad-message-error-event';

describe('rejectUnrecognizedIncomingMessages()', () => {
  describe('#IncomingGenericMessageEvent', () => {
    it('should ignore events with defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        rejectUnrecognizedIncomingMessages
      );

      const mockHandlerFn = jest.fn<unknown, [BadMessageErrorEvent]>();
      memorelayClient.onEvent(BadMessageErrorEvent, mockHandlerFn);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['BAD_MESSAGE'],
      });
      incomingGenericMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });

    it('should emit an error when message type is unrecognized', async () => {
      const testMessageTypes = [
        'AUTH',
        'EVENT',
        'CLOSE',
        'NOTICE',
        'REQ',
        'UNKNOWN',
      ];
      for (const messageType of testMessageTypes) {
        const { memorelayClient } = setupTestHubAndClient(
          rejectUnrecognizedIncomingMessages
        );
        const mockHandlerFn = jest.fn<unknown, [BadMessageErrorEvent]>();
        memorelayClient.onEvent(BadMessageErrorEvent, mockHandlerFn);

        const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
          genericMessage: [messageType],
        });
        memorelayClient.emitEvent(incomingGenericMessageEvent);

        expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

        expect(mockHandlerFn).not.toHaveBeenCalled();

        await Promise.resolve();

        expect(mockHandlerFn.mock.calls).toHaveLength(1);
        const badMessageError = mockHandlerFn.mock.calls[0][0];
        expect(badMessageError).toBeInstanceOf(BadMessageErrorEvent);
      }
    });
  });
});
