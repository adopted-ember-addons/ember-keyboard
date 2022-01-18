import { DynamicScope, Dict } from '@glimmer/interfaces';
import { PathReference } from '@glimmer/reference';
export declare class DefaultDynamicScope implements DynamicScope {
    private bucket;
    constructor(bucket?: Dict<PathReference>);
    get(key: string): PathReference;
    set(key: string, reference: PathReference): PathReference;
    child(): DefaultDynamicScope;
}
//# sourceMappingURL=dynamic-scope.d.ts.map