import listenerName from '../utils/listener-name.ts';
import type { OnKeyOptions } from '../types.ts';

const DEFAULT_EVENT_NAME = 'keydown';

interface OnKeyTarget {
  keyboardHandlerNames?: Record<string, string>;
  parentKeyboardHandlerNames?: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type DecoratedHandler = Function & {
  _emberKeyboardOnKeyDecoratorData?: { listenerNames: string[] };
};

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
export default function onKey<F extends DecoratedHandler>(
  keyCombo: string,
  handler: F,
): F;
export default function onKey<F extends DecoratedHandler>(
  keyCombo: string,
  opts: OnKeyOptions,
  handler: F,
): F;
export default function onKey(
  keyCombo: string,
  opts?: OnKeyOptions,
): MethodDecorator;
export default function onKey(
  keyCombo: string,
  opts: OnKeyOptions | DecoratedHandler = {},
  handler?: DecoratedHandler,
): DecoratedHandler | MethodDecorator {
  if (typeof opts === 'function') {
    return onKeyClassic(keyCombo, { event: DEFAULT_EVENT_NAME }, opts);
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

function onKeyDecorator(keyCombo: string, opts: OnKeyOptions): MethodDecorator {
  // ES6 class
  return function (target, property, descriptor) {
    const t = target as OnKeyTarget;
    if (!Object.prototype.hasOwnProperty.call(t, 'keyboardHandlerNames')) {
      const parentKeyboardHandlerNames = t.parentKeyboardHandlerNames;
      // we need to assign because of the way mixins copy actions down when inheriting
      t.keyboardHandlerNames = parentKeyboardHandlerNames
        ? Object.assign({}, parentKeyboardHandlerNames)
        : {};
    }
    t.keyboardHandlerNames![listenerName(opts.event!, keyCombo)] =
      property as string;
    return descriptor;
  };
}

function onKeyClassic<F extends DecoratedHandler>(
  keyCombo: string,
  opts: OnKeyOptions,
  handler: F,
): F {
  if (!handler._emberKeyboardOnKeyDecoratorData) {
    handler._emberKeyboardOnKeyDecoratorData = { listenerNames: [] };
  }
  handler._emberKeyboardOnKeyDecoratorData.listenerNames.push(
    listenerName(opts.event!, keyCombo),
  );
  return handler;
}
