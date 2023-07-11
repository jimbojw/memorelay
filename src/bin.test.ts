/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Integration tests for binary (entry point bin.ts).
 */

import { bufferToGenericMessage } from './nips/nip-0001-basic-protocol/lib/buffer-to-generic-message';
import { objectToJsonBuffer } from './nips/nip-0001-basic-protocol/lib/object-to-json-buffer';
import { RelayEOSEMessage } from './nips/nip-0001-basic-protocol/types/relay-eose-message';
import { RelayEventMessage } from './nips/nip-0001-basic-protocol/types/relay-event-message';
import { BinTestHarness } from './test/bin-test-harness';
import { createSignedTestEvent } from './test/signed-test-event';

describe('bin.ts', () => {
  it.concurrent('should send stored events', async () => {
    const harness = new BinTestHarness();
    await harness.setup();

    const testEvent = createSignedTestEvent({ content: 'HELLO WORLD' });

    // Send a test event to store.
    const senderWebSocket = await harness.openWebSocket();
    senderWebSocket.send(objectToJsonBuffer(['EVENT', testEvent]));

    // Request all events.
    const receiverWebSocket = await harness.openWebSocket();
    const eventMessage = await new Promise((resolve) => {
      receiverWebSocket
        .on('message', (buffer: Buffer) => {
          resolve(bufferToGenericMessage(buffer) as RelayEventMessage);
        })
        .send(objectToJsonBuffer(['REQ', 'SUBSCRIPTION_ID']));
    });

    expect(eventMessage).toEqual(['EVENT', 'SUBSCRIPTION_ID', testEvent]);

    await harness.teardown();
  });

  it.concurrent('should broadcast incoming events', async () => {
    const harness = new BinTestHarness();
    await harness.setup();

    const testEvent = createSignedTestEvent({ content: 'HELLO WORLD' });

    // Receiver subscribes all events.
    const receiverWebSocket = await harness.openWebSocket();
    const eoseMessage = await new Promise((resolve) => {
      receiverWebSocket
        .on('message', (buffer: Buffer) => {
          resolve(bufferToGenericMessage(buffer) as RelayEOSEMessage);
        })
        .send(objectToJsonBuffer(['REQ', 'SUBSCRIPTION_ID']));
    });

    expect(eoseMessage).toEqual(['EOSE', 'SUBSCRIPTION_ID']);

    receiverWebSocket.removeAllListeners();

    const receiverPromise = new Promise((resolve) => {
      receiverWebSocket.on('message', (buffer: Buffer) => {
        resolve(bufferToGenericMessage(buffer) as RelayEventMessage);
      });
    });

    // Send a test event to store.
    const senderWebSocket = await harness.openWebSocket();
    senderWebSocket.send(objectToJsonBuffer(['EVENT', testEvent]));

    const eventMessage = await receiverPromise;

    expect(eventMessage).toEqual(['EVENT', 'SUBSCRIPTION_ID', testEvent]);

    await harness.teardown();
  });
});
