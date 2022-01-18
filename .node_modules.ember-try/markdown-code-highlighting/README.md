markdown-code-highlighting [![Build Status](https://travis-ci.org/Robdel12/markdown-code-highlighting.svg?branch=master)](https://travis-ci.org/Robdel12/markdown-code-highlighting) [![Ember Observer Score](http://emberobserver.com/badges/markdown-code-highlighting.svg)](http://emberobserver.com/addons/markdown-code-highlighting)
==============================================================================

An Ember addon for rendering markdown (marked.js) with syntax
highlighting from `highlight.js`


Installation
------------------------------------------------------------------------------

```
ember install markdown-code-highlighting
```

- Install the plugin: `ember install markdown-code-highlighting`
- In your Brocfile you'll need to import the CSS styling you want for
  the highlighter. You can see the [full list
  here](https://highlightjs.org/static/demo/). When you pick one
  you'll (like github.css) you'll import it by doing:
  `app.import("bower_components/highlightjs/styles/github.css");`
- Now format some markdown! Call the helper on anything that has
  markdown by doing: `{{format-markdown body}}`. `body` is what you're
  passing in.


Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd markdown-code-highlighting`
* `yarn install`

### Linting

* `yarn lint:js`
* `yarn lint:js --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `yarn test` – Runs `ember try:each` to test your addon against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
