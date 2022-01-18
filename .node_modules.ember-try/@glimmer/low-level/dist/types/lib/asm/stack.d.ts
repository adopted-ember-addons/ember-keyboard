export declare type u64 = number;
export declare type u32 = number;
export declare type i32 = number;
export declare class Stack {
    private vec;
    constructor(vec?: u64[]);
    clone(): Stack;
    sliceFrom(start: u32): Stack;
    slice(start: u32, end: i32): Stack;
    copy(from: u32, to: u32): void;
    writeRaw(pos: u32, value: u64): void;
    getRaw(pos: u32): u32;
    reset(): void;
    len(): number;
}
export declare const enum PrimitiveType {
    NUMBER = 0,
    FLOAT = 1,
    STRING = 2,
    BOOLEAN_OR_VOID = 3,
    NEGATIVE = 4
}
//# sourceMappingURL=stack.d.ts.map