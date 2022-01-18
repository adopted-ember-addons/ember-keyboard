import { Option, RuntimeHeap, RuntimeProgram, RuntimeOp, JitOrAotBlock } from '@glimmer/interfaces';
import VM from './append';
import { MachineRegister } from '@glimmer/vm';
export interface LowLevelRegisters {
    [MachineRegister.pc]: number;
    [MachineRegister.ra]: number;
    [MachineRegister.sp]: number;
    [MachineRegister.fp]: number;
}
export declare function initializeRegisters(): LowLevelRegisters;
export declare function initializeRegistersWithSP(sp: number): LowLevelRegisters;
export declare function initializeRegistersWithPC(pc: number): LowLevelRegisters;
export interface Stack {
    push(value: number): void;
    get(position: number): number;
    pop(): number;
}
export interface Externs {
    debugBefore(opcode: RuntimeOp): unknown;
    debugAfter(state: unknown): void;
}
export default class LowLevelVM {
    stack: Stack;
    heap: RuntimeHeap;
    program: RuntimeProgram;
    externs: Externs;
    readonly registers: LowLevelRegisters;
    currentOpSize: number;
    constructor(stack: Stack, heap: RuntimeHeap, program: RuntimeProgram, externs: Externs, registers: LowLevelRegisters);
    fetchRegister(register: MachineRegister): number;
    loadRegister(register: MachineRegister, value: number): void;
    setPc(pc: number): void;
    pushFrame(): void;
    popFrame(): void;
    pushSmallFrame(): void;
    popSmallFrame(): void;
    goto(offset: number): void;
    target(offset: number): number;
    call(handle: number): void;
    returnTo(offset: number): void;
    return(): void;
    nextStatement(): Option<RuntimeOp>;
    evaluateOuter(opcode: RuntimeOp, vm: VM<JitOrAotBlock>): void;
    evaluateInner(opcode: RuntimeOp, vm: VM<JitOrAotBlock>): void;
    evaluateMachine(opcode: RuntimeOp): void;
    evaluateSyscall(opcode: RuntimeOp, vm: VM<JitOrAotBlock>): void;
}
//# sourceMappingURL=low-level.d.ts.map