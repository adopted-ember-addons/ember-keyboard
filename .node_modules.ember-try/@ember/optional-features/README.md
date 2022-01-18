# @ember/optional-features

This addon allows you to easily enable/disable optional features in ember-source. To clarify what we mean by optional, these are features that will be opt-in/opt-out and optional for the foreseeable future, not features that will be enabled by default. It is intended for use with apps *only* not addons.

## Installation

```bash
ember install @ember/optional-features
```

## Usage

### From command-line

#### List available features

Features will only be available in versions of ember-source that included them. To list all available features run:

```bash
ember feature:list
```

#### Enable/disable features

To enable a feature, run:

```bash
ember feature:enable some-feature
```

Similarly, if you want to disable a feature, you can run:

```bash
ember feature:disable some-feature
```

### At build-time (from an addon)

This addon exposes a build-time method called `isFeatureEnabled`, which can be called from an addon's `index.js`, e.g.:

```javascript
included() {
  let optionalFeatues = this.addons.find(a => a.name === '@ember/optional-features');
  if (optionalFeatures.isFeatureEnabled('jquery-integration') {
    // ...
  }
}
```

It also exposes a method called `isFeatureExplicitlySet`, which can be used to check whether or not the user has explictly set the value of the option instead of using the default.

### At run-time (from an app or addon)

WIP -- there does not yet exist a public API for accessing the state of optional features at runtime. [This](https://github.com/pzuraq/ember-compatibility-helpers/issues/27) issue is tracking it.
