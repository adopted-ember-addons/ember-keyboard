## v3.0.0 (2020-10-09)

#### :boom: Breaking Change
* [#124](https://github.com/ember-polyfills/ember-angle-bracket-invocation-polyfill/pull/124) Drop Node < 10 support; Upgrade ember-cli-babel to v7 ([@nlfurniss](https://github.com/nlfurniss))

#### Committers: 1
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))


## v2.1.0 (2020-06-05)

#### :rocket: Enhancement
* [#91](https://github.com/ember-polyfills/ember-angle-bracket-invocation-polyfill/pull/91) Ensure polyfill works for Engines ([@pgengler](https://github.com/pgengler))

#### :memo: Documentation
* [#90](https://github.com/ember-polyfills/ember-angle-bracket-invocation-polyfill/pull/90) Update README with a section on usage within addons ([@Techn1x](https://github.com/Techn1x))

#### Committers: 4
- Brad Overton ([@Techn1x](https://github.com/Techn1x))
- David Tang ([@skaterdav85](https://github.com/skaterdav85))
- Phil Gengler ([@pgengler](https://github.com/pgengler))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v2.0.2 (2019-08-06)

#### :bug: Bug Fix
* [#82](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/82) Fix <LinkTo> usage with `class` attribute. ([@Alonski](https://github.com/Alonski))

#### :house: Internal
* [#84](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/84) Refresh `yarn.lock` ([@simonihmig](https://github.com/simonihmig))

#### Committers: 2
- Alon Bukai ([@Alonski](https://github.com/Alonski))
- Simon Ihmig ([@simonihmig](https://github.com/simonihmig))

## v2.0.1 (2019-08-02)

#### :bug: Bug Fix
* [#79](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/79) Fix transform to not touch native <input> ([@simonihmig](https://github.com/simonihmig))

#### Committers: 1
- Simon Ihmig ([@simonihmig](https://github.com/simonihmig))

## v2.0.0 (2019-08-02)

#### :boom: Breaking Change
* [#74](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/74) Drop node 6, 9, and 11 support. ([@simonihmig](https://github.com/simonihmig))

#### :rocket: Enhancement
* [#75](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/75) Add polyfill for <Input> and <Textarea> ([@simonihmig](https://github.com/simonihmig))
* [#72](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/72) Add polyfill for angle brackets <LinkTo> ([@simonihmig](https://github.com/simonihmig))

#### :bug: Bug Fix
* [#77](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/77) Ensure unsupported arguments to `<Input>` and `<LinkTo>` issue warnings or errors appropriately ([@simonihmig](https://github.com/simonihmig))
* [#76](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/76) Add assertion for not passing @model and @models to <LinkTo> ([@simonihmig](https://github.com/simonihmig))

#### :house: Internal
* [#73](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/73) Drop ember-cli-eslint in favor of plain eslint ([@simonihmig](https://github.com/simonihmig))
* [#63](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/63) Run class merging test on 3.9.1. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Simon Ihmig ([@simonihmig](https://github.com/simonihmig))

## v1.3.1 (2019-05-08)

#### :bug: Bug Fix
* [#68](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/68) Fix error when using splattributes but no attributes were passed ([@simonihmig](https://github.com/simonihmig))

#### Committers: 1
- Simon Ihmig ([@simonihmig](https://github.com/simonihmig))

## v1.3.0 (2019-04-08)

#### :rocket: Enhancement
* [#59](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/59) Add support for nested invocation with `::` ([@rtablada](https://github.com/rtablada))

#### :house: Internal
* [#60](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/60) Add ember-lts-3.8 to CI setup. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Ryan Tablada ([@rtablada](https://github.com/rtablada))

## v1.2.5 (2019-01-31)

#### :bug: Bug Fix
* [#56](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/56) Fix class merging and attribute precedence ([@ef4](https://github.com/ef4))

#### Committers: 1
- Edward Faulkner ([@ef4](https://github.com/ef4))


## v1.2.4 (2019-01-27)

#### :bug: Bug Fix
* [#55](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/55) Fix for max call stack size exceeded when runing many tests ([@thousand](https://github.com/thousand))

#### :memo: Documentation
* [#46](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/46) Update Changelog ([@Turbo87](https://github.com/Turbo87))

#### :house: Internal
* [#54](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/54) TravisCI: Remove deprecated `sudo: false` option ([@Turbo87](https://github.com/Turbo87))

#### Committers: 2
- Bryan Levay ([@thousand](https://github.com/thousand))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))


## v1.2.3 (2018-09-18)

#### :rocket: Enhancement
* [#42](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/42) Add CHANGELOG file based on `lerna-changelog` ([@Turbo87](https://github.com/Turbo87))

#### :bug: Bug Fix
* [#45](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/45) Fix for parallel babel ([@arthirm](https://github.com/arthirm))

#### :memo: Documentation
* [#38](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/38) update confusing usage example in readme ([@jelhan](https://github.com/jelhan))

#### Committers: 3
- Arthi ([@arthirm](https://github.com/arthirm))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- jelhan ([@jelhan](https://github.com/jelhan))


## v1.2.2 (2018-08-29)

#### :bug: Bug Fix
* [#41](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/41) Ensure that carriage return is part of whitespace calculations. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.2.1 (2018-08-29)

#### :bug: Bug Fix
* [#40](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/40) Fix issue with windows line endings immediately after tag name ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.2.0 (2018-07-23)

#### :rocket: Enhancement
* [#34](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/34) Allow single word components. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#33](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/33) Add additional Ember versions for testing. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.1.9 (2018-07-23)

#### :bug: Bug Fix
* [#32](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/32) Ensure synthetic elements do not cause errors. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.1.8 (2018-07-23)

#### :bug: Bug Fix
* [#30](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/30) Fix memory leak with CURLY_COMPONENT_MANAGER ([@bobisjan](https://github.com/bobisjan))

#### Committers: 1
- Jan Bobisud ([@bobisjan](https://github.com/bobisjan))


## v1.1.7 (2018-07-19)

#### :bug: Bug Fix
* [#29](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/29) Fix memory leak using custom BUILTIN_MODIFIERS object, Closes [#28](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/issues/28) ([@bobisjan](https://github.com/bobisjan))

#### Committers: 1
- Jan Bobisud ([@bobisjan](https://github.com/bobisjan))


## v1.1.6 (2018-07-11)

#### :bug: Bug Fix
* [#24](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/24)  fix: using ...attributes without passing attrs fails ([@lennyburdette](https://github.com/lennyburdette))

#### Committers: 1
- Lenny Burdette ([@lennyburdette](https://github.com/lennyburdette))


## v1.1.5 (2018-06-25)

#### :rocket: Enhancement
* [#19](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/19) Additional Dependency Warning ([@jherdman](https://github.com/jherdman))

#### :memo: Documentation
* [#20](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/20) Add link to repository in package.json ([@ddoria921](https://github.com/ddoria921))

#### :house: Internal
* [#16](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/16) TESTS: added block param w/ nested component + each-in example ([@toranb](https://github.com/toranb))

#### Committers: 3
- Darin Doria ([@ddoria921](https://github.com/ddoria921))
- James Herdman ([@jherdman](https://github.com/jherdman))
- Toran Billups ([@toranb](https://github.com/toranb))


## v1.1.3 (2018-06-06)

#### :bug: Bug Fix
* [#15](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/15) Fix issues with normal helper usage. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.1.2 (2018-06-06)

#### :bug: Bug Fix
* [#14](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/14) Add tests for `<@nav.item />` issue. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.1.1 (2018-06-06)

#### :bug: Bug Fix
* [#13](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/13) Fix issue with named argument paths. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.1.0 (2018-06-05)

#### :rocket: Enhancement
* [#9](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/9) Add ...attributes support for non-component elements. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.0.2 (2018-06-03)

#### :rocket: Enhancement
* [#7](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/7) Allow passing ...attributes into angle bracket invocations. ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#5](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/5) Prevent implicit `this.` in dynamically invoked paths. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#6](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill/pull/6) Prettier! ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
