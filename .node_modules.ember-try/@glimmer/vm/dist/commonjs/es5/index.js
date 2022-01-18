'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _opcodes = require('./lib/opcodes');

Object.defineProperty(exports, 'isMachineOp', {
  enumerable: true,
  get: function () {
    return _opcodes.isMachineOp;
  }
});
Object.defineProperty(exports, 'isOp', {
  enumerable: true,
  get: function () {
    return _opcodes.isOp;
  }
});

var _registers = require('./lib/registers');

Object.defineProperty(exports, 'SavedRegister', {
  enumerable: true,
  get: function () {
    return _registers.SavedRegister;
  }
});
Object.defineProperty(exports, 'TemporaryRegister', {
  enumerable: true,
  get: function () {
    return _registers.TemporaryRegister;
  }
});
Object.defineProperty(exports, 'isLowLevelRegister', {
  enumerable: true,
  get: function () {
    return _registers.isLowLevelRegister;
  }
});
Object.defineProperty(exports, '$pc', {
  enumerable: true,
  get: function () {
    return _registers.$pc;
  }
});
Object.defineProperty(exports, '$fp', {
  enumerable: true,
  get: function () {
    return _registers.$fp;
  }
});
Object.defineProperty(exports, '$ra', {
  enumerable: true,
  get: function () {
    return _registers.$ra;
  }
});
Object.defineProperty(exports, '$sp', {
  enumerable: true,
  get: function () {
    return _registers.$sp;
  }
});
Object.defineProperty(exports, '$s0', {
  enumerable: true,
  get: function () {
    return _registers.$s0;
  }
});
Object.defineProperty(exports, '$s1', {
  enumerable: true,
  get: function () {
    return _registers.$s1;
  }
});
Object.defineProperty(exports, '$t0', {
  enumerable: true,
  get: function () {
    return _registers.$t0;
  }
});
Object.defineProperty(exports, '$t1', {
  enumerable: true,
  get: function () {
    return _registers.$t1;
  }
});
Object.defineProperty(exports, '$v0', {
  enumerable: true,
  get: function () {
    return _registers.$v0;
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZtL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQUFBLEk7Ozs7Ozs7OztzQkFDQSxhOzs7Ozs7c0JBQUEsaUI7Ozs7OztzQkFBQSxrQjs7Ozs7O3NCQUFBLEc7Ozs7OztzQkFBQSxHOzs7Ozs7c0JBQUEsRzs7Ozs7O3NCQUFBLEc7Ozs7OztzQkFBQSxHOzs7Ozs7c0JBQUEsRzs7Ozs7O3NCQUFBLEc7Ozs7OztzQkFBQSxHOzs7Ozs7c0JBQUEsRyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7IGlzTWFjaGluZU9wLCBpc09wIH0gZnJvbSAnLi9saWIvb3Bjb2Rlcyc7XG5leHBvcnQge1xuICBNYWNoaW5lUmVnaXN0ZXIsXG4gIFN5c2NhbGxSZWdpc3RlcixcbiAgU2F2ZWRSZWdpc3RlcixcbiAgVGVtcG9yYXJ5UmVnaXN0ZXIsXG4gIFJlZ2lzdGVyLFxuICBpc0xvd0xldmVsUmVnaXN0ZXIsXG4gICRwYyxcbiAgJGZwLFxuICAkcmEsXG4gICRzcCxcbiAgJHMwLFxuICAkczEsXG4gICR0MCxcbiAgJHQxLFxuICAkdjAsXG59IGZyb20gJy4vbGliL3JlZ2lzdGVycyc7XG4iXSwic291cmNlUm9vdCI6IiJ9