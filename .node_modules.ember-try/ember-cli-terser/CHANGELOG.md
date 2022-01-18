## v4.0.1 (2020-10-23)

#### :bug: Bug Fix
* [#236](https://github.com/ember-cli/ember-cli-terser/pull/236) Fix upgraing from ember-cli-uglify options in ember-cli-build.js ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v4.0.0 (2020-09-08)

#### :boom: Breaking Change
* [#229](https://github.com/ember-cli/ember-cli-terser/pull/229) Remove deep defaulting of minification options. ([@rwjblue](https://github.com/rwjblue))
* [#224](https://github.com/ember-cli/ember-cli-terser/pull/224) Update to `terser@5` via `broccoli-uglify-sourcemap@4` ([@theenadayalank](https://github.com/theenadayalank))
* [#219](https://github.com/ember-cli/ember-cli-terser/pull/219) Drop support for Node 8, 9, 11, and 13. ([@dcyriller](https://github.com/dcyriller))

#### :rocket: Enhancement
* [#230](https://github.com/ember-cli/ember-cli-terser/pull/230) Rename to ember-cli-terser. ([@rwjblue](https://github.com/rwjblue))
* [#228](https://github.com/ember-cli/ember-cli-terser/pull/228) Migrate to broccoli-terser-sourcemap. ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#218](https://github.com/ember-cli/ember-cli-terser/pull/218) Replace uglify-js mentions with terser ([@dcyriller](https://github.com/dcyriller))

#### :house: Internal
* [#231](https://github.com/ember-cli/ember-cli-terser/pull/231) Add automated release setup. ([@rwjblue](https://github.com/rwjblue))
* [#227](https://github.com/ember-cli/ember-cli-terser/pull/227) Swap to GitHub Actions for CI ([@rwjblue](https://github.com/rwjblue))
* [#226](https://github.com/ember-cli/ember-cli-terser/pull/226) Remove unused test helpers. ([@rwjblue](https://github.com/rwjblue))
* [#106](https://github.com/ember-cli/ember-cli-terser/pull/106) .npmignore: Ignore `yarn.lock` file ([@Turbo87](https://github.com/Turbo87))

#### Committers: 5
- Cyrille David ([@dcyriller](https://github.com/dcyriller))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Theenadayalan ([@theenadayalank](https://github.com/theenadayalank))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v3.0.0 (2019-04-12)

#### :boom: Breaking Change
* [#102](https://github.com/ember-cli/ember-cli-uglify/pull/102) Drop support for Node.js 6 ([@Turbo87](https://github.com/Turbo87))
* [#64](https://github.com/ember-cli/ember-cli-uglify/pull/64) Drop support for Node.js 4 ([@Turbo87](https://github.com/Turbo87))

#### :house: Internal
* [#68](https://github.com/ember-cli/ember-cli-uglify/pull/68) TravisCI: Remove deprecated `sudo: false` option ([@Turbo87](https://github.com/Turbo87))
* [#67](https://github.com/ember-cli/ember-cli-uglify/pull/67) Remove unneeded and confusing dependency ([@jelhan](https://github.com/jelhan))
* [#66](https://github.com/ember-cli/ember-cli-uglify/pull/66) CI: Run only for `master` branch, tags and PRs ([@Turbo87](https://github.com/Turbo87))
* [#44](https://github.com/ember-cli/ember-cli-uglify/pull/44) Fix CI ([@Turbo87](https://github.com/Turbo87))

#### Committers: 2
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- jelhan ([@jelhan](https://github.com/jelhan))


## v2.1.0 (2018-03-27)

#### :rocket: Enhancement
* [#37](https://github.com/ember-cli/ember-cli-uglify/pull/37) Run uglify in parallel ([@mikrostew](https://github.com/mikrostew))

#### Committers: 1
- Michael Stewart ([@mikrostew](https://github.com/mikrostew))


## v2.0.2 (2018-02-20)

#### :rocket: Enhancement
* [#34](https://github.com/ember-cli/ember-cli-uglify/pull/34) Updates broccoli-uglify-sourcemap to version 2.0.1 ([@Duder-onomy](https://github.com/Duder-onomy))

#### :house: Internal
* [#36](https://github.com/ember-cli/ember-cli-uglify/pull/36) add test (basically, a default app built’s tests run even post uglifi… ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 2
- Greg Larrenaga ([@Duder-onomy](https://github.com/Duder-onomy))
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))


## v2.0.0 (2017-10-03)

#### :rocket: Enhancement
* [#28](https://github.com/ember-cli/ember-cli-uglify/pull/28) Update "broccoli-uglify-sourcemap" to v2.0.0. ([@Turbo87](https://github.com/Turbo87))

#### Committers: 1
- Tobias Bieniek ([Turbo87](https://github.com/Turbo87))


## v2.0.0-beta.2 (2017-09-08)

#### :bug: Bug Fix
* [#26](https://github.com/ember-cli/ember-cli-uglify/pull/26) Add a fix for Safari to the default config. ([@jrjohnson](https://github.com/jrjohnson))

#### Committers: 1
- Jonathan Johnson ([jrjohnson](https://github.com/jrjohnson))

## v2.0.0-beta.1 (2017-07-10)

#### :boom: Breaking Change
* [#19](https://github.com/ember-cli/ember-cli-uglify/pull/19) Update "package.json" file and remove Node 0.12 support. ([@Turbo87](https://github.com/Turbo87))
* [#17](https://github.com/ember-cli/ember-cli-uglify/pull/17) Update "broccoli-uglify-sourcemap" to v2.0.0-beta.1. ([@Turbo87](https://github.com/Turbo87))
* [#15](https://github.com/ember-cli/ember-cli-uglify/pull/15) Remove Node 0.10 support. ([@greenkeeperio-bot](https://github.com/greenkeeperio-bot))

#### :memo: Documentation
* [#18](https://github.com/ember-cli/ember-cli-uglify/pull/18) Update README. ([@Turbo87](https://github.com/Turbo87))


## v1.2.0 (2015-06-07)

#### :house: Internal
* [#2](https://github.com/ember-cli/ember-cli-uglify/pull/2) Update package.json. ([@kategengler](https://github.com/kategengler))
