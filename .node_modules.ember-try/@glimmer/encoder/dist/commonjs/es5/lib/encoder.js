'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var InstructionEncoderImpl = exports.InstructionEncoderImpl = function () {
    function InstructionEncoderImpl(buffer) {
        _classCallCheck(this, InstructionEncoderImpl);

        this.buffer = buffer;
        this.size = 0;
    }

    InstructionEncoderImpl.prototype.encode = function encode(type, machine) {
        if (type > 255 /* TYPE_SIZE */) {
                throw new Error('Opcode type over 8-bits. Got ' + type + '.');
            }
        var first = type | machine | arguments.length - 2 << 8 /* ARG_SHIFT */;
        this.buffer.push(first);
        for (var i = 2; i < arguments.length; i++) {
            var op = arguments[i];
            if (typeof op === 'number' && op > 4294967295 /* MAX_SIZE */) {
                    throw new Error('Operand over 32-bits. Got ' + op + '.');
                }
            this.buffer.push(op);
        }
        this.size = this.buffer.length;
    };

    InstructionEncoderImpl.prototype.patch = function patch(position, target) {
        if (this.buffer[position + 1] === -1) {
            this.buffer[position + 1] = target;
        } else {
            throw new Error('Trying to patch operand in populated slot instead of a reserved slot.');
        }
    };

    return InstructionEncoderImpl;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2VuY29kZXIvbGliL2VuY29kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFTTSxJQUFBLDBEQUFBLFlBQUE7QUFDSixhQUFBLHNCQUFBLENBQUEsTUFBQSxFQUEyQztBQUFBLHdCQUFBLElBQUEsRUFBQSxzQkFBQTs7QUFBdEIsYUFBQSxNQUFBLEdBQUEsTUFBQTtBQUVyQixhQUFBLElBQUEsR0FBQSxDQUFBO0FBRitDOztBQUQzQywyQkFBQSxTQUFBLENBQUEsTUFBQSxHQUFBLFNBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxPQUFBLEVBTzZEO0FBQy9ELFlBQUssT0FBTCxHQUFBLENBQUEsZUFBQSxFQUE2QztBQUMzQyxzQkFBTSxJQUFBLEtBQUEsQ0FBQSxrQ0FBTixJQUFNLEdBQU4sR0FBTSxDQUFOO0FBQ0Q7QUFFRCxZQUFJLFFBQVEsT0FBQSxPQUFBLEdBQW1CLFVBQUEsTUFBQSxHQUFELENBQUMsSUFBL0IsQ0FBQSxDQUFBLGVBQUE7QUFFQSxhQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtBQUVBLGFBQUssSUFBSSxJQUFULENBQUEsRUFBZ0IsSUFBSSxVQUFwQixNQUFBLEVBQUEsR0FBQSxFQUEyQztBQUN6QyxnQkFBSSxLQUFLLFVBQVQsQ0FBUyxDQUFUO0FBQ0EsZ0JBQUksT0FBQSxFQUFBLEtBQUEsUUFBQSxJQUEwQixLQUE5QixVQUFBLENBQUEsY0FBQSxFQUF3RDtBQUN0RCwwQkFBTSxJQUFBLEtBQUEsQ0FBQSwrQkFBTixFQUFNLEdBQU4sR0FBTSxDQUFOO0FBQ0Q7QUFDRCxpQkFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUE7QUFDRDtBQUVELGFBQUEsSUFBQSxHQUFZLEtBQUEsTUFBQSxDQUFaLE1BQUE7QUF4QkUsS0FBQTs7QUFBQSwyQkFBQSxTQUFBLENBQUEsS0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxNQUFBLEVBMkJrQztBQUNwQyxZQUFJLEtBQUEsTUFBQSxDQUFZLFdBQVosQ0FBQSxNQUE4QixDQUFsQyxDQUFBLEVBQXNDO0FBQ3BDLGlCQUFBLE1BQUEsQ0FBWSxXQUFaLENBQUEsSUFBQSxNQUFBO0FBREYsU0FBQSxNQUVPO0FBQ0wsa0JBQU0sSUFBQSxLQUFBLENBQU4sdUVBQU0sQ0FBTjtBQUNEO0FBaENDLEtBQUE7O0FBQUEsV0FBQSxzQkFBQTtBQUFBLENBQUEsRUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBpbGVyQnVmZmVyLFxuICBPcGVyYW5kLFxuICBNYWNoaW5lT3AsXG4gIE9wLFxuICBJbnN0cnVjdGlvbkVuY29kZXIsXG4gIE9wY29kZVNpemUsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgY2xhc3MgSW5zdHJ1Y3Rpb25FbmNvZGVySW1wbCBpbXBsZW1lbnRzIEluc3RydWN0aW9uRW5jb2RlciB7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGJ1ZmZlcjogQ29tcGlsZXJCdWZmZXIpIHt9XG5cbiAgc2l6ZSA9IDA7XG5cbiAgZW5jb2RlKHR5cGU6IE1hY2hpbmVPcCwgbWFjaGluZTogT3Bjb2RlU2l6ZS5NQUNISU5FX01BU0ssIC4uLm9wZXJhbmRzOiBPcGVyYW5kW10pOiB2b2lkO1xuICBlbmNvZGUodHlwZTogT3AsIG1hY2hpbmU6IDAsIC4uLm9wZXJhbmRzOiBPcGVyYW5kW10pOiB2b2lkO1xuICBlbmNvZGUodHlwZTogT3AgfCBNYWNoaW5lT3AsIG1hY2hpbmU6IDAgfCBPcGNvZGVTaXplLk1BQ0hJTkVfTUFTSykge1xuICAgIGlmICgodHlwZSBhcyBudW1iZXIpID4gT3Bjb2RlU2l6ZS5UWVBFX1NJWkUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgT3Bjb2RlIHR5cGUgb3ZlciA4LWJpdHMuIEdvdCAke3R5cGV9LmApO1xuICAgIH1cblxuICAgIGxldCBmaXJzdCA9IHR5cGUgfCBtYWNoaW5lIHwgKChhcmd1bWVudHMubGVuZ3RoIC0gMikgPDwgT3Bjb2RlU2l6ZS5BUkdfU0hJRlQpO1xuXG4gICAgdGhpcy5idWZmZXIucHVzaChmaXJzdCk7XG5cbiAgICBmb3IgKGxldCBpID0gMjsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IG9wID0gYXJndW1lbnRzW2ldO1xuICAgICAgaWYgKHR5cGVvZiBvcCA9PT0gJ251bWJlcicgJiYgb3AgPiBPcGNvZGVTaXplLk1BWF9TSVpFKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgT3BlcmFuZCBvdmVyIDMyLWJpdHMuIEdvdCAke29wfS5gKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYnVmZmVyLnB1c2gob3ApO1xuICAgIH1cblxuICAgIHRoaXMuc2l6ZSA9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgfVxuXG4gIHBhdGNoKHBvc2l0aW9uOiBudW1iZXIsIHRhcmdldDogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuYnVmZmVyW3Bvc2l0aW9uICsgMV0gPT09IC0xKSB7XG4gICAgICB0aGlzLmJ1ZmZlcltwb3NpdGlvbiArIDFdID0gdGFyZ2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBwYXRjaCBvcGVyYW5kIGluIHBvcHVsYXRlZCBzbG90IGluc3RlYWQgb2YgYSByZXNlcnZlZCBzbG90LicpO1xuICAgIH1cbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==