'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _curriedComponent = require('../component/curried-component');

var _resolve = require('../component/resolve');

var _references = require('../references');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var CurryComponentReference = function () {
    function CurryComponentReference(inner, resolver, meta, args) {
        _classCallCheck(this, CurryComponentReference);

        this.inner = inner;
        this.resolver = resolver;
        this.meta = meta;
        this.args = args;
        this.tag = inner.tag;
        this.lastValue = null;
        this.lastDefinition = null;
    }

    CurryComponentReference.prototype.value = function value() {
        var inner = this.inner,
            lastValue = this.lastValue;

        var value = inner.value();
        if (value === lastValue) {
            return this.lastDefinition;
        }
        var definition = null;
        if ((0, _curriedComponent.isCurriedComponentDefinition)(value)) {
            definition = value;
        } else if (typeof value === 'string' && value) {
            var resolver = this.resolver,
                meta = this.meta;

            definition = (0, _resolve.resolveComponent)(resolver, value, meta);
        }
        definition = this.curry(definition);
        this.lastValue = value;
        this.lastDefinition = definition;
        return definition;
    };

    CurryComponentReference.prototype.get = function get() {
        return _references.UNDEFINED_REFERENCE;
    };

    CurryComponentReference.prototype.curry = function curry(definition) {
        var args = this.args;

        if (!args && (0, _curriedComponent.isCurriedComponentDefinition)(definition)) {
            return definition;
        } else if (!definition) {
            return null;
        } else {
            return new _curriedComponent.CurriedComponentDefinition(definition, args);
        }
    };

    return CurryComponentReference;
}();

exports.default = CurryComponentReference;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3JlZmVyZW5jZXMvY3VycnktY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQVVBOztBQUlBOztBQUNBOzs7Ozs7OztJQUVjLDBCO0FBTVosYUFBQSx1QkFBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFJeUM7QUFBQSx3QkFBQSxJQUFBLEVBQUEsdUJBQUE7O0FBSC9CLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQSxhQUFBLFFBQUEsR0FBQSxRQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFFUixhQUFBLEdBQUEsR0FBVyxNQUFYLEdBQUE7QUFDQSxhQUFBLFNBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxjQUFBLEdBQUEsSUFBQTtBQUNEOztzQ0FFRCxLLG9CQUFLO0FBQUEsWUFBQSxRQUFBLEtBQUEsS0FBQTtBQUFBLFlBQUEsWUFBQSxLQUFBLFNBQUE7O0FBR0gsWUFBSSxRQUFRLE1BQVosS0FBWSxFQUFaO0FBRUEsWUFBSSxVQUFKLFNBQUEsRUFBeUI7QUFDdkIsbUJBQU8sS0FBUCxjQUFBO0FBQ0Q7QUFFRCxZQUFJLGFBQUosSUFBQTtBQUVBLFlBQUksb0RBQUosS0FBSSxDQUFKLEVBQXlDO0FBQ3ZDLHlCQUFBLEtBQUE7QUFERixTQUFBLE1BRU8sSUFBSSxPQUFBLEtBQUEsS0FBQSxRQUFBLElBQUosS0FBQSxFQUF3QztBQUFBLGdCQUFBLFdBQUEsS0FBQSxRQUFBO0FBQUEsZ0JBQUEsT0FBQSxLQUFBLElBQUE7O0FBRTdDLHlCQUFhLCtCQUFBLFFBQUEsRUFBQSxLQUFBLEVBQWIsSUFBYSxDQUFiO0FBQ0Q7QUFFRCxxQkFBYSxLQUFBLEtBQUEsQ0FBYixVQUFhLENBQWI7QUFFQSxhQUFBLFNBQUEsR0FBQSxLQUFBO0FBQ0EsYUFBQSxjQUFBLEdBQUEsVUFBQTtBQUVBLGVBQUEsVUFBQTs7O3NDQUdGLEcsa0JBQUc7QUFDRCxlQUFBLCtCQUFBOzs7c0NBR00sSyxrQkFBQSxVLEVBQzhEO0FBQUEsWUFBQSxPQUFBLEtBQUEsSUFBQTs7QUFJcEUsWUFBSSxDQUFBLElBQUEsSUFBUyxvREFBYixVQUFhLENBQWIsRUFBdUQ7QUFDckQsbUJBQUEsVUFBQTtBQURGLFNBQUEsTUFFTyxJQUFJLENBQUosVUFBQSxFQUFpQjtBQUN0QixtQkFBQSxJQUFBO0FBREssU0FBQSxNQUVBO0FBQ0wsbUJBQU8sSUFBQSw0Q0FBQSxDQUFBLFVBQUEsRUFBUCxJQUFPLENBQVA7QUFDRDs7Ozs7O2tCQTFEUyx1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlZmVyZW5jZSwgUGF0aFJlZmVyZW5jZSwgVGFnIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHtcbiAgQ2FwdHVyZWRBcmd1bWVudHMsXG4gIENvbXBvbmVudERlZmluaXRpb24sXG4gIE1heWJlLFxuICBEaWN0LFxuICBSdW50aW1lUmVzb2x2ZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5pbXBvcnQge1xuICBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbn0gZnJvbSAnLi4vY29tcG9uZW50L2N1cnJpZWQtY29tcG9uZW50JztcbmltcG9ydCB7IHJlc29sdmVDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQvcmVzb2x2ZSc7XG5pbXBvcnQgeyBVTkRFRklORURfUkVGRVJFTkNFIH0gZnJvbSAnLi4vcmVmZXJlbmNlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEN1cnJ5Q29tcG9uZW50UmVmZXJlbmNlXG4gIGltcGxlbWVudHMgUGF0aFJlZmVyZW5jZTxPcHRpb248Q3VycmllZENvbXBvbmVudERlZmluaXRpb24+PiB7XG4gIHB1YmxpYyB0YWc6IFRhZztcbiAgcHJpdmF0ZSBsYXN0VmFsdWU6IHVua25vd247XG4gIHByaXZhdGUgbGFzdERlZmluaXRpb246IE9wdGlvbjxDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBpbm5lcjogUmVmZXJlbmNlPHVua25vd24+LFxuICAgIHByaXZhdGUgcmVzb2x2ZXI6IFJ1bnRpbWVSZXNvbHZlcixcbiAgICBwcml2YXRlIG1ldGE6IHVua25vd24sXG4gICAgcHJpdmF0ZSBhcmdzOiBPcHRpb248Q2FwdHVyZWRBcmd1bWVudHM+XG4gICkge1xuICAgIHRoaXMudGFnID0gaW5uZXIudGFnO1xuICAgIHRoaXMubGFzdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLmxhc3REZWZpbml0aW9uID0gbnVsbDtcbiAgfVxuXG4gIHZhbHVlKCk6IE9wdGlvbjxDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbj4ge1xuICAgIGxldCB7IGlubmVyLCBsYXN0VmFsdWUgfSA9IHRoaXM7XG5cbiAgICBsZXQgdmFsdWUgPSBpbm5lci52YWx1ZSgpIGFzIE1heWJlPERpY3Q+O1xuXG4gICAgaWYgKHZhbHVlID09PSBsYXN0VmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmxhc3REZWZpbml0aW9uO1xuICAgIH1cblxuICAgIGxldCBkZWZpbml0aW9uOiBPcHRpb248Q3VycmllZENvbXBvbmVudERlZmluaXRpb24gfCBDb21wb25lbnREZWZpbml0aW9uPiA9IG51bGw7XG5cbiAgICBpZiAoaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbih2YWx1ZSkpIHtcbiAgICAgIGRlZmluaXRpb24gPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUpIHtcbiAgICAgIGxldCB7IHJlc29sdmVyLCBtZXRhIH0gPSB0aGlzO1xuICAgICAgZGVmaW5pdGlvbiA9IHJlc29sdmVDb21wb25lbnQocmVzb2x2ZXIsIHZhbHVlLCBtZXRhKTtcbiAgICB9XG5cbiAgICBkZWZpbml0aW9uID0gdGhpcy5jdXJyeShkZWZpbml0aW9uKTtcblxuICAgIHRoaXMubGFzdFZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5sYXN0RGVmaW5pdGlvbiA9IGRlZmluaXRpb247XG5cbiAgICByZXR1cm4gZGVmaW5pdGlvbjtcbiAgfVxuXG4gIGdldCgpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gVU5ERUZJTkVEX1JFRkVSRU5DRTtcbiAgfVxuXG4gIHByaXZhdGUgY3VycnkoXG4gICAgZGVmaW5pdGlvbjogT3B0aW9uPEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uIHwgQ29tcG9uZW50RGVmaW5pdGlvbj5cbiAgKTogT3B0aW9uPEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uPiB7XG4gICAgbGV0IHsgYXJncyB9ID0gdGhpcztcblxuICAgIGlmICghYXJncyAmJiBpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKGRlZmluaXRpb24pKSB7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvbjtcbiAgICB9IGVsc2UgaWYgKCFkZWZpbml0aW9uKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihkZWZpbml0aW9uLCBhcmdzKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=