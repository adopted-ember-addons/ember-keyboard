# API Design

## Summary

This document explains and memorializes the API design decisions ember-keyboard has made, for the benefit of consumers of the addon as well as contributors.

## Motivation

In April of 2020, @optikalefx opened PR #117 to fix a bug related to Alt key combos on Macs and software key remapping. The ensuing discussion and research led to a deeper understanding of the `code` and `key` properties of keyboard events in modern browsers. The group became convinced that ember-keyboard's previous blended approach to using the `code` and `key` properties was a mistake and set out to design a clearer API that is more consistent with the web platform.

## Background

The web platform's handling of keyboard events has a messy history, with several now-deprecated properties, including `char`, `charCode`, `which` and `keyCode`, and a now-deprecated event `keypress`

The current supported events are `keydown` and `keyup`, each with a consistent set of supported properties, including two we'll need to understand in detail for this document: `key` and `code`.

The `key` attribute is intended for users who are interested in the meaning of the key being pressed, taking into account the current keyboard layout, and any software remapping the end-user may have in effect.

The `code` attribute is intended for users who are interested in the key that was pressed by the user, without any layout modifications applied. Example use case: Detecting WASD keys (e.g., for movement controls in a game).

The W3C UI Events spec includes instructive [examples of `code` and `key` values for various user actions on various keyboard layouts](https://w3c.github.io/uievents/#code-examples). They are well worth reviewing.

## Principles

For keyboard shortcuts that are based on physical location on the keyboard (e.g. `WASD` game or cursor controls), the `code` property should be used. For mnemonic-based shortcuts (e.g. `Ctrl+B` to Bold text), the `key` property should be used. ember-keyboard should provide an API to make both of these possible.

By making providing clear semantics about whether a keyboard event handler is using `code` or `key`, we can avoid a class of bugs and confusion that were present in previous versions of ember-keyboard.

## Detailed design

Concepts:

* Infer `key` vs `code` mode. e.g. `alt+c` means `key` mode, `alt+KeyC` means `code` mode
* default to listening on `keydown`, allow specifying to listen on other valid event names
* generally try to match ember's `{{on ...}}` modifier semantics, to make usage intuitive

### on-key helper

Replaces the `keyboard-press` component in 6.0.0-beta.0. Since nothing is output, a
helper is more appropriate than a component.

```hbs
<!-- Fires `doThing` on keydown of the key that generates "c" on their computer
     while Alt is pressed -->

{{on-key "alt+c" this.doThing}}

<!-- Fires `doThing` on KEYUP of the key that generates "c" on their computer
     while Alt is pressed -->

{{on-key "alt+c" this.doThing event="keyup"}}

<!-- Fires `doThing` on keydown of the key that generates "c" on their computer
     while Alt is pressed, or on keydown of the key that generates "t" while
     Ctrl and Shift are pressed (i.e. no API support for binding multiple keys,
     just include on-key twice) -->

{{on-key "alt+c" this.doThing}}
{{on-key "ctrl+shift+t" this.doThing}}

<!-- Fires `doThing` on keydown of the key at the standard position of the C key
     while Alt is pressed. This is inferred from the use of "KeyC" rather than "c" -->

{{on-key "alt+KeyC" this.doThing}}

<!-- Fires `doThing` on keyup of the key at the standard position of the C key
     while Alt is pressed -->

{{on-key "alt+KeyC" this.doThing event="keyup"}}
```

In all these cases, the keyboard event is passed to the action so that you could
consult it or call `preventDefault`.

### on-key element modifier

Uses the same signature as the `on-key` helper.

```hbs
<!-- When used with a form element input, textarea, or select, the action fires only
     when element has focus: -->

<input type='text' {{on-key "alt+c" this.doThing}}> <!-- `key` mode -->
<input type='text' {{on-key "alt+c" this.doThing event="keyup"}}> <!-- `key` mode -->
<input type='text' {{on-key "alt+KeyC" this.doThing}}> <!-- `code` mode -->
<input type='text' {{on-key "alt+KeyC" this.doThing event="keyup"}}> <!-- `code` mode -->

<!-- When used with another element type and leaving off the action, it will trigger a
     `click` on the element if no action is passed. This allows for easy declaration of
     keyboard shortcuts for anything clickable: -->

<button {{on-key "alt+c"}}></button> <!-- `key` mode -->
<button {{on-key "alt+c" event="keyup"}}></button> <!-- `key` mode -->
<button {{on-key "alt+KeyC"}}></button> <!-- `code` mode -->
<button {{on-key "alt+KeyC" event="keyup"}}></button> <!-- `code` mode -->
```

One thing to note is that the original keyboard event is not passed to the action
handler when leaving off the action to trigger the click event.

### Setting up handlers in Javascript

Decorator usage:

```js
import Component from '@glimmer/component';
import { onKey } from 'ember-keyboard';

export default class Foo extends Component {
  //...

  @onKey('alt+c') // `key` mode
  doSomethingA() { ... }

  @onKey('alt+c', { event: 'keyup' }) // `key` mode
  doSomethingB() { ... }

  @onKey('alt+c') // Binding multiple combos. This one is `key` mode...
  @onKey('ctrl+shift+KeyT') // ...and this one is `code` mode
  doSomethingC() { ... }

  @onKeyboard('alt+KeyC') // `code` mode
  doSomethingD() { ... }

  //...
}
```

TODO: Determine how registration with the ember-keyboard service will occur. Does it need a class decorator? Manual register/unregister calls?

Non-decorator usage:

```js
import Component from '@ember/component';
import { onKey } from 'ember-keyboard';

export default Component.extend({
  //...
  doSomethingA: onKey('alt+c', function() { ... }), // `key` mode
  doSomethingB: onKey('alt+c', { event: 'keyup' }, function() { ... }), // `key` mode
  doSomethingC: onKey('alt+c', onKey('ctrl+shift+t', function() { ... })), // Binding multiple combos
  doSomethingD: onKey('alt+KeyC', function() { ... }) // `code` mode
  //...
});
```

TODO: Determine how registration with the ember-keyboard service will occur. Do we need to continue use of the existing mixins? Is there an alternative besides explicit register/unregister calls?

### Responder API

In ember-keyboard, each modifier and helper instance is a "responder", as is any component or other object is registered with the service. Responders do not have a base class, but they must conform to an API that allows
the ember-keyboard service to interact with them.

The most important property is `keyboardHandlers`, a dictionary mapping zero or more key-combo strings to functions. The service will check each key-combo string against the keyboard event being processed and call the mapped handler function if a match is found. A responder can opt to determine matches and handling itself by instead implementing `canHandleKeyboardEvent(event)` and `handleKeyboardEvent(event)`.

Previous versions of ember-keyboard relied on the API provided by the `Ember.Evented` mixin: `has(listenerName)` and `trigger(listenerName, event)`. Version 6.x of ember-keyboard will fallback to to `has`/`trigger` with a deprecation warning.

Here are the details of the responder API, using Typescript interface notation for convenience:

```ts
interface IResponder { 
  
  // Implement this for low-level control over whether the service considers this responder capable of
  // handling a specific keyboard event.
  // If not specified, but `handleKeyboardEvent` is specified, service acts as if it returns true.
  canHandleKeyboardEvent?: (event?:KeyboardEvent) => boolean,


  // Implement this for low-level control over the invocation of a handling a specific keyboard event.
  // If not specified, will try to use `keyboardHandlers` dictionary instead.
  handleKeyboardEvent?: (event?:KeyboardEvent, ekEvent?:IEmberKeyboardEvent) => boolean,

  // The service will check each entry in this dictionary and use ember-keyboard's `isKey` function to check
  // whether the keyboard listener is a match for the current keyboard event. If so, it will call the
  // mapped handler function.
  // If not specified, the service will fallback to has/trigger.
  keyboardHandlers?:IKeyboardHandlerDictionary,

  // deprecated
  has?: (listenerName:string) => boolean,

  // deprecated
  trigger?: (event:KeyboardEvent, ekEvent:IEmberKeyboardEvent) => void,

  // When false, responder will not receive events.
  // Service assumes a true value if unspecified.
  keyboardActivated?: boolean,
  
  // Responders with a higher value are consulted sooner for event handling (and a chance to stop propagation).
  // Service assumes a zero value if unspecified.
  keyboardPriority?: number,

  // Only applicable when the service's `isPropagationEnabled` is false.
  // In that mode, a true value indicates that this responder should not block lower priority responders.
  // This can help if you want a group of high level responders to always get a chance to handle key
  // events without blocking the rest of your app. Note that all responders within a given priority must have
  // `keyboardLaxPriority` set to `true` or else the priority level will still block, as per usual.
  // Service assumes a false value if unspecified.
  keyboardLaxPriority?: boolean,
  
  // A true value makes this responder treated as part of the highest priority tier, regardless of its
  // `keyboardPriority` relative to other components. This can be useful if you want a low-priority
  // component to temporarily gain precedence over everything else.
  // Service assumes false if unspecified.
  keyboardFirstResponder?: boolean
}

interface IKeyboardHandlerDictionary {
  index[listenerName:string]: function
}

interface IEmberKeyboardEvent {
  stopPropagation: ()=>void     
  stopImmediatePropagation: ()=>void     
}
```

### Low-level key-combo matching API

A low-level API for the matching engine that determines whether a particular keyboard event is considered to match a specified key-combo will also be exposed.

It will be available as an `if-key` helper:

```hbs
{{!-- attach your own event handler using the {{on}} modifier --}}

<div {{on "keydown" (if-key "alt+c" this.doThing)}}></div>

{{!-- combining with the ember-on-helper addon --}}

{{on-document "keydown" (if-key "alt+KeyX" this.doThing)}}

{{!-- use some third-party component API --}}

<SomeComponent @onKey={{if-key "alt+x" this.doThing}}/>
```

It will also be available as an `isKey` JS function:

```js
import { isKey } from 'ember-keyboard';

function onEvent(ev) {
  if (isKey('keydown:alt+x', ev)) {
    this.handleAltX();
  }
}
```

## Alternatives

One idea is to back ember-keyboard by a widely used Javascript keyboard handling library. @lukemelia looked into mousetrap and keymaster to see how they handled key vs code and whether we could/should use them. In both cases, he found that they rely on now-deprecated keyboard event properties (`which` and `keyCode`). e.g. ccampbell/mousetrap#474. For that reason, his conclusion is that taking a dependency on one of them is not a good idea.

## Questions & Answers

### _Does ember-keyboard bring an opinion about whether most developers should be using `code` or `key`-based shortcuts for common types of apps targeted by Ember?_

No, it is agnostic.

### _What are the challenges with mapping `key` values?_

Because `key` matches the generated would-be output of a keyboard event, including the effect of modifiers, `Shift+2` has a `key` equal to `@` on common English layouts. Should a `{{on-key '@' ...}}` be equivalent to `{{on-key 'shift+2' ...}}`? ember-keyboard says ideally, yes. The implementation therefore will need a way to map of `@` to `2` to support the latter. This will accomplished via a mapping document. *This is likely one of the riskier areas of this design.*

Alt-key combos on OS X bring a similar set of challenges. Pressing `alt+c` on OS X results in an event with a `key` value of `ç`, since that is the character normally generated on Macs when pressing Alt/Option and C together. To support `{{on-key 'alt+c' ...}}` on OS X, we will need to map `ç` back to `c`.

### _How do these API changes affect the `activated`, `priority`, `laxPriority`, and `firstResponder` features of ember-keyboard, if at all?_

No need for this functionality to change. The helpers, modifiers and functions shown above will all allow for these options to be set. Examples:

```hbs
{{on-key 'shift+c' this.doThing activated=false}}
{{on-key 'shift+c' this.doThing priority=1}}
{{on-key 'shift+c' this.doThing laxPriority=true}}
{{on-key 'shift+c' this.doThing firstResponder=true}}

 <!-- same APIs for the modifier version of on-key -->
```

```js
import Component from '@glimmer/component';
import { onKey } from 'ember-keyboard';

export default class Foo extends Component {
  //...

  keyboardActivated = true;
  keyboardPriority = 1;
  keyboardLaxPriority = true;
  keyboardFirstResponder = true;

  @onKey('alt+c') 
  doSomething() { ... }

  //...
}
```

```js
import Component from '@ember/component';
import { onKey } from 'ember-keyboard';

export default Component.extend({
  //...

  keyboardActivated: true,
  keyboardPriority: 1,
  keyboardLaxPriority: true,
  keyboardFirstResponder: true,

  doSomething: onKey('alt+c', function() { ... })

  //...
}
```

There may be undue complexity in this area of the addon, but changing it is out of scope for this release.

### _How do these API changes affect the propagation and stopImmediatePropagation features of ember-keyboard, if at all?_

We plan to retain the present approach of ember-keyboard, which is to pass a second event to the handler. This "ember-keyboard" event allows for `stopPropagation` or `stopImmediatePropagation` to be called. This solution may not be ideal, but changing it is out of scope for this release.

### Is there a way in the new API to bind to any key?

The previous API supports `_all` as a magic specifier for this, and the new version will support this as well.

### _What about key sequences, a la gmail's `g` followed by `i` to go to the inbox?_

Out of scope for now, but this API could be readily enhanced to support key sequences in a future release.

### _This would be a whole new API from version 5. What is the migration path? Is a codemod possible?_

The issue that prompted this API rethink was that the addon was conceptually mixing `key` and `code` in a confusing and inconsistent way, so the existing behavior is not something that we would want to bring forward. It seems, therefore, that a codemod would be inadvisable since we would not be preserving behavior. Is should be possible to leave the existing API in place with the existing behavior and deprecate it. This would allow people to upgrade and incrementally move to the new API. The deprecated API could then be dropped in the next major release.

## Acknowledgements

Thank you to @optikalefx, @NullVoxPopuli @mattmcmanus, @seanCodes, and @bendemboski for helping to shape this document.
