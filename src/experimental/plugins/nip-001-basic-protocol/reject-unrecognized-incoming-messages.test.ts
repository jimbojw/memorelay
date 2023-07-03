/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingReqMessages().
 */

import { rejectUnrecognizedIncomingMessages } from './reject-unrecognized-incoming-messages';
import { IncomingGenericMessageEvent } from '../../events/incoming-generic-message-event';
import { setupHubAndMemorelayClient } from '../../test/setup-hub-and-memorelay-client';
import { BadMessageError } from '../../errors/bad-message-error';

describe('validateIncomingReqMessages()', () => {
  it('should ignore known message types', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      rejectUnrecognizedIncomingMessages(hub);
    });

    const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
    memorelayClient.onError(BadMessageError.type, mockErrorHandler);

    memorelayClient.emitEvent(
      new IncomingGenericMessageEvent({
        genericMessage: ['EVENT', 'IGNORE_ME'],
      })
    );
    memorelayClient.emitEvent(
      new IncomingGenericMessageEvent({
        genericMessage: ['REQ', 'IGNORE_ME'],
      })
    );
    memorelayClient.emitEvent(
      new IncomingGenericMessageEvent({
        genericMessage: ['CLOSE', 'IGNORE_ME'],
      })
    );

    expect(mockErrorHandler.mock.calls).toHaveLength(0);
  });

  it('should ignore events with defaultPrevented', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      rejectUnrecognizedIncomingMessages(hub);
    });

    const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
    memorelayClient.onError(BadMessageError.type, mockErrorHandler);

    const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
      genericMessage: ['BAD_MESSAGE'],
    });
    incomingGenericMessageEvent.preventDefault();
    memorelayClient.emitEvent(incomingGenericMessageEvent);

    expect(mockErrorHandler.mock.calls).toHaveLength(0);
  });

  it('should emit an error when message type is unrecognized', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      rejectUnrecognizedIncomingMessages(hub);
    });

    const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
    memorelayClient.onError(BadMessageError.type, mockErrorHandler);

    const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
      genericMessage: ['UNKNOWN_TYPE'],
    });
    memorelayClient.emitEvent(incomingGenericMessageEvent);

    expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

    expect(mockErrorHandler.mock.calls).toHaveLength(1);
    const badMessageError = mockErrorHandler.mock.calls[0][0];
    expect(badMessageError).toBeInstanceOf(BadMessageError);
  });
});