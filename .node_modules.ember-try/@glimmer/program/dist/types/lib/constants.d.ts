import { SymbolTable, CompileTimeConstants, EMPTY_ARRAY, ConstantPool, RuntimeConstants } from '@glimmer/interfaces';
export declare const WELL_KNOWN_EMPTY_ARRAY_POSITION = 0;
export declare class WriteOnlyConstants implements CompileTimeConstants {
    protected strings: string[];
    protected arrays: number[][] | EMPTY_ARRAY;
    protected tables: SymbolTable[];
    protected handles: number[];
    protected resolved: unknown[];
    protected numbers: number[];
    protected others: unknown[];
    other(other: unknown): number;
    string(value: string): number;
    stringArray(strings: string[]): number;
    array(values: number[]): number;
    templateMeta(value: unknown): number;
    number(number: number): number;
    toPool(): ConstantPool;
}
export declare class RuntimeConstantsImpl implements RuntimeConstants {
    protected strings: string[];
    protected arrays: number[][] | EMPTY_ARRAY;
    protected handles: number[];
    protected numbers: number[];
    protected others: unknown[];
    constructor(pool: ConstantPool);
    getString(value: number): string;
    getNumber(value: number): number;
    getStringArray(value: number): string[];
    getArray(value: number): number[];
    getTemplateMeta<T>(s: number): T;
    getOther<T>(value: number): T;
}
export declare class Constants extends WriteOnlyConstants implements RuntimeConstants {
    constructor(pool?: ConstantPool);
    getNumber(value: number): number;
    getString(value: number): string;
    getStringArray(value: number): string[];
    getArray(value: number): number[];
    getTemplateMeta<T>(s: number): T;
    getOther<T>(value: number): T;
}
//# sourceMappingURL=constants.d.ts.map