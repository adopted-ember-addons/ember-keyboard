import { Option } from '@glimmer/interfaces';
import { CachedReference, PathReference, Tag } from '@glimmer/reference';
export declare class ConcatReference extends CachedReference<Option<string>> {
    private parts;
    tag: Tag;
    constructor(parts: Array<PathReference<unknown>>);
    protected compute(): Option<string>;
}
//# sourceMappingURL=concat.d.ts.map