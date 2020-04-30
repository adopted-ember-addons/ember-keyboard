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

> What other designs have been considered? What is the impact of not doing this?

> This section could also include prior art, that is, how other frameworks in the same domain have solved this problem.

## Unresolved questions

### Should ember-keyboard bring an opinion about whether most developers should be using `code` or `key`-based shortcuts for common types of apps targeted by Ember?

### Challenges with mapping `key` values

Because `key` is the generated value including the effect of modifiers, `Shift+2` has a key value of `@` on common English layouts. Should a keyboard shortcut of `key='@'` be equivalent to one of `modifier='Shift' key='2'`? If so, how do we encode the mapping of `@` to `2` necessary to support the latter?

Alt-key combos on OS X bring a similar set of challenges. `Alt+c` on OS X has a `key` value of `ç` since that is the character normally generated on Macs when pressing Alt/Option and C together. To support `modifier='Alt' key='c'` on Macs, we would need to map `ç` back to `c` somehow.
