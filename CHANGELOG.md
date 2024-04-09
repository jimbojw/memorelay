## [2.0.4](https://github.com/jimbojw/memorelay/compare/v2.0.3...v2.0.4) (2024-04-09)


### Bug Fixes

* Emit synthetic "did add" after receiving already deleted note. ([d0ab596](https://github.com/jimbojw/memorelay/commit/d0ab596431e9647d798703dd3612462664d0f0b4))

## [2.0.3](https://github.com/jimbojw/memorelay/compare/v2.0.2...v2.0.3) (2024-04-01)


### Bug Fixes

* Move previous NIP-20 code into NIP-01. ([6973b8f](https://github.com/jimbojw/memorelay/commit/6973b8ff89ec254e0978dca5d535bb4466b6f569))

## [2.0.2](https://github.com/jimbojw/memorelay/compare/v2.0.1...v2.0.2) (2024-04-01)


### Bug Fixes

* Remove 1 from `supported_nips` list. ([1f07d6f](https://github.com/jimbojw/memorelay/commit/1f07d6f8ac5a5c9051ce4892eab288d1612f9987))
* Remove 20 from `supported_nips` list. ([ee96bbb](https://github.com/jimbojw/memorelay/commit/ee96bbb2a1892e3da200d3d70d2e22e955122861))

## [2.0.1](https://github.com/jimbojw/memorelay/compare/v2.0.0...v2.0.1) (2023-07-13)


### Bug Fixes

* Add dist/** to npm tarball to fix [#7](https://github.com/jimbojw/memorelay/issues/7) and [#37](https://github.com/jimbojw/memorelay/issues/37). ([a85c754](https://github.com/jimbojw/memorelay/commit/a85c75475cd13d15dc9d44e78b3a8497a3064d46))

# [2.0.0](https://github.com/jimbojw/memorelay/compare/v1.9.0...v2.0.0) (2023-07-13)


### Bug Fixes

* Add static member 'type' to BasicEvent class. ([0b35ad2](https://github.com/jimbojw/memorelay/commit/0b35ad2c36771f84f5e18cbdea7192f550a40bfe))
* Add subscription id field to outgoing relay EVENT messages. ([8e05ce4](https://github.com/jimbojw/memorelay/commit/8e05ce442588cbcdd25df3f1c64722165080082f))
* Adding EventType to BasicEvent signature. ([75e178d](https://github.com/jimbojw/memorelay/commit/75e178ddbbab208dad52e85c2f1731b069e728d1))
* Adding static type to BadMessageError. ([18cbc2e](https://github.com/jimbojw/memorelay/commit/18cbc2e95a3b08f4205ab11d638cd44fd32dbea9))
* bin test updated to expect subscription id in relay event message. ([17ad62d](https://github.com/jimbojw/memorelay/commit/17ad62d2c30c96abda3f7c2b7e65859dc65cb546))
* Cast dataArray as proper Buffer. ([5d3897c](https://github.com/jimbojw/memorelay/commit/5d3897c0a3d8e24aebe452b1bf0b73064556a0cf))
* Change relayInformationDocument into a true plugin using only events. ([8345113](https://github.com/jimbojw/memorelay/commit/83451131f55497c9fdfbfb4291d991e26c3f64dd))
* Clear REQ subscription handlers on disconnect. ([a52432e](https://github.com/jimbojw/memorelay/commit/a52432e22414969f02fed13a10e8145a011ddfc4))
* Drop incoming duplicate EVENT messages. ([b216faf](https://github.com/jimbojw/memorelay/commit/b216fafd53cbac90cd739f5b453749363f37405d))
* Emit DuplicateEventMessageEvent, finish NIP-20 OK responses. ([07c5410](https://github.com/jimbojw/memorelay/commit/07c541033a265263e7d42a472a8f1e8ede9be8b0))
* Emit DuplicateWebSocketError in microtask. ([d720bc3](https://github.com/jimbojw/memorelay/commit/d720bc32c32e89611a7ae110a26f5148d92cca0e))
* Emit events within microtasks. ([0781780](https://github.com/jimbojw/memorelay/commit/078178029b7e86635deaaac2489e5a46e53766c1))
* Enforcing RelayEvent and ClientEvent types. ([2e8979b](https://github.com/jimbojw/memorelay/commit/2e8979bf230ed4c2bb28faa7ddb61947d06528d5))
* Export Memorelay object from main index. ([565f199](https://github.com/jimbojw/memorelay/commit/565f19902e54aff88a405f664d2452e20a520d98))
* Exposing webSocketServer for testing. ([8e12e1c](https://github.com/jimbojw/memorelay/commit/8e12e1c5006aeccd3288ae8868a948a8494974ba))
* Fix example Express server to serve relay information document correctly. ([ffce5a7](https://github.com/jimbojw/memorelay/commit/ffce5a72f887edf239f5916ac13f3321ab9a2234))
* Import paths for simple throttle contrib example plugin. ([5cf1169](https://github.com/jimbojw/memorelay/commit/5cf11695dad1a765d85e7cdf0e54bf7119f113e7))
* Increasing maxEventListeners to account for added handlers. ([25ec95b](https://github.com/jimbojw/memorelay/commit/25ec95b8549a38cb871992d59aae409d112994e7))
* Increasing MemorelayClient maxEventListeners to avoid Node's MaxListenersExceededWarning. ([b8ea051](https://github.com/jimbojw/memorelay/commit/b8ea051774eaa7a32219ff4a42048dcb4740f951))
* Incrementing maxEventListeners on hub for each new client. ([8a17417](https://github.com/jimbojw/memorelay/commit/8a1741743dde95318903d14c97174160e37e5e5a))
* Link WebSocketConnectedEvent as parentEvent of downstream MemorelayClient events. ([3172a9d](https://github.com/jimbojw/memorelay/commit/3172a9d933b2cb3b2d57d9ebd08b836a53749968))
* Log HTTP requests. ([63940f0](https://github.com/jimbojw/memorelay/commit/63940f0d1ef09dddd3e6eddbd9dbbad9b78f9469))
* Making details mandatory on BasicEvent with no default type. ([bcd067d](https://github.com/jimbojw/memorelay/commit/bcd067dbddbf9fe13515d4b3301acef15c59bf4e))
* Making event file names more specific. ([1819423](https://github.com/jimbojw/memorelay/commit/18194232a9b1b34b88d0d83946b5275a1ab265c2))
* Making RawMessageHandlerNextFunction signature more strict. ([f20a219](https://github.com/jimbojw/memorelay/commit/f20a21974c26e526f38d3dfe5078a353edb1bbfd))
* Remove static 'type' member from BasicEvent, make others readonly. ([3454411](https://github.com/jimbojw/memorelay/commit/34544111d62b5718e68fcdf66b44b3e8c86e8a3c))
* Remove unused BadBufferError. ([1be0df9](https://github.com/jimbojw/memorelay/commit/1be0df90da059bb058624123cab8c3e3562349a1))
* Removing all middleware content, focusing on events. ([012a142](https://github.com/jimbojw/memorelay/commit/012a142dadb8c271391b6a33ffaf99d1ff29da94))
* Removing unused middleware types. ([ffb3603](https://github.com/jimbojw/memorelay/commit/ffb36038ad4c45161a773c4d4dcde96a94d31c3d))
* Send NOTICE message to client in response to errors such as bad messages. ([11162d0](https://github.com/jimbojw/memorelay/commit/11162d04d6230cc259416cd646397fccf4324394))
* Signal support for NIP-20 in plugin. ([567b6e4](https://github.com/jimbojw/memorelay/commit/567b6e46108c6ecea7f6defd464260714b75f4ad))
* Simplify NIP-01 plugins with autoDisconnect(). ([54781f7](https://github.com/jimbojw/memorelay/commit/54781f712933b9814306b67cb0698e97a44899cc))
* Simplify plugin to reject all incoming messages. ([16dfb8d](https://github.com/jimbojw/memorelay/commit/16dfb8da22fa9f8009649ce52b0105d86c319aad))
* Simplifying naming of RawMessageHandler middleware signatures. ([c62a718](https://github.com/jimbojw/memorelay/commit/c62a7183a55bfec874aa3634958c6cf7a702ee27))
* Update import for checkGenericMessage(). ([c8b8d13](https://github.com/jimbojw/memorelay/commit/c8b8d131a12290b7beab3f5a835a463a1dcac654))
* Updating events to have parentEvent and targetEmitter properties where appropriate. ([598fdd6](https://github.com/jimbojw/memorelay/commit/598fdd65b42993c904a5f9657b34b5511efbec5c))


### Features

* Add depth to logging to aid event chain debugging. ([2746063](https://github.com/jimbojw/memorelay/commit/2746063f9db0dd19f0e95587521fec4cf51fb9d9))
* Add DuplicateWebSocketError. ([1453bc3](https://github.com/jimbojw/memorelay/commit/1453bc33e2ca68dbe4a54950fa3da6d6b19a9232))
* Add event deletion database for NIP-09. ([9380c96](https://github.com/jimbojw/memorelay/commit/9380c96259db4ba0209882bc751c21061c004ec1))
* Add optional nextFn param to handleRequest() for Express compatability. ([0e70267](https://github.com/jimbojw/memorelay/commit/0e70267d457d40f7142947b620b76de1ec2383e9))
* Add preflight event capability to BasicEventEmitter. ([1e1ee20](https://github.com/jimbojw/memorelay/commit/1e1ee20eb445a99661ac4437fec5bc06f0546fcd))
* Addd handleRequest() method to hub which emits HttpServerRequestEvent. ([d04c6e6](https://github.com/jimbojw/memorelay/commit/d04c6e6ba3227fbf2826ac263117c15a1cfbb1a6))
* Adding 'details' payload to BasicEvent plus tests. ([4e4e92b](https://github.com/jimbojw/memorelay/commit/4e4e92b1f9636ef1bc1d43d1e358114b41004279))
* Adding ability to set/get maxEventListeners on BasicEventEmitter. ([243c375](https://github.com/jimbojw/memorelay/commit/243c375136d2977141e31659949556adeca47332))
* Adding BadBufferError plus tests. ([a12a50e](https://github.com/jimbojw/memorelay/commit/a12a50e80dc1bb7d243d091316a56a97ac16a5ee))
* Adding ConnectableEventEmitter to use as base for MemorelayClient and MemorelayHub. ([7096432](https://github.com/jimbojw/memorelay/commit/7096432931ac071e48c2f74d18658cd0ef5c6bdf))
* Adding contrib subdirectory under plugins. ([c5d7dc7](https://github.com/jimbojw/memorelay/commit/c5d7dc74737fcb475cc8b313211dee5a37ec31c5))
* Adding experiimental express middleware-based implementation. ([e3e1776](https://github.com/jimbojw/memorelay/commit/e3e177653337fc3cfdae098329c908b803b277d4))
* Adding NIP-11 support to default Memorelay. ([99e12d8](https://github.com/jimbojw/memorelay/commit/99e12d83d4b40b78ce32bb8b04427f8817b14888))
* Adding WebSocket event types. ([911af0f](https://github.com/jimbojw/memorelay/commit/911af0f745cfce7dbef0a0fa95d533a66c0f9370))
* Adding WebSocketCloseEvent and making MemorelayClientCreatedEvent async. ([51fe379](https://github.com/jimbojw/memorelay/commit/51fe3796b7b2c0a25663db11f8f6cb3204aebbd6))
* Adding WillAdd* and DidAdd* events to storage flow. ([8322bd4](https://github.com/jimbojw/memorelay/commit/8322bd4023ca23957bec9915617835edd1128942))
* Breaking out runRawMessageHandlers() to its own method. ([c2b580b](https://github.com/jimbojw/memorelay/commit/c2b580b30edb7c8c46eac61f0fab59831e67e812))
* Broadcasting incoming EVENT messages to all other connected clients. ([6658b0b](https://github.com/jimbojw/memorelay/commit/6658b0ba4e43195082134d10dfe4980625fbfa22))
* Changing BroadcastEventMessageEvent to be a relay-level event. ([75d7002](https://github.com/jimbojw/memorelay/commit/75d7002a18bf9d853ed36d241b8f8c8ec392aa0d))
* Emit compiled code, not just typings. ([0233396](https://github.com/jimbojw/memorelay/commit/0233396d658d53a29fe5cfb7d229cc2f13a64517))
* Emit PreflightErrorEvent before emitting error. ([2cef1de](https://github.com/jimbojw/memorelay/commit/2cef1ded9f76176712549c1a11e691bb69ede537))
* Expose checkGenericMessage() utility function. ([b8b0828](https://github.com/jimbojw/memorelay/commit/b8b0828d16bf65fd7f08d1b0cf3360c659464771))
* Implement BasicEventEmitter plus tests. ([b36f8ca](https://github.com/jimbojw/memorelay/commit/b36f8cacaf32bef1b35e4ce41534c0b21bd81fe0))
* Implement MemorelayClient event types. ([78c91a3](https://github.com/jimbojw/memorelay/commit/78c91a39c3fd5e2617663b58e8d2ab8c8e2eecfd))
* Implement NIP-09 event deletion by adding and filtering events. ([a180d24](https://github.com/jimbojw/memorelay/commit/a180d24885f2671e964973b73dce868e3d45bc6d))
* Implement validateIncomingEventMessages() plugin. ([4bb1a90](https://github.com/jimbojw/memorelay/commit/4bb1a90a1bbfafa5b880e411285e61cd8c97704e))
* Implementing basic event with preventDefault() capability. ([32ab7e4](https://github.com/jimbojw/memorelay/commit/32ab7e475e710fc5611691be83a2afede427fec5))
* Implementing contrib logger plugin and using it on demo Express server. ([9025dc2](https://github.com/jimbojw/memorelay/commit/9025dc2802b33ca93ee3e5b2311d05012d1e6f35))
* Implementing full connect()/disconnect() for MemorelayClient. ([1bb5dbc](https://github.com/jimbojw/memorelay/commit/1bb5dbcc5a12396f76569f2bfe1db390cac9634d))
* Implementing JSON serialization for outgoing messages. ([c5f0ec2](https://github.com/jimbojw/memorelay/commit/c5f0ec28cd6958c9d478050dc3214a6002e83c8f))
* Implementing NIP-20 OK command results for stored events. ([5766967](https://github.com/jimbojw/memorelay/commit/5766967555d08b215138e36a44fdd1574228d5b0))
* Implementing validateIncomingCloseMessages(). ([99e428b](https://github.com/jimbojw/memorelay/commit/99e428b29a6a61201b22553e174b492ba56ac215))
* Implementing validation for incoming REQ messages. ([9db310a](https://github.com/jimbojw/memorelay/commit/9db310ab575c68239e0936dea3132910bd1a4477))
* Implementing WebSocket JSON payload parsing as standalone core plugin. ([6a166cb](https://github.com/jimbojw/memorelay/commit/6a166cb97c7a32198d3b460d0366dd80be16a911))
* Implementing WebSocket upgrades and first pass at experimental middleware. ([cede0ba](https://github.com/jimbojw/memorelay/commit/cede0ba4b671810ccaede07823e655c09e4fbfde))
* Rejecting unrecognized incoming message types. ([727302b](https://github.com/jimbojw/memorelay/commit/727302b585ad2a120c70355b1efa04473c276e42))
* Remove error paths from BasicEventEmitter and child classes (emit events only). ([3a8999c](https://github.com/jimbojw/memorelay/commit/3a8999cb7c3cf91e3c7f263064fdee9329205b0b))
* Removing subscription on CLOSE event. ([267b9f9](https://github.com/jimbojw/memorelay/commit/267b9f955a792dfac3268cd9eabf28e27be253d4))
* Scaffold for NIP-09 event deletion. ([3936634](https://github.com/jimbojw/memorelay/commit/39366344c10702df99a667b7323952475f5619c4))
* Sending stored events to new subscribers. ([ecc193a](https://github.com/jimbojw/memorelay/commit/ecc193a6f801f748786c6d0f9ce114da91e127e3))
* Separating out relayInformationDocument() from Memorelay. ([cbe8e7d](https://github.com/jimbojw/memorelay/commit/cbe8e7dff4bf7984fa67cc7e002d95a7b7195116))
* Switching bin.ts to use new Memorelay and bin.test.ts to use TestHarness. ([57586d8](https://github.com/jimbojw/memorelay/commit/57586d8b9d2f5dbd6eb04520e57c9fb7d3771e8a))
* Upgrading onEvent() and onError() to return a Handler that can disconnect the listener. ([61fd3f8](https://github.com/jimbojw/memorelay/commit/61fd3f873eba7621031374c5b2d5420c359e4343))


### BREAKING CHANGES

* Memorelay object is now the preferred/default object.

# [1.9.0](https://github.com/jimbojw/memorelay/compare/v1.8.0...v1.9.0) (2023-05-24)


### Bug Fixes

* Preventing later-added deleted events from being accepted (see [#47](https://github.com/jimbojw/memorelay/issues/47)). ([914dd98](https://github.com/jimbojw/memorelay/commit/914dd98bc310c6de2f1e447d899291f55ae85215))


### Features

* Adding 20 to list of supported_nips in relay information document. ([a837e85](https://github.com/jimbojw/memorelay/commit/a837e857644990d128f310eb08ad3b5e21908d13))
* Emitting 'OK' message when event is sucessfully received. ([7306f6e](https://github.com/jimbojw/memorelay/commit/7306f6eeb97f739e44b68e8b7e5e204060d555d8))
* Implementing NIP-20 'OK' response for duplicate messages. ([624d025](https://github.com/jimbojw/memorelay/commit/624d0250fdc1f02c688fa58fcc5abb27e2ef0521))
* Include NIP-20 'OK' messages in message types. ([ce0277e](https://github.com/jimbojw/memorelay/commit/ce0277e175d0d3f7ea42a1ef19708cf1910048c4))
* Notify on deleted event rejected, type/parse relay messages. ([2ad30da](https://github.com/jimbojw/memorelay/commit/2ad30dadbfba81bc53bb7cd4d21fc93a00baad89))

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
