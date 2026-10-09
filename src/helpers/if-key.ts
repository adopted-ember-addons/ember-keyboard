import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';
import isKey from '../utils/is-key.ts';
import listenerName from '../utils/listener-name.ts';

export interface IfKeySignature {
  Args: {
    Positional: [keyCombo: string, callback: (event: KeyboardEvent) => void];
  };
  Return: (event: KeyboardEvent) => void;
}

/**
 * Returns a function that calls `callback` only when the event it receives
 * matches `keyCombo`.
 *
 * ```hbs
 * <input {{on "keydown" (if-key "Enter" this.submit)}} />
 * ```
 */
const ifKey = helper<IfKeySignature>(function ifKey(
  [keyCombo, callback] /*, named*/,
) {
  return function (event: KeyboardEvent) {
    assert(
      'ember-keyboard: You must pass a function as the second argument to the `if-key` helper',
      typeof callback === 'function',
    );
    assert(
      'ember-keyboard: The `if-key` helper expects to be invoked with a KeyboardEvent',
      event instanceof KeyboardEvent,
    );

    if (isKey(listenerName(event.type, keyCombo), event)) {
      callback(event);
    }
  };
});

export default ifKey;
