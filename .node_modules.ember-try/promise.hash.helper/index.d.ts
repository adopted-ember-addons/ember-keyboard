declare type Fulfilled<T> = T extends Promise<infer R> ? R : T;
declare const _default: <T extends object>(object: T) => Promise<{ [K in keyof T]: Fulfilled<T[K]>; }>;
/**
  `hash` is similar to `all`, but takes an object instead of an array
  for its `promises` argument.

  Returns a promise that is fulfilled when all the given promises have been
  fulfilled, or rejected if any of them become rejected. The returned promise
  is fulfilled with a hash that has the same key names as the `promises` object
  argument. If any of the values in the object are not promises, they will
  simply be copied over to the fulfilled object.
  Example:

  ```javascript
  const hash = require('promise.hash.helper');

  let promises = {
    myPromise: resolve(1),
    yourPromise: resolve(2),
    theirPromise: resolve(3),
    notAPromise: 4
  };

  hash(promises).then(object =>{
    // object here is an object that looks like:
    // {
    //   myPromise: 1,
    //   yourPromise: 2,
    //   theirPromise: 3,
    //   notAPromise: 4
    // }
  });
  ```

  If any of the `promises` given to `hash` are rejected, the first promise
  that is rejected will be given as the reason to the rejection handler.
  Example:

  ```javascript
  const hash = require('promise.hash.helper');

  let promises = {
    myPromise: resolve(1),
    rejectedPromise: reject(new Error('rejectedPromise')),
    anotherRejectedPromise: reject(new Error('anotherRejectedPromise')),
  };

  hash(promises).then(object => {
    // Code here never runs because there are rejected promises!
  }, reason => {
    // reason.message === 'rejectedPromise'
  });
  ```

  An important note: `hash` is intended for plain JavaScript objects that
  are just a set of keys and values. `hash` will NOT preserve prototype
  chains.
  Example:

  ```javascript
  const hash = require('promise.hash.helper');

  function MyConstructor(){
    this.example = resolve('Example');
  }

  MyConstructor.prototype = {
    protoProperty: resolve('Proto Property')
  };

  let myObject = new MyConstructor();
  hash(myObject).then(object => {
    // protoProperty will not be present, instead you will just have an
    // object that looks like:
    // {
    //   example: 'Example'
    // }
    //
    // hash.hasOwnProperty('protoProperty'); // false
    // 'undefined' === typeof hash.protoProperty
  });
  ```

  @method hash
  @public
  @param object
  @return promise that is fulfilled when all properties of `promises`
  have been fulfilled, or rejected if any of them become rejected.
*/
export = _default;
