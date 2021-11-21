import { helper } from '@ember/component/helper';
import isKey from 'ember-keyboard/utils/is-key';
import listenerName from 'ember-keyboard/utils/listener-name';
import { assert } from '@ember/debug';

export default helper(function ifKey([keyCombo, callback] /*, hash*/) {
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
