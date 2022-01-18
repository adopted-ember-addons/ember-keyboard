# 2.1.2

- Reenable snyk test

# 2.1.1

- Updating linting and snyk dev dependency packages
  - eslint@2.5.1
  - eslint-config-nightmare-mode@2.3.0
  - mocha-eslint@2.0.2
  - snyk@1.13.1

# 2.1.0

- Adding in fixes for utf8 streams
- Adding fingerprintCheck for disabling md5 file checking

# 2.0.0

- Removing paranoiaCheck as a default

# 1.2.2

- Removal of snyk as came out in ember setups

# 1.2.1

- Base tag fixes

# 1.2.0

- Update to use broccoli-caching-writer as a base class. Fixes issues with more aggressive caching added in recent broccoli-filter versions.

# 1.1.1
- @kellyselden fixes for node 0.10
  -  windows cmd fix
  -  adding promise polyfill for node 0.10
  -  adding appveyor badge
  -  mirroring ember-cli travis envs

# 1.1.0
- Added in a temporary fix for Unicode encoding issue which disables the code if the library detects unicode.

# 1.0.4
- Make the filter dependency in the dependency setup

# 1.0.3
- Fixing extra closing slash and whitespace in output
- Update to latest broccoli-filter

# 1.0.2
- Changing packages to be semver compatible

# 1.0.1
- Changed code to work with 0.2.x broccoli-filter
- Made stateless checks be global to remove recalculation
- Adding in more failure tests for broken HTML
- Cleaning up regex to cope with failure cases

# 1.0.0
- Added in build steps and badges

# 0.2.4
- Made code only work with stylesheet link elements

# 0.2.3
- Upgrade to the latest toolbox

# 0.2.2
- Added origin attribute checking to simplify interface
