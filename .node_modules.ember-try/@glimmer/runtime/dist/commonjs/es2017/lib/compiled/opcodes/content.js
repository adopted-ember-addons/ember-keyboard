'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ContentTypeReference = exports.IsCurriedComponentDefinitionReference = undefined;

var _reference = require('@glimmer/reference');

var _opcodes = require('../../opcodes');

var _references = require('../../references');

var _curriedComponent = require('../../component/curried-component');

var _normalize = require('../../dom/normalize');

var _text = require('../../vm/content/text');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class IsCurriedComponentDefinitionReference extends _references.ConditionalReference {
    static create(inner) {
        return new _references.ConditionalReference(inner, _curriedComponent.isCurriedComponentDefinition);
    }
}
exports.IsCurriedComponentDefinitionReference = IsCurriedComponentDefinitionReference;
class ContentTypeReference {
    constructor(inner) {
        this.inner = inner;
        this.tag = inner.tag;
    }
    value() {
        let value = this.inner.value();
        if ((0, _normalize.shouldCoerce)(value)) {
            return 1 /* String */;
        } else if ((0, _curriedComponent.isComponentDefinition)(value)) {
            return 0 /* Component */;
        } else if ((0, _normalize.isSafeString)(value)) {
            return 3 /* SafeString */;
        } else if ((0, _normalize.isFragment)(value)) {
            return 4 /* Fragment */;
        } else if ((0, _normalize.isNode)(value)) {
            return 5 /* Node */;
        } else {
                return 1 /* String */;
            }
    }
}
exports.ContentTypeReference = ContentTypeReference;
_opcodes.APPEND_OPCODES.add(42 /* AppendHTML */, vm => {
    let reference = vm.stack.pop();
    let rawValue = reference.value();
    let value = (0, _normalize.isEmpty)(rawValue) ? '' : String(rawValue);
    vm.elements().appendDynamicHTML(value);
});
_opcodes.APPEND_OPCODES.add(43 /* AppendSafeHTML */, vm => {
    let reference = vm.stack.pop();
    let rawValue = reference.value().toHTML();
    let value = (0, _normalize.isEmpty)(rawValue) ? '' : rawValue;
    vm.elements().appendDynamicHTML(value);
});
_opcodes.APPEND_OPCODES.add(46 /* AppendText */, vm => {
    let reference = vm.stack.pop();
    let rawValue = reference.value();
    let value = (0, _normalize.isEmpty)(rawValue) ? '' : String(rawValue);
    let node = vm.elements().appendDynamicText(value);
    if (!(0, _reference.isConst)(reference)) {
        vm.updateWith(new _text2.default(node, reference, value));
    }
});
_opcodes.APPEND_OPCODES.add(44 /* AppendDocumentFragment */, vm => {
    let reference = vm.stack.pop();
    let value = reference.value();
    vm.elements().appendDynamicFragment(value);
});
_opcodes.APPEND_OPCODES.add(45 /* AppendNode */, vm => {
    let reference = vm.stack.pop();
    let value = reference.value();
    vm.elements().appendDynamicNode(value);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvY29udGVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFTQTs7QUFDQTs7QUFDQTs7QUFLQTs7QUFDQTs7Ozs7O0FBR00sTUFBQSxxQ0FBQSxTQUFBLGdDQUFBLENBQXlFO0FBQzdFLFdBQUEsTUFBQSxDQUFBLEtBQUEsRUFBdUM7QUFDckMsZUFBTyxJQUFBLGdDQUFBLENBQUEsS0FBQSxFQUFQLDhDQUFPLENBQVA7QUFDRDtBQUg0RTtRQUF6RSxxQyxHQUFBLHFDO0FBTUEsTUFBQSxvQkFBQSxDQUEyQjtBQUcvQixnQkFBQSxLQUFBLEVBQTZDO0FBQXpCLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDbEIsYUFBQSxHQUFBLEdBQVcsTUFBWCxHQUFBO0FBQ0Q7QUFFRCxZQUFLO0FBQ0gsWUFBSSxRQUFRLEtBQUEsS0FBQSxDQUFaLEtBQVksRUFBWjtBQUVBLFlBQUksNkJBQUosS0FBSSxDQUFKLEVBQXlCO0FBQ3ZCLG1CQUFBLENBQUEsQ0FBQSxZQUFBO0FBREYsU0FBQSxNQUVPLElBQUksNkNBQUosS0FBSSxDQUFKLEVBQWtDO0FBQ3ZDLG1CQUFBLENBQUEsQ0FBQSxlQUFBO0FBREssU0FBQSxNQUVBLElBQUksNkJBQUosS0FBSSxDQUFKLEVBQXlCO0FBQzlCLG1CQUFBLENBQUEsQ0FBQSxnQkFBQTtBQURLLFNBQUEsTUFFQSxJQUFJLDJCQUFKLEtBQUksQ0FBSixFQUF1QjtBQUM1QixtQkFBQSxDQUFBLENBQUEsY0FBQTtBQURLLFNBQUEsTUFFQSxJQUFJLHVCQUFKLEtBQUksQ0FBSixFQUFtQjtBQUN4QixtQkFBQSxDQUFBLENBQUEsVUFBQTtBQURLLFNBQUEsTUFFQTtBQUNMLHVCQUFBLENBQUEsQ0FBQSxZQUFBO0FBQ0Q7QUFDRjtBQXZCOEI7UUFBM0Isb0IsR0FBQSxvQjtBQTBCTix3QkFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLGdCQUFBLEVBQWtDLE1BQUs7QUFDckMsUUFBSSxZQUFrQixHQUFBLEtBQUEsQ0FBdEIsR0FBc0IsRUFBdEI7QUFFQSxRQUFJLFdBQVcsVUFBZixLQUFlLEVBQWY7QUFDQSxRQUFJLFFBQVEsd0JBQUEsUUFBQSxJQUFBLEVBQUEsR0FBeUIsT0FBckMsUUFBcUMsQ0FBckM7QUFFQSxPQUFBLFFBQUEsR0FBQSxpQkFBQSxDQUFBLEtBQUE7QUFORixDQUFBO0FBU0Esd0JBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxvQkFBQSxFQUFzQyxNQUFLO0FBQ3pDLFFBQUksWUFBa0IsR0FBQSxLQUFBLENBQXRCLEdBQXNCLEVBQXRCO0FBRUEsUUFBSSxXQUFpQixVQUFOLEtBQU0sR0FBckIsTUFBcUIsRUFBckI7QUFDQSxRQUFJLFFBQVEsd0JBQUEsUUFBQSxJQUFBLEVBQUEsR0FBWixRQUFBO0FBRUEsT0FBQSxRQUFBLEdBQUEsaUJBQUEsQ0FBQSxLQUFBO0FBTkYsQ0FBQTtBQVNBLHdCQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsZ0JBQUEsRUFBa0MsTUFBSztBQUNyQyxRQUFJLFlBQWtCLEdBQUEsS0FBQSxDQUF0QixHQUFzQixFQUF0QjtBQUVBLFFBQUksV0FBVyxVQUFmLEtBQWUsRUFBZjtBQUNBLFFBQUksUUFBUSx3QkFBQSxRQUFBLElBQUEsRUFBQSxHQUF5QixPQUFyQyxRQUFxQyxDQUFyQztBQUVBLFFBQUksT0FBTyxHQUFBLFFBQUEsR0FBQSxpQkFBQSxDQUFYLEtBQVcsQ0FBWDtBQUVBLFFBQUksQ0FBQyx3QkFBTCxTQUFLLENBQUwsRUFBeUI7QUFDdkIsV0FBQSxVQUFBLENBQWMsSUFBQSxjQUFBLENBQUEsSUFBQSxFQUFBLFNBQUEsRUFBZCxLQUFjLENBQWQ7QUFDRDtBQVZILENBQUE7QUFhQSx3QkFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLDRCQUFBLEVBQThDLE1BQUs7QUFDakQsUUFBSSxZQUFrQixHQUFBLEtBQUEsQ0FBdEIsR0FBc0IsRUFBdEI7QUFFQSxRQUFJLFFBQWMsVUFBbEIsS0FBa0IsRUFBbEI7QUFFQSxPQUFBLFFBQUEsR0FBQSxxQkFBQSxDQUFBLEtBQUE7QUFMRixDQUFBO0FBUUEsd0JBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxnQkFBQSxFQUFrQyxNQUFLO0FBQ3JDLFFBQUksWUFBa0IsR0FBQSxLQUFBLENBQXRCLEdBQXNCLEVBQXRCO0FBRUEsUUFBSSxRQUFjLFVBQWxCLEtBQWtCLEVBQWxCO0FBRUEsT0FBQSxRQUFBLEdBQUEsaUJBQUEsQ0FBQSxLQUFBO0FBTEYsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlZmVyZW5jZSwgVGFnLCBpc0NvbnN0IH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7XG4gIGNoZWNrLFxuICBDaGVja1N0cmluZyxcbiAgQ2hlY2tTYWZlU3RyaW5nLFxuICBDaGVja05vZGUsXG4gIENoZWNrRG9jdW1lbnRGcmFnbWVudCxcbn0gZnJvbSAnQGdsaW1tZXIvZGVidWcnO1xuXG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUyB9IGZyb20gJy4uLy4uL29wY29kZXMnO1xuaW1wb3J0IHsgQ29uZGl0aW9uYWxSZWZlcmVuY2UgfSBmcm9tICcuLi8uLi9yZWZlcmVuY2VzJztcbmltcG9ydCB7XG4gIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24sXG4gIGlzQ29tcG9uZW50RGVmaW5pdGlvbixcbn0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2N1cnJpZWQtY29tcG9uZW50JztcbmltcG9ydCB7IENoZWNrUGF0aFJlZmVyZW5jZSB9IGZyb20gJy4vLWRlYnVnLXN0cmlwJztcbmltcG9ydCB7IGlzRW1wdHksIGlzU2FmZVN0cmluZywgaXNGcmFnbWVudCwgaXNOb2RlLCBzaG91bGRDb2VyY2UgfSBmcm9tICcuLi8uLi9kb20vbm9ybWFsaXplJztcbmltcG9ydCBEeW5hbWljVGV4dENvbnRlbnQgZnJvbSAnLi4vLi4vdm0vY29udGVudC90ZXh0JztcbmltcG9ydCB7IENvbnRlbnRUeXBlLCBPcCwgRGljdCwgTWF5YmUgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGNsYXNzIElzQ3VycmllZENvbXBvbmVudERlZmluaXRpb25SZWZlcmVuY2UgZXh0ZW5kcyBDb25kaXRpb25hbFJlZmVyZW5jZSB7XG4gIHN0YXRpYyBjcmVhdGUoaW5uZXI6IFJlZmVyZW5jZTx1bmtub3duPik6IElzQ3VycmllZENvbXBvbmVudERlZmluaXRpb25SZWZlcmVuY2Uge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWxSZWZlcmVuY2UoaW5uZXIsIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZW50VHlwZVJlZmVyZW5jZSBpbXBsZW1lbnRzIFJlZmVyZW5jZTxDb250ZW50VHlwZT4ge1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogUmVmZXJlbmNlPHVua25vd24+KSB7XG4gICAgdGhpcy50YWcgPSBpbm5lci50YWc7XG4gIH1cblxuICB2YWx1ZSgpOiBDb250ZW50VHlwZSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5pbm5lci52YWx1ZSgpIGFzIE1heWJlPERpY3Q+O1xuXG4gICAgaWYgKHNob3VsZENvZXJjZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBDb250ZW50VHlwZS5TdHJpbmc7XG4gICAgfSBlbHNlIGlmIChpc0NvbXBvbmVudERlZmluaXRpb24odmFsdWUpKSB7XG4gICAgICByZXR1cm4gQ29udGVudFR5cGUuQ29tcG9uZW50O1xuICAgIH0gZWxzZSBpZiAoaXNTYWZlU3RyaW5nKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLlNhZmVTdHJpbmc7XG4gICAgfSBlbHNlIGlmIChpc0ZyYWdtZW50KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLkZyYWdtZW50O1xuICAgIH0gZWxzZSBpZiAoaXNOb2RlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLk5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBDb250ZW50VHlwZS5TdHJpbmc7XG4gICAgfVxuICB9XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5BcHBlbmRIVE1MLCB2bSA9PiB7XG4gIGxldCByZWZlcmVuY2UgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKTtcblxuICBsZXQgcmF3VmFsdWUgPSByZWZlcmVuY2UudmFsdWUoKTtcbiAgbGV0IHZhbHVlID0gaXNFbXB0eShyYXdWYWx1ZSkgPyAnJyA6IFN0cmluZyhyYXdWYWx1ZSk7XG5cbiAgdm0uZWxlbWVudHMoKS5hcHBlbmREeW5hbWljSFRNTCh2YWx1ZSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkFwcGVuZFNhZmVIVE1MLCB2bSA9PiB7XG4gIGxldCByZWZlcmVuY2UgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKTtcblxuICBsZXQgcmF3VmFsdWUgPSBjaGVjayhyZWZlcmVuY2UudmFsdWUoKSwgQ2hlY2tTYWZlU3RyaW5nKS50b0hUTUwoKTtcbiAgbGV0IHZhbHVlID0gaXNFbXB0eShyYXdWYWx1ZSkgPyAnJyA6IGNoZWNrKHJhd1ZhbHVlLCBDaGVja1N0cmluZyk7XG5cbiAgdm0uZWxlbWVudHMoKS5hcHBlbmREeW5hbWljSFRNTCh2YWx1ZSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkFwcGVuZFRleHQsIHZtID0+IHtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpO1xuXG4gIGxldCByYXdWYWx1ZSA9IHJlZmVyZW5jZS52YWx1ZSgpO1xuICBsZXQgdmFsdWUgPSBpc0VtcHR5KHJhd1ZhbHVlKSA/ICcnIDogU3RyaW5nKHJhd1ZhbHVlKTtcblxuICBsZXQgbm9kZSA9IHZtLmVsZW1lbnRzKCkuYXBwZW5kRHluYW1pY1RleHQodmFsdWUpO1xuXG4gIGlmICghaXNDb25zdChyZWZlcmVuY2UpKSB7XG4gICAgdm0udXBkYXRlV2l0aChuZXcgRHluYW1pY1RleHRDb250ZW50KG5vZGUsIHJlZmVyZW5jZSwgdmFsdWUpKTtcbiAgfVxufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5BcHBlbmREb2N1bWVudEZyYWdtZW50LCB2bSA9PiB7XG4gIGxldCByZWZlcmVuY2UgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKTtcblxuICBsZXQgdmFsdWUgPSBjaGVjayhyZWZlcmVuY2UudmFsdWUoKSwgQ2hlY2tEb2N1bWVudEZyYWdtZW50KTtcblxuICB2bS5lbGVtZW50cygpLmFwcGVuZER5bmFtaWNGcmFnbWVudCh2YWx1ZSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkFwcGVuZE5vZGUsIHZtID0+IHtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpO1xuXG4gIGxldCB2YWx1ZSA9IGNoZWNrKHJlZmVyZW5jZS52YWx1ZSgpLCBDaGVja05vZGUpO1xuXG4gIHZtLmVsZW1lbnRzKCkuYXBwZW5kRHluYW1pY05vZGUodmFsdWUpO1xufSk7XG4iXSwic291cmNlUm9vdCI6IiJ9