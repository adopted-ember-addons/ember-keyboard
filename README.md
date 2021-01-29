<img alt="ember-keyboard logo" src="./tests/dummy/public/ember-keyboard.svg" height=72 /> &nbsp; 
[![npm version](https://badge.fury.io/js/ember-keyboard.svg)](https://badge.fury.io/js/ember-keyboard)
[![Build Status](https://travis-ci.org/adopted-ember-addons/ember-keyboard.svg?branch=master)](https://travis-ci.org/adopted-ember-addons/ember-keyboard)

# ember-keyboard

An Ember addon for painlessly supporting keyboard events

## Features

* Ember Octane-friendly template declarations for keyboard shortcuts
* Support for `keyup` and `keydown`, as well as the modifier keys: `ctrl`, `alt`, `shift`, and `meta`.
* Dynamic priority levels allow you to specify which components respond first to key events and under what circumstances. (Thanks to [`ember-key-responder`](https://github.com/yapplabs/ember-key-responder) for the inspiration)
* Human-readable key-mappings. (Thanks to [`ember-keyboard-service`](https://github.com/Fabriquartz/ember-keyboard-service) for the inspiration)

## Documentation & Demo

You can find interactive documentation [here](http://adopted-ember-addons.github.io/ember-keyboard/).

## Compatibility

* ember-keyboard 6.x requires Ember 3.8 or higher, and is not compatible with Internet Explorer
* For use with Ember 2.0 up to 3.8 or IE compatibility, use ember-keyboard 5.x.
* Node.js v10 or above (Node v14+ is required for fastboot)

## Accessibility Considerations
In order to avoid adding keyboard shortcuts to your application that are already in use by assistive technology, please review the existing keyboard shortcuts and gestures available today: https://dequeuniversity.com/screenreaders/.

## Installation

`ember install ember-keyboard`
