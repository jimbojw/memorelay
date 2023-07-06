/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Union type of events emitted at the relay level.
 */

import { MemorelayHub } from '../../core/lib/memorelay-hub';
import { BasicEvent, BasicEventOptions } from './basic-event';

export type RelayEventOptions = BasicEventOptions<MemorelayHub>;

export class RelayEvent<
  EventType extends string = string,
  DetailsType = unknown
> extends BasicEvent<EventType, DetailsType, MemorelayHub> {}
