import { Option } from '@glimmer/interfaces';
import { ReferenceCache, Tag } from '@glimmer/reference';
import { UpdatingOpcode } from '../../opcodes';
import { UpdatingVM } from '../../vm';
export declare class Assert extends UpdatingOpcode {
    static initialize(cache: ReferenceCache<unknown>): Assert;
    type: string;
    tag: Tag;
    private cache;
    constructor(cache: ReferenceCache<unknown>);
    evaluate(vm: UpdatingVM): void;
}
export declare class JumpIfNotModifiedOpcode extends UpdatingOpcode {
    private target;
    type: string;
    tag: Tag;
    private lastRevision;
    constructor(tag: Tag, target: LabelOpcode);
    evaluate(vm: UpdatingVM): void;
    didModify(): void;
}
export declare class DidModifyOpcode extends UpdatingOpcode {
    private target;
    type: string;
    tag: Tag;
    constructor(target: JumpIfNotModifiedOpcode);
    evaluate(): void;
}
export declare class LabelOpcode implements UpdatingOpcode {
    tag: Tag;
    type: string;
    label: Option<string>;
    _guid: number;
    prev: any;
    next: any;
    constructor(label: string);
    evaluate(): void;
    inspect(): string;
}
//# sourceMappingURL=vm.d.ts.map