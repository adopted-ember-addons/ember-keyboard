import Helper from '@ember/component/helper';
import { assert } from '@ember/debug';
import * as emberService from '@ember/service';
import listenerName from '../utils/listener-name.js';
import { g, i } from 'decorator-transforms/runtime-esm';

const service = emberService.service ?? emberService.inject;
/**
 * Calls `callback` whenever `keyCombo` is pressed, for as long as the
 * helper is rendered.
 *
 * ```hbs
 * {{on-key "alt+c" this.collapseAll}}
 * ```
 */
class OnKeyHelper extends Helper {
  static {
    g(this.prototype, "keyboard", [service]);
  }
  #keyboard = (i(this, "keyboard"), void 0);
  keyCombo;
  callback;
  keyboardActivated = true;
  keyboardPriority = 0;
  eventName = 'keydown';
  keyboardHandlers;
  compute([keyCombo, callback], {
    event = 'keydown',
    activated = true,
    priority = 0
  }) {
    assert('ember-keyboard: You must pass a function as the second argument to the `on-key` helper', typeof callback === 'function');
    this.keyCombo = keyCombo;
    this.callback = callback;
    this.eventName = event;
    this.keyboardActivated = activated;
    this.keyboardPriority = priority;
    this.keyboardHandlers = {};
    this.keyboardHandlers[listenerName(event, keyCombo)] = callback;
    this.keyboard.register(this);
  }
  willDestroy() {
    this.keyboard.unregister(this);
    super.willDestroy();
  }
}

export { OnKeyHelper as default };
//# sourceMappingURL=on-key.js.map
