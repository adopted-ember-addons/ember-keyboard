import { CapturedArguments, ComponentDefinition, Dict, Maybe } from '@glimmer/interfaces';
import { Option } from '@glimmer/util';
import { VMArgumentsImpl } from '../vm/arguments';
declare const CURRIED_COMPONENT_DEFINITION_BRAND = "CURRIED COMPONENT DEFINITION [id=6f00feb9-a0ef-4547-99ea-ac328f80acea]";
export declare function isCurriedComponentDefinition(definition: unknown): definition is CurriedComponentDefinition;
export declare function isComponentDefinition(definition: Maybe<Dict>): definition is CurriedComponentDefinition;
export declare class CurriedComponentDefinition {
    protected inner: ComponentDefinition | CurriedComponentDefinition;
    protected args: Option<CapturedArguments>;
    readonly [CURRIED_COMPONENT_DEFINITION_BRAND] = true;
    /** @internal */
    constructor(inner: ComponentDefinition | CurriedComponentDefinition, args: Option<CapturedArguments>);
    unwrap(args: VMArgumentsImpl): ComponentDefinition;
    /** @internal */
    readonly offset: number;
}
export declare function curry(spec: ComponentDefinition, args?: Option<CapturedArguments>): CurriedComponentDefinition;
export {};
//# sourceMappingURL=curried-component.d.ts.map