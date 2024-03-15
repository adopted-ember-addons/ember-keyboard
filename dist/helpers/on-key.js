import { a as _applyDecoratedDescriptor, b as _initializerDefineProperty, _ as _defineProperty } from '../_rollupPluginBabelHelpers-2fc49ad3.js';
import Helper from '@ember/component/helper';
import { assert } from '@ember/debug';
import { inject } from '@ember/service';
import listenerName from '../utils/listener-name.js';
import '../utils/get-cmd-key.js';

var _class2, _descriptor;
let _class = (_class2 = class _class2 extends Helper {
  constructor(...args) {
    super(...args);
    _initializerDefineProperty(this, "keyboard", _descriptor, this);
    _defineProperty(this, "keyCombo", void 0);
    _defineProperty(this, "callback", void 0);
    _defineProperty(this, "keyboardActivated", true);
    _defineProperty(this, "keyboardPriority", 0);
    _defineProperty(this, "eventName", 'keydown');
    _defineProperty(this, "keyboardHandlers", void 0);
  }
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
    super.willDestroy(...arguments);
  }
}, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "keyboard", [inject], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2);

export { _class as default };
