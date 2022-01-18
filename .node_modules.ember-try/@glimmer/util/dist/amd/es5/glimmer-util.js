define('@glimmer/util', ['exports'], function (exports) { 'use strict';

    var EMPTY_ARRAY = Object.freeze([]);

    // import Logger from './logger';
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
        console.warn('DEPRECATION: ' + desc);
    }

    var GUID = 0;
    function initializeGuid(object) {
        return object._guid = ++GUID;
    }
    function ensureGuid(object) {
        return object._guid || initializeGuid(object);
    }

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function dict() {
        return Object.create(null);
    }
    function isDict(u) {
        return u !== null && u !== undefined;
    }
    function isObject(u) {
        return typeof u === 'object' && u !== null;
    }
    var DictSet = function () {
        function DictSet() {
            _classCallCheck(this, DictSet);

            this.dict = dict();
        }

        DictSet.prototype.add = function add(obj) {
            if (typeof obj === 'string') this.dict[obj] = obj;else this.dict[ensureGuid(obj)] = obj;
            return this;
        };

        DictSet.prototype.delete = function _delete(obj) {
            if (typeof obj === 'string') delete this.dict[obj];else if (obj._guid) delete this.dict[obj._guid];
        };

        return DictSet;
    }();
    var StackImpl = function () {
        function StackImpl() {
            _classCallCheck(this, StackImpl);

            this.stack = [];
            this.current = null;
        }

        StackImpl.prototype.push = function push(item) {
            this.current = item;
            this.stack.push(item);
        };

        StackImpl.prototype.pop = function pop() {
            var item = this.stack.pop();
            var len = this.stack.length;
            this.current = len === 0 ? null : this.stack[len - 1];
            return item === undefined ? null : item;
        };

        StackImpl.prototype.nth = function nth(from) {
            var len = this.stack.length;
            return len < from ? null : this.stack[len - from];
        };

        StackImpl.prototype.isEmpty = function isEmpty() {
            return this.stack.length === 0;
        };

        StackImpl.prototype.toArray = function toArray() {
            return this.stack;
        };

        _createClass(StackImpl, [{
            key: 'size',
            get: function get() {
                return this.stack.length;
            }
        }]);

        return StackImpl;
    }();

    var DESTROY = 'DESTROY [fc611582-3742-4845-88e1-971c3775e0b8]';
    function isDestroyable(value) {
        return !!(value && DESTROY in value);
    }
    function isStringDestroyable(value) {
        return !!(value && typeof value === 'object' && typeof value.destroy === 'function');
    }

    function clearElement(parent) {
        var current = parent.firstChild;
        while (current) {
            var next = current.nextSibling;
            parent.removeChild(current);
            current = next;
        }
    }

    var SERIALIZATION_FIRST_NODE_STRING = '%+b:0%';
    function isSerializationFirstNode(node) {
        return node.nodeValue === SERIALIZATION_FIRST_NODE_STRING;
    }

    var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var LINKED = new WeakMap();
    var DROP = 'DROP [94d46cf3-3974-435d-b278-3e60d1155290]';
    var CHILDREN = 'CHILDREN [7142e52a-8600-4e01-a773-42055b96630d]';
    var DESTRUCTORS = new WeakMap();
    function isDrop(value) {
        if (value === null || typeof value !== 'object') return false;
        return DROP in value;
    }
    function associate(parent, child) {
        associateDestructor(parent, destructor(child));
    }
    function associateDestructor(parent, child) {
        var associated = LINKED.get(parent);
        if (!associated) {
            associated = new Set();
            LINKED.set(parent, associated);
        }
        associated.add(child);
    }
    function takeAssociated(parent) {
        var linked = LINKED.get(parent);
        if (linked && linked.size > 0) {
            LINKED.delete(parent);
            return linked;
        } else {
            return null;
        }
    }
    function destroyAssociated(parent) {
        var associated = LINKED.get(parent);
        if (associated) {
            associated.forEach(function (item) {
                item[DROP]();
                associated.delete(item);
            });
        }
    }
    function destructor(value) {
        var d = DESTRUCTORS.get(value);
        if (!d) {
            if (isDestroyable(value)) {
                d = new DestroyableDestructor(value);
            } else if (isStringDestroyable(value)) {
                d = new StringDestroyableDestructor(value);
            } else {
                d = new SimpleDestructor(value);
            }
            DESTRUCTORS.set(value, d);
        }
        return d;
    }
    function snapshot(values) {
        return new SnapshotDestructor(values);
    }

    var SnapshotDestructor = function () {
        function SnapshotDestructor(destructors) {
            _classCallCheck$1(this, SnapshotDestructor);

            this.destructors = destructors;
        }

        SnapshotDestructor.prototype[DROP] = function () {
            this.destructors.forEach(function (item) {
                return item[DROP]();
            });
        };

        SnapshotDestructor.prototype.toString = function toString() {
            return 'SnapshotDestructor';
        };

        _createClass$1(SnapshotDestructor, [{
            key: CHILDREN,
            get: function get() {
                return this.destructors;
            }
        }]);

        return SnapshotDestructor;
    }();

    var DestroyableDestructor = function () {
        function DestroyableDestructor(inner) {
            _classCallCheck$1(this, DestroyableDestructor);

            this.inner = inner;
        }

        DestroyableDestructor.prototype[DROP] = function () {
            this.inner[DESTROY]();
            destroyAssociated(this.inner);
        };

        DestroyableDestructor.prototype.toString = function toString() {
            return 'DestroyableDestructor';
        };

        _createClass$1(DestroyableDestructor, [{
            key: CHILDREN,
            get: function get() {
                return LINKED.get(this.inner) || [];
            }
        }]);

        return DestroyableDestructor;
    }();

    var StringDestroyableDestructor = function () {
        function StringDestroyableDestructor(inner) {
            _classCallCheck$1(this, StringDestroyableDestructor);

            this.inner = inner;
        }

        StringDestroyableDestructor.prototype[DROP] = function () {
            this.inner.destroy();
            destroyAssociated(this.inner);
        };

        StringDestroyableDestructor.prototype.toString = function toString() {
            return 'StringDestroyableDestructor';
        };

        _createClass$1(StringDestroyableDestructor, [{
            key: CHILDREN,
            get: function get() {
                return LINKED.get(this.inner) || [];
            }
        }]);

        return StringDestroyableDestructor;
    }();

    var SimpleDestructor = function () {
        function SimpleDestructor(inner) {
            _classCallCheck$1(this, SimpleDestructor);

            this.inner = inner;
        }

        SimpleDestructor.prototype[DROP] = function () {
            destroyAssociated(this.inner);
        };

        SimpleDestructor.prototype.toString = function toString() {
            return 'SimpleDestructor';
        };

        _createClass$1(SimpleDestructor, [{
            key: CHILDREN,
            get: function get() {
                return LINKED.get(this.inner) || [];
            }
        }]);

        return SimpleDestructor;
    }();

    var ListContentsDestructor = function () {
        function ListContentsDestructor(inner) {
            _classCallCheck$1(this, ListContentsDestructor);

            this.inner = inner;
        }

        ListContentsDestructor.prototype[DROP] = function () {
            this.inner.forEachNode(function (d) {
                return destructor(d)[DROP]();
            });
        };

        ListContentsDestructor.prototype.toString = function toString() {
            return 'ListContentsDestructor';
        };

        _createClass$1(ListContentsDestructor, [{
            key: CHILDREN,
            get: function get() {
                var out = [];
                this.inner.forEachNode(function (d) {
                    return out.push.apply(out, destructor(d)[CHILDREN]);
                });
                return out;
            }
        }]);

        return ListContentsDestructor;
    }();
    function debugDropTree(inner) {
        var hasDrop = isDrop(inner);
        var rawChildren = LINKED.get(inner) || null;
        var children = null;
        if (rawChildren) {
            children = [];
            for (var _iterator = rawChildren, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var child = _ref;

                children.push(debugDropTree(child));
            }
        }
        var obj = Object.create(null);
        obj.inner = inner;
        if (children) {
            obj.children = children;
        }
        obj.hasDrop = hasDrop;
        return obj;
    }
    function printDropTree(inner) {
        printDrop(destructor(inner));
    }
    function printDrop(inner) {
        console.group(String(inner));
        console.log(inner);
        var children = inner[CHILDREN] || null;
        if (children) {
            for (var _iterator2 = children, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                var _ref2;

                if (_isArray2) {
                    if (_i2 >= _iterator2.length) break;
                    _ref2 = _iterator2[_i2++];
                } else {
                    _i2 = _iterator2.next();
                    if (_i2.done) break;
                    _ref2 = _i2.value;
                }

                var child = _ref2;

                printDrop(child);
            }
        }
        console.groupEnd();
    }

    var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    var ListNode = function ListNode(value) {
        _classCallCheck$2(this, ListNode);

        this.next = null;
        this.prev = null;
        this.value = value;
    };
    var LinkedList = function () {
        function LinkedList() {
            _classCallCheck$2(this, LinkedList);

            this.clear();
        }

        LinkedList.prototype.head = function head() {
            return this._head;
        };

        LinkedList.prototype.tail = function tail() {
            return this._tail;
        };

        LinkedList.prototype.clear = function clear() {
            this._head = this._tail = null;
        };

        LinkedList.prototype.toArray = function toArray() {
            var out = [];
            this.forEachNode(function (n) {
                return out.push(n);
            });
            return out;
        };

        LinkedList.prototype.nextNode = function nextNode(node) {
            return node.next;
        };

        LinkedList.prototype.forEachNode = function forEachNode(callback) {
            var node = this._head;
            while (node !== null) {
                callback(node);
                node = node.next;
            }
        };

        LinkedList.prototype.insertBefore = function insertBefore(node) {
            var reference = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (reference === null) return this.append(node);
            if (reference.prev) reference.prev.next = node;else this._head = node;
            node.prev = reference.prev;
            node.next = reference;
            reference.prev = node;
            return node;
        };

        LinkedList.prototype.append = function append(node) {
            var tail = this._tail;
            if (tail) {
                tail.next = node;
                node.prev = tail;
                node.next = null;
            } else {
                this._head = node;
            }
            return this._tail = node;
        };

        LinkedList.prototype.remove = function remove(node) {
            if (node.prev) node.prev.next = node.next;else this._head = node.next;
            if (node.next) node.next.prev = node.prev;else this._tail = node.prev;
            return node;
        };

        LinkedList.prototype[DROP] = function () {
            this.forEachNode(function (d) {
                return destructor(d)[DROP]();
            });
        };

        _createClass$2(LinkedList, [{
            key: CHILDREN,
            get: function get() {
                var out = [];
                this.forEachNode(function (d) {
                    return out.push.apply(out, destructor(d)[CHILDREN]);
                });
                return out;
            }
        }]);

        return LinkedList;
    }();
    var ListSlice = function () {
        function ListSlice(head, tail) {
            _classCallCheck$2(this, ListSlice);

            this._head = head;
            this._tail = tail;
        }

        ListSlice.prototype.forEachNode = function forEachNode(callback) {
            var node = this._head;
            while (node !== null) {
                callback(node);
                node = this.nextNode(node);
            }
        };

        ListSlice.prototype.head = function head() {
            return this._head;
        };

        ListSlice.prototype.tail = function tail() {
            return this._tail;
        };

        ListSlice.prototype.toArray = function toArray() {
            var out = [];
            this.forEachNode(function (n) {
                return out.push(n);
            });
            return out;
        };

        ListSlice.prototype.nextNode = function nextNode(node) {
            if (node === this._tail) return null;
            return node.next;
        };

        return ListSlice;
    }();
    var EMPTY_SLICE = new ListSlice(null, null);

    var objKeys = Object.keys;

    function assign(obj) {
        for (var i = 1; i < arguments.length; i++) {
            var assignment = arguments[i];
            if (assignment === null || typeof assignment !== 'object') continue;
            var keys = objKeys(assignment);
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                obj[key] = assignment[key];
            }
        }
        return obj;
    }
    function fillNulls(count) {
        var arr = new Array(count);
        for (var i = 0; i < count; i++) {
            arr[i] = null;
        }
        return arr;
    }

    function keys(obj) {
        return Object.keys(obj);
    }
    function unwrap(val) {
        if (val === null || val === undefined) throw new Error('Expected value to be present');
        return val;
    }
    function expect(val, message) {
        if (val === null || val === undefined) throw new Error(message);
        return val;
    }
    function unreachable() {
        var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'unreachable';

        return new Error(message);
    }
    function exhausted(value) {
        throw new Error('Exhausted ' + value);
    }
    var tuple = function tuple() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return args;
    };

    function strip(strings) {
        var out = '';

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        for (var i = 0; i < strings.length; i++) {
            var string = strings[i];
            var dynamic = args[i] !== undefined ? String(args[i]) : '';
            out += '' + string + dynamic;
        }
        var lines = out.split('\n');
        while (lines.length && lines[0].match(/^\s*$/)) {
            lines.shift();
        }
        while (lines.length && lines[lines.length - 1].match(/^\s*$/)) {
            lines.pop();
        }
        var min = Number.MAX_SAFE_INTEGER;
        for (var _iterator = lines, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var line = _ref;

            var leading = line.match(/^\s*/)[0].length;
            min = Math.min(min, leading);
        }
        var stripped = [];
        for (var _iterator2 = lines, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray2) {
                if (_i2 >= _iterator2.length) break;
                _ref2 = _iterator2[_i2++];
            } else {
                _i2 = _iterator2.next();
                if (_i2.done) break;
                _ref2 = _i2.value;
            }

            var _line = _ref2;

            stripped.push(_line.slice(min));
        }
        return stripped.join('\n');
    }

    exports.EMPTY_ARRAY = EMPTY_ARRAY;
    exports.assert = debugAssert;
    exports.deprecate = deprecate;
    exports.dict = dict;
    exports.DictSet = DictSet;
    exports.isDict = isDict;
    exports.isObject = isObject;
    exports.Stack = StackImpl;
    exports.ensureGuid = ensureGuid;
    exports.initializeGuid = initializeGuid;
    exports.isSerializationFirstNode = isSerializationFirstNode;
    exports.SERIALIZATION_FIRST_NODE_STRING = SERIALIZATION_FIRST_NODE_STRING;
    exports.EMPTY_SLICE = EMPTY_SLICE;
    exports.LinkedList = LinkedList;
    exports.ListNode = ListNode;
    exports.ListSlice = ListSlice;
    exports.assign = assign;
    exports.fillNulls = fillNulls;
    exports.DESTROY = DESTROY;
    exports.isDestroyable = isDestroyable;
    exports.isStringDestroyable = isStringDestroyable;
    exports.clearElement = clearElement;
    exports.LINKED = LINKED;
    exports.DROP = DROP;
    exports.CHILDREN = CHILDREN;
    exports.DESTRUCTORS = DESTRUCTORS;
    exports.isDrop = isDrop;
    exports.associate = associate;
    exports.associateDestructor = associateDestructor;
    exports.takeAssociated = takeAssociated;
    exports.destroyAssociated = destroyAssociated;
    exports.destructor = destructor;
    exports.snapshot = snapshot;
    exports.ListContentsDestructor = ListContentsDestructor;
    exports.debugDropTree = debugDropTree;
    exports.printDropTree = printDropTree;
    exports.printDrop = printDrop;
    exports.keys = keys;
    exports.unwrap = unwrap;
    exports.expect = expect;
    exports.unreachable = unreachable;
    exports.exhausted = exhausted;
    exports.tuple = tuple;
    exports.strip = strip;

    Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci11dGlsLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9hcnJheS11dGlscy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2Fzc2VydC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2d1aWQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9jb2xsZWN0aW9ucy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2Rlc3Ryb3kudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9kb20udHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9pcy1zZXJpYWxpemF0aW9uLWZpcnN0LW5vZGUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9saWZldGltZXMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9saXN0LXV0aWxzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdXRpbC9saWIvb2JqZWN0LXV0aWxzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdXRpbC9saWIvcGxhdGZvcm0tdXRpbHMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9zdHJpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IEVNUFRZX0FSUkFZOiBhbnlbXSA9IE9iamVjdC5mcmVlemUoW10pIGFzIGFueTtcbiIsIi8vIGltcG9ydCBMb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuXG4vLyBsZXQgYWxyZWFkeVdhcm5lZCA9IGZhbHNlO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVidWdBc3NlcnQodGVzdDogYW55LCBtc2c6IHN0cmluZykge1xuICAvLyBpZiAoIWFscmVhZHlXYXJuZWQpIHtcbiAgLy8gICBhbHJlYWR5V2FybmVkID0gdHJ1ZTtcbiAgLy8gICBMb2dnZXIud2FybihcIkRvbid0IGxlYXZlIGRlYnVnIGFzc2VydGlvbnMgb24gaW4gcHVibGljIGJ1aWxkc1wiKTtcbiAgLy8gfVxuXG4gIGlmICghdGVzdCkge1xuICAgIHRocm93IG5ldyBFcnJvcihtc2cgfHwgJ2Fzc2VydGlvbiBmYWlsdXJlJyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2RBc3NlcnQoKSB7fVxuXG5leHBvcnQgZnVuY3Rpb24gZGVwcmVjYXRlKGRlc2M6IHN0cmluZykge1xuICBjb25zb2xlLndhcm4oYERFUFJFQ0FUSU9OOiAke2Rlc2N9YCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlYnVnQXNzZXJ0O1xuIiwibGV0IEdVSUQgPSAwO1xuXG5leHBvcnQgaW50ZXJmYWNlIEhhc0d1aWQge1xuICBfZ3VpZDogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZUd1aWQob2JqZWN0OiBIYXNHdWlkKTogbnVtYmVyIHtcbiAgcmV0dXJuIChvYmplY3QuX2d1aWQgPSArK0dVSUQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlR3VpZChvYmplY3Q6IEhhc0d1aWQpOiBudW1iZXIge1xuICByZXR1cm4gb2JqZWN0Ll9ndWlkIHx8IGluaXRpYWxpemVHdWlkKG9iamVjdCk7XG59XG4iLCJpbXBvcnQgeyBIYXNHdWlkLCBlbnN1cmVHdWlkIH0gZnJvbSAnLi9ndWlkJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJy4vcGxhdGZvcm0tdXRpbHMnO1xuaW1wb3J0IHsgRGljdCwgU3RhY2sgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGludGVyZmFjZSBTZXQ8VD4ge1xuICBhZGQodmFsdWU6IFQpOiBTZXQ8VD47XG4gIGRlbGV0ZSh2YWx1ZTogVCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWN0PFQgPSB1bmtub3duPigpOiBEaWN0PFQ+IHtcbiAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RpY3Q8VD4odTogVCk6IHUgaXMgRGljdCAmIFQge1xuICByZXR1cm4gdSAhPT0gbnVsbCAmJiB1ICE9PSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdDxUPih1OiBUKTogdSBpcyBvYmplY3QgJiBUIHtcbiAgcmV0dXJuIHR5cGVvZiB1ID09PSAnb2JqZWN0JyAmJiB1ICE9PSBudWxsO1xufVxuXG5leHBvcnQgdHlwZSBTZXRNZW1iZXIgPSBIYXNHdWlkIHwgc3RyaW5nO1xuXG5leHBvcnQgY2xhc3MgRGljdFNldDxUIGV4dGVuZHMgU2V0TWVtYmVyPiBpbXBsZW1lbnRzIFNldDxUPiB7XG4gIHByaXZhdGUgZGljdDogRGljdDxUPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmRpY3QgPSBkaWN0PFQ+KCk7XG4gIH1cblxuICBhZGQob2JqOiBUKTogU2V0PFQ+IHtcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHRoaXMuZGljdFtvYmogYXMgYW55XSA9IG9iajtcbiAgICBlbHNlIHRoaXMuZGljdFtlbnN1cmVHdWlkKG9iaiBhcyBhbnkpXSA9IG9iajtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRlbGV0ZShvYmo6IFQpIHtcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIGRlbGV0ZSB0aGlzLmRpY3Rbb2JqIGFzIGFueV07XG4gICAgZWxzZSBpZiAoKG9iaiBhcyBhbnkpLl9ndWlkKSBkZWxldGUgdGhpcy5kaWN0WyhvYmogYXMgYW55KS5fZ3VpZF07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN0YWNrSW1wbDxUPiBpbXBsZW1lbnRzIFN0YWNrPFQ+IHtcbiAgcHJpdmF0ZSBzdGFjazogVFtdID0gW107XG4gIHB1YmxpYyBjdXJyZW50OiBPcHRpb248VD4gPSBudWxsO1xuXG4gIHB1YmxpYyBnZXQgc2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjay5sZW5ndGg7XG4gIH1cblxuICBwdXNoKGl0ZW06IFQpIHtcbiAgICB0aGlzLmN1cnJlbnQgPSBpdGVtO1xuICAgIHRoaXMuc3RhY2sucHVzaChpdGVtKTtcbiAgfVxuXG4gIHBvcCgpOiBPcHRpb248VD4ge1xuICAgIGxldCBpdGVtID0gdGhpcy5zdGFjay5wb3AoKTtcbiAgICBsZXQgbGVuID0gdGhpcy5zdGFjay5sZW5ndGg7XG4gICAgdGhpcy5jdXJyZW50ID0gbGVuID09PSAwID8gbnVsbCA6IHRoaXMuc3RhY2tbbGVuIC0gMV07XG5cbiAgICByZXR1cm4gaXRlbSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGl0ZW07XG4gIH1cblxuICBudGgoZnJvbTogbnVtYmVyKTogT3B0aW9uPFQ+IHtcbiAgICBsZXQgbGVuID0gdGhpcy5zdGFjay5sZW5ndGg7XG4gICAgcmV0dXJuIGxlbiA8IGZyb20gPyBudWxsIDogdGhpcy5zdGFja1tsZW4gLSBmcm9tXTtcbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2subGVuZ3RoID09PSAwO1xuICB9XG5cbiAgdG9BcnJheSgpOiBUW10ge1xuICAgIHJldHVybiB0aGlzLnN0YWNrO1xuICB9XG59XG4iLCJpbXBvcnQgeyBNYXliZSwgU3ltYm9sRGVzdHJveWFibGUsIERlc3Ryb3lhYmxlLCBEZXN0cm95U3ltYm9sLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBjb25zdCBERVNUUk9ZOiBEZXN0cm95U3ltYm9sID0gJ0RFU1RST1kgW2ZjNjExNTgyLTM3NDItNDg0NS04OGUxLTk3MWMzNzc1ZTBiOF0nO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNEZXN0cm95YWJsZSh2YWx1ZTogTWF5YmU8RGljdD4pOiB2YWx1ZSBpcyBTeW1ib2xEZXN0cm95YWJsZSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiBERVNUUk9ZIGluIHZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nRGVzdHJveWFibGUodmFsdWU6IE1heWJlPFBhcnRpYWw8RGVzdHJveWFibGU+Pik6IHZhbHVlIGlzIERlc3Ryb3lhYmxlIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLmRlc3Ryb3kgPT09ICdmdW5jdGlvbicpO1xufVxuIiwiaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBTaW1wbGVFbGVtZW50LCBTaW1wbGVOb2RlIH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyRWxlbWVudChwYXJlbnQ6IFNpbXBsZUVsZW1lbnQpIHtcbiAgbGV0IGN1cnJlbnQ6IE9wdGlvbjxTaW1wbGVOb2RlPiA9IHBhcmVudC5maXJzdENoaWxkO1xuXG4gIHdoaWxlIChjdXJyZW50KSB7XG4gICAgbGV0IG5leHQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuICAgIHBhcmVudC5yZW1vdmVDaGlsZChjdXJyZW50KTtcbiAgICBjdXJyZW50ID0gbmV4dDtcbiAgfVxufVxuIiwiaW1wb3J0IHsgU2ltcGxlTm9kZSB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5cbmV4cG9ydCBjb25zdCBTRVJJQUxJWkFUSU9OX0ZJUlNUX05PREVfU1RSSU5HID0gJyUrYjowJSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NlcmlhbGl6YXRpb25GaXJzdE5vZGUobm9kZTogU2ltcGxlTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5ub2RlVmFsdWUgPT09IFNFUklBTElaQVRJT05fRklSU1RfTk9ERV9TVFJJTkc7XG59XG4iLCJpbXBvcnQgeyBpc0Rlc3Ryb3lhYmxlLCBpc1N0cmluZ0Rlc3Ryb3lhYmxlLCBERVNUUk9ZIH0gZnJvbSAnLi9kZXN0cm95JztcbmltcG9ydCB7XG4gIE9wdGlvbixcbiAgU3ltYm9sRGVzdHJveWFibGUsXG4gIERlc3Ryb3lhYmxlLFxuICBEcm9wLFxuICBEcm9wU3ltYm9sLFxuICBDaGlsZHJlblN5bWJvbCxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBMaW5rZWRMaXN0LCBMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4vbGlzdC11dGlscyc7XG5pbXBvcnQgeyBERVZNT0RFIH0gZnJvbSAnQGdsaW1tZXIvbG9jYWwtZGVidWctZmxhZ3MnO1xuXG5leHBvcnQgY29uc3QgTElOS0VEOiBXZWFrTWFwPG9iamVjdCwgU2V0PERyb3A+PiA9IG5ldyBXZWFrTWFwKCk7XG5leHBvcnQgY29uc3QgRFJPUDogRHJvcFN5bWJvbCA9ICdEUk9QIFs5NGQ0NmNmMy0zOTc0LTQzNWQtYjI3OC0zZTYwZDExNTUyOTBdJztcbmV4cG9ydCBjb25zdCBDSElMRFJFTjogQ2hpbGRyZW5TeW1ib2wgPSAnQ0hJTERSRU4gWzcxNDJlNTJhLTg2MDAtNGUwMS1hNzczLTQyMDU1Yjk2NjMwZF0nO1xuZXhwb3J0IGNvbnN0IERFU1RSVUNUT1JTID0gbmV3IFdlYWtNYXAoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHJvcCh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIERyb3Age1xuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gRFJPUCBpbiAodmFsdWUgYXMgb2JqZWN0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc29jaWF0ZShwYXJlbnQ6IG9iamVjdCwgY2hpbGQ6IG9iamVjdCkge1xuICBhc3NvY2lhdGVEZXN0cnVjdG9yKHBhcmVudCwgZGVzdHJ1Y3RvcihjaGlsZCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzb2NpYXRlRGVzdHJ1Y3RvcihwYXJlbnQ6IG9iamVjdCwgY2hpbGQ6IERyb3ApOiB2b2lkIHtcbiAgbGV0IGFzc29jaWF0ZWQgPSBMSU5LRUQuZ2V0KHBhcmVudCk7XG5cbiAgaWYgKCFhc3NvY2lhdGVkKSB7XG4gICAgYXNzb2NpYXRlZCA9IG5ldyBTZXQoKTtcbiAgICBMSU5LRUQuc2V0KHBhcmVudCwgYXNzb2NpYXRlZCk7XG4gIH1cblxuICBhc3NvY2lhdGVkLmFkZChjaGlsZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWtlQXNzb2NpYXRlZChwYXJlbnQ6IG9iamVjdCk6IE9wdGlvbjxTZXQ8RHJvcD4+IHtcbiAgbGV0IGxpbmtlZCA9IExJTktFRC5nZXQocGFyZW50KTtcblxuICBpZiAobGlua2VkICYmIGxpbmtlZC5zaXplID4gMCkge1xuICAgIExJTktFRC5kZWxldGUocGFyZW50KTtcbiAgICByZXR1cm4gbGlua2VkO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXN0cm95QXNzb2NpYXRlZChwYXJlbnQ6IG9iamVjdCkge1xuICBsZXQgYXNzb2NpYXRlZCA9IExJTktFRC5nZXQocGFyZW50KTtcblxuICBpZiAoYXNzb2NpYXRlZCkge1xuICAgIGFzc29jaWF0ZWQuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGl0ZW1bRFJPUF0oKTtcbiAgICAgIGFzc29jaWF0ZWQhLmRlbGV0ZShpdGVtKTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzdHJ1Y3Rvcih2YWx1ZTogb2JqZWN0KTogRHJvcCB7XG4gIGxldCBkID0gREVTVFJVQ1RPUlMuZ2V0KHZhbHVlKTtcblxuICBpZiAoIWQpIHtcbiAgICBpZiAoaXNEZXN0cm95YWJsZSh2YWx1ZSkpIHtcbiAgICAgIGQgPSBuZXcgRGVzdHJveWFibGVEZXN0cnVjdG9yKHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKGlzU3RyaW5nRGVzdHJveWFibGUodmFsdWUpKSB7XG4gICAgICBkID0gbmV3IFN0cmluZ0Rlc3Ryb3lhYmxlRGVzdHJ1Y3Rvcih2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGQgPSBuZXcgU2ltcGxlRGVzdHJ1Y3Rvcih2YWx1ZSk7XG4gICAgfVxuXG4gICAgREVTVFJVQ1RPUlMuc2V0KHZhbHVlLCBkKTtcbiAgfVxuXG4gIHJldHVybiBkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc25hcHNob3QodmFsdWVzOiBTZXQ8RHJvcD4pOiBEcm9wIHtcbiAgcmV0dXJuIG5ldyBTbmFwc2hvdERlc3RydWN0b3IodmFsdWVzKTtcbn1cblxuY2xhc3MgU25hcHNob3REZXN0cnVjdG9yIGltcGxlbWVudHMgRHJvcCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVzdHJ1Y3RvcnM6IFNldDxEcm9wPikge31cblxuICBbRFJPUF0oKSB7XG4gICAgdGhpcy5kZXN0cnVjdG9ycy5mb3JFYWNoKGl0ZW0gPT4gaXRlbVtEUk9QXSgpKTtcbiAgfVxuXG4gIGdldCBbQ0hJTERSRU5dKCk6IEl0ZXJhYmxlPERyb3A+IHtcbiAgICByZXR1cm4gdGhpcy5kZXN0cnVjdG9ycztcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiAnU25hcHNob3REZXN0cnVjdG9yJztcbiAgfVxufVxuXG5jbGFzcyBEZXN0cm95YWJsZURlc3RydWN0b3IgaW1wbGVtZW50cyBEcm9wIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogU3ltYm9sRGVzdHJveWFibGUpIHt9XG5cbiAgW0RST1BdKCkge1xuICAgIHRoaXMuaW5uZXJbREVTVFJPWV0oKTtcbiAgICBkZXN0cm95QXNzb2NpYXRlZCh0aGlzLmlubmVyKTtcbiAgfVxuXG4gIGdldCBbQ0hJTERSRU5dKCk6IEl0ZXJhYmxlPERyb3A+IHtcbiAgICByZXR1cm4gTElOS0VELmdldCh0aGlzLmlubmVyKSB8fCBbXTtcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiAnRGVzdHJveWFibGVEZXN0cnVjdG9yJztcbiAgfVxufVxuXG5jbGFzcyBTdHJpbmdEZXN0cm95YWJsZURlc3RydWN0b3IgaW1wbGVtZW50cyBEcm9wIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogRGVzdHJveWFibGUpIHt9XG5cbiAgW0RST1BdKCkge1xuICAgIHRoaXMuaW5uZXIuZGVzdHJveSgpO1xuICAgIGRlc3Ryb3lBc3NvY2lhdGVkKHRoaXMuaW5uZXIpO1xuICB9XG5cbiAgZ2V0IFtDSElMRFJFTl0oKTogSXRlcmFibGU8RHJvcD4ge1xuICAgIHJldHVybiBMSU5LRUQuZ2V0KHRoaXMuaW5uZXIpIHx8IFtdO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICdTdHJpbmdEZXN0cm95YWJsZURlc3RydWN0b3InO1xuICB9XG59XG5cbmNsYXNzIFNpbXBsZURlc3RydWN0b3IgaW1wbGVtZW50cyBEcm9wIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogb2JqZWN0KSB7fVxuXG4gIFtEUk9QXSgpIHtcbiAgICBkZXN0cm95QXNzb2NpYXRlZCh0aGlzLmlubmVyKTtcbiAgfVxuXG4gIGdldCBbQ0hJTERSRU5dKCk6IEl0ZXJhYmxlPERyb3A+IHtcbiAgICByZXR1cm4gTElOS0VELmdldCh0aGlzLmlubmVyKSB8fCBbXTtcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiAnU2ltcGxlRGVzdHJ1Y3Rvcic7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExpc3RDb250ZW50c0Rlc3RydWN0b3IgaW1wbGVtZW50cyBEcm9wIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogTGlua2VkTGlzdDxMaW5rZWRMaXN0Tm9kZT4pIHt9XG5cbiAgW0RST1BdKCkge1xuICAgIHRoaXMuaW5uZXIuZm9yRWFjaE5vZGUoZCA9PiBkZXN0cnVjdG9yKGQpW0RST1BdKCkpO1xuICB9XG5cbiAgZ2V0IFtDSElMRFJFTl0oKTogSXRlcmFibGU8RHJvcD4ge1xuICAgIGxldCBvdXQ6IERyb3BbXSA9IFtdO1xuICAgIHRoaXMuaW5uZXIuZm9yRWFjaE5vZGUoZCA9PiBvdXQucHVzaCguLi5kZXN0cnVjdG9yKGQpW0NISUxEUkVOXSkpO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gJ0xpc3RDb250ZW50c0Rlc3RydWN0b3InO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVidWdOb2RlIHtcbiAgaW5uZXI6IG9iamVjdDtcbiAgY2hpbGRyZW46IERlYnVnTm9kZVtdIHwgbnVsbDtcbiAgaGFzRHJvcDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnRHJvcFRyZWUoaW5uZXI6IG9iamVjdCk6IERlYnVnTm9kZSB7XG4gIGxldCBoYXNEcm9wID0gaXNEcm9wKGlubmVyKTtcbiAgbGV0IHJhd0NoaWxkcmVuID0gTElOS0VELmdldChpbm5lcikgfHwgbnVsbDtcbiAgbGV0IGNoaWxkcmVuOiBEZWJ1Z05vZGVbXSB8IG51bGwgPSBudWxsO1xuXG4gIGlmIChyYXdDaGlsZHJlbikge1xuICAgIGNoaWxkcmVuID0gW107XG4gICAgZm9yIChsZXQgY2hpbGQgb2YgcmF3Q2hpbGRyZW4pIHtcbiAgICAgIGNoaWxkcmVuLnB1c2goZGVidWdEcm9wVHJlZShjaGlsZCkpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBvYmogPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBvYmouaW5uZXIgPSBpbm5lcjtcbiAgaWYgKGNoaWxkcmVuKSB7XG4gICAgb2JqLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gIH1cbiAgb2JqLmhhc0Ryb3AgPSBoYXNEcm9wO1xuICByZXR1cm4gb2JqO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJpbnREcm9wVHJlZShpbm5lcjogb2JqZWN0KSB7XG4gIHByaW50RHJvcChkZXN0cnVjdG9yKGlubmVyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmludERyb3AoaW5uZXI6IERyb3ApIHtcbiAgY29uc29sZS5ncm91cChTdHJpbmcoaW5uZXIpKTtcblxuICBjb25zb2xlLmxvZyhpbm5lcik7XG5cbiAgbGV0IGNoaWxkcmVuID0gaW5uZXJbQ0hJTERSRU5dIHx8IG51bGw7XG4gIGlmIChjaGlsZHJlbikge1xuICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICBwcmludERyb3AoY2hpbGQpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbn1cblxuaWYgKERFVk1PREUgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgKHdpbmRvdyBhcyBhbnkpLlBSSU5UX0RST1AgPSBwcmludERyb3BUcmVlO1xufVxuIiwiaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnLi9wbGF0Zm9ybS11dGlscyc7XG5pbXBvcnQgeyBEUk9QLCBkZXN0cnVjdG9yLCBDSElMRFJFTiB9IGZyb20gJy4vbGlmZXRpbWVzJztcbmltcG9ydCB7IERyb3AgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGludGVyZmFjZSBMaW5rZWRMaXN0Tm9kZSB7XG4gIG5leHQ6IE9wdGlvbjxMaW5rZWRMaXN0Tm9kZT47XG4gIHByZXY6IE9wdGlvbjxMaW5rZWRMaXN0Tm9kZT47XG59XG5cbmV4cG9ydCBjbGFzcyBMaXN0Tm9kZTxUPiBpbXBsZW1lbnRzIExpbmtlZExpc3ROb2RlIHtcbiAgcHVibGljIG5leHQ6IE9wdGlvbjxMaXN0Tm9kZTxUPj4gPSBudWxsO1xuICBwdWJsaWMgcHJldjogT3B0aW9uPExpc3ROb2RlPFQ+PiA9IG51bGw7XG4gIHB1YmxpYyB2YWx1ZTogVDtcblxuICBjb25zdHJ1Y3Rvcih2YWx1ZTogVCkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxufVxuXG4vLyB3ZSBhcmUgdW5hYmxlIHRvIGV4cHJlc3MgdGhlIGNvbnN0cmFpbnQgdGhhdCBUJ3MgLnByZXYgYW5kIC5uZXh0IGFyZVxuLy8gdGhlbXNlbHZlcyBULiBIb3dldmVyLCBpdCB3aWxsIGFsd2F5cyBiZSB0cnVlLCBzbyB0cnVzdCB1cy5cbnR5cGUgdHJ1c3QgPSBhbnk7XG5cbmV4cG9ydCBjbGFzcyBMaW5rZWRMaXN0PFQgZXh0ZW5kcyBMaW5rZWRMaXN0Tm9kZT4gaW1wbGVtZW50cyBTbGljZTxUPiwgRHJvcCB7XG4gIHByaXZhdGUgX2hlYWQhOiBPcHRpb248VD47XG4gIHByaXZhdGUgX3RhaWwhOiBPcHRpb248VD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jbGVhcigpO1xuICB9XG5cbiAgaGVhZCgpOiBPcHRpb248VD4ge1xuICAgIHJldHVybiB0aGlzLl9oZWFkO1xuICB9XG5cbiAgdGFpbCgpOiBPcHRpb248VD4ge1xuICAgIHJldHVybiB0aGlzLl90YWlsO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5faGVhZCA9IHRoaXMuX3RhaWwgPSBudWxsO1xuICB9XG5cbiAgdG9BcnJheSgpOiBUW10ge1xuICAgIGxldCBvdXQ6IFRbXSA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaE5vZGUobiA9PiBvdXQucHVzaChuKSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIG5leHROb2RlKG5vZGU6IFQpOiBUIHtcbiAgICByZXR1cm4gbm9kZS5uZXh0IGFzIHRydXN0O1xuICB9XG5cbiAgZm9yRWFjaE5vZGUoY2FsbGJhY2s6IChub2RlOiBUKSA9PiB2b2lkKSB7XG4gICAgbGV0IG5vZGUgPSB0aGlzLl9oZWFkO1xuXG4gICAgd2hpbGUgKG5vZGUgIT09IG51bGwpIHtcbiAgICAgIGNhbGxiYWNrKG5vZGUgYXMgdHJ1c3QpO1xuICAgICAgbm9kZSA9IG5vZGUubmV4dCBhcyB0cnVzdDtcbiAgICB9XG4gIH1cblxuICBpbnNlcnRCZWZvcmUobm9kZTogVCwgcmVmZXJlbmNlOiBPcHRpb248VD4gPSBudWxsKTogVCB7XG4gICAgaWYgKHJlZmVyZW5jZSA9PT0gbnVsbCkgcmV0dXJuIHRoaXMuYXBwZW5kKG5vZGUpO1xuXG4gICAgaWYgKHJlZmVyZW5jZS5wcmV2KSByZWZlcmVuY2UucHJldi5uZXh0ID0gbm9kZTtcbiAgICBlbHNlIHRoaXMuX2hlYWQgPSBub2RlO1xuXG4gICAgbm9kZS5wcmV2ID0gcmVmZXJlbmNlLnByZXY7XG4gICAgbm9kZS5uZXh0ID0gcmVmZXJlbmNlO1xuICAgIHJlZmVyZW5jZS5wcmV2ID0gbm9kZTtcblxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgYXBwZW5kKG5vZGU6IFQpOiBUIHtcbiAgICBsZXQgdGFpbCA9IHRoaXMuX3RhaWw7XG5cbiAgICBpZiAodGFpbCkge1xuICAgICAgdGFpbC5uZXh0ID0gbm9kZTtcbiAgICAgIG5vZGUucHJldiA9IHRhaWw7XG4gICAgICBub2RlLm5leHQgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9oZWFkID0gbm9kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHRoaXMuX3RhaWwgPSBub2RlKTtcbiAgfVxuXG4gIHJlbW92ZShub2RlOiBUKTogVCB7XG4gICAgaWYgKG5vZGUucHJldikgbm9kZS5wcmV2Lm5leHQgPSBub2RlLm5leHQ7XG4gICAgZWxzZSB0aGlzLl9oZWFkID0gbm9kZS5uZXh0IGFzIHRydXN0O1xuXG4gICAgaWYgKG5vZGUubmV4dCkgbm9kZS5uZXh0LnByZXYgPSBub2RlLnByZXY7XG4gICAgZWxzZSB0aGlzLl90YWlsID0gbm9kZS5wcmV2IGFzIHRydXN0O1xuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBbRFJPUF0oKSB7XG4gICAgdGhpcy5mb3JFYWNoTm9kZShkID0+IGRlc3RydWN0b3IoZClbRFJPUF0oKSk7XG4gIH1cblxuICBnZXQgW0NISUxEUkVOXSgpOiBJdGVyYWJsZTxEcm9wPiB7XG4gICAgbGV0IG91dDogRHJvcFtdID0gW107XG4gICAgdGhpcy5mb3JFYWNoTm9kZShkID0+IG91dC5wdXNoKC4uLmRlc3RydWN0b3IoZClbQ0hJTERSRU5dKSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNsaWNlPFQgZXh0ZW5kcyBMaW5rZWRMaXN0Tm9kZT4ge1xuICBoZWFkKCk6IE9wdGlvbjxUPjtcbiAgdGFpbCgpOiBPcHRpb248VD47XG4gIG5leHROb2RlKG5vZGU6IFQpOiBPcHRpb248VD47XG4gIGZvckVhY2hOb2RlKGNhbGxiYWNrOiAobm9kZTogVCkgPT4gdm9pZCk6IHZvaWQ7XG4gIHRvQXJyYXkoKTogVFtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENsb25lYWJsZUxpc3ROb2RlIGV4dGVuZHMgTGlua2VkTGlzdE5vZGUge1xuICBjbG9uZSgpOiB0aGlzO1xufVxuXG5leHBvcnQgY2xhc3MgTGlzdFNsaWNlPFQgZXh0ZW5kcyBMaW5rZWRMaXN0Tm9kZT4gaW1wbGVtZW50cyBTbGljZTxUPiB7XG4gIHByaXZhdGUgX2hlYWQ6IE9wdGlvbjxUPjtcbiAgcHJpdmF0ZSBfdGFpbDogT3B0aW9uPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKGhlYWQ6IE9wdGlvbjxUPiwgdGFpbDogT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy5faGVhZCA9IGhlYWQ7XG4gICAgdGhpcy5fdGFpbCA9IHRhaWw7XG4gIH1cblxuICBmb3JFYWNoTm9kZShjYWxsYmFjazogKG5vZGU6IFQpID0+IHZvaWQpIHtcbiAgICBsZXQgbm9kZSA9IHRoaXMuX2hlYWQ7XG5cbiAgICB3aGlsZSAobm9kZSAhPT0gbnVsbCkge1xuICAgICAgY2FsbGJhY2sobm9kZSk7XG4gICAgICBub2RlID0gdGhpcy5uZXh0Tm9kZShub2RlKTtcbiAgICB9XG4gIH1cblxuICBoZWFkKCk6IE9wdGlvbjxUPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYWQ7XG4gIH1cblxuICB0YWlsKCk6IE9wdGlvbjxUPiB7XG4gICAgcmV0dXJuIHRoaXMuX3RhaWw7XG4gIH1cblxuICB0b0FycmF5KCk6IFRbXSB7XG4gICAgbGV0IG91dDogVFtdID0gW107XG4gICAgdGhpcy5mb3JFYWNoTm9kZShuID0+IG91dC5wdXNoKG4pKTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgbmV4dE5vZGUobm9kZTogVCk6IE9wdGlvbjxUPiB7XG4gICAgaWYgKG5vZGUgPT09IHRoaXMuX3RhaWwpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBub2RlLm5leHQgYXMgVDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgRU1QVFlfU0xJQ0UgPSBuZXcgTGlzdFNsaWNlKG51bGwsIG51bGwpO1xuIiwiY29uc3QgeyBrZXlzOiBvYmpLZXlzIH0gPSBPYmplY3Q7XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ248VCwgVT4ob2JqOiBULCBhc3NpZ25tZW50czogVSk6IFQgJiBVO1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnbjxULCBVLCBWPihvYmo6IFQsIGE6IFUsIGI6IFYpOiBUICYgVSAmIFY7XG5leHBvcnQgZnVuY3Rpb24gYXNzaWduPFQsIFUsIFYsIFc+KG9iajogVCwgYTogVSwgYjogViwgYzogVyk6IFQgJiBVICYgViAmIFc7XG5leHBvcnQgZnVuY3Rpb24gYXNzaWduPFQsIFUsIFYsIFcsIFg+KG9iajogVCwgYTogVSwgYjogViwgYzogVywgZDogWCk6IFQgJiBVICYgViAmIFcgJiBYO1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnbjxULCBVLCBWLCBXLCBYLCBZPihcbiAgb2JqOiBULFxuICBhOiBVLFxuICBiOiBWLFxuICBjOiBXLFxuICBkOiBYLFxuICBlOiBZXG4pOiBUICYgVSAmIFYgJiBXICYgWCAmIFk7XG5leHBvcnQgZnVuY3Rpb24gYXNzaWduPFQsIFUsIFYsIFcsIFgsIFksIFo+KFxuICBvYmo6IFQsXG4gIGE6IFUsXG4gIGI6IFYsXG4gIGM6IFcsXG4gIGQ6IFgsXG4gIGU6IFksXG4gIGY6IFpcbik6IFQgJiBVICYgViAmIFcgJiBYICYgWSAmIFo7XG5leHBvcnQgZnVuY3Rpb24gYXNzaWduKHRhcmdldDogYW55LCAuLi5hcmdzOiBhbnlbXSk6IGFueTtcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ24ob2JqOiBhbnkpIHtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgYXNzaWdubWVudCA9IGFyZ3VtZW50c1tpXTtcbiAgICBpZiAoYXNzaWdubWVudCA9PT0gbnVsbCB8fCB0eXBlb2YgYXNzaWdubWVudCAhPT0gJ29iamVjdCcpIGNvbnRpbnVlO1xuICAgIGxldCBrZXlzID0gb2JqS2V5cyhhc3NpZ25tZW50KTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGxldCBrZXkgPSBrZXlzW2pdO1xuICAgICAgb2JqW2tleV0gPSBhc3NpZ25tZW50W2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWxsTnVsbHM8VD4oY291bnQ6IG51bWJlcik6IFRbXSB7XG4gIGxldCBhcnIgPSBuZXcgQXJyYXkoY291bnQpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIGFycltpXSA9IG51bGw7XG4gIH1cblxuICByZXR1cm4gYXJyO1xufVxuIiwiZXhwb3J0IHR5cGUgT3B0aW9uPFQ+ID0gVCB8IG51bGw7XG5leHBvcnQgdHlwZSBNYXliZTxUPiA9IE9wdGlvbjxUPiB8IHVuZGVmaW5lZCB8IHZvaWQ7XG5cbmV4cG9ydCB0eXBlIEZhY3Rvcnk8VD4gPSBuZXcgKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gVDtcblxuZXhwb3J0IGZ1bmN0aW9uIGtleXM8VD4ob2JqOiBUKTogQXJyYXk8a2V5b2YgVD4ge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqKSBhcyBBcnJheTxrZXlvZiBUPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcDxUPih2YWw6IE1heWJlPFQ+KTogVCB7XG4gIGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgdmFsdWUgdG8gYmUgcHJlc2VudGApO1xuICByZXR1cm4gdmFsIGFzIFQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHBlY3Q8VD4odmFsOiBNYXliZTxUPiwgbWVzc2FnZTogc3RyaW5nKTogVCB7XG4gIGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIHZhbCBhcyBUO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5yZWFjaGFibGUobWVzc2FnZSA9ICd1bnJlYWNoYWJsZScpOiBFcnJvciB7XG4gIHJldHVybiBuZXcgRXJyb3IobWVzc2FnZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGhhdXN0ZWQodmFsdWU6IG5ldmVyKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IoYEV4aGF1c3RlZCAke3ZhbHVlfWApO1xufVxuXG5leHBvcnQgdHlwZSBMaXQgPSBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCB8IHZvaWQgfCB7fTtcblxuZXhwb3J0IGNvbnN0IHR1cGxlID0gPFQgZXh0ZW5kcyBMaXRbXT4oLi4uYXJnczogVCkgPT4gYXJncztcbiIsImV4cG9ydCBmdW5jdGlvbiBzdHJpcChzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4uYXJnczogdW5rbm93bltdKSB7XG4gIGxldCBvdXQgPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHN0cmluZyA9IHN0cmluZ3NbaV07XG4gICAgbGV0IGR5bmFtaWMgPSBhcmdzW2ldICE9PSB1bmRlZmluZWQgPyBTdHJpbmcoYXJnc1tpXSkgOiAnJztcblxuICAgIG91dCArPSBgJHtzdHJpbmd9JHtkeW5hbWljfWA7XG4gIH1cblxuICBsZXQgbGluZXMgPSBvdXQuc3BsaXQoJ1xcbicpO1xuXG4gIHdoaWxlIChsaW5lcy5sZW5ndGggJiYgbGluZXNbMF0ubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgbGluZXMuc2hpZnQoKTtcbiAgfVxuXG4gIHdoaWxlIChsaW5lcy5sZW5ndGggJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgbGluZXMucG9wKCk7XG4gIH1cblxuICBsZXQgbWluID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgZm9yIChsZXQgbGluZSBvZiBsaW5lcykge1xuICAgIGxldCBsZWFkaW5nID0gbGluZS5tYXRjaCgvXlxccyovKSFbMF0ubGVuZ3RoO1xuXG4gICAgbWluID0gTWF0aC5taW4obWluLCBsZWFkaW5nKTtcbiAgfVxuXG4gIGxldCBzdHJpcHBlZCA9IFtdO1xuXG4gIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBzdHJpcHBlZC5wdXNoKGxpbmUuc2xpY2UobWluKSk7XG4gIH1cblxuICByZXR1cm4gc3RyaXBwZWQuam9pbignXFxuJyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7UUFBYSxjQUFxQixPQUFBLE1BQUEsQ0FBM0IsRUFBMkIsQ0FBM0I7OztJQ0VQO0FBRUEsSUFBTSxTQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxFQUE0QztJQUNoRDtJQUNBO0lBQ0E7SUFDQTtJQUVBLFFBQUksQ0FBSixJQUFBLEVBQVc7SUFDVCxjQUFNLElBQUEsS0FBQSxDQUFVLE9BQWhCLG1CQUFNLENBQU47SUFDRDtJQUNGO0FBRUQsSUFFTSxTQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQWdDO0lBQ3BDLFlBQUEsSUFBQSxtQkFBQSxJQUFBO0lBQ0Q7O0lDbkJELElBQUksT0FBSixDQUFBO0FBTUEsSUFBTSxTQUFBLGNBQUEsQ0FBQSxNQUFBLEVBQXdDO0lBQzVDLFdBQVEsT0FBQSxLQUFBLEdBQWUsRUFBdkIsSUFBQTtJQUNEO0FBRUQsSUFBTSxTQUFBLFVBQUEsQ0FBQSxNQUFBLEVBQW9DO0lBQ3hDLFdBQU8sT0FBQSxLQUFBLElBQWdCLGVBQXZCLE1BQXVCLENBQXZCO0lBQ0Q7Ozs7O0lDSEssU0FBQSxJQUFBLEdBQWM7SUFDbEIsV0FBTyxPQUFBLE1BQUEsQ0FBUCxJQUFPLENBQVA7SUFDRDtBQUVELElBQU0sU0FBQSxNQUFBLENBQUEsQ0FBQSxFQUF3QjtJQUM1QixXQUFPLE1BQUEsSUFBQSxJQUFjLE1BQXJCLFNBQUE7SUFDRDtBQUVELElBQU0sU0FBQSxRQUFBLENBQUEsQ0FBQSxFQUEwQjtJQUM5QixXQUFPLE9BQUEsQ0FBQSxLQUFBLFFBQUEsSUFBeUIsTUFBaEMsSUFBQTtJQUNEO0FBSUQsUUFBTSxPQUFOO0lBR0UsdUJBQUE7SUFBQTs7SUFDRSxhQUFBLElBQUEsR0FBQSxNQUFBO0lBQ0Q7O0lBTEgsc0JBT0UsR0FQRixnQkFPRSxHQVBGLEVBT1k7SUFDUixZQUFJLE9BQUEsR0FBQSxLQUFKLFFBQUEsRUFBNkIsS0FBQSxJQUFBLENBQUEsR0FBQSxJQUE3QixHQUE2QixDQUE3QixLQUNLLEtBQUEsSUFBQSxDQUFVLFdBQVYsR0FBVSxDQUFWLElBQUEsR0FBQTtJQUNMLGVBQUEsSUFBQTtJQUNELEtBWEg7O0lBQUEsc0JBYUUsTUFiRixvQkFhRSxHQWJGLEVBYWU7SUFDWCxZQUFJLE9BQUEsR0FBQSxLQUFKLFFBQUEsRUFBNkIsT0FBTyxLQUFBLElBQUEsQ0FBcEMsR0FBb0MsQ0FBUCxDQUE3QixLQUNLLElBQUssSUFBTCxLQUFBLEVBQXdCLE9BQU8sS0FBQSxJQUFBLENBQVcsSUFBbEIsS0FBTyxDQUFQO0lBQzlCLEtBaEJIOztJQUFBO0lBQUE7QUFtQkEsUUFBTSxTQUFOO0lBQUEseUJBQUE7SUFBQTs7SUFDVSxhQUFBLEtBQUEsR0FBQSxFQUFBO0lBQ0QsYUFBQSxPQUFBLEdBQUEsSUFBQTtJQStCUjs7SUFqQ0Qsd0JBUUUsSUFSRixpQkFRRSxJQVJGLEVBUWM7SUFDVixhQUFBLE9BQUEsR0FBQSxJQUFBO0lBQ0EsYUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLElBQUE7SUFDRCxLQVhIOztJQUFBLHdCQWFFLEdBYkYsa0JBYUs7SUFDRCxZQUFJLE9BQU8sS0FBQSxLQUFBLENBQVgsR0FBVyxFQUFYO0lBQ0EsWUFBSSxNQUFNLEtBQUEsS0FBQSxDQUFWLE1BQUE7SUFDQSxhQUFBLE9BQUEsR0FBZSxRQUFBLENBQUEsR0FBQSxJQUFBLEdBQW1CLEtBQUEsS0FBQSxDQUFXLE1BQTdDLENBQWtDLENBQWxDO0lBRUEsZUFBTyxTQUFBLFNBQUEsR0FBQSxJQUFBLEdBQVAsSUFBQTtJQUNELEtBbkJIOztJQUFBLHdCQXFCRSxHQXJCRixnQkFxQkUsSUFyQkYsRUFxQmtCO0lBQ2QsWUFBSSxNQUFNLEtBQUEsS0FBQSxDQUFWLE1BQUE7SUFDQSxlQUFPLE1BQUEsSUFBQSxHQUFBLElBQUEsR0FBb0IsS0FBQSxLQUFBLENBQVcsTUFBdEMsSUFBMkIsQ0FBM0I7SUFDRCxLQXhCSDs7SUFBQSx3QkEwQkUsT0ExQkYsc0JBMEJTO0lBQ0wsZUFBTyxLQUFBLEtBQUEsQ0FBQSxNQUFBLEtBQVAsQ0FBQTtJQUNELEtBNUJIOztJQUFBLHdCQThCRSxPQTlCRixzQkE4QlM7SUFDTCxlQUFPLEtBQVAsS0FBQTtJQUNELEtBaENIOztJQUFBO0lBQUE7SUFBQSw0QkFJaUI7SUFDYixtQkFBTyxLQUFBLEtBQUEsQ0FBUCxNQUFBO0lBQ0Q7SUFOSDs7SUFBQTtJQUFBOztRQ3hDYSxVQUFOLGdEQUFBO0FBRVAsSUFBTSxTQUFBLGFBQUEsQ0FBQSxLQUFBLEVBQTBDO0lBQzlDLFdBQU8sQ0FBQyxFQUFFLFNBQVMsV0FBbkIsS0FBUSxDQUFSO0lBQ0Q7QUFFRCxJQUFNLFNBQUEsbUJBQUEsQ0FBQSxLQUFBLEVBQWdFO0lBQ3BFLFdBQU8sQ0FBQyxFQUFFLFNBQVMsT0FBQSxLQUFBLEtBQVQsUUFBQSxJQUFzQyxPQUFPLE1BQVAsT0FBQSxLQUFoRCxVQUFRLENBQVI7SUFDRDs7SUNQSyxTQUFBLFlBQUEsQ0FBQSxNQUFBLEVBQTRDO0lBQ2hELFFBQUksVUFBOEIsT0FBbEMsVUFBQTtJQUVBLFdBQUEsT0FBQSxFQUFnQjtJQUNkLFlBQUksT0FBTyxRQUFYLFdBQUE7SUFDQSxlQUFBLFdBQUEsQ0FBQSxPQUFBO0lBQ0Esa0JBQUEsSUFBQTtJQUNEO0lBQ0Y7O1FDVFksa0NBQU4sUUFBQTtBQUVQLElBQU0sU0FBQSx3QkFBQSxDQUFBLElBQUEsRUFBbUQ7SUFDdkQsV0FBTyxLQUFBLFNBQUEsS0FBUCwrQkFBQTtJQUNEOzs7Ozs7QUNNRCxRQUFhLFNBQXFDLElBQTNDLE9BQTJDLEVBQTNDO0FBQ1AsUUFBYSxPQUFOLDZDQUFBO0FBQ1AsUUFBYSxXQUFOLGlEQUFBO0FBQ1AsUUFBYSxjQUFjLElBQXBCLE9BQW9CLEVBQXBCO0FBRVAsSUFBTSxTQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQStCO0lBQ25DLFFBQUksVUFBQSxJQUFBLElBQWtCLE9BQUEsS0FBQSxLQUF0QixRQUFBLEVBQWlELE9BQUEsS0FBQTtJQUNqRCxXQUFPLFFBQVAsS0FBQTtJQUNEO0FBRUQsSUFBTSxTQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsS0FBQSxFQUFpRDtJQUNyRCx3QkFBQSxNQUFBLEVBQTRCLFdBQTVCLEtBQTRCLENBQTVCO0lBQ0Q7QUFFRCxJQUFNLFNBQUEsbUJBQUEsQ0FBQSxNQUFBLEVBQUEsS0FBQSxFQUF5RDtJQUM3RCxRQUFJLGFBQWEsT0FBQSxHQUFBLENBQWpCLE1BQWlCLENBQWpCO0lBRUEsUUFBSSxDQUFKLFVBQUEsRUFBaUI7SUFDZixxQkFBYSxJQUFiLEdBQWEsRUFBYjtJQUNBLGVBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxVQUFBO0lBQ0Q7SUFFRCxlQUFBLEdBQUEsQ0FBQSxLQUFBO0lBQ0Q7QUFFRCxJQUFNLFNBQUEsY0FBQSxDQUFBLE1BQUEsRUFBdUM7SUFDM0MsUUFBSSxTQUFTLE9BQUEsR0FBQSxDQUFiLE1BQWEsQ0FBYjtJQUVBLFFBQUksVUFBVSxPQUFBLElBQUEsR0FBZCxDQUFBLEVBQStCO0lBQzdCLGVBQUEsTUFBQSxDQUFBLE1BQUE7SUFDQSxlQUFBLE1BQUE7SUFGRixLQUFBLE1BR087SUFDTCxlQUFBLElBQUE7SUFDRDtJQUNGO0FBRUQsSUFBTSxTQUFBLGlCQUFBLENBQUEsTUFBQSxFQUEwQztJQUM5QyxRQUFJLGFBQWEsT0FBQSxHQUFBLENBQWpCLE1BQWlCLENBQWpCO0lBRUEsUUFBQSxVQUFBLEVBQWdCO0lBQ2QsbUJBQUEsT0FBQSxDQUFtQixnQkFBTztJQUN4QixpQkFBQSxJQUFBO0lBQ0EsdUJBQUEsTUFBQSxDQUFBLElBQUE7SUFGRixTQUFBO0lBSUQ7SUFDRjtBQUVELElBQU0sU0FBQSxVQUFBLENBQUEsS0FBQSxFQUFrQztJQUN0QyxRQUFJLElBQUksWUFBQSxHQUFBLENBQVIsS0FBUSxDQUFSO0lBRUEsUUFBSSxDQUFKLENBQUEsRUFBUTtJQUNOLFlBQUksY0FBSixLQUFJLENBQUosRUFBMEI7SUFDeEIsZ0JBQUksSUFBQSxxQkFBQSxDQUFKLEtBQUksQ0FBSjtJQURGLFNBQUEsTUFFTyxJQUFJLG9CQUFKLEtBQUksQ0FBSixFQUFnQztJQUNyQyxnQkFBSSxJQUFBLDJCQUFBLENBQUosS0FBSSxDQUFKO0lBREssU0FBQSxNQUVBO0lBQ0wsZ0JBQUksSUFBQSxnQkFBQSxDQUFKLEtBQUksQ0FBSjtJQUNEO0lBRUQsb0JBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0lBQ0Q7SUFFRCxXQUFBLENBQUE7SUFDRDtBQUVELElBQU0sU0FBQSxRQUFBLENBQUEsTUFBQSxFQUFvQztJQUN4QyxXQUFPLElBQUEsa0JBQUEsQ0FBUCxNQUFPLENBQVA7SUFDRDs7UUFFRDtJQUNFLGdDQUFBLFdBQUEsRUFBMEM7SUFBQTs7SUFBdEIsYUFBQSxXQUFBLEdBQUEsV0FBQTtJQUEwQjs7cUNBRTlDLG9CQUFNO0lBQ0osYUFBQSxXQUFBLENBQUEsT0FBQSxDQUF5QjtJQUFBLG1CQUFRLEtBQWpDLElBQWlDLEdBQVI7SUFBQSxTQUF6QjtJQUNEOztxQ0FNRCwrQkFBUTtJQUNOLGVBQUEsb0JBQUE7SUFDRDs7O2lCQU5EO2dDQUFjO0lBQ1osbUJBQU8sS0FBUCxXQUFBO0lBQ0Q7Ozs7OztRQU9IO0lBQ0UsbUNBQUEsS0FBQSxFQUE0QztJQUFBOztJQUF4QixhQUFBLEtBQUEsR0FBQSxLQUFBO0lBQTRCOzt3Q0FFaEQsb0JBQU07SUFDSixhQUFBLEtBQUEsQ0FBQSxPQUFBO0lBQ0EsMEJBQWtCLEtBQWxCLEtBQUE7SUFDRDs7d0NBTUQsK0JBQVE7SUFDTixlQUFBLHVCQUFBO0lBQ0Q7OztpQkFORDtnQ0FBYztJQUNaLG1CQUFPLE9BQUEsR0FBQSxDQUFXLEtBQVgsS0FBQSxLQUFQLEVBQUE7SUFDRDs7Ozs7O1FBT0g7SUFDRSx5Q0FBQSxLQUFBLEVBQXNDO0lBQUE7O0lBQWxCLGFBQUEsS0FBQSxHQUFBLEtBQUE7SUFBc0I7OzhDQUUxQyxvQkFBTTtJQUNKLGFBQUEsS0FBQSxDQUFBLE9BQUE7SUFDQSwwQkFBa0IsS0FBbEIsS0FBQTtJQUNEOzs4Q0FNRCwrQkFBUTtJQUNOLGVBQUEsNkJBQUE7SUFDRDs7O2lCQU5EO2dDQUFjO0lBQ1osbUJBQU8sT0FBQSxHQUFBLENBQVcsS0FBWCxLQUFBLEtBQVAsRUFBQTtJQUNEOzs7Ozs7UUFPSDtJQUNFLDhCQUFBLEtBQUEsRUFBaUM7SUFBQTs7SUFBYixhQUFBLEtBQUEsR0FBQSxLQUFBO0lBQWlCOzttQ0FFckMsb0JBQU07SUFDSiwwQkFBa0IsS0FBbEIsS0FBQTtJQUNEOzttQ0FNRCwrQkFBUTtJQUNOLGVBQUEsa0JBQUE7SUFDRDs7O2lCQU5EO2dDQUFjO0lBQ1osbUJBQU8sT0FBQSxHQUFBLENBQVcsS0FBWCxLQUFBLEtBQVAsRUFBQTtJQUNEOzs7Ozs7QUFPSCxRQUFNLHNCQUFOO0lBQ0Usb0NBQUEsS0FBQSxFQUFxRDtJQUFBOztJQUFqQyxhQUFBLEtBQUEsR0FBQSxLQUFBO0lBQXFDOztJQUQzRCxxQ0FHRSxJQUhGLGdCQUdRO0lBQ0osYUFBQSxLQUFBLENBQUEsV0FBQSxDQUF1QjtJQUFBLG1CQUFLLFdBQUEsQ0FBQSxFQUE1QixJQUE0QixHQUFMO0lBQUEsU0FBdkI7SUFDRCxLQUxIOztJQUFBLHFDQWFFLFFBYkYsdUJBYVU7SUFDTixlQUFBLHdCQUFBO0lBQ0QsS0FmSDs7SUFBQTtJQUFBLGFBT0UsUUFQRjtJQUFBLDRCQU9nQjtJQUNaLGdCQUFJLE1BQUosRUFBQTtJQUNBLGlCQUFBLEtBQUEsQ0FBQSxXQUFBLENBQXVCO0lBQUEsdUJBQUssSUFBQSxJQUFBLFlBQVksV0FBQSxDQUFBLEVBQXhDLFFBQXdDLENBQVosQ0FBTDtJQUFBLGFBQXZCO0lBQ0EsbUJBQUEsR0FBQTtJQUNEO0lBWEg7O0lBQUE7SUFBQTtBQXdCQSxJQUFNLFNBQUEsYUFBQSxDQUFBLEtBQUEsRUFBcUM7SUFDekMsUUFBSSxVQUFVLE9BQWQsS0FBYyxDQUFkO0lBQ0EsUUFBSSxjQUFjLE9BQUEsR0FBQSxDQUFBLEtBQUEsS0FBbEIsSUFBQTtJQUNBLFFBQUksV0FBSixJQUFBO0lBRUEsUUFBQSxXQUFBLEVBQWlCO0lBQ2YsbUJBQUEsRUFBQTtJQUNBLDZCQUFBLFdBQUEsa0hBQStCO0lBQUE7O0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTs7SUFBQSxnQkFBL0IsS0FBK0I7O0lBQzdCLHFCQUFBLElBQUEsQ0FBYyxjQUFkLEtBQWMsQ0FBZDtJQUNEO0lBQ0Y7SUFFRCxRQUFJLE1BQU0sT0FBQSxNQUFBLENBQVYsSUFBVSxDQUFWO0lBQ0EsUUFBQSxLQUFBLEdBQUEsS0FBQTtJQUNBLFFBQUEsUUFBQSxFQUFjO0lBQ1osWUFBQSxRQUFBLEdBQUEsUUFBQTtJQUNEO0lBQ0QsUUFBQSxPQUFBLEdBQUEsT0FBQTtJQUNBLFdBQUEsR0FBQTtJQUNEO0FBRUQsSUFBTSxTQUFBLGFBQUEsQ0FBQSxLQUFBLEVBQXFDO0lBQ3pDLGNBQVUsV0FBVixLQUFVLENBQVY7SUFDRDtBQUVELElBQU0sU0FBQSxTQUFBLENBQUEsS0FBQSxFQUErQjtJQUNuQyxZQUFBLEtBQUEsQ0FBYyxPQUFkLEtBQWMsQ0FBZDtJQUVBLFlBQUEsR0FBQSxDQUFBLEtBQUE7SUFFQSxRQUFJLFdBQVcsTUFBQSxRQUFBLEtBQWYsSUFBQTtJQUNBLFFBQUEsUUFBQSxFQUFjO0lBQ1osOEJBQUEsUUFBQSx5SEFBNEI7SUFBQTs7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBOztJQUFBLGdCQUE1QixLQUE0Qjs7SUFDMUIsc0JBQUEsS0FBQTtJQUNEO0lBQ0Y7SUFFRCxZQUFBLFFBQUE7SUFDRDs7Ozs7UUN4TUssUUFBTixHQUtFLGtCQUFBLEtBQUEsRUFBb0I7SUFBQTs7SUFKYixTQUFBLElBQUEsR0FBQSxJQUFBO0lBQ0EsU0FBQSxJQUFBLEdBQUEsSUFBQTtJQUlMLFNBQUEsS0FBQSxHQUFBLEtBQUE7SUFDRCxDQVBIO0FBY0EsUUFBTSxVQUFOO0lBSUUsMEJBQUE7SUFBQTs7SUFDRSxhQUFBLEtBQUE7SUFDRDs7SUFOSCx5QkFRRSxJQVJGLG1CQVFNO0lBQ0YsZUFBTyxLQUFQLEtBQUE7SUFDRCxLQVZIOztJQUFBLHlCQVlFLElBWkYsbUJBWU07SUFDRixlQUFPLEtBQVAsS0FBQTtJQUNELEtBZEg7O0lBQUEseUJBZ0JFLEtBaEJGLG9CQWdCTztJQUNILGFBQUEsS0FBQSxHQUFhLEtBQUEsS0FBQSxHQUFiLElBQUE7SUFDRCxLQWxCSDs7SUFBQSx5QkFvQkUsT0FwQkYsc0JBb0JTO0lBQ0wsWUFBSSxNQUFKLEVBQUE7SUFDQSxhQUFBLFdBQUEsQ0FBaUI7SUFBQSxtQkFBSyxJQUFBLElBQUEsQ0FBdEIsQ0FBc0IsQ0FBTDtJQUFBLFNBQWpCO0lBQ0EsZUFBQSxHQUFBO0lBQ0QsS0F4Qkg7O0lBQUEseUJBMEJFLFFBMUJGLHFCQTBCRSxJQTFCRixFQTBCa0I7SUFDZCxlQUFPLEtBQVAsSUFBQTtJQUNELEtBNUJIOztJQUFBLHlCQThCRSxXQTlCRix3QkE4QkUsUUE5QkYsRUE4QnlDO0lBQ3JDLFlBQUksT0FBTyxLQUFYLEtBQUE7SUFFQSxlQUFPLFNBQVAsSUFBQSxFQUFzQjtJQUNwQixxQkFBQSxJQUFBO0lBQ0EsbUJBQU8sS0FBUCxJQUFBO0lBQ0Q7SUFDRixLQXJDSDs7SUFBQSx5QkF1Q0UsWUF2Q0YseUJBdUNFLElBdkNGLEVBdUNtRDtJQUFBLFlBQTNCLFNBQTJCLHVFQUFqRCxJQUFpRDs7SUFDL0MsWUFBSSxjQUFKLElBQUEsRUFBd0IsT0FBTyxLQUFBLE1BQUEsQ0FBUCxJQUFPLENBQVA7SUFFeEIsWUFBSSxVQUFKLElBQUEsRUFBb0IsVUFBQSxJQUFBLENBQUEsSUFBQSxHQUFwQixJQUFvQixDQUFwQixLQUNLLEtBQUEsS0FBQSxHQUFBLElBQUE7SUFFTCxhQUFBLElBQUEsR0FBWSxVQUFaLElBQUE7SUFDQSxhQUFBLElBQUEsR0FBQSxTQUFBO0lBQ0Esa0JBQUEsSUFBQSxHQUFBLElBQUE7SUFFQSxlQUFBLElBQUE7SUFDRCxLQWxESDs7SUFBQSx5QkFvREUsTUFwREYsbUJBb0RFLElBcERGLEVBb0RnQjtJQUNaLFlBQUksT0FBTyxLQUFYLEtBQUE7SUFFQSxZQUFBLElBQUEsRUFBVTtJQUNSLGlCQUFBLElBQUEsR0FBQSxJQUFBO0lBQ0EsaUJBQUEsSUFBQSxHQUFBLElBQUE7SUFDQSxpQkFBQSxJQUFBLEdBQUEsSUFBQTtJQUhGLFNBQUEsTUFJTztJQUNMLGlCQUFBLEtBQUEsR0FBQSxJQUFBO0lBQ0Q7SUFFRCxlQUFRLEtBQUEsS0FBQSxHQUFSLElBQUE7SUFDRCxLQWhFSDs7SUFBQSx5QkFrRUUsTUFsRUYsbUJBa0VFLElBbEVGLEVBa0VnQjtJQUNaLFlBQUksS0FBSixJQUFBLEVBQWUsS0FBQSxJQUFBLENBQUEsSUFBQSxHQUFpQixLQUFoQyxJQUFlLENBQWYsS0FDSyxLQUFBLEtBQUEsR0FBYSxLQUFiLElBQUE7SUFFTCxZQUFJLEtBQUosSUFBQSxFQUFlLEtBQUEsSUFBQSxDQUFBLElBQUEsR0FBaUIsS0FBaEMsSUFBZSxDQUFmLEtBQ0ssS0FBQSxLQUFBLEdBQWEsS0FBYixJQUFBO0lBRUwsZUFBQSxJQUFBO0lBQ0QsS0ExRUg7O0lBQUEseUJBNEVFLElBNUVGLGdCQTRFUTtJQUNKLGFBQUEsV0FBQSxDQUFpQjtJQUFBLG1CQUFLLFdBQUEsQ0FBQSxFQUF0QixJQUFzQixHQUFMO0lBQUEsU0FBakI7SUFDRCxLQTlFSDs7SUFBQTtJQUFBLGFBZ0ZFLFFBaEZGO0lBQUEsNEJBZ0ZnQjtJQUNaLGdCQUFJLE1BQUosRUFBQTtJQUNBLGlCQUFBLFdBQUEsQ0FBaUI7SUFBQSx1QkFBSyxJQUFBLElBQUEsWUFBWSxXQUFBLENBQUEsRUFBbEMsUUFBa0MsQ0FBWixDQUFMO0lBQUEsYUFBakI7SUFDQSxtQkFBQSxHQUFBO0lBQ0Q7SUFwRkg7O0lBQUE7SUFBQTtBQW1HQSxRQUFNLFNBQU47SUFJRSx1QkFBQSxJQUFBLEVBQUEsSUFBQSxFQUE0QztJQUFBOztJQUMxQyxhQUFBLEtBQUEsR0FBQSxJQUFBO0lBQ0EsYUFBQSxLQUFBLEdBQUEsSUFBQTtJQUNEOztJQVBILHdCQVNFLFdBVEYsd0JBU0UsUUFURixFQVN5QztJQUNyQyxZQUFJLE9BQU8sS0FBWCxLQUFBO0lBRUEsZUFBTyxTQUFQLElBQUEsRUFBc0I7SUFDcEIscUJBQUEsSUFBQTtJQUNBLG1CQUFPLEtBQUEsUUFBQSxDQUFQLElBQU8sQ0FBUDtJQUNEO0lBQ0YsS0FoQkg7O0lBQUEsd0JBa0JFLElBbEJGLG1CQWtCTTtJQUNGLGVBQU8sS0FBUCxLQUFBO0lBQ0QsS0FwQkg7O0lBQUEsd0JBc0JFLElBdEJGLG1CQXNCTTtJQUNGLGVBQU8sS0FBUCxLQUFBO0lBQ0QsS0F4Qkg7O0lBQUEsd0JBMEJFLE9BMUJGLHNCQTBCUztJQUNMLFlBQUksTUFBSixFQUFBO0lBQ0EsYUFBQSxXQUFBLENBQWlCO0lBQUEsbUJBQUssSUFBQSxJQUFBLENBQXRCLENBQXNCLENBQUw7SUFBQSxTQUFqQjtJQUNBLGVBQUEsR0FBQTtJQUNELEtBOUJIOztJQUFBLHdCQWdDRSxRQWhDRixxQkFnQ0UsSUFoQ0YsRUFnQ2tCO0lBQ2QsWUFBSSxTQUFTLEtBQWIsS0FBQSxFQUF5QixPQUFBLElBQUE7SUFDekIsZUFBTyxLQUFQLElBQUE7SUFDRCxLQW5DSDs7SUFBQTtJQUFBO0FBc0NBLFFBQWEsY0FBYyxJQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQXBCLElBQW9CLENBQXBCOztRQ2hLRCxVQUFOOztBQXdCQSxJQUFNLFNBQUEsTUFBQSxDQUFBLEdBQUEsRUFBeUI7SUFDN0IsU0FBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLFVBQXBCLE1BQUEsRUFBQSxHQUFBLEVBQTJDO0lBQ3pDLFlBQUksYUFBYSxVQUFqQixDQUFpQixDQUFqQjtJQUNBLFlBQUksZUFBQSxJQUFBLElBQXVCLE9BQUEsVUFBQSxLQUEzQixRQUFBLEVBQTJEO0lBQzNELFlBQUksT0FBTyxRQUFYLFVBQVcsQ0FBWDtJQUNBLGFBQUssSUFBSSxJQUFULENBQUEsRUFBZ0IsSUFBSSxLQUFwQixNQUFBLEVBQUEsR0FBQSxFQUFzQztJQUNwQyxnQkFBSSxNQUFNLEtBQVYsQ0FBVSxDQUFWO0lBQ0EsZ0JBQUEsR0FBQSxJQUFXLFdBQVgsR0FBVyxDQUFYO0lBQ0Q7SUFDRjtJQUNELFdBQUEsR0FBQTtJQUNEO0FBRUQsSUFBTSxTQUFBLFNBQUEsQ0FBQSxLQUFBLEVBQW9DO0lBQ3hDLFFBQUksTUFBTSxJQUFBLEtBQUEsQ0FBVixLQUFVLENBQVY7SUFFQSxTQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLElBQWhCLEtBQUEsRUFBQSxHQUFBLEVBQWdDO0lBQzlCLFlBQUEsQ0FBQSxJQUFBLElBQUE7SUFDRDtJQUVELFdBQUEsR0FBQTtJQUNEOztJQ3hDSyxTQUFBLElBQUEsQ0FBQSxHQUFBLEVBQXdCO0lBQzVCLFdBQU8sT0FBQSxJQUFBLENBQVAsR0FBTyxDQUFQO0lBQ0Q7QUFFRCxJQUFNLFNBQUEsTUFBQSxDQUFBLEdBQUEsRUFBaUM7SUFDckMsUUFBSSxRQUFBLElBQUEsSUFBZ0IsUUFBcEIsU0FBQSxFQUF1QyxNQUFNLElBQU4sS0FBTSxnQ0FBTjtJQUN2QyxXQUFBLEdBQUE7SUFDRDtBQUVELElBQU0sU0FBQSxNQUFBLENBQUEsR0FBQSxFQUFBLE9BQUEsRUFBa0Q7SUFDdEQsUUFBSSxRQUFBLElBQUEsSUFBZ0IsUUFBcEIsU0FBQSxFQUF1QyxNQUFNLElBQUEsS0FBQSxDQUFOLE9BQU0sQ0FBTjtJQUN2QyxXQUFBLEdBQUE7SUFDRDtBQUVELElBQU0sU0FBQSxXQUFBLEdBQTZDO0lBQUEsUUFBdkIsT0FBdUIsdUVBQTdDLGFBQTZDOztJQUNqRCxXQUFPLElBQUEsS0FBQSxDQUFQLE9BQU8sQ0FBUDtJQUNEO0FBRUQsSUFBTSxTQUFBLFNBQUEsQ0FBQSxLQUFBLEVBQWdDO0lBQ3BDLFVBQU0sSUFBQSxLQUFBLGdCQUFOLEtBQU0sQ0FBTjtJQUNEO0FBSUQsUUFBYSxRQUFRLFNBQVIsS0FBUTtJQUFBLHNDQUFBLElBQUE7SUFBQSxZQUFBO0lBQUE7O0lBQUEsV0FBZCxJQUFjO0lBQUEsQ0FBZDs7SUM3QkQsU0FBQSxLQUFBLENBQUEsT0FBQSxFQUFpRTtJQUNyRSxRQUFJLE1BQUosRUFBQTs7SUFEcUUsc0NBQWpFLElBQWlFO0lBQWpFLFlBQWlFO0lBQUE7O0lBRXJFLFNBQUssSUFBSSxJQUFULENBQUEsRUFBZ0IsSUFBSSxRQUFwQixNQUFBLEVBQUEsR0FBQSxFQUF5QztJQUN2QyxZQUFJLFNBQVMsUUFBYixDQUFhLENBQWI7SUFDQSxZQUFJLFVBQVUsS0FBQSxDQUFBLE1BQUEsU0FBQSxHQUF3QixPQUFPLEtBQS9CLENBQStCLENBQVAsQ0FBeEIsR0FBZCxFQUFBO0lBRUEsb0JBQVUsTUFBVixHQUFBLE9BQUE7SUFDRDtJQUVELFFBQUksUUFBUSxJQUFBLEtBQUEsQ0FBWixJQUFZLENBQVo7SUFFQSxXQUFPLE1BQUEsTUFBQSxJQUFnQixNQUFBLENBQUEsRUFBQSxLQUFBLENBQXZCLE9BQXVCLENBQXZCLEVBQWdEO0lBQzlDLGNBQUEsS0FBQTtJQUNEO0lBRUQsV0FBTyxNQUFBLE1BQUEsSUFBZ0IsTUFBTSxNQUFBLE1BQUEsR0FBTixDQUFBLEVBQUEsS0FBQSxDQUF2QixPQUF1QixDQUF2QixFQUErRDtJQUM3RCxjQUFBLEdBQUE7SUFDRDtJQUVELFFBQUksTUFBTSxPQUFWLGdCQUFBO0lBRUEseUJBQUEsS0FBQSxrSEFBd0I7SUFBQTs7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBOztJQUFBLFlBQXhCLElBQXdCOztJQUN0QixZQUFJLFVBQVUsS0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBZCxNQUFBO0lBRUEsY0FBTSxLQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQU4sT0FBTSxDQUFOO0lBQ0Q7SUFFRCxRQUFJLFdBQUosRUFBQTtJQUVBLDBCQUFBLEtBQUEseUhBQXdCO0lBQUE7O0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTs7SUFBQSxZQUF4QixLQUF3Qjs7SUFDdEIsaUJBQUEsSUFBQSxDQUFjLE1BQUEsS0FBQSxDQUFkLEdBQWMsQ0FBZDtJQUNEO0lBRUQsV0FBTyxTQUFBLElBQUEsQ0FBUCxJQUFPLENBQVA7SUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==