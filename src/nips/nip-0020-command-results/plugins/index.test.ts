/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for commandResults().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { commandResults } from '.';

describe('commandResults()', () => {
  it('should be a plugin', () => {
    setupTestHubAndClient(commandResults);
  });
});
