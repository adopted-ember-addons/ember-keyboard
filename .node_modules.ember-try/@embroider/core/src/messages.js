"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = exports.unsupported = exports.todo = exports.expectWarning = exports.throwOnWarnings = exports.warn = void 0;
const debug_1 = __importDefault(require("debug"));
const util_1 = require("util");
const todo = debug_1.default('embroider:todo');
exports.todo = todo;
const unsupported = debug_1.default('embroider:unsupported');
exports.unsupported = unsupported;
const debug = debug_1.default('embroider:debug');
exports.debug = debug;
function realWarn(message, params) {
    if (hardFailMode > 0) {
        throw new Error(`Unexpected warning in test suite: ${util_1.format(message, ...params)}`);
    }
    else {
        console.log('WARNING: ' + util_1.format(message, ...params));
    }
}
let expectStack = [];
let handled = new WeakSet();
function expectedWarn(message, params) {
    let formattedMessage = util_1.format(message, ...params);
    for (let pattern of expectStack) {
        if (pattern.test(formattedMessage)) {
            handled.add(pattern);
            return;
        }
    }
    realWarn(message, params);
}
function warn(message, ...params) {
    if (expectStack.length === 0) {
        realWarn(message, params);
    }
    else {
        expectedWarn(message, params);
    }
}
exports.warn = warn;
// for use in our test suites
let hardFailMode = 0;
function throwOnWarnings() {
    // Jest mode
    beforeAll(() => hardFailMode++);
    afterAll(() => hardFailMode--);
}
exports.throwOnWarnings = throwOnWarnings;
function expectWarning(pattern, fn) {
    expectStack.push(pattern);
    try {
        fn();
    }
    finally {
        expectStack.pop();
    }
    return handled.has(pattern);
}
exports.expectWarning = expectWarning;
//# sourceMappingURL=messages.js.map