# ember-angle-bracket-invocation-polyfill

This addon provides a polyfill for angle bracket invocation syntax as described
in [RFC 311](https://github.com/emberjs/rfcs/pull/311) and [RFC
457](https://emberjs.github.io/rfcs/0457-nested-lookups.html). It's the same
components you know and love, no longer surrounded by mustaches. \o/

[![Build Status](https://travis-ci.org/rwjblue/ember-angle-bracket-invocation-polyfill.svg?branch=master)](https://travis-ci.org/rwjblue/ember-angle-bracket-invocation-polyfill)

## Installation

```
ember install ember-angle-bracket-invocation-polyfill
```

You will additionally need to ensure ember-cli-htmlbars-inline-precompile is at least version 1.0.3.

## Usage

The best usage guide are the RFCs themselves
([emberjs/rfcs#311](https://emberjs.github.io/rfcs/0311-angle-bracket-invocation.html)
[emberjs/rfcs#457](https://emberjs.github.io/rfcs/0457-nested-lookups.html)),
but here are a few examples of "before"/"after" to whet your appetite:

**Before**:

```hbs
{{site-header user=this.user class=(if this.user.isAdmin "admin")}}

{{#super-select selected=this.user.country as |s|}}
  {{#each this.availableCountries as |country|}}
    {{#s.option value=country}}{{country.name}}{{/s.option}}
  {{/each}}
{{/super-select}}
```

**After**:

```hbs
<SiteHeader @user={{this.user}} class={{if this.user.isAdmin "admin"}} />

<SuperSelect @selected={{this.user.country}} as |s|>
  {{#each this.availableCountries as |country|}}
    <s.option @value={{country}}>{{country.name}}</s.option>
  {{/each}}
</SuperSelect>
```

### Supported Features

- Supports invoking components via angle brackets using TitleCase

```hbs
<FooBar></FooBar>
```

- Supports invoking components via angle brackets with self-closing syntax

```hbs
<FooBar />
```

- Supports invoking components via angle brackets using paths

```hbs
<some.thing></some.thing>
```

- Supports invoking components via angle brackets using yielded block params

```hbs
{{#with (component 'foo-bar') as |Foo|}}
  <Foo></Foo>
{{/with}}
```

- Supports passing arguments into invoked components with `@` prefix

```hbs
<FooBar @title={{whateverHere}}></FooBar>
```

- Supports passing attributes to be added to the root element of the component without `@` prefix

```hbs
<FooBar data-test-foo-bar></FooBar>
```

- Supports using `has-block` _inside_ the invoked component to determine if a block was provided

```hbs
<FooBar /> {{! checking `has-block` inside would be `false`}}

<FooBar></FooBar> {{! checking `has-block` inside would be `true`}}
```

- Supports yielding block params from inside the invoked component

```hbs
<FooBar as |qux|>{{qux}}</FooBar>
```

- Supports passing `...attributes` into another angle bracket invocation

```hbs
<FooBar ...attributes>
```

- Supports passing `...attributes` into a non-component element

```hbs
<div ...attributes></div>
```

- Supports passing `...attributes` into tagless components
- Supports invoking single word components:

```hbs
<Title />
```

- Supports invoking components nested in subfolders:

```
<Foo::Bar />
```

- Completely inert when running Ember 3.10 or higher
- Supports Ember 2.12, 2.16, 2.18, 3.1, 3.2, 3.3, 3.4, 3.8, 3.9
- Test all the features listed above 😘

### Addons

Any addons wanting to use angle bracket components (in either addon/ or addon-test-support/) need to install `ember-angle-bracket-invocation-polyfill` as a dependency.

## Limitations

There are no known limitations, all features described in the RFC are polyfilled.

## Contributing

### Installation

- `git clone <repository-url>`
- `cd ember-angle-bracket-invocation-polyfill`
- `yarn install`

### Linting

- `yarn lint:js`
- `yarn lint:js --fix`

### Running tests

- `ember test` – Runs the test suite on the current Ember version
- `ember test --server` – Runs the test suite in "watch mode"
- `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

- `ember serve`
- Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## License

This project is licensed under the [MIT License](LICENSE.md).
