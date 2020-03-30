[![npm version](https://badge.fury.io/js/ember-keyboard.svg)](https://badge.fury.io/js/ember-keyboard)
[![Build Status](https://travis-ci.org/adopted-ember-addons/ember-keyboard.svg?branch=master)](https://travis-ci.org/adopted-ember-addons/ember-keyboard)

# ember-keyboard

`ember-keyboard`, an Ember addon for the painless support of keyboard events.

## Features

* Dynamic priority levels allow you to specify which components respond first to key events and under what circumstances. (Thanks to [`ember-key-responder`](https://github.com/yapplabs/ember-key-responder) for the inspiration)
* Human-readable key-mappings. (Thanks to [`ember-keyboard-service`](https://github.com/Fabriquartz/ember-keyboard-service) for the inspiration)
* Support for `keyup`, `keydown`, and `keypress`, as well as the modifier keys: `ctrl`, `alt`, `shift`, and `meta`.
* Compatible with Ember 2.0+.

## Accessibility Considerations
In order to avoid adding keyboard shortcuts to your application that are already in use by assistive technology, please review the existing keyboard shortcuts and gestures available today: https://dequeuniversity.com/screenreaders/.

## Installation

`ember install ember-keyboard`

## Documentation & Demo

You can find interactive documentation [here](http://adopted-ember-addons.github.io/ember-keyboard/).
