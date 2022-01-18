'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.initializeRegisters = initializeRegisters;
exports.initializeRegistersWithSP = initializeRegistersWithSP;
exports.initializeRegistersWithPC = initializeRegistersWithPC;

var _opcodes = require('../opcodes');

var _vm = require('@glimmer/vm');

var _util = require('@glimmer/util');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function initializeRegisters() {
    return [0, -1, 0, 0];
}
function initializeRegistersWithSP(sp) {
    return [0, -1, sp, 0];
}
function initializeRegistersWithPC(pc) {
    return [pc, -1, 0, 0];
}

var LowLevelVM = function () {
    function LowLevelVM(stack, heap, program, externs, registers) {
        _classCallCheck(this, LowLevelVM);

        this.stack = stack;
        this.heap = heap;
        this.program = program;
        this.externs = externs;
        this.registers = registers;
        this.currentOpSize = 0;
    }

    LowLevelVM.prototype.fetchRegister = function fetchRegister(register) {
        return this.registers[register];
    };

    LowLevelVM.prototype.loadRegister = function loadRegister(register, value) {
        this.registers[register] = value;
    };

    LowLevelVM.prototype.setPc = function setPc(pc) {
        false && (0, _util.assert)(typeof pc === 'number' && !isNaN(pc), 'pc is set to a number');

        this.registers[_vm.$pc] = pc;
    };
    // Start a new frame and save $ra and $fp on the stack


    LowLevelVM.prototype.pushFrame = function pushFrame() {
        this.stack.push(this.registers[_vm.$ra]);
        this.stack.push(this.registers[_vm.$fp]);
        this.registers[_vm.$fp] = this.registers[_vm.$sp] - 1;
    };
    // Restore $ra, $sp and $fp


    LowLevelVM.prototype.popFrame = function popFrame() {
        this.registers[_vm.$sp] = this.registers[_vm.$fp] - 1;
        this.registers[_vm.$ra] = this.stack.get(0);
        this.registers[_vm.$fp] = this.stack.get(1);
    };

    LowLevelVM.prototype.pushSmallFrame = function pushSmallFrame() {
        this.stack.push(this.registers[_vm.$ra]);
    };

    LowLevelVM.prototype.popSmallFrame = function popSmallFrame() {
        this.registers[_vm.$ra] = this.stack.pop();
    };
    // Jump to an address in `program`


    LowLevelVM.prototype.goto = function goto(offset) {
        this.setPc(this.target(offset));
    };

    LowLevelVM.prototype.target = function target(offset) {
        return this.registers[_vm.$pc] + offset - this.currentOpSize;
    };
    // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)


    LowLevelVM.prototype.call = function call(handle) {
        false && (0, _util.assert)(handle < 0xffffffff, 'Jumping to placehoder address');

        this.registers[_vm.$ra] = this.registers[_vm.$pc];
        this.setPc(this.heap.getaddr(handle));
    };
    // Put a specific `program` address in $ra


    LowLevelVM.prototype.returnTo = function returnTo(offset) {
        this.registers[_vm.$ra] = this.target(offset);
    };
    // Return to the `program` address stored in $ra


    LowLevelVM.prototype.return = function _return() {
        this.setPc(this.registers[_vm.$ra]);
    };

    LowLevelVM.prototype.nextStatement = function nextStatement() {
        var registers = this.registers,
            program = this.program;

        var pc = registers[_vm.$pc];
        false && (0, _util.assert)(typeof pc === 'number', 'pc is a number');

        if (pc === -1) {
            return null;
        }
        // We have to save off the current operations size so that
        // when we do a jump we can calculate the correct offset
        // to where we are going. We can't simply ask for the size
        // in a jump because we have have already incremented the
        // program counter to the next instruction prior to executing.
        var opcode = program.opcode(pc);
        var operationSize = this.currentOpSize = opcode.size;
        this.registers[_vm.$pc] += operationSize;
        return opcode;
    };

    LowLevelVM.prototype.evaluateOuter = function evaluateOuter(opcode, vm) {
        if (false) {
            var _externs = this.externs,
                debugBefore = _externs.debugBefore,
                debugAfter = _externs.debugAfter;

            var state = debugBefore(opcode);
            this.evaluateInner(opcode, vm);
            debugAfter(state);
        } else {
            this.evaluateInner(opcode, vm);
        }
    };

    LowLevelVM.prototype.evaluateInner = function evaluateInner(opcode, vm) {
        if (opcode.isMachine) {
            this.evaluateMachine(opcode);
        } else {
            this.evaluateSyscall(opcode, vm);
        }
    };

    LowLevelVM.prototype.evaluateMachine = function evaluateMachine(opcode) {
        switch (opcode.type) {
            case 0 /* PushFrame */:
                return this.pushFrame();
            case 1 /* PopFrame */:
                return this.popFrame();
            case 3 /* InvokeStatic */:
                return this.call(opcode.op1);
            case 2 /* InvokeVirtual */:
                return this.call(this.stack.pop());
            case 4 /* Jump */:
                return this.goto(opcode.op1);
            case 5 /* Return */:
                return this.return();
            case 6 /* ReturnTo */:
                return this.returnTo(opcode.op1);
        }
    };

    LowLevelVM.prototype.evaluateSyscall = function evaluateSyscall(opcode, vm) {
        _opcodes.APPEND_OPCODES.evaluate(vm, opcode, opcode.type);
    };

    return LowLevelVM;
}();

exports.default = LowLevelVM;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2xvdy1sZXZlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQXFCTSxtQixHQUFBLG1CO1FBSUEseUIsR0FBQSx5QjtRQUlBLHlCLEdBQUEseUI7O0FBckJOOztBQUdBOztBQUNBOzs7Ozs7OztBQVNNLFNBQUEsbUJBQUEsR0FBNkI7QUFDakMsV0FBTyxDQUFBLENBQUEsRUFBSSxDQUFKLENBQUEsRUFBQSxDQUFBLEVBQVAsQ0FBTyxDQUFQO0FBQ0Q7QUFFSyxTQUFBLHlCQUFBLENBQUEsRUFBQSxFQUE4QztBQUNsRCxXQUFPLENBQUEsQ0FBQSxFQUFJLENBQUosQ0FBQSxFQUFBLEVBQUEsRUFBUCxDQUFPLENBQVA7QUFDRDtBQUVLLFNBQUEseUJBQUEsQ0FBQSxFQUFBLEVBQThDO0FBQ2xELFdBQU8sQ0FBQSxFQUFBLEVBQUssQ0FBTCxDQUFBLEVBQUEsQ0FBQSxFQUFQLENBQU8sQ0FBUDtBQUNEOztJQWFhLGE7QUFHWixhQUFBLFVBQUEsQ0FBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUt1QztBQUFBLHdCQUFBLElBQUEsRUFBQSxVQUFBOztBQUo5QixhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsT0FBQSxHQUFBLE9BQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0UsYUFBQSxTQUFBLEdBQUEsU0FBQTtBQVBKLGFBQUEsYUFBQSxHQUFBLENBQUE7QUFRSDs7eUJBRUosYSwwQkFBQSxRLEVBQXVDO0FBQ3JDLGVBQU8sS0FBQSxTQUFBLENBQVAsUUFBTyxDQUFQOzs7eUJBR0YsWSx5QkFBQSxRLEVBQUEsSyxFQUFxRDtBQUNuRCxhQUFBLFNBQUEsQ0FBQSxRQUFBLElBQUEsS0FBQTs7O3lCQUdGLEssa0JBQUEsRSxFQUFnQjtBQUFBLGlCQUNkLGtC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QUFBLEVBQUEsRUFBQTtBQUNEOzs7eUJBR0gsYSwwQkFBQSxNLEVBQUEsRSxFQUFzRDtBQUNwRCxZQUFJLE9BQUosU0FBQSxFQUFzQjtBQUNwQixpQkFBQSxlQUFBLENBQUEsTUFBQTtBQURGLFNBQUEsTUFFTztBQUNMLGlCQUFBLGVBQUEsQ0FBQSxNQUFBLEVBQUEsRUFBQTtBQUNEOzs7eUJBR0gsZSw0QkFBQSxNLEVBQWlDO0FBQy9CLGdCQUFRLE9BQVIsSUFBQTtBQUNFLGlCQUFBLENBQUEsQ0FBQSxlQUFBO0FBQ0UsdUJBQU8sS0FBUCxTQUFPLEVBQVA7QUFDRixpQkFBQSxDQUFBLENBQUEsY0FBQTtBQUNFLHVCQUFPLEtBQVAsUUFBTyxFQUFQO0FBQ0YsaUJBQUEsQ0FBQSxDQUFBLGtCQUFBO0FBQ0UsdUJBQU8sS0FBQSxJQUFBLENBQVUsT0FBakIsR0FBTyxDQUFQO0FBQ0YsaUJBQUEsQ0FBQSxDQUFBLG1CQUFBO0FBQ0UsdUJBQU8sS0FBQSxJQUFBLENBQVUsS0FBQSxLQUFBLENBQWpCLEdBQWlCLEVBQVYsQ0FBUDtBQUNGLGlCQUFBLENBQUEsQ0FBQSxVQUFBO0FBQ0UsdUJBQU8sS0FBQSxJQUFBLENBQVUsT0FBakIsR0FBTyxDQUFQO0FBQ0YsaUJBQUEsQ0FBQSxDQUFBLFlBQUE7QUFDRSx1QkFBTyxLQUFQLE1BQU8sRUFBUDtBQUNGLGlCQUFBLENBQUEsQ0FBQSxjQUFBO0FBQ0UsdUJBQU8sS0FBQSxRQUFBLENBQWMsT0FBckIsR0FBTyxDQUFQO0FBZEo7Ozt5QkFrQkYsZSw0QkFBQSxNLEVBQUEsRSxFQUF3RDtBQUN0RCxnQ0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLE1BQUEsRUFBb0MsT0FBcEMsSUFBQTs7Ozs7O2tCQXpJVSxVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgT3B0aW9uLFxuICBSdW50aW1lSGVhcCxcbiAgTWFjaGluZU9wLFxuICBSdW50aW1lUHJvZ3JhbSxcbiAgUnVudGltZU9wLFxuICBKaXRPckFvdEJsb2NrLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IEFQUEVORF9PUENPREVTIH0gZnJvbSAnLi4vb3Bjb2Rlcyc7XG5pbXBvcnQgVk0gZnJvbSAnLi9hcHBlbmQnO1xuaW1wb3J0IHsgREVWTU9ERSB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCB7IE1hY2hpbmVSZWdpc3RlciwgJHBjLCAkcmEsICRmcCwgJHNwIH0gZnJvbSAnQGdsaW1tZXIvdm0nO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG93TGV2ZWxSZWdpc3RlcnMge1xuICBbTWFjaGluZVJlZ2lzdGVyLnBjXTogbnVtYmVyO1xuICBbTWFjaGluZVJlZ2lzdGVyLnJhXTogbnVtYmVyO1xuICBbTWFjaGluZVJlZ2lzdGVyLnNwXTogbnVtYmVyO1xuICBbTWFjaGluZVJlZ2lzdGVyLmZwXTogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZVJlZ2lzdGVycygpOiBMb3dMZXZlbFJlZ2lzdGVycyB7XG4gIHJldHVybiBbMCwgLTEsIDAsIDBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZVJlZ2lzdGVyc1dpdGhTUChzcDogbnVtYmVyKTogTG93TGV2ZWxSZWdpc3RlcnMge1xuICByZXR1cm4gWzAsIC0xLCBzcCwgMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplUmVnaXN0ZXJzV2l0aFBDKHBjOiBudW1iZXIpOiBMb3dMZXZlbFJlZ2lzdGVycyB7XG4gIHJldHVybiBbcGMsIC0xLCAwLCAwXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGFjayB7XG4gIHB1c2godmFsdWU6IG51bWJlcik6IHZvaWQ7XG4gIGdldChwb3NpdGlvbjogbnVtYmVyKTogbnVtYmVyO1xuICBwb3AoKTogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVybnMge1xuICBkZWJ1Z0JlZm9yZShvcGNvZGU6IFJ1bnRpbWVPcCk6IHVua25vd247XG4gIGRlYnVnQWZ0ZXIoc3RhdGU6IHVua25vd24pOiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb3dMZXZlbFZNIHtcbiAgcHVibGljIGN1cnJlbnRPcFNpemUgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBzdGFjazogU3RhY2ssXG4gICAgcHVibGljIGhlYXA6IFJ1bnRpbWVIZWFwLFxuICAgIHB1YmxpYyBwcm9ncmFtOiBSdW50aW1lUHJvZ3JhbSxcbiAgICBwdWJsaWMgZXh0ZXJuczogRXh0ZXJucyxcbiAgICByZWFkb25seSByZWdpc3RlcnM6IExvd0xldmVsUmVnaXN0ZXJzXG4gICkge31cblxuICBmZXRjaFJlZ2lzdGVyKHJlZ2lzdGVyOiBNYWNoaW5lUmVnaXN0ZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyc1tyZWdpc3Rlcl07XG4gIH1cblxuICBsb2FkUmVnaXN0ZXIocmVnaXN0ZXI6IE1hY2hpbmVSZWdpc3RlciwgdmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMucmVnaXN0ZXJzW3JlZ2lzdGVyXSA9IHZhbHVlO1xuICB9XG5cbiAgc2V0UGMocGM6IG51bWJlcik6IHZvaWQge1xuICAgIGFzc2VydCh0eXBlb2YgcGMgPT09ICdudW1iZXInICYmICFpc05hTihwYyksICdwYyBpcyBzZXQgdG8gYSBudW1iZXInKTtcbiAgICB0aGlzLnJlZ2lzdGVyc1skcGNdID0gcGM7XG4gIH1cblxuICAvLyBTdGFydCBhIG5ldyBmcmFtZSBhbmQgc2F2ZSAkcmEgYW5kICRmcCBvbiB0aGUgc3RhY2tcbiAgcHVzaEZyYW1lKCkge1xuICAgIHRoaXMuc3RhY2sucHVzaCh0aGlzLnJlZ2lzdGVyc1skcmFdKTtcbiAgICB0aGlzLnN0YWNrLnB1c2godGhpcy5yZWdpc3RlcnNbJGZwXSk7XG4gICAgdGhpcy5yZWdpc3RlcnNbJGZwXSA9IHRoaXMucmVnaXN0ZXJzWyRzcF0gLSAxO1xuICB9XG5cbiAgLy8gUmVzdG9yZSAkcmEsICRzcCBhbmQgJGZwXG4gIHBvcEZyYW1lKCkge1xuICAgIHRoaXMucmVnaXN0ZXJzWyRzcF0gPSB0aGlzLnJlZ2lzdGVyc1skZnBdIC0gMTtcbiAgICB0aGlzLnJlZ2lzdGVyc1skcmFdID0gdGhpcy5zdGFjay5nZXQoMCk7XG4gICAgdGhpcy5yZWdpc3RlcnNbJGZwXSA9IHRoaXMuc3RhY2suZ2V0KDEpO1xuICB9XG5cbiAgcHVzaFNtYWxsRnJhbWUoKSB7XG4gICAgdGhpcy5zdGFjay5wdXNoKHRoaXMucmVnaXN0ZXJzWyRyYV0pO1xuICB9XG5cbiAgcG9wU21hbGxGcmFtZSgpIHtcbiAgICB0aGlzLnJlZ2lzdGVyc1skcmFdID0gdGhpcy5zdGFjay5wb3AoKTtcbiAgfVxuXG4gIC8vIEp1bXAgdG8gYW4gYWRkcmVzcyBpbiBgcHJvZ3JhbWBcbiAgZ290byhvZmZzZXQ6IG51bWJlcikge1xuICAgIHRoaXMuc2V0UGModGhpcy50YXJnZXQob2Zmc2V0KSk7XG4gIH1cblxuICB0YXJnZXQob2Zmc2V0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RlcnNbJHBjXSArIG9mZnNldCAtIHRoaXMuY3VycmVudE9wU2l6ZTtcbiAgfVxuXG4gIC8vIFNhdmUgJHBjIGludG8gJHJhLCB0aGVuIGp1bXAgdG8gYSBuZXcgYWRkcmVzcyBpbiBgcHJvZ3JhbWAgKGphbCBpbiBNSVBTKVxuICBjYWxsKGhhbmRsZTogbnVtYmVyKSB7XG4gICAgYXNzZXJ0KGhhbmRsZSA8IDB4ZmZmZmZmZmYsIGBKdW1waW5nIHRvIHBsYWNlaG9kZXIgYWRkcmVzc2ApO1xuXG4gICAgdGhpcy5yZWdpc3RlcnNbJHJhXSA9IHRoaXMucmVnaXN0ZXJzWyRwY107XG4gICAgdGhpcy5zZXRQYyh0aGlzLmhlYXAuZ2V0YWRkcihoYW5kbGUpKTtcbiAgfVxuXG4gIC8vIFB1dCBhIHNwZWNpZmljIGBwcm9ncmFtYCBhZGRyZXNzIGluICRyYVxuICByZXR1cm5UbyhvZmZzZXQ6IG51bWJlcikge1xuICAgIHRoaXMucmVnaXN0ZXJzWyRyYV0gPSB0aGlzLnRhcmdldChvZmZzZXQpO1xuICB9XG5cbiAgLy8gUmV0dXJuIHRvIHRoZSBgcHJvZ3JhbWAgYWRkcmVzcyBzdG9yZWQgaW4gJHJhXG4gIHJldHVybigpIHtcbiAgICB0aGlzLnNldFBjKHRoaXMucmVnaXN0ZXJzWyRyYV0pO1xuICB9XG5cbiAgbmV4dFN0YXRlbWVudCgpOiBPcHRpb248UnVudGltZU9wPiB7XG4gICAgbGV0IHsgcmVnaXN0ZXJzLCBwcm9ncmFtIH0gPSB0aGlzO1xuXG4gICAgbGV0IHBjID0gcmVnaXN0ZXJzWyRwY107XG5cbiAgICBhc3NlcnQodHlwZW9mIHBjID09PSAnbnVtYmVyJywgJ3BjIGlzIGEgbnVtYmVyJyk7XG5cbiAgICBpZiAocGMgPT09IC0xKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBXZSBoYXZlIHRvIHNhdmUgb2ZmIHRoZSBjdXJyZW50IG9wZXJhdGlvbnMgc2l6ZSBzbyB0aGF0XG4gICAgLy8gd2hlbiB3ZSBkbyBhIGp1bXAgd2UgY2FuIGNhbGN1bGF0ZSB0aGUgY29ycmVjdCBvZmZzZXRcbiAgICAvLyB0byB3aGVyZSB3ZSBhcmUgZ29pbmcuIFdlIGNhbid0IHNpbXBseSBhc2sgZm9yIHRoZSBzaXplXG4gICAgLy8gaW4gYSBqdW1wIGJlY2F1c2Ugd2UgaGF2ZSBoYXZlIGFscmVhZHkgaW5jcmVtZW50ZWQgdGhlXG4gICAgLy8gcHJvZ3JhbSBjb3VudGVyIHRvIHRoZSBuZXh0IGluc3RydWN0aW9uIHByaW9yIHRvIGV4ZWN1dGluZy5cbiAgICBsZXQgb3Bjb2RlID0gcHJvZ3JhbS5vcGNvZGUocGMpO1xuICAgIGxldCBvcGVyYXRpb25TaXplID0gKHRoaXMuY3VycmVudE9wU2l6ZSA9IG9wY29kZS5zaXplKTtcbiAgICB0aGlzLnJlZ2lzdGVyc1skcGNdICs9IG9wZXJhdGlvblNpemU7XG5cbiAgICByZXR1cm4gb3Bjb2RlO1xuICB9XG5cbiAgZXZhbHVhdGVPdXRlcihvcGNvZGU6IFJ1bnRpbWVPcCwgdm06IFZNPEppdE9yQW90QmxvY2s+KSB7XG4gICAgaWYgKERFVk1PREUpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIGV4dGVybnM6IHsgZGVidWdCZWZvcmUsIGRlYnVnQWZ0ZXIgfSxcbiAgICAgIH0gPSB0aGlzO1xuICAgICAgbGV0IHN0YXRlID0gZGVidWdCZWZvcmUob3Bjb2RlKTtcbiAgICAgIHRoaXMuZXZhbHVhdGVJbm5lcihvcGNvZGUsIHZtKTtcbiAgICAgIGRlYnVnQWZ0ZXIoc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmV2YWx1YXRlSW5uZXIob3Bjb2RlLCB2bSk7XG4gICAgfVxuICB9XG5cbiAgZXZhbHVhdGVJbm5lcihvcGNvZGU6IFJ1bnRpbWVPcCwgdm06IFZNPEppdE9yQW90QmxvY2s+KSB7XG4gICAgaWYgKG9wY29kZS5pc01hY2hpbmUpIHtcbiAgICAgIHRoaXMuZXZhbHVhdGVNYWNoaW5lKG9wY29kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZXZhbHVhdGVTeXNjYWxsKG9wY29kZSwgdm0pO1xuICAgIH1cbiAgfVxuXG4gIGV2YWx1YXRlTWFjaGluZShvcGNvZGU6IFJ1bnRpbWVPcCkge1xuICAgIHN3aXRjaCAob3Bjb2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgTWFjaGluZU9wLlB1c2hGcmFtZTpcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaEZyYW1lKCk7XG4gICAgICBjYXNlIE1hY2hpbmVPcC5Qb3BGcmFtZTpcbiAgICAgICAgcmV0dXJuIHRoaXMucG9wRnJhbWUoKTtcbiAgICAgIGNhc2UgTWFjaGluZU9wLkludm9rZVN0YXRpYzpcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbChvcGNvZGUub3AxKTtcbiAgICAgIGNhc2UgTWFjaGluZU9wLkludm9rZVZpcnR1YWw6XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGwodGhpcy5zdGFjay5wb3AoKSk7XG4gICAgICBjYXNlIE1hY2hpbmVPcC5KdW1wOlxuICAgICAgICByZXR1cm4gdGhpcy5nb3RvKG9wY29kZS5vcDEpO1xuICAgICAgY2FzZSBNYWNoaW5lT3AuUmV0dXJuOlxuICAgICAgICByZXR1cm4gdGhpcy5yZXR1cm4oKTtcbiAgICAgIGNhc2UgTWFjaGluZU9wLlJldHVyblRvOlxuICAgICAgICByZXR1cm4gdGhpcy5yZXR1cm5UbyhvcGNvZGUub3AxKTtcbiAgICB9XG4gIH1cblxuICBldmFsdWF0ZVN5c2NhbGwob3Bjb2RlOiBSdW50aW1lT3AsIHZtOiBWTTxKaXRPckFvdEJsb2NrPikge1xuICAgIEFQUEVORF9PUENPREVTLmV2YWx1YXRlKHZtLCBvcGNvZGUsIG9wY29kZS50eXBlKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==