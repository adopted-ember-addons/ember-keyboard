import { LowLevelVM, VM, UpdatingVM } from './vm';
import { Option, Slice as ListSlice } from '@glimmer/util';
import { Tag } from '@glimmer/reference';
import { RuntimeOp, Op, JitOrAotBlock, Maybe, Dict } from '@glimmer/interfaces';
import { InternalVM, InternalJitVM } from './vm/append';
export interface OpcodeJSON {
    type: number | string;
    guid?: Option<number>;
    deopted?: boolean;
    args?: string[];
    details?: Dict<Option<string>>;
    children?: OpcodeJSON[];
}
export declare type Operand1 = number;
export declare type Operand2 = number;
export declare type Operand3 = number;
export declare type Syscall = (vm: InternalVM<JitOrAotBlock>, opcode: RuntimeOp) => void;
export declare type JitSyscall = (vm: InternalJitVM, opcode: RuntimeOp) => void;
export declare type MachineOpcode = (vm: LowLevelVM, opcode: RuntimeOp) => void;
export declare type Evaluate = {
    syscall: true;
    evaluate: Syscall;
} | {
    syscall: false;
    evaluate: MachineOpcode;
};
export declare type DebugState = {
    pc: number;
    sp: number;
    type: number;
    isMachine: 0 | 1;
    size: number;
    params?: Maybe<Dict>;
    name?: string;
    state: unknown;
};
export declare class AppendOpcodes {
    private evaluateOpcode;
    add<Name extends Op>(name: Name, evaluate: Syscall): void;
    add<Name extends Op>(name: Name, evaluate: MachineOpcode, kind: 'machine'): void;
    add<Name extends Op>(name: Name, evaluate: JitSyscall, kind: 'jit'): void;
    debugBefore(vm: VM<JitOrAotBlock>, opcode: RuntimeOp): DebugState;
    debugAfter(vm: VM<JitOrAotBlock>, pre: DebugState): void;
    evaluate(vm: VM<JitOrAotBlock>, opcode: RuntimeOp, type: number): void;
}
export declare const APPEND_OPCODES: AppendOpcodes;
export declare abstract class AbstractOpcode {
    abstract type: string;
    _guid: number;
    constructor();
}
export declare abstract class UpdatingOpcode extends AbstractOpcode {
    abstract tag: Tag;
    next: Option<UpdatingOpcode>;
    prev: Option<UpdatingOpcode>;
    abstract evaluate(vm: UpdatingVM): void;
}
export declare type UpdatingOpSeq = ListSlice<UpdatingOpcode>;
//# sourceMappingURL=opcodes.d.ts.map