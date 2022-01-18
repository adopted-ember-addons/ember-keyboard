import { Unique, ModifierManager } from '@glimmer/interfaces';
export declare type ModifierDefinitionState = Unique<'ModifierDefinitionState'>;
export declare type ModifierInstanceState = Unique<'ModifierInstanceState'>;
export interface PublicModifierDefinition<ModifierDefinitionState = unknown, Manager = ModifierManager<unknown, ModifierDefinitionState>> {
    state: ModifierDefinitionState;
    manager: Manager;
}
export interface ModifierDefinition {
    manager: InternalModifierManager;
    state: ModifierDefinitionState;
}
export declare type InternalModifierManager = ModifierManager<ModifierInstanceState, ModifierDefinitionState>;
//# sourceMappingURL=interfaces.d.ts.map