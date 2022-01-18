export declare const enum ImmediateConstants {
    MAX_SMI = 1073741823,
    MIN_SMI = -1073741824,
    SIGN_BIT = -536870913,
    MAX_INT = 536870911,
    MIN_INT = -536870912,
    FALSE_HANDLE = 0,
    TRUE_HANDLE = 1,
    NULL_HANDLE = 2,
    UNDEFINED_HANDLE = 3,
    ENCODED_FALSE_HANDLE = 0,
    ENCODED_TRUE_HANDLE = 1,
    ENCODED_NULL_HANDLE = 2,
    ENCODED_UNDEFINED_HANDLE = 3
}
export declare function isHandle(value: number): boolean;
export declare function isNonPrimitiveHandle(value: number): boolean;
export declare function constants(...values: unknown[]): unknown[];
export declare function isSmallInt(value: number): boolean;
export declare function encodeNegative(num: number): number;
export declare function decodeNegative(num: number): number;
export declare function encodePositive(num: number): number;
export declare function decodePositive(num: number): number;
export declare function encodeHandle(num: number): number;
export declare function decodeHandle(num: number): number;
export declare function encodeImmediate(num: number): number;
export declare function decodeImmediate(num: number): number;
//# sourceMappingURL=immediate.d.ts.map