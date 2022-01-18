# Broccoli's File Creator

[![Build Status](https://travis-ci.org/rwjblue/broccoli-file-creator.svg?branch=master)](https://travis-ci.org/rjackson/broccoli-file-creator)

## Usage

Create a file named `app/main.js` with "some content goes here":

```javascript
let writeFile = require('broccoli-file-creator');
let tree = writeFile('/app/main.js', 'some content goes here');
```

## Documentation

### `writeFile(filename, content, fileOptions)`

---

`filename` *{String}*

The path of the file to create.

---

`content` *{String|Function|Promise}*

The contents to write into the file.

```js
writeFile('filename.txt', 'the-content');
writeFile('filename.txt', Promise.resolve('the-content'));
writeFile('filename.txt', () => 'the-content');
writeFile('filename.txt', () => Promise.resolve('the-content'));
```

*note: If a function is provided, it will only be invoked once, on first build*

## ZOMG!!! TESTS?!?!!?

I know, right?

Running the tests:

```javascript
npm install
npm test
```

## License

This project is distributed under the MIT license.
