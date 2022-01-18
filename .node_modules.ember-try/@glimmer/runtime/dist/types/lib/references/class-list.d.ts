import { Reference, Tag } from '@glimmer/reference';
import { Option } from '@glimmer/util';
export default class ClassListReference implements Reference<Option<string>> {
    private list;
    tag: Tag;
    constructor(list: Reference<unknown>[]);
    value(): Option<string>;
}
//# sourceMappingURL=class-list.d.ts.map