"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IteratorSynchronizer = exports.END = exports.ReferenceIterator = exports.IterationArtifacts = exports.ListItem = undefined;

var _util = require("@glimmer/util");

function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
        var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
        }
    }return obj;
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass);
}

var ListItem = exports.ListItem = function (_ListNode) {
    _inherits(ListItem, _ListNode);

    function ListItem(iterable, result) {
        _classCallCheck(this, ListItem);

        var _this = _possibleConstructorReturn(this, _ListNode.call(this, iterable.valueReferenceFor(result)));

        _this.retained = false;
        _this.seen = false;
        _this.key = result.key;
        _this.iterable = iterable;
        _this.memo = iterable.memoReferenceFor(result);
        return _this;
    }

    ListItem.prototype.update = function update(item) {
        this.retained = true;
        this.iterable.updateValueReference(this.value, item);
        this.iterable.updateMemoReference(this.memo, item);
    };

    ListItem.prototype.shouldRemove = function shouldRemove() {
        return !this.retained;
    };

    ListItem.prototype.reset = function reset() {
        this.retained = false;
        this.seen = false;
    };

    return ListItem;
}(_util.ListNode);
var IterationArtifacts = exports.IterationArtifacts = function () {
    function IterationArtifacts(iterable) {
        _classCallCheck(this, IterationArtifacts);

        this.iterator = null;
        this.map = new Map();
        this.list = new _util.LinkedList();
        this.tag = iterable.tag;
        this.iterable = iterable;
    }

    IterationArtifacts.prototype.isEmpty = function isEmpty() {
        var iterator = this.iterator = this.iterable.iterate();
        return iterator.isEmpty();
    };

    IterationArtifacts.prototype.iterate = function iterate() {
        var iterator = void 0;
        if (this.iterator === null) {
            iterator = this.iterable.iterate();
        } else {
            iterator = this.iterator;
        }
        this.iterator = null;
        return iterator;
    };

    IterationArtifacts.prototype.advanceToKey = function advanceToKey(key, current) {
        var seek = current;
        while (seek !== null && seek.key !== key) {
            seek = this.advanceNode(seek);
        }
        return seek;
    };

    IterationArtifacts.prototype.has = function has(key) {
        return this.map.has(key);
    };

    IterationArtifacts.prototype.get = function get(key) {
        return this.map.get(key);
    };

    IterationArtifacts.prototype.wasSeen = function wasSeen(key) {
        var node = this.map.get(key);
        return node !== undefined && node.seen;
    };

    IterationArtifacts.prototype.update = function update(item) {
        var found = this.get(item.key);
        found.update(item);
        return found;
    };

    IterationArtifacts.prototype.append = function append(item) {
        var map = this.map,
            list = this.list,
            iterable = this.iterable;

        var node = new ListItem(iterable, item);
        map.set(item.key, node);
        list.append(node);
        return node;
    };

    IterationArtifacts.prototype.insertBefore = function insertBefore(item, reference) {
        var map = this.map,
            list = this.list,
            iterable = this.iterable;

        var node = new ListItem(iterable, item);
        map.set(item.key, node);
        node.retained = true;
        list.insertBefore(node, reference);
        return node;
    };

    IterationArtifacts.prototype.move = function move(item, reference) {
        var list = this.list;

        item.retained = true;
        list.remove(item);
        list.insertBefore(item, reference);
    };

    IterationArtifacts.prototype.remove = function remove(item) {
        var list = this.list;

        list.remove(item);
        this.map.delete(item.key);
    };

    IterationArtifacts.prototype.nextNode = function nextNode(item) {
        return this.list.nextNode(item);
    };

    IterationArtifacts.prototype.advanceNode = function advanceNode(item) {
        item.seen = true;
        return this.list.nextNode(item);
    };

    IterationArtifacts.prototype.head = function head() {
        return this.list.head();
    };

    return IterationArtifacts;
}();
var ReferenceIterator = exports.ReferenceIterator = function () {
    // if anyone needs to construct this object with something other than
    // an iterable, let @wycats know.
    function ReferenceIterator(iterable) {
        _classCallCheck(this, ReferenceIterator);

        this.iterator = null;
        var artifacts = new IterationArtifacts(iterable);
        this.artifacts = artifacts;
    }

    ReferenceIterator.prototype.next = function next() {
        var artifacts = this.artifacts;

        var iterator = this.iterator = this.iterator || artifacts.iterate();
        var item = iterator.next();
        if (item === null) return null;
        return artifacts.append(item);
    };

    return ReferenceIterator;
}();
var Phase;
(function (Phase) {
    Phase[Phase["Append"] = 0] = "Append";
    Phase[Phase["Prune"] = 1] = "Prune";
    Phase[Phase["Done"] = 2] = "Done";
})(Phase || (Phase = {}));
var END = exports.END = 'END [2600abdf-889f-4406-b059-b44ecbafa5c5]';
var IteratorSynchronizer = exports.IteratorSynchronizer = function () {
    function IteratorSynchronizer(_ref) {
        var target = _ref.target,
            artifacts = _ref.artifacts,
            env = _ref.env;

        _classCallCheck(this, IteratorSynchronizer);

        this.target = target;
        this.artifacts = artifacts;
        this.iterator = artifacts.iterate();
        this.current = artifacts.head();
        this.env = env;
    }

    IteratorSynchronizer.prototype.sync = function sync() {
        var phase = Phase.Append;
        while (true) {
            switch (phase) {
                case Phase.Append:
                    phase = this.nextAppend();
                    break;
                case Phase.Prune:
                    phase = this.nextPrune();
                    break;
                case Phase.Done:
                    this.nextDone();
                    return;
            }
        }
    };

    IteratorSynchronizer.prototype.advanceToKey = function advanceToKey(key) {
        var current = this.current,
            artifacts = this.artifacts;

        if (current === null) return;
        var next = artifacts.advanceNode(current);
        if (next.key === key) {
            this.current = artifacts.advanceNode(next);
            return;
        }
        var seek = artifacts.advanceToKey(key, current);
        if (seek) {
            this.move(seek, current);
            this.current = artifacts.nextNode(current);
        }
    };

    IteratorSynchronizer.prototype.move = function move(item, reference) {
        if (item.next !== reference) {
            this.artifacts.move(item, reference);
            this.target.move(this.env, item.key, item.value, item.memo, reference ? reference.key : END);
        }
    };

    IteratorSynchronizer.prototype.nextAppend = function nextAppend() {
        var iterator = this.iterator,
            current = this.current,
            artifacts = this.artifacts;

        var item = iterator.next();
        if (item === null) {
            return this.startPrune();
        }
        var key = item.key;

        if (current !== null && current.key === key) {
            this.nextRetain(item, current);
        } else if (artifacts.has(key)) {
            this.nextMove(item);
        } else {
            this.nextInsert(item);
        }
        return Phase.Append;
    };

    IteratorSynchronizer.prototype.nextRetain = function nextRetain(item, current) {
        var artifacts = this.artifacts;
        // current = expect(current, 'BUG: current is empty');

        current.update(item);
        this.current = artifacts.nextNode(current);
        this.target.retain(this.env, item.key, current.value, current.memo);
    };

    IteratorSynchronizer.prototype.nextMove = function nextMove(item) {
        var current = this.current,
            artifacts = this.artifacts;
        var key = item.key;

        var found = artifacts.update(item);
        if (artifacts.wasSeen(key)) {
            this.move(found, current);
        } else {
            this.advanceToKey(key);
        }
    };

    IteratorSynchronizer.prototype.nextInsert = function nextInsert(item) {
        var artifacts = this.artifacts,
            target = this.target,
            current = this.current;

        var node = artifacts.insertBefore(item, current);
        target.insert(this.env, node.key, node.value, node.memo, current ? current.key : null);
    };

    IteratorSynchronizer.prototype.startPrune = function startPrune() {
        this.current = this.artifacts.head();
        return Phase.Prune;
    };

    IteratorSynchronizer.prototype.nextPrune = function nextPrune() {
        var artifacts = this.artifacts,
            target = this.target,
            current = this.current;

        if (current === null) {
            return Phase.Done;
        }
        var node = current;
        this.current = artifacts.nextNode(node);
        if (node.shouldRemove()) {
            artifacts.remove(node);
            target.delete(this.env, node.key);
        } else {
            node.reset();
        }
        return Phase.Prune;
    };

    IteratorSynchronizer.prototype.nextDone = function nextDone() {
        this.target.done(this.env);
    };

    return IteratorSynchronizer;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvaXRlcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0RBLElBQUEsOEJBQUEsVUFBQSxTQUFBLEVBQUE7QUFBQSxjQUFBLFFBQUEsRUFBQSxTQUFBOztBQU9FLGFBQUEsUUFBQSxDQUFBLFFBQUEsRUFBQSxNQUFBLEVBQWlFO0FBQUEsd0JBQUEsSUFBQSxFQUFBLFFBQUE7O0FBQUEsWUFBQSxRQUFBLDJCQUFBLElBQUEsRUFDL0QsVUFBQSxJQUFBLENBQUEsSUFBQSxFQUFNLFNBQUEsaUJBQUEsQ0FEeUQsTUFDekQsQ0FBTixDQUQrRCxDQUFBOztBQUoxRCxjQUFBLFFBQUEsR0FBQSxLQUFBO0FBQ0EsY0FBQSxJQUFBLEdBQUEsS0FBQTtBQUtMLGNBQUEsR0FBQSxHQUFXLE9BQVgsR0FBQTtBQUNBLGNBQUEsUUFBQSxHQUFBLFFBQUE7QUFDQSxjQUFBLElBQUEsR0FBWSxTQUFBLGdCQUFBLENBQVosTUFBWSxDQUFaO0FBSitELGVBQUEsS0FBQTtBQUtoRTs7QUFaSCxhQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQUEsU0FBQSxNQUFBLENBQUEsSUFBQSxFQWNrQztBQUM5QixhQUFBLFFBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxRQUFBLENBQUEsb0JBQUEsQ0FBbUMsS0FBbkMsS0FBQSxFQUFBLElBQUE7QUFDQSxhQUFBLFFBQUEsQ0FBQSxtQkFBQSxDQUFrQyxLQUFsQyxJQUFBLEVBQUEsSUFBQTtBQWpCSixLQUFBOztBQUFBLGFBQUEsU0FBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLFlBQUEsR0FvQmM7QUFDVixlQUFPLENBQUMsS0FBUixRQUFBO0FBckJKLEtBQUE7O0FBQUEsYUFBQSxTQUFBLENBQUEsS0FBQSxHQUFBLFNBQUEsS0FBQSxHQXdCTztBQUNILGFBQUEsUUFBQSxHQUFBLEtBQUE7QUFD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LE1BQVAsS0FBQTtBQWxISixLQUFBOztBQUFBLHlCQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxTQUFBLEdBcUhtQjtBQUFBLFlBQUEsWUFBQSxLQUFBLFNBQUE7QUFBQSxZQUFBLFNBQUEsS0FBQSxNQUFBO0FBQUEsWUFBQSxVQUFBLEtBQUEsT0FBQTs7QUFHZixZQUFJLFlBQUosSUFBQSxFQUFzQjtBQUNwQixtQkFBTyxNQUFQLElBQUE7QUFDRDtBQUVELFlBQUksT0FBSixPQUFBO0FBQ0EsYUFBQSxPQUFBLEdBQWUsVUFBQSxRQUFBLENBQWYsSUFBZSxDQUFmO0FBRUEsWUFBSSxLQUFKLFlBQUksRUFBSixFQUF5QjtBQUN2QixzQkFBQSxNQUFBLENBQUEsSUFBQTtBQUNBLG1CQUFBLE1BQUEsQ0FBYyxLQUFkLEdBQUEsRUFBd0IsS0FBeEIsR0FBQTtBQUZGLFNBQUEsTUFHTztBQUNMLGlCQUFBLEtBQUE7QUFDRDtBQUVELGVBQU8sTUFBUCxLQUFBO0FBdElKLEtBQUE7O0FBQUEseUJBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxTQUFBLFFBQUEsR0F5SWtCO0FBQ2QsYUFBQSxNQUFBLENBQUEsSUFBQSxDQUFpQixLQUFqQixHQUFBO0FBMUlKLEtBQUE7O0FBQUEsV0FBQSxvQkFBQTtBQUFBLENBQUEsRUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExpbmtlZExpc3QsIExpc3ROb2RlLCBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFRhZyB9IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIGFzIFBhdGhSZWZlcmVuY2UgfSBmcm9tICcuL3JlZmVyZW5jZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0aW9uSXRlbTxULCBVPiB7XG4gIGtleTogdW5rbm93bjtcbiAgdmFsdWU6IFQ7XG4gIG1lbW86IFU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWJzdHJhY3RJdGVyYXRvcjxULCBVLCBWIGV4dGVuZHMgSXRlcmF0aW9uSXRlbTxULCBVPj4ge1xuICBpc0VtcHR5KCk6IGJvb2xlYW47XG4gIG5leHQoKTogT3B0aW9uPFY+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFic3RyYWN0SXRlcmFibGU8XG4gIFQsXG4gIFUsXG4gIEl0ZW1UeXBlIGV4dGVuZHMgSXRlcmF0aW9uSXRlbTxULCBVPixcbiAgVmFsdWVSZWZlcmVuY2VUeXBlIGV4dGVuZHMgUGF0aFJlZmVyZW5jZTxUPixcbiAgTWVtb1JlZmVyZW5jZVR5cGUgZXh0ZW5kcyBQYXRoUmVmZXJlbmNlPFU+XG4+IHtcbiAgdGFnOiBUYWc7XG4gIGl0ZXJhdGUoKTogQWJzdHJhY3RJdGVyYXRvcjxULCBVLCBJdGVtVHlwZT47XG5cbiAgdmFsdWVSZWZlcmVuY2VGb3IoaXRlbTogSXRlbVR5cGUpOiBWYWx1ZVJlZmVyZW5jZVR5cGU7XG4gIHVwZGF0ZVZhbHVlUmVmZXJlbmNlKHJlZmVyZW5jZTogVmFsdWVSZWZlcmVuY2VUeXBlLCBpdGVtOiBJdGVtVHlwZSk6IHZvaWQ7XG5cbiAgbWVtb1JlZmVyZW5jZUZvcihpdGVtOiBJdGVtVHlwZSk6IE1lbW9SZWZlcmVuY2VUeXBlO1xuICB1cGRhdGVNZW1vUmVmZXJlbmNlKHJlZmVyZW5jZTogTWVtb1JlZmVyZW5jZVR5cGUsIGl0ZW06IEl0ZW1UeXBlKTogdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUgSXRlcmF0b3I8VCwgVT4gPSBBYnN0cmFjdEl0ZXJhdG9yPFQsIFUsIEl0ZXJhdGlvbkl0ZW08VCwgVT4+O1xuZXhwb3J0IHR5cGUgSXRlcmFibGU8VCwgVT4gPSBBYnN0cmFjdEl0ZXJhYmxlPFxuICBULFxuICBVLFxuICBJdGVyYXRpb25JdGVtPFQsIFU+LFxuICBQYXRoUmVmZXJlbmNlPFQ+LFxuICBQYXRoUmVmZXJlbmNlPFU+XG4+O1xuXG5leHBvcnQgdHlwZSBPcGFxdWVJdGVyYXRpb25JdGVtID0gSXRlcmF0aW9uSXRlbTx1bmtub3duLCB1bmtub3duPjtcbmV4cG9ydCB0eXBlIE9wYXF1ZUl0ZXJhdG9yID0gQWJzdHJhY3RJdGVyYXRvcjx1bmtub3duLCB1bmtub3duLCBPcGFxdWVJdGVyYXRpb25JdGVtPjtcbmV4cG9ydCB0eXBlIE9wYXF1ZVBhdGhSZWZlcmVuY2UgPSBQYXRoUmVmZXJlbmNlPHVua25vd24+O1xuZXhwb3J0IHR5cGUgT3BhcXVlSXRlcmFibGUgPSBBYnN0cmFjdEl0ZXJhYmxlPFxuICB1bmtub3duLFxuICB1bmtub3duLFxuICBPcGFxdWVJdGVyYXRpb25JdGVtLFxuICBPcGFxdWVQYXRoUmVmZXJlbmNlLFxuICBPcGFxdWVQYXRoUmVmZXJlbmNlXG4+O1xuZXhwb3J0IHR5cGUgT3BhcXVlUGF0aFJlZmVyZW5jZUl0ZXJhdGlvbkl0ZW0gPSBJdGVyYXRpb25JdGVtPFxuICBPcGFxdWVQYXRoUmVmZXJlbmNlLFxuICBPcGFxdWVQYXRoUmVmZXJlbmNlXG4+O1xuXG5leHBvcnQgY2xhc3MgTGlzdEl0ZW0gZXh0ZW5kcyBMaXN0Tm9kZTxPcGFxdWVQYXRoUmVmZXJlbmNlPiBpbXBsZW1lbnRzIE9wYXF1ZUl0ZXJhdGlvbkl0ZW0ge1xuICBwdWJsaWMga2V5OiB1bmtub3duO1xuICBwdWJsaWMgbWVtbzogT3BhcXVlUGF0aFJlZmVyZW5jZTtcbiAgcHVibGljIHJldGFpbmVkID0gZmFsc2U7XG4gIHB1YmxpYyBzZWVuID0gZmFsc2U7XG4gIHByaXZhdGUgaXRlcmFibGU6IE9wYXF1ZUl0ZXJhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKGl0ZXJhYmxlOiBPcGFxdWVJdGVyYWJsZSwgcmVzdWx0OiBPcGFxdWVJdGVyYXRpb25JdGVtKSB7XG4gICAgc3VwZXIoaXRlcmFibGUudmFsdWVSZWZlcmVuY2VGb3IocmVzdWx0KSk7XG4gICAgdGhpcy5rZXkgPSByZXN1bHQua2V5O1xuICAgIHRoaXMuaXRlcmFibGUgPSBpdGVyYWJsZTtcbiAgICB0aGlzLm1lbW8gPSBpdGVyYWJsZS5tZW1vUmVmZXJlbmNlRm9yKHJlc3VsdCk7XG4gIH1cblxuICB1cGRhdGUoaXRlbTogT3BhcXVlSXRlcmF0aW9uSXRlbSkge1xuICAgIHRoaXMucmV0YWluZWQgPSB0cnVlO1xuICAgIHRoaXMuaXRlcmFibGUudXBkYXRlVmFsdWVSZWZlcmVuY2UodGhpcy52YWx1ZSwgaXRlbSk7XG4gICAgdGhpcy5pdGVyYWJsZS51cGRhdGVNZW1vUmVmZXJlbmNlKHRoaXMubWVtbywgaXRlbSk7XG4gIH1cblxuICBzaG91bGRSZW1vdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLnJldGFpbmVkO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5yZXRhaW5lZCA9IGZhbHNlO1xuICAgIHRoaXMuc2VlbiA9IGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJdGVyYXRpb25BcnRpZmFjdHMge1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgcHJpdmF0ZSBpdGVyYWJsZTogT3BhcXVlSXRlcmFibGU7XG4gIHByaXZhdGUgaXRlcmF0b3I6IE9wdGlvbjxPcGFxdWVJdGVyYXRvcj4gPSBudWxsO1xuICBwcml2YXRlIG1hcCA9IG5ldyBNYXA8dW5rbm93biwgTGlzdEl0ZW0+KCk7XG4gIHByaXZhdGUgbGlzdCA9IG5ldyBMaW5rZWRMaXN0PExpc3RJdGVtPigpO1xuXG4gIGNvbnN0cnVjdG9yKGl0ZXJhYmxlOiBPcGFxdWVJdGVyYWJsZSkge1xuICAgIHRoaXMudGFnID0gaXRlcmFibGUudGFnO1xuICAgIHRoaXMuaXRlcmFibGUgPSBpdGVyYWJsZTtcbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgbGV0IGl0ZXJhdG9yID0gKHRoaXMuaXRlcmF0b3IgPSB0aGlzLml0ZXJhYmxlLml0ZXJhdGUoKSk7XG4gICAgcmV0dXJuIGl0ZXJhdG9yLmlzRW1wdHkoKTtcbiAgfVxuXG4gIGl0ZXJhdGUoKTogT3BhcXVlSXRlcmF0b3Ige1xuICAgIGxldCBpdGVyYXRvcjogT3BhcXVlSXRlcmF0b3I7XG5cbiAgICBpZiAodGhpcy5pdGVyYXRvciA9PT0gbnVsbCkge1xuICAgICAgaXRlcmF0b3IgPSB0aGlzLml0ZXJhYmxlLml0ZXJhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0b3IgPSB0aGlzLml0ZXJhdG9yO1xuICAgIH1cblxuICAgIHRoaXMuaXRlcmF0b3IgPSBudWxsO1xuXG4gICAgcmV0dXJuIGl0ZXJhdG9yO1xuICB9XG5cbiAgYWR2YW5jZVRvS2V5KGtleTogdW5rbm93biwgY3VycmVudDogTGlzdEl0ZW0pOiBPcHRpb248TGlzdEl0ZW0+IHtcbiAgICBsZXQgc2VlayA9IGN1cnJlbnQ7XG5cbiAgICB3aGlsZSAoc2VlayAhPT0gbnVsbCAmJiBzZWVrLmtleSAhPT0ga2V5KSB7XG4gICAgICBzZWVrID0gdGhpcy5hZHZhbmNlTm9kZShzZWVrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VlaztcbiAgfVxuXG4gIGhhcyhrZXk6IHVua25vd24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzKGtleSk7XG4gIH1cblxuICBnZXQoa2V5OiB1bmtub3duKTogTGlzdEl0ZW0ge1xuICAgIHJldHVybiB0aGlzLm1hcC5nZXQoa2V5KSE7XG4gIH1cblxuICB3YXNTZWVuKGtleTogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgIGxldCBub2RlID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgcmV0dXJuIG5vZGUgIT09IHVuZGVmaW5lZCAmJiBub2RlLnNlZW47XG4gIH1cblxuICB1cGRhdGUoaXRlbTogT3BhcXVlSXRlcmF0aW9uSXRlbSk6IExpc3RJdGVtIHtcbiAgICBsZXQgZm91bmQgPSB0aGlzLmdldChpdGVtLmtleSk7XG4gICAgZm91bmQudXBkYXRlKGl0ZW0pO1xuICAgIHJldHVybiBmb3VuZDtcbiAgfVxuXG4gIGFwcGVuZChpdGVtOiBPcGFxdWVJdGVyYXRpb25JdGVtKTogTGlzdEl0ZW0ge1xuICAgIGxldCB7IG1hcCwgbGlzdCwgaXRlcmFibGUgfSA9IHRoaXM7XG5cbiAgICBsZXQgbm9kZSA9IG5ldyBMaXN0SXRlbShpdGVyYWJsZSwgaXRlbSk7XG4gICAgbWFwLnNldChpdGVtLmtleSwgbm9kZSk7XG5cbiAgICBsaXN0LmFwcGVuZChub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGluc2VydEJlZm9yZShpdGVtOiBPcGFxdWVJdGVyYXRpb25JdGVtLCByZWZlcmVuY2U6IE9wdGlvbjxMaXN0SXRlbT4pOiBMaXN0SXRlbSB7XG4gICAgbGV0IHsgbWFwLCBsaXN0LCBpdGVyYWJsZSB9ID0gdGhpcztcblxuICAgIGxldCBub2RlID0gbmV3IExpc3RJdGVtKGl0ZXJhYmxlLCBpdGVtKTtcbiAgICBtYXAuc2V0KGl0ZW0ua2V5LCBub2RlKTtcbiAgICBub2RlLnJldGFpbmVkID0gdHJ1ZTtcbiAgICBsaXN0Lmluc2VydEJlZm9yZShub2RlLCByZWZlcmVuY2UpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgbW92ZShpdGVtOiBMaXN0SXRlbSwgcmVmZXJlbmNlOiBPcHRpb248TGlzdEl0ZW0+KTogdm9pZCB7XG4gICAgbGV0IHsgbGlzdCB9ID0gdGhpcztcbiAgICBpdGVtLnJldGFpbmVkID0gdHJ1ZTtcbiAgICBsaXN0LnJlbW92ZShpdGVtKTtcbiAgICBsaXN0Lmluc2VydEJlZm9yZShpdGVtLCByZWZlcmVuY2UpO1xuICB9XG5cbiAgcmVtb3ZlKGl0ZW06IExpc3RJdGVtKTogdm9pZCB7XG4gICAgbGV0IHsgbGlzdCB9ID0gdGhpcztcblxuICAgIGxpc3QucmVtb3ZlKGl0ZW0pO1xuICAgIHRoaXMubWFwLmRlbGV0ZShpdGVtLmtleSk7XG4gIH1cblxuICBuZXh0Tm9kZShpdGVtOiBMaXN0SXRlbSk6IExpc3RJdGVtIHtcbiAgICByZXR1cm4gdGhpcy5saXN0Lm5leHROb2RlKGl0ZW0pO1xuICB9XG5cbiAgYWR2YW5jZU5vZGUoaXRlbTogTGlzdEl0ZW0pOiBMaXN0SXRlbSB7XG4gICAgaXRlbS5zZWVuID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5saXN0Lm5leHROb2RlKGl0ZW0pO1xuICB9XG5cbiAgaGVhZCgpOiBPcHRpb248TGlzdEl0ZW0+IHtcbiAgICByZXR1cm4gdGhpcy5saXN0LmhlYWQoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVmZXJlbmNlSXRlcmF0b3Ige1xuICBwdWJsaWMgYXJ0aWZhY3RzOiBJdGVyYXRpb25BcnRpZmFjdHM7XG4gIHByaXZhdGUgaXRlcmF0b3I6IE9wdGlvbjxPcGFxdWVJdGVyYXRvcj4gPSBudWxsO1xuXG4gIC8vIGlmIGFueW9uZSBuZWVkcyB0byBjb25zdHJ1Y3QgdGhpcyBvYmplY3Qgd2l0aCBzb21ldGhpbmcgb3RoZXIgdGhhblxuICAvLyBhbiBpdGVyYWJsZSwgbGV0IEB3eWNhdHMga25vdy5cbiAgY29uc3RydWN0b3IoaXRlcmFibGU6IE9wYXF1ZUl0ZXJhYmxlKSB7XG4gICAgbGV0IGFydGlmYWN0cyA9IG5ldyBJdGVyYXRpb25BcnRpZmFjdHMoaXRlcmFibGUpO1xuICAgIHRoaXMuYXJ0aWZhY3RzID0gYXJ0aWZhY3RzO1xuICB9XG5cbiAgbmV4dCgpOiBPcHRpb248TGlzdEl0ZW0+IHtcbiAgICBsZXQgeyBhcnRpZmFjdHMgfSA9IHRoaXM7XG5cbiAgICBsZXQgaXRlcmF0b3IgPSAodGhpcy5pdGVyYXRvciA9IHRoaXMuaXRlcmF0b3IgfHwgYXJ0aWZhY3RzLml0ZXJhdGUoKSk7XG5cbiAgICBsZXQgaXRlbSA9IGl0ZXJhdG9yLm5leHQoKTtcblxuICAgIGlmIChpdGVtID09PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiBhcnRpZmFjdHMuYXBwZW5kKGl0ZW0pO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0b3JTeW5jaHJvbml6ZXJEZWxlZ2F0ZTxFbnY+IHtcbiAgcmV0YWluKGVudjogRW52LCBrZXk6IHVua25vd24sIGl0ZW06IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sIG1lbW86IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4pOiB2b2lkO1xuICBpbnNlcnQoXG4gICAgZW52OiBFbnYsXG4gICAga2V5OiB1bmtub3duLFxuICAgIGl0ZW06IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgbWVtbzogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBiZWZvcmU6IE9wdGlvbjx1bmtub3duPlxuICApOiB2b2lkO1xuICBtb3ZlKFxuICAgIGVudjogRW52LFxuICAgIGtleTogdW5rbm93bixcbiAgICBpdGVtOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LFxuICAgIG1lbW86IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgYmVmb3JlOiBPcHRpb248dW5rbm93bj5cbiAgKTogdm9pZDtcbiAgZGVsZXRlKGVudjogRW52LCBrZXk6IHVua25vd24pOiB2b2lkO1xuICBkb25lKGVudjogRW52KTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRvclN5bmNocm9uaXplck9wdGlvbnM8RW52PiB7XG4gIHRhcmdldDogSXRlcmF0b3JTeW5jaHJvbml6ZXJEZWxlZ2F0ZTxFbnY+O1xuICBhcnRpZmFjdHM6IEl0ZXJhdGlvbkFydGlmYWN0cztcbiAgZW52OiBFbnY7XG59XG5cbmVudW0gUGhhc2Uge1xuICBBcHBlbmQsXG4gIFBydW5lLFxuICBEb25lLFxufVxuXG5leHBvcnQgY29uc3QgRU5EID0gJ0VORCBbMjYwMGFiZGYtODg5Zi00NDA2LWIwNTktYjQ0ZWNiYWZhNWM1XSc7XG5cbmV4cG9ydCBjbGFzcyBJdGVyYXRvclN5bmNocm9uaXplcjxFbnY+IHtcbiAgcHJpdmF0ZSB0YXJnZXQ6IEl0ZXJhdG9yU3luY2hyb25pemVyRGVsZWdhdGU8RW52PjtcbiAgcHJpdmF0ZSBpdGVyYXRvcjogT3BhcXVlSXRlcmF0b3I7XG4gIHByaXZhdGUgY3VycmVudDogT3B0aW9uPExpc3RJdGVtPjtcbiAgcHJpdmF0ZSBhcnRpZmFjdHM6IEl0ZXJhdGlvbkFydGlmYWN0cztcbiAgcHJpdmF0ZSBlbnY6IEVudjtcblxuICBjb25zdHJ1Y3Rvcih7IHRhcmdldCwgYXJ0aWZhY3RzLCBlbnYgfTogSXRlcmF0b3JTeW5jaHJvbml6ZXJPcHRpb25zPEVudj4pIHtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB0aGlzLmFydGlmYWN0cyA9IGFydGlmYWN0cztcbiAgICB0aGlzLml0ZXJhdG9yID0gYXJ0aWZhY3RzLml0ZXJhdGUoKTtcbiAgICB0aGlzLmN1cnJlbnQgPSBhcnRpZmFjdHMuaGVhZCgpO1xuICAgIHRoaXMuZW52ID0gZW52O1xuICB9XG5cbiAgc3luYygpIHtcbiAgICBsZXQgcGhhc2U6IFBoYXNlID0gUGhhc2UuQXBwZW5kO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHN3aXRjaCAocGhhc2UpIHtcbiAgICAgICAgY2FzZSBQaGFzZS5BcHBlbmQ6XG4gICAgICAgICAgcGhhc2UgPSB0aGlzLm5leHRBcHBlbmQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQaGFzZS5QcnVuZTpcbiAgICAgICAgICBwaGFzZSA9IHRoaXMubmV4dFBydW5lKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUGhhc2UuRG9uZTpcbiAgICAgICAgICB0aGlzLm5leHREb25lKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWR2YW5jZVRvS2V5KGtleTogdW5rbm93bikge1xuICAgIGxldCB7IGN1cnJlbnQsIGFydGlmYWN0cyB9ID0gdGhpcztcblxuICAgIGlmIChjdXJyZW50ID09PSBudWxsKSByZXR1cm47XG5cbiAgICBsZXQgbmV4dCA9IGFydGlmYWN0cy5hZHZhbmNlTm9kZShjdXJyZW50KTtcblxuICAgIGlmIChuZXh0LmtleSA9PT0ga2V5KSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSBhcnRpZmFjdHMuYWR2YW5jZU5vZGUobmV4dCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHNlZWsgPSBhcnRpZmFjdHMuYWR2YW5jZVRvS2V5KGtleSwgY3VycmVudCk7XG5cbiAgICBpZiAoc2Vlaykge1xuICAgICAgdGhpcy5tb3ZlKHNlZWssIGN1cnJlbnQpO1xuICAgICAgdGhpcy5jdXJyZW50ID0gYXJ0aWZhY3RzLm5leHROb2RlKGN1cnJlbnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbW92ZShpdGVtOiBMaXN0SXRlbSwgcmVmZXJlbmNlOiBPcHRpb248TGlzdEl0ZW0+KSB7XG4gICAgaWYgKGl0ZW0ubmV4dCAhPT0gcmVmZXJlbmNlKSB7XG4gICAgICB0aGlzLmFydGlmYWN0cy5tb3ZlKGl0ZW0sIHJlZmVyZW5jZSk7XG4gICAgICB0aGlzLnRhcmdldC5tb3ZlKHRoaXMuZW52LCBpdGVtLmtleSwgaXRlbS52YWx1ZSwgaXRlbS5tZW1vLCByZWZlcmVuY2UgPyByZWZlcmVuY2Uua2V5IDogRU5EKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG5leHRBcHBlbmQoKTogUGhhc2Uge1xuICAgIGxldCB7IGl0ZXJhdG9yLCBjdXJyZW50LCBhcnRpZmFjdHMgfSA9IHRoaXM7XG5cbiAgICBsZXQgaXRlbSA9IGl0ZXJhdG9yLm5leHQoKTtcblxuICAgIGlmIChpdGVtID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydFBydW5lKCk7XG4gICAgfVxuXG4gICAgbGV0IHsga2V5IH0gPSBpdGVtO1xuXG4gICAgaWYgKGN1cnJlbnQgIT09IG51bGwgJiYgY3VycmVudC5rZXkgPT09IGtleSkge1xuICAgICAgdGhpcy5uZXh0UmV0YWluKGl0ZW0sIGN1cnJlbnQpO1xuICAgIH0gZWxzZSBpZiAoYXJ0aWZhY3RzLmhhcyhrZXkpKSB7XG4gICAgICB0aGlzLm5leHRNb3ZlKGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5leHRJbnNlcnQoaXRlbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFBoYXNlLkFwcGVuZDtcbiAgfVxuXG4gIHByaXZhdGUgbmV4dFJldGFpbihpdGVtOiBPcGFxdWVJdGVyYXRpb25JdGVtLCBjdXJyZW50OiBMaXN0SXRlbSkge1xuICAgIGxldCB7IGFydGlmYWN0cyB9ID0gdGhpcztcblxuICAgIC8vIGN1cnJlbnQgPSBleHBlY3QoY3VycmVudCwgJ0JVRzogY3VycmVudCBpcyBlbXB0eScpO1xuXG4gICAgY3VycmVudC51cGRhdGUoaXRlbSk7XG4gICAgdGhpcy5jdXJyZW50ID0gYXJ0aWZhY3RzLm5leHROb2RlKGN1cnJlbnQpO1xuICAgIHRoaXMudGFyZ2V0LnJldGFpbih0aGlzLmVudiwgaXRlbS5rZXksIGN1cnJlbnQudmFsdWUsIGN1cnJlbnQubWVtbyk7XG4gIH1cblxuICBwcml2YXRlIG5leHRNb3ZlKGl0ZW06IE9wYXF1ZUl0ZXJhdGlvbkl0ZW0pIHtcbiAgICBsZXQgeyBjdXJyZW50LCBhcnRpZmFjdHMgfSA9IHRoaXM7XG4gICAgbGV0IHsga2V5IH0gPSBpdGVtO1xuXG4gICAgbGV0IGZvdW5kID0gYXJ0aWZhY3RzLnVwZGF0ZShpdGVtKTtcblxuICAgIGlmIChhcnRpZmFjdHMud2FzU2VlbihrZXkpKSB7XG4gICAgICB0aGlzLm1vdmUoZm91bmQsIGN1cnJlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkdmFuY2VUb0tleShrZXkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbmV4dEluc2VydChpdGVtOiBPcGFxdWVJdGVyYXRpb25JdGVtKSB7XG4gICAgbGV0IHsgYXJ0aWZhY3RzLCB0YXJnZXQsIGN1cnJlbnQgfSA9IHRoaXM7XG5cbiAgICBsZXQgbm9kZSA9IGFydGlmYWN0cy5pbnNlcnRCZWZvcmUoaXRlbSwgY3VycmVudCk7XG4gICAgdGFyZ2V0Lmluc2VydCh0aGlzLmVudiwgbm9kZS5rZXksIG5vZGUudmFsdWUsIG5vZGUubWVtbywgY3VycmVudCA/IGN1cnJlbnQua2V5IDogbnVsbCk7XG4gIH1cblxuICBwcml2YXRlIHN0YXJ0UHJ1bmUoKTogUGhhc2Uge1xuICAgIHRoaXMuY3VycmVudCA9IHRoaXMuYXJ0aWZhY3RzLmhlYWQoKTtcbiAgICByZXR1cm4gUGhhc2UuUHJ1bmU7XG4gIH1cblxuICBwcml2YXRlIG5leHRQcnVuZSgpOiBQaGFzZSB7XG4gICAgbGV0IHsgYXJ0aWZhY3RzLCB0YXJnZXQsIGN1cnJlbnQgfSA9IHRoaXM7XG5cbiAgICBpZiAoY3VycmVudCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFBoYXNlLkRvbmU7XG4gICAgfVxuXG4gICAgbGV0IG5vZGUgPSBjdXJyZW50O1xuICAgIHRoaXMuY3VycmVudCA9IGFydGlmYWN0cy5uZXh0Tm9kZShub2RlKTtcblxuICAgIGlmIChub2RlLnNob3VsZFJlbW92ZSgpKSB7XG4gICAgICBhcnRpZmFjdHMucmVtb3ZlKG5vZGUpO1xuICAgICAgdGFyZ2V0LmRlbGV0ZSh0aGlzLmVudiwgbm9kZS5rZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlLnJlc2V0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFBoYXNlLlBydW5lO1xuICB9XG5cbiAgcHJpdmF0ZSBuZXh0RG9uZSgpIHtcbiAgICB0aGlzLnRhcmdldC5kb25lKHRoaXMuZW52KTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==