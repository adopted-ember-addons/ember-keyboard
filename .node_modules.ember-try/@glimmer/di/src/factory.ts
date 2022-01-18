export interface FactoryDefinition<T> {
  create(injections?: Object): T;
}

export interface Factory<T> {
  class: FactoryDefinition<T>;
  create(injections?: Object): T;
}
