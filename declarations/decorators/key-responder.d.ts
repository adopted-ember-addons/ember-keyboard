import type { KeyResponderOptions } from '../types.ts';
type Constructor<T = object> = abstract new (...args: any[]) => T;
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
export default function keyResponder<T extends Constructor>(DecoratedClass: T): T;
export default function keyResponder(opts?: KeyResponderOptions): <T extends Constructor>(DecoratedClass: T) => T;
export {};
//# sourceMappingURL=key-responder.d.ts.map