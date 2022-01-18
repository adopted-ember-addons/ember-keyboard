"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _reference = require("@glimmer/reference");

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var DynamicVarReference = function () {
    function DynamicVarReference(scope, nameRef) {
        _classCallCheck(this, DynamicVarReference);

        this.scope = scope;
        this.nameRef = nameRef;
        var varTag = this.varTag = (0, _reference.createUpdatableTag)();
        this.tag = (0, _reference.combine)([nameRef.tag, varTag]);
    }

    DynamicVarReference.prototype.value = function value() {
        return this.getVar().value();
    };

    DynamicVarReference.prototype.get = function get(key) {
        return this.getVar().get(key);
    };

    DynamicVarReference.prototype.getVar = function getVar() {
        var name = String(this.nameRef.value());
        var ref = this.scope.get(name);
        (0, _reference.update)(this.varTag, ref.tag);
        return ref;
    };

    return DynamicVarReference;
}();

function getDynamicVar(args, vm) {
    var scope = vm.dynamicScope();
    var nameRef = args.positional.at(0);
    return new DynamicVarReference(scope, nameRef);
}
exports.default = getDynamicVar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2hlbHBlcnMvZ2V0LWR5bmFtaWMtdmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7OztJQVVBLHNCO0FBSUUsYUFBQSxtQkFBQSxDQUFBLEtBQUEsRUFBQSxPQUFBLEVBQWdGO0FBQUEsd0JBQUEsSUFBQSxFQUFBLG1CQUFBOztBQUE1RCxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQTZCLGFBQUEsT0FBQSxHQUFBLE9BQUE7QUFDL0MsWUFBSSxTQUFVLEtBQUEsTUFBQSxHQUFkLG9DQUFBO0FBQ0EsYUFBQSxHQUFBLEdBQVcsd0JBQVEsQ0FBQyxRQUFELEdBQUEsRUFBbkIsTUFBbUIsQ0FBUixDQUFYO0FBQ0Q7O2tDQUVELEssb0JBQUs7QUFDSCxlQUFPLEtBQUEsTUFBQSxHQUFQLEtBQU8sRUFBUDs7O2tDQUdGLEcsZ0JBQUEsRyxFQUFlO0FBQ2IsZUFBTyxLQUFBLE1BQUEsR0FBQSxHQUFBLENBQVAsR0FBTyxDQUFQOzs7a0NBR00sTSxxQkFBTTtBQUNaLFlBQUksT0FBTyxPQUFPLEtBQUEsT0FBQSxDQUFsQixLQUFrQixFQUFQLENBQVg7QUFDQSxZQUFJLE1BQU0sS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFWLElBQVUsQ0FBVjtBQUVBLCtCQUFPLEtBQVAsTUFBQSxFQUFvQixJQUFwQixHQUFBO0FBRUEsZUFBQSxHQUFBOzs7Ozs7QUFJSixTQUFBLGFBQUEsQ0FBQSxJQUFBLEVBQUEsRUFBQSxFQUFzRDtBQUNwRCxRQUFJLFFBQVEsR0FBWixZQUFZLEVBQVo7QUFDQSxRQUFJLFVBQVUsS0FBQSxVQUFBLENBQUEsRUFBQSxDQUFkLENBQWMsQ0FBZDtBQUVBLFdBQU8sSUFBQSxtQkFBQSxDQUFBLEtBQUEsRUFBUCxPQUFPLENBQVA7QUFDRDtrQkFFRCxhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgVGFnLFxuICBVcGRhdGFibGVUYWcsXG4gIFBhdGhSZWZlcmVuY2UsXG4gIGNvbWJpbmUsXG4gIGNyZWF0ZVVwZGF0YWJsZVRhZyxcbiAgdXBkYXRlLFxufSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgRHluYW1pY1Njb3BlLCBWTSBhcyBQdWJsaWNWTSwgVk1Bcmd1bWVudHMsIEhlbHBlciB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5jbGFzcyBEeW5hbWljVmFyUmVmZXJlbmNlIGltcGxlbWVudHMgUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gIHB1YmxpYyB0YWc6IFRhZztcbiAgcHJpdmF0ZSB2YXJUYWc6IFVwZGF0YWJsZVRhZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNjb3BlOiBEeW5hbWljU2NvcGUsIHByaXZhdGUgbmFtZVJlZjogUGF0aFJlZmVyZW5jZTx1bmtub3duPikge1xuICAgIGxldCB2YXJUYWcgPSAodGhpcy52YXJUYWcgPSBjcmVhdGVVcGRhdGFibGVUYWcoKSk7XG4gICAgdGhpcy50YWcgPSBjb21iaW5lKFtuYW1lUmVmLnRhZywgdmFyVGFnXSk7XG4gIH1cblxuICB2YWx1ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5nZXRWYXIoKS52YWx1ZSgpO1xuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VmFyKCkuZ2V0KGtleSk7XG4gIH1cblxuICBwcml2YXRlIGdldFZhcigpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICBsZXQgbmFtZSA9IFN0cmluZyh0aGlzLm5hbWVSZWYudmFsdWUoKSk7XG4gICAgbGV0IHJlZiA9IHRoaXMuc2NvcGUuZ2V0KG5hbWUpO1xuXG4gICAgdXBkYXRlKHRoaXMudmFyVGFnLCByZWYudGFnKTtcblxuICAgIHJldHVybiByZWY7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RHluYW1pY1ZhcihhcmdzOiBWTUFyZ3VtZW50cywgdm06IFB1YmxpY1ZNKTogUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gIGxldCBzY29wZSA9IHZtLmR5bmFtaWNTY29wZSgpO1xuICBsZXQgbmFtZVJlZiA9IGFyZ3MucG9zaXRpb25hbC5hdCgwKTtcblxuICByZXR1cm4gbmV3IER5bmFtaWNWYXJSZWZlcmVuY2Uoc2NvcGUsIG5hbWVSZWYpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXREeW5hbWljVmFyIGFzIEhlbHBlcjtcbiJdLCJzb3VyY2VSb290IjoiIn0=