type ConvertValue = ((value: unknown) => number) | null | undefined;
export declare function compare(a: number, b: number): -1 | 0 | 1;
export declare function compareProp(a: object, b: object, propName: string, convertValue?: ConvertValue): -1 | 0 | 1;
export declare function reverseCompareProp(a: object, b: object, propName: string, convertValue?: ConvertValue): -1 | 0 | 1;
export {};
//# sourceMappingURL=sort.d.ts.map