import { APPEND_OPCODES } from '../opcodes';

import { $pc, $ra, $fp, $sp } from '@glimmer/vm';
import { assert } from '@glimmer/util';
export function initializeRegisters() {
    return [0, -1, 0, 0];
}
export function initializeRegistersWithSP(sp) {
    return [0, -1, sp, 0];
}
export function initializeRegistersWithPC(pc) {
    return [pc, -1, 0, 0];
}
export default class LowLevelVM {
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
        (false && assert(typeof pc === 'number' && !isNaN(pc), 'pc is set to a number'));

        this.registers[$pc] = pc;
    }
    // Start a new frame and save $ra and $fp on the stack
    pushFrame() {
        this.stack.push(this.registers[$ra]);
        this.stack.push(this.registers[$fp]);
        this.registers[$fp] = this.registers[$sp] - 1;
    }
    // Restore $ra, $sp and $fp
    popFrame() {
        this.registers[$sp] = this.registers[$fp] - 1;
        this.registers[$ra] = this.stack.get(0);
        this.registers[$fp] = this.stack.get(1);
    }
    pushSmallFrame() {
        this.stack.push(this.registers[$ra]);
    }
    popSmallFrame() {
        this.registers[$ra] = this.stack.pop();
    }
    // Jump to an address in `program`
    goto(offset) {
        this.setPc(this.target(offset));
    }
    target(offset) {
        return this.registers[$pc] + offset - this.currentOpSize;
    }
    // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)
    call(handle) {
        (false && assert(handle < 0xffffffff, `Jumping to placehoder address`));

        this.registers[$ra] = this.registers[$pc];
        this.setPc(this.heap.getaddr(handle));
    }
    // Put a specific `program` address in $ra
    returnTo(offset) {
        this.registers[$ra] = this.target(offset);
    }
    // Return to the `program` address stored in $ra
    return() {
        this.setPc(this.registers[$ra]);
    }
    nextStatement() {
        let { registers, program } = this;
        let pc = registers[$pc];
        (false && assert(typeof pc === 'number', 'pc is a number'));

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
        this.registers[$pc] += operationSize;
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
        APPEND_OPCODES.evaluate(vm, opcode, opcode.type);
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2xvdy1sZXZlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxTQUFTLGNBQVQsUUFBK0IsWUFBL0I7O0FBR0EsU0FBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsUUFBb0QsYUFBcEQ7QUFDQSxTQUFTLE1BQVQsUUFBdUIsZUFBdkI7QUFTQSxPQUFNLFNBQVUsbUJBQVYsR0FBNkI7QUFDakMsV0FBTyxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsRUFBUSxDQUFSLEVBQVcsQ0FBWCxDQUFQO0FBQ0Q7QUFFRCxPQUFNLFNBQVUseUJBQVYsQ0FBb0MsRUFBcEMsRUFBOEM7QUFDbEQsV0FBTyxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsRUFBUSxFQUFSLEVBQVksQ0FBWixDQUFQO0FBQ0Q7QUFFRCxPQUFNLFNBQVUseUJBQVYsQ0FBb0MsRUFBcEMsRUFBOEM7QUFDbEQsV0FBTyxDQUFDLEVBQUQsRUFBSyxDQUFDLENBQU4sRUFBUyxDQUFULEVBQVksQ0FBWixDQUFQO0FBQ0Q7QUFhRCxlQUFjLE1BQU8sVUFBUCxDQUFpQjtBQUc3QixnQkFDUyxLQURULEVBRVMsSUFGVCxFQUdTLE9BSFQsRUFJUyxPQUpULEVBS1csU0FMWCxFQUt1QztBQUo5QixhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsT0FBQSxHQUFBLE9BQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0UsYUFBQSxTQUFBLEdBQUEsU0FBQTtBQVBKLGFBQUEsYUFBQSxHQUFnQixDQUFoQjtBQVFIO0FBRUosa0JBQWMsUUFBZCxFQUF1QztBQUNyQyxlQUFPLEtBQUssU0FBTCxDQUFlLFFBQWYsQ0FBUDtBQUNEO0FBRUQsaUJBQWEsUUFBYixFQUF3QyxLQUF4QyxFQUFxRDtBQUNuRCxhQUFLLFNBQUwsQ0FBZSxR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Q0wsaUJBQUssYUFBTCxDQUFtQixNQUFuQixFQUEyQixFQUEzQjtBQUNEO0FBQ0Y7QUFFRCxrQkFBYyxNQUFkLEVBQWlDLEVBQWpDLEVBQXNEO0FBQ3BELFlBQUksT0FBTyxTQUFYLEVBQXNCO0FBQ3BCLGlCQUFLLGVBQUwsQ0FBcUIsTUFBckI7QUFDRCxTQUZELE1BRU87QUFDTCxpQkFBSyxlQUFMLENBQXFCLE1BQXJCLEVBQTZCLEVBQTdCO0FBQ0Q7QUFDRjtBQUVELG9CQUFnQixNQUFoQixFQUFpQztBQUMvQixnQkFBUSxPQUFPLElBQWY7QUFDRSxpQkFBQSxDQUFBLENBQUEsZUFBQTtBQUNFLHVCQUFPLEtBQUssU0FBTCxFQUFQO0FBQ0YsaUJBQUEsQ0FBQSxDQUFBLGNBQUE7QUFDRSx1QkFBTyxLQUFLLFFBQUwsRUFBUDtBQUNGLGlCQUFBLENBQUEsQ0FBQSxrQkFBQTtBQUNFLHVCQUFPLEtBQUssSUFBTCxDQUFVLE9BQU8sR0FBakIsQ0FBUDtBQUNGLGlCQUFBLENBQUEsQ0FBQSxtQkFBQTtBQUNFLHVCQUFPLEtBQUssSUFBTCxDQUFVLEtBQUssS0FBTCxDQUFXLEdBQVgsRUFBVixDQUFQO0FBQ0YsaUJBQUEsQ0FBQSxDQUFBLFVBQUE7QUFDRSx1QkFBTyxLQUFLLElBQUwsQ0FBVSxPQUFPLEdBQWpCLENBQVA7QUFDRixpQkFBQSxDQUFBLENBQUEsWUFBQTtBQUNFLHVCQUFPLEtBQUssTUFBTCxFQUFQO0FBQ0YsaUJBQUEsQ0FBQSxDQUFBLGNBQUE7QUFDRSx1QkFBTyxLQUFLLFFBQUwsQ0FBYyxPQUFPLEdBQXJCLENBQVA7QUFkSjtBQWdCRDtBQUVELG9CQUFnQixNQUFoQixFQUFtQyxFQUFuQyxFQUF3RDtBQUN0RCx1QkFBZSxRQUFmLENBQXdCLEVBQXhCLEVBQTRCLE1BQTVCLEVBQW9DLE9BQU8sSUFBM0M7QUFDRDtBQTFJNEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBPcHRpb24sXG4gIFJ1bnRpbWVIZWFwLFxuICBNYWNoaW5lT3AsXG4gIFJ1bnRpbWVQcm9ncmFtLFxuICBSdW50aW1lT3AsXG4gIEppdE9yQW90QmxvY2ssXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQVBQRU5EX09QQ09ERVMgfSBmcm9tICcuLi9vcGNvZGVzJztcbmltcG9ydCBWTSBmcm9tICcuL2FwcGVuZCc7XG5pbXBvcnQgeyBERVZNT0RFIH0gZnJvbSAnQGdsaW1tZXIvbG9jYWwtZGVidWctZmxhZ3MnO1xuaW1wb3J0IHsgTWFjaGluZVJlZ2lzdGVyLCAkcGMsICRyYSwgJGZwLCAkc3AgfSBmcm9tICdAZ2xpbW1lci92bSc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBMb3dMZXZlbFJlZ2lzdGVycyB7XG4gIFtNYWNoaW5lUmVnaXN0ZXIucGNdOiBudW1iZXI7XG4gIFtNYWNoaW5lUmVnaXN0ZXIucmFdOiBudW1iZXI7XG4gIFtNYWNoaW5lUmVnaXN0ZXIuc3BdOiBudW1iZXI7XG4gIFtNYWNoaW5lUmVnaXN0ZXIuZnBdOiBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplUmVnaXN0ZXJzKCk6IExvd0xldmVsUmVnaXN0ZXJzIHtcbiAgcmV0dXJuIFswLCAtMSwgMCwgMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplUmVnaXN0ZXJzV2l0aFNQKHNwOiBudW1iZXIpOiBMb3dMZXZlbFJlZ2lzdGVycyB7XG4gIHJldHVybiBbMCwgLTEsIHNwLCAwXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVSZWdpc3RlcnNXaXRoUEMocGM6IG51bWJlcik6IExvd0xldmVsUmVnaXN0ZXJzIHtcbiAgcmV0dXJuIFtwYywgLTEsIDAsIDBdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrIHtcbiAgcHVzaCh2YWx1ZTogbnVtYmVyKTogdm9pZDtcbiAgZ2V0KHBvc2l0aW9uOiBudW1iZXIpOiBudW1iZXI7XG4gIHBvcCgpOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZXJucyB7XG4gIGRlYnVnQmVmb3JlKG9wY29kZTogUnVudGltZU9wKTogdW5rbm93bjtcbiAgZGVidWdBZnRlcihzdGF0ZTogdW5rbm93bik6IHZvaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvd0xldmVsVk0ge1xuICBwdWJsaWMgY3VycmVudE9wU2l6ZSA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHN0YWNrOiBTdGFjayxcbiAgICBwdWJsaWMgaGVhcDogUnVudGltZUhlYXAsXG4gICAgcHVibGljIHByb2dyYW06IFJ1bnRpbWVQcm9ncmFtLFxuICAgIHB1YmxpYyBleHRlcm5zOiBFeHRlcm5zLFxuICAgIHJlYWRvbmx5IHJlZ2lzdGVyczogTG93TGV2ZWxSZWdpc3RlcnNcbiAgKSB7fVxuXG4gIGZldGNoUmVnaXN0ZXIocmVnaXN0ZXI6IE1hY2hpbmVSZWdpc3Rlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJzW3JlZ2lzdGVyXTtcbiAgfVxuXG4gIGxvYWRSZWdpc3RlcihyZWdpc3RlcjogTWFjaGluZVJlZ2lzdGVyLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5yZWdpc3RlcnNbcmVnaXN0ZXJdID0gdmFsdWU7XG4gIH1cblxuICBzZXRQYyhwYzogbnVtYmVyKTogdm9pZCB7XG4gICAgYXNzZXJ0KHR5cGVvZiBwYyA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHBjKSwgJ3BjIGlzIHNldCB0byBhIG51bWJlcicpO1xuICAgIHRoaXMucmVnaXN0ZXJzWyRwY10gPSBwYztcbiAgfVxuXG4gIC8vIFN0YXJ0IGEgbmV3IGZyYW1lIGFuZCBzYXZlICRyYSBhbmQgJGZwIG9uIHRoZSBzdGFja1xuICBwdXNoRnJhbWUoKSB7XG4gICAgdGhpcy5zdGFjay5wdXNoKHRoaXMucmVnaXN0ZXJzWyRyYV0pO1xuICAgIHRoaXMuc3RhY2sucHVzaCh0aGlzLnJlZ2lzdGVyc1skZnBdKTtcbiAgICB0aGlzLnJlZ2lzdGVyc1skZnBdID0gdGhpcy5yZWdpc3RlcnNbJHNwXSAtIDE7XG4gIH1cblxuICAvLyBSZXN0b3JlICRyYSwgJHNwIGFuZCAkZnBcbiAgcG9wRnJhbWUoKSB7XG4gICAgdGhpcy5yZWdpc3RlcnNbJHNwXSA9IHRoaXMucmVnaXN0ZXJzWyRmcF0gLSAxO1xuICAgIHRoaXMucmVnaXN0ZXJzWyRyYV0gPSB0aGlzLnN0YWNrLmdldCgwKTtcbiAgICB0aGlzLnJlZ2lzdGVyc1skZnBdID0gdGhpcy5zdGFjay5nZXQoMSk7XG4gIH1cblxuICBwdXNoU21hbGxGcmFtZSgpIHtcbiAgICB0aGlzLnN0YWNrLnB1c2godGhpcy5yZWdpc3RlcnNbJHJhXSk7XG4gIH1cblxuICBwb3BTbWFsbEZyYW1lKCkge1xuICAgIHRoaXMucmVnaXN0ZXJzWyRyYV0gPSB0aGlzLnN0YWNrLnBvcCgpO1xuICB9XG5cbiAgLy8gSnVtcCB0byBhbiBhZGRyZXNzIGluIGBwcm9ncmFtYFxuICBnb3RvKG9mZnNldDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRQYyh0aGlzLnRhcmdldChvZmZzZXQpKTtcbiAgfVxuXG4gIHRhcmdldChvZmZzZXQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyc1skcGNdICsgb2Zmc2V0IC0gdGhpcy5jdXJyZW50T3BTaXplO1xuICB9XG5cbiAgLy8gU2F2ZSAkcGMgaW50byAkcmEsIHRoZW4ganVtcCB0byBhIG5ldyBhZGRyZXNzIGluIGBwcm9ncmFtYCAoamFsIGluIE1JUFMpXG4gIGNhbGwoaGFuZGxlOiBudW1iZXIpIHtcbiAgICBhc3NlcnQoaGFuZGxlIDwgMHhmZmZmZmZmZiwgYEp1bXBpbmcgdG8gcGxhY2Vob2RlciBhZGRyZXNzYCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyc1skcmFdID0gdGhpcy5yZWdpc3RlcnNbJHBjXTtcbiAgICB0aGlzLnNldFBjKHRoaXMuaGVhcC5nZXRhZGRyKGhhbmRsZSkpO1xuICB9XG5cbiAgLy8gUHV0IGEgc3BlY2lmaWMgYHByb2dyYW1gIGFkZHJlc3MgaW4gJHJhXG4gIHJldHVyblRvKG9mZnNldDogbnVtYmVyKSB7XG4gICAgdGhpcy5yZWdpc3RlcnNbJHJhXSA9IHRoaXMudGFyZ2V0KG9mZnNldCk7XG4gIH1cblxuICAvLyBSZXR1cm4gdG8gdGhlIGBwcm9ncmFtYCBhZGRyZXNzIHN0b3JlZCBpbiAkcmFcbiAgcmV0dXJuKCkge1xuICAgIHRoaXMuc2V0UGModGhpcy5yZWdpc3RlcnNbJHJhXSk7XG4gIH1cblxuICBuZXh0U3RhdGVtZW50KCk6IE9wdGlvbjxSdW50aW1lT3A+IHtcbiAgICBsZXQgeyByZWdpc3RlcnMsIHByb2dyYW0gfSA9IHRoaXM7XG5cbiAgICBsZXQgcGMgPSByZWdpc3RlcnNbJHBjXTtcblxuICAgIGFzc2VydCh0eXBlb2YgcGMgPT09ICdudW1iZXInLCAncGMgaXMgYSBudW1iZXInKTtcblxuICAgIGlmIChwYyA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFdlIGhhdmUgdG8gc2F2ZSBvZmYgdGhlIGN1cnJlbnQgb3BlcmF0aW9ucyBzaXplIHNvIHRoYXRcbiAgICAvLyB3aGVuIHdlIGRvIGEganVtcCB3ZSBjYW4gY2FsY3VsYXRlIHRoZSBjb3JyZWN0IG9mZnNldFxuICAgIC8vIHRvIHdoZXJlIHdlIGFyZSBnb2luZy4gV2UgY2FuJ3Qgc2ltcGx5IGFzayBmb3IgdGhlIHNpemVcbiAgICAvLyBpbiBhIGp1bXAgYmVjYXVzZSB3ZSBoYXZlIGhhdmUgYWxyZWFkeSBpbmNyZW1lbnRlZCB0aGVcbiAgICAvLyBwcm9ncmFtIGNvdW50ZXIgdG8gdGhlIG5leHQgaW5zdHJ1Y3Rpb24gcHJpb3IgdG8gZXhlY3V0aW5nLlxuICAgIGxldCBvcGNvZGUgPSBwcm9ncmFtLm9wY29kZShwYyk7XG4gICAgbGV0IG9wZXJhdGlvblNpemUgPSAodGhpcy5jdXJyZW50T3BTaXplID0gb3Bjb2RlLnNpemUpO1xuICAgIHRoaXMucmVnaXN0ZXJzWyRwY10gKz0gb3BlcmF0aW9uU2l6ZTtcblxuICAgIHJldHVybiBvcGNvZGU7XG4gIH1cblxuICBldmFsdWF0ZU91dGVyKG9wY29kZTogUnVudGltZU9wLCB2bTogVk08Sml0T3JBb3RCbG9jaz4pIHtcbiAgICBpZiAoREVWTU9ERSkge1xuICAgICAgbGV0IHtcbiAgICAgICAgZXh0ZXJuczogeyBkZWJ1Z0JlZm9yZSwgZGVidWdBZnRlciB9LFxuICAgICAgfSA9IHRoaXM7XG4gICAgICBsZXQgc3RhdGUgPSBkZWJ1Z0JlZm9yZShvcGNvZGUpO1xuICAgICAgdGhpcy5ldmFsdWF0ZUlubmVyKG9wY29kZSwgdm0pO1xuICAgICAgZGVidWdBZnRlcihzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZXZhbHVhdGVJbm5lcihvcGNvZGUsIHZtKTtcbiAgICB9XG4gIH1cblxuICBldmFsdWF0ZUlubmVyKG9wY29kZTogUnVudGltZU9wLCB2bTogVk08Sml0T3JBb3RCbG9jaz4pIHtcbiAgICBpZiAob3Bjb2RlLmlzTWFjaGluZSkge1xuICAgICAgdGhpcy5ldmFsdWF0ZU1hY2hpbmUob3Bjb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ldmFsdWF0ZVN5c2NhbGwob3Bjb2RlLCB2bSk7XG4gICAgfVxuICB9XG5cbiAgZXZhbHVhdGVNYWNoaW5lKG9wY29kZTogUnVudGltZU9wKSB7XG4gICAgc3dpdGNoIChvcGNvZGUudHlwZSkge1xuICAgICAgY2FzZSBNYWNoaW5lT3AuUHVzaEZyYW1lOlxuICAgICAgICByZXR1cm4gdGhpcy5wdXNoRnJhbWUoKTtcbiAgICAgIGNhc2UgTWFjaGluZU9wLlBvcEZyYW1lOlxuICAgICAgICByZXR1cm4gdGhpcy5wb3BGcmFtZSgpO1xuICAgICAgY2FzZSBNYWNoaW5lT3AuSW52b2tlU3RhdGljOlxuICAgICAgICByZXR1cm4gdGhpcy5jYWxsKG9wY29kZS5vcDEpO1xuICAgICAgY2FzZSBNYWNoaW5lT3AuSW52b2tlVmlydHVhbDpcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbCh0aGlzLnN0YWNrLnBvcCgpKTtcbiAgICAgIGNhc2UgTWFjaGluZU9wLkp1bXA6XG4gICAgICAgIHJldHVybiB0aGlzLmdvdG8ob3Bjb2RlLm9wMSk7XG4gICAgICBjYXNlIE1hY2hpbmVPcC5SZXR1cm46XG4gICAgICAgIHJldHVybiB0aGlzLnJldHVybigpO1xuICAgICAgY2FzZSBNYWNoaW5lT3AuUmV0dXJuVG86XG4gICAgICAgIHJldHVybiB0aGlzLnJldHVyblRvKG9wY29kZS5vcDEpO1xuICAgIH1cbiAgfVxuXG4gIGV2YWx1YXRlU3lzY2FsbChvcGNvZGU6IFJ1bnRpbWVPcCwgdm06IFZNPEppdE9yQW90QmxvY2s+KSB7XG4gICAgQVBQRU5EX09QQ09ERVMuZXZhbHVhdGUodm0sIG9wY29kZSwgb3Bjb2RlLnR5cGUpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9