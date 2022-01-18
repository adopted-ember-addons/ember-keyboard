# broccoli-merge-trees
![CI](https://github.com/broccolijs/broccoli-merge-trees/workflows/CI/badge.svg)

Copy multiple trees of files on top of each other, resulting in a single merged tree.

## Installation

```bash
npm install --save-dev broccoli-merge-trees
```

## Usage

* As a `function call`
```js
const broccoliMergeTrees = require('broccoli-merge-trees');

let mergedNode = broccoliMergeTrees(inputNodes, options);
```

* With `new`
```js
const { MergeTrees } = require('broccoli-merge-trees');

let mergedNode = new MergeTrees(inputNodes, options);
```

* **`inputNodes`**: An array of nodes, whose contents will be merged

* **`options`**: A hash of options

### Options

* `overwrite`: By default, broccoli-merge-trees throws an error when a file
  exists in multiple nodes. If you pass `{ overwrite: true }`, the output
  will contain the version of the file as it exists in the last input
  node that contains it.

* `annotation`: A note to help tell multiple plugin instances apart.

* `destDir`: A string representing the destination path that merged files will be copied to.

### Example

If this is your `Brocfile.js`:

```js
const mergeTrees = require('broccoli-merge-trees');

module.exports = function() {
  return mergeTrees(['public','scripts']);
};
```

And your project contains these files:

    .
    ├─ public
    │  ├─ index.html
    │  └─ images
    │     └─ logo.png
    ├─ scripts
    │  └─ app.js
    ├─ Brocfile.js
    …

Then running `broccoli build the-output` will generate this folder:

    the-output
    ├─ app.js
    ├─ index.html
    └─ images
       └─ logo.png

The parent folders, `public` and `scripts` in this case, are not included in the output. The output tree contains only the files *within* each folder, all mixed together.

------

If this is your `Brocfile.js`:

```js
var BroccoliMergeTrees = require('broccoli-merge-trees');

module.exports = new BroccoliMergeTrees(['public', 'scripts'], {
    destDir: 'assets'
});
```
Then running `broccoli build the-output` will generate this folder:

    the-output
    └─ assets
        ├─ app.js
        ├─ index.html
        └─ images
        └─ logo.png

## Contributing

Clone this repo and run the tests like so:

```
npm install
npm test
```

Issues and pull requests are welcome. If you change code, be sure to re-run
`npm test`. Oftentimes it's useful to add or update tests as well.
