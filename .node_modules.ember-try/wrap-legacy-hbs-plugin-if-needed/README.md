# wrap-legacy-hbs-plugin-if-needed

[![Build Status](https://github.com/stefanpenner/wrap-legacy-hbs-plugin-if-needed/workflows/CI/badge.svg)](https://github.com/stefanpenner/wrap-legacy-hbs-plugin-if-needed/actions?workflow=CI)

This is a module that few should need to use, so if your not sure what this is
you likely dont need to care. It exists to avoid copy/pasting the code between
ember/embroider/ember-cli-htmlbars.

such time as it is not longer needed, or ember provides the helper itself and
all versions of ember which do not have become EOL.

 
## Usage

```sh
yarn add wrap-legacy-hbs-plugin-if-needed
```

```js
// ESModules
import wrapLegacyPluginIfNeeded from 'wrap-legacy-hbs-plugin-if-needed';

const wrappedIfNeededPlugin = wrapLegacyPluginIfNeeded(legacyOrModernHbsPlugin)
```


```js
// CJS
const { default: wrapLegacyPluginIfNeeded } = require('wrap-legacy-hbs-plugin-if-needed');

const wrappedIfNeededPlugin = wrapLegacyPluginIfNeeded(legacyOrModernHbsPlugin)
```
