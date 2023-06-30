/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Basic Event to be extended for different purposes.
 */

/**
 * Base class from which more specific Memorelay events inherit.
 */
export class BasicEvent {
  /**
   * Whether any recipient has called preventDefault();
   */
  private isDefaultPrevented = false;

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
