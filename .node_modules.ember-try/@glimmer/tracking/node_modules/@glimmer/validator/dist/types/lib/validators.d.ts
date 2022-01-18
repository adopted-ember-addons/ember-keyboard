declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
export declare type Revision = number;
export declare const CONSTANT: Revision;
export declare const INITIAL: Revision;
export declare const VOLATILE: Revision;
export declare function bump(): void;
export declare const COMPUTE: unique symbol;
export interface EntityTag<T> {
    [COMPUTE](): T;
}
export interface Tag extends EntityTag<Revision> {
}
export interface EntityTagged<T> {
    tag: EntityTag<T>;
}
export interface Tagged {
    tag: Tag;
}
/**
 * `value` receives a tag and returns an opaque Revision based on that tag. This
 * snapshot can then later be passed to `validate` with the same tag to
 * determine if the tag has changed at all since the time that `value` was
 * called.
 *
 * The current implementation returns the global revision count directly for
 * performance reasons. This is an implementation detail, and should not be
 * relied on directly by users of these APIs. Instead, Revisions should be
 * treated as if they are opaque/unknown, and should only be interacted with via
 * the `value`/`validate` API.
 *
 * @param tag
 */
export declare function value(_tag: Tag): Revision;
/**
 * `validate` receives a tag and a snapshot from a previous call to `value` with
 * the same tag, and determines if the tag is still valid compared to the
 * snapshot. If the tag's state has changed at all since then, `validate` will
 * return false, otherwise it will return true. This is used to determine if a
 * calculation related to the tags should be rerun.
 *
 * @param tag
 * @param snapshot
 */
export declare function validate(tag: Tag, snapshot: Revision): boolean;
/**
 * This enum represents all of the possible tag types for the monomorphic tag class.
 * Other custom tag classes can exist, such as CurrentTag and VolatileTag, but for
 * performance reasons, any type of tag that is meant to be used frequently should
 * be added to the monomorphic tag.
 */
declare const enum MonomorphicTagTypes {
    Dirtyable = 0,
    Updatable = 1,
    Combinator = 2,
    Constant = 3
}
declare const TYPE: unique symbol;
export declare let ALLOW_CYCLES: WeakSet<UpdatableTag>;
interface MonomorphicTagBase<T extends MonomorphicTagTypes> extends Tag {
    [TYPE]: T;
}
export interface DirtyableTag extends MonomorphicTagBase<MonomorphicTagTypes.Dirtyable> {
}
export interface UpdatableTag extends MonomorphicTagBase<MonomorphicTagTypes.Updatable> {
}
export interface CombinatorTag extends MonomorphicTagBase<MonomorphicTagTypes.Combinator> {
}
export interface ConstantTag extends MonomorphicTagBase<MonomorphicTagTypes.Constant> {
}
interface MonomorphicTagMapping {
    [MonomorphicTagTypes.Dirtyable]: DirtyableTag;
    [MonomorphicTagTypes.Updatable]: UpdatableTag;
    [MonomorphicTagTypes.Combinator]: CombinatorTag;
    [MonomorphicTagTypes.Constant]: ConstantTag;
}
declare type MonomorphicTag = UnionToIntersection<MonomorphicTagMapping[MonomorphicTagTypes]>;
declare type MonomorphicTagType = UnionToIntersection<MonomorphicTagTypes>;
declare class MonomorphicTagImpl implements MonomorphicTag {
    private revision;
    private lastChecked;
    private lastValue;
    private isUpdating;
    private subtag;
    private subtags;
    [TYPE]: MonomorphicTagType;
    constructor(type: MonomorphicTagTypes);
    [COMPUTE](): Revision;
    static update(_tag: UpdatableTag, subtag: Tag): void;
    static dirty(tag: DirtyableTag | UpdatableTag): void;
}
export declare const dirty: typeof MonomorphicTagImpl.dirty;
export declare const update: typeof MonomorphicTagImpl.update;
export declare function createTag(): DirtyableTag;
export declare function createUpdatableTag(): UpdatableTag;
export declare const CONSTANT_TAG: ConstantTag;
export declare function isConst({ tag }: Tagged): boolean;
export declare function isConstTag(tag: Tag): tag is ConstantTag;
declare class VolatileTag implements Tag {
    [COMPUTE](): number;
}
export declare const VOLATILE_TAG: VolatileTag;
declare class CurrentTag implements CurrentTag {
    [COMPUTE](): number;
}
export declare const CURRENT_TAG: CurrentTag;
export declare function combine(tags: Tag[]): Tag;
export declare function createCombinatorTag(tags: Tag[]): Tag;
export {};
//# sourceMappingURL=validators.d.ts.map