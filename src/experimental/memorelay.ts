/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay entry point.
 */

import { NextFunction, Request, RequestHandler, Response } from 'express';
import { RelayInformationDocument } from '../lib/relay-information-document';

export class Memorelay {
  /**
   * Return the NIP-11 relay information document.
   * @see https://github.com/nostr-protocol/nips/blob/master/11.md
   */
  getRelayDocument(): RelayInformationDocument {
    return {
      supported_nips: [1, 9, 11, 20],
    };
  }

  /**
   * Return a bound Express middleware function for handling NIP-11 Nostr relay
   * document requests.
   *
   * Usage:
   *
   *   const memorelay = new Memorelay();
   *   const app = express();
   *   app.use('/', memorelay.sendRelayDocument());
   *
   * @see https://github.com/nostr-protocol/nips/blob/master/11.md
   * @return Express request handler.
   */
  sendRelayDocument(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'OPTIONS') {
        if (req.header('Access-Control-Request-Headers')) {
          // TODO(jimbo): Should the list of allowed headers be restricted?
          res.set('Access-Control-Allow-Headers', '*');
        }
        res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.set('Access-Control-Allow-Origin', '*');
        next();
        return;
      }

      if (req.header('Accept') !== 'application/nostr+json') {
        next();
        return;
      }

      if (req.method !== 'HEAD' && req.method !== 'GET') {
        res
          .status(501)
          .send({ error: `Method not implemented: ${req.method}` });
        next();
        return;
      }

      res.set('Access-Control-Allow-Headers', '*');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.set('Content-Type', 'application/nostr+json');

      res.status(200);
      res.send(this.getRelayDocument());
    };
  }
}
