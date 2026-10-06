import * as emberService from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import type KeyboardService from '../services/keyboard.ts';
import type {
  KeyboardResponder,
  KeyResponderOptions,
  ResponderHandler,
} from '../types.ts';

const service = emberService.service ?? emberService.inject;

// TypeScript requires mixin constructors to take `...args: any[]`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = abstract new (...args: any[]) => T;

interface DecoratedResponder extends KeyboardResponder {
  keyboardHandlerNames?: Record<string, string>;
  [key: string]: unknown;
}

interface OnKeyDecoratorData {
  listenerNames?: string[];
}

function findPropertyDescriptor(
  obj: object | null,
  name: string,
): PropertyDescriptor | undefined {
  let descriptor: PropertyDescriptor | undefined;
  do {
    descriptor = Object.getOwnPropertyDescriptor(obj, name);
    if (!descriptor) {
      obj = Object.getPrototypeOf(obj) as object | null;
    }
  } while (!descriptor && obj);
  return descriptor;
}

function populateKeyboardHandlers(responder: DecoratedResponder) {
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
        const decoratorData =
          typeof propertyValue === 'function'
            ? (
                propertyValue as {
                  _emberKeyboardOnKeyDecoratorData?: OnKeyDecoratorData;
                }
              )._emberKeyboardOnKeyDecoratorData
            : undefined;
        if (decoratorData) {
          for (const listenerName of decoratorData.listenerNames || []) {
            responder.keyboardHandlerNames[listenerName] = propertyName;
          }
        }
      }
    }
  }
  for (const [listenerName, methodName] of Object.entries(
    responder.keyboardHandlerNames || {},
  )) {
    responder.keyboardHandlers[listenerName] = (
      responder[methodName] as ResponderHandler
    ).bind(responder);
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
export default function keyResponder<T extends Constructor>(
  DecoratedClass: T,
): T;
export default function keyResponder(
  opts?: KeyResponderOptions,
): <T extends Constructor>(DecoratedClass: T) => T;
export default function keyResponder(
  opts: KeyResponderOptions | Constructor = {},
) {
  const createClass = function <T extends Constructor>(DecoratedClass: T): T {
    const options = opts as KeyResponderOptions;
    if (options.priority === undefined) {
      options.priority = 0;
    }

    if (options.activated === undefined) {
      options.activated = true;
    }

    const Base = DecoratedClass as unknown as Constructor<DecoratedResponder>;

    abstract class ClassAsKeyResponder extends Base {
      @service declare keyboard: KeyboardService;

      get keyboardPriority(): number | undefined {
        if (super.keyboardPriority === undefined) {
          return options.priority;
        }
        return super.keyboardPriority;
      }

      set keyboardPriority(val) {
        super.keyboardPriority = val;
      }

      get keyboardActivated(): boolean | undefined {
        if (super.keyboardActivated === undefined) {
          return options.activated;
        }
        return super.keyboardActivated;
      }

      set keyboardActivated(val) {
        super.keyboardActivated = val;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
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
      configurable: true,
    });

    return ClassAsKeyResponder as unknown as T;
  };

  if (typeof opts === 'function') {
    return createClass(opts);
  } else {
    return function <T extends Constructor>(DecoratedClass: T): T {
      return createClass(DecoratedClass);
    };
  }
}
