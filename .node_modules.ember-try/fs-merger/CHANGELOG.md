## 3.0.0
- changed interface for fs proxy from `FSMergerFileOperations` to `FS`

## 2.0.0

- This is a breaking change to migrate from 1.0.0 to 2.0.0.
- `readDirSync` is now `readdirSync` aligning with `fs` function.
- Now you can perform all the `fs` operation other than `write operation` with object created from FSMerger. Below the example usage.

```js
const FSMerger = require('fs-merger');
let fsMerger = new FSMerger([`test`,`bin`]);
fsMerger.fs.readFileSync(`unit-test.js`);
fsMerger.fs.existSync(`unit-test.js`);
```

