import { Stack as WasmStack } from '@glimmer/low-level';
import { MachineRegister } from '@glimmer/vm';
import { LowLevelRegisters } from './low-level';
import { REGISTERS } from '../symbols';
export declare class InnerStack {
    private inner;
    private js;
    constructor(inner?: WasmStack, js?: unknown[]);
    slice(start?: number, end?: number): InnerStack;
    sliceInner<T = unknown>(start: number, end: number): T[];
    copy(from: number, to: number): void;
    write(pos: number, value: unknown): void;
    private writeJs;
    writeRaw(pos: number, value: number): void;
    get<T>(pos: number): T;
    reset(): void;
    readonly length: number;
}
export interface EvaluationStack {
    [REGISTERS]: LowLevelRegisters;
    push(value: unknown): void;
    pushNull(): void;
    pushRaw(value: number): void;
    dup(position?: MachineRegister): void;
    copy(from: number, to: number): void;
    pop<T>(n?: number): T;
    peek<T>(offset?: number): T;
    get<T>(offset: number, base?: number): T;
    set(value: unknown, offset: number, base?: number): void;
    slice(start: number, end: number): InnerStack;
    sliceArray<T = unknown>(start: number, end: number): T[];
    capture(items: number): unknown[];
    reset(): void;
    toArray(): unknown[];
}
export default class EvaluationStackImpl implements EvaluationStack {
    private stack;
    static restore(snapshot: unknown[]): EvaluationStack;
    readonly [REGISTERS]: LowLevelRegisters;
    constructor(stack: InnerStack, registers: LowLevelRegisters);
    push(value: unknown): void;
    pushRaw(value: number): void;
    pushNull(): void;
    dup(position?: number): void;
    copy(from: number, to: number): void;
    pop<T>(n?: number): T;
    peek<T>(offset?: number): T;
    get<T>(offset: number, base?: number): T;
    set(value: unknown, offset: number, base?: number): void;
    slice(start: number, end: number): InnerStack;
    sliceArray<T = unknown>(start: number, end: number): T[];
    capture(items: number): unknown[];
    reset(): void;
    toArray(): unknown[];
}
export declare const enum Type {
    NUMBER = 0,
    FLOAT = 1,
    STRING = 2,
    BOOLEAN_OR_VOID = 3,
    NEGATIVE = 4
}
export declare const enum Immediates {
    False = 3,
    True = 11,
    Null = 19,
    Undef = 27
}
//# sourceMappingURL=stack.d.ts.map