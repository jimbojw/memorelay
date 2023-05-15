/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Find, read and return the contents of the project's shipped
 * package.json file.
 */
import { JSONSchemaForNPMPackageJsonFiles2 } from '@schemastore/package';
/**
 * The path to the package.json file is the same in both dev mode and packaged
 * mode because the files exist at the same depth relative to the project root.
 *
 * - Dev mode (this file): ./src/lib/package-json.ts
 * - Prod mode (packaged): ./dist/bin/index.js
 *
 * If this code is ever moved to a different directory depth, then the logic
 * will need to be updated to reflect the potentially different relative path to
 * package.json.
 */
export declare const PACKAGE_JSON_PATH: string;
/**
 * Find the project's package.json file, read it, and return the contents. This
 * function uses synchronous file system access because it is intended to run
 * once at the outset of the service.
 * @returns The package.json file contents.
 */
export declare function readPackageJson(): JSONSchemaForNPMPackageJsonFiles2;
