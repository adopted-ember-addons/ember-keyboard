'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ListBlockOpcode = exports.TryOpcode = exports.BlockOpcode = exports.ResumableVMStateImpl = undefined;

var _reference = require('@glimmer/reference');

var _util = require('@glimmer/util');

var _bounds = require('../bounds');

var _lifetime = require('../lifetime');

var _opcodes = require('../opcodes');

var _elementBuilder = require('./element-builder');

class UpdatingVM {
    constructor(env, { alwaysRevalidate = false }) {
        this.frameStack = new _util.Stack();
        this.env = env;
        this.dom = env.getDOM();
        this.alwaysRevalidate = alwaysRevalidate;
    }
    execute(opcodes, handler) {
        let { frameStack } = this;
        this.try(opcodes, handler);
        while (true) {
            if (frameStack.isEmpty()) break;
            let opcode = this.frame.nextStatement();
            if (opcode === null) {
                frameStack.pop();
                continue;
            }
            opcode.evaluate(this);
        }
    }
    get frame() {
        return this.frameStack.current;
    }
    goto(op) {
        this.frame.goto(op);
    }
    try(ops, handler) {
        this.frameStack.push(new UpdatingVMFrame(ops, handler));
    }
    throw() {
        this.frame.handleException();
        this.frameStack.pop();
    }
}
exports.default = UpdatingVM;
class ResumableVMStateImpl {
    constructor(state, resumeCallback) {
        this.state = state;
        this.resumeCallback = resumeCallback;
    }
    resume(runtime, builder) {
        return this.resumeCallback(runtime, this.state, builder);
    }
}
exports.ResumableVMStateImpl = ResumableVMStateImpl;
class BlockOpcode extends _opcodes.UpdatingOpcode {
    constructor(state, runtime, bounds, children) {
        super();
        this.state = state;
        this.runtime = runtime;
        this.type = 'block';
        this.next = null;
        this.prev = null;
        this.children = children;
        this.bounds = bounds;
    }
    parentElement() {
        return this.bounds.parentElement();
    }
    firstNode() {
        return this.bounds.firstNode();
    }
    lastNode() {
        return this.bounds.lastNode();
    }
    evaluate(vm) {
        vm.try(this.children, null);
    }
}
exports.BlockOpcode = BlockOpcode;
class TryOpcode extends BlockOpcode {
    constructor(state, runtime, bounds, children) {
        super(state, runtime, bounds, children);
        this.type = 'try';
        this.tag = this._tag = (0, _reference.createUpdatableTag)();
    }
    didInitializeChildren() {
        (0, _reference.update)(this._tag, (0, _reference.combineSlice)(this.children));
    }
    evaluate(vm) {
        vm.try(this.children, this);
    }
    handleException() {
        let { state, bounds, children, prev, next, runtime } = this;
        children.clear();
        (0, _lifetime.asyncReset)(this, runtime.env);
        let elementStack = _elementBuilder.NewElementBuilder.resume(runtime.env, bounds);
        let vm = state.resume(runtime, elementStack);
        let updating = new _util.LinkedList();
        let result = vm.execute(vm => {
            vm.pushUpdating(updating);
            vm.updateWith(this);
            vm.pushUpdating(children);
        });
        (0, _util.associate)(this, result.drop);
        this.prev = prev;
        this.next = next;
    }
}
exports.TryOpcode = TryOpcode;
class ListRevalidationDelegate {
    constructor(opcode, marker) {
        this.opcode = opcode;
        this.marker = marker;
        this.didInsert = false;
        this.didDelete = false;
        this.map = opcode.map;
        this.updating = opcode['children'];
    }
    insert(_env, key, item, memo, before) {
        let { map, opcode, updating } = this;
        let nextSibling = null;
        let reference = null;
        if (typeof before === 'string') {
            reference = map.get(before);
            nextSibling = reference['bounds'].firstNode();
        } else {
            nextSibling = this.marker;
        }
        let vm = opcode.vmForInsertion(nextSibling);
        let tryOpcode = null;
        vm.execute(vm => {
            tryOpcode = vm.iterate(memo, item);
            map.set(key, tryOpcode);
            vm.pushUpdating(new _util.LinkedList());
            vm.updateWith(tryOpcode);
            vm.pushUpdating(tryOpcode.children);
        });
        updating.insertBefore(tryOpcode, reference);
        this.didInsert = true;
    }
    retain(_env, _key, _item, _memo) {}
    move(_env, key, _item, _memo, before) {
        let { map, updating } = this;
        let entry = map.get(key);
        if (before === _reference.END) {
            (0, _bounds.move)(entry, this.marker);
            updating.remove(entry);
            updating.append(entry);
        } else {
            let reference = map.get(before);
            (0, _bounds.move)(entry, reference.firstNode());
            updating.remove(entry);
            updating.insertBefore(entry, reference);
        }
    }
    delete(env, key) {
        let { map, updating } = this;
        let opcode = map.get(key);
        (0, _lifetime.detach)(opcode, env);
        updating.remove(opcode);
        map.delete(key);
        this.didDelete = true;
    }
    done() {
        this.opcode.didInitializeChildren(this.didInsert || this.didDelete);
    }
}
class ListBlockOpcode extends BlockOpcode {
    constructor(state, runtime, bounds, children, artifacts) {
        super(state, runtime, bounds, children);
        this.type = 'list-block';
        this.map = new Map();
        this.lastIterated = _reference.INITIAL;
        this.artifacts = artifacts;
        let _tag = this._tag = (0, _reference.createUpdatableTag)();
        this.tag = (0, _reference.combine)([artifacts.tag, _tag]);
    }
    didInitializeChildren(listDidChange = true) {
        this.lastIterated = (0, _reference.value)(this.artifacts.tag);
        if (listDidChange) {
            (0, _reference.update)(this._tag, (0, _reference.combineSlice)(this.children));
        }
    }
    evaluate(vm) {
        let { artifacts, lastIterated } = this;
        if (!(0, _reference.validate)(artifacts.tag, lastIterated)) {
            let { bounds } = this;
            let { dom } = vm;
            let marker = dom.createComment('');
            dom.insertAfter(bounds.parentElement(), marker, bounds.lastNode());
            let target = new ListRevalidationDelegate(this, marker);
            let synchronizer = new _reference.IteratorSynchronizer({ target, artifacts, env: vm.env });
            synchronizer.sync();
            this.parentElement().removeChild(marker);
        }
        // Run now-updated updating opcodes
        super.evaluate(vm);
    }
    vmForInsertion(nextSibling) {
        let { bounds, state, runtime } = this;
        let elementStack = _elementBuilder.NewElementBuilder.forInitialRender(runtime.env, {
            element: bounds.parentElement(),
            nextSibling
        });
        return state.resume(runtime, elementStack);
    }
}
exports.ListBlockOpcode = ListBlockOpcode;
class UpdatingVMFrame {
    constructor(ops, exceptionHandler) {
        this.ops = ops;
        this.exceptionHandler = exceptionHandler;
        this.current = ops.head();
    }
    goto(op) {
        this.current = op;
    }
    nextStatement() {
        let { current, ops } = this;
        if (current) this.current = ops.nextNode(current);
        return current;
    }
    handleException() {
        if (this.exceptionHandler) {
            this.exceptionHandler.handleException();
        }
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL3VwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFpQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBRWMsTUFBQSxVQUFBLENBQWlCO0FBTzdCLGdCQUFBLEdBQUEsRUFBOEIsRUFBRSxtQkFBaEMsS0FBOEIsRUFBOUIsRUFBMEQ7QUFGbEQsYUFBQSxVQUFBLEdBQXFDLElBQXJDLFdBQXFDLEVBQXJDO0FBR04sYUFBQSxHQUFBLEdBQUEsR0FBQTtBQUNBLGFBQUEsR0FBQSxHQUFXLElBQVgsTUFBVyxFQUFYO0FBQ0EsYUFBQSxnQkFBQSxHQUFBLGdCQUFBO0FBQ0Q7QUFFRCxZQUFBLE9BQUEsRUFBQSxPQUFBLEVBQXlEO0FBQ3ZELFlBQUksRUFBQSxVQUFBLEtBQUosSUFBQTtBQUVBLGFBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQSxPQUFBO0FBRUEsZUFBQSxJQUFBLEVBQWE7QUFDWCxnQkFBSSxXQUFKLE9BQUksRUFBSixFQUEwQjtBQUUxQixnQkFBSSxTQUFTLEtBQUEsS0FBQSxDQUFiLGFBQWEsRUFBYjtBQUVBLGdCQUFJLFdBQUosSUFBQSxFQUFxQjtBQUNuQiwyQkFBQSxHQUFBO0FBQ0E7QUFDRDtBQUVELG1CQUFBLFFBQUEsQ0FBQSxJQUFBO0FBQ0Q7QUFDRjtBQUVELFFBQUEsS0FBQSxHQUFpQjtBQUNmLGVBQWMsS0FBQSxVQUFBLENBQWQsT0FBQTtBQUNEO0FBRUQsU0FBQSxFQUFBLEVBQXVCO0FBQ3JCLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0Q7QUFFRCxRQUFBLEdBQUEsRUFBQSxPQUFBLEVBQXlEO0FBQ3ZELGFBQUEsVUFBQSxDQUFBLElBQUEsQ0FBcUIsSUFBQSxlQUFBLENBQUEsR0FBQSxFQUFyQixPQUFxQixDQUFyQjtBQUNEO0FBRUQsWUFBSztBQUNILGFBQUEsS0FBQSxDQUFBLGVBQUE7QUFDQSxh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O0FBRmlFLFNBQWhELENBQW5CO0FBS0EsZUFBTyxNQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQVAsWUFBTyxDQUFQO0FBQ0Q7QUFqRTZDO1FBQTFDLGUsR0FBQSxlO0FBb0VOLE1BQUEsZUFBQSxDQUFxQjtBQUduQixnQkFBQSxHQUFBLEVBQUEsZ0JBQUEsRUFBMEY7QUFBdEUsYUFBQSxHQUFBLEdBQUEsR0FBQTtBQUE0QixhQUFBLGdCQUFBLEdBQUEsZ0JBQUE7QUFDOUMsYUFBQSxPQUFBLEdBQWUsSUFBZixJQUFlLEVBQWY7QUFDRDtBQUVELFNBQUEsRUFBQSxFQUF1QjtBQUNyQixhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0Q7QUFFRCxvQkFBYTtBQUNYLFlBQUksRUFBQSxPQUFBLEVBQUEsR0FBQSxLQUFKLElBQUE7QUFDQSxZQUFBLE9BQUEsRUFBYSxLQUFBLE9BQUEsR0FBZSxJQUFBLFFBQUEsQ0FBZixPQUFlLENBQWY7QUFDYixlQUFBLE9BQUE7QUFDRDtBQUVELHNCQUFlO0FBQ2IsWUFBSSxLQUFKLGdCQUFBLEVBQTJCO0FBQ3pCLGlCQUFBLGdCQUFBLENBQUEsZUFBQTtBQUNEO0FBQ0Y7QUFyQmtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQm91bmRzLFxuICBEeW5hbWljU2NvcGUsXG4gIEVudmlyb25tZW50LFxuICBFeGNlcHRpb25IYW5kbGVyLFxuICBHbGltbWVyVHJlZUNoYW5nZXMsXG4gIEppdE9yQW90QmxvY2ssXG4gIFJ1bnRpbWVDb250ZXh0LFxuICBTY29wZSxcbiAgQW90UnVudGltZUNvbnRleHQsXG4gIEppdFJ1bnRpbWVDb250ZXh0LFxuICBFbGVtZW50QnVpbGRlcixcbiAgTGl2ZUJsb2NrLFxuICBVcGRhdGFibGVCbG9jayxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQge1xuICAvLyBUYWdzXG4gIGNvbWJpbmUsXG4gIHZhbHVlLFxuICB1cGRhdGUsXG4gIHZhbGlkYXRlLFxuICBjcmVhdGVVcGRhdGFibGVUYWcsXG4gIFRhZyxcbiAgVXBkYXRhYmxlVGFnLFxuICBSZXZpc2lvbixcbiAgY29tYmluZVNsaWNlLFxuICBJTklUSUFMLFxuICBJdGVyYXRpb25BcnRpZmFjdHMsXG4gIEl0ZXJhdG9yU3luY2hyb25pemVyLFxuICBJdGVyYXRvclN5bmNocm9uaXplckRlbGVnYXRlLFxuICBQYXRoUmVmZXJlbmNlLFxuICBFTkQsXG59IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBhc3NvY2lhdGUsIGV4cGVjdCwgTGlua2VkTGlzdCwgT3B0aW9uLCBTdGFjayB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgU2ltcGxlQ29tbWVudCwgU2ltcGxlTm9kZSB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBtb3ZlIGFzIG1vdmVCb3VuZHMgfSBmcm9tICcuLi9ib3VuZHMnO1xuaW1wb3J0IHsgYXN5bmNSZXNldCwgZGV0YWNoIH0gZnJvbSAnLi4vbGlmZXRpbWUnO1xuaW1wb3J0IHsgVXBkYXRpbmdPcGNvZGUsIFVwZGF0aW5nT3BTZXEgfSBmcm9tICcuLi9vcGNvZGVzJztcbmltcG9ydCB7IEludGVybmFsVk0sIFZtSW5pdENhbGxiYWNrLCBKaXRWTSB9IGZyb20gJy4vYXBwZW5kJztcbmltcG9ydCB7IE5ld0VsZW1lbnRCdWlsZGVyIH0gZnJvbSAnLi9lbGVtZW50LWJ1aWxkZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVcGRhdGluZ1ZNIHtcbiAgcHVibGljIGVudjogRW52aXJvbm1lbnQ7XG4gIHB1YmxpYyBkb206IEdsaW1tZXJUcmVlQ2hhbmdlcztcbiAgcHVibGljIGFsd2F5c1JldmFsaWRhdGU6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBmcmFtZVN0YWNrOiBTdGFjazxVcGRhdGluZ1ZNRnJhbWU+ID0gbmV3IFN0YWNrPFVwZGF0aW5nVk1GcmFtZT4oKTtcblxuICBjb25zdHJ1Y3RvcihlbnY6IEVudmlyb25tZW50LCB7IGFsd2F5c1JldmFsaWRhdGUgPSBmYWxzZSB9KSB7XG4gICAgdGhpcy5lbnYgPSBlbnY7XG4gICAgdGhpcy5kb20gPSBlbnYuZ2V0RE9NKCk7XG4gICAgdGhpcy5hbHdheXNSZXZhbGlkYXRlID0gYWx3YXlzUmV2YWxpZGF0ZTtcbiAgfVxuXG4gIGV4ZWN1dGUob3Bjb2RlczogVXBkYXRpbmdPcFNlcSwgaGFuZGxlcjogRXhjZXB0aW9uSGFuZGxlcikge1xuICAgIGxldCB7IGZyYW1lU3RhY2sgfSA9IHRoaXM7XG5cbiAgICB0aGlzLnRyeShvcGNvZGVzLCBoYW5kbGVyKTtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoZnJhbWVTdGFjay5pc0VtcHR5KCkpIGJyZWFrO1xuXG4gICAgICBsZXQgb3Bjb2RlID0gdGhpcy5mcmFtZS5uZXh0U3RhdGVtZW50KCk7XG5cbiAgICAgIGlmIChvcGNvZGUgPT09IG51bGwpIHtcbiAgICAgICAgZnJhbWVTdGFjay5wb3AoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIG9wY29kZS5ldmFsdWF0ZSh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldCBmcmFtZSgpIHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXMuZnJhbWVTdGFjay5jdXJyZW50LCAnYnVnOiBleHBlY3RlZCBhIGZyYW1lJyk7XG4gIH1cblxuICBnb3RvKG9wOiBVcGRhdGluZ09wY29kZSkge1xuICAgIHRoaXMuZnJhbWUuZ290byhvcCk7XG4gIH1cblxuICB0cnkob3BzOiBVcGRhdGluZ09wU2VxLCBoYW5kbGVyOiBPcHRpb248RXhjZXB0aW9uSGFuZGxlcj4pIHtcbiAgICB0aGlzLmZyYW1lU3RhY2sucHVzaChuZXcgVXBkYXRpbmdWTUZyYW1lKG9wcywgaGFuZGxlcikpO1xuICB9XG5cbiAgdGhyb3coKSB7XG4gICAgdGhpcy5mcmFtZS5oYW5kbGVFeGNlcHRpb24oKTtcbiAgICB0aGlzLmZyYW1lU3RhY2sucG9wKCk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBWTVN0YXRlIHtcbiAgcmVhZG9ubHkgcGM6IG51bWJlcjtcbiAgcmVhZG9ubHkgc2NvcGU6IFNjb3BlPEppdE9yQW90QmxvY2s+O1xuICByZWFkb25seSBkeW5hbWljU2NvcGU6IER5bmFtaWNTY29wZTtcbiAgcmVhZG9ubHkgc3RhY2s6IHVua25vd25bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXN1bWFibGVWTVN0YXRlPFYgZXh0ZW5kcyBJbnRlcm5hbFZNPiB7XG4gIHJlc3VtZShydW50aW1lOiBSdW50aW1lQ29udGV4dCwgYnVpbGRlcjogRWxlbWVudEJ1aWxkZXIpOiBWO1xufVxuXG5leHBvcnQgY2xhc3MgUmVzdW1hYmxlVk1TdGF0ZUltcGw8ViBleHRlbmRzIEludGVybmFsVk0+IGltcGxlbWVudHMgUmVzdW1hYmxlVk1TdGF0ZTxWPiB7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHN0YXRlOiBWTVN0YXRlLCBwcml2YXRlIHJlc3VtZUNhbGxiYWNrOiBWbUluaXRDYWxsYmFjazxWPikge31cblxuICByZXN1bWUoXG4gICAgcnVudGltZTogViBleHRlbmRzIEppdFZNID8gSml0UnVudGltZUNvbnRleHQgOiBBb3RSdW50aW1lQ29udGV4dCxcbiAgICBidWlsZGVyOiBFbGVtZW50QnVpbGRlclxuICApOiBWIHtcbiAgICByZXR1cm4gdGhpcy5yZXN1bWVDYWxsYmFjayhydW50aW1lLCB0aGlzLnN0YXRlLCBidWlsZGVyKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmxvY2tPcGNvZGUgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSBpbXBsZW1lbnRzIEJvdW5kcyB7XG4gIHB1YmxpYyB0eXBlID0gJ2Jsb2NrJztcbiAgcHVibGljIG5leHQgPSBudWxsO1xuICBwdWJsaWMgcHJldiA9IG51bGw7XG4gIHJlYWRvbmx5IGNoaWxkcmVuOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPjtcblxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgYm91bmRzOiBMaXZlQmxvY2s7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIHN0YXRlOiBSZXN1bWFibGVWTVN0YXRlPEludGVybmFsVk0+LFxuICAgIHByb3RlY3RlZCBydW50aW1lOiBSdW50aW1lQ29udGV4dCxcbiAgICBib3VuZHM6IExpdmVCbG9jayxcbiAgICBjaGlsZHJlbjogTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT5cbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcbiAgfVxuXG4gIGFic3RyYWN0IGRpZEluaXRpYWxpemVDaGlsZHJlbigpOiB2b2lkO1xuXG4gIHBhcmVudEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLnBhcmVudEVsZW1lbnQoKTtcbiAgfVxuXG4gIGZpcnN0Tm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMuZmlyc3ROb2RlKCk7XG4gIH1cblxuICBsYXN0Tm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMubGFzdE5vZGUoKTtcbiAgfVxuXG4gIGV2YWx1YXRlKHZtOiBVcGRhdGluZ1ZNKSB7XG4gICAgdm0udHJ5KHRoaXMuY2hpbGRyZW4sIG51bGwpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcnlPcGNvZGUgZXh0ZW5kcyBCbG9ja09wY29kZSBpbXBsZW1lbnRzIEV4Y2VwdGlvbkhhbmRsZXIge1xuICBwdWJsaWMgdHlwZSA9ICd0cnknO1xuXG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBwcml2YXRlIF90YWc6IFVwZGF0YWJsZVRhZztcblxuICBwcm90ZWN0ZWQgYm91bmRzITogVXBkYXRhYmxlQmxvY2s7IC8vIEhpZGVzIHByb3BlcnR5IG9uIGJhc2UgY2xhc3NcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzdGF0ZTogUmVzdW1hYmxlVk1TdGF0ZTxJbnRlcm5hbFZNPixcbiAgICBydW50aW1lOiBSdW50aW1lQ29udGV4dCxcbiAgICBib3VuZHM6IFVwZGF0YWJsZUJsb2NrLFxuICAgIGNoaWxkcmVuOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPlxuICApIHtcbiAgICBzdXBlcihzdGF0ZSwgcnVudGltZSwgYm91bmRzLCBjaGlsZHJlbik7XG4gICAgdGhpcy50YWcgPSB0aGlzLl90YWcgPSBjcmVhdGVVcGRhdGFibGVUYWcoKTtcbiAgfVxuXG4gIGRpZEluaXRpYWxpemVDaGlsZHJlbigpIHtcbiAgICB1cGRhdGUodGhpcy5fdGFnLCBjb21iaW5lU2xpY2UodGhpcy5jaGlsZHJlbikpO1xuICB9XG5cbiAgZXZhbHVhdGUodm06IFVwZGF0aW5nVk0pIHtcbiAgICB2bS50cnkodGhpcy5jaGlsZHJlbiwgdGhpcyk7XG4gIH1cblxuICBoYW5kbGVFeGNlcHRpb24oKSB7XG4gICAgbGV0IHsgc3RhdGUsIGJvdW5kcywgY2hpbGRyZW4sIHByZXYsIG5leHQsIHJ1bnRpbWUgfSA9IHRoaXM7XG5cbiAgICBjaGlsZHJlbi5jbGVhcigpO1xuICAgIGFzeW5jUmVzZXQodGhpcywgcnVudGltZS5lbnYpO1xuXG4gICAgbGV0IGVsZW1lbnRTdGFjayA9IE5ld0VsZW1lbnRCdWlsZGVyLnJlc3VtZShydW50aW1lLmVudiwgYm91bmRzKTtcbiAgICBsZXQgdm0gPSBzdGF0ZS5yZXN1bWUocnVudGltZSwgZWxlbWVudFN0YWNrKTtcblxuICAgIGxldCB1cGRhdGluZyA9IG5ldyBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPigpO1xuXG4gICAgbGV0IHJlc3VsdCA9IHZtLmV4ZWN1dGUodm0gPT4ge1xuICAgICAgdm0ucHVzaFVwZGF0aW5nKHVwZGF0aW5nKTtcbiAgICAgIHZtLnVwZGF0ZVdpdGgodGhpcyk7XG4gICAgICB2bS5wdXNoVXBkYXRpbmcoY2hpbGRyZW4pO1xuICAgIH0pO1xuXG4gICAgYXNzb2NpYXRlKHRoaXMsIHJlc3VsdC5kcm9wKTtcblxuICAgIHRoaXMucHJldiA9IHByZXY7XG4gICAgdGhpcy5uZXh0ID0gbmV4dDtcbiAgfVxufVxuXG5jbGFzcyBMaXN0UmV2YWxpZGF0aW9uRGVsZWdhdGUgaW1wbGVtZW50cyBJdGVyYXRvclN5bmNocm9uaXplckRlbGVnYXRlPEVudmlyb25tZW50PiB7XG4gIHByaXZhdGUgbWFwOiBNYXA8dW5rbm93biwgQmxvY2tPcGNvZGU+O1xuICBwcml2YXRlIHVwZGF0aW5nOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPjtcblxuICBwcml2YXRlIGRpZEluc2VydCA9IGZhbHNlO1xuICBwcml2YXRlIGRpZERlbGV0ZSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgb3Bjb2RlOiBMaXN0QmxvY2tPcGNvZGUsIHByaXZhdGUgbWFya2VyOiBTaW1wbGVDb21tZW50KSB7XG4gICAgdGhpcy5tYXAgPSBvcGNvZGUubWFwO1xuICAgIHRoaXMudXBkYXRpbmcgPSBvcGNvZGVbJ2NoaWxkcmVuJ107XG4gIH1cblxuICBpbnNlcnQoXG4gICAgX2VudjogRW52aXJvbm1lbnQsXG4gICAga2V5OiB1bmtub3duLFxuICAgIGl0ZW06IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgbWVtbzogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBiZWZvcmU6IHVua25vd25cbiAgKSB7XG4gICAgbGV0IHsgbWFwLCBvcGNvZGUsIHVwZGF0aW5nIH0gPSB0aGlzO1xuICAgIGxldCBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+ID0gbnVsbDtcbiAgICBsZXQgcmVmZXJlbmNlOiBPcHRpb248QmxvY2tPcGNvZGU+ID0gbnVsbDtcblxuICAgIGlmICh0eXBlb2YgYmVmb3JlID09PSAnc3RyaW5nJykge1xuICAgICAgcmVmZXJlbmNlID0gbWFwLmdldChiZWZvcmUpITtcbiAgICAgIG5leHRTaWJsaW5nID0gcmVmZXJlbmNlWydib3VuZHMnXS5maXJzdE5vZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dFNpYmxpbmcgPSB0aGlzLm1hcmtlcjtcbiAgICB9XG5cbiAgICBsZXQgdm0gPSBvcGNvZGUudm1Gb3JJbnNlcnRpb24obmV4dFNpYmxpbmcpO1xuICAgIGxldCB0cnlPcGNvZGU6IE9wdGlvbjxUcnlPcGNvZGU+ID0gbnVsbDtcblxuICAgIHZtLmV4ZWN1dGUodm0gPT4ge1xuICAgICAgdHJ5T3Bjb2RlID0gdm0uaXRlcmF0ZShtZW1vLCBpdGVtKTtcbiAgICAgIG1hcC5zZXQoa2V5LCB0cnlPcGNvZGUpO1xuICAgICAgdm0ucHVzaFVwZGF0aW5nKG5ldyBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPigpKTtcbiAgICAgIHZtLnVwZGF0ZVdpdGgodHJ5T3Bjb2RlKTtcbiAgICAgIHZtLnB1c2hVcGRhdGluZyh0cnlPcGNvZGUuY2hpbGRyZW4pO1xuICAgIH0pO1xuXG4gICAgdXBkYXRpbmcuaW5zZXJ0QmVmb3JlKHRyeU9wY29kZSEsIHJlZmVyZW5jZSk7XG5cbiAgICB0aGlzLmRpZEluc2VydCA9IHRydWU7XG4gIH1cblxuICByZXRhaW4oXG4gICAgX2VudjogRW52aXJvbm1lbnQsXG4gICAgX2tleTogdW5rbm93bixcbiAgICBfaXRlbTogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBfbWVtbzogUGF0aFJlZmVyZW5jZTx1bmtub3duPlxuICApIHt9XG5cbiAgbW92ZShcbiAgICBfZW52OiBFbnZpcm9ubWVudCxcbiAgICBrZXk6IHVua25vd24sXG4gICAgX2l0ZW06IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgX21lbW86IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgYmVmb3JlOiB1bmtub3duXG4gICkge1xuICAgIGxldCB7IG1hcCwgdXBkYXRpbmcgfSA9IHRoaXM7XG5cbiAgICBsZXQgZW50cnkgPSBtYXAuZ2V0KGtleSkhO1xuXG4gICAgaWYgKGJlZm9yZSA9PT0gRU5EKSB7XG4gICAgICBtb3ZlQm91bmRzKGVudHJ5LCB0aGlzLm1hcmtlcik7XG4gICAgICB1cGRhdGluZy5yZW1vdmUoZW50cnkpO1xuICAgICAgdXBkYXRpbmcuYXBwZW5kKGVudHJ5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJlZmVyZW5jZSA9IG1hcC5nZXQoYmVmb3JlKSE7XG4gICAgICBtb3ZlQm91bmRzKGVudHJ5LCByZWZlcmVuY2UuZmlyc3ROb2RlKCkpO1xuICAgICAgdXBkYXRpbmcucmVtb3ZlKGVudHJ5KTtcbiAgICAgIHVwZGF0aW5nLmluc2VydEJlZm9yZShlbnRyeSwgcmVmZXJlbmNlKTtcbiAgICB9XG4gIH1cblxuICBkZWxldGUoZW52OiBFbnZpcm9ubWVudCwga2V5OiB1bmtub3duKSB7XG4gICAgbGV0IHsgbWFwLCB1cGRhdGluZyB9ID0gdGhpcztcbiAgICBsZXQgb3Bjb2RlID0gbWFwLmdldChrZXkpITtcbiAgICBkZXRhY2gob3Bjb2RlLCBlbnYpO1xuICAgIHVwZGF0aW5nLnJlbW92ZShvcGNvZGUpO1xuICAgIG1hcC5kZWxldGUoa2V5KTtcblxuICAgIHRoaXMuZGlkRGVsZXRlID0gdHJ1ZTtcbiAgfVxuXG4gIGRvbmUoKSB7XG4gICAgdGhpcy5vcGNvZGUuZGlkSW5pdGlhbGl6ZUNoaWxkcmVuKHRoaXMuZGlkSW5zZXJ0IHx8IHRoaXMuZGlkRGVsZXRlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTGlzdEJsb2NrT3Bjb2RlIGV4dGVuZHMgQmxvY2tPcGNvZGUge1xuICBwdWJsaWMgdHlwZSA9ICdsaXN0LWJsb2NrJztcbiAgcHVibGljIG1hcCA9IG5ldyBNYXA8dW5rbm93biwgQmxvY2tPcGNvZGU+KCk7XG4gIHB1YmxpYyBhcnRpZmFjdHM6IEl0ZXJhdGlvbkFydGlmYWN0cztcbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIHByaXZhdGUgbGFzdEl0ZXJhdGVkOiBSZXZpc2lvbiA9IElOSVRJQUw7XG4gIHByaXZhdGUgX3RhZzogVXBkYXRhYmxlVGFnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHN0YXRlOiBSZXN1bWFibGVWTVN0YXRlPEludGVybmFsVk0+LFxuICAgIHJ1bnRpbWU6IFJ1bnRpbWVDb250ZXh0LFxuICAgIGJvdW5kczogTGl2ZUJsb2NrLFxuICAgIGNoaWxkcmVuOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPixcbiAgICBhcnRpZmFjdHM6IEl0ZXJhdGlvbkFydGlmYWN0c1xuICApIHtcbiAgICBzdXBlcihzdGF0ZSwgcnVudGltZSwgYm91bmRzLCBjaGlsZHJlbik7XG4gICAgdGhpcy5hcnRpZmFjdHMgPSBhcnRpZmFjdHM7XG4gICAgbGV0IF90YWcgPSAodGhpcy5fdGFnID0gY3JlYXRlVXBkYXRhYmxlVGFnKCkpO1xuICAgIHRoaXMudGFnID0gY29tYmluZShbYXJ0aWZhY3RzLnRhZywgX3RhZ10pO1xuICB9XG5cbiAgZGlkSW5pdGlhbGl6ZUNoaWxkcmVuKGxpc3REaWRDaGFuZ2UgPSB0cnVlKSB7XG4gICAgdGhpcy5sYXN0SXRlcmF0ZWQgPSB2YWx1ZSh0aGlzLmFydGlmYWN0cy50YWcpO1xuXG4gICAgaWYgKGxpc3REaWRDaGFuZ2UpIHtcbiAgICAgIHVwZGF0ZSh0aGlzLl90YWcsIGNvbWJpbmVTbGljZSh0aGlzLmNoaWxkcmVuKSk7XG4gICAgfVxuICB9XG5cbiAgZXZhbHVhdGUodm06IFVwZGF0aW5nVk0pIHtcbiAgICBsZXQgeyBhcnRpZmFjdHMsIGxhc3RJdGVyYXRlZCB9ID0gdGhpcztcblxuICAgIGlmICghdmFsaWRhdGUoYXJ0aWZhY3RzLnRhZywgbGFzdEl0ZXJhdGVkKSkge1xuICAgICAgbGV0IHsgYm91bmRzIH0gPSB0aGlzO1xuICAgICAgbGV0IHsgZG9tIH0gPSB2bTtcblxuICAgICAgbGV0IG1hcmtlciA9IGRvbS5jcmVhdGVDb21tZW50KCcnKTtcbiAgICAgIGRvbS5pbnNlcnRBZnRlcihcbiAgICAgICAgYm91bmRzLnBhcmVudEVsZW1lbnQoKSxcbiAgICAgICAgbWFya2VyLFxuICAgICAgICBleHBlY3QoYm91bmRzLmxhc3ROb2RlKCksIFwiY2FuJ3QgaW5zZXJ0IGFmdGVyIGFuIGVtcHR5IGJvdW5kc1wiKVxuICAgICAgKTtcblxuICAgICAgbGV0IHRhcmdldCA9IG5ldyBMaXN0UmV2YWxpZGF0aW9uRGVsZWdhdGUodGhpcywgbWFya2VyKTtcbiAgICAgIGxldCBzeW5jaHJvbml6ZXIgPSBuZXcgSXRlcmF0b3JTeW5jaHJvbml6ZXIoeyB0YXJnZXQsIGFydGlmYWN0cywgZW52OiB2bS5lbnYgfSk7XG5cbiAgICAgIHN5bmNocm9uaXplci5zeW5jKCk7XG5cbiAgICAgIHRoaXMucGFyZW50RWxlbWVudCgpLnJlbW92ZUNoaWxkKG1hcmtlcik7XG4gICAgfVxuXG4gICAgLy8gUnVuIG5vdy11cGRhdGVkIHVwZGF0aW5nIG9wY29kZXNcbiAgICBzdXBlci5ldmFsdWF0ZSh2bSk7XG4gIH1cblxuICB2bUZvckluc2VydGlvbihuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+KTogSW50ZXJuYWxWTTxKaXRPckFvdEJsb2NrPiB7XG4gICAgbGV0IHsgYm91bmRzLCBzdGF0ZSwgcnVudGltZSB9ID0gdGhpcztcblxuICAgIGxldCBlbGVtZW50U3RhY2sgPSBOZXdFbGVtZW50QnVpbGRlci5mb3JJbml0aWFsUmVuZGVyKHJ1bnRpbWUuZW52LCB7XG4gICAgICBlbGVtZW50OiBib3VuZHMucGFyZW50RWxlbWVudCgpLFxuICAgICAgbmV4dFNpYmxpbmcsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RhdGUucmVzdW1lKHJ1bnRpbWUsIGVsZW1lbnRTdGFjayk7XG4gIH1cbn1cblxuY2xhc3MgVXBkYXRpbmdWTUZyYW1lIHtcbiAgcHJpdmF0ZSBjdXJyZW50OiBPcHRpb248VXBkYXRpbmdPcGNvZGU+O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgb3BzOiBVcGRhdGluZ09wU2VxLCBwcml2YXRlIGV4Y2VwdGlvbkhhbmRsZXI6IE9wdGlvbjxFeGNlcHRpb25IYW5kbGVyPikge1xuICAgIHRoaXMuY3VycmVudCA9IG9wcy5oZWFkKCk7XG4gIH1cblxuICBnb3RvKG9wOiBVcGRhdGluZ09wY29kZSkge1xuICAgIHRoaXMuY3VycmVudCA9IG9wO1xuICB9XG5cbiAgbmV4dFN0YXRlbWVudCgpOiBPcHRpb248VXBkYXRpbmdPcGNvZGU+IHtcbiAgICBsZXQgeyBjdXJyZW50LCBvcHMgfSA9IHRoaXM7XG4gICAgaWYgKGN1cnJlbnQpIHRoaXMuY3VycmVudCA9IG9wcy5uZXh0Tm9kZShjdXJyZW50KTtcbiAgICByZXR1cm4gY3VycmVudDtcbiAgfVxuXG4gIGhhbmRsZUV4Y2VwdGlvbigpIHtcbiAgICBpZiAodGhpcy5leGNlcHRpb25IYW5kbGVyKSB7XG4gICAgICB0aGlzLmV4Y2VwdGlvbkhhbmRsZXIuaGFuZGxlRXhjZXB0aW9uKCk7XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9