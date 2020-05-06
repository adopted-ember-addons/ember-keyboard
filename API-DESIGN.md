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

By making clear whether a keyboard event handler is using `code` or `key`, we can avoid a class of bugs that were present in previous versions of ember-keyboard.

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

### API Proposal 3: Default to `key` mode, and listening on `keydown`, mostly positional args

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
<OnKeyboard action={{this.DoThing}} @value="alt+c" />
<OnKeyboard action={{this.DoThing}} @value="alt+KeyC" @event='keyup' @mode="code" />

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

## How we teach this

> What names and terminology work best for these concepts and why? How is this
idea best presented? As a continuation of existing Ember patterns, or as a
wholly new one?

> Would the acceptance of this proposal mean the Ember guides must be
re-organized or altered? Does it change how Ember is taught to new users
at any level?

> How should this feature be introduced and taught to existing Ember
users?

## Alternatives

One idea is to back ember-keyboard by a widely used Javascript keyboard handling library. @lukemelia looked into mousetrap and keymaster to see how they handled key vs code and whether we could/should use them. In both cases, he found that they rely on now-deprecated keyboard event properties (`which` and `keyCode`). e.g. ccampbell/mousetrap#474. For that reason, his conclusion is that taking a dependency on one of them is not a good idea.

## Unresolved questions

### Should ember-keyboard bring an opinion about whether most developers should be using `code` or `key`-based shortcuts for common types of apps targeted by Ember?

Proposals 1 and 2 are agnostic. Proposal 3 has the opinion that `key` should be the default.

### Challenges with mapping `key` values

Because `key` is the generated value including the effect of modifiers, `Shift+2` has a key value of `@` on common English layouts. Should a keyboard shortcut of `key='@'` be equivalent to one of `modifier='Shift' key='2'`? If so, how do we encode the mapping of `@` to `2` necessary to support the latter?

Alt-key combos on OS X bring a similar set of challenges. `Alt+c` on OS X has a `key` value of `ç` since that is the character normally generated on Macs when pressing Alt/Option and C together. To support `modifier='Alt' key='c'` on Macs, we would need to map `ç` back to `c` somehow.

### How do these API changes the priority and propagation features of ember-keyboard, if at all?

No need for this functionality to change
