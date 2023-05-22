# [1.8.0](https://github.com/jimbojw/memorelay/compare/v1.7.0...v1.8.0) (2023-05-22)


### Bug Fixes

* Adding 9 to the list of supported nips in the relay inforamtion document. ([27f344d](https://github.com/jimbojw/memorelay/commit/27f344d1d01ed843fe9984b14af364d62af36f4d))
* Return immediately after returning 501 for unimplemented HTTP methods. ([fd0fe5e](https://github.com/jimbojw/memorelay/commit/fd0fe5e4b9dd0441156f0686e60aaa7adf4aed02))


### Features

* Implementing NIP-09 event deletion. ([53eaafa](https://github.com/jimbojw/memorelay/commit/53eaafa234661b6d619058f46d940f447c7cc56e))

# [1.7.0](https://github.com/jimbojw/memorelay/compare/v1.6.1...v1.7.0) (2023-05-21)


### Features

* Adding --no-color command line option to disable colorized log output. ([aabb0f4](https://github.com/jimbojw/memorelay/commit/aabb0f4cb4d5ef200ae0693c13512e6ef6d45542))

## [1.6.1](https://github.com/jimbojw/memorelay/compare/v1.6.0...v1.6.1) (2023-05-21)


### Bug Fixes

* Rejecting filters with negative values for limit, since and until fields. ([c353681](https://github.com/jimbojw/memorelay/commit/c353681cb6ad47f83129530d5d69929daa2707f4))

# [1.6.0](https://github.com/jimbojw/memorelay/compare/v1.5.0...v1.6.0) (2023-05-16)


### Bug Fixes

* Responding to non-GET, non-HEAD requests with HTTP 501 Not Implemented. ([d3365e9](https://github.com/jimbojw/memorelay/commit/d3365e958bb50dc099e4d87d19efc5d33c0625f9))


### Features

* Implementing NIP-11. ([c5dae6f](https://github.com/jimbojw/memorelay/commit/c5dae6f5805b081e4182fb205f4c911f61952a9b))

# [1.5.0](https://github.com/jimbojw/memorelay/compare/v1.4.0...v1.5.0) (2023-05-15)


### Bug Fixes

* Reading package.json at runtime to work with auto-packaged releases. ([d80b1a1](https://github.com/jimbojw/memorelay/commit/d80b1a18f9c1063f20376bb894270152d363f796))


### Features

* Using Commander to implement --port and --log-level command line arguments. ([a3442f9](https://github.com/jimbojw/memorelay/commit/a3442f9719b5a1cae8bfa53065a908fba354e753))

# [1.4.0](https://github.com/jimbojw/memorelay/compare/v1.3.0...v1.4.0) (2023-05-15)


### Bug Fixes

* Unsubscribing from all subscriptions on WebSocket 'close'. ([531487f](https://github.com/jimbojw/memorelay/commit/531487f6334ca80f232bc5cd2d721cf3e1af2c46))


### Features

* Adding bufferToMessage() parsing function, related tests, integration into Subscriber. ([420e412](https://github.com/jimbojw/memorelay/commit/420e412363b752c1b9213621d09814686f5717a5))
* Adding event handling to Subscriber WebSockets. ([000535a](https://github.com/jimbojw/memorelay/commit/000535a6ca8eace5dbf3d447c3a6e219e00bb164))
* Adding placeholder bin file for eventual server implementation. ([4acf909](https://github.com/jimbojw/memorelay/commit/4acf90959003561ff7e50d47bacb6be79c4958b8))
* Beginning implementation of connec() method for MemorelayServer and related tests. ([56adee1](https://github.com/jimbojw/memorelay/commit/56adee192589d35896c9658575b2a407e39bf863))
* Implementing bin.ts command-line server. ([aa0a1d6](https://github.com/jimbojw/memorelay/commit/aa0a1d60060497a4e6b738ca8ecabe4050d78730))
* Implementing handleCloseMessage() for unsubscribing. ([5a831d9](https://github.com/jimbojw/memorelay/commit/5a831d99b941c7a879818ab50abfc0bded0798a4))
* Implementing handleReqMessage() so that subscriptions can be made and events are sent to them. ([2e10b66](https://github.com/jimbojw/memorelay/commit/2e10b6633cc4ba57f468c4f81f4e8e94c3cb7a27))
* Implementing handling of EVENT messages. ([aaeea2b](https://github.com/jimbojw/memorelay/commit/aaeea2b83c10e9275032789ca7ae7f399a08b0fa))
* Implementing rudimentary MemorelayServer implementation, related libraries and tests. ([4bd56bb](https://github.com/jimbojw/memorelay/commit/4bd56bb0c9f5a8e7bd256b921dbc478cd7adb864))

# [1.3.0](https://github.com/jimbojw/memorelay/compare/v1.2.0...v1.3.0) (2023-05-13)


### Features

* Implementing subscriptions for Memorelay class plus related types and tests. ([7a230c9](https://github.com/jimbojw/memorelay/commit/7a230c9c01195a58a76a89bc57d3202f2841f225))

# [1.2.0](https://github.com/jimbojw/memorelay/compare/v1.1.0...v1.2.0) (2023-05-12)


### Features

* Implementing matchFilters() method and related tests. ([9a31a2c](https://github.com/jimbojw/memorelay/commit/9a31a2c4c2440403d61bc4a8b1763359f75ff60a))
* Implementing verifyFilter() utility function and related types and tests. ([3c84eeb](https://github.com/jimbojw/memorelay/commit/3c84eeb32cb0ffbb562f11bb3cd4b156c8c27377))
* Incorporating verifyFilters() into Memorelay:matchFilters() behavior. ([cf49124](https://github.com/jimbojw/memorelay/commit/cf4912409b6d804ef0f8a6d6b28df0e320e391cd))

# [1.1.0](https://github.com/jimbojw/memorelay/compare/v1.0.0...v1.1.0) (2023-05-12)


### Features

* Adding event verifcation check to Memorelay:addEvent() behavior. ([6eba381](https://github.com/jimbojw/memorelay/commit/6eba381efafd4e62fc00ce4bdfb308c32bdc573a))
* Adding rumimentary Memorelay class behaviors. ([d021a4a](https://github.com/jimbojw/memorelay/commit/d021a4afea58ca90de6756b8e48afa242d5b36e9))
* Adding verifyEvent() utility function and related tests. ([b62c202](https://github.com/jimbojw/memorelay/commit/b62c202fb01a296602864e1eb35f4a1c0efed450))

# 1.0.0 (2023-05-10)


### Features

* Adding rudimentary library and related configuration. ([e6d9ceb](https://github.com/jimbojw/memorelay/commit/e6d9cebea1def2c65506ee1a93119dfa1441164f))
