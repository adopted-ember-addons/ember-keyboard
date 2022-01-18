import { UpdatableTag, ConstantTag } from './validators';
export declare type TagMeta = Map<PropertyKey, UpdatableTag>;
export declare function dirtyTagFor<T extends object>(obj: T, key: keyof T | string | symbol, meta?: TagMeta): void;
export declare function tagMetaFor(obj: object): TagMeta;
export declare function tagFor<T extends object>(obj: T, key: keyof T | string | symbol, meta?: TagMeta): UpdatableTag | ConstantTag;
//# sourceMappingURL=meta.d.ts.map