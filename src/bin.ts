/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Entry point for Memorelay server (bin file).
 */

import { createLogger, format, transports } from 'winston';
import { program } from 'commander';
import { createServer } from 'http';
import { AddressInfo } from 'net';

import { Memorelay } from './memorelay';
import { LoggingPlugin } from './contrib/logging/logging-plugin';
import { readPackageJson } from './lib/package-json';

const packageJson = readPackageJson();

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
  .option('-l, --log-level <level>', 'minimum log level to report', 'info')
  .option('--no-color', 'disable colorized log output');

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

const formatOptions = [
  format.timestamp(),
  format.splat(),
  format.printf(({ timestamp, level, message }) => {
    return `[${timestamp as string}] ${level}: ${message as string}`;
  }),
];

if (options.color) {
  formatOptions.unshift(format.colorize());
}

const logger = createLogger({
  transports: [new transports.Console({ level: logLevel })],
  format: format.combine(...formatOptions),
});

logger.log('debug', `Logging at log level: ${logLevel}`);

const memorelay = new Memorelay();

new LoggingPlugin({ logger, memorelay }).connect();

memorelay.connect();

const httpServer = createServer(memorelay.handleRequest());

httpServer.on('upgrade', memorelay.handleUpgrade());

function reportErrorAndExit(error: unknown) {
  logger.log('error', error);
  process.exit(1);
}

httpServer.on('error', reportErrorAndExit);

function shutdownAndExit(signalName: string) {
  logger.log('info', `${signalName} signal received, stopping...`);
  httpServer.closeAllConnections();
  httpServer.close();
  process.exit(0);
}

process.once('SIGBREAK', shutdownAndExit);
process.once('SIGINT', shutdownAndExit);
process.once('SIGTERM', shutdownAndExit);

httpServer.listen({ port: portNumber }, () => {
  const listeningPort = (httpServer.address() as AddressInfo).port;
  logger.log('info', `Memorelay listening on port ${listeningPort}`);
});
