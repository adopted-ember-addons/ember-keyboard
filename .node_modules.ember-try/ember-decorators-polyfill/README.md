# ember-decorators-polyfill

Polyfills Ember's built-in decorators

## Compatibility

- Ember.js v2.18 or above
- Ember CLI v2.13 or above

This addon is not needed in Ember 3.10+

## Installation

```
ember install ember-decorators-polyfill
```

## Usage

Polyfills Ember's built-in decorators API:

```js
import { action, computed } from '@ember/object';

import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';

import {
  alias,
  and,
  bool,
  collect,
  deprecatingAlias,
  empty,
  equal,
  filter,
  filterBy,
  gt,
  gte,
  intersect,
  lt,
  lte,
  map,
  mapBy,
  match,
  max,
  min,
  none,
  not,
  notEmpty,
  oneWay,
  or,
  reads,
  readOnly,
  setDiff,
  sort,
  sum,
  union,
  uniq,
  uniqBy,
} from '@ember/object/computed';
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
