import { UpdatingOpcode } from '../../opcodes';
import { Tag, VersionedReference, Revision } from '@glimmer/reference';
import { SimpleText } from '@simple-dom/interface';
export default class DynamicTextContent extends UpdatingOpcode {
    node: SimpleText;
    private reference;
    private lastValue;
    type: string;
    tag: Tag;
    lastRevision: Revision;
    constructor(node: SimpleText, reference: VersionedReference<unknown>, lastValue: string);
    evaluate(): void;
    update(value: unknown): void;
}
//# sourceMappingURL=text.d.ts.map