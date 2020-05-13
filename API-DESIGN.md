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

*This section is a work in progress*

### API Proposal 1: Positional arguments for action and modifiers, named property for key/code value

```hbs
<input type='text' {{on-keyboard this.DoThing "Alt" key="c"}}>
<input type='text' {{on-keyboard this.DoThing "Alt" code="c"}}>
<input type='text' {{on-keyboard this.DoThing "Alt" "Shift" code="c"}}>

<button {{keyboard-shortcut "Alt" code='b'}}></button>
<button {{keyboard-shortcut "Alt" key='b'}}></button>
<button {{keyboard-shortcut "Ctrl" code='b'}}></button>
<button {{keyboard-shortcut "Ctrl" "Shift" code='b'}}></button>

// TODO: examples for <KeyboardPress> component
// TODO: examples for setting up handlers in Javascript
```

### API Proposal 2: Positional argument for action, named property for modifiers and key/code value

```hbs
<input type='text' {{on-keyboard this.DoThing mod="Alt" code="c"}}>

// And for multiple modifiers

<input type='text' {{on-keyboard this.DoThing mod=(array "Alt" "Shift") code="c"}}>

// or perhaps we could just space separate multiple mods

<input type='text' {{on-keyboard this.DoThing mod="Alt Shift" code="c"}}>

// TODO: examples for {{keyboard-shortcut}} modifier
// TODO: examples for <KeyboardPress> component
// TODO: examples for setting up handlers in Javascript

```

### API Proposal 3: Default to `key` mode, and listening on `keydown`, mostly positional args, explicit mode property

#### on-keyboard component
```hbs
// Rename the `keyboard-press` component in 6.0.0-beta to `on-keyboard`
// Should this be a helper instead of a component?

// Fires DoThing on keydown of the key that generates "c" on their computer
// while Alt is pressed
{{on-keyboard this.DoThing "alt+c"}}

// Fires DoThing on KEYUP of the key that generates "c" on their computer
// while Alt is pressed
{{on-keyboard this.DoThing "alt+c" event="keyup"}}

// Fires DoThing on keydown of the key that generates "c" on their computer
// while Alt is pressed, or on keydown of the key that generates "t" while
// Ctrl and Shift are pressed
{{on-keyboard this.DoThing "alt+c" "ctrl+shift+t"}}

// Fires DoThing on keydown of the key at the standard position of the C key
// while Alt is pressed
{{on-keyboard this.DoThing "alt+KeyC" mode="code"}}

// Fires DoThing on keyup of the key at the standard position of the C key
// while Alt is pressed
{{on-keyboard this.DoThing "alt+KeyC" event="keyup" mode="code"}}

// To use with angle-bracket notation
<OnKeyboard @action={{this.DoThing}} @value="alt+c" />
<OnKeyboard @action={{this.DoThing}} @value="alt+KeyC" @event='keyup' @mode="code" />

```

#### on-keyboard modifier

```hbs
// Same signature as on-keyboard component, fires only when element has focus
<input type='text' {{on-keyboard this.DoThing "alt+c"}}>
<input type='text' {{on-keyboard this.DoThing "alt+c" event="keyup"}}>
<input type='text' {{on-keyboard this.DoThing "alt+c" "ctrl+shift+t"}}>
<input type='text' {{on-keyboard this.DoThing "alt+KeyC" mode="code"}}>
<input type='text' {{on-keyboard this.DoThing "alt+KeyC" event="keyup" mode="code"}}>
```

#### keyboard-shortcut modifier

```hbs
// Triggers a click on the element it is attached to when the key combo is triggered
// Same signature as on-keyboard component but without the action

<button {{keyboard-shortcut "alt+c"}}></button>
<button {{keyboard-shortcut "alt+c" event="keyup"}}></button>
<button {{keyboard-shortcut "alt+c" "ctrl+shift+t"}}></button>
<button {{keyboard-shortcut "alt+KeyC" mode="code"}}></button>
<button {{keyboard-shortcut "alt+KeyC" event="keyup" mode="code"}}></button>
```

#### Setting up handlers in Javascript

```js
import Component from '@ember/component';
import { onKeyboard } from 'ember-keyboard';

export default class Foo extends Component {
  //...
  @onKeyboard('alt+c')
  doSomethingA() { ... }

  @onKeyboard('alt+c', { event: 'keyup' })
  doSomethingB() { ... }

  @onKeyboard('alt+c', 'ctrl+shift+t')
  doSomethingC() { ... }

  @onKeyboard('alt+KeyC', { mode: 'code' })
  doSomethingD() { ... }

  @onKeyboard('alt+c', 'ctrl+shift+t', { event: 'keyup', mode: 'code' })
  doSomethingE() { ... }
  //...
}
```

```js
import { onKeyboard } from 'ember-keyboard';

export default Component.extends({
  //...
  doSomethingA: onKeyboard('alt+c', function() { ... }),
  doSomethingB: onKeyboard('alt+c', { event: 'keyup' }, function() { ... }),
  doSomethingC: onKeyboard('alt+c', 'ctrl+shift+t', function() { ... }),
  doSomethingD: onKeyboard('alt+KeyC', { mode: 'code' }, function() { ... }),
  doSomethingE: onKeyboard('alt+c', 'ctrl+shift+t', { event: 'keyup', mode: 'code' }, function() { ... }),
  //...
});
```

### API Proposal 4: Infer `key` vs `code` mode, default to listening on `keydown`, try to match `{{on ...}}` semantics more closely, use on-key for shortcuts too

#### on-key component
```hbs
// Rename the `keyboard-press` component in 6.0.0-beta to `on-key`
// Should this be a helper instead of a component?

// Fires DoThing on keydown of the key that generates "c" on their computer
// while Alt is pressed
{{on-key "alt+c" this.DoThing}}

// Fires DoThing on KEYUP of the key that generates "c" on their computer
// while Alt is pressed
{{on-key "alt+c" this.DoThing event="keyup"}}

// Fires DoThing on keydown of the key that generates "c" on their computer
// while Alt is pressed, or on keydown of the key that generates "t" while
// Ctrl and Shift are pressed (i.e. no API support for binding multiple keys,
// just include on-key twice)
{{on-key "alt+c" this.DoThing}}
{{on-key "ctrl+shift+t" this.DoThing}}

// Fires DoThing on keydown of the key at the standard position of the C key
// while Alt is pressed. This is inferred from the use of "KeyC" rather than "c"
{{on-key "alt+KeyC" this.DoThing}}

// Fires DoThing on keyup of the key at the standard position of the C key
// while Alt is pressed
{{on-key "alt+KeyC" this.DoThing event="keyup"}}

// To use with angle-bracket notation (we will recommend curly usage)
<OnKey @keys="alt+c" @action={{this.DoThing}} />
<OnKey @keys="alt+KeyC" @action={{this.DoThing}} @event='keyup' />

```

#### on-key element modifier

```hbs
<!-- Same signature as on-key component -->

<!-- When used with a form element input, textarea, or select, the action fires only when element has focus: -->

<input type='text' {{on-key "alt+c" this.DoThing}}> <!-- `key` mode -->
<input type='text' {{on-key "alt+c" this.DoThing event="keyup"}}> <!-- `key` mode -->
<input type='text' {{on-key "alt+KeyC" this.DoThing}}> <!-- `code` mode -->
<input type='text' {{on-key "alt+KeyC" this.DoThing event="keyup"}}> <!-- `code` mode -->

<!-- When used with another element type and leaving off the action, it will trigger a `click` on the element if no action is passed. This allows for easy declaration of keyboard shortcuts for anything clickable: -->

<button {{on-key "alt+c"}}></button> <!-- `key` mode -->
<button {{on-key "alt+c" event="keyup"}}></button> <!-- `key` mode -->
<button {{on-key "alt+KeyC"}}></button> <!-- `code` mode -->
<button {{on-key "alt+KeyC" event="keyup"}}></button> <!-- `code` mode -->
```

#### Setting up handlers in Javascript

Decorator usage:

```js
import Component from '@ember/component';
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

Non-decorator usage:

```js
import { onKey } from 'ember-keyboard';

export default Component.extends({
  //...
  doSomethingA: onKey('alt+c', function() { ... }), // `key` mode
  doSomethingB: onKey('alt+c', { event: 'keyup' }, function() { ... }), // `key` mode
  doSomethingC: onKey('alt+c', onKey('ctrl+shift+t', function() { ... })), // Binding multiple combos
  doSomethingD: onKey('alt+KeyC', function() { ... }) // `code` mode
  //...
});
```

### Low-level key-combo matching API

All the proposals above could include a low level API that exposes the matching engine that determines whether a particular keyboard event is considered to match a specified key-combo. Examples:

```hbs
{{!-- attach your own event handler using the {{on}} modifier --}}
<div {{on "keydown" (if-key "alt+c" this.doThing)}}></div>

{{! combining with the ember-on-helper addon }}
{{on-document "keydown" (if-key "alt+KeyX" this.doThing)}}

{{! use some third-party component API }}
<SomeComponent @onKey={{if-key "alt+x" this.doThing}}/>
```

```js
import { isKey } from 'ember-keyboard';

function onEvent(e) {
  if (isKey(e, 'alt+x')) {
    this.handleAltX();
  }
}
```

## Alternatives

One idea is to back ember-keyboard by a widely used Javascript keyboard handling library. @lukemelia looked into mousetrap and keymaster to see how they handled key vs code and whether we could/should use them. In both cases, he found that they rely on now-deprecated keyboard event properties (`which` and `keyCode`). e.g. ccampbell/mousetrap#474. For that reason, his conclusion is that taking a dependency on one of them is not a good idea.

## Unresolved questions

### Should ember-keyboard bring an opinion about whether most developers should be using `code` or `key`-based shortcuts for common types of apps targeted by Ember?

Proposals 1, 2 and 4 are agnostic. Proposal 3 has the opinion that `key` should be the default.

### Challenges with mapping `key` values

Because `key` is the generated value including the effect of modifiers, `Shift+2` has a key value of `@` on common English layouts. Should a keyboard shortcut of `key='@'` be equivalent to one of `modifier='Shift' key='2'`? If so, how do we encode the mapping of `@` to `2` necessary to support the latter?

Alt-key combos on OS X bring a similar set of challenges. `Alt+c` on OS X has a `key` value of `ç` since that is the character normally generated on Macs when pressing Alt/Option and C together. To support `modifier='Alt' key='c'` on Macs, we would need to map `ç` back to `c` somehow.

### How do these API changes the priority and propagation features of ember-keyboard, if at all?

No need for this functionality to change

### What about key sequences, a la gmail's `g` followed by `i` to go to the inbox?

Many of the proposal's APIs seem like they could be readily enhanced to support key sequences in a future release.

### This would be a whole new API from version 5. What is the migration path? Is a codemod possible?

The issue that prompted this API rethink was that the addon was conceptually mixing `key` and `code` in a confusing and inconsistent way, so the existing behavior is not something that we would want to bring forward. It seems, therefore, that a codemod would be inadvisable since we would not be preserving behavior. Is should be possible to leave the existing API in place with the existing behavior and deprecate it. This would allow people to upgrade and incrementally move to the new API. The deprecated API could then be dropped in the next major release.

## Acknowlegements

Thank you to @optikalefx, @NullVoxPopuli @mattmcmanus, @seanCodes, and @bendemboski for helping to shape this document.
