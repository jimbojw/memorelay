A Memorelay plugin is a function which accepts an event emitter and registers
listeners in order to implement functionality.

The emitter object that is passed into the plugin function is expected to be the
Memorelay instance. But for testing purposes, a basic emitter can be used.

Plugins should listen for specific events, then emit other events as
appropriate.
