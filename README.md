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

This will place the component at the bottom of the `eventStack`, meaning that it will be the first component to respond to a key event. Let's say you want your component to respond to the key `a` as well as `ctrl+shift+a`:

```js
aFunction: on('keyUp:a', function() {
  console.log('`a` was pressed');
}),

anotherFunction: on('keyUp:ctrl+shift+a', function() {
  console.log('`ctrl+shift+a` was pressed');
})
```

The modifier keys include `ctrl`, `shift`, `alt`, and `meta`. For a full list of the primary keys (such as `a`, `1`, ` `, `Escape`, and `ArrowLeft`), look [here](https://github.com/Ticketfly/ember-keyboard/addon/fixtures/key-map.js).

Finally, when you're ready for a component to leave the `eventStack` you can deactivate it:

```js
deactivateKeyboard: on('willDestroyElement', function() {
  this.get('keyboard').deactivate(this);
})
```

## Concepts & Advanced Usage

### Event Bubbling

When you run `this.get('keyboard').activate(this)`, you place a component at the bottom of the `eventStack`. When a key is pressed, it will be first to respond. If it lacks a registered listener for that key, then it will bubble the event up to the next component on the stack. This will continue until the event is handled or it terminates at the top of the stack. This allows you to have mutliple component responders, with precedence given to components lower on the stack.

As an example, imagine that you have a `search-bar` component that you want to focus whenever the user presses the `s` key. At the same time, you have a `nav-bar` component that responds to `ArrowLeft` and `ArrowRight`. When the `s` key is pressed, it first passes through `nav-bar` at the bottom of the stack. Since there are no `keyUp:s` listeners, the event bubbles up to `search-bar`, which can than respond to the keypress.

Now let's say your `modal-dialog` component pops up. It also responds to `ArrowLeft` and `ArrowRight` to cycle through modal states. When the user clicks `ArrowRight`, the event now goes to `modal-dialog` which has arrived at the bottom of the stack. Since it has a listener for `ArrowRight`, it handles the keypress and the event never bubbles up to `nav-bar`.

### `keyUp` and `keyDown`

From a UI perspective, you'll usually want to register your listeners with `keyUp`. However, there are special scenarios where `keyDown` might be more desirable, usually because it fires repeatedly while the key is held. This could allow users to rapidly cycle through modal states with `keyDown:ArrowRight` or scroll through a custom window pane with `keyDown:ArrowDown`.
