export declare type Getter<T, K extends keyof T> = (self: T) => T[K] | undefined;
export declare type Setter<T, K extends keyof T> = (self: T, value: T[K]) => void;
export declare function trackedData<T extends object, K extends keyof T>(key: K, initializer?: (this: T) => T[K]): {
    getter: Getter<T, K>;
    setter: Setter<T, K>;
};
//# sourceMappingURL=tracked-data.d.ts.map