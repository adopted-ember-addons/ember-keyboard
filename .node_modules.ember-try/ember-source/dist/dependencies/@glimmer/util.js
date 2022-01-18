import { DEBUG } from '@glimmer/env';
const EMPTY_ARRAY = Object.freeze([]); // import Logger from './logger';
// let alreadyWarned = false;

function debugAssert(test, msg) {
  // if (!alreadyWarned) {
  //   alreadyWarned = true;
  //   Logger.warn("Don't leave debug assertions on in public builds");
  // }
  if (!test) {
    throw new Error(msg || 'assertion failure');
  }
}

function deprecate(desc) {
  console.warn(`DEPRECATION: ${desc}`);
}

let GUID = 0;

function initializeGuid(object) {
  return object._guid = ++GUID;
}

function ensureGuid(object) {
  return object._guid || initializeGuid(object);
}

function dict() {
  return Object.create(null);
}

function isDict(u) {
  return u !== null && u !== undefined;
}

function isObject(u) {
  return typeof u === 'object' && u !== null;
}

class DictSet {
  constructor() {
    this.dict = dict();
  }

  add(obj) {
    if (typeof obj === 'string') this.dict[obj] = obj;else this.dict[ensureGuid(obj)] = obj;
    return this;
  }

  delete(obj) {
    if (typeof obj === 'string') delete this.dict[obj];else if (obj._guid) delete this.dict[obj._guid];
  }

}

class StackImpl {
  constructor() {
    this.stack = [];
    this.current = null;
  }

  get size() {
    return this.stack.length;
  }

  push(item) {
    this.current = item;
    this.stack.push(item);
  }

  pop() {
    let item = this.stack.pop();
    let len = this.stack.length;
    this.current = len === 0 ? null : this.stack[len - 1];
    return item === undefined ? null : item;
  }

  nth(from) {
    let len = this.stack.length;
    return len < from ? null : this.stack[len - from];
  }

  isEmpty() {
    return this.stack.length === 0;
  }

  toArray() {
    return this.stack;
  }

}

function clearElement(parent) {
  let current = parent.firstChild;

  while (current) {
    let next = current.nextSibling;
    parent.removeChild(current);
    current = next;
  }
}

const SERIALIZATION_FIRST_NODE_STRING = '%+b:0%';

function isSerializationFirstNode(node) {
  return node.nodeValue === SERIALIZATION_FIRST_NODE_STRING;
}

const {
  keys: objKeys
} = Object;

function assign(obj) {
  for (let i = 1; i < arguments.length; i++) {
    let assignment = arguments[i];
    if (assignment === null || typeof assignment !== 'object') continue;
    let keys = objKeys(assignment);

    for (let j = 0; j < keys.length; j++) {
      let key = keys[j];
      obj[key] = assignment[key];
    }
  }

  return obj;
}

function fillNulls(count) {
  let arr = new Array(count);

  for (let i = 0; i < count; i++) {
    arr[i] = null;
  }

  return arr;
}

function values(obj) {
  const vals = [];

  for (const key in obj) {
    vals.push(obj[key]);
  }

  return vals;
}

function keys(obj) {
  return Object.keys(obj);
}

function unwrap(val) {
  if (val === null || val === undefined) throw new Error(`Expected value to be present`);
  return val;
}

function expect(val, message) {
  if (val === null || val === undefined) throw new Error(message);
  return val;
}

function unreachable(message = 'unreachable') {
  return new Error(message);
}

function exhausted(value) {
  throw new Error(`Exhausted ${value}`);
}

const tuple = (...args) => args;

const symbol = typeof Symbol !== 'undefined' ? Symbol : key => `__${key}${Math.floor(Math.random() * Date.now())}__`;

function strip(strings, ...args) {
  let out = '';

  for (let i = 0; i < strings.length; i++) {
    let string = strings[i];
    let dynamic = args[i] !== undefined ? String(args[i]) : '';
    out += `${string}${dynamic}`;
  }

  let lines = out.split('\n');

  while (lines.length && lines[0].match(/^\s*$/)) {
    lines.shift();
  }

  while (lines.length && lines[lines.length - 1].match(/^\s*$/)) {
    lines.pop();
  }

  let min = Infinity;

  for (let line of lines) {
    let leading = line.match(/^\s*/)[0].length;
    min = Math.min(min, leading);
  }

  let stripped = [];

  for (let line of lines) {
    stripped.push(line.slice(min));
  }

  return stripped.join('\n');
}

function isHandle(value) {
  return value >= 0;
}

function isNonPrimitiveHandle(value) {
  return value > 3
  /* ENCODED_UNDEFINED_HANDLE */
  ;
}

function constants(...values) {
  return [false, true, null, undefined, ...values];
}

function isSmallInt(value) {
  return value % 1 === 0 && value <= 536870911
  /* MAX_INT */
  && value >= -536870912
  /* MIN_INT */
  ;
}

function encodeNegative(num) {
  return num & -536870913
  /* SIGN_BIT */
  ;
}

function decodeNegative(num) {
  return num | ~-536870913
  /* SIGN_BIT */
  ;
}

function encodePositive(num) {
  return ~num;
}

function decodePositive(num) {
  return ~num;
}

function encodeHandle(num) {
  return num;
}

function decodeHandle(num) {
  return num;
}

function encodeImmediate(num) {
  num |= 0;
  return num < 0 ? encodeNegative(num) : encodePositive(num);
}

function decodeImmediate(num) {
  num |= 0;
  return num > -536870913
  /* SIGN_BIT */
  ? decodePositive(num) : decodeNegative(num);
} // Warm


[1, -1].forEach(x => decodeImmediate(encodeImmediate(x)));

function unwrapHandle(handle) {
  if (typeof handle === 'number') {
    return handle;
  } else {
    let error = handle.errors[0];
    throw new Error(`Compile Error: ${error.problem} @ ${error.span.start}..${error.span.end}`);
  }
}

function unwrapTemplate(template) {
  if (template.result === 'error') {
    throw new Error(`Compile Error: ${template.problem} @ ${template.span.start}..${template.span.end}`);
  }

  return template;
}

function extractHandle(handle) {
  if (typeof handle === 'number') {
    return handle;
  } else {
    return handle.handle;
  }
}

function isOkHandle(handle) {
  return typeof handle === 'number';
}

function isErrHandle(handle) {
  return typeof handle === 'number';
}

let debugToString;

if (DEBUG) {
  let getFunctionName = fn => {
    let functionName = fn.name;

    if (functionName === undefined) {
      let match = Function.prototype.toString.call(fn).match(/function (\w+)\s*\(/);
      functionName = match && match[1] || '';
    }

    return functionName.replace(/^bound /, '');
  };

  let getObjectName = obj => {
    let name;
    let className;

    if (obj.constructor && obj.constructor !== Object) {
      className = getFunctionName(obj.constructor);
    }

    if ('toString' in obj && obj.toString !== Object.prototype.toString && obj.toString !== Function.prototype.toString) {
      name = obj.toString();
    } // If the class has a decent looking name, and the `toString` is one of the
    // default Ember toStrings, replace the constructor portion of the toString
    // with the class name. We check the length of the class name to prevent doing
    // this when the value is minified.


    if (name && name.match(/<.*:ember\d+>/) && className && className[0] !== '_' && className.length > 2 && className !== 'Class') {
      return name.replace(/<.*:/, `<${className}:`);
    }

    return name || className;
  };

  let getPrimitiveName = value => {
    return String(value);
  };

  debugToString = value => {
    if (typeof value === 'function') {
      return getFunctionName(value) || `(unknown function)`;
    } else if (typeof value === 'object' && value !== null) {
      return getObjectName(value) || `(unknown object)`;
    } else {
      return getPrimitiveName(value);
    }
  };
}

var debugToString$1 = debugToString;
let beginTestSteps;
let endTestSteps;
let verifySteps;
let logStep;

function assertNever(value, desc = 'unexpected unreachable branch') {
  console.log('unreachable', value);
  console.trace(`${desc} :: ${JSON.stringify(value)} (${value})`);
}

export { assertNever, EMPTY_ARRAY, debugAssert as assert, deprecate, dict, DictSet, isDict, isObject, StackImpl as Stack, ensureGuid, initializeGuid, isSerializationFirstNode, SERIALIZATION_FIRST_NODE_STRING, assign, fillNulls, values, debugToString$1 as debugToString, beginTestSteps, endTestSteps, logStep, verifySteps, clearElement, keys, unwrap, expect, unreachable, exhausted, tuple, symbol, strip, isHandle, isNonPrimitiveHandle, constants, isSmallInt, encodeNegative, decodeNegative, encodePositive, decodePositive, encodeHandle, decodeHandle, encodeImmediate, decodeImmediate, unwrapHandle, unwrapTemplate, extractHandle, isOkHandle, isErrHandle };