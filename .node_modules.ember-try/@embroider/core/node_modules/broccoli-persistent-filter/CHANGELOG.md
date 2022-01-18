## v3.1.2 (2020-10-22)

#### :bug: Bug Fix
* [#207](https://github.com/broccolijs/broccoli-persistent-filter/pull/207) getDestFilePath: handle non-existent (deleted/moved) files ([@jamescdavis](https://github.com/jamescdavis))

#### Committers: 1
- James C. Davis ([@jamescdavis](https://github.com/jamescdavis))

## v3.1.1 (2020-08-28)

#### :bug: Bug Fix
* [#205](https://github.com/broccolijs/broccoli-persistent-filter/pull/205) Handle case where there's a cached dependencies object, but no dependencies. ([@chriseppstein](https://github.com/chriseppstein))
* [#204](https://github.com/broccolijs/broccoli-persistent-filter/pull/204) Remove deprecated `mkdirp` dependency ([@jrjohnson](https://github.com/jrjohnson))

#### :house: Internal
* [#198](https://github.com/broccolijs/broccoli-persistent-filter/pull/198) Downgrade to @types/node v10 so that it matches this project's stated… ([@chriseppstein](https://github.com/chriseppstein))

#### Committers: 2
- Chris Eppstein ([@chriseppstein](https://github.com/chriseppstein))
- Jonathan Johnson ([@jrjohnson](https://github.com/jrjohnson))

# 3.1.0

* Separate typescript source files into their own directory to fix a typescript issue

# 3.0.1

* add tests to verify the file property on errors is correct
* mark some options as optional

# 3.0.0

* dependency tracking now uses fs-merger
* port to typescript and associated cleanup
* drop Node 8 & 6

# 2.3.1

* Normalize all paths used in dependency tracking

# 2.3.0

* add optional enhanced dependency tracking

# 2.2.3

* skip applyPatches phase, if no patches exist

# 2.2.2

* Bump hash-for-dep fixing https://github.com/emberjs/ember.js/issues/17678 (#161)

# 2.2.0

* no longer write to own symlinks created
* add heimdall node specifically for handling files

# 2.1.1

* [BUGFIX] FORCE_PERSISTENCE_IN_CI should not override persist option (#149)

# 2.1.0

* disable cache in CI

# 2.0.0

* drop old node support
* modernize codebase
* upgrade dpes

# 1.4.3

* use node's own crypto library

# 1.2.11

* instrument walkSync times

# 1.2.10

* Add some info level logging (build summaries)

# 1.2.9

* improve logging, add some information at INFO level and not only DEBUG

# 1.2.8

* reduce package size with explicit `files` in `package.json`

# 1.2.7

* switch to heimdalljs-logger, allowing logs to show context within the broccoli
  graph

# 1.2.6

* update walk-sync, now correctly sorts directories
* update fs-tree, fixes the "rename only file in directory bug", possible performance improvements
* travis now tests against all versions of node that ember-cli supports

# 1.2.5

* remove leftover debugger
* add jshint to tests

# 1.2.4

* [logging] remove selfTime from counters

# 1.2.3

* improve debug logging, less verbose by default, but more verbose with opt-in DEBUG_VERBOSE=true

# 1.2.2

* revert FSTreeDiff update

# 1.2.1

* upgrade FSTreeDiff

# 1.2.0

* [#50](https://github.com/stefanpenner/broccoli-persistent-filter/pull/50) Add ability to return an object (must be `JSON.stringify`able) from `processString`.
* [#50](https://github.com/stefanpenner/broccoli-persistent-filter/pull/50) Add `postProcess` hook that is called after `processString` (both when cached and not cached).

# 1.0.0

* Forked from broccoli-filter
