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

function initializeRegisters() {
    return [0, -1, 0, 0];
}
function initializeRegistersWithSP(sp) {
    return [0, -1, sp, 0];
}
function initializeRegistersWithPC(pc) {
    return [pc, -1, 0, 0];
}
class LowLevelVM {
    constructor(stack, heap, program, externs, registers) {
        this.stack = stack;
        this.heap = heap;
        this.program = program;
        this.externs = externs;
        this.registers = registers;
        this.currentOpSize = 0;
    }
    fetchRegister(register) {
        return this.registers[register];
    }
    loadRegister(register, value) {
        this.registers[register] = value;
    }
    setPc(pc) {
        false && (0, _util.assert)(typeof pc === 'number' && !isNaN(pc), 'pc is set to a number');

        this.registers[_vm.$pc] = pc;
    }
    // Start a new frame and save $ra and $fp on the stack
    pushFrame() {
        this.stack.push(this.registers[_vm.$ra]);
        this.stack.push(this.registers[_vm.$fp]);
        this.registers[_vm.$fp] = this.registers[_vm.$sp] - 1;
    }
    // Restore $ra, $sp and $fp
    popFrame() {
        this.registers[_vm.$sp] = this.registers[_vm.$fp] - 1;
        this.registers[_vm.$ra] = this.stack.get(0);
        this.registers[_vm.$fp] = this.stack.get(1);
    }
    pushSmallFrame() {
        this.stack.push(this.registers[_vm.$ra]);
    }
    popSmallFrame() {
        this.registers[_vm.$ra] = this.stack.pop();
    }
    // Jump to an address in `program`
    goto(offset) {
        this.setPc(this.target(offset));
    }
    target(offset) {
        return this.registers[_vm.$pc] + offset - this.currentOpSize;
    }
    // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)
    call(handle) {
        false && (0, _util.assert)(handle < 0xffffffff, `Jumping to placehoder address`);

        this.registers[_vm.$ra] = this.registers[_vm.$pc];
        this.setPc(this.heap.getaddr(handle));
    }
    // Put a specific `program` address in $ra
    returnTo(offset) {
        this.registers[_vm.$ra] = this.target(offset);
    }
    // Return to the `program` address stored in $ra
    return() {
        this.setPc(this.registers[_vm.$ra]);
    }
    nextStatement() {
        let { registers, program } = this;
        let pc = registers[_vm.$pc];
        false && (0, _util.assert)(typeof pc === 'number', 'pc is a number');

        if (pc === -1) {
            return null;
        }
        // We have to save off the current operations size so that
        // when we do a jump we can calculate the correct offset
        // to where we are going. We can't simply ask for the size
        // in a jump because we have have already incremented the
        // program counter to the next instruction prior to executing.
        let opcode = program.opcode(pc);
        let operationSize = this.currentOpSize = opcode.size;
        this.registers[_vm.$pc] += operationSize;
        return opcode;
    }
    evaluateOuter(opcode, vm) {
        if (false) {
            let { externs: { debugBefore, debugAfter } } = this;
            let state = debugBefore(opcode);
            this.evaluateInner(opcode, vm);
            debugAfter(state);
        } else {
            this.evaluateInner(opcode, vm);
        }
    }
    evaluateInner(opcode, vm) {
        if (opcode.isMachine) {
            this.evaluateMachine(opcode);
        } else {
            this.evaluateSyscall(opcode, vm);
        }
    }
    evaluateMachine(opcode) {
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
    }
    evaluateSyscall(opcode, vm) {
        _opcodes.APPEND_OPCODES.evaluate(vm, opcode, opcode.type);
    }
}
exports.default = LowLevelVM;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2xvdy1sZXZlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQXFCTSxtQixHQUFBLG1CO1FBSUEseUIsR0FBQSx5QjtRQUlBLHlCLEdBQUEseUI7Ozs7QUFsQk47O0FBQ0E7O0FBU00sU0FBQSxtQkFBQSxHQUE2QjtBQUNqQyxXQUFPLENBQUEsQ0FBQSxFQUFJLENBQUosQ0FBQSxFQUFBLENBQUEsRUFBUCxDQUFPLENBQVA7QUFDRDtBQUVLLFNBQUEseUJBQUEsQ0FBQSxFQUFBLEVBQThDO0FBQ2xELFdBQU8sQ0FBQSxDQUFBLEVBQUksQ0FBSixDQUFBLEVBQUEsRUFBQSxFQUFQLENBQU8sQ0FBUDtBQUNEO0FBRUssU0FBQSx5QkFBQSxDQUFBLEVBQUEsRUFBOEM7QUFDbEQsV0FBTyxDQUFBLEVBQUEsRUFBSyxDQUFMLENBQUEsRUFBQSxDQUFBLEVBQVAsQ0FBTyxDQUFQO0FBQ0Q7QUFhYSxNQUFBLFVBQUEsQ0FBaUI7QUFHN0IsZ0JBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFNBQUEsRUFLdUM7QUFKOUIsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0EsYUFBQSxPQUFBLEdBQUEsT0FBQTtBQUNFLGFBQUEsU0FBQSxHQUFBLFNBQUE7QUFQSixhQUFBLGFBQUEsR0FBQSxDQUFBO0FBUUg7QUFFSixrQkFBQSxRQUFBLEVBQXVDO0FBQ3JDLGVBQU8sS0FBQSxTQUFBLENBQVAsUUFBTyxDQUFQO0FBQ0Q7QUFFRCxpQkFBQSxRQUFBLEVBQUEsS0FBQSxFQUFxRDtBQUNuRCxhQUFBLFNBQUEsQ0FBQSxRQUFBLElBQUEsS0FBQTtBQUNEO0FBRUQsVUFBQSxFQUFBLEVBQWdCO0FBQUEsaUJBQ2Qsa0JBQU8sT0FBQSxFQUFBLEtBQUEsUUFBQSxJ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RDtBQUNwRCxZQUFJLE9BQUosU0FBQSxFQUFzQjtBQUNwQixpQkFBQSxlQUFBLENBQUEsTUFBQTtBQURGLFNBQUEsTUFFTztBQUNMLGlCQUFBLGVBQUEsQ0FBQSxNQUFBLEVBQUEsRUFBQTtBQUNEO0FBQ0Y7QUFFRCxvQkFBQSxNQUFBLEVBQWlDO0FBQy9CLGdCQUFRLE9BQVIsSUFBQTtBQUNFLGlCQUFBLENBQUEsQ0FBQSxlQUFBO0FBQ0UsdUJBQU8sS0FBUCxTQUFPLEVBQVA7QUFDRixpQkFBQSxDQUFBLENBQUEsY0FBQTtBQUNFLHVCQUFPLEtBQVAsUUFBTyxFQUFQO0FBQ0YsaUJBQUEsQ0FBQSxDQUFBLGtCQUFBO0FBQ0UsdUJBQU8sS0FBQSxJQUFBLENBQVUsT0FBakIsR0FBTyxDQUFQO0FBQ0YsaUJBQUEsQ0FBQSxDQUFBLG1CQUFBO0FBQ0UsdUJBQU8sS0FBQSxJQUFBLENBQVUsS0FBQSxLQUFBLENBQWpCLEdBQWlCLEVBQVYsQ0FBUDtBQUNGLGlCQUFBLENBQUEsQ0FBQSxVQUFBO0FBQ0UsdUJBQU8sS0FBQSxJQUFBLENBQVUsT0FBakIsR0FBTyxDQUFQO0FBQ0YsaUJBQUEsQ0FBQSxDQUFBLFlBQUE7QUFDRSx1QkFBTyxLQUFQLE1BQU8sRUFBUDtBQUNGLGlCQUFBLENBQUEsQ0FBQSxjQUFBO0FBQ0UsdUJBQU8sS0FBQSxRQUFBLENBQWMsT0FBckIsR0FBTyxDQUFQO0FBZEo7QUFnQkQ7QUFFRCxvQkFBQSxNQUFBLEVBQUEsRUFBQSxFQUF3RDtBQUN0RCxnQ0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLE1BQUEsRUFBb0MsT0FBcEMsSUFBQTtBQUNEO0FBMUk0QjtrQkFBakIsVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIE9wdGlvbixcbiAgUnVudGltZUhlYXAsXG4gIE1hY2hpbmVPcCxcbiAgUnVudGltZVByb2dyYW0sXG4gIFJ1bnRpbWVPcCxcbiAgSml0T3JBb3RCbG9jayxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUyB9IGZyb20gJy4uL29wY29kZXMnO1xuaW1wb3J0IFZNIGZyb20gJy4vYXBwZW5kJztcbmltcG9ydCB7IERFVk1PREUgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5pbXBvcnQgeyBNYWNoaW5lUmVnaXN0ZXIsICRwYywgJHJhLCAkZnAsICRzcCB9IGZyb20gJ0BnbGltbWVyL3ZtJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExvd0xldmVsUmVnaXN0ZXJzIHtcbiAgW01hY2hpbmVSZWdpc3Rlci5wY106IG51bWJlcjtcbiAgW01hY2hpbmVSZWdpc3Rlci5yYV06IG51bWJlcjtcbiAgW01hY2hpbmVSZWdpc3Rlci5zcF06IG51bWJlcjtcbiAgW01hY2hpbmVSZWdpc3Rlci5mcF06IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVSZWdpc3RlcnMoKTogTG93TGV2ZWxSZWdpc3RlcnMge1xuICByZXR1cm4gWzAsIC0xLCAwLCAwXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVSZWdpc3RlcnNXaXRoU1Aoc3A6IG51bWJlcik6IExvd0xldmVsUmVnaXN0ZXJzIHtcbiAgcmV0dXJuIFswLCAtMSwgc3AsIDBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZVJlZ2lzdGVyc1dpdGhQQyhwYzogbnVtYmVyKTogTG93TGV2ZWxSZWdpc3RlcnMge1xuICByZXR1cm4gW3BjLCAtMSwgMCwgMF07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhY2sge1xuICBwdXNoKHZhbHVlOiBudW1iZXIpOiB2b2lkO1xuICBnZXQocG9zaXRpb246IG51bWJlcik6IG51bWJlcjtcbiAgcG9wKCk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeHRlcm5zIHtcbiAgZGVidWdCZWZvcmUob3Bjb2RlOiBSdW50aW1lT3ApOiB1bmtub3duO1xuICBkZWJ1Z0FmdGVyKHN0YXRlOiB1bmtub3duKTogdm9pZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG93TGV2ZWxWTSB7XG4gIHB1YmxpYyBjdXJyZW50T3BTaXplID0gMDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgc3RhY2s6IFN0YWNrLFxuICAgIHB1YmxpYyBoZWFwOiBSdW50aW1lSGVhcCxcbiAgICBwdWJsaWMgcHJvZ3JhbTogUnVudGltZVByb2dyYW0sXG4gICAgcHVibGljIGV4dGVybnM6IEV4dGVybnMsXG4gICAgcmVhZG9ubHkgcmVnaXN0ZXJzOiBMb3dMZXZlbFJlZ2lzdGVyc1xuICApIHt9XG5cbiAgZmV0Y2hSZWdpc3RlcihyZWdpc3RlcjogTWFjaGluZVJlZ2lzdGVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RlcnNbcmVnaXN0ZXJdO1xuICB9XG5cbiAgbG9hZFJlZ2lzdGVyKHJlZ2lzdGVyOiBNYWNoaW5lUmVnaXN0ZXIsIHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLnJlZ2lzdGVyc1tyZWdpc3Rlcl0gPSB2YWx1ZTtcbiAgfVxuXG4gIHNldFBjKHBjOiBudW1iZXIpOiB2b2lkIHtcbiAgICBhc3NlcnQodHlwZW9mIHBjID09PSAnbnVtYmVyJyAmJiAhaXNOYU4ocGMpLCAncGMgaXMgc2V0IHRvIGEgbnVtYmVyJyk7XG4gICAgdGhpcy5yZWdpc3RlcnNbJHBjXSA9IHBjO1xuICB9XG5cbiAgLy8gU3RhcnQgYSBuZXcgZnJhbWUgYW5kIHNhdmUgJHJhIGFuZCAkZnAgb24gdGhlIHN0YWNrXG4gIHB1c2hGcmFtZSgpIHtcbiAgICB0aGlzLnN0YWNrLnB1c2godGhpcy5yZWdpc3RlcnNbJHJhXSk7XG4gICAgdGhpcy5zdGFjay5wdXNoKHRoaXMucmVnaXN0ZXJzWyRmcF0pO1xuICAgIHRoaXMucmVnaXN0ZXJzWyRmcF0gPSB0aGlzLnJlZ2lzdGVyc1skc3BdIC0gMTtcbiAgfVxuXG4gIC8vIFJlc3RvcmUgJHJhLCAkc3AgYW5kICRmcFxuICBwb3BGcmFtZSgpIHtcbiAgICB0aGlzLnJlZ2lzdGVyc1skc3BdID0gdGhpcy5yZWdpc3RlcnNbJGZwXSAtIDE7XG4gICAgdGhpcy5yZWdpc3RlcnNbJHJhXSA9IHRoaXMuc3RhY2suZ2V0KDApO1xuICAgIHRoaXMucmVnaXN0ZXJzWyRmcF0gPSB0aGlzLnN0YWNrLmdldCgxKTtcbiAgfVxuXG4gIHB1c2hTbWFsbEZyYW1lKCkge1xuICAgIHRoaXMuc3RhY2sucHVzaCh0aGlzLnJlZ2lzdGVyc1skcmFdKTtcbiAgfVxuXG4gIHBvcFNtYWxsRnJhbWUoKSB7XG4gICAgdGhpcy5yZWdpc3RlcnNbJHJhXSA9IHRoaXMuc3RhY2sucG9wKCk7XG4gIH1cblxuICAvLyBKdW1wIHRvIGFuIGFkZHJlc3MgaW4gYHByb2dyYW1gXG4gIGdvdG8ob2Zmc2V0OiBudW1iZXIpIHtcbiAgICB0aGlzLnNldFBjKHRoaXMudGFyZ2V0KG9mZnNldCkpO1xuICB9XG5cbiAgdGFyZ2V0KG9mZnNldDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJzWyRwY10gKyBvZmZzZXQgLSB0aGlzLmN1cnJlbnRPcFNpemU7XG4gIH1cblxuICAvLyBTYXZlICRwYyBpbnRvICRyYSwgdGhlbiBqdW1wIHRvIGEgbmV3IGFkZHJlc3MgaW4gYHByb2dyYW1gIChqYWwgaW4gTUlQUylcbiAgY2FsbChoYW5kbGU6IG51bWJlcikge1xuICAgIGFzc2VydChoYW5kbGUgPCAweGZmZmZmZmZmLCBgSnVtcGluZyB0byBwbGFjZWhvZGVyIGFkZHJlc3NgKTtcblxuICAgIHRoaXMucmVnaXN0ZXJzWyRyYV0gPSB0aGlzLnJlZ2lzdGVyc1skcGNdO1xuICAgIHRoaXMuc2V0UGModGhpcy5oZWFwLmdldGFkZHIoaGFuZGxlKSk7XG4gIH1cblxuICAvLyBQdXQgYSBzcGVjaWZpYyBgcHJvZ3JhbWAgYWRkcmVzcyBpbiAkcmFcbiAgcmV0dXJuVG8ob2Zmc2V0OiBudW1iZXIpIHtcbiAgICB0aGlzLnJlZ2lzdGVyc1skcmFdID0gdGhpcy50YXJnZXQob2Zmc2V0KTtcbiAgfVxuXG4gIC8vIFJldHVybiB0byB0aGUgYHByb2dyYW1gIGFkZHJlc3Mgc3RvcmVkIGluICRyYVxuICByZXR1cm4oKSB7XG4gICAgdGhpcy5zZXRQYyh0aGlzLnJlZ2lzdGVyc1skcmFdKTtcbiAgfVxuXG4gIG5leHRTdGF0ZW1lbnQoKTogT3B0aW9uPFJ1bnRpbWVPcD4ge1xuICAgIGxldCB7IHJlZ2lzdGVycywgcHJvZ3JhbSB9ID0gdGhpcztcblxuICAgIGxldCBwYyA9IHJlZ2lzdGVyc1skcGNdO1xuXG4gICAgYXNzZXJ0KHR5cGVvZiBwYyA9PT0gJ251bWJlcicsICdwYyBpcyBhIG51bWJlcicpO1xuXG4gICAgaWYgKHBjID09PSAtMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2UgaGF2ZSB0byBzYXZlIG9mZiB0aGUgY3VycmVudCBvcGVyYXRpb25zIHNpemUgc28gdGhhdFxuICAgIC8vIHdoZW4gd2UgZG8gYSBqdW1wIHdlIGNhbiBjYWxjdWxhdGUgdGhlIGNvcnJlY3Qgb2Zmc2V0XG4gICAgLy8gdG8gd2hlcmUgd2UgYXJlIGdvaW5nLiBXZSBjYW4ndCBzaW1wbHkgYXNrIGZvciB0aGUgc2l6ZVxuICAgIC8vIGluIGEganVtcCBiZWNhdXNlIHdlIGhhdmUgaGF2ZSBhbHJlYWR5IGluY3JlbWVudGVkIHRoZVxuICAgIC8vIHByb2dyYW0gY291bnRlciB0byB0aGUgbmV4dCBpbnN0cnVjdGlvbiBwcmlvciB0byBleGVjdXRpbmcuXG4gICAgbGV0IG9wY29kZSA9IHByb2dyYW0ub3Bjb2RlKHBjKTtcbiAgICBsZXQgb3BlcmF0aW9uU2l6ZSA9ICh0aGlzLmN1cnJlbnRPcFNpemUgPSBvcGNvZGUuc2l6ZSk7XG4gICAgdGhpcy5yZWdpc3RlcnNbJHBjXSArPSBvcGVyYXRpb25TaXplO1xuXG4gICAgcmV0dXJuIG9wY29kZTtcbiAgfVxuXG4gIGV2YWx1YXRlT3V0ZXIob3Bjb2RlOiBSdW50aW1lT3AsIHZtOiBWTTxKaXRPckFvdEJsb2NrPikge1xuICAgIGlmIChERVZNT0RFKSB7XG4gICAgICBsZXQge1xuICAgICAgICBleHRlcm5zOiB7IGRlYnVnQmVmb3JlLCBkZWJ1Z0FmdGVyIH0sXG4gICAgICB9ID0gdGhpcztcbiAgICAgIGxldCBzdGF0ZSA9IGRlYnVnQmVmb3JlKG9wY29kZSk7XG4gICAgICB0aGlzLmV2YWx1YXRlSW5uZXIob3Bjb2RlLCB2bSk7XG4gICAgICBkZWJ1Z0FmdGVyKHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ldmFsdWF0ZUlubmVyKG9wY29kZSwgdm0pO1xuICAgIH1cbiAgfVxuXG4gIGV2YWx1YXRlSW5uZXIob3Bjb2RlOiBSdW50aW1lT3AsIHZtOiBWTTxKaXRPckFvdEJsb2NrPikge1xuICAgIGlmIChvcGNvZGUuaXNNYWNoaW5lKSB7XG4gICAgICB0aGlzLmV2YWx1YXRlTWFjaGluZShvcGNvZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmV2YWx1YXRlU3lzY2FsbChvcGNvZGUsIHZtKTtcbiAgICB9XG4gIH1cblxuICBldmFsdWF0ZU1hY2hpbmUob3Bjb2RlOiBSdW50aW1lT3ApIHtcbiAgICBzd2l0Y2ggKG9wY29kZS50eXBlKSB7XG4gICAgICBjYXNlIE1hY2hpbmVPcC5QdXNoRnJhbWU6XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2hGcmFtZSgpO1xuICAgICAgY2FzZSBNYWNoaW5lT3AuUG9wRnJhbWU6XG4gICAgICAgIHJldHVybiB0aGlzLnBvcEZyYW1lKCk7XG4gICAgICBjYXNlIE1hY2hpbmVPcC5JbnZva2VTdGF0aWM6XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGwob3Bjb2RlLm9wMSk7XG4gICAgICBjYXNlIE1hY2hpbmVPcC5JbnZva2VWaXJ0dWFsOlxuICAgICAgICByZXR1cm4gdGhpcy5jYWxsKHRoaXMuc3RhY2sucG9wKCkpO1xuICAgICAgY2FzZSBNYWNoaW5lT3AuSnVtcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ290byhvcGNvZGUub3AxKTtcbiAgICAgIGNhc2UgTWFjaGluZU9wLlJldHVybjpcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0dXJuKCk7XG4gICAgICBjYXNlIE1hY2hpbmVPcC5SZXR1cm5UbzpcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0dXJuVG8ob3Bjb2RlLm9wMSk7XG4gICAgfVxuICB9XG5cbiAgZXZhbHVhdGVTeXNjYWxsKG9wY29kZTogUnVudGltZU9wLCB2bTogVk08Sml0T3JBb3RCbG9jaz4pIHtcbiAgICBBUFBFTkRfT1BDT0RFUy5ldmFsdWF0ZSh2bSwgb3Bjb2RlLCBvcGNvZGUudHlwZSk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=