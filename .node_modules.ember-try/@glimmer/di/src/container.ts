import { Factory, FactoryDefinition } from './factory';
import { RegistryReader, Injection } from './registry';
import { Resolver } from './resolver';
import { Dict } from './dict';

export default class Container {
  private _registry: RegistryReader;
  private _resolver: Resolver;
  private _lookups: Dict<any>;
  private _factoryDefinitionLookups: Dict<FactoryDefinition<any>>;

  constructor(registry: RegistryReader, resolver: Resolver = null) {
    this._registry = registry;
    this._resolver = resolver;
    this._lookups = {};
    this._factoryDefinitionLookups = {};
  }

  factoryFor(specifier: string): Factory<any> {
    let factoryDefinition: FactoryDefinition<any> = this._factoryDefinitionLookups[specifier];

    if (!factoryDefinition) {
      if (this._resolver) {
        factoryDefinition = this._resolver.retrieve(specifier);
      }

      if (!factoryDefinition) {
        factoryDefinition = this._registry.registration(specifier);
      }

      if (factoryDefinition) {
        this._factoryDefinitionLookups[specifier] = factoryDefinition;
      }
    }

    if (!factoryDefinition) {
      return;
    }

    return this.buildFactory(specifier, factoryDefinition);
  }

  lookup(specifier: string): any {
    let singleton = (this._registry.registeredOption(specifier, 'singleton') !== false);

    if (singleton && this._lookups[specifier]) {
      return this._lookups[specifier];
    }

    let factory = this.factoryFor(specifier);
    if (!factory) { return; }

    if (this._registry.registeredOption(specifier, 'instantiate') === false) {
      return factory.class;
    }

    let object = factory.create();

    if (singleton && object) {
      this._lookups[specifier] = object;
    }

    return object;
  }

  defaultInjections(specifier: string): Object {
    return {};
  }

  private buildInjections(specifier: string): Object {
    let hash = this.defaultInjections(specifier);
    let injections: Injection[] = this._registry.registeredInjections(specifier);
    let injection: Injection;

    for (let i = 0; i < injections.length; i++) {
      injection = injections[i];
      hash[injection.property] = this.lookup(injection.source);
    }

    return hash;
  }

  private buildFactory(specifier: string, factoryDefinition: FactoryDefinition<any>): Factory<any> {
    let injections = this.buildInjections(specifier);

    return {
      class: factoryDefinition,
      create(options) {
        let mergedOptions = Object.assign({}, injections, options);

        return factoryDefinition.create(mergedOptions);
      }
    }
  }
}
