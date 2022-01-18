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
    function values(obj) {
        var vals = [];
        for (var key in obj) {
            vals.push(obj[key]);
        }
        return vals;
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
        var min = Infinity;
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

    function assertNever(value) {
        var desc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'unexpected unreachable branch';

        console.log('unreachable', value);
        console.trace(desc + ' :: ' + JSON.stringify(value) + ' (' + value + ')');
    }

    exports.assertNever = assertNever;
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
    exports.values = values;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci11dGlsLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9hcnJheS11dGlscy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2Fzc2VydC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2d1aWQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9jb2xsZWN0aW9ucy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2Rlc3Ryb3kudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9kb20udHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9pcy1zZXJpYWxpemF0aW9uLWZpcnN0LW5vZGUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9saWZldGltZXMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9saXN0LXV0aWxzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdXRpbC9saWIvb2JqZWN0LXV0aWxzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdXRpbC9saWIvcGxhdGZvcm0tdXRpbHMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9zdHJpbmcudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBFTVBUWV9BUlJBWTogYW55W10gPSBPYmplY3QuZnJlZXplKFtdKSBhcyBhbnk7XG4iLCIvLyBpbXBvcnQgTG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcblxuLy8gbGV0IGFscmVhZHlXYXJuZWQgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnQXNzZXJ0KHRlc3Q6IGFueSwgbXNnOiBzdHJpbmcpIHtcbiAgLy8gaWYgKCFhbHJlYWR5V2FybmVkKSB7XG4gIC8vICAgYWxyZWFkeVdhcm5lZCA9IHRydWU7XG4gIC8vICAgTG9nZ2VyLndhcm4oXCJEb24ndCBsZWF2ZSBkZWJ1ZyBhc3NlcnRpb25zIG9uIGluIHB1YmxpYyBidWlsZHNcIik7XG4gIC8vIH1cblxuICBpZiAoIXRlc3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IobXNnIHx8ICdhc3NlcnRpb24gZmFpbHVyZScpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9kQXNzZXJ0KCkge31cblxuZXhwb3J0IGZ1bmN0aW9uIGRlcHJlY2F0ZShkZXNjOiBzdHJpbmcpIHtcbiAgY29uc29sZS53YXJuKGBERVBSRUNBVElPTjogJHtkZXNjfWApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWJ1Z0Fzc2VydDtcbiIsImxldCBHVUlEID0gMDtcblxuZXhwb3J0IGludGVyZmFjZSBIYXNHdWlkIHtcbiAgX2d1aWQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVHdWlkKG9iamVjdDogSGFzR3VpZCk6IG51bWJlciB7XG4gIHJldHVybiAob2JqZWN0Ll9ndWlkID0gKytHVUlEKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUd1aWQob2JqZWN0OiBIYXNHdWlkKTogbnVtYmVyIHtcbiAgcmV0dXJuIG9iamVjdC5fZ3VpZCB8fCBpbml0aWFsaXplR3VpZChvYmplY3QpO1xufVxuIiwiaW1wb3J0IHsgSGFzR3VpZCwgZW5zdXJlR3VpZCB9IGZyb20gJy4vZ3VpZCc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICcuL3BsYXRmb3JtLXV0aWxzJztcbmltcG9ydCB7IERpY3QsIFN0YWNrIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2V0PFQ+IHtcbiAgYWRkKHZhbHVlOiBUKTogU2V0PFQ+O1xuICBkZWxldGUodmFsdWU6IFQpOiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGljdDxUID0gdW5rbm93bj4oKTogRGljdDxUPiB7XG4gIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEaWN0PFQ+KHU6IFQpOiB1IGlzIERpY3QgJiBUIHtcbiAgcmV0dXJuIHUgIT09IG51bGwgJiYgdSAhPT0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3Q8VD4odTogVCk6IHUgaXMgb2JqZWN0ICYgVCB7XG4gIHJldHVybiB0eXBlb2YgdSA9PT0gJ29iamVjdCcgJiYgdSAhPT0gbnVsbDtcbn1cblxuZXhwb3J0IHR5cGUgU2V0TWVtYmVyID0gSGFzR3VpZCB8IHN0cmluZztcblxuZXhwb3J0IGNsYXNzIERpY3RTZXQ8VCBleHRlbmRzIFNldE1lbWJlcj4gaW1wbGVtZW50cyBTZXQ8VD4ge1xuICBwcml2YXRlIGRpY3Q6IERpY3Q8VD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5kaWN0ID0gZGljdDxUPigpO1xuICB9XG5cbiAgYWRkKG9iajogVCk6IFNldDxUPiB7XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB0aGlzLmRpY3Rbb2JqIGFzIGFueV0gPSBvYmo7XG4gICAgZWxzZSB0aGlzLmRpY3RbZW5zdXJlR3VpZChvYmogYXMgYW55KV0gPSBvYmo7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkZWxldGUob2JqOiBUKSB7XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSBkZWxldGUgdGhpcy5kaWN0W29iaiBhcyBhbnldO1xuICAgIGVsc2UgaWYgKChvYmogYXMgYW55KS5fZ3VpZCkgZGVsZXRlIHRoaXMuZGljdFsob2JqIGFzIGFueSkuX2d1aWRdO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdGFja0ltcGw8VD4gaW1wbGVtZW50cyBTdGFjazxUPiB7XG4gIHByaXZhdGUgc3RhY2s6IFRbXSA9IFtdO1xuICBwdWJsaWMgY3VycmVudDogT3B0aW9uPFQ+ID0gbnVsbDtcblxuICBwdWJsaWMgZ2V0IHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2subGVuZ3RoO1xuICB9XG5cbiAgcHVzaChpdGVtOiBUKSB7XG4gICAgdGhpcy5jdXJyZW50ID0gaXRlbTtcbiAgICB0aGlzLnN0YWNrLnB1c2goaXRlbSk7XG4gIH1cblxuICBwb3AoKTogT3B0aW9uPFQ+IHtcbiAgICBsZXQgaXRlbSA9IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgbGV0IGxlbiA9IHRoaXMuc3RhY2subGVuZ3RoO1xuICAgIHRoaXMuY3VycmVudCA9IGxlbiA9PT0gMCA/IG51bGwgOiB0aGlzLnN0YWNrW2xlbiAtIDFdO1xuXG4gICAgcmV0dXJuIGl0ZW0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBpdGVtO1xuICB9XG5cbiAgbnRoKGZyb206IG51bWJlcik6IE9wdGlvbjxUPiB7XG4gICAgbGV0IGxlbiA9IHRoaXMuc3RhY2subGVuZ3RoO1xuICAgIHJldHVybiBsZW4gPCBmcm9tID8gbnVsbCA6IHRoaXMuc3RhY2tbbGVuIC0gZnJvbV07XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YWNrLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIHRvQXJyYXkoKTogVFtdIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjaztcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWF5YmUsIFN5bWJvbERlc3Ryb3lhYmxlLCBEZXN0cm95YWJsZSwgRGVzdHJveVN5bWJvbCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgY29uc3QgREVTVFJPWTogRGVzdHJveVN5bWJvbCA9ICdERVNUUk9ZIFtmYzYxMTU4Mi0zNzQyLTQ4NDUtODhlMS05NzFjMzc3NWUwYjhdJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGVzdHJveWFibGUoXG4gIHZhbHVlOiBNYXliZTxvYmplY3Q+IHwgU3ltYm9sRGVzdHJveWFibGVcbik6IHZhbHVlIGlzIFN5bWJvbERlc3Ryb3lhYmxlIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIERFU1RST1kgaW4gdmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmdEZXN0cm95YWJsZSh2YWx1ZTogTWF5YmU8UGFydGlhbDxEZXN0cm95YWJsZT4+KTogdmFsdWUgaXMgRGVzdHJveWFibGUge1xuICByZXR1cm4gISEodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG4iLCJpbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFNpbXBsZUVsZW1lbnQsIFNpbXBsZU5vZGUgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJFbGVtZW50KHBhcmVudDogU2ltcGxlRWxlbWVudCkge1xuICBsZXQgY3VycmVudDogT3B0aW9uPFNpbXBsZU5vZGU+ID0gcGFyZW50LmZpcnN0Q2hpbGQ7XG5cbiAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICBsZXQgbmV4dCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKGN1cnJlbnQpO1xuICAgIGN1cnJlbnQgPSBuZXh0O1xuICB9XG59XG4iLCJpbXBvcnQgeyBTaW1wbGVOb2RlIH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcblxuZXhwb3J0IGNvbnN0IFNFUklBTElaQVRJT05fRklSU1RfTk9ERV9TVFJJTkcgPSAnJStiOjAlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2VyaWFsaXphdGlvbkZpcnN0Tm9kZShub2RlOiBTaW1wbGVOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLm5vZGVWYWx1ZSA9PT0gU0VSSUFMSVpBVElPTl9GSVJTVF9OT0RFX1NUUklORztcbn1cbiIsImltcG9ydCB7IGlzRGVzdHJveWFibGUsIGlzU3RyaW5nRGVzdHJveWFibGUsIERFU1RST1kgfSBmcm9tICcuL2Rlc3Ryb3knO1xuaW1wb3J0IHtcbiAgT3B0aW9uLFxuICBTeW1ib2xEZXN0cm95YWJsZSxcbiAgRGVzdHJveWFibGUsXG4gIERyb3AsXG4gIERyb3BTeW1ib2wsXG4gIENoaWxkcmVuU3ltYm9sLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IExpbmtlZExpc3QsIExpbmtlZExpc3ROb2RlIH0gZnJvbSAnLi9saXN0LXV0aWxzJztcbmltcG9ydCB7IERFVk1PREUgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5cbmV4cG9ydCBjb25zdCBMSU5LRUQ6IFdlYWtNYXA8b2JqZWN0LCBTZXQ8RHJvcD4+ID0gbmV3IFdlYWtNYXAoKTtcbmV4cG9ydCBjb25zdCBEUk9QOiBEcm9wU3ltYm9sID0gJ0RST1AgWzk0ZDQ2Y2YzLTM5NzQtNDM1ZC1iMjc4LTNlNjBkMTE1NTI5MF0nO1xuZXhwb3J0IGNvbnN0IENISUxEUkVOOiBDaGlsZHJlblN5bWJvbCA9ICdDSElMRFJFTiBbNzE0MmU1MmEtODYwMC00ZTAxLWE3NzMtNDIwNTViOTY2MzBkXSc7XG5leHBvcnQgY29uc3QgREVTVFJVQ1RPUlMgPSBuZXcgV2Vha01hcCgpO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNEcm9wKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgRHJvcCB7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBEUk9QIGluICh2YWx1ZSBhcyBvYmplY3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzb2NpYXRlKHBhcmVudDogb2JqZWN0LCBjaGlsZDogb2JqZWN0KSB7XG4gIGFzc29jaWF0ZURlc3RydWN0b3IocGFyZW50LCBkZXN0cnVjdG9yKGNoaWxkKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NvY2lhdGVEZXN0cnVjdG9yKHBhcmVudDogb2JqZWN0LCBjaGlsZDogRHJvcCk6IHZvaWQge1xuICBsZXQgYXNzb2NpYXRlZCA9IExJTktFRC5nZXQocGFyZW50KTtcblxuICBpZiAoIWFzc29jaWF0ZWQpIHtcbiAgICBhc3NvY2lhdGVkID0gbmV3IFNldCgpO1xuICAgIExJTktFRC5zZXQocGFyZW50LCBhc3NvY2lhdGVkKTtcbiAgfVxuXG4gIGFzc29jaWF0ZWQuYWRkKGNoaWxkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRha2VBc3NvY2lhdGVkKHBhcmVudDogb2JqZWN0KTogT3B0aW9uPFNldDxEcm9wPj4ge1xuICBsZXQgbGlua2VkID0gTElOS0VELmdldChwYXJlbnQpO1xuXG4gIGlmIChsaW5rZWQgJiYgbGlua2VkLnNpemUgPiAwKSB7XG4gICAgTElOS0VELmRlbGV0ZShwYXJlbnQpO1xuICAgIHJldHVybiBsaW5rZWQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lBc3NvY2lhdGVkKHBhcmVudDogb2JqZWN0KSB7XG4gIGxldCBhc3NvY2lhdGVkID0gTElOS0VELmdldChwYXJlbnQpO1xuXG4gIGlmIChhc3NvY2lhdGVkKSB7XG4gICAgYXNzb2NpYXRlZC5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaXRlbVtEUk9QXSgpO1xuICAgICAgYXNzb2NpYXRlZCEuZGVsZXRlKGl0ZW0pO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXN0cnVjdG9yKHZhbHVlOiBvYmplY3QpOiBEcm9wIHtcbiAgbGV0IGQgPSBERVNUUlVDVE9SUy5nZXQodmFsdWUpO1xuXG4gIGlmICghZCkge1xuICAgIGlmIChpc0Rlc3Ryb3lhYmxlKHZhbHVlKSkge1xuICAgICAgZCA9IG5ldyBEZXN0cm95YWJsZURlc3RydWN0b3IodmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoaXNTdHJpbmdEZXN0cm95YWJsZSh2YWx1ZSkpIHtcbiAgICAgIGQgPSBuZXcgU3RyaW5nRGVzdHJveWFibGVEZXN0cnVjdG9yKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZCA9IG5ldyBTaW1wbGVEZXN0cnVjdG9yKHZhbHVlKTtcbiAgICB9XG5cbiAgICBERVNUUlVDVE9SUy5zZXQodmFsdWUsIGQpO1xuICB9XG5cbiAgcmV0dXJuIGQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzbmFwc2hvdCh2YWx1ZXM6IFNldDxEcm9wPik6IERyb3Age1xuICByZXR1cm4gbmV3IFNuYXBzaG90RGVzdHJ1Y3Rvcih2YWx1ZXMpO1xufVxuXG5jbGFzcyBTbmFwc2hvdERlc3RydWN0b3IgaW1wbGVtZW50cyBEcm9wIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkZXN0cnVjdG9yczogU2V0PERyb3A+KSB7fVxuXG4gIFtEUk9QXSgpIHtcbiAgICB0aGlzLmRlc3RydWN0b3JzLmZvckVhY2goaXRlbSA9PiBpdGVtW0RST1BdKCkpO1xuICB9XG5cbiAgZ2V0IFtDSElMRFJFTl0oKTogSXRlcmFibGU8RHJvcD4ge1xuICAgIHJldHVybiB0aGlzLmRlc3RydWN0b3JzO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICdTbmFwc2hvdERlc3RydWN0b3InO1xuICB9XG59XG5cbmNsYXNzIERlc3Ryb3lhYmxlRGVzdHJ1Y3RvciBpbXBsZW1lbnRzIERyb3Age1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBTeW1ib2xEZXN0cm95YWJsZSkge31cblxuICBbRFJPUF0oKSB7XG4gICAgdGhpcy5pbm5lcltERVNUUk9ZXSgpO1xuICAgIGRlc3Ryb3lBc3NvY2lhdGVkKHRoaXMuaW5uZXIpO1xuICB9XG5cbiAgZ2V0IFtDSElMRFJFTl0oKTogSXRlcmFibGU8RHJvcD4ge1xuICAgIHJldHVybiBMSU5LRUQuZ2V0KHRoaXMuaW5uZXIpIHx8IFtdO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICdEZXN0cm95YWJsZURlc3RydWN0b3InO1xuICB9XG59XG5cbmNsYXNzIFN0cmluZ0Rlc3Ryb3lhYmxlRGVzdHJ1Y3RvciBpbXBsZW1lbnRzIERyb3Age1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBEZXN0cm95YWJsZSkge31cblxuICBbRFJPUF0oKSB7XG4gICAgdGhpcy5pbm5lci5kZXN0cm95KCk7XG4gICAgZGVzdHJveUFzc29jaWF0ZWQodGhpcy5pbm5lcik7XG4gIH1cblxuICBnZXQgW0NISUxEUkVOXSgpOiBJdGVyYWJsZTxEcm9wPiB7XG4gICAgcmV0dXJuIExJTktFRC5nZXQodGhpcy5pbm5lcikgfHwgW107XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gJ1N0cmluZ0Rlc3Ryb3lhYmxlRGVzdHJ1Y3Rvcic7XG4gIH1cbn1cblxuY2xhc3MgU2ltcGxlRGVzdHJ1Y3RvciBpbXBsZW1lbnRzIERyb3Age1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBvYmplY3QpIHt9XG5cbiAgW0RST1BdKCkge1xuICAgIGRlc3Ryb3lBc3NvY2lhdGVkKHRoaXMuaW5uZXIpO1xuICB9XG5cbiAgZ2V0IFtDSElMRFJFTl0oKTogSXRlcmFibGU8RHJvcD4ge1xuICAgIHJldHVybiBMSU5LRUQuZ2V0KHRoaXMuaW5uZXIpIHx8IFtdO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICdTaW1wbGVEZXN0cnVjdG9yJztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTGlzdENvbnRlbnRzRGVzdHJ1Y3RvciBpbXBsZW1lbnRzIERyb3Age1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBMaW5rZWRMaXN0PExpbmtlZExpc3ROb2RlPikge31cblxuICBbRFJPUF0oKSB7XG4gICAgdGhpcy5pbm5lci5mb3JFYWNoTm9kZShkID0+IGRlc3RydWN0b3IoZClbRFJPUF0oKSk7XG4gIH1cblxuICBnZXQgW0NISUxEUkVOXSgpOiBJdGVyYWJsZTxEcm9wPiB7XG4gICAgbGV0IG91dDogRHJvcFtdID0gW107XG4gICAgdGhpcy5pbm5lci5mb3JFYWNoTm9kZShkID0+IG91dC5wdXNoKC4uLmRlc3RydWN0b3IoZClbQ0hJTERSRU5dKSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiAnTGlzdENvbnRlbnRzRGVzdHJ1Y3Rvcic7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWJ1Z05vZGUge1xuICBpbm5lcjogb2JqZWN0O1xuICBjaGlsZHJlbjogRGVidWdOb2RlW10gfCBudWxsO1xuICBoYXNEcm9wOiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVidWdEcm9wVHJlZShpbm5lcjogb2JqZWN0KTogRGVidWdOb2RlIHtcbiAgbGV0IGhhc0Ryb3AgPSBpc0Ryb3AoaW5uZXIpO1xuICBsZXQgcmF3Q2hpbGRyZW4gPSBMSU5LRUQuZ2V0KGlubmVyKSB8fCBudWxsO1xuICBsZXQgY2hpbGRyZW46IERlYnVnTm9kZVtdIHwgbnVsbCA9IG51bGw7XG5cbiAgaWYgKHJhd0NoaWxkcmVuKSB7XG4gICAgY2hpbGRyZW4gPSBbXTtcbiAgICBmb3IgKGxldCBjaGlsZCBvZiByYXdDaGlsZHJlbikge1xuICAgICAgY2hpbGRyZW4ucHVzaChkZWJ1Z0Ryb3BUcmVlKGNoaWxkKSk7XG4gICAgfVxuICB9XG5cbiAgbGV0IG9iaiA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIG9iai5pbm5lciA9IGlubmVyO1xuICBpZiAoY2hpbGRyZW4pIHtcbiAgICBvYmouY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgfVxuICBvYmouaGFzRHJvcCA9IGhhc0Ryb3A7XG4gIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmludERyb3BUcmVlKGlubmVyOiBvYmplY3QpIHtcbiAgcHJpbnREcm9wKGRlc3RydWN0b3IoaW5uZXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByaW50RHJvcChpbm5lcjogRHJvcCkge1xuICBjb25zb2xlLmdyb3VwKFN0cmluZyhpbm5lcikpO1xuXG4gIGNvbnNvbGUubG9nKGlubmVyKTtcblxuICBsZXQgY2hpbGRyZW4gPSBpbm5lcltDSElMRFJFTl0gfHwgbnVsbDtcbiAgaWYgKGNoaWxkcmVuKSB7XG4gICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICAgIHByaW50RHJvcChjaGlsZCk7XG4gICAgfVxuICB9XG5cbiAgY29uc29sZS5ncm91cEVuZCgpO1xufVxuXG5pZiAoREVWTU9ERSAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAod2luZG93IGFzIGFueSkuUFJJTlRfRFJPUCA9IHByaW50RHJvcFRyZWU7XG59XG4iLCJpbXBvcnQgeyBPcHRpb24gfSBmcm9tICcuL3BsYXRmb3JtLXV0aWxzJztcbmltcG9ydCB7IERST1AsIGRlc3RydWN0b3IsIENISUxEUkVOIH0gZnJvbSAnLi9saWZldGltZXMnO1xuaW1wb3J0IHsgRHJvcCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExpbmtlZExpc3ROb2RlIHtcbiAgbmV4dDogT3B0aW9uPExpbmtlZExpc3ROb2RlPjtcbiAgcHJldjogT3B0aW9uPExpbmtlZExpc3ROb2RlPjtcbn1cblxuZXhwb3J0IGNsYXNzIExpc3ROb2RlPFQ+IGltcGxlbWVudHMgTGlua2VkTGlzdE5vZGUge1xuICBwdWJsaWMgbmV4dDogT3B0aW9uPExpc3ROb2RlPFQ+PiA9IG51bGw7XG4gIHB1YmxpYyBwcmV2OiBPcHRpb248TGlzdE5vZGU8VD4+ID0gbnVsbDtcbiAgcHVibGljIHZhbHVlOiBUO1xuXG4gIGNvbnN0cnVjdG9yKHZhbHVlOiBUKSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG59XG5cbi8vIHdlIGFyZSB1bmFibGUgdG8gZXhwcmVzcyB0aGUgY29uc3RyYWludCB0aGF0IFQncyAucHJldiBhbmQgLm5leHQgYXJlXG4vLyB0aGVtc2VsdmVzIFQuIEhvd2V2ZXIsIGl0IHdpbGwgYWx3YXlzIGJlIHRydWUsIHNvIHRydXN0IHVzLlxudHlwZSB0cnVzdCA9IGFueTtcblxuZXhwb3J0IGNsYXNzIExpbmtlZExpc3Q8VCBleHRlbmRzIExpbmtlZExpc3ROb2RlPiBpbXBsZW1lbnRzIFNsaWNlPFQ+LCBEcm9wIHtcbiAgcHJpdmF0ZSBfaGVhZCE6IE9wdGlvbjxUPjtcbiAgcHJpdmF0ZSBfdGFpbCE6IE9wdGlvbjxUPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNsZWFyKCk7XG4gIH1cblxuICBoZWFkKCk6IE9wdGlvbjxUPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYWQ7XG4gIH1cblxuICB0YWlsKCk6IE9wdGlvbjxUPiB7XG4gICAgcmV0dXJuIHRoaXMuX3RhaWw7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLl9oZWFkID0gdGhpcy5fdGFpbCA9IG51bGw7XG4gIH1cblxuICB0b0FycmF5KCk6IFRbXSB7XG4gICAgbGV0IG91dDogVFtdID0gW107XG4gICAgdGhpcy5mb3JFYWNoTm9kZShuID0+IG91dC5wdXNoKG4pKTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgbmV4dE5vZGUobm9kZTogVCk6IFQge1xuICAgIHJldHVybiBub2RlLm5leHQgYXMgdHJ1c3Q7XG4gIH1cblxuICBmb3JFYWNoTm9kZShjYWxsYmFjazogKG5vZGU6IFQpID0+IHZvaWQpIHtcbiAgICBsZXQgbm9kZSA9IHRoaXMuX2hlYWQ7XG5cbiAgICB3aGlsZSAobm9kZSAhPT0gbnVsbCkge1xuICAgICAgY2FsbGJhY2sobm9kZSBhcyB0cnVzdCk7XG4gICAgICBub2RlID0gbm9kZS5uZXh0IGFzIHRydXN0O1xuICAgIH1cbiAgfVxuXG4gIGluc2VydEJlZm9yZShub2RlOiBULCByZWZlcmVuY2U6IE9wdGlvbjxUPiA9IG51bGwpOiBUIHtcbiAgICBpZiAocmVmZXJlbmNlID09PSBudWxsKSByZXR1cm4gdGhpcy5hcHBlbmQobm9kZSk7XG5cbiAgICBpZiAocmVmZXJlbmNlLnByZXYpIHJlZmVyZW5jZS5wcmV2Lm5leHQgPSBub2RlO1xuICAgIGVsc2UgdGhpcy5faGVhZCA9IG5vZGU7XG5cbiAgICBub2RlLnByZXYgPSByZWZlcmVuY2UucHJldjtcbiAgICBub2RlLm5leHQgPSByZWZlcmVuY2U7XG4gICAgcmVmZXJlbmNlLnByZXYgPSBub2RlO1xuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBhcHBlbmQobm9kZTogVCk6IFQge1xuICAgIGxldCB0YWlsID0gdGhpcy5fdGFpbDtcblxuICAgIGlmICh0YWlsKSB7XG4gICAgICB0YWlsLm5leHQgPSBub2RlO1xuICAgICAgbm9kZS5wcmV2ID0gdGFpbDtcbiAgICAgIG5vZGUubmV4dCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2hlYWQgPSBub2RlO1xuICAgIH1cblxuICAgIHJldHVybiAodGhpcy5fdGFpbCA9IG5vZGUpO1xuICB9XG5cbiAgcmVtb3ZlKG5vZGU6IFQpOiBUIHtcbiAgICBpZiAobm9kZS5wcmV2KSBub2RlLnByZXYubmV4dCA9IG5vZGUubmV4dDtcbiAgICBlbHNlIHRoaXMuX2hlYWQgPSBub2RlLm5leHQgYXMgdHJ1c3Q7XG5cbiAgICBpZiAobm9kZS5uZXh0KSBub2RlLm5leHQucHJldiA9IG5vZGUucHJldjtcbiAgICBlbHNlIHRoaXMuX3RhaWwgPSBub2RlLnByZXYgYXMgdHJ1c3Q7XG5cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIFtEUk9QXSgpIHtcbiAgICB0aGlzLmZvckVhY2hOb2RlKGQgPT4gZGVzdHJ1Y3RvcihkKVtEUk9QXSgpKTtcbiAgfVxuXG4gIGdldCBbQ0hJTERSRU5dKCk6IEl0ZXJhYmxlPERyb3A+IHtcbiAgICBsZXQgb3V0OiBEcm9wW10gPSBbXTtcbiAgICB0aGlzLmZvckVhY2hOb2RlKGQgPT4gb3V0LnB1c2goLi4uZGVzdHJ1Y3RvcihkKVtDSElMRFJFTl0pKTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2xpY2U8VCBleHRlbmRzIExpbmtlZExpc3ROb2RlPiB7XG4gIGhlYWQoKTogT3B0aW9uPFQ+O1xuICB0YWlsKCk6IE9wdGlvbjxUPjtcbiAgbmV4dE5vZGUobm9kZTogVCk6IE9wdGlvbjxUPjtcbiAgZm9yRWFjaE5vZGUoY2FsbGJhY2s6IChub2RlOiBUKSA9PiB2b2lkKTogdm9pZDtcbiAgdG9BcnJheSgpOiBUW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2xvbmVhYmxlTGlzdE5vZGUgZXh0ZW5kcyBMaW5rZWRMaXN0Tm9kZSB7XG4gIGNsb25lKCk6IHRoaXM7XG59XG5cbmV4cG9ydCBjbGFzcyBMaXN0U2xpY2U8VCBleHRlbmRzIExpbmtlZExpc3ROb2RlPiBpbXBsZW1lbnRzIFNsaWNlPFQ+IHtcbiAgcHJpdmF0ZSBfaGVhZDogT3B0aW9uPFQ+O1xuICBwcml2YXRlIF90YWlsOiBPcHRpb248VD47XG5cbiAgY29uc3RydWN0b3IoaGVhZDogT3B0aW9uPFQ+LCB0YWlsOiBPcHRpb248VD4pIHtcbiAgICB0aGlzLl9oZWFkID0gaGVhZDtcbiAgICB0aGlzLl90YWlsID0gdGFpbDtcbiAgfVxuXG4gIGZvckVhY2hOb2RlKGNhbGxiYWNrOiAobm9kZTogVCkgPT4gdm9pZCkge1xuICAgIGxldCBub2RlID0gdGhpcy5faGVhZDtcblxuICAgIHdoaWxlIChub2RlICE9PSBudWxsKSB7XG4gICAgICBjYWxsYmFjayhub2RlKTtcbiAgICAgIG5vZGUgPSB0aGlzLm5leHROb2RlKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGhlYWQoKTogT3B0aW9uPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5faGVhZDtcbiAgfVxuXG4gIHRhaWwoKTogT3B0aW9uPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5fdGFpbDtcbiAgfVxuXG4gIHRvQXJyYXkoKTogVFtdIHtcbiAgICBsZXQgb3V0OiBUW10gPSBbXTtcbiAgICB0aGlzLmZvckVhY2hOb2RlKG4gPT4gb3V0LnB1c2gobikpO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBuZXh0Tm9kZShub2RlOiBUKTogT3B0aW9uPFQ+IHtcbiAgICBpZiAobm9kZSA9PT0gdGhpcy5fdGFpbCkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIG5vZGUubmV4dCBhcyBUO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBFTVBUWV9TTElDRSA9IG5ldyBMaXN0U2xpY2UobnVsbCwgbnVsbCk7XG4iLCJjb25zdCB7IGtleXM6IG9iaktleXMgfSA9IE9iamVjdDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnbjxULCBVPihvYmo6IFQsIGFzc2lnbm1lbnRzOiBVKTogVCAmIFU7XG5leHBvcnQgZnVuY3Rpb24gYXNzaWduPFQsIFUsIFY+KG9iajogVCwgYTogVSwgYjogVik6IFQgJiBVICYgVjtcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ248VCwgVSwgViwgVz4ob2JqOiBULCBhOiBVLCBiOiBWLCBjOiBXKTogVCAmIFUgJiBWICYgVztcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ248VCwgVSwgViwgVywgWD4ob2JqOiBULCBhOiBVLCBiOiBWLCBjOiBXLCBkOiBYKTogVCAmIFUgJiBWICYgVyAmIFg7XG5leHBvcnQgZnVuY3Rpb24gYXNzaWduPFQsIFUsIFYsIFcsIFgsIFk+KFxuICBvYmo6IFQsXG4gIGE6IFUsXG4gIGI6IFYsXG4gIGM6IFcsXG4gIGQ6IFgsXG4gIGU6IFlcbik6IFQgJiBVICYgViAmIFcgJiBYICYgWTtcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ248VCwgVSwgViwgVywgWCwgWSwgWj4oXG4gIG9iajogVCxcbiAgYTogVSxcbiAgYjogVixcbiAgYzogVyxcbiAgZDogWCxcbiAgZTogWSxcbiAgZjogWlxuKTogVCAmIFUgJiBWICYgVyAmIFggJiBZICYgWjtcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0OiBhbnksIC4uLmFyZ3M6IGFueVtdKTogYW55O1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnbihvYmo6IGFueSkge1xuICBmb3IgKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBhc3NpZ25tZW50ID0gYXJndW1lbnRzW2ldO1xuICAgIGlmIChhc3NpZ25tZW50ID09PSBudWxsIHx8IHR5cGVvZiBhc3NpZ25tZW50ICE9PSAnb2JqZWN0JykgY29udGludWU7XG4gICAgbGV0IGtleXMgPSBvYmpLZXlzKGFzc2lnbm1lbnQpO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwga2V5cy5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IGtleSA9IGtleXNbal07XG4gICAgICBvYmpba2V5XSA9IGFzc2lnbm1lbnRba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbGxOdWxsczxUPihjb3VudDogbnVtYmVyKTogVFtdIHtcbiAgbGV0IGFyciA9IG5ldyBBcnJheShjb3VudCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgYXJyW2ldID0gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBhcnI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZXM8VD4ob2JqOiB7IFtzOiBzdHJpbmddOiBUIH0pOiBUW10ge1xuICBjb25zdCB2YWxzID0gW107XG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgIHZhbHMucHVzaChvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIHZhbHM7XG59XG4iLCJleHBvcnQgdHlwZSBPcHRpb248VD4gPSBUIHwgbnVsbDtcbmV4cG9ydCB0eXBlIE1heWJlPFQ+ID0gT3B0aW9uPFQ+IHwgdW5kZWZpbmVkIHwgdm9pZDtcblxuZXhwb3J0IHR5cGUgRmFjdG9yeTxUPiA9IG5ldyAoLi4uYXJnczogdW5rbm93bltdKSA9PiBUO1xuXG5leHBvcnQgZnVuY3Rpb24ga2V5czxUPihvYmo6IFQpOiBBcnJheTxrZXlvZiBUPiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopIGFzIEFycmF5PGtleW9mIFQ+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwPFQ+KHZhbDogTWF5YmU8VD4pOiBUIHtcbiAgaWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCB2YWx1ZSB0byBiZSBwcmVzZW50YCk7XG4gIHJldHVybiB2YWwgYXMgVDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cGVjdDxUPih2YWw6IE1heWJlPFQ+LCBtZXNzYWdlOiBzdHJpbmcpOiBUIHtcbiAgaWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gdmFsIGFzIFQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnJlYWNoYWJsZShtZXNzYWdlID0gJ3VucmVhY2hhYmxlJyk6IEVycm9yIHtcbiAgcmV0dXJuIG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4aGF1c3RlZCh2YWx1ZTogbmV2ZXIpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihgRXhoYXVzdGVkICR7dmFsdWV9YCk7XG59XG5cbmV4cG9ydCB0eXBlIExpdCA9IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsIHwgdm9pZCB8IHt9O1xuXG5leHBvcnQgY29uc3QgdHVwbGUgPSA8VCBleHRlbmRzIExpdFtdPiguLi5hcmdzOiBUKSA9PiBhcmdzO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIHN0cmlwKHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi5hcmdzOiB1bmtub3duW10pIHtcbiAgbGV0IG91dCA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgc3RyaW5nID0gc3RyaW5nc1tpXTtcbiAgICBsZXQgZHluYW1pYyA9IGFyZ3NbaV0gIT09IHVuZGVmaW5lZCA/IFN0cmluZyhhcmdzW2ldKSA6ICcnO1xuXG4gICAgb3V0ICs9IGAke3N0cmluZ30ke2R5bmFtaWN9YDtcbiAgfVxuXG4gIGxldCBsaW5lcyA9IG91dC5zcGxpdCgnXFxuJyk7XG5cbiAgd2hpbGUgKGxpbmVzLmxlbmd0aCAmJiBsaW5lc1swXS5tYXRjaCgvXlxccyokLykpIHtcbiAgICBsaW5lcy5zaGlmdCgpO1xuICB9XG5cbiAgd2hpbGUgKGxpbmVzLmxlbmd0aCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5tYXRjaCgvXlxccyokLykpIHtcbiAgICBsaW5lcy5wb3AoKTtcbiAgfVxuXG4gIGxldCBtaW4gPSBJbmZpbml0eTtcblxuICBmb3IgKGxldCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgbGV0IGxlYWRpbmcgPSBsaW5lLm1hdGNoKC9eXFxzKi8pIVswXS5sZW5ndGg7XG5cbiAgICBtaW4gPSBNYXRoLm1pbihtaW4sIGxlYWRpbmcpO1xuICB9XG5cbiAgbGV0IHN0cmlwcGVkID0gW107XG5cbiAgZm9yIChsZXQgbGluZSBvZiBsaW5lcykge1xuICAgIHN0cmlwcGVkLnB1c2gobGluZS5zbGljZShtaW4pKTtcbiAgfVxuXG4gIHJldHVybiBzdHJpcHBlZC5qb2luKCdcXG4nKTtcbn1cbiIsImV4cG9ydCB7IEVNUFRZX0FSUkFZIH0gZnJvbSAnLi9saWIvYXJyYXktdXRpbHMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhc3NlcnQsIGRlcHJlY2F0ZSB9IGZyb20gJy4vbGliL2Fzc2VydCc7XG5leHBvcnQgeyBkaWN0LCBEaWN0U2V0LCBpc0RpY3QsIGlzT2JqZWN0LCBTZXQsIFN0YWNrSW1wbCBhcyBTdGFjayB9IGZyb20gJy4vbGliL2NvbGxlY3Rpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL2Rlc3Ryb3knO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvZG9tJztcbmV4cG9ydCB7IGVuc3VyZUd1aWQsIEhhc0d1aWQsIGluaXRpYWxpemVHdWlkIH0gZnJvbSAnLi9saWIvZ3VpZCc7XG5leHBvcnQge1xuICBpc1NlcmlhbGl6YXRpb25GaXJzdE5vZGUsXG4gIFNFUklBTElaQVRJT05fRklSU1RfTk9ERV9TVFJJTkcsXG59IGZyb20gJy4vbGliL2lzLXNlcmlhbGl6YXRpb24tZmlyc3Qtbm9kZSc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9saWZldGltZXMnO1xuZXhwb3J0IHtcbiAgQ2xvbmVhYmxlTGlzdE5vZGUsXG4gIEVNUFRZX1NMSUNFLFxuICBMaW5rZWRMaXN0LFxuICBMaW5rZWRMaXN0Tm9kZSxcbiAgTGlzdE5vZGUsXG4gIExpc3RTbGljZSxcbiAgU2xpY2UsXG59IGZyb20gJy4vbGliL2xpc3QtdXRpbHMnO1xuZXhwb3J0IHsgYXNzaWduLCBmaWxsTnVsbHMsIHZhbHVlcyB9IGZyb20gJy4vbGliL29iamVjdC11dGlscyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9wbGF0Zm9ybS11dGlscyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9zdHJpbmcnO1xuXG5leHBvcnQgdHlwZSBGSVhNRTxULCBTIGV4dGVuZHMgc3RyaW5nPiA9IFQgJiBTIHwgVDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5ldmVyKHZhbHVlOiBuZXZlciwgZGVzYyA9ICd1bmV4cGVjdGVkIHVucmVhY2hhYmxlIGJyYW5jaCcpOiB2b2lkIHtcbiAgY29uc29sZS5sb2coJ3VucmVhY2hhYmxlJywgdmFsdWUpO1xuICBjb25zb2xlLnRyYWNlKGAke2Rlc2N9IDo6ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfSAoJHt2YWx1ZX0pYCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7UUFBYSxjQUFxQixPQUFBLE1BQUEsQ0FBM0IsRUFBMkIsQ0FBM0I7OztJQ0VQO0FBRUEsSUFBTSxTQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxFQUE0QztJQUNoRDtJQUNBO0lBQ0E7SUFDQTtJQUVBLFFBQUksQ0FBSixJQUFBLEVBQVc7SUFDVCxjQUFNLElB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