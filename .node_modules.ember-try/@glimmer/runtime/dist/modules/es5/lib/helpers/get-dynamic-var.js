function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { combine, createUpdatableTag, update } from '@glimmer/reference';

var DynamicVarReference = function () {
    function DynamicVarReference(scope, nameRef) {
        _classCallCheck(this, DynamicVarReference);

        this.scope = scope;
        this.nameRef = nameRef;
        var varTag = this.varTag = createUpdatableTag();
        this.tag = combine([nameRef.tag, varTag]);
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
        update(this.varTag, ref.tag);
        return ref;
    };

    return DynamicVarReference;
}();

function getDynamicVar(args, vm) {
    var scope = vm.dynamicScope();
    var nameRef = args.positional.at(0);
    return new DynamicVarReference(scope, nameRef);
}
export default getDynamicVar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2hlbHBlcnMvZ2V0LWR5bmFtaWMtdmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsU0FBQSxPQUFBLEVBQUEsa0JBQUEsRUFBQSxNQUFBLFFBQUEsb0JBQUE7O0lBVUEsbUI7QUFJRSxpQ0FBQSxLQUFBLEVBQUEsT0FBQSxFQUFnRjtBQUFBOztBQUE1RCxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQTZCLGFBQUEsT0FBQSxHQUFBLE9BQUE7QUFDL0MsWUFBSSxTQUFVLEtBQUEsTUFBQSxHQUFkLG9CQUFBO0FBQ0EsYUFBQSxHQUFBLEdBQVcsUUFBUSxDQUFDLFFBQUQsR0FBQSxFQUFuQixNQUFtQixDQUFSLENBQVg7QUFDRDs7a0NBRUQsSyxvQkFBSztBQUNILGVBQU8sS0FBQSxNQUFBLEdBQVAsS0FBTyxFQUFQO0FBQ0QsSzs7a0NBRUQsRyxnQkFBQSxHLEVBQWU7QUFDYixlQUFPLEtBQUEsTUFBQSxHQUFBLEdBQUEsQ0FBUCxHQUFPLENBQVA7QUFDRCxLOztrQ0FFTyxNLHFCQUFNO0FBQ1osWUFBSSxPQUFPLE9BQU8sS0FBQSxPQUFBLENBQWxCLEtBQWtCLEVBQVAsQ0FBWDtBQUNBLFlBQUksTUFBTSxLQUFBLEtBQUEsQ0FBQSxHQUFBLENBQVYsSUFBVSxDQUFWO0FBRUEsZUFBTyxLQUFQLE1BQUEsRUFBb0IsSUFBcEIsR0FBQTtBQUVBLGVBQUEsR0FBQTtBQUNELEs7Ozs7O0FBR0gsU0FBQSxhQUFBLENBQUEsSUFBQSxFQUFBLEVBQUEsRUFBc0Q7QUFDcEQsUUFBSSxRQUFRLEdBQVosWUFBWSxFQUFaO0FBQ0EsUUFBSSxVQUFVLEtBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBZCxDQUFjLENBQWQ7QUFFQSxXQUFPLElBQUEsbUJBQUEsQ0FBQSxLQUFBLEVBQVAsT0FBTyxDQUFQO0FBQ0Q7QUFFRCxlQUFBLGFBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBUYWcsXG4gIFVwZGF0YWJsZVRhZyxcbiAgUGF0aFJlZmVyZW5jZSxcbiAgY29tYmluZSxcbiAgY3JlYXRlVXBkYXRhYmxlVGFnLFxuICB1cGRhdGUsXG59IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBEeW5hbWljU2NvcGUsIFZNIGFzIFB1YmxpY1ZNLCBWTUFyZ3VtZW50cywgSGVscGVyIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmNsYXNzIER5bmFtaWNWYXJSZWZlcmVuY2UgaW1wbGVtZW50cyBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgcHVibGljIHRhZzogVGFnO1xuICBwcml2YXRlIHZhclRhZzogVXBkYXRhYmxlVGFnO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc2NvcGU6IER5bmFtaWNTY29wZSwgcHJpdmF0ZSBuYW1lUmVmOiBQYXRoUmVmZXJlbmNlPHVua25vd24+KSB7XG4gICAgbGV0IHZhclRhZyA9ICh0aGlzLnZhclRhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpKTtcbiAgICB0aGlzLnRhZyA9IGNvbWJpbmUoW25hbWVSZWYudGFnLCB2YXJUYWddKTtcbiAgfVxuXG4gIHZhbHVlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLmdldFZhcigpLnZhbHVlKCk7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRWYXIoKS5nZXQoa2V5KTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VmFyKCk6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4ge1xuICAgIGxldCBuYW1lID0gU3RyaW5nKHRoaXMubmFtZVJlZi52YWx1ZSgpKTtcbiAgICBsZXQgcmVmID0gdGhpcy5zY29wZS5nZXQobmFtZSk7XG5cbiAgICB1cGRhdGUodGhpcy52YXJUYWcsIHJlZi50YWcpO1xuXG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREeW5hbWljVmFyKGFyZ3M6IFZNQXJndW1lbnRzLCB2bTogUHVibGljVk0pOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgbGV0IHNjb3BlID0gdm0uZHluYW1pY1Njb3BlKCk7XG4gIGxldCBuYW1lUmVmID0gYXJncy5wb3NpdGlvbmFsLmF0KDApO1xuXG4gIHJldHVybiBuZXcgRHluYW1pY1ZhclJlZmVyZW5jZShzY29wZSwgbmFtZVJlZik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldER5bmFtaWNWYXIgYXMgSGVscGVyO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==