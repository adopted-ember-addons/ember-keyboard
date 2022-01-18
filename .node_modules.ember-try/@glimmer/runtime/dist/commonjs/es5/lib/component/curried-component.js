"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isCurriedComponentDefinition = isCurriedComponentDefinition;
exports.isComponentDefinition = isComponentDefinition;
exports.curry = curry;
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var _a;
var CURRIED_COMPONENT_DEFINITION_BRAND = 'CURRIED COMPONENT DEFINITION [id=6f00feb9-a0ef-4547-99ea-ac328f80acea]';
function isCurriedComponentDefinition(definition) {
    return !!(definition && definition[CURRIED_COMPONENT_DEFINITION_BRAND]);
}
function isComponentDefinition(definition) {
    return !!(definition && definition[CURRIED_COMPONENT_DEFINITION_BRAND]);
}
var CurriedComponentDefinition = exports.CurriedComponentDefinition = function () {
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
function curry(spec) {
    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    return new CurriedComponentDefinition(spec, args);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBvbmVudC9jdXJyaWVkLWNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQU9NLDRCLEdBQUEsNEI7UUFNQSxxQixHQUFBLHFCO1FBNENBLEssR0FBQSxLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFyRE4sSUFBTSxxQ0FBTix3RUFBQTtBQUdNLFNBQUEsNEJBQUEsQ0FBQSxVQUFBLEVBQ2U7QUFFbkIsV0FBTyxDQUFDLEVBQUUsY0FBZSxXQUF6QixrQ0FBeUIsQ0FBakIsQ0FBUjtBQUNEO0FBRUssU0FBQSxxQkFBQSxDQUFBLFVBQUEsRUFDbUI7QUFFdkIsV0FBTyxDQUFDLEVBQUUsY0FBYyxXQUF4QixrQ0FBd0IsQ0FBaEIsQ0FBUjtBQUNEO0FBRUQsSUFBQSxrRUFBQSxZQUFBO0FBR0U7QUFDQSxhQUFBLDBCQUFBLENBQUEsS0FBQSxFQUFBLElBQUEsRUFFMkM7QUFBQSx3QkFBQSxJQUFBLEVBQUEsMEJBQUE7O0FBRC9CLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxJQUFBO0FBTEgsYUFBQSxFQUFBLElBQUEsSUFBQTtBQU1MOztBQVBOLCtCQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQUEsU0FBQSxNQUFBLENBQUEsSUFBQSxFQVM4QjtBQUMxQixhQUFBLE9BQUEsQ0FBYSxLQUFiLE1BQUE7QUFFQSxZQUFJLGFBQUosSUFBQTtBQUVBLGVBQUEsSUFBQSxFQUFhO0FBQUEsZ0JBQUEsY0FBQSxVQUFBO0FBQUEsZ0JBQUEsY0FBQSxZQUFBLElBQUE7QUFBQSxnQkFBQSxRQUFBLFlBQUEsS0FBQTs7QUFHWCxnQkFBQSxXQUFBLEVBQWlCO0FBQ2YscUJBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBd0IsWUFBeEIsVUFBQTtBQUNBLHFCQUFBLEtBQUEsQ0FBQSxLQUFBLENBQWlCLFlBQWpCLEtBQUE7QUFDRDtBQUVELGdCQUFJLENBQUMsNkJBQUwsS0FBSyxDQUFMLEVBQTBDO0FBQ3hDLHVCQUFBLEtBQUE7QUFDRDtBQUVELHlCQUFBLEtBQUE7QUFDRDtBQTNCTCxLQUFBO0FBOEJFOztBQTlCRixpQkFBQSwwQkFBQSxFQUFBLENBQUE7QUFBQSxhQUFBLFFBQUE7QUFBQSxhQUFBLFNBQUEsR0FBQSxHQStCWTtBQUFBLGdCQUFBLFFBQUEsS0FBQSxLQUFBO0FBQUEsZ0JBQUEsT0FBQSxLQUFBLElBQUE7O0FBRVIsZ0JBQUksU0FBUyxPQUFPLEtBQUEsVUFBQSxDQUFQLE1BQUEsR0FBYixDQUFBO0FBQ0EsbUJBQU8sNkJBQUEsS0FBQSxJQUFzQyxTQUFTLE1BQS9DLE1BQUEsR0FBUCxNQUFBO0FBQ0Q7QUFuQ0gsS0FBQSxDQUFBOztBQUFBLFdBQUEsMEJBQUE7QUFBQSxDQUFBLEVBQUE7S0FDWSxrQztBQXFDTixTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBRWtDO0FBQUEsUUFBdEMsT0FBc0MsVUFBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxHQUZsQyxJQUVrQzs7QUFFdEMsV0FBTyxJQUFBLDBCQUFBLENBQUEsSUFBQSxFQUFQLElBQU8sQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2FwdHVyZWRBcmd1bWVudHMsIENvbXBvbmVudERlZmluaXRpb24sIERpY3QsIE1heWJlIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFZNQXJndW1lbnRzSW1wbCB9IGZyb20gJy4uL3ZtL2FyZ3VtZW50cyc7XG5cbmNvbnN0IENVUlJJRURfQ09NUE9ORU5UX0RFRklOSVRJT05fQlJBTkQgPVxuICAnQ1VSUklFRCBDT01QT05FTlQgREVGSU5JVElPTiBbaWQ9NmYwMGZlYjktYTBlZi00NTQ3LTk5ZWEtYWMzMjhmODBhY2VhXSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKFxuICBkZWZpbml0aW9uOiB1bmtub3duXG4pOiBkZWZpbml0aW9uIGlzIEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uIHtcbiAgcmV0dXJuICEhKGRlZmluaXRpb24gJiYgKGRlZmluaXRpb24gYXMgRGljdClbQ1VSUklFRF9DT01QT05FTlRfREVGSU5JVElPTl9CUkFORF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb21wb25lbnREZWZpbml0aW9uKFxuICBkZWZpbml0aW9uOiBNYXliZTxEaWN0PlxuKTogZGVmaW5pdGlvbiBpcyBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbiB7XG4gIHJldHVybiAhIShkZWZpbml0aW9uICYmIGRlZmluaXRpb25bQ1VSUklFRF9DT01QT05FTlRfREVGSU5JVElPTl9CUkFORF0pO1xufVxuXG5leHBvcnQgY2xhc3MgQ3VycmllZENvbXBvbmVudERlZmluaXRpb24ge1xuICByZWFkb25seSBbQ1VSUklFRF9DT01QT05FTlRfREVGSU5JVElPTl9CUkFORF0gPSB0cnVlO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIGlubmVyOiBDb21wb25lbnREZWZpbml0aW9uIHwgQ3VycmllZENvbXBvbmVudERlZmluaXRpb24sXG4gICAgcHJvdGVjdGVkIGFyZ3M6IE9wdGlvbjxDYXB0dXJlZEFyZ3VtZW50cz5cbiAgKSB7fVxuXG4gIHVud3JhcChhcmdzOiBWTUFyZ3VtZW50c0ltcGwpOiBDb21wb25lbnREZWZpbml0aW9uIHtcbiAgICBhcmdzLnJlYWxsb2ModGhpcy5vZmZzZXQpO1xuXG4gICAgbGV0IGRlZmluaXRpb246IEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uID0gdGhpcztcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBsZXQgeyBhcmdzOiBjdXJyaWVkQXJncywgaW5uZXIgfSA9IGRlZmluaXRpb247XG5cbiAgICAgIGlmIChjdXJyaWVkQXJncykge1xuICAgICAgICBhcmdzLnBvc2l0aW9uYWwucHJlcGVuZChjdXJyaWVkQXJncy5wb3NpdGlvbmFsKTtcbiAgICAgICAgYXJncy5uYW1lZC5tZXJnZShjdXJyaWVkQXJncy5uYW1lZCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihpbm5lcikpIHtcbiAgICAgICAgcmV0dXJuIGlubmVyO1xuICAgICAgfVxuXG4gICAgICBkZWZpbml0aW9uID0gaW5uZXI7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBnZXQgb2Zmc2V0KCk6IG51bWJlciB7XG4gICAgbGV0IHsgaW5uZXIsIGFyZ3MgfSA9IHRoaXM7XG4gICAgbGV0IGxlbmd0aCA9IGFyZ3MgPyBhcmdzLnBvc2l0aW9uYWwubGVuZ3RoIDogMDtcbiAgICByZXR1cm4gaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihpbm5lcikgPyBsZW5ndGggKyBpbm5lci5vZmZzZXQgOiBsZW5ndGg7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1cnJ5KFxuICBzcGVjOiBDb21wb25lbnREZWZpbml0aW9uLFxuICBhcmdzOiBPcHRpb248Q2FwdHVyZWRBcmd1bWVudHM+ID0gbnVsbFxuKTogQ3VycmllZENvbXBvbmVudERlZmluaXRpb24ge1xuICByZXR1cm4gbmV3IEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKHNwZWMgYXMgQ29tcG9uZW50RGVmaW5pdGlvbiwgYXJncyk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9