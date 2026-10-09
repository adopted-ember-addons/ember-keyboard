import * as emberService from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { g, i } from 'decorator-transforms/runtime-esm';

const service = emberService.service ?? emberService.inject;

// TypeScript requires mixin constructors to take `...args: any[]`
// eslint-disable-next-line @typescript-eslint/no-explicit-any

function findPropertyDescriptor(obj, name) {
  let descriptor;
  do {
    descriptor = Object.getOwnPropertyDescriptor(obj, name);
    if (!descriptor) {
      obj = Object.getPrototypeOf(obj);
    }
  } while (!descriptor && obj);
  return descriptor;
}
function populateKeyboardHandlers(responder) {
  responder.keyboardHandlers = responder.keyboardHandlers || {};
  if (!responder.keyboardHandlerNames) {
    responder.keyboardHandlerNames = {};
    for (const propertyName in responder) {
      const descriptor = findPropertyDescriptor(responder, propertyName);
      // If it has a getter it's not going to be a function. We also don't want to force getters to
      // evaluate as they may be expensive. This has been observed specifically with classic classes
      // and computed properties.
      if (!descriptor?.get) {
        const propertyValue = responder[propertyName];
        const decoratorData = typeof propertyValue === 'function' ? propertyValue._emberKeyboardOnKeyDecoratorData : undefined;
        if (decoratorData) {
          for (const listenerName of decoratorData.listenerNames || []) {
            responder.keyboardHandlerNames[listenerName] = propertyName;
          }
        }
      }
    }
  }
  for (const [listenerName, methodName] of Object.entries(responder.keyboardHandlerNames || {})) {
    responder.keyboardHandlers[listenerName] = responder[methodName].bind(responder);
  }
}

/**
 * Class decorator that registers instances with the keyboard service and
 * wires up methods decorated with `@onKey`.
 *
 * ```js
 * @keyResponder
 * class MyComponent extends Component {}
 *
 * @keyResponder({ priority: 1, activated: false })
 * class MyOtherComponent extends Component {}
 * ```
 */

function keyResponder(opts = {}) {
  const createClass = function (DecoratedClass) {
    const options = opts;
    if (options.priority === undefined) {
      options.priority = 0;
    }
    if (options.activated === undefined) {
      options.activated = true;
    }
    const Base = DecoratedClass;
    class ClassAsKeyResponder extends Base {
      static {
        g(this.prototype, "keyboard", [service]);
      }
      #keyboard = (i(this, "keyboard"), void 0);
      get keyboardPriority() {
        if (super.keyboardPriority === undefined) {
          return options.priority;
        }
        return super.keyboardPriority;
      }
      set keyboardPriority(val) {
        super.keyboardPriority = val;
      }
      get keyboardActivated() {
        if (super.keyboardActivated === undefined) {
          return options.activated;
        }
        return super.keyboardActivated;
      }
      set keyboardActivated(val) {
        super.keyboardActivated = val;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(...args);
        populateKeyboardHandlers(this);
        this.keyboard.register(this);
        registerDestructor(this, () => {
          this.keyboard.unregister(this);
        });
      }
    }
    Object.defineProperty(ClassAsKeyResponder, 'name', {
      value: `${DecoratedClass.name}WithKeyResponder`,
      configurable: true
    });
    return ClassAsKeyResponder;
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
//# sourceMappingURL=key-responder.js.map
