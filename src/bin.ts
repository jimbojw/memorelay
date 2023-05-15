/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Entry point for Memorelay server (bin file).
 */

import * as rawPackageJson from '../package.json';
import { JSONSchemaForNPMPackageJsonFiles2 } from '@schemastore/package';
const packageJson = rawPackageJson as JSONSchemaForNPMPackageJsonFiles2;

import { MemorelayServer } from './lib/memorelay-server';

import { program } from 'commander';
import { createLogger, format, transports } from 'winston';

if (!packageJson.name) {
  throw new Error('name field missing from package.json');
}

if (!packageJson.description) {
  throw new Error('description field missing from package.json');
}

if (!packageJson.version) {
  throw new Error('version field missing from package.json');
}

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version)
  .option('-p, --port <number>', 'TCP port on which to listen', '3000')
  .option('-l, --log-level <level>', 'Minimum log level to report', 'info');

program.parse();

const options = program.opts();

const portNumber = +options.port;
if (!Number.isFinite(portNumber)) {
  throw new Error(`invalid port number: ${options.port as string}`);
}

const LOG_LEVELS = [
  'error',
  'warn',
  'info',
  'http',
  'verbose',
  'debug',
  'silly',
];

const logLevel = options.logLevel as string;
if (!LOG_LEVELS.includes(logLevel)) {
  throw new Error(`unrecognized log level: '${logLevel}'`);
}

const logger = createLogger({
  transports: [new transports.Console({ level: logLevel })],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.splat(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp as string}] ${level}: ${message as string}`;
    })
  ),
});

const server = new MemorelayServer(portNumber, logger);

function reportErrorAndExit(error: unknown) {
  logger.log('error', error);
  process.exit(1);
}

function shutdownAndExit() {
  server
    .stop()
    .then((success) => {
      if (success) {
        return process.exit(0);
      }
      logger.log('warning', 'Server did not stop cleanly');
      process.exit(1);
    })
    .catch(reportErrorAndExit);
}

process.once('SIGBREAK', shutdownAndExit);
process.once('SIGINT', shutdownAndExit);
process.once('SIGTERM', shutdownAndExit);

server.listen().catch(reportErrorAndExit);
