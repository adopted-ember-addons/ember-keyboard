# Ember-keyboard

`ember-keyboard`, an Ember addon for the painless support of keyboard events.

## Features

* Contextual responders, allowing you to manage multiple components with unique and conflicting key requirements. (Thanks to [`ember-key-responder`](https://github.com/yapplabs/ember-key-responder) for the inspiration)
* Human-readable key-mappings. (Thanks to [`ember-keyboard-service`](https://github.com/Fabriquartz/ember-keyboard-service) for the inspiration)
* Support for both `keyUp` and `keyDown`, as well as the modifier keys: `ctrl`, `alt`, `shift`, and `meta`.
* Non-invasive, service-based injection.
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
aFunction: on('keyUp:a', function() {
  console.log('`a` was pressed');
}),

anotherFunction: on('keyUp:ctrl+shift+a', function() {
  console.log('`ctrl+shift+a` was pressed');
})
```

The modifier keys include `ctrl`, `shift`, `alt`, and `meta`. For a full list of the primary keys (such as `a`, `1`, ` `, `Escape`, and `ArrowLeft`), look [here](https://github.com/Ticketfly/ember-keyboard/blob/master/addon/fixtures/key-map.js).

Finally, when you're ready for a component to leave the `eventStack` you can deactivate it:

```js
deactivateKeyboard: on('willDestroyElement', function() {
  this.get('keyboard').deactivate(this);
})
```

## Responder Properties

`ember-keyboard` will search the components in its `eventStack` for optional properties. These options provide greater control over `ember-keyboard`'s event bubbling.

### `keyboardPriority`

By default, all activated components are treated as equal. If you have two components that respond to `ctrl+a`, then both will get triggered when there's a `ctrl+a` event. However, this behavior is undesirable in some scenarios. What if you have a modal open, and you only want it and its child components to respond to key events. You can get this behavior by assigning a priority to the modal and its children:

```js
noPriorityComponent; // priority defaults to 0
lowPriorityComponent.set('keyboardPriority', 0);

modal.set('keyboardPriority', 1);
modalChild.set('keyboardPriority', 1);
```

In this scenario, when a key is pressed both `modal` and `modalChild` will have a chance to respond to it, while the remaining components will not. Once `modal` and `modalChild` are deactivated or their priority is removed, then `lowPriorityComponent` and `noPriorityComponent` will respond to key events.

Note that priority is descending, so higher numbers have precedence.

### `keyboardFirstResponder`

Sometimes you'll want a component to temporarily become the first responder, regardless of its priority. For instance, a user might click or focusIn an unprioritized item. When that happens, you can temporarily give it first responder priority by:

```js
keyboard.activate(component);

component.set('keyboardFirstPriority', true);
```

You can later `component.set('keyboardFirstResponder', false)` and the component will automatically return to its original priority. Additionally, if you set another component to `keyboardFirstResponder`, the previous `keyboardFirstResponder` will return to its old priority.

## Concepts & Advanced Usage

### `keyUp` and `keyDown`

From a UI perspective, you'll usually want to register your listeners with `keyUp`. However, there are special scenarios where `keyDown` might be more desirable, usually because it fires repeatedly while the key is held. This could allow users to rapidly cycle through modal states with `keyDown:ArrowRight` or scroll through a custom window pane with `keyDown:ArrowDown`.
