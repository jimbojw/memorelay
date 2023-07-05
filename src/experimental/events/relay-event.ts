/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Union type of events emitted at the relay level.
 */

import { BasicEvent } from './basic-event';

export class RelayEvent<
  EventType extends string = string,
  DetailsType = unknown
> extends BasicEvent<EventType, DetailsType> {}
