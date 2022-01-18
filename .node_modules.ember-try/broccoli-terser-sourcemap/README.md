[![Build Status](https://travis-ci.org/ember-cli/broccoli-terser-sourcemap.svg?branch=master)](https://travis-ci.org/ember-cli/broccoli-terser-sourcemap)

A broccoli filter that applies [terser](https://github.com/terser/terser) to
minify code while properly generating or maintaining sourcemaps.

### installation

```sh
npm install --save broccoli-terser-sourcemap
```

### usage

```js
const Terser = require('broccoli-terser-sourcemap');

// basic usage
let minified = new Terser(input);

// advanced usage
let minified = new Terser(input, {
  exclude: [..], // array of globs, to not minify

  terser: {
    mangle: false,    // defaults to true
    compress: false,  // defaults to true
    sourceMap: false, // defaults to true
    //...
  },

  publicUrl: 'https://myamazingapp.com/', // value to be prepended to sourceMappingURL, defaults to ''
  hiddenSourceMap: false, // skips adding the reference to sourcemap in the minified JS, defaults to false

  concurrency: 3 // number of parallel workers, defaults to number of CPUs - 1
});
```

To disable parallelization:

```
$ JOBS=0
$ JOBS=1
```
