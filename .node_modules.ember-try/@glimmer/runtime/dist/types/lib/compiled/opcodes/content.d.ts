import { Reference, Tag } from '@glimmer/reference';
import { ConditionalReference } from '../../references';
import { ContentType } from '@glimmer/interfaces';
export declare class IsCurriedComponentDefinitionReference extends ConditionalReference {
    static create(inner: Reference<unknown>): IsCurriedComponentDefinitionReference;
}
export declare class ContentTypeReference implements Reference<ContentType> {
    private inner;
    tag: Tag;
    constructor(inner: Reference<unknown>);
    value(): ContentType;
}
//# sourceMappingURL=content.d.ts.map