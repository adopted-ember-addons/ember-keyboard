let AssertError;
if (Error.captureStackTrace) {
  AssertError = function AssertError(message, caller) {
    Error.prototype.constructor.call(this, message);
    this.message = message;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, caller || AssertError);
    }
  };

  AssertError.prototype = new Error();
} else {
  AssertError = Error;
}

/**
 * @deprecated Use chai's expect-style API instead (`expect(actualValue).to.equal(expectedValue)`)
 * @see https://www.chaijs.com/api/bdd/
 */
export function equals(a, b, msg) {
  if (a !== b) {
    throw new AssertError(
      "'" + a + "' should === '" + b + "'" + (msg ? ': ' + msg : ''),
      equals
    );
  }
};

/**
 * @deprecated Use chai's expect-style API instead (`expect(actualValue).to.equal(expectedValue)`)
 * @see https://www.chaijs.com/api/bdd/#method_throw
 */
export function shouldThrow(callback, type, msg) {
  let failed;
  try {
    callback();
    failed = true;
  } catch (caught) {
    if (type && !(caught instanceof type)) {
      throw new AssertError('Type failure: ' + caught);
    }
    if (
      msg &&
      !(msg.test ? msg.test(caught.message) : msg === caught.message)
    ) {
      throw new AssertError(
        'Throw mismatch: Expected ' +
          caught.message +
          ' to match ' +
          msg +
          '\n\n' +
          caught.stack,
        shouldThrow
      );
    }
  }
  if (failed) {
    throw new AssertError('It failed to throw', shouldThrow);
  }
};
