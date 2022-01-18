# babel-plugin-ember-data-packages-polyfill

[![Greenkeeper badge](https://badges.greenkeeper.io/ember-data/babel-plugin-ember-data-packages-polyfill.svg)](https://greenkeeper.io/)

> This plugin transforms [Packages API](https://github.com/emberjs/rfcs/blob/master/text/0395-ember-data-packages.md)
> import statements back to the legacy "DS" EmberData import syntax

## Example

```js
import Model, { attr, belongsTo, hasMany } from "@ember-data/model"
```
back to the legacy
```js
import DS from 'ember-data';
const Model = DS.Model;
const attr = DS.attr;
const belongsTo = DS.belongsTo;
const hasMany = DS.hasMany;
```

## Installation

`npm install --save babel-plugin-ember-data-packages-polyfill`

## Why

This plugin provides an API polyfill to allow ember addon and app authors to adopt the
[Packages API](https://github.com/emberjs/rfcs/blob/master/text/0395-ember-data-packages.md)
whilst still maintaining backwards compatibility with older versions of EmberData 
that do not support this API.

The intention of this Babel Plugin is to also allow for a transition period and allow
applications to exist in a mixed state whilst transitioning from the old imports to the
new imports.

It also allows addons that only need to use a small amount of EmberData to do so while
still supporting applications using all of EmberData.

# How

Using the [@ember-data/rfc395-data](https://github.com/ember-data/ember-data-rfc395-data)
package, that contains the official mapping of old imports to new package imports, addons
that adopt the new package imports can be transpiled back to the legacy format if 
`ember-cli-babel` detects  that the host application ember version does not support the
new modules API.

The plugin supports both default `import Model from "@ember-data/model"` and named
`import { attr } from "@ember-data/model"` import statements, converting their syntax back
to separate `const` variables within the source file. This transpilation is done at 
compile time by EmberCLI using `ember-cli-babel`.

In order for ember addon developers to adopt this new API syntax, they must declare a 
dependency on `ember-cli-babel:v7.14.0` or above in their `package.json`:

```json
{
  "dependencies": {
    "ember-cli-babel": "^7.14.0"
  }
}
```
