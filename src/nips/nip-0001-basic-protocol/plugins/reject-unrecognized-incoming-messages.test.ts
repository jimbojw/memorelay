/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for rejectUnrecognizedIncomingMessages().
 */

import { rejectUnrecognizedIncomingMessages } from './reject-unrecognized-incoming-messages';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { BadMessageError } from '../errors/bad-message-error';

describe('rejectUnrecognizedIncomingMessages()', () => {
  describe('#IncomingGenericMessageEvent', () => {
    it('should ignore events with defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        rejectUnrecognizedIncomingMessages(hub);
      });

      const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
      memorelayClient.onError(BadMessageError, mockErrorHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['BAD_MESSAGE'],
      });
      incomingGenericMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      await Promise.resolve();

      expect(mockErrorHandler).not.toHaveBeenCalled();
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
        const { memorelayClient } = setupTestHubAndClient((hub) => {
          rejectUnrecognizedIncomingMessages(hub);
        });
        const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
        memorelayClient.onError(BadMessageError, mockErrorHandler);

        const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
          genericMessage: [messageType],
        });
        memorelayClient.emitEvent(incomingGenericMessageEvent);

        expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

        expect(mockErrorHandler).not.toHaveBeenCalled();

        await Promise.resolve();

        expect(mockErrorHandler.mock.calls).toHaveLength(1);
        const badMessageError = mockErrorHandler.mock.calls[0][0];
        expect(badMessageError).toBeInstanceOf(BadMessageError);
      }
    });
  });
});
