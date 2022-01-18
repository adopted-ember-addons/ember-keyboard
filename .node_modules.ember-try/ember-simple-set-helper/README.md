# ember-simple-set-helper

A(nother) better `mut` helper!

```hbs
{{this.greeting}}

<button {{on "click" (set this.greeting "Hello!")}}>
  English
</button>

<button {{on "click" (fn (set this.greeting) "Hola!")}}>
  Español
</button>
```

This addon is a more direct replacement for Ember's `mut` helper than other
alternatives (such as [ember-set-helper](https://github.com/pzuraq/ember-set-helper)).

## Usage

The `{{set}}` helper returns a function that sets a value. This can be used in
combination with Ember's `{{on}}` modifier or component actions to update state
without having to write your own custom action. For simple cases, this is pretty
handy:

```hbs
<button {{on "click" (set this.greeting "Hello!")}}>
  English
</button>
```

### Setting Passed Values

If you do not provide a value to the `set` helper, it will set the value that is
provided to it when called. For example:

```hbs
<!-- app/components/counter.hbs -->
{{this.count}}

<button {{on "click" this.updateCount}}>Add 1</button>
```

```js
// app/components/counter.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Counter extends Component {
  @tracked count = 0;

  @action
  updateCount() {
    this.count++;

    if (this.args.onClick) {
      this.args.onClick(this.count);
    }
  }
}
```

```hbs
<!-- usage -->
<Counter @onClick={{set this.currentCount}} />
```

This will set the value of `this.currentCount` to whatever value is passed to it
when it is called (in this case the `count` of the counter component whenever a
user clicks the button).

### Differences from `mut`

- No need to call wrap the helper (e.g. `(set this.foo)` === `(fn (mut this.foo))`)
- Optional last parameter if setting a static value (e.g. `(set this.foo "bar")` === `(fn (mut this.foo) "bar")`)
- Cannot be used as both a getter and setter for the value, only provides a setter

### Differences from `ember-set-helper`

- No ability to use placeholder syntax

## Compatibility

- Ember.js v3.4 or above
- Ember CLI v2.13 or above
- Node.js v8 or above

## Installation

```
ember install ember-simple-set-helper
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
