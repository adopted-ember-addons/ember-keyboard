function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { isConst } from '@glimmer/reference';

import { APPEND_OPCODES } from '../../opcodes';
import { ConditionalReference } from '../../references';
import { isCurriedComponentDefinition, isComponentDefinition } from '../../component/curried-component';

import { isEmpty, isSafeString, isFragment, isNode, shouldCoerce } from '../../dom/normalize';
import DynamicTextContent from '../../vm/content/text';
export var IsCurriedComponentDefinitionReference = function (_ConditionalReference) {
    _inherits(IsCurriedComponentDefinitionReference, _ConditionalReference);

    function IsCurriedComponentDefinitionReference() {
        _classCallCheck(this, IsCurriedComponentDefinitionReference);

        return _possibleConstructorReturn(this, _ConditionalReference.apply(this, arguments));
    }

    IsCurriedComponentDefinitionReference.create = function create(inner) {
        return new ConditionalReference(inner, isCurriedComponentDefinition);
    };

    return IsCurriedComponentDefinitionReference;
}(ConditionalReference);
export var ContentTypeReference = function () {
    function ContentTypeReference(inner) {
        _classCallCheck(this, ContentTypeReference);

        this.inner = inner;
        this.tag = inner.tag;
    }

    ContentTypeReference.prototype.value = function value() {
        var value = this.inner.value();
        if (shouldCoerce(value)) {
            return 1 /* String */;
        } else if (isComponentDefinition(value)) {
            return 0 /* Component */;
        } else if (isSafeString(value)) {
            return 3 /* SafeString */;
        } else if (isFragment(value)) {
            return 4 /* Fragment */;
        } else if (isNode(value)) {
            return 5 /* Node */;
        } else {
                return 1 /* String */;
            }
    };

    return ContentTypeReference;
}();
APPEND_OPCODES.add(42 /* AppendHTML */, function (vm) {
    var reference = vm.stack.pop();
    var rawValue = reference.value();
    var value = isEmpty(rawValue) ? '' : String(rawValue);
    vm.elements().appendDynamicHTML(value);
});
APPEND_OPCODES.add(43 /* AppendSafeHTML */, function (vm) {
    var reference = vm.stack.pop();
    var rawValue = reference.value().toHTML();
    var value = isEmpty(rawValue) ? '' : rawValue;
    vm.elements().appendDynamicHTML(value);
});
APPEND_OPCODES.add(46 /* AppendText */, function (vm) {
    var reference = vm.stack.pop();
    var rawValue = reference.value();
    var value = isEmpty(rawValue) ? '' : String(rawValue);
    var node = vm.elements().appendDynamicText(value);
    if (!isConst(reference)) {
        vm.updateWith(new DynamicTextContent(node, reference, value));
    }
});
APPEND_OPCODES.add(44 /* AppendDocumentFragment */, function (vm) {
    var reference = vm.stack.pop();
    var value = reference.value();
    vm.elements().appendDynamicFragment(value);
});
APPEND_OPCODES.add(45 /* AppendNode */, function (vm) {
    var reference = vm.stack.pop();
    var value = reference.value();
    vm.elements().appendDynamicNode(value);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvY29udGVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLFNBQUEsT0FBQSxRQUFBLG9CQUFBOztBQVNBLFNBQUEsY0FBQSxRQUFBLGVBQUE7QUFDQSxTQUFBLG9CQUFBLFFBQUEsa0JBQUE7QUFDQSxTQUFBLDRCQUFBLEVBQUEscUJBQUEsUUFBQSxtQ0FBQTs7QUFLQSxTQUFBLE9BQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxZQUFBLFFBQUEscUJBQUE7QUFDQSxPQUFBLGtCQUFBLE1BQUEsdUJBQUE7QUFHQSxXQUFNLHFDQUFOO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBLDBDQUNFLE1BREYsbUJBQ0UsS0FERixFQUN5QztBQUNyQyxlQUFPLElBQUEsb0JBQUEsQ0FBQSxLQUFBLEVBQVAsNEJBQU8sQ0FBUDtBQUNELEtBSEg7O0FBQUE7QUFBQSxFQUFNLG9CQUFOO0FBTUEsV0FBTSxvQkFBTjtBQUdFLGtDQUFBLEtBQUEsRUFBNkM7QUFBQTs7QUFBekIsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUNsQixhQUFBLEdBQUEsR0FBVyxNQUFYLEdBQUE7QUFDRDs7QUFMSCxtQ0FPRSxLQVBGLG9CQU9PO0FBQ0gsWUFBSSxRQUFRLEtBQUEsS0FBQSxDQUFaLEtBQVksRUFBWjtBQUVBLFlBQUksYUFBSixLQUFJLENBQUosRUFBeUI7QUFDdkIsbUJBQUEsQ0FBQSxDQUFBLFlBQUE7QUFERixTQUFBLE1BRU8sSUFBSSxzQkFBSixLQUFJLENBQUosRUFBa0M7QUFDdkMsbUJBQUEsQ0FBQSxDQUFBLGVBQUE7QUFESyxTQUFBLE1BRUEsSUFBSSxhQUFKLEtBQUksQ0FBSixFQUF5QjtBQUM5QixtQkFBQSxDQUFBLENBQUEsZ0JBQUE7QUFESyxTQUFBLE1BRUEsSUFBSSxXQUFKLEtBQUksQ0FBSixFQUF1QjtBQUM1QixtQkFBQSxDQUFBLENBQUEsY0FBQTtBQURLLFNBQUEsTUFFQSxJQUFJLE9BQUosS0FBSSxDQUFKLEVBQW1CO0FBQ3hCLG1CQUFBLENBQUEsQ0FBQSxVQUFBO0FBREssU0FBQSxNQUVBO0FBQ0wsdUJBQUEsQ0FBQSxDQUFBLFlBQUE7QUFDRDtBQUNGLEtBdkJIOztBQUFBO0FBQUE7QUEwQkEsZUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLGdCQUFBLEVBQWtDLGNBQUs7QUFDckMsUUFBSSxZQUFrQixHQUFBLEtBQUEsQ0FBdEIsR0FBc0IsRUFBdEI7QUFFQSxRQUFJLFdBQVcsVUFBZixLQUFlLEVBQWY7QUFDQSxRQUFJLFFBQVEsUUFBQSxRQUFBLElBQUEsRUFBQSxHQUF5QixPQUFyQyxRQUFxQyxDQUFyQztBQUVBLE9BQUEsUUFBQSxHQUFBLGlCQUFBLENBQUEsS0FBQTtBQU5GLENBQUE7QUFTQSxlQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsb0JBQUEsRUFBc0MsY0FBSztBQUN6QyxRQUFJLFlBQWtCLEdBQUEsS0FBQSxDQUF0QixHQUFzQixFQUF0QjtBQUVBLFFBQUksV0FBaUIsVUFBTixLQUFNLEdBQXJCLE1BQXFCLEVBQXJCO0FBQ0EsUUFBSSxRQUFRLFFBQUEsUUFBQSxJQUFBLEVBQUEsR0FBWixRQUFBO0FBRUEsT0FBQSxRQUFBLEdBQUEsaUJBQUEsQ0FBQSxLQUFBO0FBTkYsQ0FBQTtBQVNBLGVBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxnQkFBQSxFQUFrQyxjQUFLO0FBQ3JDLFFBQUksWUFBa0IsR0FBQSxLQUFBLENBQXRCLEdBQXNCLEVBQXRCO0FBRUEsUUFBSSxXQUFXLFVBQWYsS0FBZSxFQUFmO0FBQ0EsUUFBSSxRQUFRLFFBQUEsUUFBQSxJQUFBLEVBQUEsR0FBeUIsT0FBckMsUUFBcUMsQ0FBckM7QUFFQSxRQUFJLE9BQU8sR0FBQSxRQUFBLEdBQUEsaUJBQUEsQ0FBWCxLQUFXLENBQVg7QUFFQSxRQUFJLENBQUMsUUFBTCxTQUFLLENBQUwsRUFBeUI7QUFDdkIsV0FBQSxVQUFBLENBQWMsSUFBQSxrQkFBQSxDQUFBLElBQUEsRUFBQSxTQUFBLEVBQWQsS0FBYyxDQUFkO0FBQ0Q7QUFWSCxDQUFBO0FBYUEsZUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLDRCQUFBLEVBQThDLGNBQUs7QUFDakQsUUFBSSxZQUFrQixHQUFBLEtBQUEsQ0FBdEIsR0FBc0IsRUFBdEI7QUFFQSxRQUFJLFFBQWMsVUFBbEIsS0FBa0IsRUFBbEI7QUFFQSxPQUFBLFFBQUEsR0FBQSxxQkFBQSxDQUFBLEtBQUE7QUFMRixDQUFBO0FBUUEsZUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLGdCQUFBLEVBQWtDLGNBQUs7QUFDckMsUUFBSSxZQUFrQixHQUFBLEtBQUEsQ0FBdEIsR0FBc0IsRUFBdEI7QUFFQSxRQUFJLFFBQWMsVUFBbEIsS0FBa0IsRUFBbEI7QUFFQSxPQUFBLFFBQUEsR0FBQSxpQkFBQSxDQUFBLEtBQUE7QUFMRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVmZXJlbmNlLCBUYWcsIGlzQ29uc3QgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHtcbiAgY2hlY2ssXG4gIENoZWNrU3RyaW5nLFxuICBDaGVja1NhZmVTdHJpbmcsXG4gIENoZWNrTm9kZSxcbiAgQ2hlY2tEb2N1bWVudEZyYWdtZW50LFxufSBmcm9tICdAZ2xpbW1lci9kZWJ1Zyc7XG5cbmltcG9ydCB7IEFQUEVORF9PUENPREVTIH0gZnJvbSAnLi4vLi4vb3Bjb2Rlcyc7XG5pbXBvcnQgeyBDb25kaXRpb25hbFJlZmVyZW5jZSB9IGZyb20gJy4uLy4uL3JlZmVyZW5jZXMnO1xuaW1wb3J0IHtcbiAgaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgaXNDb21wb25lbnREZWZpbml0aW9uLFxufSBmcm9tICcuLi8uLi9jb21wb25lbnQvY3VycmllZC1jb21wb25lbnQnO1xuaW1wb3J0IHsgQ2hlY2tQYXRoUmVmZXJlbmNlIH0gZnJvbSAnLi8tZGVidWctc3RyaXAnO1xuaW1wb3J0IHsgaXNFbXB0eSwgaXNTYWZlU3RyaW5nLCBpc0ZyYWdtZW50LCBpc05vZGUsIHNob3VsZENvZXJjZSB9IGZyb20gJy4uLy4uL2RvbS9ub3JtYWxpemUnO1xuaW1wb3J0IER5bmFtaWNUZXh0Q29udGVudCBmcm9tICcuLi8uLi92bS9jb250ZW50L3RleHQnO1xuaW1wb3J0IHsgQ29udGVudFR5cGUsIE9wLCBEaWN0LCBNYXliZSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgY2xhc3MgSXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvblJlZmVyZW5jZSBleHRlbmRzIENvbmRpdGlvbmFsUmVmZXJlbmNlIHtcbiAgc3RhdGljIGNyZWF0ZShpbm5lcjogUmVmZXJlbmNlPHVua25vd24+KTogSXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvblJlZmVyZW5jZSB7XG4gICAgcmV0dXJuIG5ldyBDb25kaXRpb25hbFJlZmVyZW5jZShpbm5lciwgaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRlbnRUeXBlUmVmZXJlbmNlIGltcGxlbWVudHMgUmVmZXJlbmNlPENvbnRlbnRUeXBlPiB7XG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBSZWZlcmVuY2U8dW5rbm93bj4pIHtcbiAgICB0aGlzLnRhZyA9IGlubmVyLnRhZztcbiAgfVxuXG4gIHZhbHVlKCk6IENvbnRlbnRUeXBlIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLmlubmVyLnZhbHVlKCkgYXMgTWF5YmU8RGljdD47XG5cbiAgICBpZiAoc2hvdWxkQ29lcmNlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLlN0cmluZztcbiAgICB9IGVsc2UgaWYgKGlzQ29tcG9uZW50RGVmaW5pdGlvbih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBDb250ZW50VHlwZS5Db21wb25lbnQ7XG4gICAgfSBlbHNlIGlmIChpc1NhZmVTdHJpbmcodmFsdWUpKSB7XG4gICAgICByZXR1cm4gQ29udGVudFR5cGUuU2FmZVN0cmluZztcbiAgICB9IGVsc2UgaWYgKGlzRnJhZ21lbnQodmFsdWUpKSB7XG4gICAgICByZXR1cm4gQ29udGVudFR5cGUuRnJhZ21lbnQ7XG4gICAgfSBlbHNlIGlmIChpc05vZGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gQ29udGVudFR5cGUuTm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLlN0cmluZztcbiAgICB9XG4gIH1cbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkFwcGVuZEhUTUwsIHZtID0+IHtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpO1xuXG4gIGxldCByYXdWYWx1ZSA9IHJlZmVyZW5jZS52YWx1ZSgpO1xuICBsZXQgdmFsdWUgPSBpc0VtcHR5KHJhd1ZhbHVlKSA/ICcnIDogU3RyaW5nKHJhd1ZhbHVlKTtcblxuICB2bS5lbGVtZW50cygpLmFwcGVuZER5bmFtaWNIVE1MKHZhbHVlKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQXBwZW5kU2FmZUhUTUwsIHZtID0+IHtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpO1xuXG4gIGxldCByYXdWYWx1ZSA9IGNoZWNrKHJlZmVyZW5jZS52YWx1ZSgpLCBDaGVja1NhZmVTdHJpbmcpLnRvSFRNTCgpO1xuICBsZXQgdmFsdWUgPSBpc0VtcHR5KHJhd1ZhbHVlKSA/ICcnIDogY2hlY2socmF3VmFsdWUsIENoZWNrU3RyaW5nKTtcblxuICB2bS5lbGVtZW50cygpLmFwcGVuZER5bmFtaWNIVE1MKHZhbHVlKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQXBwZW5kVGV4dCwgdm0gPT4ge1xuICBsZXQgcmVmZXJlbmNlID0gY2hlY2sodm0uc3RhY2sucG9wKCksIENoZWNrUGF0aFJlZmVyZW5jZSk7XG5cbiAgbGV0IHJhd1ZhbHVlID0gcmVmZXJlbmNlLnZhbHVlKCk7XG4gIGxldCB2YWx1ZSA9IGlzRW1wdHkocmF3VmFsdWUpID8gJycgOiBTdHJpbmcocmF3VmFsdWUpO1xuXG4gIGxldCBub2RlID0gdm0uZWxlbWVudHMoKS5hcHBlbmREeW5hbWljVGV4dCh2YWx1ZSk7XG5cbiAgaWYgKCFpc0NvbnN0KHJlZmVyZW5jZSkpIHtcbiAgICB2bS51cGRhdGVXaXRoKG5ldyBEeW5hbWljVGV4dENvbnRlbnQobm9kZSwgcmVmZXJlbmNlLCB2YWx1ZSkpO1xuICB9XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkFwcGVuZERvY3VtZW50RnJhZ21lbnQsIHZtID0+IHtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpO1xuXG4gIGxldCB2YWx1ZSA9IGNoZWNrKHJlZmVyZW5jZS52YWx1ZSgpLCBDaGVja0RvY3VtZW50RnJhZ21lbnQpO1xuXG4gIHZtLmVsZW1lbnRzKCkuYXBwZW5kRHluYW1pY0ZyYWdtZW50KHZhbHVlKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQXBwZW5kTm9kZSwgdm0gPT4ge1xuICBsZXQgcmVmZXJlbmNlID0gY2hlY2sodm0uc3RhY2sucG9wKCksIENoZWNrUGF0aFJlZmVyZW5jZSk7XG5cbiAgbGV0IHZhbHVlID0gY2hlY2socmVmZXJlbmNlLnZhbHVlKCksIENoZWNrTm9kZSk7XG5cbiAgdm0uZWxlbWVudHMoKS5hcHBlbmREeW5hbWljTm9kZSh2YWx1ZSk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiIn0=