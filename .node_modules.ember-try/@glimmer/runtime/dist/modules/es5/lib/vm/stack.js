var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { unreachable } from '@glimmer/util';
import { Stack as WasmStack } from '@glimmer/low-level';
import { $sp, $fp } from '@glimmer/vm';
import { initializeRegistersWithSP } from './low-level';
import { REGISTERS } from '../symbols';
var MAX_SMI = 0xfffffff;
export var InnerStack = function () {
    function InnerStack() {
        var inner = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new WasmStack();
        var js = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

        _classCallCheck(this, InnerStack);

        this.inner = inner;
        this.js = js;
    }

    InnerStack.prototype.slice = function slice(start, end) {
        var inner = void 0;
        if (typeof start === 'number' && typeof end === 'number') {
            inner = this.inner.slice(start, end);
        } else if (typeof start === 'number' && end === undefined) {
            inner = this.inner.sliceFrom(start);
        } else {
            inner = this.inner.clone();
        }
        return new InnerStack(inner, this.js.slice(start, end));
    };

    InnerStack.prototype.sliceInner = function sliceInner(start, end) {
        var out = [];
        for (var i = start; i < end; i++) {
            out.push(this.get(i));
        }
        return out;
    };

    InnerStack.prototype.copy = function copy(from, to) {
        this.inner.copy(from, to);
    };

    InnerStack.prototype.write = function write(pos, value) {
        if (isImmediate(value)) {
            this.writeRaw(pos, encodeImmediate(value));
        } else {
            this.writeJs(pos, value);
        }
    };

    InnerStack.prototype.writeJs = function writeJs(pos, value) {
        var idx = this.js.length;
        this.js.push(value);
        this.inner.writeRaw(pos, ~idx);
    };

    InnerStack.prototype.writeRaw = function writeRaw(pos, value) {
        this.inner.writeRaw(pos, value);
    };

    InnerStack.prototype.get = function get(pos) {
        var value = this.inner.getRaw(pos);
        if (value < 0) {
            return this.js[~value];
        } else {
            return decodeImmediate(value);
        }
    };

    InnerStack.prototype.reset = function reset() {
        this.inner.reset();
        this.js.length = 0;
    };

    _createClass(InnerStack, [{
        key: 'length',
        get: function get() {
            return this.inner.len();
        }
    }]);

    return InnerStack;
}();

var EvaluationStackImpl = function () {
    // fp -> sp
    function EvaluationStackImpl(stack, registers) {
        _classCallCheck(this, EvaluationStackImpl);

        this.stack = stack;
        this[REGISTERS] = registers;
        if (false) {
            Object.seal(this);
        }
    }

    EvaluationStackImpl.restore = function restore(snapshot) {
        var stack = new InnerStack();
        for (var i = 0; i < snapshot.length; i++) {
            stack.write(i, snapshot[i]);
        }
        return new this(stack, initializeRegistersWithSP(snapshot.length - 1));
    };

    EvaluationStackImpl.prototype.push = function push(value) {
        this.stack.write(++this[REGISTERS][$sp], value);
    };

    EvaluationStackImpl.prototype.pushRaw = function pushRaw(value) {
        this.stack.writeRaw(++this[REGISTERS][$sp], value);
    };

    EvaluationStackImpl.prototype.pushNull = function pushNull() {
        this.stack.write(++this[REGISTERS][$sp], null);
    };

    EvaluationStackImpl.prototype.dup = function dup() {
        var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this[REGISTERS][$sp];

        this.stack.copy(position, ++this[REGISTERS][$sp]);
    };

    EvaluationStackImpl.prototype.copy = function copy(from, to) {
        this.stack.copy(from, to);
    };

    EvaluationStackImpl.prototype.pop = function pop() {
        var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

        var top = this.stack.get(this[REGISTERS][$sp]);
        this[REGISTERS][$sp] -= n;
        return top;
    };

    EvaluationStackImpl.prototype.peek = function peek() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        return this.stack.get(this[REGISTERS][$sp] - offset);
    };

    EvaluationStackImpl.prototype.get = function get(offset) {
        var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[REGISTERS][$fp];

        return this.stack.get(base + offset);
    };

    EvaluationStackImpl.prototype.set = function set(value, offset) {
        var base = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this[REGISTERS][$fp];

        this.stack.write(base + offset, value);
    };

    EvaluationStackImpl.prototype.slice = function slice(start, end) {
        return this.stack.slice(start, end);
    };

    EvaluationStackImpl.prototype.sliceArray = function sliceArray(start, end) {
        return this.stack.sliceInner(start, end);
    };

    EvaluationStackImpl.prototype.capture = function capture(items) {
        var end = this[REGISTERS][$sp] + 1;
        var start = end - items;
        return this.stack.sliceInner(start, end);
    };

    EvaluationStackImpl.prototype.reset = function reset() {
        this.stack.reset();
    };

    EvaluationStackImpl.prototype.toArray = function toArray() {
        console.log(this[REGISTERS]);
        return this.stack.sliceInner(this[REGISTERS][$fp], this[REGISTERS][$sp] + 1);
    };

    return EvaluationStackImpl;
}();

export default EvaluationStackImpl;

function isImmediate(value) {
    var type = typeof value;
    if (value === null || value === undefined) return true;
    switch (type) {
        case 'boolean':
        case 'undefined':
            return true;
        case 'number':
            // not an integer
            if (value % 1 !== 0) return false;
            var abs = Math.abs(value);
            // too big
            if (abs > MAX_SMI) return false;
            return true;
        default:
            return false;
    }
}
function encodeSmi(primitive) {
    if (primitive < 0) {
        return Math.abs(primitive) << 3 | 4 /* NEGATIVE */;
    } else {
        return primitive << 3 | 0 /* NUMBER */;
    }
}
function encodeImmediate(primitive) {
    switch (typeof primitive) {
        case 'number':
            return encodeSmi(primitive);
        case 'boolean':
            return primitive ? 11 /* True */ : 3 /* False */;
        case 'object':
            // assume null
            return 19 /* Null */;
        case 'undefined':
            return 27 /* Undef */;
        default:
            throw unreachable();
    }
}
function decodeSmi(smi) {
    switch (smi & 7) {
        case 0 /* NUMBER */:
            return smi >> 3;
        case 4 /* NEGATIVE */:
            return -(smi >> 3);
        default:
            throw unreachable();
    }
}
function decodeImmediate(immediate) {
    switch (immediate) {
        case 3 /* False */:
            return false;
        case 11 /* True */:
            return true;
        case 19 /* Null */:
            return null;
        case 27 /* Undef */:
            return undefined;
        default:
            return decodeSmi(immediate);
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL3N0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFFQSxTQUFBLFdBQUEsUUFBQSxlQUFBO0FBQ0EsU0FBUyxTQUFULFNBQUEsUUFBQSxvQkFBQTtBQUNBLFNBQUEsR0FBQSxFQUFBLEdBQUEsUUFBQSxhQUFBO0FBQ0EsU0FBQSx5QkFBQSxRQUFBLGFBQUE7QUFDQSxTQUFBLFNBQUEsUUFBQSxZQUFBO0FBRUEsSUFBTSxVQUFOLFNBQUE7QUFFQSxXQUFNLFVBQU47QUFDRSwwQkFBdUU7QUFBQSxZQUFuRCxLQUFtRCx1RUFBM0MsSUFBNUIsU0FBNEIsRUFBMkM7QUFBQSxZQUFsQixFQUFrQix1RUFBdkUsRUFBdUU7O0FBQUE7O0FBQW5ELGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFBaUMsYUFBQSxFQUFBLEdBQUEsRUFBQTtBQUFzQjs7QUFEN0UseUJBR0UsS0FIRixrQkFHRSxLQUhGLEVBR0UsR0FIRixFQUdvQztBQUNoQyxZQUFBLGNBQUE7QUFFQSxZQUFJLE9BQUEsS0FBQSxLQUFBLFFBQUEsSUFBNkIsT0FBQSxHQUFBLEtBQWpDLFFBQUEsRUFBMEQ7QUFDeEQsb0JBQVEsS0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsRUFBUixHQUFRLENBQVI7QUFERixTQUFBLE1BRU8sSUFBSSxPQUFBLEtBQUEsS0FBQSxRQUFBLElBQTZCLFFBQWpDLFNBQUEsRUFBb0Q7QUFDekQsb0JBQVEsS0FBQSxLQUFBLENBQUEsU0FBQSxDQUFSLEtBQVEsQ0FBUjtBQURLLFNBQUEsTUFFQTtBQUNMLG9CQUFRLEtBQUEsS0FBQSxDQUFSLEtBQVEsRUFBUjtBQUNEO0FBRUQsZUFBTyxJQUFBLFVBQUEsQ0FBQSxLQUFBLEVBQXNCLEtBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQTdCLEdBQTZCLENBQXRCLENBQVA7QUFDRCxLQWZIOztBQUFBLHlCQWlCRSxVQWpC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RSxtQkFBQSxTQUFBO0FBQ0Y7QUFDRSxtQkFBTyxVQUFQLFNBQU8sQ0FBUDtBQVZKO0FBWUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCB7IFByaW1pdGl2ZVR5cGUgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IHVucmVhY2hhYmxlIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBTdGFjayBhcyBXYXNtU3RhY2sgfSBmcm9tICdAZ2xpbW1lci9sb3ctbGV2ZWwnO1xuaW1wb3J0IHsgTWFjaGluZVJlZ2lzdGVyLCAkc3AsICRmcCB9IGZyb20gJ0BnbGltbWVyL3ZtJztcbmltcG9ydCB7IExvd0xldmVsUmVnaXN0ZXJzLCBpbml0aWFsaXplUmVnaXN0ZXJzV2l0aFNQIH0gZnJvbSAnLi9sb3ctbGV2ZWwnO1xuaW1wb3J0IHsgUkVHSVNURVJTIH0gZnJvbSAnLi4vc3ltYm9scyc7XG5cbmNvbnN0IE1BWF9TTUkgPSAweGZmZmZmZmY7XG5cbmV4cG9ydCBjbGFzcyBJbm5lclN0YWNrIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lciA9IG5ldyBXYXNtU3RhY2soKSwgcHJpdmF0ZSBqczogdW5rbm93bltdID0gW10pIHt9XG5cbiAgc2xpY2Uoc3RhcnQ/OiBudW1iZXIsIGVuZD86IG51bWJlcik6IElubmVyU3RhY2sge1xuICAgIGxldCBpbm5lcjogV2FzbVN0YWNrO1xuXG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGVuZCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGlubmVyID0gdGhpcy5pbm5lci5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ251bWJlcicgJiYgZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlubmVyID0gdGhpcy5pbm5lci5zbGljZUZyb20oc3RhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbm5lciA9IHRoaXMuaW5uZXIuY2xvbmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IElubmVyU3RhY2soaW5uZXIsIHRoaXMuanMuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICB9XG5cbiAgc2xpY2VJbm5lcjxUID0gdW5rbm93bj4oc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBUW10ge1xuICAgIGxldCBvdXQgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBvdXQucHVzaCh0aGlzLmdldChpKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGNvcHkoZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5pbm5lci5jb3B5KGZyb20sIHRvKTtcbiAgfVxuXG4gIHdyaXRlKHBvczogbnVtYmVyLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGlmIChpc0ltbWVkaWF0ZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMud3JpdGVSYXcocG9zLCBlbmNvZGVJbW1lZGlhdGUodmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy53cml0ZUpzKHBvcywgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgd3JpdGVKcyhwb3M6IG51bWJlciwgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBsZXQgaWR4ID0gdGhpcy5qcy5sZW5ndGg7XG4gICAgdGhpcy5qcy5wdXNoKHZhbHVlKTtcbiAgICB0aGlzLmlubmVyLndyaXRlUmF3KHBvcywgfmlkeCk7XG4gIH1cblxuICB3cml0ZVJhdyhwb3M6IG51bWJlciwgdmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuaW5uZXIud3JpdGVSYXcocG9zLCB2YWx1ZSk7XG4gIH1cblxuICBnZXQ8VD4ocG9zOiBudW1iZXIpOiBUIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLmlubmVyLmdldFJhdyhwb3MpO1xuXG4gICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgcmV0dXJuIHRoaXMuanNbfnZhbHVlXSBhcyBUO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZGVjb2RlSW1tZWRpYXRlKHZhbHVlKSBhcyBhbnk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5pbm5lci5yZXNldCgpO1xuICAgIHRoaXMuanMubGVuZ3RoID0gMDtcbiAgfVxuXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbm5lci5sZW4oKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEV2YWx1YXRpb25TdGFjayB7XG4gIFtSRUdJU1RFUlNdOiBMb3dMZXZlbFJlZ2lzdGVycztcblxuICBwdXNoKHZhbHVlOiB1bmtub3duKTogdm9pZDtcbiAgcHVzaE51bGwoKTogdm9pZDtcbiAgcHVzaFJhdyh2YWx1ZTogbnVtYmVyKTogdm9pZDtcbiAgZHVwKHBvc2l0aW9uPzogTWFjaGluZVJlZ2lzdGVyKTogdm9pZDtcbiAgY29weShmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIpOiB2b2lkO1xuICBwb3A8VD4obj86IG51bWJlcik6IFQ7XG4gIHBlZWs8VD4ob2Zmc2V0PzogbnVtYmVyKTogVDtcbiAgZ2V0PFQ+KG9mZnNldDogbnVtYmVyLCBiYXNlPzogbnVtYmVyKTogVDtcbiAgc2V0KHZhbHVlOiB1bmtub3duLCBvZmZzZXQ6IG51bWJlciwgYmFzZT86IG51bWJlcik6IHZvaWQ7XG4gIHNsaWNlKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogSW5uZXJTdGFjaztcbiAgc2xpY2VBcnJheTxUID0gdW5rbm93bj4oc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBUW107XG4gIGNhcHR1cmUoaXRlbXM6IG51bWJlcik6IHVua25vd25bXTtcbiAgcmVzZXQoKTogdm9pZDtcbiAgdG9BcnJheSgpOiB1bmtub3duW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2YWx1YXRpb25TdGFja0ltcGwgaW1wbGVtZW50cyBFdmFsdWF0aW9uU3RhY2sge1xuICBzdGF0aWMgcmVzdG9yZShzbmFwc2hvdDogdW5rbm93bltdKTogRXZhbHVhdGlvblN0YWNrIHtcbiAgICBsZXQgc3RhY2sgPSBuZXcgSW5uZXJTdGFjaygpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbmFwc2hvdC5sZW5ndGg7IGkrKykge1xuICAgICAgc3RhY2sud3JpdGUoaSwgc25hcHNob3RbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgdGhpcyhzdGFjaywgaW5pdGlhbGl6ZVJlZ2lzdGVyc1dpdGhTUChzbmFwc2hvdC5sZW5ndGggLSAxKSk7XG4gIH1cblxuICByZWFkb25seSBbUkVHSVNURVJTXTogTG93TGV2ZWxSZWdpc3RlcnM7XG5cbiAgLy8gZnAgLT4gc3BcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBzdGFjazogSW5uZXJTdGFjaywgcmVnaXN0ZXJzOiBMb3dMZXZlbFJlZ2lzdGVycykge1xuICAgIHRoaXNbUkVHSVNURVJTXSA9IHJlZ2lzdGVycztcblxuICAgIGlmIChERUJVRykge1xuICAgICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgcHVzaCh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMuc3RhY2sud3JpdGUoKyt0aGlzW1JFR0lTVEVSU11bJHNwXSwgdmFsdWUpO1xuICB9XG5cbiAgcHVzaFJhdyh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zdGFjay53cml0ZVJhdygrK3RoaXNbUkVHSVNURVJTXVskc3BdLCB2YWx1ZSk7XG4gIH1cblxuICBwdXNoTnVsbCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0YWNrLndyaXRlKCsrdGhpc1tSRUdJU1RFUlNdWyRzcF0sIG51bGwpO1xuICB9XG5cbiAgZHVwKHBvc2l0aW9uID0gdGhpc1tSRUdJU1RFUlNdWyRzcF0pOiB2b2lkIHtcbiAgICB0aGlzLnN0YWNrLmNvcHkocG9zaXRpb24sICsrdGhpc1tSRUdJU1RFUlNdWyRzcF0pO1xuICB9XG5cbiAgY29weShmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnN0YWNrLmNvcHkoZnJvbSwgdG8pO1xuICB9XG5cbiAgcG9wPFQ+KG4gPSAxKTogVCB7XG4gICAgbGV0IHRvcCA9IHRoaXMuc3RhY2suZ2V0PFQ+KHRoaXNbUkVHSVNURVJTXVskc3BdKTtcbiAgICB0aGlzW1JFR0lTVEVSU11bJHNwXSAtPSBuO1xuICAgIHJldHVybiB0b3A7XG4gIH1cblxuICBwZWVrPFQ+KG9mZnNldCA9IDApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjay5nZXQ8VD4odGhpc1tSRUdJU1RFUlNdWyRzcF0gLSBvZmZzZXQpO1xuICB9XG5cbiAgZ2V0PFQ+KG9mZnNldDogbnVtYmVyLCBiYXNlID0gdGhpc1tSRUdJU1RFUlNdWyRmcF0pOiBUIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjay5nZXQ8VD4oYmFzZSArIG9mZnNldCk7XG4gIH1cblxuICBzZXQodmFsdWU6IHVua25vd24sIG9mZnNldDogbnVtYmVyLCBiYXNlID0gdGhpc1tSRUdJU1RFUlNdWyRmcF0pIHtcbiAgICB0aGlzLnN0YWNrLndyaXRlKGJhc2UgKyBvZmZzZXQsIHZhbHVlKTtcbiAgfVxuXG4gIHNsaWNlKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogSW5uZXJTdGFjayB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2suc2xpY2Uoc3RhcnQsIGVuZCk7XG4gIH1cblxuICBzbGljZUFycmF5PFQgPSB1bmtub3duPihzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IFRbXSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2suc2xpY2VJbm5lcihzdGFydCwgZW5kKTtcbiAgfVxuXG4gIGNhcHR1cmUoaXRlbXM6IG51bWJlcik6IHVua25vd25bXSB7XG4gICAgbGV0IGVuZCA9IHRoaXNbUkVHSVNURVJTXVskc3BdICsgMTtcbiAgICBsZXQgc3RhcnQgPSBlbmQgLSBpdGVtcztcbiAgICByZXR1cm4gdGhpcy5zdGFjay5zbGljZUlubmVyKHN0YXJ0LCBlbmQpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5zdGFjay5yZXNldCgpO1xuICB9XG5cbiAgdG9BcnJheSgpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzW1JFR0lTVEVSU10pO1xuICAgIHJldHVybiB0aGlzLnN0YWNrLnNsaWNlSW5uZXIodGhpc1tSRUdJU1RFUlNdWyRmcF0sIHRoaXNbUkVHSVNURVJTXVskc3BdICsgMSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNJbW1lZGlhdGUodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBudW1iZXIgfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gIGxldCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdHJ1ZTtcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdib29sZWFuJzpcbiAgICBjYXNlICd1bmRlZmluZWQnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIC8vIG5vdCBhbiBpbnRlZ2VyXG4gICAgICBpZiAoKHZhbHVlIGFzIG51bWJlcikgJSAxICE9PSAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGxldCBhYnMgPSBNYXRoLmFicyh2YWx1ZSBhcyBudW1iZXIpO1xuXG4gICAgICAvLyB0b28gYmlnXG4gICAgICBpZiAoYWJzID4gTUFYX1NNSSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFR5cGUge1xuICBOVU1CRVIgPSAwYjAwMCxcbiAgRkxPQVQgPSAwYjAwMSxcbiAgU1RSSU5HID0gMGIwMTAsXG4gIEJPT0xFQU5fT1JfVk9JRCA9IDBiMDExLFxuICBORUdBVElWRSA9IDBiMTAwLFxufVxuXG5leHBvcnQgY29uc3QgZW51bSBJbW1lZGlhdGVzIHtcbiAgRmFsc2UgPSAoMCA8PCAzKSB8IFR5cGUuQk9PTEVBTl9PUl9WT0lELFxuICBUcnVlID0gKDEgPDwgMykgfCBUeXBlLkJPT0xFQU5fT1JfVk9JRCxcbiAgTnVsbCA9ICgyIDw8IDMpIHwgVHlwZS5CT09MRUFOX09SX1ZPSUQsXG4gIFVuZGVmID0gKDMgPDwgMykgfCBUeXBlLkJPT0xFQU5fT1JfVk9JRCxcbn1cblxuZnVuY3Rpb24gZW5jb2RlU21pKHByaW1pdGl2ZTogbnVtYmVyKSB7XG4gIGlmIChwcmltaXRpdmUgPCAwKSB7XG4gICAgcmV0dXJuIChNYXRoLmFicyhwcmltaXRpdmUpIDw8IDMpIHwgUHJpbWl0aXZlVHlwZS5ORUdBVElWRTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKHByaW1pdGl2ZSA8PCAzKSB8IFByaW1pdGl2ZVR5cGUuTlVNQkVSO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuY29kZUltbWVkaWF0ZShwcmltaXRpdmU6IG51bWJlciB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgc3dpdGNoICh0eXBlb2YgcHJpbWl0aXZlKSB7XG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBlbmNvZGVTbWkocHJpbWl0aXZlIGFzIG51bWJlcik7XG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gcHJpbWl0aXZlID8gSW1tZWRpYXRlcy5UcnVlIDogSW1tZWRpYXRlcy5GYWxzZTtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgLy8gYXNzdW1lIG51bGxcbiAgICAgIHJldHVybiBJbW1lZGlhdGVzLk51bGw7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgIHJldHVybiBJbW1lZGlhdGVzLlVuZGVmO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyB1bnJlYWNoYWJsZSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlY29kZVNtaShzbWk6IG51bWJlcik6IG51bWJlciB7XG4gIHN3aXRjaCAoc21pICYgMGIxMTEpIHtcbiAgICBjYXNlIFByaW1pdGl2ZVR5cGUuTlVNQkVSOlxuICAgICAgcmV0dXJuIHNtaSA+PiAzO1xuICAgIGNhc2UgUHJpbWl0aXZlVHlwZS5ORUdBVElWRTpcbiAgICAgIHJldHVybiAtKHNtaSA+PiAzKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWNvZGVJbW1lZGlhdGUoaW1tZWRpYXRlOiBudW1iZXIpOiBudW1iZXIgfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAoaW1tZWRpYXRlKSB7XG4gICAgY2FzZSBJbW1lZGlhdGVzLkZhbHNlOlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNhc2UgSW1tZWRpYXRlcy5UcnVlOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY2FzZSBJbW1lZGlhdGVzLk51bGw6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICBjYXNlIEltbWVkaWF0ZXMuVW5kZWY6XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZGVjb2RlU21pKGltbWVkaWF0ZSk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=