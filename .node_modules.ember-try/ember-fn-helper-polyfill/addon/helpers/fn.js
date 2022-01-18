import Helper from '@ember/component/helper';
import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

const HAS_NATIVE_PROXY = typeof Proxy === 'function';
const INVOKE = 'invoke'; // TODO: this is wrong

const context = (function buildUntouchableThis() {
  let context = null;

  if (DEBUG && HAS_NATIVE_PROXY) {
    let assertOnProperty = (property) => {
      assert(
        `You accessed \`this.${String(
          property
        )}\` from a function passed to the \`fn\` helper, but the function itself was not bound to a valid \`this\` context. Consider updating to usage of \`@action\`.`
      );
    };

    context = new Proxy(
      {},
      {
        get(_target, property) {
          assertOnProperty(property);
        },

        set(_target, property) {
          assertOnProperty(property);

          return false;
        },

        has(_target, property) {
          assertOnProperty(property);

          return false;
        },
      }
    );
  }

  return context;
})();

export default Helper.extend({
  init() {
    this._super();

    this._positional = null;
    this._fn = null;
  },

  compute(positional) {
    assert(
      `You must pass a function as the \`fn\` helpers first argument, you passed ${positional[0]}`,
      typeof positional[0] === 'function'
    );

    this._positional = positional;

    if (this._fn === null) {
      this._fn = (...invocationArgs) => {
        let [fn, ...args] = this._positional;

        // TODO: fix this branch
        if (typeof fn[INVOKE] === 'function') {
          // references with the INVOKE symbol expect the function behind
          // the symbol to be bound to the reference
          return fn[INVOKE](...args, ...invocationArgs);
        } else {
          return fn.call(context, ...args, ...invocationArgs);
        }
      };
    }

    return this._fn;
  }
});
