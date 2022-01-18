# parse-static-imports

Gracefully parse ECMAScript [static imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) 💃

Will properly parse:

- default imports
- star imports, e.g. `import * as Foo from "foo";`
- named imports, even with an alias!
- side effect only imports, e.g. `import "./App.css";`
- multi-line imports, like:

  ```jsx
  import React, {
    useState,
    useCallback,
    useEffect
  } from "react";
  ```

while ignoring commented out imports (both line and block comments).

## Installation

```sh
npm install --save parse-static-imports
```

## Usage

```js
import fs from "fs";
import parseStaticImports from "parse-static-imports";

const file = fs.readFileSync("./path/to/file.js", "utf8");

const results = parseStaticImports(file);

console.log(JSON.stringify(results, null, 2));
```

## parseStaticImports

- `file`: `String` - Contents of a file containing static imports
- returns: `Object[]` - List of static imports found in the given file contents

The parseStaticImports() method returns a a list of objects whose properties
represent significant elements of the static import.

The returned list of objects will have the following properties:

| Attribute      | Type       | Default Value | Description                                                             |
| -------------- | ---------- | ------------- | ----------------------------------------------------------------------- |
| moduleName     | `String`   | N/A           | The name of the module imported or a relative path (e.g. `"react-dom"`) |
| starImport     | `String`   | `""`          | The name of the star imported module object, if present                 |
| namedImports   | `Object[]` | `[]`          | List of named imports as a list of objects                              |
| defaultImport  | `String`   | `""`          | The name of the default import, if present                              |
| sideEffectOnly | `Boolean`  | false         | If the import was side-effect only (e.g. `import "./App.css";`)         |

Named import objects have the form:

| Attribute | Type     | Default Value | Description                                                                                                                                                                      |
| --------- | -------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name      | `String` | N/A           | The name of the named import (e.g. `{ useState }`)                                                                                                                               |
| alias     | `String` | name          | Will be the alias of a named import if aliased, otherwise defaults to the named import (e.g. `import { foo /* the named import */ as bar /* the alias */ } from "module-name";`) |

## Example

Given the typical `create-react-app` scaffold file `src/App.js` ([source](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/src/App.js)):

```jsx
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
```

`parse-static-imports` will output the following:

```json
[
  {
    "moduleName": "react",
    "starImport": "",
    "namedImports": [],
    "defaultImport": "React",
    "sideEffectOnly": false
  },
  {
    "moduleName": "./logo.svg",
    "starImport": "",
    "namedImports": [],
    "defaultImport": "logo",
    "sideEffectOnly": false
  },
  {
    "moduleName": "./App.css",
    "starImport": "",
    "namedImports": [],
    "defaultImport": "",
    "sideEffectOnly": true
  }
]
```

By modifying the `create-react-app` `src/index.js` a bit ([source](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/src/index.js)), we can show the full power of `static-import-parser`:

```jsx
import React, { useState as useFoo } from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// let's even throw in a commonjs require for good measure 😉
const fs = require("fs");

render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
```

`parse-static-imports` will output the following:

```json
[
  {
    "moduleName": "react",
    "starImport": "",
    "namedImports": [
      {
        "name": "useState",
        "alias": "useFoo"
      }
    ],
    "defaultImport": "React",
    "sideEffectOnly": false
  },
  {
    "moduleName": "react-dom",
    "starImport": "",
    "namedImports": [
      {
        "name": "render",
        "alias": "render"
      }
    ],
    "defaultImport": "",
    "sideEffectOnly": false
  },
  {
    "moduleName": "./index.css",
    "starImport": "",
    "namedImports": [],
    "defaultImport": "",
    "sideEffectOnly": true
  },
  {
    "moduleName": "./App",
    "starImport": "",
    "namedImports": [],
    "defaultImport": "App",
    "sideEffectOnly": false
  },
  {
    "moduleName": "./serviceWorker",
    "starImport": "serviceWorker",
    "namedImports": [],
    "defaultImport": "",
    "sideEffectOnly": false
  }
]
```

Notice that `ReactDOM.render` was changed to a named import and we also name imported and aliased `React.useState` to `useFoo`. These both show up in the named exports locations of their respective packages where the former's `name` and `alias` are identical and the latter shows the alias that was used for `useState`.
