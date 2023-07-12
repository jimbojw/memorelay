/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingCloseEventMessages().
 */

import { validateIncomingCloseMessages } from './validate-incoming-close-messages';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { IncomingCloseMessageEvent } from '../events/incoming-close-message-event';
import { BadMessageErrorEvent } from '../events/bad-message-error-event';

describe('validateIncomingCloseMessages()', () => {
  describe('#IncomingGenericMessageEvent', () => {
    it('should validate and re-emit a CLOSE message', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        validateIncomingCloseMessages
      );

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingCloseMessageEvent]
      >();
      memorelayClient.onEvent(IncomingCloseMessageEvent, mockMessageHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['CLOSE', 'SUBSCRIPTION_ID'],
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

      expect(mockMessageHandler).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockMessageHandler).toHaveBeenCalledTimes(1);
      const incomingCloseMessageEvent = mockMessageHandler.mock.calls[0][0];
      expect(incomingCloseMessageEvent).toBeInstanceOf(
        IncomingCloseMessageEvent
      );
      expect(incomingCloseMessageEvent.details.closeMessage).toEqual([
        'CLOSE',
        'SUBSCRIPTION_ID',
      ]);
      expect(incomingCloseMessageEvent.parentEvent).toBe(
        incomingGenericMessageEvent
      );
      expect(incomingCloseMessageEvent.targetEmitter).toBe(memorelayClient);
    });

    it('should ignore a CLOSE message if defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        validateIncomingCloseMessages
      );

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingCloseMessageEvent]
      >();
      memorelayClient.onEvent(IncomingCloseMessageEvent, mockMessageHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['CLOSE', 'IGNORE_ME'],
      });
      incomingGenericMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      await Promise.resolve();

      expect(mockMessageHandler).not.toHaveBeenCalled();
    });

    it('should ignore non-CLOSE messages', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        validateIncomingCloseMessages
      );

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingCloseMessageEvent]
      >();
      memorelayClient.onEvent(IncomingCloseMessageEvent, mockMessageHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['UNKNOWN', 12345],
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(false);

      await Promise.resolve();

      expect(mockMessageHandler).not.toHaveBeenCalled();
    });

    it('should emit an error when CLOSE message is malformed', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        validateIncomingCloseMessages
      );

      const mockHandlerFn = jest.fn<unknown, [BadMessageErrorEvent]>();
      memorelayClient.onEvent(BadMessageErrorEvent, mockHandlerFn);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['CLOSE'], // Omit required subscription id.
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);
      const badMessageError = mockHandlerFn.mock.calls[0][0];
      expect(badMessageError).toBeInstanceOf(BadMessageErrorEvent);
    });
  });
});
