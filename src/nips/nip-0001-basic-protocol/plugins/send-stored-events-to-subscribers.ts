/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for sending stored events to subscribers.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { EventsDatabase } from '../lib/events-database';
import { OutgoingEventMessageEvent } from '../events/outgoing-event-message-event';
import { OutgoingEOSEMessageEvent } from '../events/outgoing-eose-message-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';
import { PluginFn } from '../../../core/types/plugin-types';

/**
 * Memorelay plugin for sending stored events to incoming subscribers. Note that
 * this plugin does not handle later, live events. It only handles sending
 * previously stored events.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function sendStoredEventsToSubscribers(
  eventsDatabase: EventsDatabase
): PluginFn<MemorelayHub> {
  return (hub: MemorelayHub) => {
    return hub.onEvent(
      MemorelayClientCreatedEvent,
      ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
        autoDisconnect(
          memorelayClient,

          // Subscribe on incoming REQ event.
          memorelayClient.onEvent(
            IncomingReqMessageEvent,
            (incomingReqMessageEvent: IncomingReqMessageEvent) => {
              if (
                incomingReqMessageEvent.originatorTag ===
                sendStoredEventsToSubscribers
              ) {
                return; // Ignore self-emitted events.
              }

              if (incomingReqMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
              }

              incomingReqMessageEvent.preventDefault();

              const [, subscriptionId, ...filters] =
                incomingReqMessageEvent.details.reqMessage;

              const matchingEvents = eventsDatabase.matchFilters(filters);
              for (const matchingEvent of matchingEvents) {
                queueMicrotask(() => {
                  memorelayClient.emitEvent(
                    new OutgoingEventMessageEvent(
                      {
                        relayEventMessage: [
                          'EVENT',
                          subscriptionId,
                          matchingEvent,
                        ],
                      },
                      {
                        parentEvent: incomingReqMessageEvent,
                        targetEmitter: memorelayClient,
                      }
                    )
                  );
                });
              }

              queueMicrotask(() => {
                memorelayClient.emitEvent(
                  new OutgoingEOSEMessageEvent(
                    {
                      relayEOSEMessage: ['EOSE', subscriptionId],
                    },
                    {
                      parentEvent: incomingReqMessageEvent,
                      targetEmitter: memorelayClient,
                    }
                  )
                );
              });

              queueMicrotask(() => {
                memorelayClient.emitEvent(
                  new IncomingReqMessageEvent(incomingReqMessageEvent.details, {
                    originatorTag: sendStoredEventsToSubscribers,
                    parentEvent: incomingReqMessageEvent,
                    targetEmitter: memorelayClient,
                  })
                );
              });
            }
          )
        );
      }
    );
  };
}
