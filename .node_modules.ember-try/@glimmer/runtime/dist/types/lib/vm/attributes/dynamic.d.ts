import { Environment, Option, ElementBuilder } from '@glimmer/interfaces';
import { AttrNamespace, SimpleElement } from '@simple-dom/interface';
import { Attribute, AttributeOperation } from './index';
export declare function dynamicAttribute(element: SimpleElement, attr: string, namespace: Option<AttrNamespace>): DynamicAttribute;
export declare abstract class DynamicAttribute implements AttributeOperation {
    attribute: Attribute;
    constructor(attribute: Attribute);
    abstract set(dom: ElementBuilder, value: unknown, env: Environment): void;
    abstract update(value: unknown, env: Environment): void;
}
export declare class SimpleDynamicAttribute extends DynamicAttribute {
    set(dom: ElementBuilder, value: unknown, _env: Environment): void;
    update(value: unknown, _env: Environment): void;
}
export declare class DefaultDynamicProperty extends DynamicAttribute {
    private normalizedName;
    constructor(normalizedName: string, attribute: Attribute);
    value: unknown;
    set(dom: ElementBuilder, value: unknown, _env: Environment): void;
    update(value: unknown, _env: Environment): void;
    protected removeAttribute(): void;
}
export declare class SafeDynamicProperty extends DefaultDynamicProperty {
    set(dom: ElementBuilder, value: unknown, env: Environment): void;
    update(value: unknown, env: Environment): void;
}
export declare class SafeDynamicAttribute extends SimpleDynamicAttribute {
    set(dom: ElementBuilder, value: unknown, env: Environment): void;
    update(value: unknown, env: Environment): void;
}
export declare class InputValueDynamicAttribute extends DefaultDynamicProperty {
    set(dom: ElementBuilder, value: unknown): void;
    update(value: unknown): void;
}
export declare class OptionSelectedDynamicAttribute extends DefaultDynamicProperty {
    set(dom: ElementBuilder, value: unknown): void;
    update(value: unknown): void;
}
//# sourceMappingURL=dynamic.d.ts.map