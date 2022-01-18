# watch-detector
[![Build Status](https://travis-ci.org/chrmod/watch-detector.svg?branch=master)](https://travis-ci.org/chrmod/watch-detector)

Utility for selecting the best options for  `sane`:

watcher options:

* `watchman`: if a valid version of watchman is installed, we will prefer this.
* `node`: use node's built in watcher, if watchman is not present.


future options:

* `fs-events`: https://github.com/chrmod/watch-detector/issues/6


## usage

```sh
yarn add watch-detector
```

```js
const WatchDetector = require('watch-detector');
const sane = require('sane');

let detector = new WatchDetector();
let saneOptions = {
  /* sane options */
};

let options = detector.findBestWatcherOption(saneOptions)
/* options's watcher selection will be based on various heuristics */
sane(root, options);
```


## optional

```js
new WatchDetector({
  ui: /* console-ui instance */,
  fs: /* fs instance */
});
```
