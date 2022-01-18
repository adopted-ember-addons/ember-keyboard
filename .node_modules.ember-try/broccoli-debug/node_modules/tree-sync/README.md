# TreeSync [![Build Status](https://travis-ci.org/stefanpenner/tree-sync.svg?branch=master)](https://travis-ci.org/stefanpenner/tree-sync) [![Build status](https://ci.appveyor.com/api/projects/status/7136sbfmybx6q7w2?svg=true)](https://ci.appveyor.com/project/embercli/tree-sync)

A module for repeated efficient synchronizing two directories.

```js
// input/a/{a.js,b.js}
// output/

var tree = new TreeSync('input', 'output')
tree.sync();
// output is now contains copies of everything that is in input

fs.unlink('/input/a/b/js');

// input / output have diverged

tree.sync();

// difference is calculated and efficient patch to update `output` is created and applied
```
