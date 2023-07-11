/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingReqMessages().
 */

import { validateIncomingReqMessages } from './validate-incoming-req-messages';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { BadMessageErrorEvent } from '../events/bad-message-error-event';

describe('validateIncomingReqMessages()', () => {
  describe('#IncomingGenericMessageEvent', () => {
    it('should validate and re-emit a REQ message', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingReqMessages(hub);
      });

      const mockMessageHandler = jest.fn<unknown, [IncomingReqMessageEvent]>();
      memorelayClient.onEvent(IncomingReqMessageEvent, mockMessageHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['REQ', 'SUBSCRIPTION_ID'],
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

      expect(mockMessageHandler).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockMessageHandler).toHaveBeenCalledTimes(1);
      const incomingReqMessageEvent = mockMessageHandler.mock.calls[0][0];
      expect(incomingReqMessageEvent).toBeInstanceOf(IncomingReqMessageEvent);
      expect(incomingReqMessageEvent.details.reqMessage).toEqual([
        'REQ',
        'SUBSCRIPTION_ID',
      ]);
      expect(incomingReqMessageEvent.parentEvent).toBe(
        incomingGenericMessageEvent
      );
      expect(incomingReqMessageEvent.targetEmitter).toBe(memorelayClient);
    });

    it('should ignore a REQ message if defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingReqMessages(hub);
      });

      const mockMessageHandler = jest.fn<unknown, [IncomingReqMessageEvent]>();
      memorelayClient.onEvent(IncomingReqMessageEvent, mockMessageHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['REQ', 'IGNORE_ME'],
      });
      incomingGenericMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      await Promise.resolve();

      expect(mockMessageHandler).not.toHaveBeenCalled();
    });

    it('should ignore non-REQ messages', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingReqMessages(hub);
      });

      const mockMessageHandler = jest.fn<unknown, [IncomingReqMessageEvent]>();
      memorelayClient.onEvent(IncomingReqMessageEvent, mockMessageHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['UNKNOWN', 12345],
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(false);

      await Promise.resolve();

      expect(mockMessageHandler).not.toHaveBeenCalled();
    });

    it('should emit an error when REQ message is malformed', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingReqMessages(hub);
      });

      const mockHandlerFn = jest.fn<unknown, [BadMessageErrorEvent]>();
      memorelayClient.onEvent(BadMessageErrorEvent, mockHandlerFn);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['REQ'], // Omit required subscription id.
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
