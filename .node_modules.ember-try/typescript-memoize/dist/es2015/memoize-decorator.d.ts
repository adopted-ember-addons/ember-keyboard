export declare function Memoize(autoHashOrHashFn?: boolean | ((...args: any[]) => any)): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
export declare function MemoizeExpiring(duration: number, autoHashOrHashFn?: boolean | ((...args: any[]) => any)): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
