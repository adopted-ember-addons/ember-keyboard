function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { ReferenceCache, isConst, isConstTag, value, validate } from '@glimmer/reference';

import { $t0 } from '@glimmer/vm';
import { APPEND_OPCODES, UpdatingOpcode } from '../../opcodes';
import { Assert } from './vm';

import { CONSTANTS } from '../../symbols';

APPEND_OPCODES.add(40 /* Text */, function (vm, _ref) {
    var text = _ref.op1;

    vm.elements().appendText(vm[CONSTANTS].getString(text));
});
APPEND_OPCODES.add(41 /* Comment */, function (vm, _ref2) {
    var text = _ref2.op1;

    vm.elements().appendComment(vm[CONSTANTS].getString(text));
});
APPEND_OPCODES.add(47 /* OpenElement */, function (vm, _ref3) {
    var tag = _ref3.op1;

    vm.elements().openElement(vm[CONSTANTS].getString(tag));
});
APPEND_OPCODES.add(48 /* OpenDynamicElement */, function (vm) {
    var tagName = vm.stack.pop().value();
    vm.elements().openElement(tagName);
});
APPEND_OPCODES.add(49 /* PushRemoteElement */, function (vm) {
    var elementRef = vm.stack.pop();
    var insertBeforeRef = vm.stack.pop();
    var guidRef = vm.stack.pop();
    var element = void 0;
    var insertBefore = void 0;
    var guid = guidRef.value();
    if (isConst(elementRef)) {
        element = elementRef.value();
    } else {
        var cache = new ReferenceCache(elementRef);
        element = cache.peek();
        vm.updateWith(new Assert(cache));
    }
    if (insertBeforeRef.value() !== undefined) {
        if (isConst(insertBeforeRef)) {
            insertBefore = insertBeforeRef.value();
        } else {
            var _cache = new ReferenceCache(insertBeforeRef);
            insertBefore = _cache.peek();
            vm.updateWith(new Assert(_cache));
        }
    }
    var block = vm.elements().pushRemoteElement(element, guid, insertBefore);
    if (block) vm.associateDestroyable(block);
});
APPEND_OPCODES.add(55 /* PopRemoteElement */, function (vm) {
    vm.elements().popRemoteElement();
});
APPEND_OPCODES.add(53 /* FlushElement */, function (vm) {
    var operations = vm.fetchValue($t0);
    var modifiers = null;
    if (operations) {
        modifiers = operations.flush(vm);
        vm.loadValue($t0, null);
    }
    vm.elements().flushElement(modifiers);
});
APPEND_OPCODES.add(54 /* CloseElement */, function (vm) {
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
APPEND_OPCODES.add(56 /* Modifier */, function (vm, _ref5) {
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
    var operations = vm.fetchValue($t0);
    operations.addModifier(manager, modifier);
    var tag = manager.getTag(modifier);
    if (!isConstTag(tag)) {
        vm.updateWith(new UpdateModifierOpcode(tag, manager, modifier));
    }
});
export var UpdateModifierOpcode = function (_UpdatingOpcode) {
    _inherits(UpdateModifierOpcode, _UpdatingOpcode);

    function UpdateModifierOpcode(tag, manager, modifier) {
        _classCallCheck(this, UpdateModifierOpcode);

        var _this = _possibleConstructorReturn(this, _UpdatingOpcode.call(this));

        _this.tag = tag;
        _this.manager = manager;
        _this.modifier = modifier;
        _this.type = 'update-modifier';
        _this.lastUpdated = value(tag);
        return _this;
    }

    UpdateModifierOpcode.prototype.evaluate = function evaluate(vm) {
        var manager = this.manager,
            modifier = this.modifier,
            tag = this.tag,
            lastUpdated = this.lastUpdated;

        if (!validate(tag, lastUpdated)) {
            vm.env.scheduleUpdateModifier(modifier, manager);
            this.lastUpdated = value(tag);
        }
    };

    return UpdateModifierOpcode;
}(UpdatingOpcode);
APPEND_OPCODES.add(50 /* StaticAttr */, function (vm, _ref6) {
    var _name = _ref6.op1,
        _value = _ref6.op2,
        _namespace = _ref6.op3;

    var name = vm[CONSTANTS].getString(_name);
    var value = vm[CONSTANTS].getString(_value);
    var namespace = _namespace ? vm[CONSTANTS].getString(_namespace) : null;
    vm.elements().setStaticAttribute(name, value, namespace);
});
APPEND_OPCODES.add(51 /* DynamicAttr */, function (vm, _ref7) {
    var _name = _ref7.op1,
        trusting = _ref7.op2,
        _namespace = _ref7.op3;

    var name = vm[CONSTANTS].getString(_name);
    var reference = vm.stack.pop();
    var value = reference.value();
    var namespace = _namespace ? vm[CONSTANTS].getString(_namespace) : null;
    var attribute = vm.elements().setDynamicAttribute(name, value, !!trusting, namespace);
    if (!isConst(reference)) {
        vm.updateWith(new UpdateDynamicAttributeOpcode(reference, attribute));
    }
});
export var UpdateDynamicAttributeOpcode = function (_UpdatingOpcode2) {
    _inherits(UpdateDynamicAttributeOpcode, _UpdatingOpcode2);

    function UpdateDynamicAttributeOpcode(reference, attribute) {
        _classCallCheck(this, UpdateDynamicAttributeOpcode);

        var _this2 = _possibleConstructorReturn(this, _UpdatingOpcode2.call(this));

        _this2.reference = reference;
        _this2.attribute = attribute;
        _this2.type = 'patch-element';
        var tag = reference.tag;

        _this2.tag = tag;
        _this2.lastRevision = value(tag);
        return _this2;
    }

    UpdateDynamicAttributeOpcode.prototype.evaluate = function evaluate(vm) {
        var attribute = this.attribute,
            reference = this.reference,
            tag = this.tag;

        if (!validate(tag, this.lastRevision)) {
            this.lastRevision = value(tag);
            attribute.update(reference.value(), vm.env);
        }
    };

    return UpdateDynamicAttributeOpcode;
}(UpdatingOpcode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvZG9tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsU0FBQSxjQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUEsRUFBQSxLQUFBLEVBQUEsUUFBQSxRQUFBLG9CQUFBOztBQWFBLFNBQUEsR0FBQSxRQUFBLGFBQUE7QUFNQSxTQUFBLGNBQUEsRUFBQSxjQUFBLFFBQUEsZUFBQTtBQUVBLFNBQUEsTUFBQSxRQUFBLE1BQUE7O0FBR0EsU0FBQSxTQUFBLFFBQUEsZUFBQTs7QUFJQSxlQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsVUFBQSxFQUE0QixVQUFBLEVBQUEsUUFBc0I7QUFBQSxRQUF0QixJQUFzQixRQUFmLEdBQWU7O0FBQ2hELE9BQUEsUUFBQSxHQUFBLFVBQUEsQ0FBeUIsR0FBQSxTQUFBLEVBQUEsU0FBQSxDQUF6QixJQUF5QixDQUF6QjtBQURGLENBQUE7QUFJQSxlQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsYUFBQSxFQUErQixVQUFBLEVBQUEsU0FBc0I7QUFBQSxRQUF0QixJQUFzQixTQUFmLEdBQWU7O0FBQ25ELE9BQUEsUUFBQSxHQUFBLGFBQUEsQ0FBNEIsR0FBQSxTQUFBLEVBQUEsU0FBQSxDQUE1QixJQUE0QixDQUE1QjtBQURGLENBQUE7QUFJQSxlQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsaUJBQUEsRUFBbUMsVUFBQSxFQUFBLFNBQXFCO0FBQUEsUUFBckIsR0FBcUIsU0FBZCxHQUFjOztBQUN0RCxPQUFBLFFBQUEsR0FBQSxXQUFBLENBQTBCLEdBQUEsU0FBQSxFQUFBLFNBQUEsQ0FBMUIsR0FBMEIsQ0FBMUI7QUFERixDQUFBO0FBSUEsZUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLHdCQUFBLEVBQTBDLGNBQUs7QUFDN0MsUUFBSSxVQUFzQixHQUFBLEtBQUEsQ0FBTixHQUFNLEdBQTFCLEtBQTBCLEVBQTFCO0FBQ0EsT0FBQSxRQUFBLEdBQUEsV0FBQSxDQUFBLE9BQUE7QUFGRixDQUFBO0FBS0EsZUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLHVCQUFBLEVBQXlDLGNBQUs7QUFDNUMsUUFBSSxhQUFtQixHQUFBLEtBQUEsQ0FBdkIsR0FBdUIsRUFBdkI7QUFDQSxRQUFJLGtCQUF3QixHQUFBLEtBQUEsQ0FBNUIsR0FBNEIsRUFBNUI7QUFDQSxRQUFJLFVBQWdCLEdBQUEsS0FBQSxDQUFwQixHQUFvQixFQUFwQjtBQUVBLFFBQUEsZ0JBQUE7QUFDQSxRQUFBLHFCQUFBO0FBQ0EsUUFBSSxPQUFPLFFBQVgsS0FBVyxFQUFYO0FBRUEsUUFBSSxRQUFKLFVBQUksQ0FBSixFQUF5QjtBQUN2QixrQkFBZ0IsV0FBaEIsS0FBZ0IsRUFBaEI7QUFERixLQUFBLE1BRU87QUFDTCxZQUFJLFFBQVEsSUFBQSxjQUFBLENBQVosVUFBWSxDQUFaO0FBQ0Esa0JBQWdCLE1BQWhCLElBQWdCLEVBQWhCO0FBQ0EsV0FBQSxVQUFBLENBQWMsSUFBQSxNQUFBLENBQWQsS0FBYyxDQUFkO0FBQ0Q7QUFFRCxRQUFJLGdCQUFBLEtBQUEsT0FBSixTQUFBLEVBQTJDO0FBQ3pDLFlBQUksUUFBSixlQUFJLENBQUosRUFBOEI7QUFDNUIsMkJBQXFCLGdCQUFyQixLQUFxQixFQUFyQjtBQURGLFNBQUEsTUFFTztBQUNMLGdCQUFJLFNBQVEsSUFBQSxjQUFBLENBQVosZUFBWSxDQUFaO0FBQ0EsMkJBQXFCLE9BQXJCLElBQXFCLEVBQXJCO0FBQ0EsZUFBQSxVQUFBLENBQWMsSUFBQSxNQUFBLENBQWQsTUFBYyxDQUFkO0FBQ0Q7QUFDRjtBQUVELFFBQUksUUFBUSxHQUFBLFFBQUEsR0FBQSxpQkFBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLEVBQVosWUFBWSxDQUFaO0FBQ0EsUUFBQSxLQUFBLEVBQVcsR0FBQSxvQkFBQSxDQUFBLEtBQUE7QUE1QmIsQ0FBQTtBQStCQSxlQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsc0JBQUEsRUFBd0MsY0FBSztBQUMzQyxPQUFBLFFBQUEsR0FBQSxnQkFBQTtBQURGLENBQUE7QUFJQSxlQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsa0JBQUEsRUFBb0MsY0FBSztBQUN2QyxRQUFJLGFBQW1CLEdBQUEsVUFBQSxDQUF2QixHQUF1QixDQUF2QjtBQUNBLFFBQUksWUFBSixJQUFBO0FBRUEsUUFBQSxVQUFBLEVBQWdCO0FBQ2Qsb0JBQVksV0FBQSxLQUFBLENBQVosRUFBWSxDQUFaO0FBQ0EsV0FBQSxTQUFBLENBQUEsR0FBQSxFQUFBLElBQUE7QUFDRDtBQUVELE9BQUEsUUFBQSxHQUFBLFlBQUEsQ0FBQSxTQUFBO0FBVEYsQ0FBQTtBQVlBLGVBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxrQkFBQSxFQUFvQyxjQUFLO0FBQ3ZDLFFBQUksWUFBWSxHQUFBLFFBQUEsR0FBaEIsWUFBZ0IsRUFBaEI7QUFFQSxRQUFBLFNBQUEsRUFBZTtBQUNiLGtCQUFBLE9BQUEsQ0FBa0IsaUJBQXdCO0FBQUEsZ0JBQXZCLE9BQXVCO0FBQUEsZ0JBQXhCLFFBQXdCOztBQUN4QyxlQUFBLEdBQUEsQ0FBQSx1QkFBQSxDQUFBLFFBQUEsRUFBQSxPQUFBO0FBQ0EsZ0JBQUksSUFBSSxRQUFBLGFBQUEsQ0FBUixRQUFRLENBQVI7QUFFQSxnQkFBQSxDQUFBLEVBQU87QUFDTCxtQkFBQSxvQkFBQSxDQUFBLENBQUE7QUFDRDtBQU5ILFNBQUE7QUFRRDtBQVpILENBQUE7QUFlQSxlQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxFQUFnQyxVQUFBLEVBQUEsU0FBd0I7QUFBQSxRQUF4QixNQUF3QixTQUFqQixHQUFpQjs7QUFBQSxnQ0FDN0IsR0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBekIsTUFBeUIsQ0FENkI7QUFBQSxRQUNsRCxPQURrRCx5QkFDbEQsT0FEa0Q7QUFBQSxRQUNsRCxLQURrRCx5QkFDbEQsS0FEa0Q7O0FBRXRELFFBQUksUUFBUSxHQUFaLEtBQUE7QUFDQSxRQUFJLE9BQWEsTUFBakIsR0FBaUIsRUFBakI7O0FBSHNELHVCQUliLEdBQXpDLFFBQXlDLEVBSmE7QUFBQSxRQUlsRCxZQUprRCxnQkFJbEQsWUFKa0Q7QUFBQSxRQUlsRCxnQkFKa0QsZ0JBSWxELGdCQUprRDs7QUFLdEQsUUFBSSxlQUFlLEdBQW5CLFlBQW1CLEVBQW5CO0FBQ0EsUUFBSSxXQUFXLFFBQUEsTUFBQSxDQUFBLFlBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLFlBQUEsRUFBZixnQkFBZSxDQUFmO0FBUUEsUUFBSSxhQUNJLEdBQUEsVUFBQSxDQURSLEdBQ1EsQ0FEUjtBQUtBLGVBQUEsV0FBQSxDQUFBLE9BQUEsRUFBQSxRQUFBO0FBRUEsUUFBSSxNQUFNLFFBQUEsTUFBQSxDQUFWLFFBQVUsQ0FBVjtBQUVBLFFBQUksQ0FBQyxXQUFMLEdBQUssQ0FBTCxFQUFzQjtBQUNwQixXQUFBLFVBQUEsQ0FBYyxJQUFBLG9CQUFBLENBQUEsR0FBQSxFQUFBLE9BQUEsRUFBZCxRQUFjLENBQWQ7QUFDRDtBQXpCSCxDQUFBO0FBNEJBLFdBQU0sb0JBQU47QUFBQTs7QUFJRSxrQ0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFHeUM7QUFBQTs7QUFBQSxxREFFdkMsMEJBRnVDOztBQUZoQyxjQUFBLEdBQUEsR0FBQSxHQUFBO0FBQ0MsY0FBQSxPQUFBLEdBQUEsT0FBQTtBQUNBLGNBQUEsUUFBQSxHQUFBLFFBQUE7QUFOSCxjQUFBLElBQUEsR0FBQSxpQkFBQTtBQVNMLGNBQUEsV0FBQSxHQUFtQixNQUFuQixHQUFtQixDQUFuQjtBQUh1QztBQUl4Qzs7QUFYSCxtQ0FhRSxRQWJGLHFCQWFFLEVBYkYsRUFheUI7QUFBQSxZQUNqQixPQURpQixHQUNyQixJQURxQixDQUNqQixPQURpQjtBQUFBLFlBQ2pCLFFBRGlCLEdBQ3JCLElBRHFCLENBQ2pCLFFBRGlCO0FBQUEsWUFDakIsR0FEaUIsR0FDckIsSUFEcUIsQ0FDakIsR0FEaUI7QUFBQSxZQUNqQixXQURpQixHQUNyQixJQURxQixDQUNqQixXQURpQjs7QUFHckIsWUFBSSxDQUFDLFNBQUEsR0FBQSxFQUFMLFdBQUssQ0FBTCxFQUFpQztBQUMvQixlQUFBLEdBQUEsQ0FBQSxzQkFBQSxDQUFBLFFBQUEsRUFBQSxPQUFBO0FBQ0EsaUJBQUEsV0FBQSxHQUFtQixNQUFuQixHQUFtQixDQUFuQjtBQUNEO0FBQ0YsS0FwQkg7O0FBQUE7QUFBQSxFQUFNLGNBQU47QUF1QkEsZUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLGdCQUFBLEVBQWtDLFVBQUEsRUFBQSxTQUFxRDtBQUFBLFFBQWhELEtBQWdELFNBQTlDLEdBQThDO0FBQUEsUUFBaEQsTUFBZ0QsU0FBbEMsR0FBa0M7QUFBQSxRQUFyRCxVQUFxRCxTQUFyQixHQUFxQjs7QUFDckYsUUFBSSxPQUFPLEdBQUEsU0FBQSxFQUFBLFNBQUEsQ0FBWCxLQUFXLENBQVg7QUFDQSxRQUFJLFFBQVEsR0FBQSxTQUFBLEVBQUEsU0FBQSxDQUFaLE1BQVksQ0FBWjtBQUNBLFFBQUksWUFBWSxhQUFhLEdBQUEsU0FBQSxFQUFBLFNBQUEsQ0FBYixVQUFhLENBQWIsR0FBaEIsSUFBQTtBQUVBLE9BQUEsUUFBQSxHQUFBLGtCQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBO0FBTEYsQ0FBQTtBQVFBLGVBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxpQkFBQSxFQUFtQyxVQUFBLEVBQUEsU0FBdUQ7QUFBQSxRQUFsRCxLQUFrRCxTQUFoRCxHQUFnRDtBQUFBLFFBQWxELFFBQWtELFNBQXBDLEdBQW9DO0FBQUEsUUFBdkQsVUFBdUQsU0FBckIsR0FBcUI7O0FBQ3hGLFFBQUksT0FBTyxHQUFBLFNBQUEsRUFBQSxTQUFBLENBQVgsS0FBVyxDQUFYO0FBQ0EsUUFBSSxZQUFrQixHQUFBLEtBQUEsQ0FBdEIsR0FBc0IsRUFBdEI7QUFDQSxRQUFJLFFBQVEsVUFBWixLQUFZLEVBQVo7QUFDQSxRQUFJLFlBQVksYUFBYSxHQUFBLFNBQUEsRUFBQSxTQUFBLENBQWIsVUFBYSxDQUFiLEdBQWhCLElBQUE7QUFFQSxRQUFJLFlBQVksR0FBQSxRQUFBLEdBQUEsbUJBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxFQUErQyxDQUFDLENBQWhELFFBQUEsRUFBaEIsU0FBZ0IsQ0FBaEI7QUFFQSxRQUFJLENBQUMsUUFBTCxTQUFLLENBQUwsRUFBeUI7QUFDdkIsV0FBQSxVQUFBLENBQWMsSUFBQSw0QkFBQSxDQUFBLFNBQUEsRUFBZCxTQUFjLENBQWQ7QUFDRDtBQVZILENBQUE7QUFhQSxXQUFNLDRCQUFOO0FBQUE7O0FBTUUsMENBQUEsU0FBQSxFQUFBLFNBQUEsRUFBK0Y7QUFBQTs7QUFBQSxzREFDN0YsMkJBRDZGOztBQUEzRSxlQUFBLFNBQUEsR0FBQSxTQUFBO0FBQWdELGVBQUEsU0FBQSxHQUFBLFNBQUE7QUFMN0QsZUFBQSxJQUFBLEdBQUEsZUFBQTtBQUt3RixZQUV6RixHQUZ5RixHQUU3RixTQUY2RixDQUV6RixHQUZ5Rjs7QUFHN0YsZUFBQSxHQUFBLEdBQUEsR0FBQTtBQUNBLGVBQUEsWUFBQSxHQUFvQixNQUFwQixHQUFvQixDQUFwQjtBQUo2RjtBQUs5Rjs7QUFYSCwyQ0FhRSxRQWJGLHFCQWFFLEVBYkYsRUFheUI7QUFBQSxZQUNqQixTQURpQixHQUNyQixJQURxQixDQUNqQixTQURpQjtBQUFBLFlBQ2pCLFNBRGlCLEdBQ3JCLElBRHFCLENBQ2pCLFNBRGlCO0FBQUEsWUFDakIsR0FEaUIsR0FDckIsSUFEcUIsQ0FDakIsR0FEaUI7O0FBRXJCLFlBQUksQ0FBQyxTQUFBLEdBQUEsRUFBYyxLQUFuQixZQUFLLENBQUwsRUFBdUM7QUFDckMsaUJBQUEsWUFBQSxHQUFvQixNQUFwQixHQUFvQixDQUFwQjtBQUNBLHNCQUFBLE1BQUEsQ0FBaUIsVUFBakIsS0FBaUIsRUFBakIsRUFBb0MsR0FBcEMsR0FBQTtBQUNEO0FBQ0YsS0FuQkg7O0FBQUE7QUFBQSxFQUFNLGNBQU4iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZWZlcmVuY2UsXG4gIFJlZmVyZW5jZUNhY2hlLFxuICBSZXZpc2lvbixcbiAgVGFnLFxuICBWZXJzaW9uZWRSZWZlcmVuY2UsXG4gIGlzQ29uc3QsXG4gIGlzQ29uc3RUYWcsXG4gIHZhbHVlLFxuICB2YWxpZGF0ZSxcbn0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IGNoZWNrLCBDaGVja1N0cmluZywgQ2hlY2tFbGVtZW50LCBDaGVja09wdGlvbiwgQ2hlY2tOb2RlIH0gZnJvbSAnQGdsaW1tZXIvZGVidWcnO1xuaW1wb3J0IHsgT3AsIE9wdGlvbiwgTW9kaWZpZXJNYW5hZ2VyIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyAkdDAgfSBmcm9tICdAZ2xpbW1lci92bSc7XG5pbXBvcnQge1xuICBNb2RpZmllckRlZmluaXRpb24sXG4gIEludGVybmFsTW9kaWZpZXJNYW5hZ2VyLFxuICBNb2RpZmllckluc3RhbmNlU3RhdGUsXG59IGZyb20gJy4uLy4uL21vZGlmaWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQVBQRU5EX09QQ09ERVMsIFVwZGF0aW5nT3Bjb2RlIH0gZnJvbSAnLi4vLi4vb3Bjb2Rlcyc7XG5pbXBvcnQgeyBVcGRhdGluZ1ZNIH0gZnJvbSAnLi4vLi4vdm0nO1xuaW1wb3J0IHsgQXNzZXJ0IH0gZnJvbSAnLi92bSc7XG5pbXBvcnQgeyBEeW5hbWljQXR0cmlidXRlIH0gZnJvbSAnLi4vLi4vdm0vYXR0cmlidXRlcy9keW5hbWljJztcbmltcG9ydCB7IENoZWNrUmVmZXJlbmNlLCBDaGVja0FyZ3VtZW50cywgQ2hlY2tPcGVyYXRpb25zIH0gZnJvbSAnLi8tZGVidWctc3RyaXAnO1xuaW1wb3J0IHsgQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vc3ltYm9scyc7XG5pbXBvcnQgeyBTaW1wbGVFbGVtZW50LCBTaW1wbGVOb2RlIH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IGV4cGVjdCwgTWF5YmUgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlRleHQsICh2bSwgeyBvcDE6IHRleHQgfSkgPT4ge1xuICB2bS5lbGVtZW50cygpLmFwcGVuZFRleHQodm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcodGV4dCkpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Db21tZW50LCAodm0sIHsgb3AxOiB0ZXh0IH0pID0+IHtcbiAgdm0uZWxlbWVudHMoKS5hcHBlbmRDb21tZW50KHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKHRleHQpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuT3BlbkVsZW1lbnQsICh2bSwgeyBvcDE6IHRhZyB9KSA9PiB7XG4gIHZtLmVsZW1lbnRzKCkub3BlbkVsZW1lbnQodm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcodGFnKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLk9wZW5EeW5hbWljRWxlbWVudCwgdm0gPT4ge1xuICBsZXQgdGFnTmFtZSA9IGNoZWNrKGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSkudmFsdWUoKSwgQ2hlY2tTdHJpbmcpO1xuICB2bS5lbGVtZW50cygpLm9wZW5FbGVtZW50KHRhZ05hbWUpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXNoUmVtb3RlRWxlbWVudCwgdm0gPT4ge1xuICBsZXQgZWxlbWVudFJlZiA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG4gIGxldCBpbnNlcnRCZWZvcmVSZWYgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuICBsZXQgZ3VpZFJlZiA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG5cbiAgbGV0IGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQ7XG4gIGxldCBpbnNlcnRCZWZvcmU6IE1heWJlPFNpbXBsZU5vZGU+O1xuICBsZXQgZ3VpZCA9IGd1aWRSZWYudmFsdWUoKSBhcyBzdHJpbmc7XG5cbiAgaWYgKGlzQ29uc3QoZWxlbWVudFJlZikpIHtcbiAgICBlbGVtZW50ID0gY2hlY2soZWxlbWVudFJlZi52YWx1ZSgpLCBDaGVja0VsZW1lbnQpO1xuICB9IGVsc2Uge1xuICAgIGxldCBjYWNoZSA9IG5ldyBSZWZlcmVuY2VDYWNoZShlbGVtZW50UmVmIGFzIFJlZmVyZW5jZTxTaW1wbGVFbGVtZW50Pik7XG4gICAgZWxlbWVudCA9IGNoZWNrKGNhY2hlLnBlZWsoKSwgQ2hlY2tFbGVtZW50KTtcbiAgICB2bS51cGRhdGVXaXRoKG5ldyBBc3NlcnQoY2FjaGUpKTtcbiAgfVxuXG4gIGlmIChpbnNlcnRCZWZvcmVSZWYudmFsdWUoKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKGlzQ29uc3QoaW5zZXJ0QmVmb3JlUmVmKSkge1xuICAgICAgaW5zZXJ0QmVmb3JlID0gY2hlY2soaW5zZXJ0QmVmb3JlUmVmLnZhbHVlKCksIENoZWNrT3B0aW9uKENoZWNrTm9kZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgY2FjaGUgPSBuZXcgUmVmZXJlbmNlQ2FjaGUoaW5zZXJ0QmVmb3JlUmVmIGFzIFJlZmVyZW5jZTxPcHRpb248U2ltcGxlTm9kZT4+KTtcbiAgICAgIGluc2VydEJlZm9yZSA9IGNoZWNrKGNhY2hlLnBlZWsoKSwgQ2hlY2tPcHRpb24oQ2hlY2tOb2RlKSk7XG4gICAgICB2bS51cGRhdGVXaXRoKG5ldyBBc3NlcnQoY2FjaGUpKTtcbiAgICB9XG4gIH1cblxuICBsZXQgYmxvY2sgPSB2bS5lbGVtZW50cygpLnB1c2hSZW1vdGVFbGVtZW50KGVsZW1lbnQsIGd1aWQsIGluc2VydEJlZm9yZSk7XG4gIGlmIChibG9jaykgdm0uYXNzb2NpYXRlRGVzdHJveWFibGUoYmxvY2spO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Qb3BSZW1vdGVFbGVtZW50LCB2bSA9PiB7XG4gIHZtLmVsZW1lbnRzKCkucG9wUmVtb3RlRWxlbWVudCgpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5GbHVzaEVsZW1lbnQsIHZtID0+IHtcbiAgbGV0IG9wZXJhdGlvbnMgPSBjaGVjayh2bS5mZXRjaFZhbHVlKCR0MCksIENoZWNrT3BlcmF0aW9ucyk7XG4gIGxldCBtb2RpZmllcnM6IE9wdGlvbjxbTW9kaWZpZXJNYW5hZ2VyLCB1bmtub3duXVtdPiA9IG51bGw7XG5cbiAgaWYgKG9wZXJhdGlvbnMpIHtcbiAgICBtb2RpZmllcnMgPSBvcGVyYXRpb25zLmZsdXNoKHZtKTtcbiAgICB2bS5sb2FkVmFsdWUoJHQwLCBudWxsKTtcbiAgfVxuXG4gIHZtLmVsZW1lbnRzKCkuZmx1c2hFbGVtZW50KG1vZGlmaWVycyk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkNsb3NlRWxlbWVudCwgdm0gPT4ge1xuICBsZXQgbW9kaWZpZXJzID0gdm0uZWxlbWVudHMoKS5jbG9zZUVsZW1lbnQoKTtcblxuICBpZiAobW9kaWZpZXJzKSB7XG4gICAgbW9kaWZpZXJzLmZvckVhY2goKFttYW5hZ2VyLCBtb2RpZmllcl0pID0+IHtcbiAgICAgIHZtLmVudi5zY2hlZHVsZUluc3RhbGxNb2RpZmllcihtb2RpZmllciwgbWFuYWdlcik7XG4gICAgICBsZXQgZCA9IG1hbmFnZXIuZ2V0RGVzdHJ1Y3Rvcihtb2RpZmllcik7XG5cbiAgICAgIGlmIChkKSB7XG4gICAgICAgIHZtLmFzc29jaWF0ZURlc3Ryb3lhYmxlKGQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLk1vZGlmaWVyLCAodm0sIHsgb3AxOiBoYW5kbGUgfSkgPT4ge1xuICBsZXQgeyBtYW5hZ2VyLCBzdGF0ZSB9ID0gdm0ucnVudGltZS5yZXNvbHZlci5yZXNvbHZlPE1vZGlmaWVyRGVmaW5pdGlvbj4oaGFuZGxlKTtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIGxldCBhcmdzID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrQXJndW1lbnRzKTtcbiAgbGV0IHsgY29uc3RydWN0aW5nLCB1cGRhdGVPcGVyYXRpb25zIH0gPSB2bS5lbGVtZW50cygpO1xuICBsZXQgZHluYW1pY1Njb3BlID0gdm0uZHluYW1pY1Njb3BlKCk7XG4gIGxldCBtb2RpZmllciA9IG1hbmFnZXIuY3JlYXRlKFxuICAgIGV4cGVjdChjb25zdHJ1Y3RpbmcsICdCVUc6IEVsZW1lbnRNb2RpZmllciBjb3VsZCBub3QgZmluZCB0aGUgZWxlbWVudCBpdCBhcHBsaWVzIHRvJyksXG4gICAgc3RhdGUsXG4gICAgYXJncyxcbiAgICBkeW5hbWljU2NvcGUsXG4gICAgdXBkYXRlT3BlcmF0aW9uc1xuICApO1xuXG4gIGxldCBvcGVyYXRpb25zID0gZXhwZWN0KFxuICAgIGNoZWNrKHZtLmZldGNoVmFsdWUoJHQwKSwgQ2hlY2tPcGVyYXRpb25zKSxcbiAgICAnQlVHOiBFbGVtZW50TW9kaWZpZXIgY291bGQgbm90IGZpbmQgb3BlcmF0aW9ucyB0byBhcHBlbmQgdG8nXG4gICk7XG5cbiAgb3BlcmF0aW9ucy5hZGRNb2RpZmllcihtYW5hZ2VyLCBtb2RpZmllcik7XG5cbiAgbGV0IHRhZyA9IG1hbmFnZXIuZ2V0VGFnKG1vZGlmaWVyKTtcblxuICBpZiAoIWlzQ29uc3RUYWcodGFnKSkge1xuICAgIHZtLnVwZGF0ZVdpdGgobmV3IFVwZGF0ZU1vZGlmaWVyT3Bjb2RlKHRhZywgbWFuYWdlciwgbW9kaWZpZXIpKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVNb2RpZmllck9wY29kZSBleHRlbmRzIFVwZGF0aW5nT3Bjb2RlIHtcbiAgcHVibGljIHR5cGUgPSAndXBkYXRlLW1vZGlmaWVyJztcbiAgcHJpdmF0ZSBsYXN0VXBkYXRlZDogUmV2aXNpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHRhZzogVGFnLFxuICAgIHByaXZhdGUgbWFuYWdlcjogSW50ZXJuYWxNb2RpZmllck1hbmFnZXIsXG4gICAgcHJpdmF0ZSBtb2RpZmllcjogTW9kaWZpZXJJbnN0YW5jZVN0YXRlXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5sYXN0VXBkYXRlZCA9IHZhbHVlKHRhZyk7XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIGxldCB7IG1hbmFnZXIsIG1vZGlmaWVyLCB0YWcsIGxhc3RVcGRhdGVkIH0gPSB0aGlzO1xuXG4gICAgaWYgKCF2YWxpZGF0ZSh0YWcsIGxhc3RVcGRhdGVkKSkge1xuICAgICAgdm0uZW52LnNjaGVkdWxlVXBkYXRlTW9kaWZpZXIobW9kaWZpZXIsIG1hbmFnZXIpO1xuICAgICAgdGhpcy5sYXN0VXBkYXRlZCA9IHZhbHVlKHRhZyk7XG4gICAgfVxuICB9XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TdGF0aWNBdHRyLCAodm0sIHsgb3AxOiBfbmFtZSwgb3AyOiBfdmFsdWUsIG9wMzogX25hbWVzcGFjZSB9KSA9PiB7XG4gIGxldCBuYW1lID0gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcoX25hbWUpO1xuICBsZXQgdmFsdWUgPSB2bVtDT05TVEFOVFNdLmdldFN0cmluZyhfdmFsdWUpO1xuICBsZXQgbmFtZXNwYWNlID0gX25hbWVzcGFjZSA/IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lc3BhY2UpIDogbnVsbDtcblxuICB2bS5lbGVtZW50cygpLnNldFN0YXRpY0F0dHJpYnV0ZShuYW1lLCB2YWx1ZSwgbmFtZXNwYWNlKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuRHluYW1pY0F0dHIsICh2bSwgeyBvcDE6IF9uYW1lLCBvcDI6IHRydXN0aW5nLCBvcDM6IF9uYW1lc3BhY2UgfSkgPT4ge1xuICBsZXQgbmFtZSA9IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lKTtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG4gIGxldCB2YWx1ZSA9IHJlZmVyZW5jZS52YWx1ZSgpO1xuICBsZXQgbmFtZXNwYWNlID0gX25hbWVzcGFjZSA/IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lc3BhY2UpIDogbnVsbDtcblxuICBsZXQgYXR0cmlidXRlID0gdm0uZWxlbWVudHMoKS5zZXREeW5hbWljQXR0cmlidXRlKG5hbWUsIHZhbHVlLCAhIXRydXN0aW5nLCBuYW1lc3BhY2UpO1xuXG4gIGlmICghaXNDb25zdChyZWZlcmVuY2UpKSB7XG4gICAgdm0udXBkYXRlV2l0aChuZXcgVXBkYXRlRHluYW1pY0F0dHJpYnV0ZU9wY29kZShyZWZlcmVuY2UsIGF0dHJpYnV0ZSkpO1xuICB9XG59KTtcblxuZXhwb3J0IGNsYXNzIFVwZGF0ZUR5bmFtaWNBdHRyaWJ1dGVPcGNvZGUgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSB7XG4gIHB1YmxpYyB0eXBlID0gJ3BhdGNoLWVsZW1lbnQnO1xuXG4gIHB1YmxpYyB0YWc6IFRhZztcbiAgcHVibGljIGxhc3RSZXZpc2lvbjogUmV2aXNpb247XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWZlcmVuY2U6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPiwgcHJpdmF0ZSBhdHRyaWJ1dGU6IER5bmFtaWNBdHRyaWJ1dGUpIHtcbiAgICBzdXBlcigpO1xuICAgIGxldCB7IHRhZyB9ID0gcmVmZXJlbmNlO1xuICAgIHRoaXMudGFnID0gdGFnO1xuICAgIHRoaXMubGFzdFJldmlzaW9uID0gdmFsdWUodGFnKTtcbiAgfVxuXG4gIGV2YWx1YXRlKHZtOiBVcGRhdGluZ1ZNKSB7XG4gICAgbGV0IHsgYXR0cmlidXRlLCByZWZlcmVuY2UsIHRhZyB9ID0gdGhpcztcbiAgICBpZiAoIXZhbGlkYXRlKHRhZywgdGhpcy5sYXN0UmV2aXNpb24pKSB7XG4gICAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG4gICAgICBhdHRyaWJ1dGUudXBkYXRlKHJlZmVyZW5jZS52YWx1ZSgpLCB2bS5lbnYpO1xuICAgIH1cbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==