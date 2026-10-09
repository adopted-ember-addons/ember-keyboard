import type { OnKeyOptions } from '../types.ts';
type DecoratedHandler = Function & {
    _emberKeyboardOnKeyDecoratorData?: {
        listenerNames: string[];
    };
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
export default function onKey<F extends DecoratedHandler>(keyCombo: string, handler: F): F;
export default function onKey<F extends DecoratedHandler>(keyCombo: string, opts: OnKeyOptions, handler: F): F;
export default function onKey(keyCombo: string, opts?: OnKeyOptions): MethodDecorator;
export {};
//# sourceMappingURL=on-key.d.ts.map