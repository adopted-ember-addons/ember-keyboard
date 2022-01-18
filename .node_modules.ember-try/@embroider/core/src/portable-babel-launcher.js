"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const portable_1 = require("./portable");
function babelLauncher(babel, launch, key) {
    let p = new portable_1.Portable({ hints: launch.hints });
    let hydrated = p.hydrate(launch);
    let module;
    if (typeof hydrated.module === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        module = require(hydrated.module);
        if (module.__esModule) {
            module = module.default;
        }
    }
    else {
        module = hydrated.module;
    }
    let plugin = module.call(this, babel, hydrated.arg, key);
    let innerStates = new WeakMap();
    function convertState(state) {
        let innerState = innerStates.get(state);
        if (!innerState) {
            innerState = Object.assign({}, state, { opts: hydrated.arg });
            innerStates.set(state, innerState);
        }
        return innerState;
    }
    function wrap1(original) {
        if (typeof original === 'function') {
            return function (state) {
                return original.call(this, convertState(state));
            };
        }
    }
    function wrap2(original) {
        return function (path, state) {
            return original.call(this, path, convertState(state));
        };
    }
    let visitorProxy = {
        get(target, prop) {
            let original = target[prop];
            if (typeof original === 'function') {
                return wrap2(original);
            }
            if (original && typeof original === 'object') {
                let wrapped = {};
                if (typeof original.exit === 'function') {
                    wrapped.exit = wrap2(original.exit);
                }
                if (typeof original.enter === 'function') {
                    wrapped.enter = wrap2(original.enter);
                }
                return wrapped;
            }
            return original;
        },
    };
    return new Proxy(plugin, {
        get(target, prop) {
            let original = target[prop];
            switch (prop) {
                case 'pre':
                case 'post':
                    return wrap1(original);
                case 'visitor':
                    return new Proxy(original, visitorProxy);
                default:
                    return original;
            }
        },
    });
}
exports.default = babelLauncher;
//# sourceMappingURL=portable-babel-launcher.js.map