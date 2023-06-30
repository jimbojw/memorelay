/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Basic Event to be extended for different purposes.
 */

/**
 * A Memorelay BasicEvent takes its design from the DOM native CustomEvent. It
 * supports basic DOM Event functionality such as preventDefault(), and carries
 * an arbitrary, optional payload object.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
export class BasicEvent<
  EventType extends string = string,
  DetailsType = unknown
> {
  /**
   * MUST MATCH EVENT TYPE.
   */
  static type: string;

  /**
   * Whether any recipient has called preventDefault();
   */
  private isDefaultPrevented = false;

  /**
   * @param type The name of the event, case-sensitive.
   * @param details Optional object containing information about this event.
   */
  constructor(readonly type: EventType, readonly details: DetailsType) {}

  /**
   * Same concept as the DOM standard Event's defaultPrevented getter.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/defaultPrevented
   */
  get defaultPrevented(): boolean {
    return this.isDefaultPrevented;
  }

  /**
   * Same concept as the DOM standard Event's preventDefault(). Recipient
   * handlers for this kind of event can call preventDefault() to stop the
   * natural subsequent behavior.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
   */
  preventDefault() {
    this.isDefaultPrevented = true;
  }
}
