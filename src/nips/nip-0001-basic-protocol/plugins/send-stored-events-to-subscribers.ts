/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for sending stored events to subscribers.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { BroadcastEventMessageEvent } from '../events/broadcast-event-message-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { clearHandlers } from '../../../core/lib/clear-handlers';
import { EventsDatabase } from '../lib/events-database';
import { OutgoingEventMessageEvent } from '../events/outgoing-event-message-event';
import { OutgoingEOSEMessageEvent } from '../events/outgoing-eose-message-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';

/**
 * Memorelay plugin for sending stored events to incoming subscribers. Note that
 * this plugin does not handle later, live events. It only handles sending
 * previously stored events.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function sendStoredEventsToSubscribers(
  hub: MemorelayHub
): Disconnectable {
  const eventsDatabase = new EventsDatabase();

  const hubHandlers: Disconnectable[] = [];

  hubHandlers.push(
    // Add every broadcasted event to the events database.
    hub.onEvent(
      BroadcastEventMessageEvent,
      (broadcastEventMessageEvent: BroadcastEventMessageEvent) => {
        if (broadcastEventMessageEvent.defaultPrevented) {
          return; // Preempted by another listener.
        }

        const event = broadcastEventMessageEvent.details.clientEventMessage[1];

        if (eventsDatabase.hasEvent(event.id)) {
          // NOTE: In is not necessary to do more here than simply ignore the
          // duplicate event. Other plugins will take additional steps.
          return;
        }

        eventsDatabase.addEvent(event);
      }
    ),

    // Listen for connected clients to subscribe.
    hub.onEvent(
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
    )
  );

  return { disconnect: clearHandlers(hubHandlers) };
}
