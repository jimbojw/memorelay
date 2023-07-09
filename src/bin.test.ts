/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Integration tests for binary (entry point bin.ts).
 */

import {
  RelayEOSEMessage,
  RelayEventMessage,
} from './nips/nip-0001-basic-protocol/types/message-types';
import { BinTestHarness } from './test/bin-test-harness';
import { createSignedTestEvent } from './test/signed-test-event';

describe('bin.ts', () => {
  it.concurrent('should send stored events', async () => {
    const harness = new BinTestHarness();
    await harness.setup();

    const testEvent = createSignedTestEvent({ content: 'HELLO WORLD' });

    // Send a test event to store.
    const senderWebSocket = await harness.openWebSocket();
    senderWebSocket.send(
      Buffer.from(JSON.stringify(['EVENT', testEvent]), 'utf-8')
    );

    // Request all events.
    const receiverWebSocket = await harness.openWebSocket();
    const eventMessage = await new Promise((resolve) => {
      receiverWebSocket
        .on('message', (buffer: Buffer) => {
          resolve(JSON.parse(buffer.toString('utf-8')) as RelayEventMessage);
        })
        .send(Buffer.from(JSON.stringify(['REQ', 'SUBSCRIPTION_ID']), 'utf-8'));
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
          resolve(JSON.parse(buffer.toString('utf-8')) as RelayEOSEMessage);
        })
        .send(Buffer.from(JSON.stringify(['REQ', 'SUBSCRIPTION_ID']), 'utf-8'));
    });

    expect(eoseMessage).toEqual(['EOSE', 'SUBSCRIPTION_ID']);

    receiverWebSocket.removeAllListeners();

    const receiverPromise = new Promise((resolve) => {
      receiverWebSocket.on('message', (buffer: Buffer) => {
        resolve(JSON.parse(buffer.toString('utf-8')) as RelayEventMessage);
      });
    });

    // Send a test event to store.
    const senderWebSocket = await harness.openWebSocket();
    senderWebSocket.send(
      Buffer.from(JSON.stringify(['EVENT', testEvent]), 'utf-8')
    );

    const eventMessage = await receiverPromise;

    expect(eventMessage).toEqual(['EVENT', 'SUBSCRIPTION_ID', testEvent]);

    await harness.teardown();
  });
});
