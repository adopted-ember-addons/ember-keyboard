function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { EMPTY_ARRAY } from '@glimmer/util';
import { UpdatableReference } from './property';
export function keyFor(path, definitions) {
    if (path in definitions.named) {
        return definitions.named[path];
    } else {
        return definitions.default;
    }
}
export var IterableImpl = function () {
    function IterableImpl(ref, keyFor) {
        _classCallCheck(this, IterableImpl);

        this.ref = ref;
        this.keyFor = keyFor;
        this.tag = ref.tag;
        this.ref = ref;
        this.keyFor = keyFor;
    }

    IterableImpl.prototype.iterate = function iterate() {
        var ref = this.ref,
            keyFor = this.keyFor;

        var iterable = ref.value();
        if (Array.isArray(iterable)) {
            return new ArrayIterator(iterable, keyFor);
        } else if (iterable && iterable[Symbol.iterator]) {
            return new NativeIteratorIterator(iterable[Symbol.iterator](), keyFor);
        } else {
            return new ArrayIterator(EMPTY_ARRAY, function () {
                return null;
            });
        }
    };

    IterableImpl.prototype.valueReferenceFor = function valueReferenceFor(item) {
        return new UpdatableReference(item.value);
    };

    IterableImpl.prototype.updateValueReference = function updateValueReference(reference, item) {
        reference.forceUpdate(item.value);
    };

    IterableImpl.prototype.memoReferenceFor = function memoReferenceFor(item) {
        return new UpdatableReference(item.memo);
    };

    IterableImpl.prototype.updateMemoReference = function updateMemoReference(reference, item) {
        reference.forceUpdate(item.memo);
    };

    return IterableImpl;
}();

var NativeIteratorIterator = function () {
    function NativeIteratorIterator(iterator, keyFor) {
        _classCallCheck(this, NativeIteratorIterator);

        this.iterator = iterator;
        this.keyFor = keyFor;
        this.pos = 0;
        var first = iterator.next();
        if (first.done === true) {
            this.current = { kind: 'empty' };
        } else {
            this.current = { kind: 'first', value: first.value };
        }
    }

    NativeIteratorIterator.prototype.isEmpty = function isEmpty() {
        return this.current.kind === 'empty';
    };

    NativeIteratorIterator.prototype.next = function next() {
        var value = void 0;
        var current = this.current;
        if (current.kind === 'first') {
            this.current = { kind: 'progress' };
            value = current.value;
        } else {
            var next = this.iterator.next();
            this.pos++;
            if (next.done) {
                return null;
            } else {
                value = next.value;
            }
        }
        var keyFor = this.keyFor;

        var key = keyFor(value, this.pos);
        var memo = this.pos;
        return { key: key, value: value, memo: memo };
    };

    return NativeIteratorIterator;
}();

var ArrayIterator = function () {
    function ArrayIterator(iterator, keyFor) {
        _classCallCheck(this, ArrayIterator);

        this.iterator = iterator;
        this.keyFor = keyFor;
        this.pos = 0;
        if (iterator.length === 0) {
            this.current = { kind: 'empty' };
        } else {
            this.current = { kind: 'first', value: iterator[this.pos] };
        }
    }

    ArrayIterator.prototype.isEmpty = function isEmpty() {
        return this.current.kind === 'empty';
    };

    ArrayIterator.prototype.next = function next() {
        var value = void 0;
        var current = this.current;
        if (current.kind === 'first') {
            this.current = { kind: 'progress' };
            value = current.value;
        } else if (this.pos >= this.iterator.length - 1) {
            return null;
        } else {
            value = this.iterator[++this.pos];
        }
        var keyFor = this.keyFor;

        var key = keyFor(value, this.pos);
        var memo = this.pos;
        return { key: key, value: value, memo: memo };
    };

    return ArrayIterator;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvaXRlcmFibGUtaW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLFNBQUEsV0FBQSxRQUFBLGVBQUE7QUFDQSxTQUFBLGtCQUFBLFFBQUEsWUFBQTtBQWNBLE9BQU0sU0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLFdBQUEsRUFBa0U7QUFDdEUsUUFBSSxRQUFRLFlBQVosS0FBQSxFQUErQjtBQUM3QixlQUFPLFlBQUEsS0FBQSxDQUFQLElBQU8sQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLGVBQU8sWUFBUCxPQUFBO0FBQ0Q7QUFDRjtBQUVELFdBQU0sWUFBTjtBQVdFLDBCQUFBLEdBQUEsRUFBQSxNQUFBLEVBQW1FO0FBQUE7O0FBQS9DLGFBQUEsR0FBQSxHQUFBLEdBQUE7QUFBaUMsYUFBQSxNQUFBLEdBQUEsTUFBQTtBQUNuRCxhQUFBLEdBQUEsR0FBVyxJQUFYLEdBQUE7QUFDQSxhQUFBLEdBQUEsR0FBQSxHQUFBO0FBQ0EsYUFBQSxNQUFBLEdBQUEsTUFBQTtBQUNEOztBQWZILDJCQWlCRSxPQWpCRixzQkFpQlM7QUFBQSxZQUNELEdBREMsR0FDTCxJQURLLENBQ0QsR0FEQztBQUFBLFlBQ0QsTUFEQyxHQUNMLElBREssQ0FDRCxNQURDOztBQUdMLFlBQUksV0FBVyxJQUFmLEtBQWUsRUFBZjtBQUVBLFlBQUksTUFBQSxPQUFBLENBQUosUUFBSSxDQUFKLEVBQTZCO0FBQzNCLG1CQUFPLElBQUEsYUFBQSxDQUFBLFFBQUEsRUFBUCxNQUFPLENBQVA7QUFERixTQUFBLE1BRU8sSUFBSSxZQUFZLFNBQVMsT0FBekIsUUFBZ0IsQ0FBaEIsRUFBMkM7QUFDaEQsbUJBQU8sSUFBQSxzQkFBQSxDQUEyQixTQUFTLE9BQXBDLFFBQTJCLEdBQTNCLEVBQVAsTUFBTyxDQUFQO0FBREssU0FBQSxNQUVBO0FBQ0wsbUJBQU8sSUFBQSxhQUFBLENBQUEsV0FBQSxFQUEr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LE1BQWpCLFVBQWUsRUFBZjtBQUNBLG9CQUFRLFFBQVIsS0FBQTtBQUZGLFNBQUEsTUFHTyxJQUFJLEtBQUEsR0FBQSxJQUFZLEtBQUEsUUFBQSxDQUFBLE1BQUEsR0FBaEIsQ0FBQSxFQUEwQztBQUMvQyxtQkFBQSxJQUFBO0FBREssU0FBQSxNQUVBO0FBQ0wsb0JBQVEsS0FBQSxRQUFBLENBQWMsRUFBRSxLQUF4QixHQUFRLENBQVI7QUFDRDtBQVhDLFlBYUUsTUFiRixHQWFGLElBYkUsQ0FhRSxNQWJGOztBQWVGLFlBQUksTUFBTSxPQUFBLEtBQUEsRUFBc0IsS0FBaEMsR0FBVSxDQUFWO0FBQ0EsWUFBSSxPQUFPLEtBQVgsR0FBQTtBQUVBLGVBQU8sRUFBQSxRQUFBLEVBQUEsWUFBQSxFQUFQLFVBQU8sRUFBUDtBQUNELEsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBYnN0cmFjdEl0ZXJhYmxlLCBJdGVyYXRpb25JdGVtLCBPcGFxdWVJdGVyYXRvciB9IGZyb20gJy4vaXRlcmFibGUnO1xuaW1wb3J0IHsgVGFnIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IFZlcnNpb25lZFJlZmVyZW5jZSB9IGZyb20gJy4vcmVmZXJlbmNlJztcbmltcG9ydCB7IE9wdGlvbiwgRGljdCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgRU1QVFlfQVJSQVkgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFVwZGF0YWJsZVJlZmVyZW5jZSB9IGZyb20gJy4vcHJvcGVydHknO1xuXG5leHBvcnQgdHlwZSBLZXlGb3IgPSAoaXRlbTogRGljdCwgaW5kZXg6IHVua25vd24pID0+IHVua25vd247XG5leHBvcnQgdHlwZSBVbmtub3duS2V5Rm9yID0gKGtleTogc3RyaW5nKSA9PiBLZXlGb3I7XG5cbi8vIFB1YmxpYyBBUElcbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmFibGVLZXlEZWZpbml0aW9ucyB7XG4gIG5hbWVkOiB7XG4gICAgW3Byb3A6IHN0cmluZ106IEtleUZvcjtcbiAgfTtcblxuICBkZWZhdWx0OiBVbmtub3duS2V5Rm9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24ga2V5Rm9yKHBhdGg6IHN0cmluZywgZGVmaW5pdGlvbnM6IEl0ZXJhYmxlS2V5RGVmaW5pdGlvbnMpIHtcbiAgaWYgKHBhdGggaW4gZGVmaW5pdGlvbnMubmFtZWQpIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvbnMubmFtZWRbcGF0aF07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zLmRlZmF1bHQ7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEl0ZXJhYmxlSW1wbFxuICBpbXBsZW1lbnRzXG4gICAgQWJzdHJhY3RJdGVyYWJsZTxcbiAgICAgIHVua25vd24sXG4gICAgICB1bmtub3duLFxuICAgICAgSXRlcmF0aW9uSXRlbTx1bmtub3duLCB1bmtub3duPixcbiAgICAgIFVwZGF0YWJsZVJlZmVyZW5jZTx1bmtub3duPixcbiAgICAgIFVwZGF0YWJsZVJlZmVyZW5jZTx1bmtub3duPlxuICAgID4ge1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWY6IFZlcnNpb25lZFJlZmVyZW5jZSwgcHJpdmF0ZSBrZXlGb3I6IEtleUZvcikge1xuICAgIHRoaXMudGFnID0gcmVmLnRhZztcbiAgICB0aGlzLnJlZiA9IHJlZjtcbiAgICB0aGlzLmtleUZvciA9IGtleUZvcjtcbiAgfVxuXG4gIGl0ZXJhdGUoKTogT3BhcXVlSXRlcmF0b3Ige1xuICAgIGxldCB7IHJlZiwga2V5Rm9yIH0gPSB0aGlzO1xuXG4gICAgbGV0IGl0ZXJhYmxlID0gcmVmLnZhbHVlKCkgYXMgeyBbU3ltYm9sLml0ZXJhdG9yXTogYW55IH0gfCBudWxsIHwgZmFsc2U7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVyYWJsZSkpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihpdGVyYWJsZSwga2V5Rm9yKTtcbiAgICB9IGVsc2UgaWYgKGl0ZXJhYmxlICYmIGl0ZXJhYmxlW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgIHJldHVybiBuZXcgTmF0aXZlSXRlcmF0b3JJdGVyYXRvcihpdGVyYWJsZVtTeW1ib2wuaXRlcmF0b3JdKCksIGtleUZvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihFTVBUWV9BUlJBWSwgKCkgPT4gbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgdmFsdWVSZWZlcmVuY2VGb3IoaXRlbTogSXRlcmF0aW9uSXRlbTx1bmtub3duLCB1bmtub3duPik6IFVwZGF0YWJsZVJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIG5ldyBVcGRhdGFibGVSZWZlcmVuY2UoaXRlbS52YWx1ZSk7XG4gIH1cblxuICB1cGRhdGVWYWx1ZVJlZmVyZW5jZShcbiAgICByZWZlcmVuY2U6IFVwZGF0YWJsZVJlZmVyZW5jZTx1bmtub3duPixcbiAgICBpdGVtOiBJdGVyYXRpb25JdGVtPHVua25vd24sIHVua25vd24+XG4gICkge1xuICAgIHJlZmVyZW5jZS5mb3JjZVVwZGF0ZShpdGVtLnZhbHVlKTtcbiAgfVxuXG4gIG1lbW9SZWZlcmVuY2VGb3IoaXRlbTogSXRlcmF0aW9uSXRlbTx1bmtub3duLCB1bmtub3duPik6IFVwZGF0YWJsZVJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIG5ldyBVcGRhdGFibGVSZWZlcmVuY2UoaXRlbS5tZW1vKTtcbiAgfVxuXG4gIHVwZGF0ZU1lbW9SZWZlcmVuY2UoXG4gICAgcmVmZXJlbmNlOiBVcGRhdGFibGVSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgaXRlbTogSXRlcmF0aW9uSXRlbTx1bmtub3duLCB1bmtub3duPlxuICApIHtcbiAgICByZWZlcmVuY2UuZm9yY2VVcGRhdGUoaXRlbS5tZW1vKTtcbiAgfVxufVxuXG5jbGFzcyBOYXRpdmVJdGVyYXRvckl0ZXJhdG9yIGltcGxlbWVudHMgT3BhcXVlSXRlcmF0b3Ige1xuICBwcml2YXRlIGN1cnJlbnQ6IHsga2luZDogJ2VtcHR5JyB9IHwgeyBraW5kOiAnZmlyc3QnOyB2YWx1ZTogdW5rbm93biB9IHwgeyBraW5kOiAncHJvZ3Jlc3MnIH07XG4gIHByaXZhdGUgcG9zID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGl0ZXJhdG9yOiBJdGVyYXRvcjx1bmtub3duPiwgcHJpdmF0ZSBrZXlGb3I6IEtleUZvcikge1xuICAgIGxldCBmaXJzdCA9IGl0ZXJhdG9yLm5leHQoKTtcblxuICAgIGlmIChmaXJzdC5kb25lID09PSB0cnVlKSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdlbXB0eScgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50ID0geyBraW5kOiAnZmlyc3QnLCB2YWx1ZTogZmlyc3QudmFsdWUgfTtcbiAgICB9XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnQua2luZCA9PT0gJ2VtcHR5JztcbiAgfVxuXG4gIG5leHQoKTogT3B0aW9uPEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgbnVtYmVyPj4ge1xuICAgIGxldCB2YWx1ZTogdW5rbm93bjtcblxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5jdXJyZW50O1xuICAgIGlmIChjdXJyZW50LmtpbmQgPT09ICdmaXJzdCcpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ3Byb2dyZXNzJyB9O1xuICAgICAgdmFsdWUgPSBjdXJyZW50LnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbmV4dCA9IHRoaXMuaXRlcmF0b3IubmV4dCgpO1xuICAgICAgdGhpcy5wb3MrKztcblxuICAgICAgaWYgKG5leHQuZG9uZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gbmV4dC52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgeyBrZXlGb3IgfSA9IHRoaXM7XG5cbiAgICBsZXQga2V5ID0ga2V5Rm9yKHZhbHVlIGFzIERpY3QsIHRoaXMucG9zKTtcbiAgICBsZXQgbWVtbyA9IHRoaXMucG9zO1xuXG4gICAgcmV0dXJuIHsga2V5LCB2YWx1ZSwgbWVtbyB9O1xuICB9XG59XG5cbmNsYXNzIEFycmF5SXRlcmF0b3IgaW1wbGVtZW50cyBPcGFxdWVJdGVyYXRvciB7XG4gIHByaXZhdGUgY3VycmVudDogeyBraW5kOiAnZW1wdHknIH0gfCB7IGtpbmQ6ICdmaXJzdCc7IHZhbHVlOiB1bmtub3duIH0gfCB7IGtpbmQ6ICdwcm9ncmVzcycgfTtcbiAgcHJpdmF0ZSBwb3MgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaXRlcmF0b3I6IHVua25vd25bXSwgcHJpdmF0ZSBrZXlGb3I6IEtleUZvcikge1xuICAgIGlmIChpdGVyYXRvci5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ2VtcHR5JyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdmaXJzdCcsIHZhbHVlOiBpdGVyYXRvclt0aGlzLnBvc10gfTtcbiAgICB9XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnQua2luZCA9PT0gJ2VtcHR5JztcbiAgfVxuXG4gIG5leHQoKTogT3B0aW9uPEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgbnVtYmVyPj4ge1xuICAgIGxldCB2YWx1ZTogdW5rbm93bjtcblxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5jdXJyZW50O1xuICAgIGlmIChjdXJyZW50LmtpbmQgPT09ICdmaXJzdCcpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ3Byb2dyZXNzJyB9O1xuICAgICAgdmFsdWUgPSBjdXJyZW50LnZhbHVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wb3MgPj0gdGhpcy5pdGVyYXRvci5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSB0aGlzLml0ZXJhdG9yWysrdGhpcy5wb3NdO1xuICAgIH1cblxuICAgIGxldCB7IGtleUZvciB9ID0gdGhpcztcblxuICAgIGxldCBrZXkgPSBrZXlGb3IodmFsdWUgYXMgRGljdCwgdGhpcy5wb3MpO1xuICAgIGxldCBtZW1vID0gdGhpcy5wb3M7XG5cbiAgICByZXR1cm4geyBrZXksIHZhbHVlLCBtZW1vIH07XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=