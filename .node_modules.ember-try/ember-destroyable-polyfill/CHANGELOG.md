## v2.0.2 (2020-09-17)

#### :bug: Bug Fix
* [#112](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/112) Avoid errors when `super.init` is called multiple times. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#111](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/111) Ensure the local version is used. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.0.1 (2020-08-02)

#### :bug: Bug Fix
* [#84](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/84) Fix types file (must use declare module). ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.0.0 (2020-08-02)

#### :boom: Breaking Change
* [#80](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/80) Move implementation into `vendor/`. ([@rwjblue](https://github.com/rwjblue))
* [#79](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/79) Require ember-cli-babel@7.22.1 or higher. ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement
* [#82](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/82) Make polyfill inert on Ember 3.22+ ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#81](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/81) Add typing information and API documentation back. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#76](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/76) Refactor linting setup. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.0.2 (2020-07-31)

#### :bug: Bug Fix
* [#75](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/75) Ensure functionality with ember-cli-babel@7.22.0. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.0.1 (2020-07-30)

#### :bug: Bug Fix
* [#74](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/74) Ensure interop with `ember-cli-babel` transpilation of `@ember/destroyable` ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#73](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/73) Add documentation about TypeScript usage. ([@rwjblue](https://github.com/rwjblue))
* [#72](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/72) docs(README): remove RFC FCP warning ([@buschtoens](https://github.com/buschtoens))

#### Committers: 2
- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.0.0 (2020-07-27)

#### :boom: Breaking Change
* [#68](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/68) Update parent / child destructor ordering to match `ember-source@3.20.0` implementation ([@rwjblue](https://github.com/rwjblue))
* [#64](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/64) Refactor `assertDestroyablesDestroyed` to match real implementation. ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement
* [#70](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/70) Use destroyables implementation in Ember 3.20+ ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#69](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/69) Fix private module path for `Meta` on Ember 3.4 ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#66](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/66) Add automated release setup ([@rwjblue](https://github.com/rwjblue))
* [#65](https://github.com/ember-polyfills/ember-destroyable-polyfill/pull/65) Change dependabot to weekly checks ([@rwjblue](https://github.com/rwjblue))

#### Committers: 3
- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


