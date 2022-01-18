export { ALLOW_CYCLES, bump, CombinatorTag, combine, COMPUTE, CONSTANT_TAG, CONSTANT, ConstantTag, createTag, createUpdatableTag, CurrentTag, CURRENT_TAG, DIRTY_TAG as dirtyTag, DirtyableTag, EntityTag, INITIAL, isConstTag, Revision, Tag, UpdatableTag, UPDATE_TAG as updateTag, validateTag, valueForTag, VolatileTag, VOLATILE_TAG, VOLATILE, } from './lib/validators';
export { dirtyTagFor, tagFor, tagMetaFor, TagMeta } from './lib/meta';
export { beginTrackFrame, endTrackFrame, beginUntrackFrame, endUntrackFrame, resetTracking, consumeTag, isTracking, track, untrack, Cache, createCache, isConst, getValue, } from './lib/tracking';
export { trackedData } from './lib/tracked-data';
export { logTrackingStack, setTrackingTransactionEnv, runInTrackingTransaction, beginTrackingTransaction, endTrackingTransaction, deprecateMutationsInTrackingTransaction, } from './lib/debug';
//# sourceMappingURL=index.d.ts.map