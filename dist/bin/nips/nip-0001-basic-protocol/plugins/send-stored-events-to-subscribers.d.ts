/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for sending stored events to subscribers.
 */
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { EventsDatabase } from '../lib/events-database';
import { PluginFn } from '../../../core/types/plugin-types';
/**
 * Memorelay plugin for sending stored events to incoming subscribers. Note that
 * this plugin does not handle later, live events. It only handles sending
 * previously stored events.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export declare function sendStoredEventsToSubscribers(eventsDatabase: EventsDatabase): PluginFn<MemorelayHub>;
