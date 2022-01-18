import { RuntimeOp, OpcodeHeap } from '@glimmer/interfaces';
export declare class RuntimeOpImpl implements RuntimeOp {
    readonly heap: OpcodeHeap;
    offset: number;
    constructor(heap: OpcodeHeap);
    readonly size: number;
    readonly isMachine: 0 | 1;
    readonly type: number;
    readonly op1: number;
    readonly op2: number;
    readonly op3: number;
}
//# sourceMappingURL=opcode.d.ts.map