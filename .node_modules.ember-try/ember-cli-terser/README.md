
ember-cli-terser
==============================================================================

[![npm](https://img.shields.io/npm/v/ember-cli-terser.svg)](https://www.npmjs.com/package/ember-cli-terser)
[![Build Status](https://github.com/ember-cli/ember-cli-terser/workflows/CI/badge.svg)](https://github.com/ember-cli/ember-cli-terser/actions?query=workflow%3ACI)

[terser](https://github.com/terser/terser) integration to 
[ember-cli](http://cli.emberjs.com/) to minify your JavaScript.


Installation
------------------------------------------------------------------------------

```
ember install ember-cli-terser
```

Usage
------------------------------------------------------------------------------

After installing `ember-cli-terser` it will automatically hook into the build
pipeline and minify your JS files in production builds.

If you want to customize how `ember-cli-terser` is running terser under the
hood you have several configuration options available:

```js
// ember-cli-build.js

var app = new EmberApp({
  'ember-cli-terser': {
    enabled: true,

    exclude: ['vendor.js'],

    terser: {
      compress: {
        sequences: 50,
      },
      output: {
        semicolons: true,
      },
    },
  },
});
```


### Options

- `enabled?: boolean`: Enables/Disables minification (defaults to `true` for
  production builds, `false` for development builds)

- `exclude?: string[]`: A list of paths or globs to exclude from minification

- `terser?: TerserOptions`: A hash of [options](https://github.com/terser/terser#minify-options)
  that are passed directly to terser

If no `terser` option is passed, a default configuration will be used.

### Source Maps

Source maps are disabled by default for production builds in Ember CLI. If you
want to enable source maps for production builds you can configure that in your
`ember-cli-build.js` too:

```js
// ember-cli-build.js

var app = new EmberApp({
  sourcemaps: {
    enabled: true,
    extensions: ['js'],
  },
});
```


License
------------------------------------------------------------------------------
ember-cli-terser is licensed under the [MIT License](LICENSE.md).
