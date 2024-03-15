import { _ as _defineProperty, a as _applyDecoratedDescriptor, b as _initializerDefineProperty } from '../_rollupPluginBabelHelpers-2fc49ad3.js';
import { inject } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';

function populateKeyboardHandlers(responder) {
  responder.keyboardHandlers = responder.keyboardHandlers || {};
  if (!responder.keyboardHandlerNames) {
    responder.keyboardHandlerNames = {};
    for (let propertyName in responder) {
      let propertyValue = responder[propertyName];
      if (typeof propertyValue === 'function' && propertyValue._emberKeyboardOnKeyDecoratorData) {
        for (let listenerName of propertyValue._emberKeyboardOnKeyDecoratorData.listenerNames || []) {
          responder.keyboardHandlerNames[listenerName] = propertyName;
        }
      }
    }
  }
  for (let [listenerName, methodName] of Object.entries(responder.keyboardHandlerNames || {})) {
    responder.keyboardHandlers[listenerName] = responder[methodName].bind(responder);
  }
}
function keyResponder(opts = {}) {
  const createClass = function (DecoratedClass) {
    var _class, _descriptor, _ClassAsKeyResponder;
    if (opts.priority === undefined) {
      opts.priority = 0;
    }
    if (opts.activated === undefined) {
      opts.activated = true;
    }
    return _class = (_ClassAsKeyResponder = class ClassAsKeyResponder extends DecoratedClass {
      get keyboardPriority() {
        if (super.keyboardPriority === undefined) {
          return opts.priority;
        }
        return super.keyboardPriority;
      }
      set keyboardPriority(val) {
        super.keyboardPriority = val;
      }
      get keyboardActivated() {
        if (super.keyboardActivated === undefined) {
          return opts.activated;
        }
        return super.keyboardActivated;
      }
      set keyboardActivated(val) {
        super.keyboardActivated = val;
      }
      constructor() {
        super(...arguments);
        _initializerDefineProperty(this, "keyboard", _descriptor, this);
        populateKeyboardHandlers(this);
        this.keyboard.register(this);
        registerDestructor(this, () => {
          this.keyboard.unregister(this);
        });
      }
    }, _defineProperty(_ClassAsKeyResponder, "name", `${DecoratedClass.name}WithKeyResponder`), _ClassAsKeyResponder), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "keyboard", [inject], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: null
    })), _class;
  };
  if (typeof opts === 'function') {
    return createClass(opts);
  } else {
    return function (DecoratedClass) {
      return createClass(DecoratedClass);
    };
  }
}

export { keyResponder as default };
