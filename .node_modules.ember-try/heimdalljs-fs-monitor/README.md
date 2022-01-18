# heimdall-fs-monitor

[![npm](https://img.shields.io/npm/v/heimdalljs-fs-monitor.svg)](https://www.npmjs.com/package/heimdalljs-fs-monitor)

file system monitor plugin for [heimdalljs](https://github.com/heimdalljs/heimdalljs-lib)


## Installation

```
npm install --save-dev heimdalljs-fs-monitor
```

## Usage

```js
const FSMonitor = require('heimdalljs-fs-monitor');

// create a new file system monitor
const monitor = new FSMonitor();

// start monitoring
monitor.start();

// ... do some file system work ...
var fs = require('fs');
fs.readFileSync('package.json');

// stop monitoring
monitor.stop();

// read file system call stats
const heimdall = require('heimdalljs');
const stats = heimdall.statsFor('fs');
```

### Getting invocation stacks

In order to get more information about where fs calls are coming from, simply adding an environment variable called `HEIMDALL_FS_MONITOR_CALL_TRACING` and setting that to 1 will add an invocation object to the fs.stats[{fsFunctionName}] object. This could be a potential place where memory backpressure will occur, as this will continue to grow during a build. Since we are not storing every invocation as an entry in an array, and instead just increasing the count for a particular stack trace, this should only be used when needed.

```js
process.env.HEIMDALL_FS_MONITOR_CALL_TRACING = 1;

const FSMonitor = require('heimdalljs-fs-monitor');

// create a new file system monitor
const monitor = new FSMonitor();

// start monitoring
monitor.start();

// ... do some file system work ...
var fs = require('fs');
fs.readFileSync('package.json');

// stop monitoring
monitor.stop();
```

Accessing `heimdall.fs.stats.readFileSync`, for example will yeild a _Metric_ object that looks like the following:

```js
{
  count: 1,
  time: 821855,
  invocations: {
    '    at Object.readFileSync (~/heimdall-fs-monitor/index.js:112:35)\n    at Context.<anonymous> (~/heimdall-fs-monitor/tests.js:89:8)\n    at callFn (~/heimdall-fs-monitor/node_modules/mocha/lib/runnable.js:370:21)\n    at Test.Runnable.run (~/heimdall-fs-monitor/node_modules/mocha/lib/runnable.js:357:7)\n    at Runner.runTest (~/heimdall-fs-monitor/node_modules/mocha/lib/runner.js:541:10)\n    at ~/heimdall-fs-monitor/node_modules/mocha/lib/runner.js:667:12\n    at next (~/heimdall-fs-monitor/node_modules/mocha/lib/runner.js:450:14)\n    at ~/heimdall-fs-monitor/node_modules/mocha/lib/runner.js:460:7\n    at next (~/heimdall-fs-monitor/node_modules/mocha/lib/runner.js:362:14)\n    at Immediate._onImmediate (~/heimdall-fs-monitor/node_modules/mocha/lib/runner.js:428:5)': {
      lineNumber: 89,
      fileName: '~/heimdall-fs-monitor/tests.js',
      count: 1
    }
  }
}
```


## License
`heimdall-fs-monitor` is licensed under the [ISC License](https://opensource.org/licenses/isc-license.txt).
