'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setDebuggerCallback = setDebuggerCallback;
exports.resetDebuggerCallback = resetDebuggerCallback;

var _util = require('@glimmer/util');

var _opcodes = require('../../opcodes');

var _symbols2 = require('../../symbols');

function debugCallback(context, get) {
    console.info('Use `context`, and `get(<path>)` to debug this template.');
    // for example...
    // eslint-disable-next-line no-unused-expressions
    context === get('this');
    // eslint-disable-next-line no-debugger
    debugger;
}
let callback = debugCallback;
// For testing purposes
function setDebuggerCallback(cb) {
    callback = cb;
}
function resetDebuggerCallback() {
    callback = debugCallback;
}
class ScopeInspector {
    constructor(scope, symbols, evalInfo) {
        this.scope = scope;
        this.locals = (0, _util.dict)();
        for (let i = 0; i < evalInfo.length; i++) {
            let slot = evalInfo[i];
            let name = symbols[slot - 1];
            let ref = scope.getSymbol(slot);
            this.locals[name] = ref;
        }
    }
    get(path) {
        let { scope, locals } = this;
        let parts = path.split('.');
        let [head, ...tail] = path.split('.');
        let evalScope = scope.getEvalScope();
        let ref;
        if (head === 'this') {
            ref = scope.getSelf();
        } else if (locals[head]) {
            ref = locals[head];
        } else if (head.indexOf('@') === 0 && evalScope[head]) {
            ref = evalScope[head];
        } else {
            ref = this.scope.getSelf();
            tail = parts;
        }
        return tail.reduce((r, part) => r.get(part), ref);
    }
}
_opcodes.APPEND_OPCODES.add(105 /* Debugger */, (vm, { op1: _symbols, op2: _evalInfo }) => {
    let symbols = vm[_symbols2.CONSTANTS].getStringArray(_symbols);
    let evalInfo = vm[_symbols2.CONSTANTS].getArray(_evalInfo);
    let inspector = new ScopeInspector(vm.scope(), symbols, evalInfo);
    callback(vm.getSelf().value(), path => inspector.get(path).value());
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvZGVidWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7UUF3Qk0sbUIsR0FBQSxtQjtRQUlBLHFCLEdBQUEscUI7Ozs7QUF6Qk47O0FBQ0E7O0FBTUEsU0FBQSxhQUFBLENBQUEsT0FBQSxFQUFBLEdBQUEsRUFBc0Q7QUFDcEQsWUFBQSxJQUFBLENBQUEsMERBQUE7QUFFQTtBQUNBO0FBQ0EsZ0JBQVksSUFBWixNQUFZLENBQVo7QUFFQTtBQUNBO0FBQ0Q7QUFFRCxJQUFJLFdBQUosYUFBQTtBQUVBO0FBQ00sU0FBQSxtQkFBQSxDQUFBLEVBQUEsRUFBK0M7QUFDbkQsZUFBQSxFQUFBO0FBQ0Q7QUFFSyxTQUFBLHFCQUFBLEdBQStCO0FBQ25DLGVBQUEsYUFBQTtBQUNEO0FBRUQsTUFBQSxjQUFBLENBQW9CO0FBR2xCLGdCQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUEwRTtBQUF0RCxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBRlosYUFBQSxNQUFBLEdBQUEsaUJBQUE7QUFHTixhQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLElBQUksU0FBcEIsTUFBQSxFQUFBLEdBQUEsRUFBMEM7QUFDeEMsZ0JBQUksT0FBTyxTQUFYLENBQVcsQ0FBWDtBQUNBLGdCQUFJLE9BQU8sUUFBUSxPQUFuQixDQUFXLENBQVg7QUFDQSxnQkFBSSxNQUFNLE1BQUEsU0FBQSxDQUFWLElBQVUsQ0FBVjtBQUNBLGlCQUFBLE1BQUEsQ0FBQSxJQUFBLElBQUEsR0FBQTtBQUNEO0FBQ0Y7QUFFRCxRQUFBLElBQUEsRUFBZ0I7QUFDZCxZQUFJLEVBQUEsS0FBQSxFQUFBLE1BQUEsS0FBSixJQUFBO0FBQ0EsWUFBSSxRQUFRLEtBQUEsS0FBQSxDQUFaLEdBQVksQ0FBWjtBQUNBLFlBQUksQ0FBQSxJQUFBLEVBQU8sR0FBUCxJQUFBLElBQWtCLEtBQUEsS0FBQSxDQUF0QixHQUFzQixDQUF0QjtBQUVBLFlBQUksWUFBWSxNQUFoQixZQUFnQixFQUFoQjtBQUNBLFlBQUEsR0FBQTtBQUVBLFlBQUksU0FBSixNQUFBLEVBQXFCO0FBQ25CLGtCQUFNLE1BQU4sT0FBTSxFQUFOO0FBREYsU0FBQSxNQUVPLElBQUksT0FBSixJQUFJLENBQUosRUFBa0I7QUFDdkIsa0JBQU0sT0FBTixJQUFNLENBQU47QUFESyxTQUFBLE1BRUEsSUFBSSxLQUFBLE9BQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxJQUEyQixVQUEvQixJQUErQixDQUEvQixFQUFnRDtBQUNyRCxrQkFBTSxVQUFOLElBQU0sQ0FBTjtBQURLLFNBQUEsTUFFQTtBQUNMLGtCQUFNLEtBQUEsS0FBQSxDQUFOLE9BQU0sRUFBTjtBQUNBLG1CQUFBLEtBQUE7QUFDRDtBQUVELGVBQU8sS0FBQSxNQUFBLENBQVksQ0FBQSxDQUFBLEVBQUEsSUFBQSxLQUFhLEVBQUEsR0FBQSxDQUF6QixJQUF5QixDQUF6QixFQUFQLEdBQU8sQ0FBUDtBQUNEO0FBaENpQjtBQW1DcEIsd0JBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLEVBQWdDLENBQUEsRUFBQSxFQUFLLEVBQUUsS0FBRixRQUFBLEVBQWlCLEtBQXRCLFNBQUssRUFBTCxLQUEwQztBQUN4RSxRQUFJLFVBQVUsR0FBQSxtQkFBQSxFQUFBLGNBQUEsQ0FBZCxRQUFjLENBQWQ7QUFDQSxRQUFJLFdBQVcsR0FBQSxtQkFBQSxFQUFBLFFBQUEsQ0FBZixTQUFlLENBQWY7QUFDQSxRQUFJLFlBQVksSUFBQSxjQUFBLENBQW1CLEdBQW5CLEtBQW1CLEVBQW5CLEVBQUEsT0FBQSxFQUFoQixRQUFnQixDQUFoQjtBQUNBLGFBQVMsR0FBQSxPQUFBLEdBQVQsS0FBUyxFQUFULEVBQStCLFFBQVEsVUFBQSxHQUFBLENBQUEsSUFBQSxFQUF2QyxLQUF1QyxFQUF2QztBQUpGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPcCwgSml0T3JBb3RCbG9jaywgU2NvcGUgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFZlcnNpb25lZFBhdGhSZWZlcmVuY2UgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgZGljdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgQVBQRU5EX09QQ09ERVMgfSBmcm9tICcuLi8uLi9vcGNvZGVzJztcbmltcG9ydCB7IENPTlNUQU5UUyB9IGZyb20gJy4uLy4uL3N5bWJvbHMnO1xuXG5leHBvcnQgdHlwZSBEZWJ1Z0dldCA9IChwYXRoOiBzdHJpbmcpID0+IHVua25vd247XG5cbmV4cG9ydCB0eXBlIERlYnVnQ2FsbGJhY2sgPSAoY29udGV4dDogdW5rbm93biwgZ2V0OiBEZWJ1Z0dldCkgPT4gdm9pZDtcblxuZnVuY3Rpb24gZGVidWdDYWxsYmFjayhjb250ZXh0OiB1bmtub3duLCBnZXQ6IERlYnVnR2V0KTogdm9pZCB7XG4gIGNvbnNvbGUuaW5mbygnVXNlIGBjb250ZXh0YCwgYW5kIGBnZXQoPHBhdGg+KWAgdG8gZGVidWcgdGhpcyB0ZW1wbGF0ZS4nKTtcblxuICAvLyBmb3IgZXhhbXBsZS4uLlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLWV4cHJlc3Npb25zXG4gIGNvbnRleHQgPT09IGdldCgndGhpcycpO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1kZWJ1Z2dlclxuICBkZWJ1Z2dlcjtcbn1cblxubGV0IGNhbGxiYWNrID0gZGVidWdDYWxsYmFjaztcblxuLy8gRm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBmdW5jdGlvbiBzZXREZWJ1Z2dlckNhbGxiYWNrKGNiOiBEZWJ1Z0NhbGxiYWNrKSB7XG4gIGNhbGxiYWNrID0gY2I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERlYnVnZ2VyQ2FsbGJhY2soKSB7XG4gIGNhbGxiYWNrID0gZGVidWdDYWxsYmFjaztcbn1cblxuY2xhc3MgU2NvcGVJbnNwZWN0b3I8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IHtcbiAgcHJpdmF0ZSBsb2NhbHMgPSBkaWN0PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBzY29wZTogU2NvcGU8Qz4sIHN5bWJvbHM6IHN0cmluZ1tdLCBldmFsSW5mbzogbnVtYmVyW10pIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2YWxJbmZvLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgc2xvdCA9IGV2YWxJbmZvW2ldO1xuICAgICAgbGV0IG5hbWUgPSBzeW1ib2xzW3Nsb3QgLSAxXTtcbiAgICAgIGxldCByZWYgPSBzY29wZS5nZXRTeW1ib2woc2xvdCk7XG4gICAgICB0aGlzLmxvY2Fsc1tuYW1lXSA9IHJlZjtcbiAgICB9XG4gIH1cblxuICBnZXQocGF0aDogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgbGV0IHsgc2NvcGUsIGxvY2FscyB9ID0gdGhpcztcbiAgICBsZXQgcGFydHMgPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgbGV0IFtoZWFkLCAuLi50YWlsXSA9IHBhdGguc3BsaXQoJy4nKTtcblxuICAgIGxldCBldmFsU2NvcGUgPSBzY29wZS5nZXRFdmFsU2NvcGUoKSE7XG4gICAgbGV0IHJlZjogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPjtcblxuICAgIGlmIChoZWFkID09PSAndGhpcycpIHtcbiAgICAgIHJlZiA9IHNjb3BlLmdldFNlbGYoKTtcbiAgICB9IGVsc2UgaWYgKGxvY2Fsc1toZWFkXSkge1xuICAgICAgcmVmID0gbG9jYWxzW2hlYWRdO1xuICAgIH0gZWxzZSBpZiAoaGVhZC5pbmRleE9mKCdAJykgPT09IDAgJiYgZXZhbFNjb3BlW2hlYWRdKSB7XG4gICAgICByZWYgPSBldmFsU2NvcGVbaGVhZF0gYXMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVmID0gdGhpcy5zY29wZS5nZXRTZWxmKCk7XG4gICAgICB0YWlsID0gcGFydHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhaWwucmVkdWNlKChyLCBwYXJ0KSA9PiByLmdldChwYXJ0KSwgcmVmKTtcbiAgfVxufVxuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuRGVidWdnZXIsICh2bSwgeyBvcDE6IF9zeW1ib2xzLCBvcDI6IF9ldmFsSW5mbyB9KSA9PiB7XG4gIGxldCBzeW1ib2xzID0gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmdBcnJheShfc3ltYm9scyk7XG4gIGxldCBldmFsSW5mbyA9IHZtW0NPTlNUQU5UU10uZ2V0QXJyYXkoX2V2YWxJbmZvKTtcbiAgbGV0IGluc3BlY3RvciA9IG5ldyBTY29wZUluc3BlY3Rvcih2bS5zY29wZSgpLCBzeW1ib2xzLCBldmFsSW5mbyk7XG4gIGNhbGxiYWNrKHZtLmdldFNlbGYoKS52YWx1ZSgpLCBwYXRoID0+IGluc3BlY3Rvci5nZXQocGF0aCkudmFsdWUoKSk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiIn0=