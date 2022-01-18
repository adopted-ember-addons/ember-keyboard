'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IterableImpl = undefined;
exports.keyFor = keyFor;

var _util = require('@glimmer/util');

var _property = require('./property');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function keyFor(path, definitions) {
    if (path in definitions.named) {
        return definitions.named[path];
    } else {
        return definitions.default;
    }
}
var IterableImpl = exports.IterableImpl = function () {
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
            return new ArrayIterator(_util.EMPTY_ARRAY, function () {
                return null;
            });
        }
    };

    IterableImpl.prototype.valueReferenceFor = function valueReferenceFor(item) {
        return new _property.UpdatableReference(item.value);
    };

    IterableImpl.prototype.updateValueReference = function updateValueReference(reference, item) {
        reference.forceUpdate(item.value);
    };

    IterableImpl.prototype.memoReferenceFor = function memoReferenceFor(item) {
        return new _property.UpdatableReference(item.memo);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvaXRlcmFibGUtaW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7UUFtQk0sTSxHQUFBLE07O0FBZk47O0FBQ0E7Ozs7Ozs7O0FBY00sU0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLFdBQUEsRUFBa0U7QUFDdEUsUUFBSSxRQUFRLFlBQVosS0FBQSxFQUErQjtBQUM3QixlQUFPLFlBQUEsS0FBQSxDQUFQLElBQU8sQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLGVBQU8sWUFBUCxPQUFBO0FBQ0Q7QUFDRjtBQUVELElBQUEsc0NBQUEsWUFBQTtBQVdFLGFBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQSxNQUFBLEVBQW1FO0FBQUEsd0JBQUEsSUFBQSxFQUFBLFlBQUE7O0FBQS9DLGFBQUEsR0FBQSxHQUFBLEdBQUE7QUFBaUMsYUFBQSxNQUFBLEdBQUEsTUFBQTtBQUNuRCxhQUFBLEdBQUEsR0FBVyxJQUFYLEdBQUE7QUFDQSxhQUFBLEdBQUEsR0FBQSxHQUFBO0FBQ0EsYUFBQSxNQUFBLEdBQUEsTUFBQTtBQUNEOztBQWZILGlCQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBaUJTO0FBQUEsWUFBQSxNQUFBLEtBQUEsR0FBQTtBQUFBLFlBQUEsU0FBQSxLQUFBLE1BQUE7O0FBR0wsWUFBSSxXQUFXLElBQWYsS0FBZSxFQUFmO0FBRUEsWUFBSSxNQUFBLE9BQUEsQ0FBSixRQUFJLENBQUosRUFBNkI7QUFDM0IsbUJBQU8sSUFBQSxhQUFBLENBQUEsUUFBQSxFQUFQLE1BQU8sQ0FBUDtBQURGLFNBQUEsTUFFTyxJQUFJLFlBQVksU0FBUyxPQUF6QixRQUFnQixDQUFoQixFQUEyQztBQUNoRCxtQkFBTyxJQUFBLHNCQUFBLENBQTJCLFNBQVMsT0FBcEMsUUFBMkIsR0FBM0IsRUFBUCxNQUFPLENBQVA7QUFESyxTQUFBLE1BRUE7QUFDTCxtQkFBTyxJQUFB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RDtBQUNGOzs0QkFFRCxPLHNCQUFPO0FBQ0wsZUFBTyxLQUFBLE9BQUEsQ0FBQSxJQUFBLEtBQVAsT0FBQTs7OzRCQUdGLEksbUJBQUk7QUFDRixZQUFBLFFBQUEsS0FBQSxDQUFBO0FBRUEsWUFBSSxVQUFVLEtBQWQsT0FBQTtBQUNBLFlBQUksUUFBQSxJQUFBLEtBQUosT0FBQSxFQUE4QjtBQUM1QixpQkFBQSxPQUFBLEdBQWUsRUFBRSxNQUFqQixVQUFlLEVBQWY7QUFDQSxvQkFBUSxRQUFSLEtBQUE7QUFGRixTQUFBLE1BR08sSUFBSSxLQUFBLEdBQUEsSUFBWSxLQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQWhCLENBQUEsRUFBMEM7QUFDL0MsbUJBQUEsSUFBQTtBQURLLFNBQUEsTUFFQTtBQUNMLG9CQUFRLEtBQUEsUUFBQSxDQUFjLEVBQUUsS0FBeEIsR0FBUSxDQUFSO0FBQ0Q7QUFYQyxZQUFBLFNBQUEsS0FBQSxNQUFBOztBQWVGLFlBQUksTUFBTSxPQUFBLEtBQUEsRUFBc0IsS0FBaEMsR0FBVSxDQUFWO0FBQ0EsWUFBSSxPQUFPLEtBQVgsR0FBQTtBQUVBLGVBQU8sRUFBQSxLQUFBLEdBQUEsRUFBQSxPQUFBLEtBQUEsRUFBUCxNQUFBLElBQU8sRUFBUCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFic3RyYWN0SXRlcmFibGUsIEl0ZXJhdGlvbkl0ZW0sIE9wYXF1ZUl0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYWJsZSc7XG5pbXBvcnQgeyBUYWcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgVmVyc2lvbmVkUmVmZXJlbmNlIH0gZnJvbSAnLi9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgT3B0aW9uLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBFTVBUWV9BUlJBWSB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgVXBkYXRhYmxlUmVmZXJlbmNlIH0gZnJvbSAnLi9wcm9wZXJ0eSc7XG5cbmV4cG9ydCB0eXBlIEtleUZvciA9IChpdGVtOiBEaWN0LCBpbmRleDogdW5rbm93bikgPT4gdW5rbm93bjtcbmV4cG9ydCB0eXBlIFVua25vd25LZXlGb3IgPSAoa2V5OiBzdHJpbmcpID0+IEtleUZvcjtcblxuLy8gUHVibGljIEFQSVxuZXhwb3J0IGludGVyZmFjZSBJdGVyYWJsZUtleURlZmluaXRpb25zIHtcbiAgbmFtZWQ6IHtcbiAgICBbcHJvcDogc3RyaW5nXTogS2V5Rm9yO1xuICB9O1xuXG4gIGRlZmF1bHQ6IFVua25vd25LZXlGb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZXlGb3IocGF0aDogc3RyaW5nLCBkZWZpbml0aW9uczogSXRlcmFibGVLZXlEZWZpbml0aW9ucykge1xuICBpZiAocGF0aCBpbiBkZWZpbml0aW9ucy5uYW1lZCkge1xuICAgIHJldHVybiBkZWZpbml0aW9ucy5uYW1lZFtwYXRoXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvbnMuZGVmYXVsdDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSXRlcmFibGVJbXBsXG4gIGltcGxlbWVudHNcbiAgICBBYnN0cmFjdEl0ZXJhYmxlPFxuICAgICAgdW5rbm93bixcbiAgICAgIHVua25vd24sXG4gICAgICBJdGVyYXRpb25JdGVtPHVua25vd24sIHVua25vd24+LFxuICAgICAgVXBkYXRhYmxlUmVmZXJlbmNlPHVua25vd24+LFxuICAgICAgVXBkYXRhYmxlUmVmZXJlbmNlPHVua25vd24+XG4gICAgPiB7XG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlZjogVmVyc2lvbmVkUmVmZXJlbmNlLCBwcml2YXRlIGtleUZvcjogS2V5Rm9yKSB7XG4gICAgdGhpcy50YWcgPSByZWYudGFnO1xuICAgIHRoaXMucmVmID0gcmVmO1xuICAgIHRoaXMua2V5Rm9yID0ga2V5Rm9yO1xuICB9XG5cbiAgaXRlcmF0ZSgpOiBPcGFxdWVJdGVyYXRvciB7XG4gICAgbGV0IHsgcmVmLCBrZXlGb3IgfSA9IHRoaXM7XG5cbiAgICBsZXQgaXRlcmFibGUgPSByZWYudmFsdWUoKSBhcyB7IFtTeW1ib2wuaXRlcmF0b3JdOiBhbnkgfSB8IG51bGwgfCBmYWxzZTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZXJhYmxlKSkge1xuICAgICAgcmV0dXJuIG5ldyBBcnJheUl0ZXJhdG9yKGl0ZXJhYmxlLCBrZXlGb3IpO1xuICAgIH0gZWxzZSBpZiAoaXRlcmFibGUgJiYgaXRlcmFibGVbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgcmV0dXJuIG5ldyBOYXRpdmVJdGVyYXRvckl0ZXJhdG9yKGl0ZXJhYmxlW1N5bWJvbC5pdGVyYXRvcl0oKSwga2V5Rm9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBBcnJheUl0ZXJhdG9yKEVNUFRZX0FSUkFZLCAoKSA9PiBudWxsKTtcbiAgICB9XG4gIH1cblxuICB2YWx1ZVJlZmVyZW5jZUZvcihpdGVtOiBJdGVyYXRpb25JdGVtPHVua25vd24sIHVua25vd24+KTogVXBkYXRhYmxlUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gbmV3IFVwZGF0YWJsZVJlZmVyZW5jZShpdGVtLnZhbHVlKTtcbiAgfVxuXG4gIHVwZGF0ZVZhbHVlUmVmZXJlbmNlKFxuICAgIHJlZmVyZW5jZTogVXBkYXRhYmxlUmVmZXJlbmNlPHVua25vd24+LFxuICAgIGl0ZW06IEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgdW5rbm93bj5cbiAgKSB7XG4gICAgcmVmZXJlbmNlLmZvcmNlVXBkYXRlKGl0ZW0udmFsdWUpO1xuICB9XG5cbiAgbWVtb1JlZmVyZW5jZUZvcihpdGVtOiBJdGVyYXRpb25JdGVtPHVua25vd24sIHVua25vd24+KTogVXBkYXRhYmxlUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gbmV3IFVwZGF0YWJsZVJlZmVyZW5jZShpdGVtLm1lbW8pO1xuICB9XG5cbiAgdXBkYXRlTWVtb1JlZmVyZW5jZShcbiAgICByZWZlcmVuY2U6IFVwZGF0YWJsZVJlZmVyZW5jZTx1bmtub3duPixcbiAgICBpdGVtOiBJdGVyYXRpb25JdGVtPHVua25vd24sIHVua25vd24+XG4gICkge1xuICAgIHJlZmVyZW5jZS5mb3JjZVVwZGF0ZShpdGVtLm1lbW8pO1xuICB9XG59XG5cbmNsYXNzIE5hdGl2ZUl0ZXJhdG9ySXRlcmF0b3IgaW1wbGVtZW50cyBPcGFxdWVJdGVyYXRvciB7XG4gIHByaXZhdGUgY3VycmVudDogeyBraW5kOiAnZW1wdHknIH0gfCB7IGtpbmQ6ICdmaXJzdCc7IHZhbHVlOiB1bmtub3duIH0gfCB7IGtpbmQ6ICdwcm9ncmVzcycgfTtcbiAgcHJpdmF0ZSBwb3MgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaXRlcmF0b3I6IEl0ZXJhdG9yPHVua25vd24+LCBwcml2YXRlIGtleUZvcjogS2V5Rm9yKSB7XG4gICAgbGV0IGZpcnN0ID0gaXRlcmF0b3IubmV4dCgpO1xuXG4gICAgaWYgKGZpcnN0LmRvbmUgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ2VtcHR5JyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdmaXJzdCcsIHZhbHVlOiBmaXJzdC52YWx1ZSB9O1xuICAgIH1cbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudC5raW5kID09PSAnZW1wdHknO1xuICB9XG5cbiAgbmV4dCgpOiBPcHRpb248SXRlcmF0aW9uSXRlbTx1bmtub3duLCBudW1iZXI+PiB7XG4gICAgbGV0IHZhbHVlOiB1bmtub3duO1xuXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmN1cnJlbnQ7XG4gICAgaWYgKGN1cnJlbnQua2luZCA9PT0gJ2ZpcnN0Jykge1xuICAgICAgdGhpcy5jdXJyZW50ID0geyBraW5kOiAncHJvZ3Jlc3MnIH07XG4gICAgICB2YWx1ZSA9IGN1cnJlbnQudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBuZXh0ID0gdGhpcy5pdGVyYXRvci5uZXh0KCk7XG4gICAgICB0aGlzLnBvcysrO1xuXG4gICAgICBpZiAobmV4dC5kb25lKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBuZXh0LnZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCB7IGtleUZvciB9ID0gdGhpcztcblxuICAgIGxldCBrZXkgPSBrZXlGb3IodmFsdWUgYXMgRGljdCwgdGhpcy5wb3MpO1xuICAgIGxldCBtZW1vID0gdGhpcy5wb3M7XG5cbiAgICByZXR1cm4geyBrZXksIHZhbHVlLCBtZW1vIH07XG4gIH1cbn1cblxuY2xhc3MgQXJyYXlJdGVyYXRvciBpbXBsZW1lbnRzIE9wYXF1ZUl0ZXJhdG9yIHtcbiAgcHJpdmF0ZSBjdXJyZW50OiB7IGtpbmQ6ICdlbXB0eScgfSB8IHsga2luZDogJ2ZpcnN0JzsgdmFsdWU6IHVua25vd24gfSB8IHsga2luZDogJ3Byb2dyZXNzJyB9O1xuICBwcml2YXRlIHBvcyA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpdGVyYXRvcjogdW5rbm93bltdLCBwcml2YXRlIGtleUZvcjogS2V5Rm9yKSB7XG4gICAgaWYgKGl0ZXJhdG9yLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5jdXJyZW50ID0geyBraW5kOiAnZW1wdHknIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ2ZpcnN0JywgdmFsdWU6IGl0ZXJhdG9yW3RoaXMucG9zXSB9O1xuICAgIH1cbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudC5raW5kID09PSAnZW1wdHknO1xuICB9XG5cbiAgbmV4dCgpOiBPcHRpb248SXRlcmF0aW9uSXRlbTx1bmtub3duLCBudW1iZXI+PiB7XG4gICAgbGV0IHZhbHVlOiB1bmtub3duO1xuXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmN1cnJlbnQ7XG4gICAgaWYgKGN1cnJlbnQua2luZCA9PT0gJ2ZpcnN0Jykge1xuICAgICAgdGhpcy5jdXJyZW50ID0geyBraW5kOiAncHJvZ3Jlc3MnIH07XG4gICAgICB2YWx1ZSA9IGN1cnJlbnQudmFsdWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLnBvcyA+PSB0aGlzLml0ZXJhdG9yLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuaXRlcmF0b3JbKyt0aGlzLnBvc107XG4gICAgfVxuXG4gICAgbGV0IHsga2V5Rm9yIH0gPSB0aGlzO1xuXG4gICAgbGV0IGtleSA9IGtleUZvcih2YWx1ZSBhcyBEaWN0LCB0aGlzLnBvcyk7XG4gICAgbGV0IG1lbW8gPSB0aGlzLnBvcztcblxuICAgIHJldHVybiB7IGtleSwgdmFsdWUsIG1lbW8gfTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==