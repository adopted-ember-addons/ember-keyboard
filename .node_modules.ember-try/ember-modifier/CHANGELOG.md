## v2.1.1 (2020-09-17)

#### :bug: Bug Fix
* [#62](https://github.com/ember-modifier/ember-modifier/pull/62) Update minimum version of ember-destroyable-polyfill. ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#57](https://github.com/ember-modifier/ember-modifier/pull/57) Update documentation to use `assert` from `@ember/debug` for type narrowing ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 2
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.1.0 (2020-08-02)

#### :rocket: Enhancement
* [#55](https://github.com/ember-modifier/ember-modifier/pull/55) Update ember-destroyable-polyfill to 2.0.0. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.0.1 (2020-07-31)

#### :bug: Bug Fix
* [#54](https://github.com/ember-modifier/ember-modifier/pull/54) Update dependencies to fix issues with `@ember/destroyable`. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.0.0 (2020-07-30)

#### :boom: Breaking Change
* [#45](https://github.com/ember-modifier/ember-modifier/pull/45) Remove module unification support from blueprints. ([@rwjblue](https://github.com/rwjblue))
* [#31](https://github.com/ember-modifier/ember-modifier/pull/31) Drop support for Node 8 and 9 ([@chriskrycho](https://github.com/chriskrycho))

#### :rocket: Enhancement
* [#46](https://github.com/ember-modifier/ember-modifier/pull/46) Use `ember-cli-htmlbars` for inline precompilation in blueprints. ([@rwjblue](https://github.com/rwjblue))
* [#41](https://github.com/ember-modifier/ember-modifier/pull/41) TS: upgrade to 3.9; implement RFC for type stability ([@chriskrycho](https://github.com/chriskrycho))
* [#38](https://github.com/ember-modifier/ember-modifier/pull/38) Deprecate the `willRemove` hook for class based modifiers. ([@chriskrycho](https://github.com/chriskrycho))
* [#23](https://github.com/ember-modifier/ember-modifier/pull/23) Convert the addon to TypeScript ([@chriskrycho](https://github.com/chriskrycho))

#### :bug: Bug Fix
* [#48](https://github.com/ember-modifier/ember-modifier/pull/48) Migrate to `@ember/destroyable` for destruction. ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#39](https://github.com/ember-modifier/ember-modifier/pull/39) Update README Table of Contents w/Philosophy section ([@chriskrycho](https://github.com/chriskrycho))
* [#1](https://github.com/ember-modifier/ember-modifier/pull/1) Adds a philosophy section to the guide ([@pzuraq](https://github.com/pzuraq))
* [#22](https://github.com/ember-modifier/ember-modifier/pull/22) Fix arguments destructuring in `README.md` ([@MrChocolatine](https://github.com/MrChocolatine))
* [#15](https://github.com/ember-modifier/ember-modifier/pull/15) Fix incorrect `makeFunctionalModifier` reference in `README.md` ([@tomwayson](https://github.com/tomwayson))

#### :house: Internal
* [#49](https://github.com/ember-modifier/ember-modifier/pull/49) Refactor / cleanup owner usage in modifier manager APIs. ([@rwjblue](https://github.com/rwjblue))
* [#47](https://github.com/ember-modifier/ember-modifier/pull/47) Update addon blueprint from `ember-cli@3.13` to `ember-cli@3.20` ([@rwjblue](https://github.com/rwjblue))
* [#34](https://github.com/ember-modifier/ember-modifier/pull/34) Add Prettier, configured according to [emberjs/rfcs#628](https://github.com/emberjs/rfcs/pull/628) ([@chriskrycho](https://github.com/chriskrycho))
* [#36](https://github.com/ember-modifier/ember-modifier/pull/36) Run TS tests in parallel in CI ([@chriskrycho](https://github.com/chriskrycho))
* [#30](https://github.com/ember-modifier/ember-modifier/pull/30) Support linting TS, and test types ([@chriskrycho](https://github.com/chriskrycho))
* [#16](https://github.com/ember-modifier/ember-modifier/pull/16) Use `release-it` and `lerna-changelog` to manage releases ([@elwayman02](https://github.com/elwayman02))

#### Committers: 6
- Chris Garrett ([@pzuraq](https://github.com/pzuraq))
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Jordan Hawker ([@elwayman02](https://github.com/elwayman02))
- Maxime Zanot ([@MrChocolatine](https://github.com/MrChocolatine))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Tom Wayson ([@tomwayson](https://github.com/tomwayson))


## v1.0.4 (2020-07-30)

#### :bug: Bug Fix
* [#50](https://github.com/ember-modifier/ember-modifier/pull/50) Avoid issuing a deprecation during destruction on Ember 3.20+ ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## 1.0.3 (2020-01-23)

#### :bug: Bug Fix
* [#13](https://github.com/ember-modifier/ember-modifier/pull/13) Fix issues with `Symbol` usage on IE11 ([@raido](https://github.com/raido))

#### Committers: 1
- Raido Kuli ([@raido](https://github.com/raido))


## 1.0.2 (2019-10-31)

#### :rocket: Enhancement
* [#6](https://github.com/ember-modifier/ember-modifier/pull/6) Add blueprint ([@spencer516](https://github.com/spencer516))

#### :memo: Documentation
* [#4](https://github.com/ember-modifier/ember-modifier/pull/4) Fix modifier class import in README ([@asakusuma](https://github.com/asakusuma))

#### Committers: 2
- Asa Kusuma ([@asakusuma](https://github.com/asakusuma))
- Spencer P ([@spencer516](https://github.com/spencer516))

