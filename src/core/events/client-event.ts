/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Union type of events emitted at the client level.
 */

import { MemorelayClient } from '../lib/memorelay-client';
import { BasicEvent, BasicEventOptions } from './basic-event';

export type ClientEventOptions = BasicEventOptions<MemorelayClient>;

export class ClientEvent<
  EventType extends string = string,
  DetailsType = unknown
> extends BasicEvent<EventType, DetailsType, MemorelayClient> {}
