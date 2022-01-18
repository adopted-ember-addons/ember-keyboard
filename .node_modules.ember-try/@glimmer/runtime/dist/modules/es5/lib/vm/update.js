function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import {
// Tags
combine, value, update, validate, createUpdatableTag, combineSlice, INITIAL, IteratorSynchronizer, END } from '@glimmer/reference';
import { associate, LinkedList, Stack } from '@glimmer/util';
import { move as moveBounds } from '../bounds';
import { asyncReset, detach } from '../lifetime';
import { UpdatingOpcode } from '../opcodes';
import { NewElementBuilder } from './element-builder';

var UpdatingVM = function () {
    function UpdatingVM(env, _ref) {
        var _ref$alwaysRevalidate = _ref.alwaysRevalidate,
            alwaysRevalidate = _ref$alwaysRevalidate === undefined ? false : _ref$alwaysRevalidate;

        _classCallCheck(this, UpdatingVM);

        this.frameStack = new Stack();
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

export default UpdatingVM;

export var ResumableVMStateImpl = function () {
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
export var BlockOpcode = function (_UpdatingOpcode) {
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
}(UpdatingOpcode);
export var TryOpcode = function (_BlockOpcode) {
    _inherits(TryOpcode, _BlockOpcode);

    function TryOpcode(state, runtime, bounds, children) {
        _classCallCheck(this, TryOpcode);

        var _this2 = _possibleConstructorReturn(this, _BlockOpcode.call(this, state, runtime, bounds, children));

        _this2.type = 'try';
        _this2.tag = _this2._tag = createUpdatableTag();
        return _this2;
    }

    TryOpcode.prototype.didInitializeChildren = function didInitializeChildren() {
        update(this._tag, combineSlice(this.children));
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
        asyncReset(this, runtime.env);
        var elementStack = NewElementBuilder.resume(runtime.env, bounds);
        var vm = state.resume(runtime, elementStack);
        var updating = new LinkedList();
        var result = vm.execute(function (vm) {
            vm.pushUpdating(updating);
            vm.updateWith(_this3);
            vm.pushUpdating(children);
        });
        associate(this, result.drop);
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
            vm.pushUpdating(new LinkedList());
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
        if (before === END) {
            moveBounds(entry, this.marker);
            updating.remove(entry);
            updating.append(entry);
        } else {
            var reference = map.get(before);
            moveBounds(entry, reference.firstNode());
            updating.remove(entry);
            updating.insertBefore(entry, reference);
        }
    };

    ListRevalidationDelegate.prototype.delete = function _delete(env, key) {
        var map = this.map,
            updating = this.updating;

        var opcode = map.get(key);
        detach(opcode, env);
        updating.remove(opcode);
        map.delete(key);
        this.didDelete = true;
    };

    ListRevalidationDelegate.prototype.done = function done() {
        this.opcode.didInitializeChildren(this.didInsert || this.didDelete);
    };

    return ListRevalidationDelegate;
}();

export var ListBlockOpcode = function (_BlockOpcode2) {
    _inherits(ListBlockOpcode, _BlockOpcode2);

    function ListBlockOpcode(state, runtime, bounds, children, artifacts) {
        _classCallCheck(this, ListBlockOpcode);

        var _this4 = _possibleConstructorReturn(this, _BlockOpcode2.call(this, state, runtime, bounds, children));

        _this4.type = 'list-block';
        _this4.map = new Map();
        _this4.lastIterated = INITIAL;
        _this4.artifacts = artifacts;
        var _tag = _this4._tag = createUpdatableTag();
        _this4.tag = combine([artifacts.tag, _tag]);
        return _this4;
    }

    ListBlockOpcode.prototype.didInitializeChildren = function didInitializeChildren() {
        var listDidChange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        this.lastIterated = value(this.artifacts.tag);
        if (listDidChange) {
            update(this._tag, combineSlice(this.children));
        }
    };

    ListBlockOpcode.prototype.evaluate = function evaluate(vm) {
        var artifacts = this.artifacts,
            lastIterated = this.lastIterated;

        if (!validate(artifacts.tag, lastIterated)) {
            var bounds = this.bounds;
            var dom = vm.dom;

            var marker = dom.createComment('');
            dom.insertAfter(bounds.parentElement(), marker, bounds.lastNode());
            var target = new ListRevalidationDelegate(this, marker);
            var synchronizer = new IteratorSynchronizer({ target: target, artifacts: artifacts, env: vm.env });
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

        var elementStack = NewElementBuilder.forInitialRender(runtime.env, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL3VwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBZUE7QUFDRTtBQURGLE9BQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQSxrQkFBQSxFQUFBLFlBQUEsRUFBQSxPQUFBLEVBQUEsb0JBQUEsRUFBQSxHQUFBLFFBQUEsb0JBQUE7QUFrQkEsU0FBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLEtBQUEsUUFBQSxlQUFBO0FBRUEsU0FBUyxRQUFULFVBQUEsUUFBQSxXQUFBO0FBQ0EsU0FBQSxVQUFBLEVBQUEsTUFBQSxRQUFBLGFBQUE7QUFDQSxTQUFBLGNBQUEsUUFBQSxZQUFBO0FBRUEsU0FBQSxpQkFBQSxRQUFBLG1CQUFBOztJQUVjLFU7QUFPWix3QkFBQSxHQUFBLFFBQTBEO0FBQUEseUNBQTFCLGdCQUEwQjtBQUFBLFlBQTFCLGdCQUEwQix5Q0FBMUQsS0FBMEQ7O0FBQUE7O0FBRmxELGFBQUEsVUFBQSxHQUFxQyxJQUFyQyxLQUFxQyxFQUFyQztBQUdOLGFBQUEsR0FBQSxHQUFBLEdBQUE7QUFDQSxhQUFBLEdBQUEsR0FBVyxJQUFYLE1BQVcsRUFBWDtBQUNBLGFBQUEsZ0JBQUEsR0FBQSxnQkFBQTtBQUNEOzt5QkFFRCxPLG9CQUFBLE8sRUFBQSxPLEVBQXlEO0FBQUEsWUFDbkQsVUFEbUQsR0FDdkQsSUFEdUQsQ0FDbkQsVUFEbUQ7O0FBR3ZELGFBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQSxPQUFBO0FBRUEsZUFBQSxJQUFBLEVBQWE7QUFDWCxnQkFBSSxXQUFKLE9BQUksRUFBSixFQUEwQjtBQUUxQixnQkFBSSxTQUFTLEtBQUEsS0FBQSxDQUFiLGFBQWEsRUFBYjtBQUVBLGdCQUFJLFdBQUosSUFBQSxFQUFxQjtBQUNuQiwyQkFBQSxHQUFBO0FBQ0E7QUFDRDtBQUVELG1CQUFBLFFBQUEsQ0FBQSxJQUFBO0FBQ0Q7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Q2pFLHFCQUFTLE9BRHdELGFBQ3hELEVBRHdEO0FBRWpFO0FBRmlFLFNBQWhELENBQW5CO0FBS0EsZUFBTyxNQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQVAsWUFBTyxDQUFQO0FBQ0QsS0FqRUg7O0FBQUE7QUFBQSxFQUFNLFdBQU47O0lBb0VBLGU7QUFHRSw2QkFBQSxHQUFBLEVBQUEsZ0JBQUEsRUFBMEY7QUFBQTs7QUFBdEUsYUFBQSxHQUFBLEdBQUEsR0FBQTtBQUE0QixhQUFBLGdCQUFBLEdBQUEsZ0JBQUE7QUFDOUMsYUFBQSxPQUFBLEdBQWUsSUFBZixJQUFlLEVBQWY7QUFDRDs7OEJBRUQsSSxpQkFBQSxFLEVBQXVCO0FBQ3JCLGFBQUEsT0FBQSxHQUFBLEVBQUE7QUFDRCxLOzs4QkFFRCxhLDRCQUFhO0FBQUEsWUFDUCxPQURPLEdBQ1gsSUFEVyxDQUNQLE9BRE87QUFBQSxZQUNQLEdBRE8sR0FDWCxJQURXLENBQ1AsR0FETzs7QUFFWCxZQUFBLE9BQUEsRUFBYSxLQUFBLE9BQUEsR0FBZSxJQUFBLFFBQUEsQ0FBZixPQUFlLENBQWY7QUFDYixlQUFBLE9BQUE7QUFDRCxLOzs4QkFFRCxlLDhCQUFlO0FBQ2IsWUFBSSxLQUFKLGdCQUFBLEVBQTJCO0FBQ3pCLGlCQUFBLGdCQUFBLENBQUEsZUFBQTtBQUNEO0FBQ0YsSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEJvdW5kcyxcbiAgRHluYW1pY1Njb3BlLFxuICBFbnZpcm9ubWVudCxcbiAgRXhjZXB0aW9uSGFuZGxlcixcbiAgR2xpbW1lclRyZWVDaGFuZ2VzLFxuICBKaXRPckFvdEJsb2NrLFxuICBSdW50aW1lQ29udGV4dCxcbiAgU2NvcGUsXG4gIEFvdFJ1bnRpbWVDb250ZXh0LFxuICBKaXRSdW50aW1lQ29udGV4dCxcbiAgRWxlbWVudEJ1aWxkZXIsXG4gIExpdmVCbG9jayxcbiAgVXBkYXRhYmxlQmxvY2ssXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgLy8gVGFnc1xuICBjb21iaW5lLFxuICB2YWx1ZSxcbiAgdXBkYXRlLFxuICB2YWxpZGF0ZSxcbiAgY3JlYXRlVXBkYXRhYmxlVGFnLFxuICBUYWcsXG4gIFVwZGF0YWJsZVRhZyxcbiAgUmV2aXNpb24sXG4gIGNvbWJpbmVTbGljZSxcbiAgSU5JVElBTCxcbiAgSXRlcmF0aW9uQXJ0aWZhY3RzLFxuICBJdGVyYXRvclN5bmNocm9uaXplcixcbiAgSXRlcmF0b3JTeW5jaHJvbml6ZXJEZWxlZ2F0ZSxcbiAgUGF0aFJlZmVyZW5jZSxcbiAgRU5ELFxufSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgYXNzb2NpYXRlLCBleHBlY3QsIExpbmtlZExpc3QsIE9wdGlvbiwgU3RhY2sgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFNpbXBsZUNvbW1lbnQsIFNpbXBsZU5vZGUgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgbW92ZSBhcyBtb3ZlQm91bmRzIH0gZnJvbSAnLi4vYm91bmRzJztcbmltcG9ydCB7IGFzeW5jUmVzZXQsIGRldGFjaCB9IGZyb20gJy4uL2xpZmV0aW1lJztcbmltcG9ydCB7IFVwZGF0aW5nT3Bjb2RlLCBVcGRhdGluZ09wU2VxIH0gZnJvbSAnLi4vb3Bjb2Rlcyc7XG5pbXBvcnQgeyBJbnRlcm5hbFZNLCBWbUluaXRDYWxsYmFjaywgSml0Vk0gfSBmcm9tICcuL2FwcGVuZCc7XG5pbXBvcnQgeyBOZXdFbGVtZW50QnVpbGRlciB9IGZyb20gJy4vZWxlbWVudC1idWlsZGVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXBkYXRpbmdWTSB7XG4gIHB1YmxpYyBlbnY6IEVudmlyb25tZW50O1xuICBwdWJsaWMgZG9tOiBHbGltbWVyVHJlZUNoYW5nZXM7XG4gIHB1YmxpYyBhbHdheXNSZXZhbGlkYXRlOiBib29sZWFuO1xuXG4gIHByaXZhdGUgZnJhbWVTdGFjazogU3RhY2s8VXBkYXRpbmdWTUZyYW1lPiA9IG5ldyBTdGFjazxVcGRhdGluZ1ZNRnJhbWU+KCk7XG5cbiAgY29uc3RydWN0b3IoZW52OiBFbnZpcm9ubWVudCwgeyBhbHdheXNSZXZhbGlkYXRlID0gZmFsc2UgfSkge1xuICAgIHRoaXMuZW52ID0gZW52O1xuICAgIHRoaXMuZG9tID0gZW52LmdldERPTSgpO1xuICAgIHRoaXMuYWx3YXlzUmV2YWxpZGF0ZSA9IGFsd2F5c1JldmFsaWRhdGU7XG4gIH1cblxuICBleGVjdXRlKG9wY29kZXM6IFVwZGF0aW5nT3BTZXEsIGhhbmRsZXI6IEV4Y2VwdGlvbkhhbmRsZXIpIHtcbiAgICBsZXQgeyBmcmFtZVN0YWNrIH0gPSB0aGlzO1xuXG4gICAgdGhpcy50cnkob3Bjb2RlcywgaGFuZGxlcik7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKGZyYW1lU3RhY2suaXNFbXB0eSgpKSBicmVhaztcblxuICAgICAgbGV0IG9wY29kZSA9IHRoaXMuZnJhbWUubmV4dFN0YXRlbWVudCgpO1xuXG4gICAgICBpZiAob3Bjb2RlID09PSBudWxsKSB7XG4gICAgICAgIGZyYW1lU3RhY2sucG9wKCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBvcGNvZGUuZXZhbHVhdGUodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXQgZnJhbWUoKSB7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzLmZyYW1lU3RhY2suY3VycmVudCwgJ2J1ZzogZXhwZWN0ZWQgYSBmcmFtZScpO1xuICB9XG5cbiAgZ290byhvcDogVXBkYXRpbmdPcGNvZGUpIHtcbiAgICB0aGlzLmZyYW1lLmdvdG8ob3ApO1xuICB9XG5cbiAgdHJ5KG9wczogVXBkYXRpbmdPcFNlcSwgaGFuZGxlcjogT3B0aW9uPEV4Y2VwdGlvbkhhbmRsZXI+KSB7XG4gICAgdGhpcy5mcmFtZVN0YWNrLnB1c2gobmV3IFVwZGF0aW5nVk1GcmFtZShvcHMsIGhhbmRsZXIpKTtcbiAgfVxuXG4gIHRocm93KCkge1xuICAgIHRoaXMuZnJhbWUuaGFuZGxlRXhjZXB0aW9uKCk7XG4gICAgdGhpcy5mcmFtZVN0YWNrLnBvcCgpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVk1TdGF0ZSB7XG4gIHJlYWRvbmx5IHBjOiBudW1iZXI7XG4gIHJlYWRvbmx5IHNjb3BlOiBTY29wZTxKaXRPckFvdEJsb2NrPjtcbiAgcmVhZG9ubHkgZHluYW1pY1Njb3BlOiBEeW5hbWljU2NvcGU7XG4gIHJlYWRvbmx5IHN0YWNrOiB1bmtub3duW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzdW1hYmxlVk1TdGF0ZTxWIGV4dGVuZHMgSW50ZXJuYWxWTT4ge1xuICByZXN1bWUocnVudGltZTogUnVudGltZUNvbnRleHQsIGJ1aWxkZXI6IEVsZW1lbnRCdWlsZGVyKTogVjtcbn1cblxuZXhwb3J0IGNsYXNzIFJlc3VtYWJsZVZNU3RhdGVJbXBsPFYgZXh0ZW5kcyBJbnRlcm5hbFZNPiBpbXBsZW1lbnRzIFJlc3VtYWJsZVZNU3RhdGU8Vj4ge1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSBzdGF0ZTogVk1TdGF0ZSwgcHJpdmF0ZSByZXN1bWVDYWxsYmFjazogVm1Jbml0Q2FsbGJhY2s8Vj4pIHt9XG5cbiAgcmVzdW1lKFxuICAgIHJ1bnRpbWU6IFYgZXh0ZW5kcyBKaXRWTSA/IEppdFJ1bnRpbWVDb250ZXh0IDogQW90UnVudGltZUNvbnRleHQsXG4gICAgYnVpbGRlcjogRWxlbWVudEJ1aWxkZXJcbiAgKTogViB7XG4gICAgcmV0dXJuIHRoaXMucmVzdW1lQ2FsbGJhY2socnVudGltZSwgdGhpcy5zdGF0ZSwgYnVpbGRlcik7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJsb2NrT3Bjb2RlIGV4dGVuZHMgVXBkYXRpbmdPcGNvZGUgaW1wbGVtZW50cyBCb3VuZHMge1xuICBwdWJsaWMgdHlwZSA9ICdibG9jayc7XG4gIHB1YmxpYyBuZXh0ID0gbnVsbDtcbiAgcHVibGljIHByZXYgPSBudWxsO1xuICByZWFkb25seSBjaGlsZHJlbjogTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT47XG5cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGJvdW5kczogTGl2ZUJsb2NrO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCBzdGF0ZTogUmVzdW1hYmxlVk1TdGF0ZTxJbnRlcm5hbFZNPixcbiAgICBwcm90ZWN0ZWQgcnVudGltZTogUnVudGltZUNvbnRleHQsXG4gICAgYm91bmRzOiBMaXZlQmxvY2ssXG4gICAgY2hpbGRyZW46IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+XG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgdGhpcy5ib3VuZHMgPSBib3VuZHM7XG4gIH1cblxuICBhYnN0cmFjdCBkaWRJbml0aWFsaXplQ2hpbGRyZW4oKTogdm9pZDtcblxuICBwYXJlbnRFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5wYXJlbnRFbGVtZW50KCk7XG4gIH1cblxuICBmaXJzdE5vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmZpcnN0Tm9kZSgpO1xuICB9XG5cbiAgbGFzdE5vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmxhc3ROb2RlKCk7XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIHZtLnRyeSh0aGlzLmNoaWxkcmVuLCBudWxsKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJ5T3Bjb2RlIGV4dGVuZHMgQmxvY2tPcGNvZGUgaW1wbGVtZW50cyBFeGNlcHRpb25IYW5kbGVyIHtcbiAgcHVibGljIHR5cGUgPSAndHJ5JztcblxuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgcHJpdmF0ZSBfdGFnOiBVcGRhdGFibGVUYWc7XG5cbiAgcHJvdGVjdGVkIGJvdW5kcyE6IFVwZGF0YWJsZUJsb2NrOyAvLyBIaWRlcyBwcm9wZXJ0eSBvbiBiYXNlIGNsYXNzXG5cbiAgY29uc3RydWN0b3IoXG4gICAgc3RhdGU6IFJlc3VtYWJsZVZNU3RhdGU8SW50ZXJuYWxWTT4sXG4gICAgcnVudGltZTogUnVudGltZUNvbnRleHQsXG4gICAgYm91bmRzOiBVcGRhdGFibGVCbG9jayxcbiAgICBjaGlsZHJlbjogTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT5cbiAgKSB7XG4gICAgc3VwZXIoc3RhdGUsIHJ1bnRpbWUsIGJvdW5kcywgY2hpbGRyZW4pO1xuICAgIHRoaXMudGFnID0gdGhpcy5fdGFnID0gY3JlYXRlVXBkYXRhYmxlVGFnKCk7XG4gIH1cblxuICBkaWRJbml0aWFsaXplQ2hpbGRyZW4oKSB7XG4gICAgdXBkYXRlKHRoaXMuX3RhZywgY29tYmluZVNsaWNlKHRoaXMuY2hpbGRyZW4pKTtcbiAgfVxuXG4gIGV2YWx1YXRlKHZtOiBVcGRhdGluZ1ZNKSB7XG4gICAgdm0udHJ5KHRoaXMuY2hpbGRyZW4sIHRoaXMpO1xuICB9XG5cbiAgaGFuZGxlRXhjZXB0aW9uKCkge1xuICAgIGxldCB7IHN0YXRlLCBib3VuZHMsIGNoaWxkcmVuLCBwcmV2LCBuZXh0LCBydW50aW1lIH0gPSB0aGlzO1xuXG4gICAgY2hpbGRyZW4uY2xlYXIoKTtcbiAgICBhc3luY1Jlc2V0KHRoaXMsIHJ1bnRpbWUuZW52KTtcblxuICAgIGxldCBlbGVtZW50U3RhY2sgPSBOZXdFbGVtZW50QnVpbGRlci5yZXN1bWUocnVudGltZS5lbnYsIGJvdW5kcyk7XG4gICAgbGV0IHZtID0gc3RhdGUucmVzdW1lKHJ1bnRpbWUsIGVsZW1lbnRTdGFjayk7XG5cbiAgICBsZXQgdXBkYXRpbmcgPSBuZXcgTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT4oKTtcblxuICAgIGxldCByZXN1bHQgPSB2bS5leGVjdXRlKHZtID0+IHtcbiAgICAgIHZtLnB1c2hVcGRhdGluZyh1cGRhdGluZyk7XG4gICAgICB2bS51cGRhdGVXaXRoKHRoaXMpO1xuICAgICAgdm0ucHVzaFVwZGF0aW5nKGNoaWxkcmVuKTtcbiAgICB9KTtcblxuICAgIGFzc29jaWF0ZSh0aGlzLCByZXN1bHQuZHJvcCk7XG5cbiAgICB0aGlzLnByZXYgPSBwcmV2O1xuICAgIHRoaXMubmV4dCA9IG5leHQ7XG4gIH1cbn1cblxuY2xhc3MgTGlzdFJldmFsaWRhdGlvbkRlbGVnYXRlIGltcGxlbWVudHMgSXRlcmF0b3JTeW5jaHJvbml6ZXJEZWxlZ2F0ZTxFbnZpcm9ubWVudD4ge1xuICBwcml2YXRlIG1hcDogTWFwPHVua25vd24sIEJsb2NrT3Bjb2RlPjtcbiAgcHJpdmF0ZSB1cGRhdGluZzogTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT47XG5cbiAgcHJpdmF0ZSBkaWRJbnNlcnQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBkaWREZWxldGUgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9wY29kZTogTGlzdEJsb2NrT3Bjb2RlLCBwcml2YXRlIG1hcmtlcjogU2ltcGxlQ29tbWVudCkge1xuICAgIHRoaXMubWFwID0gb3Bjb2RlLm1hcDtcbiAgICB0aGlzLnVwZGF0aW5nID0gb3Bjb2RlWydjaGlsZHJlbiddO1xuICB9XG5cbiAgaW5zZXJ0KFxuICAgIF9lbnY6IEVudmlyb25tZW50LFxuICAgIGtleTogdW5rbm93bixcbiAgICBpdGVtOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LFxuICAgIG1lbW86IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgYmVmb3JlOiB1bmtub3duXG4gICkge1xuICAgIGxldCB7IG1hcCwgb3Bjb2RlLCB1cGRhdGluZyB9ID0gdGhpcztcbiAgICBsZXQgbmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPiA9IG51bGw7XG4gICAgbGV0IHJlZmVyZW5jZTogT3B0aW9uPEJsb2NrT3Bjb2RlPiA9IG51bGw7XG5cbiAgICBpZiAodHlwZW9mIGJlZm9yZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJlZmVyZW5jZSA9IG1hcC5nZXQoYmVmb3JlKSE7XG4gICAgICBuZXh0U2libGluZyA9IHJlZmVyZW5jZVsnYm91bmRzJ10uZmlyc3ROb2RlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHRTaWJsaW5nID0gdGhpcy5tYXJrZXI7XG4gICAgfVxuXG4gICAgbGV0IHZtID0gb3Bjb2RlLnZtRm9ySW5zZXJ0aW9uKG5leHRTaWJsaW5nKTtcbiAgICBsZXQgdHJ5T3Bjb2RlOiBPcHRpb248VHJ5T3Bjb2RlPiA9IG51bGw7XG5cbiAgICB2bS5leGVjdXRlKHZtID0+IHtcbiAgICAgIHRyeU9wY29kZSA9IHZtLml0ZXJhdGUobWVtbywgaXRlbSk7XG4gICAgICBtYXAuc2V0KGtleSwgdHJ5T3Bjb2RlKTtcbiAgICAgIHZtLnB1c2hVcGRhdGluZyhuZXcgTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT4oKSk7XG4gICAgICB2bS51cGRhdGVXaXRoKHRyeU9wY29kZSk7XG4gICAgICB2bS5wdXNoVXBkYXRpbmcodHJ5T3Bjb2RlLmNoaWxkcmVuKTtcbiAgICB9KTtcblxuICAgIHVwZGF0aW5nLmluc2VydEJlZm9yZSh0cnlPcGNvZGUhLCByZWZlcmVuY2UpO1xuXG4gICAgdGhpcy5kaWRJbnNlcnQgPSB0cnVlO1xuICB9XG5cbiAgcmV0YWluKFxuICAgIF9lbnY6IEVudmlyb25tZW50LFxuICAgIF9rZXk6IHVua25vd24sXG4gICAgX2l0ZW06IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgX21lbW86IFBhdGhSZWZlcmVuY2U8dW5rbm93bj5cbiAgKSB7fVxuXG4gIG1vdmUoXG4gICAgX2VudjogRW52aXJvbm1lbnQsXG4gICAga2V5OiB1bmtub3duLFxuICAgIF9pdGVtOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LFxuICAgIF9tZW1vOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LFxuICAgIGJlZm9yZTogdW5rbm93blxuICApIHtcbiAgICBsZXQgeyBtYXAsIHVwZGF0aW5nIH0gPSB0aGlzO1xuXG4gICAgbGV0IGVudHJ5ID0gbWFwLmdldChrZXkpITtcblxuICAgIGlmIChiZWZvcmUgPT09IEVORCkge1xuICAgICAgbW92ZUJvdW5kcyhlbnRyeSwgdGhpcy5tYXJrZXIpO1xuICAgICAgdXBkYXRpbmcucmVtb3ZlKGVudHJ5KTtcbiAgICAgIHVwZGF0aW5nLmFwcGVuZChlbnRyeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZWZlcmVuY2UgPSBtYXAuZ2V0KGJlZm9yZSkhO1xuICAgICAgbW92ZUJvdW5kcyhlbnRyeSwgcmVmZXJlbmNlLmZpcnN0Tm9kZSgpKTtcbiAgICAgIHVwZGF0aW5nLnJlbW92ZShlbnRyeSk7XG4gICAgICB1cGRhdGluZy5pbnNlcnRCZWZvcmUoZW50cnksIHJlZmVyZW5jZSk7XG4gICAgfVxuICB9XG5cbiAgZGVsZXRlKGVudjogRW52aXJvbm1lbnQsIGtleTogdW5rbm93bikge1xuICAgIGxldCB7IG1hcCwgdXBkYXRpbmcgfSA9IHRoaXM7XG4gICAgbGV0IG9wY29kZSA9IG1hcC5nZXQoa2V5KSE7XG4gICAgZGV0YWNoKG9wY29kZSwgZW52KTtcbiAgICB1cGRhdGluZy5yZW1vdmUob3Bjb2RlKTtcbiAgICBtYXAuZGVsZXRlKGtleSk7XG5cbiAgICB0aGlzLmRpZERlbGV0ZSA9IHRydWU7XG4gIH1cblxuICBkb25lKCkge1xuICAgIHRoaXMub3Bjb2RlLmRpZEluaXRpYWxpemVDaGlsZHJlbih0aGlzLmRpZEluc2VydCB8fCB0aGlzLmRpZERlbGV0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExpc3RCbG9ja09wY29kZSBleHRlbmRzIEJsb2NrT3Bjb2RlIHtcbiAgcHVibGljIHR5cGUgPSAnbGlzdC1ibG9jayc7XG4gIHB1YmxpYyBtYXAgPSBuZXcgTWFwPHVua25vd24sIEJsb2NrT3Bjb2RlPigpO1xuICBwdWJsaWMgYXJ0aWZhY3RzOiBJdGVyYXRpb25BcnRpZmFjdHM7XG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBwcml2YXRlIGxhc3RJdGVyYXRlZDogUmV2aXNpb24gPSBJTklUSUFMO1xuICBwcml2YXRlIF90YWc6IFVwZGF0YWJsZVRhZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzdGF0ZTogUmVzdW1hYmxlVk1TdGF0ZTxJbnRlcm5hbFZNPixcbiAgICBydW50aW1lOiBSdW50aW1lQ29udGV4dCxcbiAgICBib3VuZHM6IExpdmVCbG9jayxcbiAgICBjaGlsZHJlbjogTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT4sXG4gICAgYXJ0aWZhY3RzOiBJdGVyYXRpb25BcnRpZmFjdHNcbiAgKSB7XG4gICAgc3VwZXIoc3RhdGUsIHJ1bnRpbWUsIGJvdW5kcywgY2hpbGRyZW4pO1xuICAgIHRoaXMuYXJ0aWZhY3RzID0gYXJ0aWZhY3RzO1xuICAgIGxldCBfdGFnID0gKHRoaXMuX3RhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpKTtcbiAgICB0aGlzLnRhZyA9IGNvbWJpbmUoW2FydGlmYWN0cy50YWcsIF90YWddKTtcbiAgfVxuXG4gIGRpZEluaXRpYWxpemVDaGlsZHJlbihsaXN0RGlkQ2hhbmdlID0gdHJ1ZSkge1xuICAgIHRoaXMubGFzdEl0ZXJhdGVkID0gdmFsdWUodGhpcy5hcnRpZmFjdHMudGFnKTtcblxuICAgIGlmIChsaXN0RGlkQ2hhbmdlKSB7XG4gICAgICB1cGRhdGUodGhpcy5fdGFnLCBjb21iaW5lU2xpY2UodGhpcy5jaGlsZHJlbikpO1xuICAgIH1cbiAgfVxuXG4gIGV2YWx1YXRlKHZtOiBVcGRhdGluZ1ZNKSB7XG4gICAgbGV0IHsgYXJ0aWZhY3RzLCBsYXN0SXRlcmF0ZWQgfSA9IHRoaXM7XG5cbiAgICBpZiAoIXZhbGlkYXRlKGFydGlmYWN0cy50YWcsIGxhc3RJdGVyYXRlZCkpIHtcbiAgICAgIGxldCB7IGJvdW5kcyB9ID0gdGhpcztcbiAgICAgIGxldCB7IGRvbSB9ID0gdm07XG5cbiAgICAgIGxldCBtYXJrZXIgPSBkb20uY3JlYXRlQ29tbWVudCgnJyk7XG4gICAgICBkb20uaW5zZXJ0QWZ0ZXIoXG4gICAgICAgIGJvdW5kcy5wYXJlbnRFbGVtZW50KCksXG4gICAgICAgIG1hcmtlcixcbiAgICAgICAgZXhwZWN0KGJvdW5kcy5sYXN0Tm9kZSgpLCBcImNhbid0IGluc2VydCBhZnRlciBhbiBlbXB0eSBib3VuZHNcIilcbiAgICAgICk7XG5cbiAgICAgIGxldCB0YXJnZXQgPSBuZXcgTGlzdFJldmFsaWRhdGlvbkRlbGVnYXRlKHRoaXMsIG1hcmtlcik7XG4gICAgICBsZXQgc3luY2hyb25pemVyID0gbmV3IEl0ZXJhdG9yU3luY2hyb25pemVyKHsgdGFyZ2V0LCBhcnRpZmFjdHMsIGVudjogdm0uZW52IH0pO1xuXG4gICAgICBzeW5jaHJvbml6ZXIuc3luYygpO1xuXG4gICAgICB0aGlzLnBhcmVudEVsZW1lbnQoKS5yZW1vdmVDaGlsZChtYXJrZXIpO1xuICAgIH1cblxuICAgIC8vIFJ1biBub3ctdXBkYXRlZCB1cGRhdGluZyBvcGNvZGVzXG4gICAgc3VwZXIuZXZhbHVhdGUodm0pO1xuICB9XG5cbiAgdm1Gb3JJbnNlcnRpb24obmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPik6IEludGVybmFsVk08Sml0T3JBb3RCbG9jaz4ge1xuICAgIGxldCB7IGJvdW5kcywgc3RhdGUsIHJ1bnRpbWUgfSA9IHRoaXM7XG5cbiAgICBsZXQgZWxlbWVudFN0YWNrID0gTmV3RWxlbWVudEJ1aWxkZXIuZm9ySW5pdGlhbFJlbmRlcihydW50aW1lLmVudiwge1xuICAgICAgZWxlbWVudDogYm91bmRzLnBhcmVudEVsZW1lbnQoKSxcbiAgICAgIG5leHRTaWJsaW5nLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHN0YXRlLnJlc3VtZShydW50aW1lLCBlbGVtZW50U3RhY2spO1xuICB9XG59XG5cbmNsYXNzIFVwZGF0aW5nVk1GcmFtZSB7XG4gIHByaXZhdGUgY3VycmVudDogT3B0aW9uPFVwZGF0aW5nT3Bjb2RlPjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9wczogVXBkYXRpbmdPcFNlcSwgcHJpdmF0ZSBleGNlcHRpb25IYW5kbGVyOiBPcHRpb248RXhjZXB0aW9uSGFuZGxlcj4pIHtcbiAgICB0aGlzLmN1cnJlbnQgPSBvcHMuaGVhZCgpO1xuICB9XG5cbiAgZ290byhvcDogVXBkYXRpbmdPcGNvZGUpIHtcbiAgICB0aGlzLmN1cnJlbnQgPSBvcDtcbiAgfVxuXG4gIG5leHRTdGF0ZW1lbnQoKTogT3B0aW9uPFVwZGF0aW5nT3Bjb2RlPiB7XG4gICAgbGV0IHsgY3VycmVudCwgb3BzIH0gPSB0aGlzO1xuICAgIGlmIChjdXJyZW50KSB0aGlzLmN1cnJlbnQgPSBvcHMubmV4dE5vZGUoY3VycmVudCk7XG4gICAgcmV0dXJuIGN1cnJlbnQ7XG4gIH1cblxuICBoYW5kbGVFeGNlcHRpb24oKSB7XG4gICAgaWYgKHRoaXMuZXhjZXB0aW9uSGFuZGxlcikge1xuICAgICAgdGhpcy5leGNlcHRpb25IYW5kbGVyLmhhbmRsZUV4Y2VwdGlvbigpO1xuICAgIH1cbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==