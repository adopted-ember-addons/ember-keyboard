'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _curriedComponent = require('../component/curried-component');

var _resolve = require('../component/resolve');

var _references = require('../references');

class CurryComponentReference {
    constructor(inner, resolver, meta, args) {
        this.inner = inner;
        this.resolver = resolver;
        this.meta = meta;
        this.args = args;
        this.tag = inner.tag;
        this.lastValue = null;
        this.lastDefinition = null;
    }
    value() {
        let { inner, lastValue } = this;
        let value = inner.value();
        if (value === lastValue) {
            return this.lastDefinition;
        }
        let definition = null;
        if ((0, _curriedComponent.isCurriedComponentDefinition)(value)) {
            definition = value;
        } else if (typeof value === 'string' && value) {
            let { resolver, meta } = this;
            definition = (0, _resolve.resolveComponent)(resolver, value, meta);
        }
        definition = this.curry(definition);
        this.lastValue = value;
        this.lastDefinition = definition;
        return definition;
    }
    get() {
        return _references.UNDEFINED_REFERENCE;
    }
    curry(definition) {
        let { args } = this;
        if (!args && (0, _curriedComponent.isCurriedComponentDefinition)(definition)) {
            return definition;
        } else if (!definition) {
            return null;
        } else {
            return new _curriedComponent.CurriedComponentDefinition(definition, args);
        }
    }
}
exports.default = CurryComponentReference;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3JlZmVyZW5jZXMvY3VycnktY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBY0E7O0FBQ0E7O0FBRWMsTUFBQSx1QkFBQSxDQUE4QjtBQU0xQyxnQkFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBSXlDO0FBSC9CLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQSxhQUFBLFFBQUEsR0FBQSxRQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFFUixhQUFBLEdBQUEsR0FBVyxNQUFYLEdBQUE7QUFDQSxhQUFBLFNBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxjQUFBLEdBQUEsSUFBQTtBQUNEO0FBRUQsWUFBSztBQUNILFlBQUksRUFBQSxLQUFBLEVBQUEsU0FBQSxLQUFKLElBQUE7QUFFQSxZQUFJLFFBQVEsTUFBWixLQUFZLEVBQVo7QUFFQSxZQUFJLFVBQUosU0FBQSxFQUF5QjtBQUN2QixtQkFBTyxLQUFQLGNBQUE7QUFDRDtBQUVELFlBQUksYUFBSixJQUFBO0FBRUEsWUFBSSxvREFBSixLQUFJLENBQUosRUFBeUM7QUFDdkMseUJBQUEsS0FBQTtBQURGLFNBQUEsTUFFTyxJQUFJLE9BQUEsS0FBQSxLQUFBLFFBQUEsSUFBSixLQUFBLEVBQXdDO0FBQzdDLGdCQUFJLEVBQUEsUUFBQSxFQUFBLElBQUEsS0FBSixJQUFBO0FBQ0EseUJBQWEsK0JBQUEsUUFBQSxFQUFBLEtBQUEsRUFBYixJQUFhLENBQWI7QUFDRDtBQUVELHFCQUFhLEtBQUEsS0FBQSxDQUFiLFVBQWEsQ0FBYjtBQUVBLGFBQUEsU0FBQSxHQUFBLEtBQUE7QUFDQSxhQUFBLGNBQUEsR0FBQSxVQUFBO0FBRUEsZUFBQSxVQUFBO0FBQ0Q7QUFFRCxVQUFHO0FBQ0QsZUFBQSwrQkFBQTtBQUNEO0FBRU8sVUFBQSxVQUFBLEVBQzhEO0FBRXBFLFlBQUksRUFBQSxJQUFBLEtBQUosSUFBQTtBQUVBLFlBQUksQ0FBQSxJQUFBLElBQVMsb0RBQWIsVUFBYSxDQUFiLEVBQXVEO0FBQ3JELG1CQUFBLFVBQUE7QUFERixTQUFBLE1BRU8sSUFBSSxDQUFKLFVBQUEsRUFBaUI7QUFDdEIsbUJBQUEsSUFBQTtBQURLLFNBQUEsTUFFQTtBQUNMLG1CQUFPLElBQUEsNENBQUEsQ0FBQSxVQUFBLEVBQVAsSUFBTyxDQUFQO0FBQ0Q7QUFDRjtBQTNEeUM7a0JBQTlCLHVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVmZXJlbmNlLCBQYXRoUmVmZXJlbmNlLCBUYWcgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQge1xuICBDYXB0dXJlZEFyZ3VtZW50cyxcbiAgQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgTWF5YmUsXG4gIERpY3QsXG4gIFJ1bnRpbWVSZXNvbHZlcixcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7XG4gIEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uLFxuICBpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uLFxufSBmcm9tICcuLi9jb21wb25lbnQvY3VycmllZC1jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVzb2x2ZUNvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC9yZXNvbHZlJztcbmltcG9ydCB7IFVOREVGSU5FRF9SRUZFUkVOQ0UgfSBmcm9tICcuLi9yZWZlcmVuY2VzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3VycnlDb21wb25lbnRSZWZlcmVuY2VcbiAgaW1wbGVtZW50cyBQYXRoUmVmZXJlbmNlPE9wdGlvbjxDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbj4+IHtcbiAgcHVibGljIHRhZzogVGFnO1xuICBwcml2YXRlIGxhc3RWYWx1ZTogdW5rbm93bjtcbiAgcHJpdmF0ZSBsYXN0RGVmaW5pdGlvbjogT3B0aW9uPEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGlubmVyOiBSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgcHJpdmF0ZSByZXNvbHZlcjogUnVudGltZVJlc29sdmVyLFxuICAgIHByaXZhdGUgbWV0YTogdW5rbm93bixcbiAgICBwcml2YXRlIGFyZ3M6IE9wdGlvbjxDYXB0dXJlZEFyZ3VtZW50cz5cbiAgKSB7XG4gICAgdGhpcy50YWcgPSBpbm5lci50YWc7XG4gICAgdGhpcy5sYXN0VmFsdWUgPSBudWxsO1xuICAgIHRoaXMubGFzdERlZmluaXRpb24gPSBudWxsO1xuICB9XG5cbiAgdmFsdWUoKTogT3B0aW9uPEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uPiB7XG4gICAgbGV0IHsgaW5uZXIsIGxhc3RWYWx1ZSB9ID0gdGhpcztcblxuICAgIGxldCB2YWx1ZSA9IGlubmVyLnZhbHVlKCkgYXMgTWF5YmU8RGljdD47XG5cbiAgICBpZiAodmFsdWUgPT09IGxhc3RWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMubGFzdERlZmluaXRpb247XG4gICAgfVxuXG4gICAgbGV0IGRlZmluaXRpb246IE9wdGlvbjxDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbiB8IENvbXBvbmVudERlZmluaXRpb24+ID0gbnVsbDtcblxuICAgIGlmIChpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKHZhbHVlKSkge1xuICAgICAgZGVmaW5pdGlvbiA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZSkge1xuICAgICAgbGV0IHsgcmVzb2x2ZXIsIG1ldGEgfSA9IHRoaXM7XG4gICAgICBkZWZpbml0aW9uID0gcmVzb2x2ZUNvbXBvbmVudChyZXNvbHZlciwgdmFsdWUsIG1ldGEpO1xuICAgIH1cblxuICAgIGRlZmluaXRpb24gPSB0aGlzLmN1cnJ5KGRlZmluaXRpb24pO1xuXG4gICAgdGhpcy5sYXN0VmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmxhc3REZWZpbml0aW9uID0gZGVmaW5pdGlvbjtcblxuICAgIHJldHVybiBkZWZpbml0aW9uO1xuICB9XG5cbiAgZ2V0KCk6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4ge1xuICAgIHJldHVybiBVTkRFRklORURfUkVGRVJFTkNFO1xuICB9XG5cbiAgcHJpdmF0ZSBjdXJyeShcbiAgICBkZWZpbml0aW9uOiBPcHRpb248Q3VycmllZENvbXBvbmVudERlZmluaXRpb24gfCBDb21wb25lbnREZWZpbml0aW9uPlxuICApOiBPcHRpb248Q3VycmllZENvbXBvbmVudERlZmluaXRpb24+IHtcbiAgICBsZXQgeyBhcmdzIH0gPSB0aGlzO1xuXG4gICAgaWYgKCFhcmdzICYmIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oZGVmaW5pdGlvbikpIHtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uO1xuICAgIH0gZWxzZSBpZiAoIWRlZmluaXRpb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKGRlZmluaXRpb24sIGFyZ3MpO1xuICAgIH1cbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==