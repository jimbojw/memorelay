/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendOKAfterBadEvent().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { BadMessageError } from '../../nip-0001-basic-protocol/errors/bad-message-error';
import { BadMessageErrorEvent } from '../../nip-0001-basic-protocol/events/bad-message-error-event';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';
import { sendOKAfterBadEvent } from './send-ok-after-bad-event-messages';

describe('sendOKAfterBadEvent()', () => {
  describe('#BadMessageErrorEvent', () => {
    it('should send an outgoing OK message event', async () => {
      const { memorelayClient } = setupTestHubAndClient();
      sendOKAfterBadEvent(memorelayClient);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('REASON'),
        badMessage: ['EVENT', { id: 'EVENT_ID' }],
      });
      memorelayClient.emitEvent(badMessageErrorEvent);

      expect(badMessageErrorEvent.defaultPrevented).toBe(true);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingOKMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(outgoingOKMessageEvent).toBeInstanceOf(OutgoingOKMessageEvent);
      expect(outgoingOKMessageEvent.parentEvent).toBe(badMessageErrorEvent);
      expect(outgoingOKMessageEvent.details.okMessage).toEqual([
        'OK',
        'EVENT_ID',
        false,
        'invalid: bad msg: REASON',
      ]);
    });

    it('should not send when defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient();
      sendOKAfterBadEvent(memorelayClient);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('REASON'),
        badMessage: ['EVENT', { id: 'EVENT_ID' }],
      });
      badMessageErrorEvent.preventDefault();
      memorelayClient.emitEvent(badMessageErrorEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });

    it('should send an outgoing OK even if EVENT lacks id', async () => {
      const { memorelayClient } = setupTestHubAndClient();
      sendOKAfterBadEvent(memorelayClient);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('REASON'),
        badMessage: ['EVENT', null],
      });
      memorelayClient.emitEvent(badMessageErrorEvent);

      expect(badMessageErrorEvent.defaultPrevented).toBe(true);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingOKMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(outgoingOKMessageEvent).toBeInstanceOf(OutgoingOKMessageEvent);
      expect(outgoingOKMessageEvent.parentEvent).toBe(badMessageErrorEvent);
      expect(outgoingOKMessageEvent.details.okMessage).toEqual([
        'OK',
        'undefined',
        false,
        'invalid: bad msg: REASON',
      ]);
    });

    it('should not send if not an EVENT message', async () => {
      const { memorelayClient } = setupTestHubAndClient();
      sendOKAfterBadEvent(memorelayClient);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('REASON'),
        badMessage: ['UNKNOWN'],
      });
      memorelayClient.emitEvent(badMessageErrorEvent);

      expect(badMessageErrorEvent.defaultPrevented).toBe(false);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });

    it('should not send if payload is not a generic message', async () => {
      const { memorelayClient } = setupTestHubAndClient();
      sendOKAfterBadEvent(memorelayClient);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('REASON'),
        badMessage: 'NOT_AN_OBJECT',
      });
      memorelayClient.emitEvent(badMessageErrorEvent);

      expect(badMessageErrorEvent.defaultPrevented).toBe(false);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
