import { Tag } from './validators';
export declare function track(callback: () => void): Tag;
export declare function consume(tag: Tag): void;
export declare const EPOCH: import("./validators").DirtyableTag;
export declare type Getter<T, K extends keyof T> = (self: T) => T[K] | undefined;
export declare type Setter<T, K extends keyof T> = (self: T, value: T[K]) => void;
export declare function trackedData<T extends object, K extends keyof T>(key: K, initializer?: () => T[K]): {
    getter: Getter<T, K>;
    setter: Setter<T, K>;
};
//# sourceMappingURL=tracking.d.ts.map