import FSTree = require('fs-tree-diff');
/**
 * Create a new patch that achieves the same outcome as if the patches from
 * list 1 were applied and then the patches from list2 were applied. In some
 * cases this means we can efficiently skip doing some work in one or both of
 * the lists.
 *
 * It is assumed that neither list contains more than one operation per file.
 *
 * If both lists patch the same file, the following resolution table is used:
 * * `3` - both patches are kept.
 * * `2` - the patch from list 2 is kept.
 * * `1` - the patch from list 1 is kept.
 * * `0` - both entries are dropped.
 * * `-` - not applicable
 * * `?` - this is weird maybe it should be an error
 *
 * TODO: This should probably live in `fs-tree-diff`.
 *
 * list1↓   | `unlink` | `create` | `change` | `rmdir` | `mkdir`
 * ---------|----------|----------|----------|---------|---------
 * `unlink` |     2    |     3    |     1    |    -    |    -
 * `create` |     0    |     2    |     1    |    -    |    -
 * `change` |     2    |     1?   |     2    |    -    |    -
 * `rmdir`  |     -    |     -    |     -    |    2    |    3
 * `mkdir`  |     -    |     -    |     -    |    0    |    2
 */
declare function addPatches(list1: FSTree.Patch, list2: FSTree.Patch): FSTree.Patch;
export = addPatches;
//# sourceMappingURL=addPatches.d.ts.map