# promise.hash.helper
![CI](https://github.com/stefanpenner/promise.hash.helper/workflows/CI/badge.svg)

Inspired by `Promise.all` but rather then consuming an array it takes an object as input, and "resolves" that objects values.

## Install

```sh
yarn add promise.hash.helper
```

or

```sh
npm install --save promise.hash.helper
```

## Usage

```js
const hash = require('promise.hash.helper');

let promises = {
  myPromise: resolve(1),
  yourPromise: resolve(2),
  theirPromise: resolve(3),
  notAPromise: 4
};

hash(promises).then(object => {
  // object here is an object that looks like:
  // {
  //   myPromise: 1,
  //   yourPromise: 2,
  //   theirPromise: 3,
  //   notAPromise: 4
  // }
});
```
