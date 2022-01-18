# babel-plugin-filter-imports

[![Build Status](https://travis-ci.org/ember-cli/babel-plugin-filter-imports.svg?branch=master)](https://travis-ci.org/ember-cli/babel-plugin-filter-imports)
[![npm](https://img.shields.io/npm/v/babel-plugin-filter-imports.svg?style=flat)](https://www.npmjs.com/package/babel-plugin-filter-imports)
[![Greenkeeper badge](https://badges.greenkeeper.io/ember-cli/babel-plugin-filter-imports.svg)](https://greenkeeper.io/)

This babel plugin is used to removed references to imports within a module. This can be useful for removing debugging statements when doing a production build of your code. It is often used in conjunction with other tools like Uglify that perform dead code elimination.

## Installation

```sh
$ yarn add --dev babel-plugin-filter-imports
```

*This plugin is for Babel 7. If you need to support:*
- *Babel 6 use the [babel6](https://github.com/ember-cli/babel-plugin-filter-imports/tree/babel6) branch*
- *Babel 5 use the [v0.2.x](https://github.com/ember-cli/babel-plugin-filter-imports/tree/v0.2.x) branch*


## Example

Given the `.babelrc`

```json
{
  "plugins": [["filter-imports", {
    "imports": {
      "debugging-tools": [ "warn" ]
    }
  }]]
}
```

the module

```js
import { warn } from 'debugging-tools';

function join(args, sep) {
  if (arguments.length > 2) {
    warn("join expects at most 2 arguments");
  }
  return args.join(sep);
}
```

will be transformed to

```js
function join(args, sep) {
  if (arguments.length > 2) {
  }
  return args.join(sep);
}
```

## Configuration

- `options[keepImports]` `[Boolean]`: An flag that indicates imports removal from header.
- `options[imports]` `[Object]`: An object whose keys are names of modules.
- `options[imports][moduleName]` `[String]`: An array of names of imports from `moduleName` to be removed. You can include `'default'` for default export and `'*'` for a namespace export.

## Upgrade to `1.x`/`2.x`

There were breaking changes in the plugin configuration, you must update it to work correctly.

##### Before `1.x`

```json
{
  "plugins": [["filter-imports", {
    "debugging-tools": [ "warn" ]
  }]]
}
```

##### After

```json
{
  "plugins": [["filter-imports", {
    "imports": {
      "debugging-tools": [ "warn" ]
    }
  }]]
}
```
