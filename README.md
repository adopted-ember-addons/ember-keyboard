# Ember-keyboard

`ember-keyboard`, an Ember addon for the painless support of keyboard events.

## Features

* Dynamic priority levels allow you to specify which components respond first to key events and under what circumstances. (Thanks to [`ember-key-responder`](https://github.com/yapplabs/ember-key-responder) for the inspiration)
* Human-readable key-mappings. (Thanks to [`ember-keyboard-service`](https://github.com/Fabriquartz/ember-keyboard-service) for the inspiration)
* Support for both `keyUp` and `keyDown`, as well as the modifier keys: `ctrl`, `alt`, `shift`, and `meta`.
* Conventional Ember architecture and service-based injection.
* Compatible with both Ember 1.13 and 2.0+.

## Usage

First, inject `ember-keyboard` into your component:

```js
export default Ember.Component.extend({
  keyboard: Ember.inject.service()
});
```

Once the `keyboard` service is injected, you need to activate it.

```js
activateKeyboard: on('didInsertElement', function() {
  this.get('keyboard').activate(this);
})
```

This will place the component in the `eventStack`, meaning it'll be able to respond to key events. Let's say you want your component to respond to the key `a` as well as `ctrl+shift+a`. You could do so with:

```js
import { keyUp } from 'ember-keyboard';

. . . .

aFunction: keyUp('a', function() {
  console.log('`a` was pressed');
}),

anotherFunction: keyUp('ctrl+shift+a', function() {
  console.log('`ctrl+shift+a` was pressed');
})
```

The modifier keys include `ctrl`, `shift`, `alt`, and `meta`. For a full list of the primary keys (such as `a`, `1`, ` `, `Escape`, and `ArrowLeft`), look [here](https://github.com/Ticketfly/ember-keyboard/blob/master/addon/fixtures/key-map.js).

Finally, when you're ready for a component to leave the `eventStack` you can deactivate it:

```js
deactivateKeyboard: on('arbitraryTrigger', function() {
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

Perhaps more convenientally, this property can be passed in through your template:

```hbs
{{my-component keyboardPriority=1}}
{{my-dynamic-component keyboardPriority=dynamicPriority}}
```

Note that priority is descending, so higher numbers have precedence.

## Mixins

To reduce boilerplate, `ember-keyboard` includes several mixins with common patterns.

### ActivateKeyboardOnInsertMixin

`import { ActivateKeyboardOnInsertMixin } from 'ember-keyboard';`

This mixin will activate the component on `didInsertElement`, and as per normal, it will deactivate on `willDestroyElement`.

### ActivateKeyboardOnFocusMixin

`import { ActivateKeyboardOnFocusMixin } from 'ember-keyboard';`

This mixin will activate the component whenever it receives focus and deactivate it when it loses focus.

Note that to ensure that the component is focusable, this mixin sets the component's `tabindex` to 0.

### KeyboardFirstResponderMixin

`import { KeyboardFirstResponderMixin } from 'ember-keyboard';`

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

### KeyboardFirstResponderOnFocusMixin

`import { KeyboardFirstResponderOnFocusMixin } from 'ember-keyboard';`

This mixin grants the component first responder status while it is focused. When it loses focus, it resigns its status.

Note that to ensure that the component is focusable, this mixin sets the component's `tabindex` to 0.

## Special Cases & Advanced Usage

### `Ember.TextField` && `Ember.TextArea`

To prevent `ember-keyboard` from responding to key strokes while an input/textarea is focused, we've included an initializer that reopens `Ember.TextField` and `Ember.TextArea` and applies the `ActivateKeyboardOnInsertMixin` and `KeyboardFirstResponderOnFocusMixin`. Effectively, this means that anytime an input is focused, it will be first responder, preventing other events from firing. So for instance, if you've registered a high-priority listener to `keyUp('a')`, it won't fire every time the user presses 'a'. Nevertheless, if you've created a component extending from either `Ember.TextField` or `Ember.TextArea`, you can assign key listeners to it like any other component and it will respond as expected. This allows, for instance, for rich text editors to italicize text with `keyUp('ctrl+i')`.

You get all this for free when you use the `input` and `textarea` helpers:

```hbs
{{input}}
{{textarea}}
```

### `keyUp` and `keyDown`

From a UI perspective, you'll usually want to register your listeners with `keyUp`. However, there are special scenarios where `keyDown` might be more desirable, usually because it fires repeatedly while the key is held. This could allow users to rapidly cycle through modal states or scroll through a custom window pane. You can import either `keyUp` or `keyDown` from `ember-keyboard`:

```js
import { keyDown, keyUp } from 'ember-keyboard';
```
