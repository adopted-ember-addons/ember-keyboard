export declare type Revision = number;
export declare const CONSTANT: Revision;
export declare const INITIAL: Revision;
export declare const VOLATILE: Revision;
export declare function bump(): void;
export declare const COMPUTE: unique symbol;
export interface EntityTag<T> {
    [COMPUTE](): T;
}
export declare type Tag = EntityTag<Revision>;
/**
 * `value` receives a tag and returns an opaque Revision based on that tag. This
 * snapshot can then later be passed to `validate` with the same tag to
 * determine if the tag has changed at all since the time that `value` was
 * called.
 *
 * @param tag
 */
export declare function valueForTag(tag: Tag): Revision;
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
export declare function validateTag(tag: Tag, snapshot: Revision): boolean;
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
export declare let ALLOW_CYCLES: WeakMap<Tag, boolean> | undefined;
interface MonomorphicTagBase<T extends MonomorphicTagTypes> extends Tag {
    [TYPE]: T;
}
export declare type DirtyableTag = MonomorphicTagBase<MonomorphicTagTypes.Dirtyable>;
export declare type UpdatableTag = MonomorphicTagBase<MonomorphicTagTypes.Updatable>;
export declare type CombinatorTag = MonomorphicTagBase<MonomorphicTagTypes.Combinator>;
export declare type ConstantTag = MonomorphicTagBase<MonomorphicTagTypes.Constant>;
declare class MonomorphicTagImpl<T extends MonomorphicTagTypes = MonomorphicTagTypes> {
    static combine(tags: Tag[]): Tag;
    private revision;
    private lastChecked;
    private lastValue;
    private isUpdating;
    private subtag;
    private subtagBufferCache;
    [TYPE]: T;
    constructor(type: T);
    [COMPUTE](): Revision;
    static updateTag(_tag: UpdatableTag, _subtag: Tag): void;
    static dirtyTag(tag: DirtyableTag | UpdatableTag, disableConsumptionAssertion?: boolean): void;
}
export declare const DIRTY_TAG: typeof MonomorphicTagImpl.dirtyTag;
export declare const UPDATE_TAG: typeof MonomorphicTagImpl.updateTag;
export declare function createTag(): DirtyableTag;
export declare function createUpdatableTag(): UpdatableTag;
export declare const CONSTANT_TAG: ConstantTag;
export declare function isConstTag(tag: Tag): tag is ConstantTag;
export declare class VolatileTag implements Tag {
    [COMPUTE](): Revision;
}
export declare const VOLATILE_TAG: VolatileTag;
export declare class CurrentTag implements CurrentTag {
    [COMPUTE](): Revision;
}
export declare const CURRENT_TAG: CurrentTag;
export declare const combine: typeof MonomorphicTagImpl.combine;
export {};
//# sourceMappingURL=validators.d.ts.map