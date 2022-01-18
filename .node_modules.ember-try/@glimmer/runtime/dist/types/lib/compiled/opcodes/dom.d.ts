import { Revision, Tag, VersionedReference } from '@glimmer/reference';
import { InternalModifierManager, ModifierInstanceState } from '../../modifier/interfaces';
import { UpdatingOpcode } from '../../opcodes';
import { UpdatingVM } from '../../vm';
import { DynamicAttribute } from '../../vm/attributes/dynamic';
export declare class UpdateModifierOpcode extends UpdatingOpcode {
    tag: Tag;
    private manager;
    private modifier;
    type: string;
    private lastUpdated;
    constructor(tag: Tag, manager: InternalModifierManager, modifier: ModifierInstanceState);
    evaluate(vm: UpdatingVM): void;
}
export declare class UpdateDynamicAttributeOpcode extends UpdatingOpcode {
    private reference;
    private attribute;
    type: string;
    tag: Tag;
    lastRevision: Revision;
    constructor(reference: VersionedReference<unknown>, attribute: DynamicAttribute);
    evaluate(vm: UpdatingVM): void;
}
//# sourceMappingURL=dom.d.ts.map