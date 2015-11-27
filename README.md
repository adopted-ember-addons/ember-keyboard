[![npm version](https://badge.fury.io/js/ember-keyboard.svg)](https://badge.fury.io/js/ember-keyboard)
[![Build Status](https://travis-ci.org/null-null-null/ember-keyboard.svg?branch=master)](https://travis-ci.org/null-null-null/ember-keyboard)
[![Code Climate](https://codeclimate.com/github/null-null-null/ember-keyboard/badges/gpa.svg)](https://codeclimate.com/github/null-null-null/ember-keyboard)
[![Test Coverage](https://codeclimate.com/github/null-null-null/ember-keyboard/badges/coverage.svg)](https://codeclimate.com/github/null-null-null/ember-keyboard/coverage)

# ember-keyboard

`ember-keyboard`, an Ember addon for the painless support of keyboard events.

## Features

* Dynamic priority levels allow you to specify which components respond first to key events and under what circumstances. (Thanks to [`ember-key-responder`](https://github.com/yapplabs/ember-key-responder) for the inspiration)
* Human-readable key-mappings. (Thanks to [`ember-keyboard-service`](https://github.com/Fabriquartz/ember-keyboard-service) for the inspiration)
* Support for both `keyup` and `keydown`, as well as the modifier keys: `ctrl`, `alt`, `shift`, and `meta`.
* Compatible with both Ember 1.13 and 2.0+.

## Installation

`ember install ember-keyboard`

## Usage

First, inject `ember-keyboard` into your component:

```js
export default Ember.Component.extend({
  keyboard: Ember.inject.service()
});
```

Once the `keyboard` service is injected, you need to activate it.

```js
activateKeyboard: Ember.on('didInsertElement', function() {
  this.get('keyboard').activate(this);
})
```

This will place the component in the `eventStack`, meaning it'll be able to respond to key events. Let's say you want your component to respond to the key `a` as well as `ctrl+shift+a`. You could do so with:

```js
import { keyUp } from 'ember-keyboard';

. . . .

aFunction: Ember.on(keyUp('a'), function() {
  console.log('`a` was pressed');
}),

anotherFunction: Ember.on(keyUp('ctrl+shift+a'), function() {
  console.log('`ctrl+shift+a` was pressed');
})
```

The modifier keys include `ctrl`, `shift`, `alt`, and `meta`. For a full list of the primary keys (such as `a`, `1`, ` `, `Escape`, and `ArrowLeft`), look [here](https://github.com/null-null-null/ember-keyboard/blob/master/addon/fixtures/key-map.js).

Finally, when you're ready for a component to leave the `eventStack` you can deactivate it:

```js
deactivateKeyboard: Ember.on('arbitraryTrigger', function() {
  this.get('keyboard').deactivate(this);
})
```

Note that components will automatically be deactivated on `willDestroyElement`.

## `keyboardPriority`

By default, all activated components are treated as equal. If you have two components that respond to `ctrl+a`, then both will get triggered when there's a `ctrl+a` event. However, this behavior is undesirable in some scenarios. What if you have a modal open, and you only want it and its child components to respond to key events. You can get this behavior by assigning a priority to the modal and its children:

```js
noPriorityComponent; // priority defaults to 0
lowPriorityComponent.set('keyboardPriority', 0);

modal.set('keyboardPriority', 1);
modalChild.set('keyboardPriority', 1);
```

In this scenario, when a key is pressed both `modal` and `modalChild` will have a chance to respond to it, while the remaining components will not. Once `modal` and `modalChild` are deactivated or their priority is removed, then `lowPriorityComponent` and `noPriorityComponent` will respond to key events.

Perhaps more conveniently, this property can be passed in through your template:

```hbs
{{my-component keyboardPriority=1}}
{{my-dynamic-component keyboardPriority=dynamicPriority}}
```

Note that priority is descending, so higher numbers have precedence.

## Mixins

To reduce boilerplate, `ember-keyboard` includes several mixins with common patterns.

### EKOnInsertMixin

`import { EKOnInsertMixin } from 'ember-keyboard';`

This mixin will activate the component on `didInsertElement`, and as per normal, it will deactivate on `willDestroyElement`.

### EKOnFocusMixin

`import { EKOnFocusMixin } from 'ember-keyboard';`

This mixin will activate the component whenever it receives focus and deactivate it when it loses focus.

Note that to ensure that the component is focusable, this mixin sets the component's `tabindex` to 0.

### EKFirstResponderMixin

`import { EKFirstResponderMixin } from 'ember-keyboard';`

This mixin does not activate or deactivate the component. Instead, it allows you to make a component the first and only responder, regardless of its initial `keyboardPriority`. This can be useful if you want a low-priority component to temporarily gain precedence over everything else. When it resigns its first responder status, it automatically returns to its previous priority. Note that if you assign a second component first responder status, the first one will in turn lose first responder status.

To make this possible, this mixin adds two functions to the component:

#### becomeFirstResponder

```js
// from within the component
this.becomeFirstResponder();
```

Makes the component the first responder. It will be activated (`ember-keyboard.activate()`) if it has not yet been.

Note: This is accomplished by assigning the component a ridiculously high `keyboardPriority` (9999999999999). If you manually change its priority after it becomes first responder, it will lose first responder status.

#### resignFirstResponder

```js
// from within the component
this.resignFirstResponder();
```

Resigns first responder status, in the process returning to its previous priority.

### EKFirstResponderOnFocusMixin

`import { EKFirstResponderOnFocusMixin } from 'ember-keyboard';`

This mixin grants the component first responder status while it is focused. When it loses focus, it resigns its status.

Note that to ensure that the component is focusable, this mixin sets the component's `tabindex` to 0.

## Advanced Usage

### `Ember.TextField` && `Ember.TextArea`

To prevent `ember-keyboard` from responding to key strokes while an input/textarea is focused, we've reopened `Ember.TextField` and `Ember.TextArea` and applied the `EKOnInsertMixin` and `EKFirstResponderOnFocusMixin`. This ensures that whenever an input is focused, other key responders will not fire. If you want to have responders associated with an input or textarea (such as a rich text editor with `keyUp('ctrl+i')` bindings), you need to extend these components from `Ember.TextField` or `Ember.TextArea` rather than `Ember.component`.

This applies to `input` and `textarea` helpers:

```hbs
{{input}}
{{textarea}}
```

### `keyUp` and `keyDown`

`ember-keyboard` listens to both `keydown` and `keyup` events, and has corresponding functions:

```js
import { keyUp, keyDown } from 'ember-keyboard';
```

Note that `keydown` events fire repeatedly while the key is pressed, while `keyup` events fire only once, after the key has been released.

### `event`

When `ember-keyboard` triggers an event, it passes in the `event` object as its first argument:

```js
saveDocument: Ember.on(keyDown('ctrl+s'), function(event) {
  this.performSave();
  event.preventDefault();
})
```

Note that if you want `preventDefault` to prevent `window` level events, you'll need to use `keyDown`, as the default event will fire before `keyUp`.

### `getKey`

Did you know that 65 was the keycode for 'a'? Or that 37 was the keycode for the right arrow? If you don't want to litter your code with keycode references, you can use `getKey`, which `ember-keyboard` uses internally:

```js
import { getKey } from 'ember-keyboard';

. . . .

keyMapper: Ember.on(keyDown('a'), keyDown('b'), keyDown('c'), function(event) {
  const key = getKey(event);
  switch (key) {
    match 'a': console.log('It\'s an a!'); break;
    . . . .
  }
})
```

Just pass in an `event`, and it'll return a human readable key. Look [here](https://github.com/null-null-null/ember-keyboard/blob/master/addon/fixtures/key-map.js) for a full mapping.

### Key Indifference

If you want an event to fire for every keypress, then simply don't provide a keystring to `keyUp` or `keyDown`. This can be a handy way to trigger events for large ranges of keys, such as on any alphanumeric keypress. For instance:

```js
triggerOnAlphaNumeric: Ember.on(keyUp(), function(event) {
  if (/^\w(?!.)/.test(getKey(event))) {
    this.startEditing();
  }
})
```

### `meta` and `alt`

Macs diverge from other PCs in their naming of `meta` and `alt`. The `alt` key is named `options`, while the `meta` key is named `command`. You don't need to do anything special to get `ember-keyboard` to recognize `options` or `command` keys, just use their generic names `alt` and `meta`. This will ensure that your keys fire across platforms.

### Dynamically binding events

If you'd like to dynamically add and remove key listeners on a component, you can do so with the standard `on` and `off` functions:

```js
component.on(keyUp('ctrl+s'), someFunction);
component.off(keyUp('ctrl+s'), someFunction);
```
