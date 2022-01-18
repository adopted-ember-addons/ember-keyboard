# ember-on-helper

[![Build Status](https://travis-ci.org/buschtoens/ember-on-helper.svg)](https://travis-ci.org/buschtoens/ember-on-helper)
[![npm version](https://badge.fury.io/js/ember-on-helper.svg)](http://badge.fury.io/js/ember-on-helper)
[![Download Total](https://img.shields.io/npm/dt/ember-on-helper.svg)](http://badge.fury.io/js/ember-on-helper)
[![Ember Observer Score](https://emberobserver.com/badges/ember-on-helper.svg)](https://emberobserver.com/addons/ember-on-helper)
[![Ember Versions](https://img.shields.io/badge/Ember.js%20Versions-%5E2.18%20%7C%7C%20%5E3.0-brightgreen.svg)](https://travis-ci.org/buschtoens/ember-on-helper)
[![ember-cli Versions](https://img.shields.io/badge/ember--cli%20Versions-%5E2.13%20%7C%7C%20%5E3.0-brightgreen.svg)](https://travis-ci.org/buschtoens/ember-on-helper)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![dependencies](https://img.shields.io/david/buschtoens/ember-on-helper.svg)](https://david-dm.org/buschtoens/ember-on-helper)
[![devDependencies](https://img.shields.io/david/dev/buschtoens/ember-on-helper.svg)](https://david-dm.org/buschtoens/ember-on-helper)

An `{{on}}` template helper complimentary to the
[RFC #471 "`{{on}}` modifier"](https://github.com/emberjs/rfcs/blob/master/text/0471-on-modifier.md).

## Installation

```
ember install ember-on-helper
```

#### Compatibility

- Ember.js v2.18 or above
- ember-cli v2.13 or above

## But why?

You would use the `{{on}}` _modifier_ to register event listeners on elements
that are in the realm of your current template. But sometimes you need to
register event listeners on elements or even on generic `EventTarget`s that are
outside of the control of your template, e.g. `document` or `window`.

> ⚠️👉 **WARNING:** Do not overuse this helper. If you want to bind to an
> element that _is_ controlled by Glimmer, but maybe just not by the current
> template, _do not_ reach for a manual `document.querySelector()`. Instead,
> think about your current template and state setup and try to use a true "Data
> Down, Actions Up" pattern or use a shared `Service` as a message bus.

## Usage

Pretty much exactly the same as the `{{on}}` modifier, except for that the
`{{on}}` helper expects one more positional parameter upfront: the `evenTarget`.

```hbs
{{on eventTarget eventName eventListener}}
```

As with the `{{on}}` modifier, you can also pass optional event options as named
parameters:

```hbs
{{on eventTarget eventName eventListener capture=bool once=bool passive=bool}}
```

### Simple Example

```hbs
Click anywhere in the browser window, fam.

{{on this.document "click" this.onDocumentClick}}
```

```ts
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TomstersWitnessComponent extends Component {
  document = document;

  @action
  onDocumentClick(event: MouseEvent) {
    console.log(
      'Do you have a minute to talk about our Lord and Savior, Ember.js?'
    );
  }
}
```

This is essentially equivalent to:

```ts
didInsertElement() {
  super.didInsertElement();

  document.addEventListener('click', this.onDocumentClick);
}
```

In addition to the above `{{on}}` will properly tear down the event listener,
when the helper is removed from the DOM. It will also re-register the event
listener, if any of the passed parameters change.

The [`@action` decorator][@action] is used to bind the `onDocumentClick` method
to the component instance. This is not strictly required here, since we do not
access `this`, but in order to not break with established patterns, we do it
anyway.

[@action]: https://github.com/emberjs/rfcs/blob/master/text/0408-decorators.md#method-binding

### Listening to Events on `window` or `document`

You will often want to use the `{{on}}` helper to listen to events which are
emitted on `window` or `document`. Because providing access to these globals in
the template as shown in **[Simple Example][#simple-example]** is quite
cumbersome, `{{on}}` brings two friends to the party:

- `{{on-document eventName eventListener}}`
- `{{on-window eventName eventListener}}`

They work exactly the same way as `{{on}}` and also accept event options.

### Listening to Multiple Events

You can use the `{{on}}` helper multiple times in the same element, even for
the same event.

```hbs
{{on this.someElement "click" this.onClick}}
{{on this.someElement "click" this.anotherOnClick}}
{{on this.someElement "mousemove" this.onMouseMove}}
```

### Event Options

All named parameters will be passed through to
[`addEventListener`][addeventlistener] as the third parameter, the options hash.

[addeventlistener]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener

```hbs
{{on-document "scroll" this.onScroll passive=true}}
```

This is essentially equivalent to:

```ts
didInsertElement() {
  super.didInsertElement();

  document.addEventListener('scroll', this.onScroll, { passive: true });
}
```

#### `once`

To fire an event listener only once, you can pass the [`once` option][addeventlistener-parameters]:

```hbs
{{on-window "click" this.clickOnlyTheFirstTime once=true}}
{{on-window "click" this.clickEveryTime}}
```

`clickOnlyTheFirstTime` will only be fired the first time the page is clicked.
`clickEveryTime` is fired every time the page is clicked, including the first
time.

[addeventlistener-parameters]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Parameters

#### `capture`

To listen for an event during the capture phase already, use the [`capture` option][addeventlistener-parameters]:

```hbs
{{on-document "click" this.triggeredFirst capture=true}}

<button {{on "click" this.triggeredLast}}>
  Click me baby, one more time!
</button>
```

#### `passive`

If `true`, you promise to not call `event.preventDefault()`. This allows the
browser to optimize the processing of this event and not block the UI thread.
This prevent scroll jank.

If you still call `event.preventDefault()`, an assertion will be raised.

```hbs
{{on-document "scroll" this.trackScrollPosition passive=true}}>
```

#### Internet Explorer 11 Support

Internet Explorer 11 has a buggy and incomplete implementation of
`addEventListener`: It does not accept an
[`options`][addeventlistener-parameters] parameter and _sometimes_ even throws
a cryptic error when passing options.

This is why this addon ships a tiny [ponyfill][ponyfill] for `addEventLisener`
that is used internally to emulate the `once`, `capture` and `passive` option.
This means that all currently known [`options`][addeventlistener-parameters] are
polyfilled, so that you can rely on them in your logic.

[ponyfill]: https://github.com/sindresorhus/ponyfill

### Currying / Partial Application

If you want to curry the function call / partially apply arguments, you can do
so using the [`{{fn}}` helper][fn-helper]:

[fn-helper]: https://github.com/emberjs/rfcs/blob/master/text/0470-fn-helper.md

```hbs
{{#each this.videos as |video|}}
  {{on video.element "play" (fn this.onPlay video)}}
  {{on video.element "pause" (fn this.onPause video)}}
{{/each}}
```

```ts
import Component from '@ember/component';
import { action } from '@ember-decorators/object';

interface Video {
  element: HTMLVideoElement;
  title: string;
}

export default class UserListComponent extends Component {
  videos: Video[];

  @action
  onPlay(video: Video, event: MouseEvent) {
    console.log(`Started playing '${video.title}'.`);
  }

  @action
  onPlay(video: Video, event: MouseEvent) {
    console.log(`Paused '${video.title}'.`);
  }
}
```

### `preventDefault` / `stopPropagation` / `stopImmediatePropagation`

The old [`{{action}}` modifier][action-event-propagation] used to allow easily
calling `event.preventDefault()` like so:

```hbs
<a href="/" {{action this.someAction preventDefault=true}}>Click me</a>
```

[action-event-propagation]: https://www.emberjs.com/api/ember/release/classes/Ember.Templates.helpers/methods/action?anchor=action#event-propagation

You also could easily call `event.stopPropagation()` to avoid bubbling like so:

```hbs
<a href="/" {{action this.someAction bubbles=false}}>Click me</a>
```

You can still do this using [`ember-event-helpers`][ember-event-helpers]:

[ember-event-helpers]: https://github.com/buschtoens/ember-event-helpers

```hbs
<a href="/" {{on "click" (prevent-default this.someAction)}}>Click me</a>
```

```hbs
<a href="/" {{on "click" (stop-propagation this.someAction)}}>Click me</a>
```

## Attribution

This addon is a straight copy of [`ember-on-modifier`][ember-on-modifier], the
polyfill for the `{{on}}` modifier.

[ember-on-modifier]: https://github.com/buschtoens/ember-on-modifier
