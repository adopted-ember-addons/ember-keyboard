/*! JsReporters 1.2.3 | Copyright JS Reporters https://github.com/js-reporters/ | https://opensource.org/licenses/MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.JsReporters = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // Copyright Joyent, Inc. and other Node contributors.
  var R = (typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === 'object' ? Reflect : null;
  var ReflectApply = R && typeof R.apply === 'function' ? R.apply : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };
  var ReflectOwnKeys;

  if (R && typeof R.ownKeys === 'function') {
    ReflectOwnKeys = R.ownKeys;
  } else if (Object.getOwnPropertySymbols) {
    ReflectOwnKeys = function ReflectOwnKeys(target) {
      return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
    };
  } else {
    ReflectOwnKeys = function ReflectOwnKeys(target) {
      return Object.getOwnPropertyNames(target);
    };
  }

  function ProcessEmitWarning(warning) {
    if (console && console.warn) console.warn(warning);
  }

  var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
    return value !== value;
  };

  function EventEmitter() {
    EventEmitter.init.call(this);
  }

  var events = EventEmitter;
  var once_1 = once; // Backwards-compat with node 0.10.x

  EventEmitter.EventEmitter = EventEmitter;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._eventsCount = 0;
  EventEmitter.prototype._maxListeners = undefined; // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.

  var defaultMaxListeners = 10;

  function checkListener(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + _typeof(listener));
    }
  }

  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function get() {
      return defaultMaxListeners;
    },
    set: function set(arg) {
      if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
        throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
      }

      defaultMaxListeners = arg;
    }
  });

  EventEmitter.init = function () {
    if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
  }; // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.


  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
    }

    this._maxListeners = n;
    return this;
  };

  function _getMaxListeners(that) {
    if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return _getMaxListeners(this);
  };

  EventEmitter.prototype.emit = function emit(type) {
    var args = [];

    for (var i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var doError = type === 'error';
    var events = this._events;
    if (events !== undefined) doError = doError && events.error === undefined;else if (!doError) return false; // If there is no 'error' event listener then throw.

    if (doError) {
      var er;
      if (args.length > 0) er = args[0];

      if (er instanceof Error) {
        // Note: The comments on the `throw` lines are intentional, they show
        // up in Node's output if this results in an unhandled exception.
        throw er; // Unhandled 'error' event
      } // At least give some kind of context to the user


      var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
      err.context = er;
      throw err; // Unhandled 'error' event
    }

    var handler = events[type];
    if (handler === undefined) return false;

    if (typeof handler === 'function') {
      ReflectApply(handler, this, args);
    } else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);

      for (var i = 0; i < len; ++i) {
        ReflectApply(listeners[i], this, args);
      }
    }

    return true;
  };

  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;
    checkListener(listener);
    events = target._events;

    if (events === undefined) {
      events = target._events = Object.create(null);
      target._eventsCount = 0;
    } else {
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (events.newListener !== undefined) {
        target.emit('newListener', type, listener.listener ? listener.listener : listener); // Re-assign `events` because a newListener handler could have caused the
        // this._events to be assigned to a new object

        events = target._events;
      }

      existing = events[type];
    }

    if (existing === undefined) {
      // Optimize the case of one listener. Don't need the extra array object.
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = events[type] = prepend ? [listener, existing] : [existing, listener]; // If we've already got an array, just append.
      } else if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      } // Check for listener leak


      m = _getMaxListeners(target);

      if (m > 0 && existing.length > m && !existing.warned) {
        existing.warned = true; // No error code for this since it is a Warning
        // eslint-disable-next-line no-restricted-syntax

        var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + String(type) + ' listeners ' + 'added. Use emitter.setMaxListeners() to ' + 'increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        ProcessEmitWarning(w);
      }
    }

    return target;
  }

  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.prependListener = function prependListener(type, listener) {
    return _addListener(this, type, listener, true);
  };

  function onceWrapper() {
    if (!this.fired) {
      this.target.removeListener(this.type, this.wrapFn);
      this.fired = true;
      if (arguments.length === 0) return this.listener.call(this.target);
      return this.listener.apply(this.target, arguments);
    }
  }

  function _onceWrap(target, type, listener) {
    var state = {
      fired: false,
      wrapFn: undefined,
      target: target,
      type: type,
      listener: listener
    };
    var wrapped = onceWrapper.bind(state);
    wrapped.listener = listener;
    state.wrapFn = wrapped;
    return wrapped;
  }

  EventEmitter.prototype.once = function once(type, listener) {
    checkListener(listener);
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
    checkListener(listener);
    this.prependListener(type, _onceWrap(this, type, listener));
    return this;
  }; // Emits a 'removeListener' event if and only if the listener was removed.


  EventEmitter.prototype.removeListener = function removeListener(type, listener) {
    var list, events, position, i, originalListener;
    checkListener(listener);
    events = this._events;
    if (events === undefined) return this;
    list = events[type];
    if (list === undefined) return this;

    if (list === listener || list.listener === listener) {
      if (--this._eventsCount === 0) this._events = Object.create(null);else {
        delete events[type];
        if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
      }
    } else if (typeof list !== 'function') {
      position = -1;

      for (i = list.length - 1; i >= 0; i--) {
        if (list[i] === listener || list[i].listener === listener) {
          originalListener = list[i].listener;
          position = i;
          break;
        }
      }

      if (position < 0) return this;
      if (position === 0) list.shift();else {
        spliceOne(list, position);
      }
      if (list.length === 1) events[type] = list[0];
      if (events.removeListener !== undefined) this.emit('removeListener', type, originalListener || listener);
    }

    return this;
  };

  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

  EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
    var listeners, events, i;
    events = this._events;
    if (events === undefined) return this; // not listening for removeListener, no need to emit

    if (events.removeListener === undefined) {
      if (arguments.length === 0) {
        this._events = Object.create(null);
        this._eventsCount = 0;
      } else if (events[type] !== undefined) {
        if (--this._eventsCount === 0) this._events = Object.create(null);else delete events[type];
      }

      return this;
    } // emit removeListener for all listeners on all events


    if (arguments.length === 0) {
      var keys = Object.keys(events);
      var key;

      for (i = 0; i < keys.length; ++i) {
        key = keys[i];
        if (key === 'removeListener') continue;
        this.removeAllListeners(key);
      }

      this.removeAllListeners('removeListener');
      this._events = Object.create(null);
      this._eventsCount = 0;
      return this;
    }

    listeners = events[type];

    if (typeof listeners === 'function') {
      this.removeListener(type, listeners);
    } else if (listeners !== undefined) {
      // LIFO order
      for (i = listeners.length - 1; i >= 0; i--) {
        this.removeListener(type, listeners[i]);
      }
    }

    return this;
  };

  function _listeners(target, type, unwrap) {
    var events = target._events;
    if (events === undefined) return [];
    var evlistener = events[type];
    if (evlistener === undefined) return [];
    if (typeof evlistener === 'function') return unwrap ? [evlistener.listener || evlistener] : [evlistener];
    return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
  }

  EventEmitter.prototype.listeners = function listeners(type) {
    return _listeners(this, type, true);
  };

  EventEmitter.prototype.rawListeners = function rawListeners(type) {
    return _listeners(this, type, false);
  };

  EventEmitter.listenerCount = function (emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };

  EventEmitter.prototype.listenerCount = listenerCount;

  function listenerCount(type) {
    var events = this._events;

    if (events !== undefined) {
      var evlistener = events[type];

      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener !== undefined) {
        return evlistener.length;
      }
    }

    return 0;
  }

  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
  };

  function arrayClone(arr, n) {
    var copy = new Array(n);

    for (var i = 0; i < n; ++i) {
      copy[i] = arr[i];
    }

    return copy;
  }

  function spliceOne(list, index) {
    for (; index + 1 < list.length; index++) {
      list[index] = list[index + 1];
    }

    list.pop();
  }

  function unwrapListeners(arr) {
    var ret = new Array(arr.length);

    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }

    return ret;
  }

  function once(emitter, name) {
    return new Promise(function (resolve, reject) {
      function eventListener() {
        if (errorListener !== undefined) {
          emitter.removeListener('error', errorListener);
        }

        resolve([].slice.call(arguments));
      }
      var errorListener; // Adding an error listener is not optional because
      // if an error is thrown on an event emitter we cannot
      // guarantee that the actual event we are waiting will
      // be fired. The result could be a silent way to create
      // memory or file descriptor leaks, which is something
      // we should avoid.

      if (name !== 'error') {
        errorListener = function errorListener(err) {
          emitter.removeListener(name, eventListener);
          reject(err);
        };

        emitter.once('error', errorListener);
      }

      emitter.once(name, eventListener);
    });
  }
  events.once = once_1;

  function getAllTests(tests, childSuites) {
    return tests.concat.apply(tests, _toConsumableArray(childSuites.map(function (childSuite) {
      return getAllTests(childSuite.tests, childSuite.childSuites);
    })));
  }

  function collectSuiteStartData(tests, childSuites) {
    return {
      testCounts: {
        total: getAllTests(tests, childSuites).length
      }
    };
  }

  function collectSuiteEndData(tests, childSuites) {
    var all = getAllTests(tests, childSuites);
    var testCounts = {
      passed: all.filter(function (test) {
        return test.status === 'passed';
      }).length,
      failed: all.filter(function (test) {
        return test.status === 'failed';
      }).length,
      skipped: all.filter(function (test) {
        return test.status === 'skipped';
      }).length,
      todo: all.filter(function (test) {
        return test.status === 'todo';
      }).length,
      total: all.length
    };
    var status;

    if (testCounts.failed > 0) {
      status = 'failed';
    } else if (testCounts.skipped > 0 && testCounts.passed === 0) {
      status = 'skipped';
    } else if (testCounts.todo > 0 && testCounts.passed === 0) {
      status = 'todo';
    } else {
      status = 'passed';
    }

    var runtime = null;

    if (status !== 'skipped') {
      runtime = all.reduce(function (sum, test) {
        return sum + (test.status === 'skipped' ? 0 : test.runtime);
      }, 0);
    }

    return {
      status: status,
      testCounts: testCounts,
      runtime: runtime
    };
  }

  function createSuiteStart(suiteEnd) {
    return {
      name: suiteEnd.name,
      fullName: suiteEnd.fullName.slice(),
      tests: suiteEnd.tests.map(createTestStart),
      childSuites: suiteEnd.childSuites.map(createSuiteStart),
      testCounts: {
        total: suiteEnd.testCounts.total
      }
    };
  }

  function createTestStart(testEnd) {
    return {
      name: testEnd.name,
      suiteName: testEnd.suiteName,
      fullName: testEnd.fullName.slice()
    };
  }

  var helpers = {
    collectSuiteStartData: collectSuiteStartData,
    collectSuiteEndData: collectSuiteEndData,
    createSuiteStart: createSuiteStart,
    createTestStart: createTestStart
  };

  /**
   * Known limitations:
   *
   * - Due to ordering issues with nested suites on QUnit < 2.2, this adapter
   *   buffers events and only emits them after the run has completed.
   *   See <https://github.com/js-reporters/js-reporters/pull/60>
   */

  var QUnitAdapter_1 = /*#__PURE__*/function (_EventEmitter) {
    _inherits(QUnitAdapter, _EventEmitter);

    var _super = _createSuper(QUnitAdapter);

    function QUnitAdapter(QUnit) {
      var _this;

      _classCallCheck(this, QUnitAdapter);

      _this = _super.call(this);
      _this.QUnit = QUnit;
      _this.globalSuite = null;
      _this.tests = {};
      _this.delim = ' > ';
      QUnit.begin(_this.onBegin.bind(_assertThisInitialized(_this)));
      QUnit.log(_this.onLog.bind(_assertThisInitialized(_this)));
      QUnit.testDone(_this.onTestDone.bind(_assertThisInitialized(_this)));
      QUnit.done(_this.onDone.bind(_assertThisInitialized(_this)));
      return _this;
    }

    _createClass(QUnitAdapter, [{
      key: "createSuiteEnd",
      value: function createSuiteEnd(qunitModule) {
        var _this2 = this;

        var fullName = qunitModule.name ? qunitModule.name.split(this.delim) : []; // Keep only the name of the suite itself.

        var name = fullName.length ? fullName.slice(-1)[0] : '';
        return {
          name: name,
          fullName: fullName,
          tests: qunitModule.tests.map(function (details) {
            var testEnd = {
              name: details.name,
              suiteName: name,
              fullName: [].concat(_toConsumableArray(fullName), [details.name]),
              // Placeholders, populated by onTestDone() and onLog()()
              status: null,
              runtime: null,
              errors: [],
              assertions: []
            };
            _this2.tests[details.testId] = testEnd;
            return testEnd;
          }),
          // Placeholders, populated by createGlobalSuite() and onDone()
          childSuites: [],
          status: null,
          testCounts: null,
          runtime: null
        };
      }
    }, {
      key: "createGlobalSuite",
      value: function createGlobalSuite() {
        var _this3 = this;

        var globalSuite;
        var modules; // Access QUnit internals to get all suites and tests,
        // working around missing event data.
        // Create the global suite first.

        if (this.QUnit.config.modules.length > 0 && this.QUnit.config.modules[0].name === '') {
          globalSuite = this.createSuiteEnd(this.QUnit.config.modules[0]); // The name of the global suite must be null.

          globalSuite.name = null;
          globalSuite.tests.forEach(function (test) {
            test.suiteName = null;
          });
          modules = this.QUnit.config.modules.slice(1);
        } else {
          globalSuite = {
            name: null,
            fullName: [],
            tests: [],
            childSuites: [],
            status: null,
            testCounts: null,
            runtime: null
          };
          modules = this.QUnit.config.modules;
        } // Build a list with all suites.


        var suites = modules.map(this.createSuiteEnd.bind(this)); // If a suite has a composed name, its name will be the last in the sequence
        // and its parent name will be the one right before it. Search the parent
        // suite after its name and then add the suite with the composed name to the
        // childSuites.
        //
        // If a suite does not have a composed name, add it to the topLevelSuites,
        // this means that this suite is the direct child of the global suite.

        suites.forEach(function (suite) {
          if (suite.fullName.length >= 2) {
            var parentFullName = suite.fullName.slice(0, -1);
            suites.forEach(function (otherSuite) {
              if (otherSuite.fullName.join(_this3.delim) === parentFullName.join(_this3.delim)) {
                otherSuite.childSuites.push(suite);
              }
            });
          } else {
            globalSuite.childSuites.push(suite);
          }
        });
        return globalSuite;
      }
    }, {
      key: "emitData",
      value: function emitData(suite) {
        var _this4 = this;

        suite.tests.forEach(function (test) {
          _this4.emit('testStart', helpers.createTestStart(test));

          _this4.emit('testEnd', test);
        });
        suite.childSuites.forEach(function (childSuite) {
          _this4.emit('suiteStart', helpers.createSuiteStart(childSuite));

          _this4.emitData(childSuite);

          _this4.emit('suiteEnd', childSuite);
        });
      }
    }, {
      key: "onBegin",
      value: function onBegin() {
        this.globalSuite = this.createGlobalSuite();
      }
    }, {
      key: "onLog",
      value: function onLog(details) {
        var assertion = {
          passed: details.result,
          actual: details.actual,
          expected: details.expected,
          message: details.message,
          stack: details.source || null
        };

        if (this.tests[details.testId]) {
          if (!details.result) {
            this.tests[details.testId].errors.push(assertion);
          }

          this.tests[details.testId].assertions.push(assertion);
        }
      }
    }, {
      key: "onTestDone",
      value: function onTestDone(details) {
        var testEnd = this.tests[details.testId];

        if (details.failed > 0) {
          testEnd.status = 'failed';
        } else if (details.skipped) {
          testEnd.status = 'skipped';
        } else {
          testEnd.status = 'passed';
        } // QUnit uses 0 instead of null for runtime of skipped tests.


        if (!details.skipped) {
          testEnd.runtime = details.runtime;
        } else {
          testEnd.runtime = null;
        }
      }
    }, {
      key: "onDone",
      value: function onDone() {
        [this.globalSuite].forEach(function setSuiteEndData(suite) {
          var helperData = helpers.collectSuiteEndData(suite.tests, suite.childSuites);
          suite.status = helperData.status;
          suite.testCounts = helperData.testCounts;
          suite.runtime = helperData.runtime;
          suite.childSuites.forEach(setSuiteEndData);
        });
        this.emit('runStart', helpers.createSuiteStart(this.globalSuite));
        this.emitData(this.globalSuite);
        this.emit('runEnd', this.globalSuite);
      }
    }]);

    return QUnitAdapter;
  }(events);

  /**
   * Known limitations:
   *
   * - Errors in afterAll are ignored.
   */

  var JasmineAdapter_1 = /*#__PURE__*/function (_EventEmitter) {
    _inherits(JasmineAdapter, _EventEmitter);

    var _super = _createSuper(JasmineAdapter);

    function JasmineAdapter(jasmine) {
      var _this;

      _classCallCheck(this, JasmineAdapter);

      _this = _super.call(this); // NodeJS or browser

      _this.env = jasmine.env || jasmine.getEnv();
      _this.suiteStarts = {};
      _this.suiteChildren = {};
      _this.suiteEnds = {};
      _this.testStarts = {};
      _this.testEnds = {}; // See <https://jasmine.github.io/api/3.6/Reporter.html>

      var reporter = {
        jasmineStarted: _this.onJasmineStarted.bind(_assertThisInitialized(_this)),
        specDone: _this.onSpecDone.bind(_assertThisInitialized(_this)),
        specStarted: _this.onSpecStarted.bind(_assertThisInitialized(_this)),
        suiteStarted: _this.onSuiteStarted.bind(_assertThisInitialized(_this)),
        suiteDone: _this.onSuiteDone.bind(_assertThisInitialized(_this)),
        jasmineDone: _this.onJasmineDone.bind(_assertThisInitialized(_this))
      };

      if (jasmine.addReporter) {
        // For Node.js, use the method from jasmine-npm
        jasmine.addReporter(reporter);
      } else {
        // For browser, use the method from jasmine-core
        _this.env.addReporter(reporter);
      }

      return _this;
    }

    _createClass(JasmineAdapter, [{
      key: "createAssertion",
      value: function createAssertion(expectation) {
        return {
          passed: expectation.passed,
          actual: expectation.actual,
          expected: expectation.expected,
          message: expectation.message,
          stack: expectation.stack !== '' ? expectation.stack : null
        };
      }
    }, {
      key: "createTestEnd",
      value: function createTestEnd(testStart, result) {
        var _this2 = this;

        var errors = result.failedExpectations.map(function (expectation) {
          return _this2.createAssertion(expectation);
        });
        var assertions = errors.concat(result.passedExpectations.map(function (expectation) {
          return _this2.createAssertion(expectation);
        }));
        return {
          name: testStart.name,
          suiteName: testStart.suiteName,
          fullName: testStart.fullName.slice(),
          status: result.status === 'pending' ? 'skipped' : result.status,
          runtime: result.status === 'pending' ? null : new Date() - this.startTime,
          errors: errors,
          assertions: assertions
        };
      }
      /**
       * Convert a Jasmine SuiteResult for CRI 'runStart' or 'suiteStart' event data.
       *
       * Jasmine provides details about childSuites and tests only in the structure
       * returned by "this.env.topSuite()".
       */

    }, {
      key: "createSuiteStart",
      value: function createSuiteStart(result, parentNames) {
        var _this3 = this;

        var isGlobalSuite = result.description === 'Jasmine__TopLevel__Suite';
        var name = isGlobalSuite ? null : result.description;
        var fullName = parentNames.slice();
        var tests = [];
        var childSuites = [];

        if (!isGlobalSuite) {
          fullName.push(result.description);
        }

        result.children.forEach(function (child) {
          if (child.id.indexOf('suite') === 0) {
            childSuites.push(_this3.createSuiteStart(child, fullName));
          } else {
            var testStart = {
              name: child.description,
              suiteName: name,
              fullName: [].concat(_toConsumableArray(fullName), [child.description])
            };
            tests.push(testStart);
            _this3.testStarts[child.id] = testStart;
          }
        });
        var helperData = helpers.collectSuiteStartData(tests, childSuites);
        var suiteStart = {
          name: name,
          fullName: fullName,
          tests: tests,
          childSuites: childSuites,
          testCounts: helperData.testCounts
        };
        this.suiteStarts[result.id] = suiteStart;
        this.suiteChildren[result.id] = result.children.map(function (child) {
          return child.id;
        });
        return suiteStart;
      }
    }, {
      key: "createSuiteEnd",
      value: function createSuiteEnd(suiteStart, result) {
        var _this4 = this;

        var tests = [];
        var childSuites = [];
        this.suiteChildren[result.id].forEach(function (childId) {
          if (childId.indexOf('suite') === 0) {
            childSuites.push(_this4.suiteEnds[childId]);
          } else {
            tests.push(_this4.testEnds[childId]);
          }
        });
        var helperData = helpers.collectSuiteEndData(tests, childSuites);
        return {
          name: suiteStart.name,
          fullName: suiteStart.fullName,
          tests: tests,
          childSuites: childSuites,
          // Jasmine has result.status, but does not propagate 'todo' or 'skipped'
          status: helperData.status,
          testCounts: helperData.testCounts,
          // Jasmine 3.4+ has result.duration, but uses 0 instead of null
          // when 'skipped' is skipped.
          runtime: helperData.status === 'skipped' ? null : result.duration || helperData.runtime
        };
      }
    }, {
      key: "onJasmineStarted",
      value: function onJasmineStarted() {
        this.globalSuite = this.createSuiteStart(this.env.topSuite(), []);
        this.emit('runStart', this.globalSuite);
      }
    }, {
      key: "onSuiteStarted",
      value: function onSuiteStarted(result) {
        this.emit('suiteStart', this.suiteStarts[result.id]);
      }
    }, {
      key: "onSpecStarted",
      value: function onSpecStarted(result) {
        this.startTime = new Date();
        this.emit('testStart', this.testStarts[result.id]);
      }
    }, {
      key: "onSpecDone",
      value: function onSpecDone(result) {
        this.testEnds[result.id] = this.createTestEnd(this.testStarts[result.id], result);
        this.emit('testEnd', this.testEnds[result.id]);
      }
    }, {
      key: "onSuiteDone",
      value: function onSuiteDone(result) {
        this.suiteEnds[result.id] = this.createSuiteEnd(this.suiteStarts[result.id], result);
        this.emit('suiteEnd', this.suiteEnds[result.id]);
      }
    }, {
      key: "onJasmineDone",
      value: function onJasmineDone(doneInfo) {
        this.emit('runEnd', this.createSuiteEnd(this.globalSuite, this.env.topSuite()));
      }
    }]);

    return JasmineAdapter;
  }(events);

  var MochaAdapter_1 = /*#__PURE__*/function (_EventEmitter) {
    _inherits(MochaAdapter, _EventEmitter);

    var _super = _createSuper(MochaAdapter);

    function MochaAdapter(mocha) {
      var _this;

      _classCallCheck(this, MochaAdapter);

      _this = _super.call(this);
      _this.errors = null; // Mocha will instantiate the given function as a class, even if you only need a callback.
      // As such, it can't be an arrow function as those throw TypeError when instantiated.

      var self = _assertThisInitialized(_this);

      mocha.reporter(function (runner) {
        self.runner = runner;
        runner.on('start', self.onStart.bind(self));
        runner.on('suite', self.onSuite.bind(self));
        runner.on('test', self.onTest.bind(self));
        runner.on('pending', self.onPending.bind(self));
        runner.on('fail', self.onFail.bind(self));
        runner.on('test end', self.onTestEnd.bind(self));
        runner.on('suite end', self.onSuiteEnd.bind(self));
        runner.on('end', self.onEnd.bind(self));
      });
      return _this;
    }

    _createClass(MochaAdapter, [{
      key: "convertToSuiteStart",
      value: function convertToSuiteStart(mochaSuite) {
        return {
          name: mochaSuite.title,
          fullName: this.titlePath(mochaSuite),
          tests: mochaSuite.tests.map(this.convertTest.bind(this)),
          childSuites: mochaSuite.suites.map(this.convertToSuiteStart.bind(this)),
          testCounts: {
            total: mochaSuite.total()
          }
        };
      }
    }, {
      key: "convertToSuiteEnd",
      value: function convertToSuiteEnd(mochaSuite) {
        var tests = mochaSuite.tests.map(this.convertTest.bind(this));
        var childSuites = mochaSuite.suites.map(this.convertToSuiteEnd.bind(this));
        var helperData = helpers.collectSuiteEndData(tests, childSuites);
        return {
          name: mochaSuite.title,
          fullName: this.titlePath(mochaSuite),
          tests: tests,
          childSuites: childSuites,
          status: helperData.status,
          testCounts: helperData.testCounts,
          runtime: helperData.runtime
        };
      }
    }, {
      key: "convertTest",
      value: function convertTest(mochaTest) {
        var suiteName;
        var fullName;

        if (!mochaTest.parent.root) {
          suiteName = mochaTest.parent.title;
          fullName = this.titlePath(mochaTest.parent); // Add also the test name.

          fullName.push(mochaTest.title);
        } else {
          suiteName = null;
          fullName = [mochaTest.title];
        }

        if (mochaTest.errors !== undefined) {
          // If the test has the 'errors' property, this is a "test end".
          var errors = mochaTest.errors.map(function (error) {
            return {
              passed: false,
              actual: error.actual,
              expected: error.expected,
              message: error.message || error.toString(),
              stack: error.stack
            };
          });
          return {
            name: mochaTest.title,
            suiteName: suiteName,
            fullName: fullName,
            status: mochaTest.state === undefined ? 'skipped' : mochaTest.state,
            runtime: mochaTest.duration === undefined ? null : mochaTest.duration,
            errors: errors,
            assertions: errors
          };
        } else {
          // It is a "test start".
          return {
            name: mochaTest.title,
            suiteName: suiteName,
            fullName: fullName
          };
        }
      }
    }, {
      key: "titlePath",
      value: function titlePath(mochaSuite) {
        if (mochaSuite.titlePath) {
          // Mocha 4.0+ has Suite#titlePath()
          return mochaSuite.titlePath();
        }

        var fullName = [];

        if (!mochaSuite.root) {
          fullName.push(mochaSuite.title);
        }

        var parent = mochaSuite.parent;

        while (parent && !parent.root) {
          fullName.unshift(parent.title);
          parent = parent.parent;
        }

        return fullName;
      }
    }, {
      key: "onStart",
      value: function onStart() {
        var globalSuiteStart = this.convertToSuiteStart(this.runner.suite);
        globalSuiteStart.name = null;
        this.emit('runStart', globalSuiteStart);
      }
    }, {
      key: "onSuite",
      value: function onSuite(mochaSuite) {
        if (!mochaSuite.root) {
          this.emit('suiteStart', this.convertToSuiteStart(mochaSuite));
        }
      }
    }, {
      key: "onTest",
      value: function onTest(mochaTest) {
        this.errors = [];
        this.emit('testStart', this.convertTest(mochaTest));
      }
      /**
       * Mocha emits skipped tests here instead of on the "test" event.
       */

    }, {
      key: "onPending",
      value: function onPending(mochaTest) {
        this.emit('testStart', this.convertTest(mochaTest));
      }
    }, {
      key: "onFail",
      value: function onFail(test, error) {
        this.errors.push(error);
      }
    }, {
      key: "onTestEnd",
      value: function onTestEnd(mochaTest) {
        // Save the errors on Mocha's test object, because when the suite that
        // contains this test is emitted on the "suiteEnd" event, it should also
        // contain this test with all its details (errors, status, runtime). Runtime
        // and status are already attached to the test, but the errors are not.
        mochaTest.errors = this.errors;
        this.emit('testEnd', this.convertTest(mochaTest));
      }
    }, {
      key: "onSuiteEnd",
      value: function onSuiteEnd(mochaSuite) {
        if (!mochaSuite.root) {
          this.emit('suiteEnd', this.convertToSuiteEnd(mochaSuite));
        }
      }
    }, {
      key: "onEnd",
      value: function onEnd() {
        var globalSuiteEnd = this.convertToSuiteEnd(this.runner.suite);
        globalSuiteEnd.name = null;
        this.emit('runEnd', globalSuiteEnd);
      }
    }]);

    return MochaAdapter;
  }(events);

  var FORCE_COLOR,
      NODE_DISABLE_COLORS,
      NO_COLOR,
      TERM,
      isTTY = true;

  if (typeof process !== 'undefined') {
    var _process$env = process.env;
    FORCE_COLOR = _process$env.FORCE_COLOR;
    NODE_DISABLE_COLORS = _process$env.NODE_DISABLE_COLORS;
    NO_COLOR = _process$env.NO_COLOR;
    TERM = _process$env.TERM;
    isTTY = process.stdout && process.stdout.isTTY;
  }

  var $ = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY),
    // modifiers
    reset: init(0, 0),
    bold: init(1, 22),
    dim: init(2, 22),
    italic: init(3, 23),
    underline: init(4, 24),
    inverse: init(7, 27),
    hidden: init(8, 28),
    strikethrough: init(9, 29),
    // colors
    black: init(30, 39),
    red: init(31, 39),
    green: init(32, 39),
    yellow: init(33, 39),
    blue: init(34, 39),
    magenta: init(35, 39),
    cyan: init(36, 39),
    white: init(37, 39),
    gray: init(90, 39),
    grey: init(90, 39),
    // background colors
    bgBlack: init(40, 49),
    bgRed: init(41, 49),
    bgGreen: init(42, 49),
    bgYellow: init(43, 49),
    bgBlue: init(44, 49),
    bgMagenta: init(45, 49),
    bgCyan: init(46, 49),
    bgWhite: init(47, 49)
  };

  function run(arr, str) {
    var i = 0,
        tmp,
        beg = '',
        end = '';

    for (; i < arr.length; i++) {
      tmp = arr[i];
      beg += tmp.open;
      end += tmp.close;

      if (!!~str.indexOf(tmp.close)) {
        str = str.replace(tmp.rgx, tmp.close + tmp.open);
      }
    }

    return beg + str + end;
  }

  function chain(has, keys) {
    var ctx = {
      has: has,
      keys: keys
    };
    ctx.reset = $.reset.bind(ctx);
    ctx.bold = $.bold.bind(ctx);
    ctx.dim = $.dim.bind(ctx);
    ctx.italic = $.italic.bind(ctx);
    ctx.underline = $.underline.bind(ctx);
    ctx.inverse = $.inverse.bind(ctx);
    ctx.hidden = $.hidden.bind(ctx);
    ctx.strikethrough = $.strikethrough.bind(ctx);
    ctx.black = $.black.bind(ctx);
    ctx.red = $.red.bind(ctx);
    ctx.green = $.green.bind(ctx);
    ctx.yellow = $.yellow.bind(ctx);
    ctx.blue = $.blue.bind(ctx);
    ctx.magenta = $.magenta.bind(ctx);
    ctx.cyan = $.cyan.bind(ctx);
    ctx.white = $.white.bind(ctx);
    ctx.gray = $.gray.bind(ctx);
    ctx.grey = $.grey.bind(ctx);
    ctx.bgBlack = $.bgBlack.bind(ctx);
    ctx.bgRed = $.bgRed.bind(ctx);
    ctx.bgGreen = $.bgGreen.bind(ctx);
    ctx.bgYellow = $.bgYellow.bind(ctx);
    ctx.bgBlue = $.bgBlue.bind(ctx);
    ctx.bgMagenta = $.bgMagenta.bind(ctx);
    ctx.bgCyan = $.bgCyan.bind(ctx);
    ctx.bgWhite = $.bgWhite.bind(ctx);
    return ctx;
  }

  function init(open, close) {
    var blk = {
      open: "\x1B[".concat(open, "m"),
      close: "\x1B[".concat(close, "m"),
      rgx: new RegExp("\\x1b\\[".concat(close, "m"), 'g')
    };
    return function (txt) {
      if (this !== void 0 && this.has !== void 0) {
        !!~this.has.indexOf(open) || (this.has.push(open), this.keys.push(blk));
        return txt === void 0 ? this : $.enabled ? run(this.keys, txt + '') : txt + '';
      }

      return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt + '') : txt + '';
    };
  }

  var kleur = $;

  var hasOwn = Object.hasOwnProperty;
  /**
   * Format a given value into YAML.
   *
   * YAML is a superset of JSON that supports all the same data
   * types and syntax, and more. As such, it is always possible
   * to fallback to JSON.stringfify, but we generally avoid
   * that to make output easier to read for humans.
   *
   * Supported data types:
   *
   * - null
   * - boolean
   * - number
   * - string
   * - array
   * - object
   *
   * Anything else (including NaN, Infinity, and undefined)
   * must be described in strings, for display purposes.
   *
   * Note that quotes are optional in YAML strings if the
   * strings are "simple", and as such we generally prefer
   * that for improved readability. We output strings in
   * one of three ways:
   *
   * - bare unquoted text, for simple one-line strings.
   * - JSON (quoted text), for complex one-line strings.
   * - YAML Block, for complex multi-line strings.
   */

  function prettyYamlValue(value) {
    var indent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;

    if (value === undefined) {
      // Not supported in JSON/YAML, turn into string
      // and let the below output it as bare string.
      value = String(value);
    } // Support IE 9-11: Use isFinite instead of ES6 Number.isFinite


    if (typeof value === 'number' && !isFinite(value)) {
      // Turn NaN and Infinity into simple strings.
      // Paranoia: Don't return directly just in case there's
      // a way to add special characters here.
      value = String(value);
    }

    if (typeof value === 'number') {
      // Simple numbers
      return JSON.stringify(value);
    }

    if (typeof value === 'string') {
      // If any of these match, then we can't output it
      // as bare unquoted text, because that would either
      // cause data loss or invalid YAML syntax.
      //
      // - Quotes, escapes, line breaks, or JSON-like stuff.
      var rSpecialJson = /['"\\/[{}\]\r\n]/; // - Characters that are special at the start of a YAML value

      var rSpecialYaml = /[-?:,[\]{}#&*!|=>'"%@`]/; // - Leading or trailing whitespace.

      var rUntrimmed = /(^\s|\s$)/; // - Ambiguous as YAML number, e.g. '2', '-1.2', '.2', or '2_000'

      var rNumerical = /^[\d._-]+$/; // - Ambiguous as YAML bool.
      //   Use case-insensitive match, although technically only
      //   fully-lower, fully-upper, or uppercase-first would be ambiguous.
      //   e.g. true/True/TRUE, but not tRUe.

      var rBool = /^(true|false|y|n|yes|no|on|off)$/i; // Is this a complex string?

      if (value === '' || rSpecialJson.test(value) || rSpecialYaml.test(value[0]) || rUntrimmed.test(value) || rNumerical.test(value) || rBool.test(value)) {
        if (!/\n/.test(value)) {
          // Complex one-line string, use JSON (quoted string)
          return JSON.stringify(value);
        } // See also <https://yaml-multiline.info/>
        // Support IE 9-11: Avoid ES6 String#repeat


        var prefix = new Array(indent + 1).join(' ');
        var trailingLinebreakMatch = value.match(/\n+$/);
        var trailingLinebreaks = trailingLinebreakMatch ? trailingLinebreakMatch[0].length : 0;

        if (trailingLinebreaks === 1) {
          // Use the most straight-forward "Block" string in YAML
          // without any "Chomping" indicators.
          var lines = value // Ignore the last new line, since we'll get that one for free
          // with the straight-forward Block syntax.
          .replace(/\n$/, '').split('\n').map(function (line) {
            return prefix + line;
          });
          return '|\n' + lines.join('\n');
        } else {
          // This has either no trailing new lines, or more than 1.
          // Use |+ so that YAML parsers will preserve it exactly.
          var _lines = value.split('\n').map(function (line) {
            return prefix + line;
          });

          return '|+\n' + _lines.join('\n');
        }
      } else {
        // Simple string, use bare unquoted text
        return value;
      }
    } // Handle null, boolean, array, and object


    return JSON.stringify(value, null, 2);
  }

  var TapReporter_1 = /*#__PURE__*/function () {
    function TapReporter(runner) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, TapReporter);

      // Cache references to console methods to ensure we can report failures
      // from tests tests that mock the console object itself.
      // https://github.com/js-reporters/js-reporters/issues/125
      this.log = options.log || console.log.bind(console);
      this.testCount = 0;
      runner.on('runStart', this.onRunStart.bind(this));
      runner.on('testEnd', this.onTestEnd.bind(this));
      runner.on('runEnd', this.onRunEnd.bind(this));
    }

    _createClass(TapReporter, [{
      key: "onRunStart",
      value: function onRunStart(globalSuite) {
        this.log('TAP version 13');
      }
    }, {
      key: "onTestEnd",
      value: function onTestEnd(test) {
        var _this = this;

        this.testCount = this.testCount + 1;

        if (test.status === 'passed') {
          this.log("ok ".concat(this.testCount, " ").concat(test.fullName.join(' > ')));
        } else if (test.status === 'skipped') {
          this.log(kleur.yellow("ok ".concat(this.testCount, " # SKIP ").concat(test.fullName.join(' > '))));
        } else if (test.status === 'todo') {
          this.log(kleur.cyan("not ok ".concat(this.testCount, " # TODO ").concat(test.fullName.join(' > '))));
          test.errors.forEach(function (error) {
            return _this.logError(error, 'todo');
          });
        } else {
          this.log(kleur.red("not ok ".concat(this.testCount, " ").concat(test.fullName.join(' > '))));
          test.errors.forEach(function (error) {
            return _this.logError(error);
          });
        }
      }
    }, {
      key: "onRunEnd",
      value: function onRunEnd(globalSuite) {
        this.log("1..".concat(globalSuite.testCounts.total));
        this.log("# pass ".concat(globalSuite.testCounts.passed));
        this.log(kleur.yellow("# skip ".concat(globalSuite.testCounts.skipped)));
        this.log(kleur.cyan("# todo ".concat(globalSuite.testCounts.todo)));
        this.log(kleur.red("# fail ".concat(globalSuite.testCounts.failed)));
      }
    }, {
      key: "logError",
      value: function logError(error, severity) {
        var out = '  ---';
        out += "\n  message: ".concat(prettyYamlValue(error.message || 'failed'));
        out += "\n  severity: ".concat(prettyYamlValue(severity || 'failed'));

        if (hasOwn.call(error, 'actual')) {
          out += "\n  actual  : ".concat(prettyYamlValue(error.actual));
        }

        if (hasOwn.call(error, 'expected')) {
          out += "\n  expected: ".concat(prettyYamlValue(error.expected));
        }

        if (error.stack) {
          // Since stacks aren't user generated, take a bit of liberty by
          // adding a trailing new line to allow a straight-forward YAML Blocks.
          out += "\n  stack: ".concat(prettyYamlValue(error.stack + '\n'));
        }

        out += '\n  ...';
        this.log(out);
      }
    }], [{
      key: "init",
      value: function init(runner) {
        return new TapReporter(runner);
      }
    }]);

    return TapReporter;
  }();

  var ConsoleReporter_1 = /*#__PURE__*/function () {
    function ConsoleReporter(runner) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, ConsoleReporter);

      // Cache references to console methods to ensure we can report failures
      // from tests tests that mock the console object itself.
      // https://github.com/js-reporters/js-reporters/issues/125
      this.log = options.log || console.log.bind(console);
      this.group = options.log && options.group || ('group' in console && 'groupEnd' in console ? console.group.bind(console) : function () {});
      this.groupEnd = options.log && options.groupEnd || ('group' in console && 'groupEnd' in console ? console.groupEnd.bind(console) : function () {});
      runner.on('runStart', this.onRunStart.bind(this));
      runner.on('suiteStart', this.onSuiteStart.bind(this));
      runner.on('testStart', this.onTestStart.bind(this));
      runner.on('testEnd', this.onTestEnd.bind(this));
      runner.on('suiteEnd', this.onSuiteEnd.bind(this));
      runner.on('runEnd', this.onRunEnd.bind(this));
    }

    _createClass(ConsoleReporter, [{
      key: "onRunStart",
      value: function onRunStart(suite) {
        this.log('runStart', suite);
      }
    }, {
      key: "onSuiteStart",
      value: function onSuiteStart(suite) {
        this.group(suite.name);
        this.log('suiteStart', suite);
      }
    }, {
      key: "onTestStart",
      value: function onTestStart(test) {
        this.log('testStart', test);
      }
    }, {
      key: "onTestEnd",
      value: function onTestEnd(test) {
        this.log('testEnd', test);
      }
    }, {
      key: "onSuiteEnd",
      value: function onSuiteEnd(suite) {
        this.log('suiteEnd', suite);
        this.groupEnd();
      }
    }, {
      key: "onRunEnd",
      value: function onRunEnd(globalSuite) {
        this.log('runEnd', globalSuite);
      }
    }], [{
      key: "init",
      value: function init(runner) {
        return new ConsoleReporter(runner);
      }
    }]);

    return ConsoleReporter;
  }();

  /* global QUnit, mocha, jasmine */
  /**
   * Auto registers the adapter for the respective testing framework and
   * returns the runner for event listening.
   */

  function autoRegister() {
    var runner;

    if (QUnit) {
      runner = new QUnitAdapter_1(QUnit);
    } else if (mocha) {
      runner = new MochaAdapter_1(mocha);
    } else if (jasmine) {
      runner = new JasmineAdapter_1(jasmine);
    } else {
      throw new Error('Failed to register js-reporters adapter. Supported ' + 'frameworks are: QUnit, Mocha, Jasmine');
    }

    return runner;
  }

  var auto = {
    autoRegister: autoRegister
  };

  var collectSuiteStartData$1 = helpers.collectSuiteStartData,
      collectSuiteEndData$1 = helpers.collectSuiteEndData,
      createSuiteStart$1 = helpers.createSuiteStart,
      createTestStart$1 = helpers.createTestStart;
  var autoRegister$1 = auto.autoRegister;
  var jsReporters = {
    QUnitAdapter: QUnitAdapter_1,
    JasmineAdapter: JasmineAdapter_1,
    MochaAdapter: MochaAdapter_1,
    TapReporter: TapReporter_1,
    ConsoleReporter: ConsoleReporter_1,
    EventEmitter: events,
    collectSuiteStartData: collectSuiteStartData$1,
    collectSuiteEndData: collectSuiteEndData$1,
    createSuiteStart: createSuiteStart$1,
    createTestStart: createTestStart$1,
    autoRegister: autoRegister$1
  };

  return jsReporters;

})));
