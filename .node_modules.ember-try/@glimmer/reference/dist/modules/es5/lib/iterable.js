function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { LinkedList, ListNode } from '@glimmer/util';
export var ListItem = function (_ListNode) {
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
}(ListNode);
export var IterationArtifacts = function () {
    function IterationArtifacts(iterable) {
        _classCallCheck(this, IterationArtifacts);

        this.iterator = null;
        this.map = new Map();
        this.list = new LinkedList();
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
export var ReferenceIterator = function () {
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
export var END = 'END [2600abdf-889f-4406-b059-b44ecbafa5c5]';
export var IteratorSynchronizer = function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvaXRlcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxTQUFBLFVBQUEsRUFBQSxRQUFBLFFBQUEsZUFBQTtBQXdEQSxXQUFNLFFBQU47QUFBQTs7QUFPRSxzQkFBQSxRQUFBLEVBQUEsTUFBQSxFQUFpRTtBQUFBOztBQUFBLHFEQUMvRCxxQkFBTSxTQUFBLGlCQUFBLENBQU4sTUFBTSxDQUFOLENBRCtEOztBQUoxRCxjQUFBLFFBQUEsR0FBQSxLQUFBO0FBQ0EsY0FBQSxJQUFBLEdBQUEsS0FBQTtBQUtMLGNBQUEsR0FBQSxHQUFXLE9BQVgsR0FBQTtBQUNBLGNBQUEsUUFBQSxHQUFBLFFBQUE7QUFDQSxjQUFBLElBQUEsR0FBWSxTQUFBLGdCQUFBLENBQVosTUFBWSxDQUFaO0FBSitEO0FBS2hFOztBQVpILHVCQWNFLE1BZEYsbUJBY0UsSUFkRixFQWNrQztBQUM5QixhQUFBLFFBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxRQUFBLENBQUEsb0JBQUEsQ0FBbUMsS0FBbkMsS0FBQSxFQUFBLElBQUE7QUFDQSxhQUFBLFFBQUEsQ0FBQSxtQkFBQSxDQUFrQyxLQUFsQyxJQUFBLEVBQUEsSUFBQTtBQUNELEtBbEJIOztBQUFBLHVCQW9CRSxZQXBCRiwyQkFvQmM7QUFDVixlQUFPLENBQUMsS0FBUixRQUFBO0FBQ0QsS0F0Qkg7O0FBQUEsdUJBd0JFLEtBeEJGLG9CQXdCTztBQUNILGFBQUEsUUFBQSxHQUFBLEtBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxLQUFBO0FBQ0QsS0EzQkg7O0FBQUE7QUFBQSxFQUFNLFFBQU47QUE4QkEsV0FBTSxrQkFBTjtBQVFFLGdDQUFBLFFBQUEsRUFBb0M7QUFBQTs7QUFKNUIsYUFBQSxRQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsR0FBQSxHQUFNLElBQU4sR0FBTSxFQUFOO0FBQ0EsYUFBQSxJQUFBLEdBQU8sSUFB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QUFDRCxLQTNJSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGlua2VkTGlzdCwgTGlzdE5vZGUsIE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgVGFnIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IFZlcnNpb25lZFBhdGhSZWZlcmVuY2UgYXMgUGF0aFJlZmVyZW5jZSB9IGZyb20gJy4vcmVmZXJlbmNlJztcblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRpb25JdGVtPFQsIFU+IHtcbiAga2V5OiB1bmtub3duO1xuICB2YWx1ZTogVDtcbiAgbWVtbzogVTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBYnN0cmFjdEl0ZXJhdG9yPFQsIFUsIFYgZXh0ZW5kcyBJdGVyYXRpb25JdGVtPFQsIFU+PiB7XG4gIGlzRW1wdHkoKTogYm9vbGVhbjtcbiAgbmV4dCgpOiBPcHRpb248Vj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWJzdHJhY3RJdGVyYWJsZTxcbiAgVCxcbiAgVSxcbiAgSXRlbVR5cGUgZXh0ZW5kcyBJdGVyYXRpb25JdGVtPFQsIFU+LFxuICBWYWx1ZVJlZmVyZW5jZVR5cGUgZXh0ZW5kcyBQYXRoUmVmZXJlbmNlPFQ+LFxuICBNZW1vUmVmZXJlbmNlVHlwZSBleHRlbmRzIFBhdGhSZWZlcmVuY2U8VT5cbj4ge1xuICB0YWc6IFRhZztcbiAgaXRlcmF0ZSgpOiBBYnN0cmFjdEl0ZXJhdG9yPFQsIFUsIEl0ZW1UeXBlPjtcblxuICB2YWx1ZVJlZmVyZW5jZUZvcihpdGVtOiBJdGVtVHlwZSk6IFZhbHVlUmVmZXJlbmNlVHlwZTtcbiAgdXBkYXRlVmFsdWVSZWZlcmVuY2UocmVmZXJlbmNlOiBWYWx1ZVJlZmVyZW5jZVR5cGUsIGl0ZW06IEl0ZW1UeXBlKTogdm9pZDtcblxuICBtZW1vUmVmZXJlbmNlRm9yKGl0ZW06IEl0ZW1UeXBlKTogTWVtb1JlZmVyZW5jZVR5cGU7XG4gIHVwZGF0ZU1lbW9SZWZlcmVuY2UocmVmZXJlbmNlOiBNZW1vUmVmZXJlbmNlVHlwZSwgaXRlbTogSXRlbVR5cGUpOiB2b2lkO1xufVxuXG5leHBvcnQgdHlwZSBJdGVyYXRvcjxULCBVPiA9IEFic3RyYWN0SXRlcmF0b3I8VCwgVSwgSXRlcmF0aW9uSXRlbTxULCBVPj47XG5leHBvcnQgdHlwZSBJdGVyYWJsZTxULCBVPiA9IEFic3RyYWN0SXRlcmFibGU8XG4gIFQsXG4gIFUsXG4gIEl0ZXJhdGlvbkl0ZW08VCwgVT4sXG4gIFBhdGhSZWZlcmVuY2U8VD4sXG4gIFBhdGhSZWZlcmVuY2U8VT5cbj47XG5cbmV4cG9ydCB0eXBlIE9wYXF1ZUl0ZXJhdGlvbkl0ZW0gPSBJdGVyYXRpb25JdGVtPHVua25vd24sIHVua25vd24+O1xuZXhwb3J0IHR5cGUgT3BhcXVlSXRlcmF0b3IgPSBBYnN0cmFjdEl0ZXJhdG9yPHVua25vd24sIHVua25vd24sIE9wYXF1ZUl0ZXJhdGlvbkl0ZW0+O1xuZXhwb3J0IHR5cGUgT3BhcXVlUGF0aFJlZmVyZW5jZSA9IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG5leHBvcnQgdHlwZSBPcGFxdWVJdGVyYWJsZSA9IEFic3RyYWN0SXRlcmFibGU8XG4gIHVua25vd24sXG4gIHVua25vd24sXG4gIE9wYXF1ZUl0ZXJhdGlvbkl0ZW0sXG4gIE9wYXF1ZVBhdGhSZWZlcmVuY2UsXG4gIE9wYXF1ZVBhdGhSZWZlcmVuY2Vcbj47XG5leHBvcnQgdHlwZSBPcGFxdWVQYXRoUmVmZXJlbmNlSXRlcmF0aW9uSXRlbSA9IEl0ZXJhdGlvbkl0ZW08XG4gIE9wYXF1ZVBhdGhSZWZlcmVuY2UsXG4gIE9wYXF1ZVBhdGhSZWZlcmVuY2Vcbj47XG5cbmV4cG9ydCBjbGFzcyBMaXN0SXRlbSBleHRlbmRzIExpc3ROb2RlPE9wYXF1ZVBhdGhSZWZlcmVuY2U+IGltcGxlbWVudHMgT3BhcXVlSXRlcmF0aW9uSXRlbSB7XG4gIHB1YmxpYyBrZXk6IHVua25vd247XG4gIHB1YmxpYyBtZW1vOiBPcGFxdWVQYXRoUmVmZXJlbmNlO1xuICBwdWJsaWMgcmV0YWluZWQgPSBmYWxzZTtcbiAgcHVibGljIHNlZW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBpdGVyYWJsZTogT3BhcXVlSXRlcmFibGU7XG5cbiAgY29uc3RydWN0b3IoaXRlcmFibGU6IE9wYXF1ZUl0ZXJhYmxlLCByZXN1bHQ6IE9wYXF1ZUl0ZXJhdGlvbkl0ZW0pIHtcbiAgICBzdXBlcihpdGVyYWJsZS52YWx1ZVJlZmVyZW5jZUZvcihyZXN1bHQpKTtcbiAgICB0aGlzLmtleSA9IHJlc3VsdC5rZXk7XG4gICAgdGhpcy5pdGVyYWJsZSA9IGl0ZXJhYmxlO1xuICAgIHRoaXMubWVtbyA9IGl0ZXJhYmxlLm1lbW9SZWZlcmVuY2VGb3IocmVzdWx0KTtcbiAgfVxuXG4gIHVwZGF0ZShpdGVtOiBPcGFxdWVJdGVyYXRpb25JdGVtKSB7XG4gICAgdGhpcy5yZXRhaW5lZCA9IHRydWU7XG4gICAgdGhpcy5pdGVyYWJsZS51cGRhdGVWYWx1ZVJlZmVyZW5jZSh0aGlzLnZhbHVlLCBpdGVtKTtcbiAgICB0aGlzLml0ZXJhYmxlLnVwZGF0ZU1lbW9SZWZlcmVuY2UodGhpcy5tZW1vLCBpdGVtKTtcbiAgfVxuXG4gIHNob3VsZFJlbW92ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMucmV0YWluZWQ7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLnJldGFpbmVkID0gZmFsc2U7XG4gICAgdGhpcy5zZWVuID0gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEl0ZXJhdGlvbkFydGlmYWN0cyB7XG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBwcml2YXRlIGl0ZXJhYmxlOiBPcGFxdWVJdGVyYWJsZTtcbiAgcHJpdmF0ZSBpdGVyYXRvcjogT3B0aW9uPE9wYXF1ZUl0ZXJhdG9yPiA9IG51bGw7XG4gIHByaXZhdGUgbWFwID0gbmV3IE1hcDx1bmtub3duLCBMaXN0SXRlbT4oKTtcbiAgcHJpdmF0ZSBsaXN0ID0gbmV3IExpbmtlZExpc3Q8TGlzdEl0ZW0+KCk7XG5cbiAgY29uc3RydWN0b3IoaXRlcmFibGU6IE9wYXF1ZUl0ZXJhYmxlKSB7XG4gICAgdGhpcy50YWcgPSBpdGVyYWJsZS50YWc7XG4gICAgdGhpcy5pdGVyYWJsZSA9IGl0ZXJhYmxlO1xuICB9XG5cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICBsZXQgaXRlcmF0b3IgPSAodGhpcy5pdGVyYXRvciA9IHRoaXMuaXRlcmFibGUuaXRlcmF0ZSgpKTtcbiAgICByZXR1cm4gaXRlcmF0b3IuaXNFbXB0eSgpO1xuICB9XG5cbiAgaXRlcmF0ZSgpOiBPcGFxdWVJdGVyYXRvciB7XG4gICAgbGV0IGl0ZXJhdG9yOiBPcGFxdWVJdGVyYXRvcjtcblxuICAgIGlmICh0aGlzLml0ZXJhdG9yID09PSBudWxsKSB7XG4gICAgICBpdGVyYXRvciA9IHRoaXMuaXRlcmFibGUuaXRlcmF0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRvciA9IHRoaXMuaXRlcmF0b3I7XG4gICAgfVxuXG4gICAgdGhpcy5pdGVyYXRvciA9IG51bGw7XG5cbiAgICByZXR1cm4gaXRlcmF0b3I7XG4gIH1cblxuICBhZHZhbmNlVG9LZXkoa2V5OiB1bmtub3duLCBjdXJyZW50OiBMaXN0SXRlbSk6IE9wdGlvbjxMaXN0SXRlbT4ge1xuICAgIGxldCBzZWVrID0gY3VycmVudDtcblxuICAgIHdoaWxlIChzZWVrICE9PSBudWxsICYmIHNlZWsua2V5ICE9PSBrZXkpIHtcbiAgICAgIHNlZWsgPSB0aGlzLmFkdmFuY2VOb2RlKHNlZWspO1xuICAgIH1cblxuICAgIHJldHVybiBzZWVrO1xuICB9XG5cbiAgaGFzKGtleTogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXMoa2V5KTtcbiAgfVxuXG4gIGdldChrZXk6IHVua25vd24pOiBMaXN0SXRlbSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmdldChrZXkpITtcbiAgfVxuXG4gIHdhc1NlZW4oa2V5OiB1bmtub3duKTogYm9vbGVhbiB7XG4gICAgbGV0IG5vZGUgPSB0aGlzLm1hcC5nZXQoa2V5KTtcbiAgICByZXR1cm4gbm9kZSAhPT0gdW5kZWZpbmVkICYmIG5vZGUuc2VlbjtcbiAgfVxuXG4gIHVwZGF0ZShpdGVtOiBPcGFxdWVJdGVyYXRpb25JdGVtKTogTGlzdEl0ZW0ge1xuICAgIGxldCBmb3VuZCA9IHRoaXMuZ2V0KGl0ZW0ua2V5KTtcbiAgICBmb3VuZC51cGRhdGUoaXRlbSk7XG4gICAgcmV0dXJuIGZvdW5kO1xuICB9XG5cbiAgYXBwZW5kKGl0ZW06IE9wYXF1ZUl0ZXJhdGlvbkl0ZW0pOiBMaXN0SXRlbSB7XG4gICAgbGV0IHsgbWFwLCBsaXN0LCBpdGVyYWJsZSB9ID0gdGhpcztcblxuICAgIGxldCBub2RlID0gbmV3IExpc3RJdGVtKGl0ZXJhYmxlLCBpdGVtKTtcbiAgICBtYXAuc2V0KGl0ZW0ua2V5LCBub2RlKTtcblxuICAgIGxpc3QuYXBwZW5kKG5vZGUpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgaW5zZXJ0QmVmb3JlKGl0ZW06IE9wYXF1ZUl0ZXJhdGlvbkl0ZW0sIHJlZmVyZW5jZTogT3B0aW9uPExpc3RJdGVtPik6IExpc3RJdGVtIHtcbiAgICBsZXQgeyBtYXAsIGxpc3QsIGl0ZXJhYmxlIH0gPSB0aGlzO1xuXG4gICAgbGV0IG5vZGUgPSBuZXcgTGlzdEl0ZW0oaXRlcmFibGUsIGl0ZW0pO1xuICAgIG1hcC5zZXQoaXRlbS5rZXksIG5vZGUpO1xuICAgIG5vZGUucmV0YWluZWQgPSB0cnVlO1xuICAgIGxpc3QuaW5zZXJ0QmVmb3JlKG5vZGUsIHJlZmVyZW5jZSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBtb3ZlKGl0ZW06IExpc3RJdGVtLCByZWZlcmVuY2U6IE9wdGlvbjxMaXN0SXRlbT4pOiB2b2lkIHtcbiAgICBsZXQgeyBsaXN0IH0gPSB0aGlzO1xuICAgIGl0ZW0ucmV0YWluZWQgPSB0cnVlO1xuICAgIGxpc3QucmVtb3ZlKGl0ZW0pO1xuICAgIGxpc3QuaW5zZXJ0QmVmb3JlKGl0ZW0sIHJlZmVyZW5jZSk7XG4gIH1cblxuICByZW1vdmUoaXRlbTogTGlzdEl0ZW0pOiB2b2lkIHtcbiAgICBsZXQgeyBsaXN0IH0gPSB0aGlzO1xuXG4gICAgbGlzdC5yZW1vdmUoaXRlbSk7XG4gICAgdGhpcy5tYXAuZGVsZXRlKGl0ZW0ua2V5KTtcbiAgfVxuXG4gIG5leHROb2RlKGl0ZW06IExpc3RJdGVtKTogTGlzdEl0ZW0ge1xuICAgIHJldHVybiB0aGlzLmxpc3QubmV4dE5vZGUoaXRlbSk7XG4gIH1cblxuICBhZHZhbmNlTm9kZShpdGVtOiBMaXN0SXRlbSk6IExpc3RJdGVtIHtcbiAgICBpdGVtLnNlZW4gPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmxpc3QubmV4dE5vZGUoaXRlbSk7XG4gIH1cblxuICBoZWFkKCk6IE9wdGlvbjxMaXN0SXRlbT4ge1xuICAgIHJldHVybiB0aGlzLmxpc3QuaGVhZCgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWZlcmVuY2VJdGVyYXRvciB7XG4gIHB1YmxpYyBhcnRpZmFjdHM6IEl0ZXJhdGlvbkFydGlmYWN0cztcbiAgcHJpdmF0ZSBpdGVyYXRvcjogT3B0aW9uPE9wYXF1ZUl0ZXJhdG9yPiA9IG51bGw7XG5cbiAgLy8gaWYgYW55b25lIG5lZWRzIHRvIGNvbnN0cnVjdCB0aGlzIG9iamVjdCB3aXRoIHNvbWV0aGluZyBvdGhlciB0aGFuXG4gIC8vIGFuIGl0ZXJhYmxlLCBsZXQgQHd5Y2F0cyBrbm93LlxuICBjb25zdHJ1Y3RvcihpdGVyYWJsZTogT3BhcXVlSXRlcmFibGUpIHtcbiAgICBsZXQgYXJ0aWZhY3RzID0gbmV3IEl0ZXJhdGlvbkFydGlmYWN0cyhpdGVyYWJsZSk7XG4gICAgdGhpcy5hcnRpZmFjdHMgPSBhcnRpZmFjdHM7XG4gIH1cblxuICBuZXh0KCk6IE9wdGlvbjxMaXN0SXRlbT4ge1xuICAgIGxldCB7IGFydGlmYWN0cyB9ID0gdGhpcztcblxuICAgIGxldCBpdGVyYXRvciA9ICh0aGlzLml0ZXJhdG9yID0gdGhpcy5pdGVyYXRvciB8fCBhcnRpZmFjdHMuaXRlcmF0ZSgpKTtcblxuICAgIGxldCBpdGVtID0gaXRlcmF0b3IubmV4dCgpO1xuXG4gICAgaWYgKGl0ZW0gPT09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgcmV0dXJuIGFydGlmYWN0cy5hcHBlbmQoaXRlbSk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRvclN5bmNocm9uaXplckRlbGVnYXRlPEVudj4ge1xuICByZXRhaW4oZW52OiBFbnYsIGtleTogdW5rbm93biwgaXRlbTogUGF0aFJlZmVyZW5jZTx1bmtub3duPiwgbWVtbzogUGF0aFJlZmVyZW5jZTx1bmtub3duPik6IHZvaWQ7XG4gIGluc2VydChcbiAgICBlbnY6IEVudixcbiAgICBrZXk6IHVua25vd24sXG4gICAgaXRlbTogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBtZW1vOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LFxuICAgIGJlZm9yZTogT3B0aW9uPHVua25vd24+XG4gICk6IHZvaWQ7XG4gIG1vdmUoXG4gICAgZW52OiBFbnYsXG4gICAga2V5OiB1bmtub3duLFxuICAgIGl0ZW06IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgbWVtbzogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBiZWZvcmU6IE9wdGlvbjx1bmtub3duPlxuICApOiB2b2lkO1xuICBkZWxldGUoZW52OiBFbnYsIGtleTogdW5rbm93bik6IHZvaWQ7XG4gIGRvbmUoZW52OiBFbnYpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhdG9yU3luY2hyb25pemVyT3B0aW9uczxFbnY+IHtcbiAgdGFyZ2V0OiBJdGVyYXRvclN5bmNocm9uaXplckRlbGVnYXRlPEVudj47XG4gIGFydGlmYWN0czogSXRlcmF0aW9uQXJ0aWZhY3RzO1xuICBlbnY6IEVudjtcbn1cblxuZW51bSBQaGFzZSB7XG4gIEFwcGVuZCxcbiAgUHJ1bmUsXG4gIERvbmUsXG59XG5cbmV4cG9ydCBjb25zdCBFTkQgPSAnRU5EIFsyNjAwYWJkZi04ODlmLTQ0MDYtYjA1OS1iNDRlY2JhZmE1YzVdJztcblxuZXhwb3J0IGNsYXNzIEl0ZXJhdG9yU3luY2hyb25pemVyPEVudj4ge1xuICBwcml2YXRlIHRhcmdldDogSXRlcmF0b3JTeW5jaHJvbml6ZXJEZWxlZ2F0ZTxFbnY+O1xuICBwcml2YXRlIGl0ZXJhdG9yOiBPcGFxdWVJdGVyYXRvcjtcbiAgcHJpdmF0ZSBjdXJyZW50OiBPcHRpb248TGlzdEl0ZW0+O1xuICBwcml2YXRlIGFydGlmYWN0czogSXRlcmF0aW9uQXJ0aWZhY3RzO1xuICBwcml2YXRlIGVudjogRW52O1xuXG4gIGNvbnN0cnVjdG9yKHsgdGFyZ2V0LCBhcnRpZmFjdHMsIGVudiB9OiBJdGVyYXRvclN5bmNocm9uaXplck9wdGlvbnM8RW52Pikge1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMuYXJ0aWZhY3RzID0gYXJ0aWZhY3RzO1xuICAgIHRoaXMuaXRlcmF0b3IgPSBhcnRpZmFjdHMuaXRlcmF0ZSgpO1xuICAgIHRoaXMuY3VycmVudCA9IGFydGlmYWN0cy5oZWFkKCk7XG4gICAgdGhpcy5lbnYgPSBlbnY7XG4gIH1cblxuICBzeW5jKCkge1xuICAgIGxldCBwaGFzZTogUGhhc2UgPSBQaGFzZS5BcHBlbmQ7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgc3dpdGNoIChwaGFzZSkge1xuICAgICAgICBjYXNlIFBoYXNlLkFwcGVuZDpcbiAgICAgICAgICBwaGFzZSA9IHRoaXMubmV4dEFwcGVuZCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFBoYXNlLlBydW5lOlxuICAgICAgICAgIHBoYXNlID0gdGhpcy5uZXh0UHJ1bmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQaGFzZS5Eb25lOlxuICAgICAgICAgIHRoaXMubmV4dERvbmUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZHZhbmNlVG9LZXkoa2V5OiB1bmtub3duKSB7XG4gICAgbGV0IHsgY3VycmVudCwgYXJ0aWZhY3RzIH0gPSB0aGlzO1xuXG4gICAgaWYgKGN1cnJlbnQgPT09IG51bGwpIHJldHVybjtcblxuICAgIGxldCBuZXh0ID0gYXJ0aWZhY3RzLmFkdmFuY2VOb2RlKGN1cnJlbnQpO1xuXG4gICAgaWYgKG5leHQua2V5ID09PSBrZXkpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IGFydGlmYWN0cy5hZHZhbmNlTm9kZShuZXh0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgc2VlayA9IGFydGlmYWN0cy5hZHZhbmNlVG9LZXkoa2V5LCBjdXJyZW50KTtcblxuICAgIGlmIChzZWVrKSB7XG4gICAgICB0aGlzLm1vdmUoc2VlaywgY3VycmVudCk7XG4gICAgICB0aGlzLmN1cnJlbnQgPSBhcnRpZmFjdHMubmV4dE5vZGUoY3VycmVudCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBtb3ZlKGl0ZW06IExpc3RJdGVtLCByZWZlcmVuY2U6IE9wdGlvbjxMaXN0SXRlbT4pIHtcbiAgICBpZiAoaXRlbS5uZXh0ICE9PSByZWZlcmVuY2UpIHtcbiAgICAgIHRoaXMuYXJ0aWZhY3RzLm1vdmUoaXRlbSwgcmVmZXJlbmNlKTtcbiAgICAgIHRoaXMudGFyZ2V0Lm1vdmUodGhpcy5lbnYsIGl0ZW0ua2V5LCBpdGVtLnZhbHVlLCBpdGVtLm1lbW8sIHJlZmVyZW5jZSA/IHJlZmVyZW5jZS5rZXkgOiBFTkQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbmV4dEFwcGVuZCgpOiBQaGFzZSB7XG4gICAgbGV0IHsgaXRlcmF0b3IsIGN1cnJlbnQsIGFydGlmYWN0cyB9ID0gdGhpcztcblxuICAgIGxldCBpdGVtID0gaXRlcmF0b3IubmV4dCgpO1xuXG4gICAgaWYgKGl0ZW0gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0UHJ1bmUoKTtcbiAgICB9XG5cbiAgICBsZXQgeyBrZXkgfSA9IGl0ZW07XG5cbiAgICBpZiAoY3VycmVudCAhPT0gbnVsbCAmJiBjdXJyZW50LmtleSA9PT0ga2V5KSB7XG4gICAgICB0aGlzLm5leHRSZXRhaW4oaXRlbSwgY3VycmVudCk7XG4gICAgfSBlbHNlIGlmIChhcnRpZmFjdHMuaGFzKGtleSkpIHtcbiAgICAgIHRoaXMubmV4dE1vdmUoaXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubmV4dEluc2VydChpdGVtKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUGhhc2UuQXBwZW5kO1xuICB9XG5cbiAgcHJpdmF0ZSBuZXh0UmV0YWluKGl0ZW06IE9wYXF1ZUl0ZXJhdGlvbkl0ZW0sIGN1cnJlbnQ6IExpc3RJdGVtKSB7XG4gICAgbGV0IHsgYXJ0aWZhY3RzIH0gPSB0aGlzO1xuXG4gICAgLy8gY3VycmVudCA9IGV4cGVjdChjdXJyZW50LCAnQlVHOiBjdXJyZW50IGlzIGVtcHR5Jyk7XG5cbiAgICBjdXJyZW50LnVwZGF0ZShpdGVtKTtcbiAgICB0aGlzLmN1cnJlbnQgPSBhcnRpZmFjdHMubmV4dE5vZGUoY3VycmVudCk7XG4gICAgdGhpcy50YXJnZXQucmV0YWluKHRoaXMuZW52LCBpdGVtLmtleSwgY3VycmVudC52YWx1ZSwgY3VycmVudC5tZW1vKTtcbiAgfVxuXG4gIHByaXZhdGUgbmV4dE1vdmUoaXRlbTogT3BhcXVlSXRlcmF0aW9uSXRlbSkge1xuICAgIGxldCB7IGN1cnJlbnQsIGFydGlmYWN0cyB9ID0gdGhpcztcbiAgICBsZXQgeyBrZXkgfSA9IGl0ZW07XG5cbiAgICBsZXQgZm91bmQgPSBhcnRpZmFjdHMudXBkYXRlKGl0ZW0pO1xuXG4gICAgaWYgKGFydGlmYWN0cy53YXNTZWVuKGtleSkpIHtcbiAgICAgIHRoaXMubW92ZShmb3VuZCwgY3VycmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWR2YW5jZVRvS2V5KGtleSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBuZXh0SW5zZXJ0KGl0ZW06IE9wYXF1ZUl0ZXJhdGlvbkl0ZW0pIHtcbiAgICBsZXQgeyBhcnRpZmFjdHMsIHRhcmdldCwgY3VycmVudCB9ID0gdGhpcztcblxuICAgIGxldCBub2RlID0gYXJ0aWZhY3RzLmluc2VydEJlZm9yZShpdGVtLCBjdXJyZW50KTtcbiAgICB0YXJnZXQuaW5zZXJ0KHRoaXMuZW52LCBub2RlLmtleSwgbm9kZS52YWx1ZSwgbm9kZS5tZW1vLCBjdXJyZW50ID8gY3VycmVudC5rZXkgOiBudWxsKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhcnRQcnVuZSgpOiBQaGFzZSB7XG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5hcnRpZmFjdHMuaGVhZCgpO1xuICAgIHJldHVybiBQaGFzZS5QcnVuZTtcbiAgfVxuXG4gIHByaXZhdGUgbmV4dFBydW5lKCk6IFBoYXNlIHtcbiAgICBsZXQgeyBhcnRpZmFjdHMsIHRhcmdldCwgY3VycmVudCB9ID0gdGhpcztcblxuICAgIGlmIChjdXJyZW50ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gUGhhc2UuRG9uZTtcbiAgICB9XG5cbiAgICBsZXQgbm9kZSA9IGN1cnJlbnQ7XG4gICAgdGhpcy5jdXJyZW50ID0gYXJ0aWZhY3RzLm5leHROb2RlKG5vZGUpO1xuXG4gICAgaWYgKG5vZGUuc2hvdWxkUmVtb3ZlKCkpIHtcbiAgICAgIGFydGlmYWN0cy5yZW1vdmUobm9kZSk7XG4gICAgICB0YXJnZXQuZGVsZXRlKHRoaXMuZW52LCBub2RlLmtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUucmVzZXQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUGhhc2UuUHJ1bmU7XG4gIH1cblxuICBwcml2YXRlIG5leHREb25lKCkge1xuICAgIHRoaXMudGFyZ2V0LmRvbmUodGhpcy5lbnYpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9