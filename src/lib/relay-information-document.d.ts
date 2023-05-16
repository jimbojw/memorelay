/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Specification for the NIP-11 Relay Information Document.
 */

/**
 * @see https://github.com/nostr-protocol/nips/blob/master/11.md
 */
export interface RelayInformationDocument {
  /**
   * String identifying relay.
   */
  name?: string;

  /**
   * String with detailed information.
   */
  description?: string;

  /**
   * Administrative contact pubkey.
   */
  pubkey?: string;

  /**
   * Administrative alternate contact (such as an email address).
   */
  contact?: string;

  /**
   * A list of NIP numbers supported by the relay.
   */
  supported_nips?: number[];

  /**
   * String identifying relay software URL.
   */
  software?: string;

  /**
   * Software version identifier.
   */
  version?: string;
}
