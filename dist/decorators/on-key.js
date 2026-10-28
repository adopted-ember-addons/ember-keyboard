import listenerName from '../utils/listener-name.js';

const DEFAULT_EVENT_NAME = 'keydown';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type

/**
 * Method decorator for classes using `@keyResponder`.
 *
 * ```js
 * @onKey('ctrl+k')
 * openSearch(event, ekEvent) {}
 *
 * @onKey('Escape', { event: 'keyup' })
 * close() {}
 * ```
 *
 * It can also wrap a function for classic classes:
 *
 * ```js
 * openSearch: onKey('ctrl+k', function (event, ekEvent) {}),
 * ```
 */

function onKey(keyCombo, opts = {}, handler) {
  if (typeof opts === 'function') {
    return onKeyClassic(keyCombo, {
      event: DEFAULT_EVENT_NAME
    }, opts);
  }
  if (!opts.event) {
    opts.event = DEFAULT_EVENT_NAME;
  }
  if (typeof handler === 'function') {
    return onKeyClassic(keyCombo, opts, handler);
  } else {
    return onKeyDecorator(keyCombo, opts);
  }
}
function onKeyDecorator(keyCombo, opts) {
  // ES6 class
  return function (target, property, descriptor) {
    const t = target;
    if (!Object.prototype.hasOwnProperty.call(t, 'keyboardHandlerNames')) {
      const parentKeyboardHandlerNames = t.parentKeyboardHandlerNames;
      // we need to assign because of the way mixins copy actions down when inheriting
      t.keyboardHandlerNames = parentKeyboardHandlerNames ? Object.assign({}, parentKeyboardHandlerNames) : {};
    }
    t.keyboardHandlerNames[listenerName(opts.event, keyCombo)] = property;
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
//# sourceMappingURL=on-key.js.map
