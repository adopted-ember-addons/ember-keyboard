import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';
import { set as emberSet } from '@ember/object';

function set(positional) {
  let [target, key, maybeValue] = positional;
  assert(
    'you must pass a path to {{set}}',
    (Boolean(target) && typeof key === 'string') || typeof key === 'symbol'
  );

  return positional.length === 3
    ? () => emberSet(target, key, maybeValue)
    : value => emberSet(target, key, value);
}

export default helper(set);
