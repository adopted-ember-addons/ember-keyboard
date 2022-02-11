import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';
import isKey from '../utils/is-key';
import listenerName from '../utils/listener-name';

export default helper(function ifKey([keyCombo, callback] /*, named*/) {
  return function (event) {
    assert(
      'ember-keyboard: You must pass a function as the second argument to the `if-key` helper',
      typeof callback === 'function'
    );
    assert(
      'ember-keyboard: The `if-key` helper expects to be invoked with a KeyboardEvent',
      event instanceof KeyboardEvent
    );

    if (isKey(listenerName(event.type, keyCombo), event)) {
      callback(event);
    }
  };
});
