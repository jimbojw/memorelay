# memorelay

In-memory Nostr relay implementing NIP-01.

## Why use memorelay?

This relay implementation has NO persistent storage. When the server is shut
down (or crashes) all event data goes with it.

Why would you want a relay with no persistence?

- For testing (all data is throw-away anyway).
- For ephemeral communications (persistence is undesirable).
- For speed (starts up fast, no database/file system lag)

If you need persistence, then you'll probably be happier with a more full-featured relay implementation like [nostream](https://github.com/Cameri/nostream).

## Installing and Running

Local install:

```sh
npm install memorelay
```

Run locally through `npx`:

```sh
npx memorelay
```

Alternative global install:

```sh
npm install --global memorelay
```

If installed globally, call `memorelay` directly:

```sh
memorelay
```

To stop the server from running, type `Ctrl-C` to send an interrupt signal to
the process.

## Command-line Options

To see the `memorelay` command options, invoke it with the `--help` flag:

```sh
$ npx memorelay --help
Usage: memorelay [options]

In-memory Nostr relay.

Options:
  -V, --version            output the version number
  -p, --port <number>      TCP port on which to listen (default: "3000")
  -l, --log-level <level>  Minimum log level to report (default: "info")
  -h, --help               display help for command
```

## Using with Node.js HTTP Server

To use memorelay in your TypeScript project with Node's built-in HTTP server:

```ts
import { Memorelay } from 'memorelay';

const memorelay = new Memorelay().connect();
const httpServer = createServer(memorelay.handleRequest());
httpServer.on('upgrade', memorelay.handleUpgrade());
httpServer.listen({ port: 3000 });
```

Note: the `.connect()` call is mandatory. Without that, your memorelay instance
won't listen for any events. This is to give your plugins a chance to attach
listeners first.

## Using with Express

To use memorelay in your TypeScript project with an Express server:

```ts
import { Memorelay } from 'memorelay';

const memorelay = new Memorelay().connect();
const app = express();
app.use('/', memorelay.handleRequest());
const server = app.listen(3000);
server.on('upgrade', memorelay.handleUpgrade());
```

Note: the `.connect()` call is mandatory. Without that, your memorelay instance
won't listen for any events. This is to give your plugins a chance to attach
listeners first.

## Using plugins

Behaviors in memorelay are implemented through an event-based, plugin API. A
memorelay plugin is a function which attaches event listeners.

Plugin should be generally be added to the constructor, or at least attach their
listeners _before_ you call `.connect()`. This way, plugins' event listeners are
earlier in the stack and will have a chance to call events' `.preventDefault()`
methods to stop other functionality if desired.

Example that adds the plugin to the constructor:

```ts
import { examplePluginFn } from './example-plugin.ts';

const memorelay = new Memorelay(examplePluginFn).connect();
```

Example that adds listeners before calling `.connect()`:

```ts
import { examplePluginFn } from './example-plugin.ts';

const memorelay = new Memorelay();

examplePluginFn(memorelay);

memorelay.connect();
```

The advantage to providing the plugin functions to the constructor is that
they'll be automatically removed if you call the memorelay's `.disconnect()`
method. Using the later example above, the example plugin's listeners would
still be attached, even after disconnect.

## Developing

To develop, start by forking the repo, then check out your fork locally. From
there, you can run the development server, run tests, lint, build and package
the code.

### Conventions

This is an opinionated codebase. To wit:

- The TypeScript configuration ([`tsconfig.json`](./tsconfig.json)) and ESLint configuration ([`.eslintrc.js`](./.eslintrc.js)) are strict.
- The [Jest](https://jestjs.io/)-based unit tests are extensive.
- Code format is enforced by [Prettier](https://prettier.io/).
- Code license headers are checked by [check-license-header](https://github.com/viperproject/check-license-header).
- Commits adhere to [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) guidelines.
- Versions follow [semantic versioning](https://semver.org/) and are handled automatically by semantic-release.
- All code conventions, tests and build steps are run on each push to GitHub by [GitHub Actions](https://docs.github.com/en/actions).

The purpose of all this automation and specification is to reduce the likelihood
of errors. More about each of these in the sections that follow.

### Environment

Visual Studio Code is the recommended IDE for this project because it
understands TypeScript by default and offers plugins which can aid conformance
to conventions.

Recommended plugins:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Checks for ESLint errors.
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Applies code formatting on save.

Having said that, you're welcomed to use whatever IDE or programming environment
you like.

### Running a Dev Server

Next, run `npm clean-install` to download all dependencies.

To run locally, you have two options:

- `npm start` - Uses [ts-node](https://www.npmjs.com/package/ts-node) to run the current code once.
- `npm run start:dev` - Uses [nodemon](https://www.npmjs.com/package/nodemon) to watch for code changes and restart the server automatically.

Since memorelay has no persistence, every time it restarts it will forget all
events it had learned. For that reason you may prefer the former, as it will not
restart automatically.

### Testing

To run unit tests, you have two options:

- `npm test` - Run [jest](https://jestjs.io/) unit tests once.
- `npm run test:dev` - Run tests continuously, rerunning with each code change.

Since unit tests are stateless, the later invocation is typically preferred.

### Linting

This project uses [ESLint](https://eslint.org/) to enforce code style. To run:

```sh
npm run lint
```

If there are no lint errors, the command will produce no output.

If a word is misspelled, you'll see a Warning. If the word is spelled correctly,
but is still identified as a misspelling, then you can add the word to the
`skipWords` constant at the head of the `.eslintrc` file:

```ts
const skipWords = `
dotenv ecma fileoverview fs lang jsx memorelay microtask msg nostr printf pubkey
readonly req sig tsconfig tsx unparseable utf ws wss
`.match(/\w+/g);
```

### Code Style

This project defines and checks code style with Prettier. To run the prettier
checks, use `npm run prettier`. This will show which files, if any, have style
violations.

### Check Licenses

Source code for memorelay is released under the [Apache 2.0
license](https://spdx.org/licenses/Apache-2.0.html). Each source code file MUST
include an [SPDX](https://spdx.dev/) license header like this:

```ts
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
```

To check whether all source files have such a header, run `npm run
check-licenses`. The output will tell you if there are any files missing the
header.

### Building

Currently, building only means generating the TypeScript definition files from
the source code (see [issue #7](https://github.com/jimbojw/memorelay/issues/7)).

Nevertheless, you can run the TypeScript compiler (`tsc`) via the command `npm
run build`.

### Packaging

In some cases, you may need to test the behavior of the packaged binary.

First, run `npm run package`. This will update the files under `./dist/bin`.
Then you can run the distributable binary with this command:

```sh
node ./dist/bin/index.js
```

Note: DO NOT commit your updated dist files. These will be updated automatically by semantic-release.

### Committing

Commits to the memorelay codebase should follow the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The `<type>` should be one of the types specified by the [Angular Commit Message
Format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format):

- build: Changes that affect the build system or external dependencies.
- ci: Changes to our CI configuration files and scripts (semantic-release, GitHub Actions).
- docs: Documentation only changes.
- feat: A new feature.
- fix: A bug fix.
- perf: A code change that improves performance.
- refactor: A code change that neither fixes a bug nor adds a feature.
- test: Adding missing tests or correcting existing tests.

The `<description>` should be a sentence describing the change (capitalized
first word, trailing punctuation).

For example, if you fixed a bug in the way reaction events are handled, your
commit message might look like this:

```
git commit -m "fix: Corrected reaction event handling (kind=6)."
```

Our release process uses these commit messages to determine the next version
number and to automatically generate the release `CHANGELOG.md` file. So it's
important that your commit messages are clear and meaningful.

### Continuous Integration and Release

This project uses
[semantic-release](https://semantic-release.gitbook.io/semantic-release/) to
automate releases based on commits. The Release workflow
([`release.yml`](./.github/workflows/release.yml)) is invoked by GitHub Actions
whenever code is pushed to the `main` branch.

Pushing to the `main` branch should only be done by pull request, OR by
semantic-release's automated commits. Pull requests should be merged normally
and NOT squashed.

In addition to the Release workflow, there's a Dev workflow
([`dev.yml`](./.github/workflows/dev.yml)). It performs all the same
steps--running tests, build, linter, etc.--except that it does not push to npm.

Using semantic-release to push code back to GitHub and deliverables to npm
requires authentication tokens. These tokens may have expiration dates, and so
it's possible for the automated releases to fail due to token expiration.

You can find the token menu under Settings -> Security -> Secrets and variables
-> Actions.

## LICENSE

Source code is released under the [Apache 2.0 license](./LICENSE).
