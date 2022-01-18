function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

export var InstructionEncoderImpl = function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2VuY29kZXIvbGliL2VuY29kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFTTSxXQUFBLHNCQUFBO0FBQ0osb0NBQUEsTUFBQSxFQUEyQztBQUFBOztBQUF0QixhQUFBLE1BQUEsR0FBQSxNQUFBO0FBRXJCLGFBQUEsSUFBQSxHQUFBLENBQUE7QUFGK0M7O0FBRDNDLHFDQU9KLE1BUEksbUJBT0osSUFQSSxFQU9KLE9BUEksRUFPNkQ7QUFDL0QsWUFBSyxPQUFMLEdBQUEsQ0FBQSxlQUFBLEVBQTZDO0FBQzNDLHNCQUFNLElBQUEsS0FBQSxtQ0FBTixJQUFNLE9BQU47QUFDRDtBQUVELFlBQUksUUFBUSxPQUFBLE9BQUEsR0FBbUIsVUFBQSxNQUFBLEdBQUQsQ0FBQyxJQUFuQixDQUFaLENBQUEsZUFBQTtBQUVBLGFBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBRUEsYUFBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLFVBQXBCLE1BQUEsRUFBQSxHQUFBLEVBQTJDO0FBQ3pDLGdCQUFJLEtBQUssVUFBVCxDQUFTLENBQVQ7QUFDQSxnQkFBSSxPQUFBLEVBQUEsS0FBQSxRQUFBLElBQTBCLEtBQTlCLFVBQUEsQ0FBQSxjQUFBLEVBQXdEO0FBQ3RELDBCQUFNLElBQUEsS0FBQSxnQ0FBTixFQUFNLE9BQU47QUFDRDtBQUNELGlCQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsRUFBQTtBQUNEO0FBRUQsYUFBQSxJQUFBLEdBQVksS0FBQSxNQUFBLENBQVosTUFBQTtBQUNELEtBekJHOztBQUFBLHFDQTJCSixLQTNCSSxrQkEyQkosUUEzQkksRUEyQkosTUEzQkksRUEyQmtDO0FBQ3BDLFlBQUksS0FBQSxNQUFBLENBQVksV0FBWixDQUFBLE1BQThCLENBQWxDLENBQUEsRUFBc0M7QUFDcEMsaUJBQUEsTUFBQSxDQUFZLFdBQVosQ0FBQSxJQUFBLE1BQUE7QUFERixTQUFBLE1BRU87QUFDTCxrQkFBTSxJQUFBLEtBQUEsQ0FBTix1RUFBTSxDQUFOO0FBQ0Q7QUFDRixLQWpDRzs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcGlsZXJCdWZmZXIsXG4gIE9wZXJhbmQsXG4gIE1hY2hpbmVPcCxcbiAgT3AsXG4gIEluc3RydWN0aW9uRW5jb2RlcixcbiAgT3Bjb2RlU2l6ZSxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBjbGFzcyBJbnN0cnVjdGlvbkVuY29kZXJJbXBsIGltcGxlbWVudHMgSW5zdHJ1Y3Rpb25FbmNvZGVyIHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgYnVmZmVyOiBDb21waWxlckJ1ZmZlcikge31cblxuICBzaXplID0gMDtcblxuICBlbmNvZGUodHlwZTogTWFjaGluZU9wLCBtYWNoaW5lOiBPcGNvZGVTaXplLk1BQ0hJTkVfTUFTSywgLi4ub3BlcmFuZHM6IE9wZXJhbmRbXSk6IHZvaWQ7XG4gIGVuY29kZSh0eXBlOiBPcCwgbWFjaGluZTogMCwgLi4ub3BlcmFuZHM6IE9wZXJhbmRbXSk6IHZvaWQ7XG4gIGVuY29kZSh0eXBlOiBPcCB8IE1hY2hpbmVPcCwgbWFjaGluZTogMCB8IE9wY29kZVNpemUuTUFDSElORV9NQVNLKSB7XG4gICAgaWYgKCh0eXBlIGFzIG51bWJlcikgPiBPcGNvZGVTaXplLlRZUEVfU0laRSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBPcGNvZGUgdHlwZSBvdmVyIDgtYml0cy4gR290ICR7dHlwZX0uYCk7XG4gICAgfVxuXG4gICAgbGV0IGZpcnN0ID0gdHlwZSB8IG1hY2hpbmUgfCAoKGFyZ3VtZW50cy5sZW5ndGggLSAyKSA8PCBPcGNvZGVTaXplLkFSR19TSElGVCk7XG5cbiAgICB0aGlzLmJ1ZmZlci5wdXNoKGZpcnN0KTtcblxuICAgIGZvciAobGV0IGkgPSAyOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgb3AgPSBhcmd1bWVudHNbaV07XG4gICAgICBpZiAodHlwZW9mIG9wID09PSAnbnVtYmVyJyAmJiBvcCA+IE9wY29kZVNpemUuTUFYX1NJWkUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBPcGVyYW5kIG92ZXIgMzItYml0cy4gR290ICR7b3B9LmApO1xuICAgICAgfVxuICAgICAgdGhpcy5idWZmZXIucHVzaChvcCk7XG4gICAgfVxuXG4gICAgdGhpcy5zaXplID0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICB9XG5cbiAgcGF0Y2gocG9zaXRpb246IG51bWJlciwgdGFyZ2V0OiBudW1iZXIpIHtcbiAgICBpZiAodGhpcy5idWZmZXJbcG9zaXRpb24gKyAxXSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuYnVmZmVyW3Bvc2l0aW9uICsgMV0gPSB0YXJnZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIHBhdGNoIG9wZXJhbmQgaW4gcG9wdWxhdGVkIHNsb3QgaW5zdGVhZCBvZiBhIHJlc2VydmVkIHNsb3QuJyk7XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9