/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Union type of events emitted at the client level.
 */

import { BasicEvent } from './basic-event';

export class ClientEvent<
  EventType extends string = string,
  DetailsType = unknown
> extends BasicEvent<EventType, DetailsType> {}
