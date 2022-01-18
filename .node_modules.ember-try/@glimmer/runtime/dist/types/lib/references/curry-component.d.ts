import { Reference, PathReference, Tag } from '@glimmer/reference';
import { Option } from '@glimmer/util';
import { CapturedArguments, RuntimeResolver } from '@glimmer/interfaces';
import { CurriedComponentDefinition } from '../component/curried-component';
export default class CurryComponentReference implements PathReference<Option<CurriedComponentDefinition>> {
    private inner;
    private resolver;
    private meta;
    private args;
    tag: Tag;
    private lastValue;
    private lastDefinition;
    constructor(inner: Reference<unknown>, resolver: RuntimeResolver, meta: unknown, args: Option<CapturedArguments>);
    value(): Option<CurriedComponentDefinition>;
    get(): PathReference<unknown>;
    private curry;
}
//# sourceMappingURL=curry-component.d.ts.map