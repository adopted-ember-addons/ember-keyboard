# Changelog

## Release (2025-06-20)

ember-keyboard 9.0.2 (patch)

#### :bug: Bug Fix
* `ember-keyboard`, `docs`
  * [#786](https://github.com/adopted-ember-addons/ember-keyboard/pull/786) Fix ember deprecation of inject as service ([@spruce](https://github.com/spruce))

#### Committers: 1
- Felix Fichte ([@spruce](https://github.com/spruce))

## Release (2024-08-23)

ember-keyboard 9.0.1 (patch)

#### :bug: Bug Fix
* `ember-keyboard`, `test-app`
  * [#757](https://github.com/adopted-ember-addons/ember-keyboard/pull/757) Don't evaluate getters when looking for handlers ([@wagenet](https://github.com/wagenet))

#### :house: Internal
* `test-app`
  * [#785](https://github.com/adopted-ember-addons/ember-keyboard/pull/785) Use the in-repo copy of ember-keyboard using the workspace protocol ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#784](https://github.com/adopted-ember-addons/ember-keyboard/pull/784) Upgrade to pnpm 9 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* Other
  * [#783](https://github.com/adopted-ember-addons/ember-keyboard/pull/783) Skip cleanup in ember-try ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 2
- Peter Wagenet ([@wagenet](https://github.com/wagenet))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-08-22)

ember-keyboard 9.0.0 (major)

#### :boom: Breaking Change
* `ember-keyboard`, `test-app`
  * [#770](https://github.com/adopted-ember-addons/ember-keyboard/pull/770) Drops support for ember < 3.28 ([@leoeuclids](https://github.com/leoeuclids))

#### :rocket: Enhancement
* `ember-keyboard`
  * [#780](https://github.com/adopted-ember-addons/ember-keyboard/pull/780) Widen peer range for peer, @ember/test-helpers ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-keyboard`, `test-app`
  * [#755](https://github.com/adopted-ember-addons/ember-keyboard/pull/755) Feature: Plus sign support ([@leoeuclids](https://github.com/leoeuclids))

#### :house: Internal
* Other
  * [#773](https://github.com/adopted-ember-addons/ember-keyboard/pull/773) Migrate to pnpm part 2 ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#771](https://github.com/adopted-ember-addons/ember-keyboard/pull/771) Setup release plan ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#758](https://github.com/adopted-ember-addons/ember-keyboard/pull/758) Bump @babel/traverse from 7.17.0 to 7.23.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* `ember-keyboard`, `docs`, `test-app`
  * [#772](https://github.com/adopted-ember-addons/ember-keyboard/pull/772) Migrate to pnpm ([@leoeuclids](https://github.com/leoeuclids))

#### Committers: 3
- Leo Euclides ([@leoeuclids](https://github.com/leoeuclids))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)





## v8.2.1 (2023-08-16)

#### :rocket: Enhancement
* [#739](https://github.com/adopted-ember-addons/ember-keyboard/pull/739) Remove engines from addon package.json ([@SergeAstapov](https://github.com/SergeAstapov))
* [#732](https://github.com/adopted-ember-addons/ember-keyboard/pull/732) Allow @ember/test-helpers v3 in peer dependencies ([@francois2metz](https://github.com/francois2metz))

#### :memo: Documentation
* [#674](https://github.com/adopted-ember-addons/ember-keyboard/pull/674) Add note about v2 addon format and ember-auto-import requirement ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* [#740](https://github.com/adopted-ember-addons/ember-keyboard/pull/740) add ember v4 LTS to CI ([@SergeAstapov](https://github.com/SergeAstapov))
* [#736](https://github.com/adopted-ember-addons/ember-keyboard/pull/736) Fix fastboot test on ember 5 ([@francois2metz](https://github.com/francois2metz))
* [#672](https://github.com/adopted-ember-addons/ember-keyboard/pull/672) Use release-it hook to copy .md files at publish time ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 2
- François de Metz ([@francois2metz](https://github.com/francois2metz))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

## v8.2.0 (2022-07-12)

#### :rocket: Enhancement
* [#638](https://github.com/adopted-ember-addons/ember-keyboard/pull/638) Make keyResponder ember-modifier@4 compat ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#625](https://github.com/adopted-ember-addons/ember-keyboard/pull/625) auto-publish unstable packages to NPM ([@SergeAstapov](https://github.com/SergeAstapov))
* [#627](https://github.com/adopted-ember-addons/ember-keyboard/pull/627) Widen `ember-modifier` dependency requirement ([@SergeAstapov](https://github.com/SergeAstapov))

#### :memo: Documentation
* [#626](https://github.com/adopted-ember-addons/ember-keyboard/pull/626) Fix `isKey` import in documentation usage ([@hugopeixoto](https://github.com/hugopeixoto))
* [#622](https://github.com/adopted-ember-addons/ember-keyboard/pull/622) Improve contributing docs ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* [#623](https://github.com/adopted-ember-addons/ember-keyboard/pull/623) run `npx ember-cli-update --to=4.3.0` to align with blueprint ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 3
- Hugo Peixoto ([@hugopeixoto](https://github.com/hugopeixoto))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## v8.1.1 (2022-04-10)

#### :bug: Bug Fix
* [#620](https://github.com/adopted-ember-addons/ember-keyboard/pull/620) Fix ember-modifier v3.2 compatibility ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 1
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

## v8.1.0 (2022-04-07)

#### :rocket: Enhancement
* [#617](https://github.com/adopted-ember-addons/ember-keyboard/pull/617) Prepare for ember-modifier v4 ([@SergeAstapov](https://github.com/SergeAstapov))

#### :memo: Documentation
* [#615](https://github.com/adopted-ember-addons/ember-keyboard/pull/615) move `.md` files to published package ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* [#616](https://github.com/adopted-ember-addons/ember-keyboard/pull/616) replace highlight.js EOL warning in changelog by title ([@jelhan](https://github.com/jelhan))

#### Committers: 2
- Jeldrik Hanschke ([@jelhan](https://github.com/jelhan))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

## v8.0.0 (2022-03-17)

#### :boom: Breaking Change
* [#598](https://github.com/adopted-ember-addons/ember-keyboard/pull/598) convert to v2 addon ([@SergeAstapov](https://github.com/SergeAstapov))
Your app or addon now must have ember-auto-import version 2 or higher in its dependencies in order to use this addon (or any v2 addons)

#### :rocket: Enhancement
* [#578](https://github.com/adopted-ember-addons/ember-keyboard/pull/578) Support inputs in shadow DOM in disableOnInputFields mode ([@simonihmig](https://github.com/simonihmig))

#### :house: Internal
* [#612](https://github.com/adopted-ember-addons/ember-keyboard/pull/612) Add `publishConfig.registry` to addon/package.json ([@SergeAstapov](https://github.com/SergeAstapov))
* [#609](https://github.com/adopted-ember-addons/ember-keyboard/pull/609) Run `npx ember-cli-update --to=v4.2.0` to align with the latest blueprint ([@SergeAstapov](https://github.com/SergeAstapov))
* [#604](https://github.com/adopted-ember-addons/ember-keyboard/pull/604) Extract docs into separate app ([@SergeAstapov](https://github.com/SergeAstapov))
* [#597](https://github.com/adopted-ember-addons/ember-keyboard/pull/597) Monorepo release it ([@SergeAstapov](https://github.com/SergeAstapov))
* [#591](https://github.com/adopted-ember-addons/ember-keyboard/pull/591) Convert to monorepo ([@SergeAstapov](https://github.com/SergeAstapov))
* [#584](https://github.com/adopted-ember-addons/ember-keyboard/pull/584) Move `ember-cli-htmlbars` to `devDependencies` ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 2
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))
- Simon Ihmig ([@simonihmig](https://github.com/simonihmig))


## v7.0.1 (2022-01-18)

#### :rocket: Enhancement
* [#557](https://github.com/adopted-ember-addons/ember-keyboard/pull/557) Add disableOnInputFields option, which allows to automatically disable keyboard events on all input fields ([@st-h](https://github.com/st-h))

#### :house: Internal
* [#570](https://github.com/adopted-ember-addons/ember-keyboard/pull/570) Bump webpack from 5.65.0 to 5.66.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#571](https://github.com/adopted-ember-addons/ember-keyboard/pull/571) Bump follow-redirects from 1.5.7 to 1.14.7 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#572](https://github.com/adopted-ember-addons/ember-keyboard/pull/572) Bump engine.io from 6.1.0 to 6.1.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#573](https://github.com/adopted-ember-addons/ember-keyboard/pull/573) Bump marked from 4.0.9 to 4.0.10 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#574](https://github.com/adopted-ember-addons/ember-keyboard/pull/574) Bump ember-auto-import from 2.2.4 to 2.3.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#575](https://github.com/adopted-ember-addons/ember-keyboard/pull/575) Bump release-it from 14.12.1 to 14.12.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#576](https://github.com/adopted-ember-addons/ember-keyboard/pull/576) Bump @embroider/test-setup from 0.50.0 to 0.50.2 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Steve ([@st-h](https://github.com/st-h))

## v7.0.0 (2022-01-11)

#### :house: Internal
* [#558](https://github.com/adopted-ember-addons/ember-keyboard/pull/558) Bump ember-source from 3.28.6 to 4.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#568](https://github.com/adopted-ember-addons/ember-keyboard/pull/568) Drop ember-default-with-jquery test scenario as it is no longer relevant in Ember 4 ([@lukemelia](https://github.com/lukemelia))
* [#556](https://github.com/adopted-ember-addons/ember-keyboard/pull/556) Bump ember-cli-babel from 7.26.10 to 7.26.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#559](https://github.com/adopted-ember-addons/ember-keyboard/pull/559) Bump ember-cli from 3.28.4 to 4.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#560](https://github.com/adopted-ember-addons/ember-keyboard/pull/560) Bump ember-template-lint from 3.15.0 to 4.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#564](https://github.com/adopted-ember-addons/ember-keyboard/pull/564) Bump @embroider/test-setup from 0.44.2 to 0.50.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#567](https://github.com/adopted-ember-addons/ember-keyboard/pull/567) Bump underscore from 1.9.1 to 1.13.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#566](https://github.com/adopted-ember-addons/ember-keyboard/pull/566) Add test config to verify under Ember 3.28 and 4.0 ([@lukemelia](https://github.com/lukemelia))
* [#562](https://github.com/adopted-ember-addons/ember-keyboard/pull/562) Bump marked from 4.0.7 to 4.0.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#561](https://github.com/adopted-ember-addons/ember-keyboard/pull/561) Bump highlight.js from 11.3.1 to 11.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#563](https://github.com/adopted-ember-addons/ember-keyboard/pull/563) Bump release-it from 14.11.8 to 14.12.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Luke Melia ([@lukemelia](https://github.com/lukemelia))

## v7.0.0-beta.0 (2021-11-28)

Special thanks to @SergeAstapov for his great work on this release!
 
#### :boom: Breaking Change
* [#521](https://github.com/adopted-ember-addons/ember-keyboard/pull/521) Delete deprecated has/trigger responder API ([@SergeAstapov](https://github.com/SergeAstapov))
* [#520](https://github.com/adopted-ember-addons/ember-keyboard/pull/520) Delete deprecated mixins ([@SergeAstapov](https://github.com/SergeAstapov))
* [#515](https://github.com/adopted-ember-addons/ember-keyboard/pull/515) Delete deprecated on-keyboard and keyboard-shortcut modifiers ([@SergeAstapov](https://github.com/SergeAstapov))
* [#512](https://github.com/adopted-ember-addons/ember-keyboard/pull/512) Delete deprecated keyboard-press component ([@SergeAstapov](https://github.com/SergeAstapov))
* [#511](https://github.com/adopted-ember-addons/ember-keyboard/pull/511) Delete deprecated old propagation model ([@SergeAstapov](https://github.com/SergeAstapov))
* [#493](https://github.com/adopted-ember-addons/ember-keyboard/pull/493) [Breaking] Delete deprecated first-responder-inputs-initializer ([@SergeAstapov](https://github.com/SergeAstapov))
* [#492](https://github.com/adopted-ember-addons/ember-keyboard/pull/492) [Breaking] Drop support for Node.js 10, 13, 15 ([@SergeAstapov](https://github.com/SergeAstapov))

#### :rocket: Enhancement
* [#536](https://github.com/adopted-ember-addons/ember-keyboard/pull/536) Move ember-compatibility-helpers to devDependencies ([@SergeAstapov](https://github.com/SergeAstapov))
* [#494](https://github.com/adopted-ember-addons/ember-keyboard/pull/494) Update ember-modifier to add support for 3.22 modifier capabilities ([@SergeAstapov](https://github.com/SergeAstapov))
* [#499](https://github.com/adopted-ember-addons/ember-keyboard/pull/499) Deprecate old propagation model ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* [#539](https://github.com/adopted-ember-addons/ember-keyboard/pull/539) Fix marked import in format-markdown helper ([@SergeAstapov](https://github.com/SergeAstapov))
* [#529](https://github.com/adopted-ember-addons/ember-keyboard/pull/529) Replace deprecated highlightjs with highlight.js ([@SergeAstapov](https://github.com/SergeAstapov))
* [#518](https://github.com/adopted-ember-addons/ember-keyboard/pull/518) Run ember-cli-update to v3.28.4 to align with the latest addon blueprint ([@SergeAstapov](https://github.com/SergeAstapov))
* [#517](https://github.com/adopted-ember-addons/ember-keyboard/pull/517) Add prettier per latest addon blueprint ([@SergeAstapov](https://github.com/SergeAstapov))
* [#516](https://github.com/adopted-ember-addons/ember-keyboard/pull/516) Add eslint-plugin-qunit per latest addon blueprint ([@SergeAstapov](https://github.com/SergeAstapov))
* [#513](https://github.com/adopted-ember-addons/ember-keyboard/pull/513) Add Ember 3.24 and Ember 3.28 to ember-try scenarios ([@SergeAstapov](https://github.com/SergeAstapov))
* [#490](https://github.com/adopted-ember-addons/ember-keyboard/pull/490) Update npmignore file ([@SergeAstapov](https://github.com/SergeAstapov))
* [#498](https://github.com/adopted-ember-addons/ember-keyboard/pull/498) Fix CI for latest Ember v4 beta/canary scenarios ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 1
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))


## v6.0.4 (2021-11-19)

This will be the last release in the 6.x series. 7.0 will drop code related to several deprecations.

#### :boom: Breaking Change
* [#492](https://github.com/adopted-ember-addons/ember-keyboard/pull/492) [Breaking] Drop support for Node.js 10, 13, 15 ([@SergeAstapov](https://github.com/SergeAstapov))

#### :rocket: Enhancement
* [#494](https://github.com/adopted-ember-addons/ember-keyboard/pull/494) Update ember-modifier to add support for 3.22 modifier capabilities ([@SergeAstapov](https://github.com/SergeAstapov))
* [#499](https://github.com/adopted-ember-addons/ember-keyboard/pull/499) Deprecate old propagation model ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* [#490](https://github.com/adopted-ember-addons/ember-keyboard/pull/490) Update npmignore file ([@SergeAstapov](https://github.com/SergeAstapov))
* [#498](https://github.com/adopted-ember-addons/ember-keyboard/pull/498) Fix CI for latest Ember v4 beta/canary scenarios ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 1
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))


## v6.0.3 (2021-05-28)

ember-cli-babel has been updated in this release.

#### :bug: Bug Fix
* [#347](https://github.com/adopted-ember-addons/ember-keyboard/pull/347) fix: ES6 @keyResponder decorator fails with params ([@urbany](https://github.com/urbany))

#### :house: Internal
* [#413](https://github.com/adopted-ember-addons/ember-keyboard/pull/413) Update dependencies including ember-cli-babel to fix address some deprecations ([@lukemelia](https://github.com/lukemelia))
* [#339](https://github.com/adopted-ember-addons/ember-keyboard/pull/339) Bump eslint from 7.13.0 to 7.19.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#341](https://github.com/adopted-ember-addons/ember-keyboard/pull/341) Bump @glimmer/component from 1.0.2 to 1.0.3 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#337](https://github.com/adopted-ember-addons/ember-keyboard/pull/337) Bump @glimmer/tracking from 1.0.2 to 1.0.3 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#331](https://github.com/adopted-ember-addons/ember-keyboard/pull/331) Bump eslint from 7.13.0 to 7.18.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#335](https://github.com/adopted-ember-addons/ember-keyboard/pull/335) Bump ember-template-lint from 2.14.0 to 2.18.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#301](https://github.com/adopted-ember-addons/ember-keyboard/pull/301) Bump ember-compatibility-helpers from 1.2.1 to 1.2.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#309](https://github.com/adopted-ember-addons/ember-keyboard/pull/309) Bump release-it from 14.2.1 to 14.2.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#334](https://github.com/adopted-ember-addons/ember-keyboard/pull/334) Bump marked from 1.2.3 to 1.2.8 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#302](https://github.com/adopted-ember-addons/ember-keyboard/pull/302) Bump qunit-dom from 1.5.0 to 1.6.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#336](https://github.com/adopted-ember-addons/ember-keyboard/pull/336) Replace Travis CI with Github Actions ([@lukemelia](https://github.com/lukemelia))
* [#295](https://github.com/adopted-ember-addons/ember-keyboard/pull/295) Bump marked from 1.2.2 to 1.2.3 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#297](https://github.com/adopted-ember-addons/ember-keyboard/pull/297) Bump eslint from 7.12.1 to 7.13.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#298](https://github.com/adopted-ember-addons/ember-keyboard/pull/298) Bump ember-load-initializers from 2.1.1 to 2.1.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#290](https://github.com/adopted-ember-addons/ember-keyboard/pull/290) Bump ember-modifier from 2.1.0 to 2.1.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#291](https://github.com/adopted-ember-addons/ember-keyboard/pull/291) Bump eslint-plugin-ember from 9.3.0 to 9.4.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#294](https://github.com/adopted-ember-addons/ember-keyboard/pull/294) Bump ember-auto-import from 1.6.0 to 1.7.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#292](https://github.com/adopted-ember-addons/ember-keyboard/pull/292) Bump release-it-lerna-changelog from 3.0.0 to 3.1.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#293](https://github.com/adopted-ember-addons/ember-keyboard/pull/293) Bump release-it from 14.2.0 to 14.2.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))

#### Committers: 3
- João Teixeira ([@urbany](https://github.com/urbany))
- Luke Melia ([@lukemelia](https://github.com/lukemelia))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v6.0.2 (2020-10-30)

#### :rocket: Enhancement
* [#281](https://github.com/adopted-ember-addons/ember-keyboard/pull/281) support binding to "+" key ([@marcoow](https://github.com/marcoow))

#### :memo: Documentation
* [#271](https://github.com/adopted-ember-addons/ember-keyboard/pull/271) Update README to add logo and adjust order ([@lukemelia](https://github.com/lukemelia))
* [#269](https://github.com/adopted-ember-addons/ember-keyboard/pull/269) Adds logo, also as favicon ([@MinThaMie](https://github.com/MinThaMie))

#### :house: Internal
* [#285](https://github.com/adopted-ember-addons/ember-keyboard/pull/285) Update ember/ember-cli ([@lukemelia](https://github.com/lukemelia))
* [#279](https://github.com/adopted-ember-addons/ember-keyboard/pull/279) Bump release-it-lerna-changelog from 2.3.0 to 3.0.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))

#### Committers: 4
- Anne-Greeth van Herwijnen ([@MinThaMie](https://github.com/MinThaMie))
- Luke Melia ([@lukemelia](https://github.com/lukemelia))
- Marco Otte-Witte ([@marcoow](https://github.com/marcoow))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v6.0.1 (2020-09-07)

#### :house: Internal
* [#251](https://github.com/adopted-ember-addons/ember-keyboard/pull/251) Bump release-it from 13.6.9 to 14.0.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#236](https://github.com/adopted-ember-addons/ember-keyboard/pull/236) Bump eslint from 7.5.0 to 7.7.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#226](https://github.com/adopted-ember-addons/ember-keyboard/pull/226) Bump ember-modifier from 1.0.3 to 2.1.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#219](https://github.com/adopted-ember-addons/ember-keyboard/pull/219) [Security] Bump elliptic from 6.5.2 to 6.5.3 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#218](https://github.com/adopted-ember-addons/ember-keyboard/pull/218) Bump @glimmer/component from 1.0.0 to 1.0.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#216](https://github.com/adopted-ember-addons/ember-keyboard/pull/216) Bump @glimmer/tracking from 1.0.0 to 1.0.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#224](https://github.com/adopted-ember-addons/ember-keyboard/pull/224) Bump qunit-dom from 1.2.0 to 1.4.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#199](https://github.com/adopted-ember-addons/ember-keyboard/pull/199) Bump ember-auto-import from 1.5.3 to 1.6.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#213](https://github.com/adopted-ember-addons/ember-keyboard/pull/213) Bump eslint-plugin-ember from 8.9.1 to 8.9.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#211](https://github.com/adopted-ember-addons/ember-keyboard/pull/211) Bump eslint from 7.4.0 to 7.5.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#208](https://github.com/adopted-ember-addons/ember-keyboard/pull/208) Bump marked from 1.1.0 to 1.1.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#215](https://github.com/adopted-ember-addons/ember-keyboard/pull/215) Bump release-it from 13.6.5 to 13.6.6 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#189](https://github.com/adopted-ember-addons/ember-keyboard/pull/189) Add test to make sure ember-keybaord doesn't break fastboot rendering ([@lukemelia](https://github.com/lukemelia))

#### Committers: 2
- Luke Melia ([@lukemelia](https://github.com/lukemelia))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v6.0.0 (2020-06-10)

This major release sports new Octane-friendly API. You can see examples and read about the reasons for the API choices in our [API Design doc](https://github.com/adopted-ember-addons/ember-keyboard/blob/master/API-DESIGN.md).

### Upgrading from ember-keyboard 5.0.0 to 6.0.0

ember-keyboard 6.0.0-beta.1 introduces new APIs to bring ember-keyboard into the Ember Octane era. The old mixins-based API still works but is deprecated in this release and slated for removal in version 7.

Version 6 requires Ember 3.8 or higher, so if you are on a version of Ember before that, you should stick with 5.0.0 until you are able to upgrade your app's Ember version.

If your app is on a recent version of Ember, you are good to go. The path is to upgrade to ember-keyboard 6.x and you can iteratively update to the new APIs until you have no more deprecation warnings left.

The [deprecations](http://adopted-ember-addons.github.io/ember-keyboard/deprecations) page discusses migration paths for each warning you may encounter, but our broader advice is to consider moving as much of your keyboard handling logic to templates as possible. We think that you'll find the `on-key` helper and modifier to be very convenient to work with. The decorator API (which required ember 3.10 or higher) is closest equivalent to the mixins API, but it should be used sparingly in situations where the template approach isn't a good fit.

There is one other potential *breaking* change to be aware of when upgrading from v5 to v6: ember-keyboard versions before 6.0 had an ambiguous API when it came to specifying key combos and required the use of `code` identifiers, like `KeyT`, `Digit1`, etc. Be sure to read the [docs regarding `key` vs. `code` properties](http://adopted-ember-addons.github.io/ember-keyboard/usage) and be sure you are specifying the key combo consistent with your intended behavior. You will likely find that you want to update some key combos to the `key` equivalent. e.g. replace `ctrl+KeyT` with `ctrl+t`.

### Upgrading from ember-keyboard 6.0.0-beta.0 to 6.0.0

The `keyboard-press` component has been deprecated and replaced with the `on-key` helper. The `on-keyboard` and `keyboard-shortut` modifiers have been deprecated and replaced with the `on-key` modifier. The [deprecations](http://adopted-ember-addons.github.io/ember-keyboard/deprecations) page has more info, along with the 5 to 6 upgrade guide immediately below.

### Upgrading from ember-keyboard 6.0.0-beta.1 to 6.0.0

The only changes since 6.0.0-beta.1 were internal dependency updates. Upgrading should be smooth.

#### :house: Internal Changes since 6.0.0-beta.1
* [#186](https://github.com/adopted-ember-addons/ember-keyboard/pull/186) [Security] Bump websocket-extensions from 0.1.3 to 0.1.4 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#188](https://github.com/adopted-ember-addons/ember-keyboard/pull/188) Bump eslint from 7.1.0 to 7.2.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#187](https://github.com/adopted-ember-addons/ember-keyboard/pull/187) Bump ember-angle-bracket-invocation-polyfill from 2.0.2 to 2.1.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#181](https://github.com/adopted-ember-addons/ember-keyboard/pull/181) Bump eslint-plugin-ember from 7.11.1 to 8.6.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#183](https://github.com/adopted-ember-addons/ember-keyboard/pull/183) [Security] Bump tar from 2.2.1 to 2.2.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))

#### Committers: 2
- Luke Melia ([@lukemelia](https://github.com/lukemelia))

#### Other contributors

Thank you to @optikalefx, @NullVoxPopuli @mattmcmanus, @seanCodes, and @bendemboski for helping to shape the API Design for this release.


## v6.0.0-beta.1 (2020-06-04)

_This is the second beta of ember-keyboard 6.0.0!_

#### :rocket: :boom: Breaking Change
* [#135](https://github.com/adopted-ember-addons/ember-keyboard/pull/135) New Octane-friendly APIs ([@lukemelia](https://github.com/lukemelia))

#### :memo: Documentation
* [#179](https://github.com/adopted-ember-addons/ember-keyboard/pull/179) Improve readability of docs site ([@lukemelia](https://github.com/lukemelia))

<details>
  <summary>:house: Internal</summary>
* [#180](https://github.com/adopted-ember-addons/ember-keyboard/pull/180) Bump ember-cli-babel from 7.20.4 to 7.20.5 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#178](https://github.com/adopted-ember-addons/ember-keyboard/pull/178) Bump release-it from 13.6.1 to 13.6.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#177](https://github.com/adopted-ember-addons/ember-keyboard/pull/177) Bump ember-cli-babel from 7.20.0 to 7.20.4 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#171](https://github.com/adopted-ember-addons/ember-keyboard/pull/171) Bump qunit-dom from 1.1.0 to 1.2.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#169](https://github.com/adopted-ember-addons/ember-keyboard/pull/169) Bump eslint from 7.0.0 to 7.1.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#166](https://github.com/adopted-ember-addons/ember-keyboard/pull/166) Bump ember-template-lint from 2.4.1 to 2.8.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#167](https://github.com/adopted-ember-addons/ember-keyboard/pull/167) Bump ember-compatibility-helpers from 1.2.0 to 1.2.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#168](https://github.com/adopted-ember-addons/ember-keyboard/pull/168) Bump markdown-code-highlighting from 0.2.0 to 0.2.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#160](https://github.com/adopted-ember-addons/ember-keyboard/pull/160) [Security] Bump tar from 2.2.1 to 2.2.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#161](https://github.com/adopted-ember-addons/ember-keyboard/pull/161) [Security] Bump lodash from 4.17.10 to 4.17.15 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#162](https://github.com/adopted-ember-addons/ember-keyboard/pull/162) Bump eslint-plugin-node from 11.0.0 to 11.1.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#156](https://github.com/adopted-ember-addons/ember-keyboard/pull/156) [Security] Bump jquery from 3.4.1 to 3.5.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#157](https://github.com/adopted-ember-addons/ember-keyboard/pull/157) [Security] Bump lodash.defaultsdeep from 4.6.0 to 4.6.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#158](https://github.com/adopted-ember-addons/ember-keyboard/pull/158) [Security] Bump lodash.merge from 4.6.1 to 4.6.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#159](https://github.com/adopted-ember-addons/ember-keyboard/pull/159) [Security] Bump mixin-deep from 1.3.1 to 1.3.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#155](https://github.com/adopted-ember-addons/ember-keyboard/pull/155) Adopt release-it to help with changelog and release management ([@lukemelia](https://github.com/lukemelia))
* [#154](https://github.com/adopted-ember-addons/ember-keyboard/pull/154) Fix an issue in the keyboard service unit test that left key responders registered ([@lukemelia](https://github.com/lukemelia))
* [#153](https://github.com/adopted-ember-addons/ember-keyboard/pull/153) Bump ember-cli-babel from 7.19.0 to 7.20.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#152](https://github.com/adopted-ember-addons/ember-keyboard/pull/152) Bump marked from 0.3.19 to 1.1.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#148](https://github.com/adopted-ember-addons/ember-keyboard/pull/148) Bump @babel/plugin-proposal-object-rest-spread from 7.3.1 to 7.9.6 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#141](https://github.com/adopted-ember-addons/ember-keyboard/pull/141) Bump markdown-code-highlighting from 0.2.0 to 0.2.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#138](https://github.com/adopted-ember-addons/ember-keyboard/pull/138) Bump eslint from 6.8.0 to 7.0.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#142](https://github.com/adopted-ember-addons/ember-keyboard/pull/142) Bump qunit-dom from 1.1.0 to 1.2.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#128](https://github.com/adopted-ember-addons/ember-keyboard/pull/128) [Security] Bump lodash.merge from 4.6.1 to 4.6.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#136](https://github.com/adopted-ember-addons/ember-keyboard/pull/136) [Security] Bump jquery from 3.4.1 to 3.5.1 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#131](https://github.com/adopted-ember-addons/ember-keyboard/pull/131) Bump ember-cli-github-pages from 0.2.0 to 0.2.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#130](https://github.com/adopted-ember-addons/ember-keyboard/pull/130) [Security] Bump lodash from 4.17.10 to 4.17.15 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#132](https://github.com/adopted-ember-addons/ember-keyboard/pull/132) [Security] Bump mixin-deep from 1.3.1 to 1.3.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#133](https://github.com/adopted-ember-addons/ember-keyboard/pull/133) [Security] Bump tar from 2.2.1 to 2.2.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#137](https://github.com/adopted-ember-addons/ember-keyboard/pull/137) Bump ember-test-selectors from 1.0.0 to 4.1.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
</details>

#### Committers: 2
- Luke Melia ([@lukemelia](https://github.com/lukemelia))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

#### Other contributors

Thank you to @optikalefx, @NullVoxPopuli @mattmcmanus, @seanCodes, and @bendemboski for helping to shape the API Design for this release.


## v6.0.0-beta.0 (2020-04-29) (Pre-release)

#### (Octane-friendly!)

_This is the first beta of ember-keyboard 6.0.0!_

* [BREAKING] Now requires ember >= 3.8 and node >= 10.x
* [FEATURE] Add `on-keyboard` and `keyboard-shortcut` element modifiers and make `keyboard-press` component public and documented [\#111](https://github.com/adopted-ember-addons/ember-keyboard/pull/111) ([lukemelia](https://github.com/lukemelia)) - These names may be changed before final release of 6.0.

The best place for documentation on the new features is https://github.com/adopted-ember-addons/ember-keyboard/blob/master/tests/dummy/app/templates/usage.hbs -- our docs site will be updated when 6.0.0 final is released)

_Note: ember-keyboard has been moved to the adopted-ember-addons org. We're grateful to @briarsweetbriar for maintaining the project prior to this transition and for facilitating a smooth transition and ensuring this addon can continue to evolve with Ember._

## v5.0.0 (2019-11-19)

* Upgrades to ember-cli-babel 7.


## v4.0.0 (2018-09-05)

#### Support software keymaps

Big thanks to @NullVoxPopuli for [this PR](https://github.com/patience-tema-baron/ember-keyboard/pull/88). Now, `ember-keyboard` will respond to the key mapping, rather than the key itself. For instance, with a Dvorak key mapping, pressing 'k' will give a code of 'KeyV' and a key of 'k'. Now, `ember-keyboard` will treat a Dvorak 'KeyV' as a 'k'.

This may introduce a regression if you intended to map to the key themselves, rather than to their code. If that's the case, please take out an issue and we'll figure out a way to support that behavior as well.

## v3.0.0 (2018-01-16)

#### Remove jQuery and make touch/mouse events opt-in

This release has two potential breaking changes:

1. `jQuery`'s been removed! This means that responders will now receive vanilla events, instead of jQuery events. For instance, using jQuery's `isImmediatePropagationStopped` will no longer work:

```js
responder: Ember.on(keyDown('KeyA'), function(event) {
  event.isImmediatePropagationStopped();
})
```

2. Mouse/touch events are now opt-in. You'll have to specify them in your `config/environment.js` file:

```js
emberKeyboard: {
  listeners: ['keyUp', 'keyDown', 'keyPress', 'click', 'mouseDown', 'mouseUp', 'touchStart', 'touchEnd']
}
```

...

## v2.0.0 (2016-07-13)

#### Use `code` instead of `key`

This release switches to the more consistent [`code` property](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code). For instance:

```
keyDown('KeyA', . . .)
keyDown('Digit1', . . .)
keyDown('Numpad1', . . .)
keyDown('Space', . . .)
```

## v1.1.0 (2016-04-23)

#### :bug: Bugs
* Add support for irregular IE key names

## v1.0.3 (2016-03-23)

#### :rocket: Enhancement
* Add a `keyPress` test helper

## v1.0.2 (2016-03-23)

## v1.0.1 (2016-03-22)

#### :house: Internal
* Update Ember CLI

## v1.0.0 (2016-03-22)

#### :rocket: Enhancement
* Add a `keyPress` listener to accompany `keyDown` and `keyUp`
* Add ability to specify which events `ember-keyboard` listens for in the app's `config/environment.js`

## v0.2.8 (2016-03-09)

#### :rocket: Enhancement
* Add test helpers

...

## v0.0.2 (2015-10-24)
* The beginning
