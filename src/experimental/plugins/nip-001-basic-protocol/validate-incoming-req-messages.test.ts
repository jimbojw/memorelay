/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingReqMessages().
 */

import { validateIncomingReqMessages } from './validate-incoming-req-messages';
import { IncomingGenericMessageEvent } from '../../events/incoming-generic-message-event';
import { setupHubAndMemorelayClient } from '../../test/setup-hub-and-memorelay-client';
import { IncomingReqMessageEvent } from '../../events/incoming-req-message-event';
import { BadMessageError } from '../../errors/bad-message-error';

describe('validateIncomingReqMessages()', () => {
  it('should validate and re-emit a REQ message', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingReqMessages(hub);
    });

    const mockMessageHandler = jest.fn<unknown, [IncomingReqMessageEvent]>();
    memorelayClient.onEvent(IncomingReqMessageEvent.type, mockMessageHandler);

    const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
      genericMessage: ['REQ', 'SUBSCRIPTION_ID'],
    });
    memorelayClient.emitEvent(incomingGenericMessageEvent);

    expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

    expect(mockMessageHandler.mock.calls).toHaveLength(1);
    const incomingReqMessageEvent = mockMessageHandler.mock.calls[0][0];
    expect(incomingReqMessageEvent).toBeInstanceOf(IncomingReqMessageEvent);
    expect(incomingReqMessageEvent.details.reqMessage).toEqual([
      'REQ',
      'SUBSCRIPTION_ID',
    ]);
  });

  it('should ignore a REQ message if defaultPrevented', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingReqMessages(hub);
    });

    const mockMessageHandler = jest.fn<unknown, [IncomingReqMessageEvent]>();
    memorelayClient.onEvent(IncomingReqMessageEvent.type, mockMessageHandler);

    const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
      genericMessage: ['REQ', 'IGNORE_ME'],
    });
    incomingGenericMessageEvent.preventDefault();
    memorelayClient.emitEvent(incomingGenericMessageEvent);

    expect(mockMessageHandler.mock.calls).toHaveLength(0);
  });

  it('should ignore non-REQ messages', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingReqMessages(hub);
    });

    const mockMessageHandler = jest.fn<unknown, [IncomingReqMessageEvent]>();
    memorelayClient.onEvent(IncomingReqMessageEvent.type, mockMessageHandler);

    const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
      genericMessage: ['UNKNOWN', 12345],
    });
    memorelayClient.emitEvent(incomingGenericMessageEvent);

    expect(incomingGenericMessageEvent.defaultPrevented).toBe(false);

    expect(mockMessageHandler.mock.calls).toHaveLength(0);
  });

  it('should emit an error when REQ message is malformed', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingReqMessages(hub);
    });

    const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
    memorelayClient.onError(BadMessageError.type, mockErrorHandler);

    const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
      genericMessage: ['REQ'], // Omit required subscription id.
    });
    memorelayClient.emitEvent(incomingGenericMessageEvent);

    expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

    expect(mockErrorHandler.mock.calls).toHaveLength(1);
    const badMessageError = mockErrorHandler.mock.calls[0][0];
    expect(badMessageError).toBeInstanceOf(BadMessageError);
  });
});
