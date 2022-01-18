"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ListBlockOpcode = exports.TryOpcode = exports.BlockOpcode = exports.ResumableVMStateImpl = undefined;

var _reference = require("@glimmer/reference");

var _util = require("@glimmer/util");

var _bounds = require("../bounds");

var _lifetime = require("../lifetime");

var _opcodes = require("../opcodes");

var _elementBuilder = require("./element-builder");

function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
        var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
        }
    }return obj;
}

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

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

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var UpdatingVM = function () {
    function UpdatingVM(env, _ref) {
        var _ref$alwaysRevalidate = _ref.alwaysRevalidate,
            alwaysRevalidate = _ref$alwaysRevalidate === undefined ? false : _ref$alwaysRevalidate;

        _classCallCheck(this, UpdatingVM);

        this.frameStack = new _util.Stack();
        this.env = env;
        this.dom = env.getDOM();
        this.alwaysRevalidate = alwaysRevalidate;
    }

    UpdatingVM.prototype.execute = function execute(opcodes, handler) {
        var frameStack = this.frameStack;

        this.try(opcodes, handler);
        while (true) {
            if (frameStack.isEmpty()) break;
            var opcode = this.frame.nextStatement();
            if (opcode === null) {
                frameStack.pop();
                continue;
            }
            opcode.evaluate(this);
        }
    };

    UpdatingVM.prototype.goto = function goto(op) {
        this.frame.goto(op);
    };

    UpdatingVM.prototype.try = function _try(ops, handler) {
        this.frameStack.push(new UpdatingVMFrame(ops, handler));
    };

    UpdatingVM.prototype.throw = function _throw() {
        this.frame.handleException();
        this.frameStack.pop();
    };

    _createClass(UpdatingVM, [{
        key: 'frame',
        get: function get() {
            return this.frameStack.current;
        }
    }]);

    return UpdatingVM;
}();

exports.default = UpdatingVM;
var ResumableVMStateImpl = exports.ResumableVMStateImpl = function () {
    function ResumableVMStateImpl(state, resumeCallback) {
        _classCallCheck(this, ResumableVMStateImpl);

        this.state = state;
        this.resumeCallback = resumeCallback;
    }

    ResumableVMStateImpl.prototype.resume = function resume(runtime, builder) {
        return this.resumeCallback(runtime, this.state, builder);
    };

    return ResumableVMStateImpl;
}();
var BlockOpcode = exports.BlockOpcode = function (_UpdatingOpcode) {
    _inherits(BlockOpcode, _UpdatingOpcode);

    function BlockOpcode(state, runtime, bounds, children) {
        _classCallCheck(this, BlockOpcode);

        var _this = _possibleConstructorReturn(this, _UpdatingOpcode.call(this));

        _this.state = state;
        _this.runtime = runtime;
        _this.type = 'block';
        _this.next = null;
        _this.prev = null;
        _this.children = children;
        _this.bounds = bounds;
        return _this;
    }

    BlockOpcode.prototype.parentElement = function parentElement() {
        return this.bounds.parentElement();
    };

    BlockOpcode.prototype.firstNode = function firstNode() {
        return this.bounds.firstNode();
    };

    BlockOpcode.prototype.lastNode = function lastNode() {
        return this.bounds.lastNode();
    };

    BlockOpcode.prototype.evaluate = function evaluate(vm) {
        vm.try(this.children, null);
    };

    return BlockOpcode;
}(_opcodes.UpdatingOpcode);
var TryOpcode = exports.TryOpcode = function (_BlockOpcode) {
    _inherits(TryOpcode, _BlockOpcode);

    function TryOpcode(state, runtime, bounds, children) {
        _classCallCheck(this, TryOpcode);

        var _this2 = _possibleConstructorReturn(this, _BlockOpcode.call(this, state, runtime, bounds, children));

        _this2.type = 'try';
        _this2.tag = _this2._tag = (0, _reference.createUpdatableTag)();
        return _this2;
    }

    TryOpcode.prototype.didInitializeChildren = function didInitializeChildren() {
        (0, _reference.update)(this._tag, (0, _reference.combineSlice)(this.children));
    };

    TryOpcode.prototype.evaluate = function evaluate(vm) {
        vm.try(this.children, this);
    };

    TryOpcode.prototype.handleException = function handleException() {
        var _this3 = this;

        var state = this.state,
            bounds = this.bounds,
            children = this.children,
            prev = this.prev,
            next = this.next,
            runtime = this.runtime;

        children.clear();
        (0, _lifetime.asyncReset)(this, runtime.env);
        var elementStack = _elementBuilder.NewElementBuilder.resume(runtime.env, bounds);
        var vm = state.resume(runtime, elementStack);
        var updating = new _util.LinkedList();
        var result = vm.execute(function (vm) {
            vm.pushUpdating(updating);
            vm.updateWith(_this3);
            vm.pushUpdating(children);
        });
        (0, _util.associate)(this, result.drop);
        this.prev = prev;
        this.next = next;
    };

    return TryOpcode;
}(BlockOpcode);

var ListRevalidationDelegate = function () {
    function ListRevalidationDelegate(opcode, marker) {
        _classCallCheck(this, ListRevalidationDelegate);

        this.opcode = opcode;
        this.marker = marker;
        this.didInsert = false;
        this.didDelete = false;
        this.map = opcode.map;
        this.updating = opcode['children'];
    }

    ListRevalidationDelegate.prototype.insert = function insert(_env, key, item, memo, before) {
        var map = this.map,
            opcode = this.opcode,
            updating = this.updating;

        var nextSibling = null;
        var reference = null;
        if (typeof before === 'string') {
            reference = map.get(before);
            nextSibling = reference['bounds'].firstNode();
        } else {
            nextSibling = this.marker;
        }
        var vm = opcode.vmForInsertion(nextSibling);
        var tryOpcode = null;
        vm.execute(function (vm) {
            tryOpcode = vm.iterate(memo, item);
            map.set(key, tryOpcode);
            vm.pushUpdating(new _util.LinkedList());
            vm.updateWith(tryOpcode);
            vm.pushUpdating(tryOpcode.children);
        });
        updating.insertBefore(tryOpcode, reference);
        this.didInsert = true;
    };

    ListRevalidationDelegate.prototype.retain = function retain(_env, _key, _item, _memo) {};

    ListRevalidationDelegate.prototype.move = function move(_env, key, _item, _memo, before) {
        var map = this.map,
            updating = this.updating;

        var entry = map.get(key);
        if (before === _reference.END) {
            (0, _bounds.move)(entry, this.marker);
            updating.remove(entry);
            updating.append(entry);
        } else {
            var reference = map.get(before);
            (0, _bounds.move)(entry, reference.firstNode());
            updating.remove(entry);
            updating.insertBefore(entry, reference);
        }
    };

    ListRevalidationDelegate.prototype.delete = function _delete(env, key) {
        var map = this.map,
            updating = this.updating;

        var opcode = map.get(key);
        (0, _lifetime.detach)(opcode, env);
        updating.remove(opcode);
        map.delete(key);
        this.didDelete = true;
    };

    ListRevalidationDelegate.prototype.done = function done() {
        this.opcode.didInitializeChildren(this.didInsert || this.didDelete);
    };

    return ListRevalidationDelegate;
}();

var ListBlockOpcode = exports.ListBlockOpcode = function (_BlockOpcode2) {
    _inherits(ListBlockOpcode, _BlockOpcode2);

    function ListBlockOpcode(state, runtime, bounds, children, artifacts) {
        _classCallCheck(this, ListBlockOpcode);

        var _this4 = _possibleConstructorReturn(this, _BlockOpcode2.call(this, state, runtime, bounds, children));

        _this4.type = 'list-block';
        _this4.map = new Map();
        _this4.lastIterated = _reference.INITIAL;
        _this4.artifacts = artifacts;
        var _tag = _this4._tag = (0, _reference.createUpdatableTag)();
        _this4.tag = (0, _reference.combine)([artifacts.tag, _tag]);
        return _this4;
    }

    ListBlockOpcode.prototype.didInitializeChildren = function didInitializeChildren() {
        var listDidChange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        this.lastIterated = (0, _reference.value)(this.artifacts.tag);
        if (listDidChange) {
            (0, _reference.update)(this._tag, (0, _reference.combineSlice)(this.children));
        }
    };

    ListBlockOpcode.prototype.evaluate = function evaluate(vm) {
        var artifacts = this.artifacts,
            lastIterated = this.lastIterated;

        if (!(0, _reference.validate)(artifacts.tag, lastIterated)) {
            var bounds = this.bounds;
            var dom = vm.dom;

            var marker = dom.createComment('');
            dom.insertAfter(bounds.parentElement(), marker, bounds.lastNode());
            var target = new ListRevalidationDelegate(this, marker);
            var synchronizer = new _reference.IteratorSynchronizer({ target: target, artifacts: artifacts, env: vm.env });
            synchronizer.sync();
            this.parentElement().removeChild(marker);
        }
        // Run now-updated updating opcodes
        _BlockOpcode2.prototype.evaluate.call(this, vm);
    };

    ListBlockOpcode.prototype.vmForInsertion = function vmForInsertion(nextSibling) {
        var bounds = this.bounds,
            state = this.state,
            runtime = this.runtime;

        var elementStack = _elementBuilder.NewElementBuilder.forInitialRender(runtime.env, {
            element: bounds.parentElement(),
            nextSibling: nextSibling
        });
        return state.resume(runtime, elementStack);
    };

    return ListBlockOpcode;
}(BlockOpcode);

var UpdatingVMFrame = function () {
    function UpdatingVMFrame(ops, exceptionHandler) {
        _classCallCheck(this, UpdatingVMFrame);

        this.ops = ops;
        this.exceptionHandler = exceptionHandler;
        this.current = ops.head();
    }

    UpdatingVMFrame.prototype.goto = function goto(op) {
        this.current = op;
    };

    UpdatingVMFrame.prototype.nextStatement = function nextStatement() {
        var current = this.current,
            ops = this.ops;

        if (current) this.current = ops.nextNode(current);
        return current;
    };

    UpdatingVMFrame.prototype.handleException = function handleException() {
        if (this.exceptionHandler) {
            this.exceptionHandler.handleException();
        }
    };

    return UpdatingVMFrame;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL3VwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBZUE7O0FBa0JBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVjLGE7QUFPWixhQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQSxFQUEwRDtBQUFBLFlBQUEsd0JBQUEsS0FBMUIsZ0JBQTBCO0FBQUEsWUFBMUIsbUJBQTBCLDBCQUFBLFNBQUEsR0FBMUQsS0FBMEQsR0FBQSxxQkFBQTs7QUFBQSx3QkFBQSxJQUFBLEVBQUEsVUFBQTs7QUFGbEQsYUFBQSxVQUFBLEdBQXFDLElBQXJDLFdBQXFDLEVBQXJDO0FBR04sYUFBQSxHQUFBLEdBQUEsR0FBQTtBQUNBLGFBQUEsR0FBQSxHQUFXLElBQVgsTUFBVyxFQUFYO0FBQ0EsYUFBQSxnQkFBQSxHQUFBLGdCQUFBO0FBQ0Q7O3lCQUVELE8sb0JBQUEsTyxFQUFBLE8sRUFBeUQ7QUFBQSxZQUFBLGFBQUEsS0FBQSxVQUFBOztBQUd2RCxhQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsT0FBQTtBQUVBLGVBQUEsSUFBQSxFQUFhO0FBQ1gsZ0JBQUksV0FBSixPQUFJLEVBQUosRUFBMEI7QUFFMUIsZ0JBQUksU0FBUyxLQUFBLEtBQUEsQ0FBYixhQUFhLEVBQWI7QUFFQSxnQkFBSSxXQUFKLElBQUEsRUFBcUI7QUFDbkIsMkJBQUEsR0FBQTtBQUNBO0FBQ0Q7QUFFRCxtQkFBQSxRQUFBLENBQUEsSUFBQTtBQUNEOzs7eUJBT0gsSSxpQkFBQSxFLEVBQXVCO0FBQ3JCLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBOzs7eUJBR0YsRyxpQkFBQSxHLEVBQUEsTyxFQUF5RDtBQUN2RCxhQUFBLFVBQUEsQ0FBQSxJQUFBLENBQXFCLElBQUEsZUFBQSxDQUFBLEdBQUEsRUFBckIsT0FB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ZSxJQUFBLFFBQUEsQ0FBZixPQUFlLENBQWY7QUFDYixlQUFBLE9BQUE7Ozs4QkFHRixlLDhCQUFlO0FBQ2IsWUFBSSxLQUFKLGdCQUFBLEVBQTJCO0FBQ3pCLGlCQUFBLGdCQUFBLENBQUEsZUFBQTtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQm91bmRzLFxuICBEeW5hbWljU2NvcGUsXG4gIEVudmlyb25tZW50LFxuICBFeGNlcHRpb25IYW5kbGVyLFxuICBHbGltbWVyVHJlZUNoYW5nZXMsXG4gIEppdE9yQW90QmxvY2ssXG4gIFJ1bnRpbWVDb250ZXh0LFxuICBTY29wZSxcbiAgQW90UnVudGltZUNvbnRleHQsXG4gIEppdFJ1bnRpbWVDb250ZXh0LFxuICBFbGVtZW50QnVpbGRlcixcbiAgTGl2ZUJsb2NrLFxuICBVcGRhdGFibGVCbG9jayxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQge1xuICAvLyBUYWdzXG4gIGNvbWJpbmUsXG4gIHZhbHVlLFxuICB1cGRhdGUsXG4gIHZhbGlkYXRlLFxuICBjcmVhdGVVcGRhdGFibGVUYWcsXG4gIFRhZyxcbiAgVXBkYXRhYmxlVGFnLFxuICBSZXZpc2lvbixcbiAgY29tYmluZVNsaWNlLFxuICBJTklUSUFMLFxuICBJdGVyYXRpb25BcnRpZmFjdHMsXG4gIEl0ZXJhdG9yU3luY2hyb25pemVyLFxuICBJdGVyYXRvclN5bmNocm9uaXplckRlbGVnYXRlLFxuICBQYXRoUmVmZXJlbmNlLFxuICBFTkQsXG59IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBhc3NvY2lhdGUsIGV4cGVjdCwgTGlua2VkTGlzdCwgT3B0aW9uLCBTdGFjayB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgU2ltcGxlQ29tbWVudCwgU2ltcGxlTm9kZSB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBtb3ZlIGFzIG1vdmVCb3VuZHMgfSBmcm9tICcuLi9ib3VuZHMnO1xuaW1wb3J0IHsgYXN5bmNSZXNldCwgZGV0YWNoIH0gZnJvbSAnLi4vbGlmZXRpbWUnO1xuaW1wb3J0IHsgVXBkYXRpbmdPcGNvZGUsIFVwZGF0aW5nT3BTZXEgfSBmcm9tICcuLi9vcGNvZGVzJztcbmltcG9ydCB7IEludGVybmFsVk0sIFZtSW5pdENhbGxiYWNrLCBKaXRWTSB9IGZyb20gJy4vYXBwZW5kJztcbmltcG9ydCB7IE5ld0VsZW1lbnRCdWlsZGVyIH0gZnJvbSAnLi9lbGVtZW50LWJ1aWxkZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVcGRhdGluZ1ZNIHtcbiAgcHVibGljIGVudjogRW52aXJvbm1lbnQ7XG4gIHB1YmxpYyBkb206IEdsaW1tZXJUcmVlQ2hhbmdlcztcbiAgcHVibGljIGFsd2F5c1JldmFsaWRhdGU6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBmcmFtZVN0YWNrOiBTdGFjazxVcGRhdGluZ1ZNRnJhbWU+ID0gbmV3IFN0YWNrPFVwZGF0aW5nVk1GcmFtZT4oKTtcblxuICBjb25zdHJ1Y3RvcihlbnY6IEVudmlyb25tZW50LCB7IGFsd2F5c1JldmFsaWRhdGUgPSBmYWxzZSB9KSB7XG4gICAgdGhpcy5lbnYgPSBlbnY7XG4gICAgdGhpcy5kb20gPSBlbnYuZ2V0RE9NKCk7XG4gICAgdGhpcy5hbHdheXNSZXZhbGlkYXRlID0gYWx3YXlzUmV2YWxpZGF0ZTtcbiAgfVxuXG4gIGV4ZWN1dGUob3Bjb2RlczogVXBkYXRpbmdPcFNlcSwgaGFuZGxlcjogRXhjZXB0aW9uSGFuZGxlcikge1xuICAgIGxldCB7IGZyYW1lU3RhY2sgfSA9IHRoaXM7XG5cbiAgICB0aGlzLnRyeShvcGNvZGVzLCBoYW5kbGVyKTtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoZnJhbWVTdGFjay5pc0VtcHR5KCkpIGJyZWFrO1xuXG4gICAgICBsZXQgb3Bjb2RlID0gdGhpcy5mcmFtZS5uZXh0U3RhdGVtZW50KCk7XG5cbiAgICAgIGlmIChvcGNvZGUgPT09IG51bGwpIHtcbiAgICAgICAgZnJhbWVTdGFjay5wb3AoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIG9wY29kZS5ldmFsdWF0ZSh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldCBmcmFtZSgpIHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXMuZnJhbWVTdGFjay5jdXJyZW50LCAnYnVnOiBleHBlY3RlZCBhIGZyYW1lJyk7XG4gIH1cblxuICBnb3RvKG9wOiBVcGRhdGluZ09wY29kZSkge1xuICAgIHRoaXMuZnJhbWUuZ290byhvcCk7XG4gIH1cblxuICB0cnkob3BzOiBVcGRhdGluZ09wU2VxLCBoYW5kbGVyOiBPcHRpb248RXhjZXB0aW9uSGFuZGxlcj4pIHtcbiAgICB0aGlzLmZyYW1lU3RhY2sucHVzaChuZXcgVXBkYXRpbmdWTUZyYW1lKG9wcywgaGFuZGxlcikpO1xuICB9XG5cbiAgdGhyb3coKSB7XG4gICAgdGhpcy5mcmFtZS5oYW5kbGVFeGNlcHRpb24oKTtcbiAgICB0aGlzLmZyYW1lU3RhY2sucG9wKCk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBWTVN0YXRlIHtcbiAgcmVhZG9ubHkgcGM6IG51bWJlcjtcbiAgcmVhZG9ubHkgc2NvcGU6IFNjb3BlPEppdE9yQW90QmxvY2s+O1xuICByZWFkb25seSBkeW5hbWljU2NvcGU6IER5bmFtaWNTY29wZTtcbiAgcmVhZG9ubHkgc3RhY2s6IHVua25vd25bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXN1bWFibGVWTVN0YXRlPFYgZXh0ZW5kcyBJbnRlcm5hbFZNPiB7XG4gIHJlc3VtZShydW50aW1lOiBSdW50aW1lQ29udGV4dCwgYnVpbGRlcjogRWxlbWVudEJ1aWxkZXIpOiBWO1xufVxuXG5leHBvcnQgY2xhc3MgUmVzdW1hYmxlVk1TdGF0ZUltcGw8ViBleHRlbmRzIEludGVybmFsVk0+IGltcGxlbWVudHMgUmVzdW1hYmxlVk1TdGF0ZTxWPiB7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHN0YXRlOiBWTVN0YXRlLCBwcml2YXRlIHJlc3VtZUNhbGxiYWNrOiBWbUluaXRDYWxsYmFjazxWPikge31cblxuICByZXN1bWUoXG4gICAgcnVudGltZTogViBleHRlbmRzIEppdFZNID8gSml0UnVudGltZUNvbnRleHQgOiBBb3RSdW50aW1lQ29udGV4dCxcbiAgICBidWlsZGVyOiBFbGVtZW50QnVpbGRlclxuICApOiBWIHtcbiAgICByZXR1cm4gdGhpcy5yZXN1bWVDYWxsYmFjayhydW50aW1lLCB0aGlzLnN0YXRlLCBidWlsZGVyKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmxvY2tPcGNvZGUgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSBpbXBsZW1lbnRzIEJvdW5kcyB7XG4gIHB1YmxpYyB0eXBlID0gJ2Jsb2NrJztcbiAgcHVibGljIG5leHQgPSBudWxsO1xuICBwdWJsaWMgcHJldiA9IG51bGw7XG4gIHJlYWRvbmx5IGNoaWxkcmVuOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPjtcblxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgYm91bmRzOiBMaXZlQmxvY2s7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIHN0YXRlOiBSZXN1bWFibGVWTVN0YXRlPEludGVybmFsVk0+LFxuICAgIHByb3RlY3RlZCBydW50aW1lOiBSdW50aW1lQ29udGV4dCxcbiAgICBib3VuZHM6IExpdmVCbG9jayxcbiAgICBjaGlsZHJlbjogTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT5cbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcbiAgfVxuXG4gIGFic3RyYWN0IGRpZEluaXRpYWxpemVDaGlsZHJlbigpOiB2b2lkO1xuXG4gIHBhcmVudEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLnBhcmVudEVsZW1lbnQoKTtcbiAgfVxuXG4gIGZpcnN0Tm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMuZmlyc3ROb2RlKCk7XG4gIH1cblxuICBsYXN0Tm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMubGFzdE5vZGUoKTtcbiAgfVxuXG4gIGV2YWx1YXRlKHZtOiBVcGRhdGluZ1ZNKSB7XG4gICAgdm0udHJ5KHRoaXMuY2hpbGRyZW4sIG51bGwpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcnlPcGNvZGUgZXh0ZW5kcyBCbG9ja09wY29kZSBpbXBsZW1lbnRzIEV4Y2VwdGlvbkhhbmRsZXIge1xuICBwdWJsaWMgdHlwZSA9ICd0cnknO1xuXG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBwcml2YXRlIF90YWc6IFVwZGF0YWJsZVRhZztcblxuICBwcm90ZWN0ZWQgYm91bmRzITogVXBkYXRhYmxlQmxvY2s7IC8vIEhpZGVzIHByb3BlcnR5IG9uIGJhc2UgY2xhc3NcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzdGF0ZTogUmVzdW1hYmxlVk1TdGF0ZTxJbnRlcm5hbFZNPixcbiAgICBydW50aW1lOiBSdW50aW1lQ29udGV4dCxcbiAgICBib3VuZHM6IFVwZGF0YWJsZUJsb2NrLFxuICAgIGNoaWxkcmVuOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPlxuICApIHtcbiAgICBzdXBlcihzdGF0ZSwgcnVudGltZSwgYm91bmRzLCBjaGlsZHJlbik7XG4gICAgdGhpcy50YWcgPSB0aGlzLl90YWcgPSBjcmVhdGVVcGRhdGFibGVUYWcoKTtcbiAgfVxuXG4gIGRpZEluaXRpYWxpemVDaGlsZHJlbigpIHtcbiAgICB1cGRhdGUodGhpcy5fdGFnLCBjb21iaW5lU2xpY2UodGhpcy5jaGlsZHJlbikpO1xuICB9XG5cbiAgZXZhbHVhdGUodm06IFVwZGF0aW5nVk0pIHtcbiAgICB2bS50cnkodGhpcy5jaGlsZHJlbiwgdGhpcyk7XG4gIH1cblxuICBoYW5kbGVFeGNlcHRpb24oKSB7XG4gICAgbGV0IHsgc3RhdGUsIGJvdW5kcywgY2hpbGRyZW4sIHByZXYsIG5leHQsIHJ1bnRpbWUgfSA9IHRoaXM7XG5cbiAgICBjaGlsZHJlbi5jbGVhcigpO1xuICAgIGFzeW5jUmVzZXQodGhpcywgcnVudGltZS5lbnYpO1xuXG4gICAgbGV0IGVsZW1lbnRTdGFjayA9IE5ld0VsZW1lbnRCdWlsZGVyLnJlc3VtZShydW50aW1lLmVudiwgYm91bmRzKTtcbiAgICBsZXQgdm0gPSBzdGF0ZS5yZXN1bWUocnVudGltZSwgZWxlbWVudFN0YWNrKTtcblxuICAgIGxldCB1cGRhdGluZyA9IG5ldyBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPigpO1xuXG4gICAgbGV0IHJlc3VsdCA9IHZtLmV4ZWN1dGUodm0gPT4ge1xuICAgICAgdm0ucHVzaFVwZGF0aW5nKHVwZGF0aW5nKTtcbiAgICAgIHZtLnVwZGF0ZVdpdGgodGhpcyk7XG4gICAgICB2bS5wdXNoVXBkYXRpbmcoY2hpbGRyZW4pO1xuICAgIH0pO1xuXG4gICAgYXNzb2NpYXRlKHRoaXMsIHJlc3VsdC5kcm9wKTtcblxuICAgIHRoaXMucHJldiA9IHByZXY7XG4gICAgdGhpcy5uZXh0ID0gbmV4dDtcbiAgfVxufVxuXG5jbGFzcyBMaXN0UmV2YWxpZGF0aW9uRGVsZWdhdGUgaW1wbGVtZW50cyBJdGVyYXRvclN5bmNocm9uaXplckRlbGVnYXRlPEVudmlyb25tZW50PiB7XG4gIHByaXZhdGUgbWFwOiBNYXA8dW5rbm93biwgQmxvY2tPcGNvZGU+O1xuICBwcml2YXRlIHVwZGF0aW5nOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPjtcblxuICBwcml2YXRlIGRpZEluc2VydCA9IGZhbHNlO1xuICBwcml2YXRlIGRpZERlbGV0ZSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgb3Bjb2RlOiBMaXN0QmxvY2tPcGNvZGUsIHByaXZhdGUgbWFya2VyOiBTaW1wbGVDb21tZW50KSB7XG4gICAgdGhpcy5tYXAgPSBvcGNvZGUubWFwO1xuICAgIHRoaXMudXBkYXRpbmcgPSBvcGNvZGVbJ2NoaWxkcmVuJ107XG4gIH1cblxuICBpbnNlcnQoXG4gICAgX2VudjogRW52aXJvbm1lbnQsXG4gICAga2V5OiB1bmtub3duLFxuICAgIGl0ZW06IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgbWVtbzogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBiZWZvcmU6IHVua25vd25cbiAgKSB7XG4gICAgbGV0IHsgbWFwLCBvcGNvZGUsIHVwZGF0aW5nIH0gPSB0aGlzO1xuICAgIGxldCBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+ID0gbnVsbDtcbiAgICBsZXQgcmVmZXJlbmNlOiBPcHRpb248QmxvY2tPcGNvZGU+ID0gbnVsbDtcblxuICAgIGlmICh0eXBlb2YgYmVmb3JlID09PSAnc3RyaW5nJykge1xuICAgICAgcmVmZXJlbmNlID0gbWFwLmdldChiZWZvcmUpITtcbiAgICAgIG5leHRTaWJsaW5nID0gcmVmZXJlbmNlWydib3VuZHMnXS5maXJzdE5vZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dFNpYmxpbmcgPSB0aGlzLm1hcmtlcjtcbiAgICB9XG5cbiAgICBsZXQgdm0gPSBvcGNvZGUudm1Gb3JJbnNlcnRpb24obmV4dFNpYmxpbmcpO1xuICAgIGxldCB0cnlPcGNvZGU6IE9wdGlvbjxUcnlPcGNvZGU+ID0gbnVsbDtcblxuICAgIHZtLmV4ZWN1dGUodm0gPT4ge1xuICAgICAgdHJ5T3Bjb2RlID0gdm0uaXRlcmF0ZShtZW1vLCBpdGVtKTtcbiAgICAgIG1hcC5zZXQoa2V5LCB0cnlPcGNvZGUpO1xuICAgICAgdm0ucHVzaFVwZGF0aW5nKG5ldyBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPigpKTtcbiAgICAgIHZtLnVwZGF0ZVdpdGgodHJ5T3Bjb2RlKTtcbiAgICAgIHZtLnB1c2hVcGRhdGluZyh0cnlPcGNvZGUuY2hpbGRyZW4pO1xuICAgIH0pO1xuXG4gICAgdXBkYXRpbmcuaW5zZXJ0QmVmb3JlKHRyeU9wY29kZSEsIHJlZmVyZW5jZSk7XG5cbiAgICB0aGlzLmRpZEluc2VydCA9IHRydWU7XG4gIH1cblxuICByZXRhaW4oXG4gICAgX2VudjogRW52aXJvbm1lbnQsXG4gICAgX2tleTogdW5rbm93bixcbiAgICBfaXRlbTogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBfbWVtbzogUGF0aFJlZmVyZW5jZTx1bmtub3duPlxuICApIHt9XG5cbiAgbW92ZShcbiAgICBfZW52OiBFbnZpcm9ubWVudCxcbiAgICBrZXk6IHVua25vd24sXG4gICAgX2l0ZW06IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgX21lbW86IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgYmVmb3JlOiB1bmtub3duXG4gICkge1xuICAgIGxldCB7IG1hcCwgdXBkYXRpbmcgfSA9IHRoaXM7XG5cbiAgICBsZXQgZW50cnkgPSBtYXAuZ2V0KGtleSkhO1xuXG4gICAgaWYgKGJlZm9yZSA9PT0gRU5EKSB7XG4gICAgICBtb3ZlQm91bmRzKGVudHJ5LCB0aGlzLm1hcmtlcik7XG4gICAgICB1cGRhdGluZy5yZW1vdmUoZW50cnkpO1xuICAgICAgdXBkYXRpbmcuYXBwZW5kKGVudHJ5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJlZmVyZW5jZSA9IG1hcC5nZXQoYmVmb3JlKSE7XG4gICAgICBtb3ZlQm91bmRzKGVudHJ5LCByZWZlcmVuY2UuZmlyc3ROb2RlKCkpO1xuICAgICAgdXBkYXRpbmcucmVtb3ZlKGVudHJ5KTtcbiAgICAgIHVwZGF0aW5nLmluc2VydEJlZm9yZShlbnRyeSwgcmVmZXJlbmNlKTtcbiAgICB9XG4gIH1cblxuICBkZWxldGUoZW52OiBFbnZpcm9ubWVudCwga2V5OiB1bmtub3duKSB7XG4gICAgbGV0IHsgbWFwLCB1cGRhdGluZyB9ID0gdGhpcztcbiAgICBsZXQgb3Bjb2RlID0gbWFwLmdldChrZXkpITtcbiAgICBkZXRhY2gob3Bjb2RlLCBlbnYpO1xuICAgIHVwZGF0aW5nLnJlbW92ZShvcGNvZGUpO1xuICAgIG1hcC5kZWxldGUoa2V5KTtcblxuICAgIHRoaXMuZGlkRGVsZXRlID0gdHJ1ZTtcbiAgfVxuXG4gIGRvbmUoKSB7XG4gICAgdGhpcy5vcGNvZGUuZGlkSW5pdGlhbGl6ZUNoaWxkcmVuKHRoaXMuZGlkSW5zZXJ0IHx8IHRoaXMuZGlkRGVsZXRlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTGlzdEJsb2NrT3Bjb2RlIGV4dGVuZHMgQmxvY2tPcGNvZGUge1xuICBwdWJsaWMgdHlwZSA9ICdsaXN0LWJsb2NrJztcbiAgcHVibGljIG1hcCA9IG5ldyBNYXA8dW5rbm93biwgQmxvY2tPcGNvZGU+KCk7XG4gIHB1YmxpYyBhcnRpZmFjdHM6IEl0ZXJhdGlvbkFydGlmYWN0cztcbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIHByaXZhdGUgbGFzdEl0ZXJhdGVkOiBSZXZpc2lvbiA9IElOSVRJQUw7XG4gIHByaXZhdGUgX3RhZzogVXBkYXRhYmxlVGFnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHN0YXRlOiBSZXN1bWFibGVWTVN0YXRlPEludGVybmFsVk0+LFxuICAgIHJ1bnRpbWU6IFJ1bnRpbWVDb250ZXh0LFxuICAgIGJvdW5kczogTGl2ZUJsb2NrLFxuICAgIGNoaWxkcmVuOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPixcbiAgICBhcnRpZmFjdHM6IEl0ZXJhdGlvbkFydGlmYWN0c1xuICApIHtcbiAgICBzdXBlcihzdGF0ZSwgcnVudGltZSwgYm91bmRzLCBjaGlsZHJlbik7XG4gICAgdGhpcy5hcnRpZmFjdHMgPSBhcnRpZmFjdHM7XG4gICAgbGV0IF90YWcgPSAodGhpcy5fdGFnID0gY3JlYXRlVXBkYXRhYmxlVGFnKCkpO1xuICAgIHRoaXMudGFnID0gY29tYmluZShbYXJ0aWZhY3RzLnRhZywgX3RhZ10pO1xuICB9XG5cbiAgZGlkSW5pdGlhbGl6ZUNoaWxkcmVuKGxpc3REaWRDaGFuZ2UgPSB0cnVlKSB7XG4gICAgdGhpcy5sYXN0SXRlcmF0ZWQgPSB2YWx1ZSh0aGlzLmFydGlmYWN0cy50YWcpO1xuXG4gICAgaWYgKGxpc3REaWRDaGFuZ2UpIHtcbiAgICAgIHVwZGF0ZSh0aGlzLl90YWcsIGNvbWJpbmVTbGljZSh0aGlzLmNoaWxkcmVuKSk7XG4gICAgfVxuICB9XG5cbiAgZXZhbHVhdGUodm06IFVwZGF0aW5nVk0pIHtcbiAgICBsZXQgeyBhcnRpZmFjdHMsIGxhc3RJdGVyYXRlZCB9ID0gdGhpcztcblxuICAgIGlmICghdmFsaWRhdGUoYXJ0aWZhY3RzLnRhZywgbGFzdEl0ZXJhdGVkKSkge1xuICAgICAgbGV0IHsgYm91bmRzIH0gPSB0aGlzO1xuICAgICAgbGV0IHsgZG9tIH0gPSB2bTtcblxuICAgICAgbGV0IG1hcmtlciA9IGRvbS5jcmVhdGVDb21tZW50KCcnKTtcbiAgICAgIGRvbS5pbnNlcnRBZnRlcihcbiAgICAgICAgYm91bmRzLnBhcmVudEVsZW1lbnQoKSxcbiAgICAgICAgbWFya2VyLFxuICAgICAgICBleHBlY3QoYm91bmRzLmxhc3ROb2RlKCksIFwiY2FuJ3QgaW5zZXJ0IGFmdGVyIGFuIGVtcHR5IGJvdW5kc1wiKVxuICAgICAgKTtcblxuICAgICAgbGV0IHRhcmdldCA9IG5ldyBMaXN0UmV2YWxpZGF0aW9uRGVsZWdhdGUodGhpcywgbWFya2VyKTtcbiAgICAgIGxldCBzeW5jaHJvbml6ZXIgPSBuZXcgSXRlcmF0b3JTeW5jaHJvbml6ZXIoeyB0YXJnZXQsIGFydGlmYWN0cywgZW52OiB2bS5lbnYgfSk7XG5cbiAgICAgIHN5bmNocm9uaXplci5zeW5jKCk7XG5cbiAgICAgIHRoaXMucGFyZW50RWxlbWVudCgpLnJlbW92ZUNoaWxkKG1hcmtlcik7XG4gICAgfVxuXG4gICAgLy8gUnVuIG5vdy11cGRhdGVkIHVwZGF0aW5nIG9wY29kZXNcbiAgICBzdXBlci5ldmFsdWF0ZSh2bSk7XG4gIH1cblxuICB2bUZvckluc2VydGlvbihuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+KTogSW50ZXJuYWxWTTxKaXRPckFvdEJsb2NrPiB7XG4gICAgbGV0IHsgYm91bmRzLCBzdGF0ZSwgcnVudGltZSB9ID0gdGhpcztcblxuICAgIGxldCBlbGVtZW50U3RhY2sgPSBOZXdFbGVtZW50QnVpbGRlci5mb3JJbml0aWFsUmVuZGVyKHJ1bnRpbWUuZW52LCB7XG4gICAgICBlbGVtZW50OiBib3VuZHMucGFyZW50RWxlbWVudCgpLFxuICAgICAgbmV4dFNpYmxpbmcsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RhdGUucmVzdW1lKHJ1bnRpbWUsIGVsZW1lbnRTdGFjayk7XG4gIH1cbn1cblxuY2xhc3MgVXBkYXRpbmdWTUZyYW1lIHtcbiAgcHJpdmF0ZSBjdXJyZW50OiBPcHRpb248VXBkYXRpbmdPcGNvZGU+O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgb3BzOiBVcGRhdGluZ09wU2VxLCBwcml2YXRlIGV4Y2VwdGlvbkhhbmRsZXI6IE9wdGlvbjxFeGNlcHRpb25IYW5kbGVyPikge1xuICAgIHRoaXMuY3VycmVudCA9IG9wcy5oZWFkKCk7XG4gIH1cblxuICBnb3RvKG9wOiBVcGRhdGluZ09wY29kZSkge1xuICAgIHRoaXMuY3VycmVudCA9IG9wO1xuICB9XG5cbiAgbmV4dFN0YXRlbWVudCgpOiBPcHRpb248VXBkYXRpbmdPcGNvZGU+IHtcbiAgICBsZXQgeyBjdXJyZW50LCBvcHMgfSA9IHRoaXM7XG4gICAgaWYgKGN1cnJlbnQpIHRoaXMuY3VycmVudCA9IG9wcy5uZXh0Tm9kZShjdXJyZW50KTtcbiAgICByZXR1cm4gY3VycmVudDtcbiAgfVxuXG4gIGhhbmRsZUV4Y2VwdGlvbigpIHtcbiAgICBpZiAodGhpcy5leGNlcHRpb25IYW5kbGVyKSB7XG4gICAgICB0aGlzLmV4Y2VwdGlvbkhhbmRsZXIuaGFuZGxlRXhjZXB0aW9uKCk7XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9