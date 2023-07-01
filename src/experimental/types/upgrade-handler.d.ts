/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Handler for an HTTP-to-WebSocket upgrade request.
 */

import { IncomingMessage } from 'http';
import { Socket } from 'net';

/**
 * Handler for an 'upgrade' event, which signals that a connected HTTP client is
 * requesting to upgrade the connection to a WebSocket.
 */
export type UpgradeHandler = (
  incomingMessage: IncomingMessage,
  socket: Socket,
  head: Buffer
) => void;
