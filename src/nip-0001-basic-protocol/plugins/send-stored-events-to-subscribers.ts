/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for sending stored events to subscribers.
 */

import { MemorelayClientCreatedEvent } from '../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../core/lib/memorelay-hub';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { BroadcastEventMessageEvent } from '../events/broadcast-event-message-event';
import { Handler } from '../../experimental/types/handler';
import { MemorelayClientDisconnectEvent } from '../../core/events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../core/lib/clear-handlers';
import { EventsDatabase } from '../lib/events-database';
import { OutgoingEventMessageEvent } from '../events/outgoing-event-message-event';
import { OutgoingEOSEMessageEvent } from '../events/outgoing-eose-message-event';

/**
 * Memorelay core plugin for sending stored events to incoming subscribers. Note
 * that this plugin does not handle later, live events. It only handles sending
 * previously stored events.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function sendStoredEventsToSubscribers(hub: MemorelayHub): Handler {
  const eventsDatabase = new EventsDatabase();

  const hubHandlers: Handler[] = [];

  hubHandlers.push(
    // Add every broadcasted event to the events database.
    hub.onEvent(
      BroadcastEventMessageEvent,
      (broadcastEventMessageEvent: BroadcastEventMessageEvent) => {
        queueMicrotask(() => {
          if (broadcastEventMessageEvent.defaultPrevented) {
            return; // Preempted by another listener.
          }
          const event =
            broadcastEventMessageEvent.details.clientEventMessage[1];
          if (eventsDatabase.hasEvent(event.id)) {
            return; // Ignore seen events.
          }
          eventsDatabase.addEvent(event);
        });
      }
    ),

    // Listen for connected clients to subscribe.
    hub.onEvent(
      MemorelayClientCreatedEvent,
      ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
        const handlers: Handler[] = [];
        handlers.push(
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
          ),

          // Clean up on disconnect.
          memorelayClient.onEvent(
            MemorelayClientDisconnectEvent,
            clearHandlers(handlers)
          )
        );
      }
    )
  );

  return { disconnect: clearHandlers(hubHandlers) };
}
