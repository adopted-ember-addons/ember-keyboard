## v6.0.0-beta.0 (2020-04-29) (Pre-release)

#### (Octane-friendly!)

_This is the first beta of ember-keyboard 6.0.0!_

* [BREAKING] Now requires ember >= 3.8 and node >= 10.x
* [FEATURE] Add `on-keyboard` and `keyboard-shortcut` element modifiers and make `keyboard-press` component public and documented [\#111](https://github.com/adopted-ember-addons/ember-keyboard/pull/111) ([lukemelia](https://github.com/lukemelia)) - These names may be changed before final release of 6.0.

The best place for documentation on the new features is https://github.com/adopted-ember-addons/ember-keyboard/blob/master/tests/dummy/app/templates/usage.hbs -- our docs site will be updated when 6.0.0 final is released)

_Note: ember-keyboard has been moved to the adopted-ember-addons org. We're grateful to @briarsweetbriar for maintaining the project prior to this transition and for facilitating a smooth transition and ensuring this addon can continue to evolve with Ember._

## v5.0.0 (2019-11-19)

* Upgrades to ember-cli-babel 7.


## v4.0.0 (2018-09-05)

#### Support software keymaps

Big thanks to @NullVoxPopuli for [this PR](https://github.com/patience-tema-baron/ember-keyboard/pull/88). Now, `ember-keyboard` will respond to the key mapping, rather than the key itself. For instance, with a Dvorak key mapping, pressing 'k' will give a code of 'KeyV' and a key of 'k'. Now, `ember-keyboard` will treat a Dvorak 'KeyV' as a 'k'.

This may introduce a regression if you intended to map to the key themselves, rather than to their code. If that's the case, please take out an issue and we'll figure out a way to support that behavior as well.

## v3.0.0 (2018-01-16)

#### Remove jQuery and make touch/mouse events opt-in

This release has two potential breaking changes:

1. `jQuery`'s been removed! This means that responders will now receive vanilla events, instead of jQuery events. For instance, using jQuery's `isImmediatePropagationStopped` will no longer work:

```js
responder: Ember.on(keyDown('KeyA'), function(event) {
  event.isImmediatePropagationStopped();
})
```

2. Mouse/touch events are now opt-in. You'll have to specify them in your `config/environment.js` file:

```js
emberKeyboard: {
  listeners: ['keyUp', 'keyDown', 'keyPress', 'click', 'mouseDown', 'mouseUp', 'touchStart', 'touchEnd']
}
```

...

## v2.0.0 (2016-07-13)

#### Use `code` instead of `key`

This release switches to the more consistent [`code` property](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code). For instance:

```
keyDown('KeyA', . . .)
keyDown('Digit1', . . .)
keyDown('Numpad1', . . .)
keyDown('Space', . . .)
```

## v1.1.0 (2016-04-23)

#### :bug: Bugs
* Add support for irregular IE key names

## v1.0.3 (2016-03-23)

#### :rocket: Enhancement
* Add a `keyPress` test helper

## v1.0.2 (2016-03-23)

## v1.0.1 (2016-03-22)

#### :house: Internal
* Update Ember CLI

## v1.0.0 (2016-03-22)

#### :rocket: Enhancement
* Add a `keyPress` listener to accompany `keyDown` and `keyUp`
* Add ability to specify which events `ember-keyboard` listens for in the app's `config/environment.js`

## v0.2.8 (2016-03-09)

#### :rocket: Enhancement
* Add test helpers

...

## v0.0.2 (2015-10-24)
* The beginning
