export declare type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export declare type AnyKey = keyof any;
export declare type Indexable = Record<AnyKey, unknown>;
export declare function indexable<T extends object>(input: T): T & Indexable;
export declare const symbol: (key: string) => any;
export declare const symbolFor: (key: string) => any;
export declare function getGlobal(): Indexable;
export declare function unwrap<T>(val: T | null | undefined): T;
//# sourceMappingURL=utils.d.ts.map