import { CompilerBuffer, Operand, MachineOp, Op, InstructionEncoder, OpcodeSize } from '@glimmer/interfaces';
export declare class InstructionEncoderImpl implements InstructionEncoder {
    readonly buffer: CompilerBuffer;
    constructor(buffer: CompilerBuffer);
    size: number;
    encode(type: MachineOp, machine: OpcodeSize.MACHINE_MASK, ...operands: Operand[]): void;
    encode(type: Op, machine: 0, ...operands: Operand[]): void;
    patch(position: number, target: number): void;
}
//# sourceMappingURL=encoder.d.ts.map