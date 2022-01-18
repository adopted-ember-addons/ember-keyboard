var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _a;
var CURRIED_COMPONENT_DEFINITION_BRAND = 'CURRIED COMPONENT DEFINITION [id=6f00feb9-a0ef-4547-99ea-ac328f80acea]';
export function isCurriedComponentDefinition(definition) {
    return !!(definition && definition[CURRIED_COMPONENT_DEFINITION_BRAND]);
}
export function isComponentDefinition(definition) {
    return !!(definition && definition[CURRIED_COMPONENT_DEFINITION_BRAND]);
}
export var CurriedComponentDefinition = function () {
    /** @internal */
    function CurriedComponentDefinition(inner, args) {
        _classCallCheck(this, CurriedComponentDefinition);

        this.inner = inner;
        this.args = args;
        this[_a] = true;
    }

    CurriedComponentDefinition.prototype.unwrap = function unwrap(args) {
        args.realloc(this.offset);
        var definition = this;
        while (true) {
            var _definition = definition,
                curriedArgs = _definition.args,
                inner = _definition.inner;

            if (curriedArgs) {
                args.positional.prepend(curriedArgs.positional);
                args.named.merge(curriedArgs.named);
            }
            if (!isCurriedComponentDefinition(inner)) {
                return inner;
            }
            definition = inner;
        }
    };
    /** @internal */


    _createClass(CurriedComponentDefinition, [{
        key: 'offset',
        get: function get() {
            var inner = this.inner,
                args = this.args;

            var length = args ? args.positional.length : 0;
            return isCurriedComponentDefinition(inner) ? length + inner.offset : length;
        }
    }]);

    return CurriedComponentDefinition;
}();
_a = CURRIED_COMPONENT_DEFINITION_BRAND;
export function curry(spec) {
    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    return new CurriedComponentDefinition(spec, args);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBvbmVudC9jdXJyaWVkLWNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUlBLElBQU0scUNBQU4sd0VBQUE7QUFHQSxPQUFNLFNBQUEsNEJBQUEsQ0FBQSxVQUFBLEVBQ2U7QUFFbkIsV0FBTyxDQUFDLEVBQUUsY0FBZSxXQUF6QixrQ0FBeUIsQ0FBakIsQ0FBUjtBQUNEO0FBRUQsT0FBTSxTQUFBLHFCQUFBLENBQUEsVUFBQSxFQUNtQjtBQUV2QixXQUFPLENBQUMsRUFBRSxjQUFjLFdBQXhCLGtDQUF3QixDQUFoQixDQUFSO0FBQ0Q7QUFFRCxXQUFNLDBCQUFOO0FBR0U7QUFDQSx3Q0FBQSxLQUFBLEVBQUEsSUFBQSxFQUUyQztBQUFBOztBQUQvQixhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUxILGFBQUEsRUFBQSxJQUFBLElBQUE7QUFNTDs7QUFQTix5Q0FTRSxNQVRGLG1CQVNFLElBVEYsRUFTOEI7QUFDMUIsYUFBQSxPQUFBLENBQWEsS0FBYixNQUFBO0FBRUEsWUFBSSxhQUFKLElBQUE7QUFFQSxlQUFBLElBQUEsRUFBYTtBQUFBLDhCQUNYLFVBRFc7QUFBQSxnQkFDUCxXQURPLGVBQ0wsSUFESztBQUFBLGdCQUNQLEtBRE8sZUFDUCxLQURPOztBQUdYLGdCQUFBLFdBQUEsRUFBaUI7QUFDZixxQkFBQSxVQUFBLENBQUEsT0FBQSxDQUF3QixZQUF4QixVQUFBO0FBQ0EscUJBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBaUIsWUFBakIsS0FBQTtBQUNEO0FBRUQsZ0JBQUksQ0FBQyw2QkFBTCxLQUFLLENBQUwsRUFBMEM7QUFDeEMsdUJBQUEsS0FBQTtBQUNEO0FBRUQseUJBQUEsS0FBQTtBQUNEO0FBQ0YsS0E1Qkg7QUE4QkU7OztBQTlCRjtBQUFBO0FBQUEsNEJBK0JZO0FBQUEsZ0JBQ0osS0FESSxHQUNSLElBRFEsQ0FDSixLQURJO0FBQUEsZ0JBQ0osSUFESSxHQUNSLElBRFEsQ0FDSixJQURJOztBQUVSLGdCQUFJLFNBQVMsT0FBTyxLQUFBLFVBQUEsQ0FBUCxNQUFBLEdBQWIsQ0FBQTtBQUNBLG1CQUFPLDZCQUFBLEtBQUEsSUFBc0MsU0FBUyxNQUEvQyxNQUFBLEdBQVAsTUFBQTtBQUNEO0FBbkNIOztBQUFBO0FBQUE7S0FDWSxrQztBQXFDWixPQUFNLFNBQUEsS0FBQSxDQUFBLElBQUEsRUFFa0M7QUFBQSxRQUF0QyxJQUFzQyx1RUFGbEMsSUFFa0M7O0FBRXRDLFdBQU8sSUFBQSwwQkFBQSxDQUFBLElBQUEsRUFBUCxJQUFPLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhcHR1cmVkQXJndW1lbnRzLCBDb21wb25lbnREZWZpbml0aW9uLCBEaWN0LCBNYXliZSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBWTUFyZ3VtZW50c0ltcGwgfSBmcm9tICcuLi92bS9hcmd1bWVudHMnO1xuXG5jb25zdCBDVVJSSUVEX0NPTVBPTkVOVF9ERUZJTklUSU9OX0JSQU5EID1cbiAgJ0NVUlJJRUQgQ09NUE9ORU5UIERFRklOSVRJT04gW2lkPTZmMDBmZWI5LWEwZWYtNDU0Ny05OWVhLWFjMzI4ZjgwYWNlYV0nO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihcbiAgZGVmaW5pdGlvbjogdW5rbm93blxuKTogZGVmaW5pdGlvbiBpcyBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbiB7XG4gIHJldHVybiAhIShkZWZpbml0aW9uICYmIChkZWZpbml0aW9uIGFzIERpY3QpW0NVUlJJRURfQ09NUE9ORU5UX0RFRklOSVRJT05fQlJBTkRdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcG9uZW50RGVmaW5pdGlvbihcbiAgZGVmaW5pdGlvbjogTWF5YmU8RGljdD5cbik6IGRlZmluaXRpb24gaXMgQ3VycmllZENvbXBvbmVudERlZmluaXRpb24ge1xuICByZXR1cm4gISEoZGVmaW5pdGlvbiAmJiBkZWZpbml0aW9uW0NVUlJJRURfQ09NUE9ORU5UX0RFRklOSVRJT05fQlJBTkRdKTtcbn1cblxuZXhwb3J0IGNsYXNzIEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uIHtcbiAgcmVhZG9ubHkgW0NVUlJJRURfQ09NUE9ORU5UX0RFRklOSVRJT05fQlJBTkRdID0gdHJ1ZTtcblxuICAvKiogQGludGVybmFsICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCBpbm5lcjogQ29tcG9uZW50RGVmaW5pdGlvbiB8IEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uLFxuICAgIHByb3RlY3RlZCBhcmdzOiBPcHRpb248Q2FwdHVyZWRBcmd1bWVudHM+XG4gICkge31cblxuICB1bndyYXAoYXJnczogVk1Bcmd1bWVudHNJbXBsKTogQ29tcG9uZW50RGVmaW5pdGlvbiB7XG4gICAgYXJncy5yZWFsbG9jKHRoaXMub2Zmc2V0KTtcblxuICAgIGxldCBkZWZpbml0aW9uOiBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbiA9IHRoaXM7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IHsgYXJnczogY3VycmllZEFyZ3MsIGlubmVyIH0gPSBkZWZpbml0aW9uO1xuXG4gICAgICBpZiAoY3VycmllZEFyZ3MpIHtcbiAgICAgICAgYXJncy5wb3NpdGlvbmFsLnByZXBlbmQoY3VycmllZEFyZ3MucG9zaXRpb25hbCk7XG4gICAgICAgIGFyZ3MubmFtZWQubWVyZ2UoY3VycmllZEFyZ3MubmFtZWQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oaW5uZXIpKSB7XG4gICAgICAgIHJldHVybiBpbm5lcjtcbiAgICAgIH1cblxuICAgICAgZGVmaW5pdGlvbiA9IGlubmVyO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgZ2V0IG9mZnNldCgpOiBudW1iZXIge1xuICAgIGxldCB7IGlubmVyLCBhcmdzIH0gPSB0aGlzO1xuICAgIGxldCBsZW5ndGggPSBhcmdzID8gYXJncy5wb3NpdGlvbmFsLmxlbmd0aCA6IDA7XG4gICAgcmV0dXJuIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oaW5uZXIpID8gbGVuZ3RoICsgaW5uZXIub2Zmc2V0IDogbGVuZ3RoO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdXJyeShcbiAgc3BlYzogQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgYXJnczogT3B0aW9uPENhcHR1cmVkQXJndW1lbnRzPiA9IG51bGxcbik6IEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uIHtcbiAgcmV0dXJuIG5ldyBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihzcGVjIGFzIENvbXBvbmVudERlZmluaXRpb24sIGFyZ3MpO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==