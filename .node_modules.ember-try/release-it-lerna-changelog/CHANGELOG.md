## v3.1.0 (2020-10-29)

#### :rocket: Enhancement
* [#91](https://github.com/rwjblue/release-it-lerna-changelog/pull/91) Insert new changelog content before the first h2 existing element ([@Turbo87](https://github.com/Turbo87))

#### Committers: 1
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))


## v3.0.0 (2020-10-20)

#### :boom: Breaking Change
* [#87](https://github.com/rwjblue/release-it-lerna-changelog/pull/87) Make `release-it` a peer dependency (require host project to provide). ([@rwjblue](https://github.com/rwjblue))
* [#89](https://github.com/rwjblue/release-it-lerna-changelog/pull/89) Drop Node 11 and 13 support. ([@rwjblue](https://github.com/rwjblue))
* [#88](https://github.com/rwjblue/release-it-lerna-changelog/pull/88) Drop `release-it@13` support. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.4.0 (2020-09-08)

#### :rocket: Enhancement
* [#78](https://github.com/rwjblue/release-it-lerna-changelog/pull/78) Make compatible with release-it@14 ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.3.0 (2020-04-27)

#### :rocket: Enhancement
* [#42](https://github.com/rwjblue/release-it-lerna-changelog/pull/42) Leverage new `getChangelog` hook. ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#47](https://github.com/rwjblue/release-it-lerna-changelog/pull/47) Ensure that even if there are no changes, we add _something_ to `CHANGELOG.md.` ([@rwjblue](https://github.com/rwjblue))
* [#48](https://github.com/rwjblue/release-it-lerna-changelog/pull/48) Ensure `CHANGELOG.md` has correct version when `git.tagName` is not present ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#44](https://github.com/rwjblue/release-it-lerna-changelog/pull/44) Only run CI for branch pushes to master and PRs. ([@rwjblue](https://github.com/rwjblue))
* [#43](https://github.com/rwjblue/release-it-lerna-changelog/pull/43) Add Node 14 CI run. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.2.0 (2020-04-20)

#### :rocket: Enhancement
* [#37](https://github.com/rwjblue/release-it-lerna-changelog/pull/37) Use `editor` if present on `$PATH`. ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#38](https://github.com/rwjblue/release-it-lerna-changelog/pull/38) Ensure custom changelog is displayed initially on release-it@13.5.3+. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.1.2 (2020-03-27)

#### :bug: Bug Fix
* [#22](https://github.com/rwjblue/release-it-lerna-changelog/pull/22) Ensure `--dry-run` does not launch editor. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.1.1 (2020-03-25)

#### :bug: Bug Fix
* [#19](https://github.com/rwjblue/release-it-lerna-changelog/pull/19) Prevent error when no tags exist. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.1.0 (2020-03-19)

#### :rocket: Enhancement
* [#12](https://github.com/rwjblue/release-it-lerna-changelog/pull/12) Show lerna-changelog output _before_ version prompt. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.0.0 (2020-03-10)

#### :boom: Breaking Change
* [#5](https://github.com/rwjblue/release-it-lerna-changelog/pull/5) Drop Node 8 support. ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement
* [#8](https://github.com/rwjblue/release-it-lerna-changelog/pull/8) Add ability to open generated changelog for editing. ([@rwjblue](https://github.com/rwjblue))
* [#6](https://github.com/rwjblue/release-it-lerna-changelog/pull/6) Update lerna-changelog to 1.x. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#7](https://github.com/rwjblue/release-it-lerna-changelog/pull/7) Update all dependencies / devDependencies. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.0.3 (2019-05-17)

#### :memo: Documentation
* [#4](https://github.com/rwjblue/release-it-lerna-changelog/pull/4) Add `keywords` for discoverability ([@webpro](https://github.com/webpro))

#### Committers: 1
- Lars Kappert ([@webpro](https://github.com/webpro))

## v1.0.2 (2019-05-07)

#### :rocket: Enhancement
* [#2](https://github.com/rwjblue/release-it-lerna-changelog/pull/2) Avoid duplicating version info in release notes. ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#3](https://github.com/rwjblue/release-it-lerna-changelog/pull/3) Ensure git.tagName formatting works properly. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v1.0.1 (2019-05-06)

#### :memo: Documentation
* [#1](https://github.com/rwjblue/release-it-lerna-changelog/pull/1) Add README and documentation. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))



