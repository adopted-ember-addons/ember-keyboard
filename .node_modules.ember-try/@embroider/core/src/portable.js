"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Portable = exports.protocol = void 0;
const mapValues_1 = __importDefault(require("lodash/mapValues"));
const assert_never_1 = __importDefault(require("assert-never"));
const typescript_memoize_1 = require("typescript-memoize");
exports.protocol = '__embroider_portable_values__';
const { globalValues, nonce } = setupGlobals();
class Portable {
    constructor(opts = {}) {
        this.opts = opts;
    }
    dehydrate(value, accessPath = []) {
        if (this.opts.dehydrate) {
            let result = this.opts.dehydrate.call(this, value, accessPath);
            if (result) {
                return result;
            }
        }
        if (value === null) {
            return { value, isParallelSafe: true, needsHydrate: false };
        }
        let broccoli = maybeBroccoli(value);
        if (broccoli) {
            return { value: broccoli, isParallelSafe: true, needsHydrate: true };
        }
        let htmlbars = maybeHTMLBars(value);
        if (htmlbars) {
            return { value: htmlbars, isParallelSafe: true, needsHydrate: true };
        }
        if (Array.isArray(value)) {
            let results = value.map((element, index) => this.dehydrate(element, accessPath.concat(String(index))));
            return {
                value: results.map(r => r.value),
                isParallelSafe: results.every(r => r.isParallelSafe),
                needsHydrate: results.some(r => r.needsHydrate),
            };
        }
        switch (typeof value) {
            case 'string':
            case 'number':
            case 'boolean':
            case 'undefined':
                return { value, isParallelSafe: true, needsHydrate: false };
            case 'object':
                if (Object.getPrototypeOf(value) === Object.prototype) {
                    let isParallelSafe = true;
                    let needsHydrate = false;
                    let result = mapValues_1.default(value, (propertyValue, key) => {
                        let result = this.dehydrate(propertyValue, accessPath.concat(key));
                        isParallelSafe = isParallelSafe && result.isParallelSafe;
                        needsHydrate = needsHydrate || result.needsHydrate;
                        return result.value;
                    });
                    return { value: result, isParallelSafe, needsHydrate };
                }
        }
        let found = this.foundHints.get(value);
        if (found) {
            return {
                value: {
                    embroiderPlaceholder: true,
                    type: 'broccoli-parallel',
                    requireFile: found.requireFile,
                    useMethod: found.useMethod,
                },
                isParallelSafe: true,
                needsHydrate: true,
            };
        }
        return globalPlaceholder(value);
    }
    hydrate(input, accessPath = []) {
        if (this.opts.hydrate) {
            let result = this.opts.hydrate.call(this, input, accessPath);
            if (result) {
                return result;
            }
        }
        if (Array.isArray(input)) {
            return input.map((element, index) => this.hydrate(element, accessPath.concat(String(index))));
        }
        if (input && typeof input === 'object') {
            if (input.embroiderPlaceholder) {
                let placeholder = input;
                switch (placeholder.type) {
                    case 'global':
                        if (placeholder.nonce !== nonce) {
                            throw new Error(`unable to use this non-serializable babel config in this node process`);
                        }
                        return globalValues[placeholder.index];
                    case 'broccoli-parallel':
                        return buildBroccoli(placeholder);
                    case 'htmlbars-parallel':
                        return buildHTMLBars(placeholder);
                    default:
                        assert_never_1.default(placeholder);
                }
            }
            else {
                return mapValues_1.default(input, (value, key) => this.hydrate(value, accessPath.concat(key)));
            }
        }
        return input;
    }
    get foundHints() {
        let found = new Map();
        if (this.opts.hints) {
            for (let hint of this.opts.hints) {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                let mod = require(hint.requireFile);
                if (hint.useMethod) {
                    mod = mod[hint.useMethod];
                }
                found.set(mod, hint);
            }
        }
        return found;
    }
}
__decorate([
    typescript_memoize_1.Memoize()
], Portable.prototype, "foundHints", null);
exports.Portable = Portable;
function setupGlobals() {
    let G = global;
    if (!G[exports.protocol]) {
        G[exports.protocol] = { globalValues: [], nonce: Math.floor(Math.random() * Math.pow(2, 32)) };
    }
    return G[exports.protocol];
}
// === broccoli-babel-transpiler support ===
function maybeBroccoli(object) {
    const type = typeof object;
    const hasProperties = type === 'function' || (type === 'object' && object !== null);
    if (hasProperties &&
        object._parallelBabel !== null &&
        typeof object._parallelBabel === 'object' &&
        typeof object._parallelBabel.requireFile === 'string') {
        return {
            embroiderPlaceholder: true,
            type: 'broccoli-parallel',
            requireFile: object._parallelBabel.requireFile,
            buildUsing: object._parallelBabel.buildUsing,
            useMethod: object._parallelBabel.useMethod,
            params: object._parallelBabel.params,
        };
    }
}
function buildBroccoli(parallelApiInfo) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    let requiredStuff = require(parallelApiInfo.requireFile);
    if (parallelApiInfo.useMethod) {
        if (requiredStuff[parallelApiInfo.useMethod] === undefined) {
            throw new Error("method '" + parallelApiInfo.useMethod + "' does not exist in file " + parallelApiInfo.requireFile);
        }
        return requiredStuff[parallelApiInfo.useMethod];
    }
    if (parallelApiInfo.buildUsing) {
        if (typeof requiredStuff[parallelApiInfo.buildUsing] !== 'function') {
            throw new Error("'" + parallelApiInfo.buildUsing + "' is not a function in file " + parallelApiInfo.requireFile);
        }
        return requiredStuff[parallelApiInfo.buildUsing](parallelApiInfo.params);
    }
    return requiredStuff;
}
// ember-cli-htmlbars-inline-precompile support ===
function maybeHTMLBars(object) {
    const type = typeof object;
    const hasProperties = type === 'function' || (type === 'object' && object !== null);
    if (hasProperties &&
        object.parallelBabel !== null &&
        typeof object.parallelBabel === 'object' &&
        typeof object.parallelBabel.requireFile === 'string') {
        return {
            embroiderPlaceholder: true,
            type: 'htmlbars-parallel',
            requireFile: object.parallelBabel.requireFile,
            buildUsing: String(object.parallelBabel.buildUsing),
            params: object.parallelBabel.params,
        };
    }
}
function buildHTMLBars(parallelApiInfo) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    let requiredStuff = require(parallelApiInfo.requireFile);
    if (typeof requiredStuff[parallelApiInfo.buildUsing] !== 'function') {
        throw new Error("'" + parallelApiInfo.buildUsing + "' is not a function in file " + parallelApiInfo.requireFile);
    }
    return requiredStuff[parallelApiInfo.buildUsing](parallelApiInfo.params);
}
function globalPlaceholder(value) {
    let index = globalValues.length;
    globalValues.push(value);
    return {
        value: {
            embroiderPlaceholder: true,
            type: 'global',
            nonce,
            index,
        },
        isParallelSafe: false,
        needsHydrate: true,
    };
}
//# sourceMappingURL=portable.js.map