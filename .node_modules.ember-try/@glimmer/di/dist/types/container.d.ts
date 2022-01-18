import { Factory } from './factory';
import { RegistryReader } from './registry';
import { Resolver } from './resolver';
export default class Container {
    private _registry;
    private _resolver;
    private _lookups;
    private _factoryDefinitionLookups;
    constructor(registry: RegistryReader, resolver?: Resolver);
    factoryFor(specifier: string): Factory<any>;
    lookup(specifier: string): any;
    defaultInjections(specifier: string): Object;
    private buildInjections(specifier);
    private buildFactory(specifier, factoryDefinition);
}
