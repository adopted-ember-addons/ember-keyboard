"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UpdateDynamicAttributeOpcode = exports.UpdateModifierOpcode = undefined;

var _reference = require("@glimmer/reference");

var _vm = require("@glimmer/vm");

var _opcodes = require("../../opcodes");

var _vm2 = require("./vm");

var _symbols = require("../../symbols");

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

_opcodes.APPEND_OPCODES.add(40 /* Text */, function (vm, _ref) {
    var text = _ref.op1;

    vm.elements().appendText(vm[_symbols.CONSTANTS].getString(text));
});
_opcodes.APPEND_OPCODES.add(41 /* Comment */, function (vm, _ref2) {
    var text = _ref2.op1;

    vm.elements().appendComment(vm[_symbols.CONSTANTS].getString(text));
});
_opcodes.APPEND_OPCODES.add(47 /* OpenElement */, function (vm, _ref3) {
    var tag = _ref3.op1;

    vm.elements().openElement(vm[_symbols.CONSTANTS].getString(tag));
});
_opcodes.APPEND_OPCODES.add(48 /* OpenDynamicElement */, function (vm) {
    var tagName = vm.stack.pop().value();
    vm.elements().openElement(tagName);
});
_opcodes.APPEND_OPCODES.add(49 /* PushRemoteElement */, function (vm) {
    var elementRef = vm.stack.pop();
    var insertBeforeRef = vm.stack.pop();
    var guidRef = vm.stack.pop();
    var element = void 0;
    var insertBefore = void 0;
    var guid = guidRef.value();
    if ((0, _reference.isConst)(elementRef)) {
        element = elementRef.value();
    } else {
        var cache = new _reference.ReferenceCache(elementRef);
        element = cache.peek();
        vm.updateWith(new _vm2.Assert(cache));
    }
    if (insertBeforeRef.value() !== undefined) {
        if ((0, _reference.isConst)(insertBeforeRef)) {
            insertBefore = insertBeforeRef.value();
        } else {
            var _cache = new _reference.ReferenceCache(insertBeforeRef);
            insertBefore = _cache.peek();
            vm.updateWith(new _vm2.Assert(_cache));
        }
    }
    var block = vm.elements().pushRemoteElement(element, guid, insertBefore);
    if (block) vm.associateDestroyable(block);
});
_opcodes.APPEND_OPCODES.add(55 /* PopRemoteElement */, function (vm) {
    vm.elements().popRemoteElement();
});
_opcodes.APPEND_OPCODES.add(53 /* FlushElement */, function (vm) {
    var operations = vm.fetchValue(_vm.$t0);
    var modifiers = null;
    if (operations) {
        modifiers = operations.flush(vm);
        vm.loadValue(_vm.$t0, null);
    }
    vm.elements().flushElement(modifiers);
});
_opcodes.APPEND_OPCODES.add(54 /* CloseElement */, function (vm) {
    var modifiers = vm.elements().closeElement();
    if (modifiers) {
        modifiers.forEach(function (_ref4) {
            var manager = _ref4[0],
                modifier = _ref4[1];

            vm.env.scheduleInstallModifier(modifier, manager);
            var d = manager.getDestructor(modifier);
            if (d) {
                vm.associateDestroyable(d);
            }
        });
    }
});
_opcodes.APPEND_OPCODES.add(56 /* Modifier */, function (vm, _ref5) {
    var handle = _ref5.op1;

    var _vm$runtime$resolver$ = vm.runtime.resolver.resolve(handle),
        manager = _vm$runtime$resolver$.manager,
        state = _vm$runtime$resolver$.state;

    var stack = vm.stack;
    var args = stack.pop();

    var _vm$elements = vm.elements(),
        constructing = _vm$elements.constructing,
        updateOperations = _vm$elements.updateOperations;

    var dynamicScope = vm.dynamicScope();
    var modifier = manager.create(constructing, state, args, dynamicScope, updateOperations);
    var operations = vm.fetchValue(_vm.$t0);
    operations.addModifier(manager, modifier);
    var tag = manager.getTag(modifier);
    if (!(0, _reference.isConstTag)(tag)) {
        vm.updateWith(new UpdateModifierOpcode(tag, manager, modifier));
    }
});
var UpdateModifierOpcode = exports.UpdateModifierOpcode = function (_UpdatingOpcode) {
    _inherits(UpdateModifierOpcode, _UpdatingOpcode);

    function UpdateModifierOpcode(tag, manager, modifier) {
        _classCallCheck(this, UpdateModifierOpcode);

        var _this = _possibleConstructorReturn(this, _UpdatingOpcode.call(this));

        _this.tag = tag;
        _this.manager = manager;
        _this.modifier = modifier;
        _this.type = 'update-modifier';
        _this.lastUpdated = (0, _reference.value)(tag);
        return _this;
    }

    UpdateModifierOpcode.prototype.evaluate = function evaluate(vm) {
        var manager = this.manager,
            modifier = this.modifier,
            tag = this.tag,
            lastUpdated = this.lastUpdated;

        if (!(0, _reference.validate)(tag, lastUpdated)) {
            vm.env.scheduleUpdateModifier(modifier, manager);
            this.lastUpdated = (0, _reference.value)(tag);
        }
    };

    return UpdateModifierOpcode;
}(_opcodes.UpdatingOpcode);
_opcodes.APPEND_OPCODES.add(50 /* StaticAttr */, function (vm, _ref6) {
    var _name = _ref6.op1,
        _value = _ref6.op2,
        _namespace = _ref6.op3;

    var name = vm[_symbols.CONSTANTS].getString(_name);
    var value = vm[_symbols.CONSTANTS].getString(_value);
    var namespace = _namespace ? vm[_symbols.CONSTANTS].getString(_namespace) : null;
    vm.elements().setStaticAttribute(name, value, namespace);
});
_opcodes.APPEND_OPCODES.add(51 /* DynamicAttr */, function (vm, _ref7) {
    var _name = _ref7.op1,
        trusting = _ref7.op2,
        _namespace = _ref7.op3;

    var name = vm[_symbols.CONSTANTS].getString(_name);
    var reference = vm.stack.pop();
    var value = reference.value();
    var namespace = _namespace ? vm[_symbols.CONSTANTS].getString(_namespace) : null;
    var attribute = vm.elements().setDynamicAttribute(name, value, !!trusting, namespace);
    if (!(0, _reference.isConst)(reference)) {
        vm.updateWith(new UpdateDynamicAttributeOpcode(reference, attribute));
    }
});
var UpdateDynamicAttributeOpcode = exports.UpdateDynamicAttributeOpcode = function (_UpdatingOpcode2) {
    _inherits(UpdateDynamicAttributeOpcode, _UpdatingOpcode2);

    function UpdateDynamicAttributeOpcode(reference, attribute) {
        _classCallCheck(this, UpdateDynamicAttributeOpcode);

        var _this2 = _possibleConstructorReturn(this, _UpdatingOpcode2.call(this));

        _this2.reference = reference;
        _this2.attribute = attribute;
        _this2.type = 'patch-element';
        var tag = reference.tag;

        _this2.tag = tag;
        _this2.lastRevision = (0, _reference.value)(tag);
        return _this2;
    }

    UpdateDynamicAttributeOpcode.prototype.evaluate = function evaluate(vm) {
        var attribute = this.attribute,
            reference = this.reference,
            tag = this.tag;

        if (!(0, _reference.validate)(tag, this.lastRevision)) {
            this.lastRevision = (0, _reference.value)(tag);
            attribute.update(reference.value(), vm.env);
        }
    };

    return UpdateDynamicAttributeOpcode;
}(_opcodes.UpdatingOpcode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvZG9tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFhQTs7QUFNQTs7QUFFQTs7QUFHQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlBLHdCQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsVUFBQSxFQUE0QixVQUFBLEVBQUEsRUFBQSxJQUFBLEVBQXNCO0FBQUEsUUFBdEIsT0FBc0IsS0FBZixHQUFlOztBQUNoRCxPQUFBLFFBQUEsR0FBQSxVQUFBLENBQXlCLEdBQUEsa0JBQUEsRUFBQSxTQUFBLENBQXpCLElBQXlCLENBQXpCO0FBREYsQ0FBQTtBQUlBLHdCQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsYUFBQSxFQUErQixVQUFBLEVBQUEsRUFBQSxLQUFBLEVBQXNCO0FBQUEsUUFBdEIsT0FBc0IsTUFBZixHQUFlOztBQUNuRCxPQUFBLFFBQUEsR0FBQSxhQUFBLENBQTRCLEdBQUEsa0JBQUEsRUFBQSxTQUFBLENBQTVCLElBQTRCLENBQTVCO0FBREYsQ0FBQTtBQUlBLHdCQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsaUJBQUEsRUFBbUMsVUFBQSxFQUFBLEVBQUEsS0FBQSxFQUFxQjtBQUFBLFFBQXJCLE1BQXFCLE1BQWQsR0FBYzs7QUFDdEQsT0FBQSxRQUFBLEdBQUEsV0FBQSxDQUEwQixHQUFBLGtCQUFBLEVBQUEsU0FBQSxDQUExQixHQUEwQixDQUExQjtBQURGLENBQUE7QUFJQSx3QkFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLHdCQUFBLEVBQTBDLFVBQUEsRUFBQSxFQUFLO0FBQzdDLFFBQUksVUFBc0IsR0FBQSxLQUFBLENBQU4sR0FBTSxHQUExQixLQUEwQixFQUExQjtBQUNBLE9BQUEsUUFBQSxHQUFBLFdBQUEsQ0FBQSxPQUFBO0FBRkYsQ0FBQTtBQUtBLHdCQUFBLEdBQUEsQ0FBQSxFQUFB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LEVBQWMsS0FBbkIsWUFBSyxDQUFMLEVBQXVDO0FBQ3JDLGlCQUFBLFlBQUEsR0FBb0Isc0JBQXBCLEdBQW9CLENBQXBCO0FBQ0Esc0JBQUEsTUFBQSxDQUFpQixVQUFqQixLQUFpQixFQUFqQixFQUFvQyxHQUFwQyxHQUFBO0FBQ0Q7QUFsQkwsS0FBQTs7QUFBQSxXQUFBLDRCQUFBO0FBQUEsQ0FBQSxDQUFBLHVCQUFBLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZWZlcmVuY2UsXG4gIFJlZmVyZW5jZUNhY2hlLFxuICBSZXZpc2lvbixcbiAgVGFnLFxuICBWZXJzaW9uZWRSZWZlcmVuY2UsXG4gIGlzQ29uc3QsXG4gIGlzQ29uc3RUYWcsXG4gIHZhbHVlLFxuICB2YWxpZGF0ZSxcbn0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IGNoZWNrLCBDaGVja1N0cmluZywgQ2hlY2tFbGVtZW50LCBDaGVja09wdGlvbiwgQ2hlY2tOb2RlIH0gZnJvbSAnQGdsaW1tZXIvZGVidWcnO1xuaW1wb3J0IHsgT3AsIE9wdGlvbiwgTW9kaWZpZXJNYW5hZ2VyIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyAkdDAgfSBmcm9tICdAZ2xpbW1lci92bSc7XG5pbXBvcnQge1xuICBNb2RpZmllckRlZmluaXRpb24sXG4gIEludGVybmFsTW9kaWZpZXJNYW5hZ2VyLFxuICBNb2RpZmllckluc3RhbmNlU3RhdGUsXG59IGZyb20gJy4uLy4uL21vZGlmaWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQVBQRU5EX09QQ09ERVMsIFVwZGF0aW5nT3Bjb2RlIH0gZnJvbSAnLi4vLi4vb3Bjb2Rlcyc7XG5pbXBvcnQgeyBVcGRhdGluZ1ZNIH0gZnJvbSAnLi4vLi4vdm0nO1xuaW1wb3J0IHsgQXNzZXJ0IH0gZnJvbSAnLi92bSc7XG5pbXBvcnQgeyBEeW5hbWljQXR0cmlidXRlIH0gZnJvbSAnLi4vLi4vdm0vYXR0cmlidXRlcy9keW5hbWljJztcbmltcG9ydCB7IENoZWNrUmVmZXJlbmNlLCBDaGVja0FyZ3VtZW50cywgQ2hlY2tPcGVyYXRpb25zIH0gZnJvbSAnLi8tZGVidWctc3RyaXAnO1xuaW1wb3J0IHsgQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vc3ltYm9scyc7XG5pbXBvcnQgeyBTaW1wbGVFbGVtZW50LCBTaW1wbGVOb2RlIH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IGV4cGVjdCwgTWF5YmUgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlRleHQsICh2bSwgeyBvcDE6IHRleHQgfSkgPT4ge1xuICB2bS5lbGVtZW50cygpLmFwcGVuZFRleHQodm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcodGV4dCkpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Db21tZW50LCAodm0sIHsgb3AxOiB0ZXh0IH0pID0+IHtcbiAgdm0uZWxlbWVudHMoKS5hcHBlbmRDb21tZW50KHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKHRleHQpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuT3BlbkVsZW1lbnQsICh2bSwgeyBvcDE6IHRhZyB9KSA9PiB7XG4gIHZtLmVsZW1lbnRzKCkub3BlbkVsZW1lbnQodm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcodGFnKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLk9wZW5EeW5hbWljRWxlbWVudCwgdm0gPT4ge1xuICBsZXQgdGFnTmFtZSA9IGNoZWNrKGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSkudmFsdWUoKSwgQ2hlY2tTdHJpbmcpO1xuICB2bS5lbGVtZW50cygpLm9wZW5FbGVtZW50KHRhZ05hbWUpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXNoUmVtb3RlRWxlbWVudCwgdm0gPT4ge1xuICBsZXQgZWxlbWVudFJlZiA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG4gIGxldCBpbnNlcnRCZWZvcmVSZWYgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuICBsZXQgZ3VpZFJlZiA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG5cbiAgbGV0IGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQ7XG4gIGxldCBpbnNlcnRCZWZvcmU6IE1heWJlPFNpbXBsZU5vZGU+O1xuICBsZXQgZ3VpZCA9IGd1aWRSZWYudmFsdWUoKSBhcyBzdHJpbmc7XG5cbiAgaWYgKGlzQ29uc3QoZWxlbWVudFJlZikpIHtcbiAgICBlbGVtZW50ID0gY2hlY2soZWxlbWVudFJlZi52YWx1ZSgpLCBDaGVja0VsZW1lbnQpO1xuICB9IGVsc2Uge1xuICAgIGxldCBjYWNoZSA9IG5ldyBSZWZlcmVuY2VDYWNoZShlbGVtZW50UmVmIGFzIFJlZmVyZW5jZTxTaW1wbGVFbGVtZW50Pik7XG4gICAgZWxlbWVudCA9IGNoZWNrKGNhY2hlLnBlZWsoKSwgQ2hlY2tFbGVtZW50KTtcbiAgICB2bS51cGRhdGVXaXRoKG5ldyBBc3NlcnQoY2FjaGUpKTtcbiAgfVxuXG4gIGlmIChpbnNlcnRCZWZvcmVSZWYudmFsdWUoKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKGlzQ29uc3QoaW5zZXJ0QmVmb3JlUmVmKSkge1xuICAgICAgaW5zZXJ0QmVmb3JlID0gY2hlY2soaW5zZXJ0QmVmb3JlUmVmLnZhbHVlKCksIENoZWNrT3B0aW9uKENoZWNrTm9kZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgY2FjaGUgPSBuZXcgUmVmZXJlbmNlQ2FjaGUoaW5zZXJ0QmVmb3JlUmVmIGFzIFJlZmVyZW5jZTxPcHRpb248U2ltcGxlTm9kZT4+KTtcbiAgICAgIGluc2VydEJlZm9yZSA9IGNoZWNrKGNhY2hlLnBlZWsoKSwgQ2hlY2tPcHRpb24oQ2hlY2tOb2RlKSk7XG4gICAgICB2bS51cGRhdGVXaXRoKG5ldyBBc3NlcnQoY2FjaGUpKTtcbiAgICB9XG4gIH1cblxuICBsZXQgYmxvY2sgPSB2bS5lbGVtZW50cygpLnB1c2hSZW1vdGVFbGVtZW50KGVsZW1lbnQsIGd1aWQsIGluc2VydEJlZm9yZSk7XG4gIGlmIChibG9jaykgdm0uYXNzb2NpYXRlRGVzdHJveWFibGUoYmxvY2spO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Qb3BSZW1vdGVFbGVtZW50LCB2bSA9PiB7XG4gIHZtLmVsZW1lbnRzKCkucG9wUmVtb3RlRWxlbWVudCgpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5GbHVzaEVsZW1lbnQsIHZtID0+IHtcbiAgbGV0IG9wZXJhdGlvbnMgPSBjaGVjayh2bS5mZXRjaFZhbHVlKCR0MCksIENoZWNrT3BlcmF0aW9ucyk7XG4gIGxldCBtb2RpZmllcnM6IE9wdGlvbjxbTW9kaWZpZXJNYW5hZ2VyLCB1bmtub3duXVtdPiA9IG51bGw7XG5cbiAgaWYgKG9wZXJhdGlvbnMpIHtcbiAgICBtb2RpZmllcnMgPSBvcGVyYXRpb25zLmZsdXNoKHZtKTtcbiAgICB2bS5sb2FkVmFsdWUoJHQwLCBudWxsKTtcbiAgfVxuXG4gIHZtLmVsZW1lbnRzKCkuZmx1c2hFbGVtZW50KG1vZGlmaWVycyk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkNsb3NlRWxlbWVudCwgdm0gPT4ge1xuICBsZXQgbW9kaWZpZXJzID0gdm0uZWxlbWVudHMoKS5jbG9zZUVsZW1lbnQoKTtcblxuICBpZiAobW9kaWZpZXJzKSB7XG4gICAgbW9kaWZpZXJzLmZvckVhY2goKFttYW5hZ2VyLCBtb2RpZmllcl0pID0+IHtcbiAgICAgIHZtLmVudi5zY2hlZHVsZUluc3RhbGxNb2RpZmllcihtb2RpZmllciwgbWFuYWdlcik7XG4gICAgICBsZXQgZCA9IG1hbmFnZXIuZ2V0RGVzdHJ1Y3Rvcihtb2RpZmllcik7XG5cbiAgICAgIGlmIChkKSB7XG4gICAgICAgIHZtLmFzc29jaWF0ZURlc3Ryb3lhYmxlKGQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLk1vZGlmaWVyLCAodm0sIHsgb3AxOiBoYW5kbGUgfSkgPT4ge1xuICBsZXQgeyBtYW5hZ2VyLCBzdGF0ZSB9ID0gdm0ucnVudGltZS5yZXNvbHZlci5yZXNvbHZlPE1vZGlmaWVyRGVmaW5pdGlvbj4oaGFuZGxlKTtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIGxldCBhcmdzID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrQXJndW1lbnRzKTtcbiAgbGV0IHsgY29uc3RydWN0aW5nLCB1cGRhdGVPcGVyYXRpb25zIH0gPSB2bS5lbGVtZW50cygpO1xuICBsZXQgZHluYW1pY1Njb3BlID0gdm0uZHluYW1pY1Njb3BlKCk7XG4gIGxldCBtb2RpZmllciA9IG1hbmFnZXIuY3JlYXRlKFxuICAgIGV4cGVjdChjb25zdHJ1Y3RpbmcsICdCVUc6IEVsZW1lbnRNb2RpZmllciBjb3VsZCBub3QgZmluZCB0aGUgZWxlbWVudCBpdCBhcHBsaWVzIHRvJyksXG4gICAgc3RhdGUsXG4gICAgYXJncyxcbiAgICBkeW5hbWljU2NvcGUsXG4gICAgdXBkYXRlT3BlcmF0aW9uc1xuICApO1xuXG4gIGxldCBvcGVyYXRpb25zID0gZXhwZWN0KFxuICAgIGNoZWNrKHZtLmZldGNoVmFsdWUoJHQwKSwgQ2hlY2tPcGVyYXRpb25zKSxcbiAgICAnQlVHOiBFbGVtZW50TW9kaWZpZXIgY291bGQgbm90IGZpbmQgb3BlcmF0aW9ucyB0byBhcHBlbmQgdG8nXG4gICk7XG5cbiAgb3BlcmF0aW9ucy5hZGRNb2RpZmllcihtYW5hZ2VyLCBtb2RpZmllcik7XG5cbiAgbGV0IHRhZyA9IG1hbmFnZXIuZ2V0VGFnKG1vZGlmaWVyKTtcblxuICBpZiAoIWlzQ29uc3RUYWcodGFnKSkge1xuICAgIHZtLnVwZGF0ZVdpdGgobmV3IFVwZGF0ZU1vZGlmaWVyT3Bjb2RlKHRhZywgbWFuYWdlciwgbW9kaWZpZXIpKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVNb2RpZmllck9wY29kZSBleHRlbmRzIFVwZGF0aW5nT3Bjb2RlIHtcbiAgcHVibGljIHR5cGUgPSAndXBkYXRlLW1vZGlmaWVyJztcbiAgcHJpdmF0ZSBsYXN0VXBkYXRlZDogUmV2aXNpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHRhZzogVGFnLFxuICAgIHByaXZhdGUgbWFuYWdlcjogSW50ZXJuYWxNb2RpZmllck1hbmFnZXIsXG4gICAgcHJpdmF0ZSBtb2RpZmllcjogTW9kaWZpZXJJbnN0YW5jZVN0YXRlXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5sYXN0VXBkYXRlZCA9IHZhbHVlKHRhZyk7XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIGxldCB7IG1hbmFnZXIsIG1vZGlmaWVyLCB0YWcsIGxhc3RVcGRhdGVkIH0gPSB0aGlzO1xuXG4gICAgaWYgKCF2YWxpZGF0ZSh0YWcsIGxhc3RVcGRhdGVkKSkge1xuICAgICAgdm0uZW52LnNjaGVkdWxlVXBkYXRlTW9kaWZpZXIobW9kaWZpZXIsIG1hbmFnZXIpO1xuICAgICAgdGhpcy5sYXN0VXBkYXRlZCA9IHZhbHVlKHRhZyk7XG4gICAgfVxuICB9XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TdGF0aWNBdHRyLCAodm0sIHsgb3AxOiBfbmFtZSwgb3AyOiBfdmFsdWUsIG9wMzogX25hbWVzcGFjZSB9KSA9PiB7XG4gIGxldCBuYW1lID0gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcoX25hbWUpO1xuICBsZXQgdmFsdWUgPSB2bVtDT05TVEFOVFNdLmdldFN0cmluZyhfdmFsdWUpO1xuICBsZXQgbmFtZXNwYWNlID0gX25hbWVzcGFjZSA/IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lc3BhY2UpIDogbnVsbDtcblxuICB2bS5lbGVtZW50cygpLnNldFN0YXRpY0F0dHJpYnV0ZShuYW1lLCB2YWx1ZSwgbmFtZXNwYWNlKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuRHluYW1pY0F0dHIsICh2bSwgeyBvcDE6IF9uYW1lLCBvcDI6IHRydXN0aW5nLCBvcDM6IF9uYW1lc3BhY2UgfSkgPT4ge1xuICBsZXQgbmFtZSA9IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lKTtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG4gIGxldCB2YWx1ZSA9IHJlZmVyZW5jZS52YWx1ZSgpO1xuICBsZXQgbmFtZXNwYWNlID0gX25hbWVzcGFjZSA/IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lc3BhY2UpIDogbnVsbDtcblxuICBsZXQgYXR0cmlidXRlID0gdm0uZWxlbWVudHMoKS5zZXREeW5hbWljQXR0cmlidXRlKG5hbWUsIHZhbHVlLCAhIXRydXN0aW5nLCBuYW1lc3BhY2UpO1xuXG4gIGlmICghaXNDb25zdChyZWZlcmVuY2UpKSB7XG4gICAgdm0udXBkYXRlV2l0aChuZXcgVXBkYXRlRHluYW1pY0F0dHJpYnV0ZU9wY29kZShyZWZlcmVuY2UsIGF0dHJpYnV0ZSkpO1xuICB9XG59KTtcblxuZXhwb3J0IGNsYXNzIFVwZGF0ZUR5bmFtaWNBdHRyaWJ1dGVPcGNvZGUgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSB7XG4gIHB1YmxpYyB0eXBlID0gJ3BhdGNoLWVsZW1lbnQnO1xuXG4gIHB1YmxpYyB0YWc6IFRhZztcbiAgcHVibGljIGxhc3RSZXZpc2lvbjogUmV2aXNpb247XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWZlcmVuY2U6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPiwgcHJpdmF0ZSBhdHRyaWJ1dGU6IER5bmFtaWNBdHRyaWJ1dGUpIHtcbiAgICBzdXBlcigpO1xuICAgIGxldCB7IHRhZyB9ID0gcmVmZXJlbmNlO1xuICAgIHRoaXMudGFnID0gdGFnO1xuICAgIHRoaXMubGFzdFJldmlzaW9uID0gdmFsdWUodGFnKTtcbiAgfVxuXG4gIGV2YWx1YXRlKHZtOiBVcGRhdGluZ1ZNKSB7XG4gICAgbGV0IHsgYXR0cmlidXRlLCByZWZlcmVuY2UsIHRhZyB9ID0gdGhpcztcbiAgICBpZiAoIXZhbGlkYXRlKHRhZywgdGhpcy5sYXN0UmV2aXNpb24pKSB7XG4gICAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG4gICAgICBhdHRyaWJ1dGUudXBkYXRlKHJlZmVyZW5jZS52YWx1ZSgpLCB2bS5lbnYpO1xuICAgIH1cbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==