/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for generalizeOutgoingOKMessages().
 */

import { generalizeOutgoingOKMessages } from './generalize-outgoing-ok-messages';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';

describe('generalizeOutgoingOKMessages()', () => {
  describe('#OutgoingOKMessageEvent', () => {
    it('should send an outgoing generic message event', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        generalizeOutgoingOKMessages
      );

      const mockHandlerFn = jest.fn<unknown, [OutgoingGenericMessageEvent]>();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockHandlerFn);

      const outgoingOKMessageEvent = new OutgoingOKMessageEvent({
        okMessage: ['OK', 'EVENT_ID', true, 'EXPLANATION'],
      });
      memorelayClient.emitEvent(outgoingOKMessageEvent);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingGenericMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(outgoingGenericMessageEvent).toBeInstanceOf(
        OutgoingGenericMessageEvent
      );
      expect(outgoingGenericMessageEvent.parentEvent).toBe(
        outgoingOKMessageEvent
      );
    });

    it('should not send when default prevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        generalizeOutgoingOKMessages
      );

      const mockHandlerFn = jest.fn<unknown, [OutgoingGenericMessageEvent]>();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockHandlerFn);

      const outgoingOKMessageEvent = new OutgoingOKMessageEvent({
        okMessage: ['OK', 'EVENT_ID', true, 'EXPLANATION'],
      });
      outgoingOKMessageEvent.preventDefault();
      memorelayClient.emitEvent(outgoingOKMessageEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
