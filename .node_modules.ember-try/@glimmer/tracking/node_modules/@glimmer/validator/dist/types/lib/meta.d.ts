import { UpdatableTag, ConstantTag } from './validators';
export declare function dirtyTag<T>(obj: T, key: keyof T): void;
export declare function tagFor<T extends object>(obj: T, key: keyof T): UpdatableTag;
export declare function tagFor<T>(obj: T, key: string): ConstantTag;
export declare function updateTag<T>(obj: T, key: keyof T, newTag: UpdatableTag): UpdatableTag;
//# sourceMappingURL=meta.d.ts.map