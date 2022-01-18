function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { CurriedComponentDefinition, isCurriedComponentDefinition } from '../component/curried-component';
import { resolveComponent } from '../component/resolve';
import { UNDEFINED_REFERENCE } from '../references';

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
        if (isCurriedComponentDefinition(value)) {
            definition = value;
        } else if (typeof value === 'string' && value) {
            var resolver = this.resolver,
                meta = this.meta;

            definition = resolveComponent(resolver, value, meta);
        }
        definition = this.curry(definition);
        this.lastValue = value;
        this.lastDefinition = definition;
        return definition;
    };

    CurryComponentReference.prototype.get = function get() {
        return UNDEFINED_REFERENCE;
    };

    CurryComponentReference.prototype.curry = function curry(definition) {
        var args = this.args;

        if (!args && isCurriedComponentDefinition(definition)) {
            return definition;
        } else if (!definition) {
            return null;
        } else {
            return new CurriedComponentDefinition(definition, args);
        }
    };

    return CurryComponentReference;
}();

export default CurryComponentReference;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3JlZmVyZW5jZXMvY3VycnktY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUEsU0FBQSwwQkFBQSxFQUFBLDRCQUFBLFFBQUEsZ0NBQUE7QUFJQSxTQUFBLGdCQUFBLFFBQUEsc0JBQUE7QUFDQSxTQUFBLG1CQUFBLFFBQUEsZUFBQTs7SUFFYyx1QjtBQU1aLHFDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFJeUM7QUFBQTs7QUFIL0IsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLGFBQUEsUUFBQSxHQUFBLFFBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUVSLGFBQUEsR0FBQSxHQUFXLE1BQVgsR0FBQTtBQUNBLGFBQUEsU0FBQSxHQUFBLElBQUE7QUFDQSxhQUFBLGNBQUEsR0FBQSxJQUFBO0FBQ0Q7O3NDQUVELEssb0JBQUs7QUFBQSxZQUNDLEtBREQsR0FDSCxJQURHLENBQ0MsS0FERDtBQUFBLFlBQ0MsU0FERCxHQUNILElBREcsQ0FDQyxTQUREOztBQUdILFlBQUksUUFBUSxNQUFaLEtBQVksRUFBWjtBQUVBLFlBQUksVUFBSixTQUFBLEVBQXlCO0FBQ3ZCLG1CQUFPLEtBQVAsY0FBQTtBQUNEO0FBRUQsWUFBSSxhQUFKLElBQUE7QUFFQSxZQUFJLDZCQUFKLEtBQUksQ0FBSixFQUF5QztBQUN2Qyx5QkFBQSxLQUFBO0FBREYsU0FBQSxNQUVPLElBQUksT0FBQSxLQUFBLEtBQUEsUUFBQSxJQUFKLEtBQUEsRUFBd0M7QUFBQSxnQkFDekMsUUFEeUMsR0FDN0MsSUFENkMsQ0FDekMsUUFEeUM7QUFBQSxnQkFDekMsSUFEeUMsR0FDN0MsSUFENkMsQ0FDekMsSUFEeUM7O0FBRTdDLHlCQUFhLGlCQUFBLFFBQUEsRUFBQSxLQUFBLEVBQWIsSUFBYSxDQUFiO0FBQ0Q7QUFFRCxxQkFBYSxLQUFBLEtBQUEsQ0FBYixVQUFhLENBQWI7QUFFQSxhQUFBLFNBQUEsR0FBQSxLQUFBO0FBQ0EsYUFBQSxjQUFBLEdBQUEsVUFBQTtBQUVBLGVBQUEsVUFBQTtBQUNELEs7O3NDQUVELEcsa0JBQUc7QUFDRCxlQUFBLG1CQUFBO0FBQ0QsSzs7c0NBRU8sSyxrQkFBQSxVLEVBQzhEO0FBQUEsWUFFaEUsSUFGZ0UsR0FFcEUsSUFGb0UsQ0FFaEUsSUFGZ0U7O0FBSXBFLFlBQUksQ0FBQSxJQUFBLElBQVMsNkJBQWIsVUFBYSxDQUFiLEVBQXVEO0FBQ3JELG1CQUFBLFVBQUE7QUFERixTQUFBLE1BRU8sSUFBSSxDQUFKLFVBQUEsRUFBaUI7QUFDdEIsbUJBQUEsSUFBQTtBQURLLFNBQUEsTUFFQTtBQUNMLG1CQUFPLElBQUEsMEJBQUEsQ0FBQSxVQUFBLEVBQVAsSUFBTyxDQUFQO0FBQ0Q7QUFDRixLOzs7OztlQTNEVyx1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlZmVyZW5jZSwgUGF0aFJlZmVyZW5jZSwgVGFnIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHtcbiAgQ2FwdHVyZWRBcmd1bWVudHMsXG4gIENvbXBvbmVudERlZmluaXRpb24sXG4gIE1heWJlLFxuICBEaWN0LFxuICBSdW50aW1lUmVzb2x2ZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5pbXBvcnQge1xuICBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbn0gZnJvbSAnLi4vY29tcG9uZW50L2N1cnJpZWQtY29tcG9uZW50JztcbmltcG9ydCB7IHJlc29sdmVDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQvcmVzb2x2ZSc7XG5pbXBvcnQgeyBVTkRFRklORURfUkVGRVJFTkNFIH0gZnJvbSAnLi4vcmVmZXJlbmNlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEN1cnJ5Q29tcG9uZW50UmVmZXJlbmNlXG4gIGltcGxlbWVudHMgUGF0aFJlZmVyZW5jZTxPcHRpb248Q3VycmllZENvbXBvbmVudERlZmluaXRpb24+PiB7XG4gIHB1YmxpYyB0YWc6IFRhZztcbiAgcHJpdmF0ZSBsYXN0VmFsdWU6IHVua25vd247XG4gIHByaXZhdGUgbGFzdERlZmluaXRpb246IE9wdGlvbjxDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBpbm5lcjogUmVmZXJlbmNlPHVua25vd24+LFxuICAgIHByaXZhdGUgcmVzb2x2ZXI6IFJ1bnRpbWVSZXNvbHZlcixcbiAgICBwcml2YXRlIG1ldGE6IHVua25vd24sXG4gICAgcHJpdmF0ZSBhcmdzOiBPcHRpb248Q2FwdHVyZWRBcmd1bWVudHM+XG4gICkge1xuICAgIHRoaXMudGFnID0gaW5uZXIudGFnO1xuICAgIHRoaXMubGFzdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLmxhc3REZWZpbml0aW9uID0gbnVsbDtcbiAgfVxuXG4gIHZhbHVlKCk6IE9wdGlvbjxDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbj4ge1xuICAgIGxldCB7IGlubmVyLCBsYXN0VmFsdWUgfSA9IHRoaXM7XG5cbiAgICBsZXQgdmFsdWUgPSBpbm5lci52YWx1ZSgpIGFzIE1heWJlPERpY3Q+O1xuXG4gICAgaWYgKHZhbHVlID09PSBsYXN0VmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmxhc3REZWZpbml0aW9uO1xuICAgIH1cblxuICAgIGxldCBkZWZpbml0aW9uOiBPcHRpb248Q3VycmllZENvbXBvbmVudERlZmluaXRpb24gfCBDb21wb25lbnREZWZpbml0aW9uPiA9IG51bGw7XG5cbiAgICBpZiAoaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbih2YWx1ZSkpIHtcbiAgICAgIGRlZmluaXRpb24gPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUpIHtcbiAgICAgIGxldCB7IHJlc29sdmVyLCBtZXRhIH0gPSB0aGlzO1xuICAgICAgZGVmaW5pdGlvbiA9IHJlc29sdmVDb21wb25lbnQocmVzb2x2ZXIsIHZhbHVlLCBtZXRhKTtcbiAgICB9XG5cbiAgICBkZWZpbml0aW9uID0gdGhpcy5jdXJyeShkZWZpbml0aW9uKTtcblxuICAgIHRoaXMubGFzdFZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5sYXN0RGVmaW5pdGlvbiA9IGRlZmluaXRpb247XG5cbiAgICByZXR1cm4gZGVmaW5pdGlvbjtcbiAgfVxuXG4gIGdldCgpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gVU5ERUZJTkVEX1JFRkVSRU5DRTtcbiAgfVxuXG4gIHByaXZhdGUgY3VycnkoXG4gICAgZGVmaW5pdGlvbjogT3B0aW9uPEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uIHwgQ29tcG9uZW50RGVmaW5pdGlvbj5cbiAgKTogT3B0aW9uPEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uPiB7XG4gICAgbGV0IHsgYXJncyB9ID0gdGhpcztcblxuICAgIGlmICghYXJncyAmJiBpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKGRlZmluaXRpb24pKSB7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvbjtcbiAgICB9IGVsc2UgaWYgKCFkZWZpbml0aW9uKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihkZWZpbml0aW9uLCBhcmdzKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=