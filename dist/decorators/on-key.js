import listenerName from '../utils/listener-name.js';
import '../utils/get-cmd-key.js';

const DEFAULT_EVENT_NAME = 'keydown';
function onKey(keyCombo, opts = {}) {
  if (typeof arguments[1] === 'function') {
    return onKeyClassic(keyCombo, {
      event: DEFAULT_EVENT_NAME
    }, arguments[1]);
  }
  if (!opts.event) {
    opts.event = DEFAULT_EVENT_NAME;
  }
  if (typeof arguments[2] === 'function') {
    return onKeyClassic(keyCombo, opts, arguments[2]);
  } else {
    return onKeyDecorator(keyCombo, opts);
  }
}
function onKeyDecorator(keyCombo, opts) {
  // ES6 class
  return function (target, property, descriptor) {
    if (!Object.prototype.hasOwnProperty.call(target, 'keyboardHandlerNames')) {
      let parentKeyboardHandlerNames = target.parentKeyboardHandlerNames;
      // we need to assign because of the way mixins copy actions down when inheriting
      target.keyboardHandlerNames = parentKeyboardHandlerNames ? Object.assign({}, parentKeyboardHandlerNames) : {};
    }
    target.keyboardHandlerNames[listenerName(opts.event, keyCombo)] = property;
    return descriptor;
  };
}
function onKeyClassic(keyCombo, opts, handler) {
  if (!handler._emberKeyboardOnKeyDecoratorData) {
    handler._emberKeyboardOnKeyDecoratorData = {
      listenerNames: []
    };
  }
  handler._emberKeyboardOnKeyDecoratorData.listenerNames.push(listenerName(opts.event, keyCombo));
  return handler;
}

export { onKey as default };
