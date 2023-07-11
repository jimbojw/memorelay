/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin to store incoming events to the database.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { EventsDatabase } from '../lib/events-database';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';
import { WillAddEventToDatabaseEvent } from '../events/will-add-event-to-database-event';
import { DidAddEventToDatabaseEvent } from '../events/did-add-event-to-database-event';
import { IncomingEventMessageEvent } from '../events/incoming-event-message-event';
import { PluginFn } from '../../../core/types/plugin-types';

/**
 * Memorelay plugin for storing incoming events.
 * @param eventsDatabase Shared database of events.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function storeIncomingEventsToDatabase(
  eventsDatabase: EventsDatabase
): PluginFn {
  return (hub: MemorelayHub) => {
    return hub.onEvent(
      MemorelayClientCreatedEvent,
      ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
        autoDisconnect(
          memorelayClient,

          // Upgrade incoming message event to a WillAddEventToDatabaseEvent.
          memorelayClient.onEvent(
            IncomingEventMessageEvent,
            (incomingEventMessageEvent: IncomingEventMessageEvent) => {
              if (incomingEventMessageEvent.defaultPrevented) {
                return; // Preempted by another listener.
              }

              const event =
                incomingEventMessageEvent.details.clientEventMessage[1];

              queueMicrotask(() => {
                if (!eventsDatabase.hasEvent(event.id)) {
                  memorelayClient.emitEvent(
                    new WillAddEventToDatabaseEvent(
                      { event },
                      {
                        parentEvent: incomingEventMessageEvent,
                        targetEmitter: memorelayClient,
                      }
                    )
                  );
                }
              });
            }
          ),

          // Add event to database.
          memorelayClient.onEvent(
            WillAddEventToDatabaseEvent,
            (willAddEventToDatabaseEvent: WillAddEventToDatabaseEvent) => {
              if (willAddEventToDatabaseEvent.defaultPrevented) {
                return; // Preempted by another listener.
              }
              willAddEventToDatabaseEvent.preventDefault();
              const { event } = willAddEventToDatabaseEvent.details;
              if (!eventsDatabase.hasEvent(event.id)) {
                eventsDatabase.addEvent(event);
                queueMicrotask(() => {
                  memorelayClient.emitEvent(
                    new DidAddEventToDatabaseEvent(
                      { event },
                      {
                        parentEvent: willAddEventToDatabaseEvent,
                        targetEmitter: memorelayClient,
                      }
                    )
                  );
                });
              }
            }
          )
        );
      }
    );
  };
}
