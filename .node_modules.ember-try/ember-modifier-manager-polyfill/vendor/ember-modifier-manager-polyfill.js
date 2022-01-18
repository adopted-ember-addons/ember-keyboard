/* globals Ember */
/* eslint-disable ember/new-module-imports */

import { lte, gte } from 'ember-compatibility-helpers';
import { deprecate } from '@ember/debug';

(() => {
  'use strict';

  const getPrototypeOf = Object.getPrototypeOf;
  const { Application } = Ember;
  let MODIFIER_MANAGERS = new WeakMap();
  Ember._setModifierManager = function Polyfilled_setModifierManager(managerFactory, modifier) {
    MODIFIER_MANAGERS.set(modifier, managerFactory);
    return modifier;
  };

  let getModifierManager = obj => {
    let pointer = obj;
    while (pointer !== undefined && pointer !== null) {
      if (MODIFIER_MANAGERS.has(pointer)) {
        return MODIFIER_MANAGERS.get(pointer);
      }

      if (gte('3.1.0-beta.1')) {
        pointer = getPrototypeOf(pointer);
      } else if (Ember.Object.detect(pointer) && typeof pointer.superclass === 'function') {
        pointer = pointer.superclass;
      } else {
        pointer = getPrototypeOf(pointer);
      }
    }

    return;
  };

  let valueForCapturedArgs = function valueForCapturedArgs(args) {
    return {
      named: args.named.value(),
      positional: args.positional.value(),
    };
  };

  Application.reopenClass({
    buildRegistry() {
      let registry = this._super(...arguments);

      class CustomModifierState {
        constructor(element, delegate, modifier, args) {
          this.element = element;
          this.delegate = delegate;
          this.modifier = modifier;
          this.args = args;
        }

        destroy() {
          const { delegate, modifier, args } = this;
          let modifierArgs = valueForCapturedArgs(args);
          delegate.destroyModifier(modifier, modifierArgs);
        }
      }

      class Polyfilled_CustomModifierManager {
        //create(element: Simple.Element, state: ModifierDefinitionState, args: IArguments, dynamicScope: DynamicScope, dom: DOMChanges): ModifierInstanceState;
        create(element, definition, args) {
          let capturedArgs = gte('2.15.0-alpha.1') ? args.capture() : args;
          let modifierArgs = valueForCapturedArgs(capturedArgs);

          let instance = definition.delegate.createModifier(definition.ModifierClass, modifierArgs);

          if (definition.delegate.capabilities === undefined) {
            definition.delegate.capabilities = Ember._modifierManagerCapabilities('3.13');

            deprecate(
              'Custom modifier managers must define their capabilities using the capabilities() helper function',
              false,
              {
                until: '3.17.0',
                id: 'implicit-modifier-manager-capabilities',
              }
            );
          }

          return new CustomModifierState(element, definition.delegate, instance, capturedArgs);
        }

        //getTag(modifier: ModifierInstanceState): Tag;
        getTag({ args }) {
          return args.tag;
        }

        //install(modifier: ModifierInstanceState): void;
        install(state) {
          let { element, args, delegate, modifier } = state;
          let modifierArgs = valueForCapturedArgs(args);
          delegate.installModifier(modifier, element, modifierArgs);
        }

        //update(modifier: ModifierInstanceState): void;
        update(state) {
          let { args, delegate, modifier } = state;
          let modifierArgs = valueForCapturedArgs(args);
          delegate.updateModifier(modifier, modifierArgs);
        }

        //getDestructor(modifier: ModifierInstanceState): Option<Destroyable>;
        getDestructor(state) {
          return state;
        }
      }

      let Polyfilled_CustomModifierManagerLt36;
      if (lte('3.6.0-alpha.1')) {
        Polyfilled_CustomModifierManagerLt36 = class Polyfilled_CustomModifierManagerLt36 extends Polyfilled_CustomModifierManager {
          constructor(name, ModifierClass, manager) {
            super();

            this.state = {
              ModifierClass,
              delegate: manager,
            };
          }

          // create(element: Simple.Element, args: Arguments, _dynamicScope: DynamicScope, dom: any) {
          create(element, args) {
            return super.create(element, this.state, args);
          }
        };
      }

      class Polyfilled_CustomModifierDefinition {
        constructor(name, ModifierClass, delegate) {
          this.name = name;
          this.state = {
            ModifierClass,
            name,
            delegate,
          };
          this.manager = new Polyfilled_CustomModifierManager();
        }
      }

      if (gte('3.1.0-beta.1')) {
        let containerModule = gte('3.6.0-alpha.1') ? '@ember/-internals/container' : 'container';
        const P = Ember.__loader.require(containerModule).privatize;

        let compilerName = gte('3.2.0-alpha.1')
          ? P`template-compiler:main`
          : P`template-options:main`;
        let TemplateCompiler = registry.resolve(compilerName);

        let ORIGINAL_TEMPLATE_COMPILER_CREATE = TemplateCompiler.create;
        if (ORIGINAL_TEMPLATE_COMPILER_CREATE.__MODIFIER_MANAGER_PATCHED === true) {
          return registry;
        }

        TemplateCompiler.create = function() {
          let compiler = ORIGINAL_TEMPLATE_COMPILER_CREATE(...arguments);
          let compileTimeLookup = compiler.resolver;
          let runtimeResolver = compileTimeLookup.resolver;

          // meta was not passed to `_lookupModifier` until 3.7
          if (lte('3.7.0-alpha.1')) {
            runtimeResolver.lookupModifier = function(name, meta) {
              return this.handle(this._lookupModifier(name, meta));
            };
          }

          runtimeResolver._lookupModifier = function(name, meta) {
            let builtin = this.builtInModifiers[name];

            if (builtin === undefined) {
              let { owner } = meta;
              let modifier = owner.factoryFor(`modifier:${name}`);
              if (modifier !== undefined) {
                let managerFactory = getModifierManager(modifier.class);
                let manager = managerFactory(owner);

                if (gte('3.6.0-alpha.1')) {
                  return new Polyfilled_CustomModifierDefinition(name, modifier, manager);
                } else {
                  return new Polyfilled_CustomModifierManagerLt36(name, modifier, manager);
                }
              }
            }

            return builtin;
          };

          return compiler;
        };
        TemplateCompiler.create.__MODIFIER_MANAGER_PATCHED = true;
      } else if (gte('2.12.0-beta.1')) {
        let Environment = registry.resolve('service:-glimmer-environment');
        let ORIGINAL_ENVIRONMENT_CREATE = Environment.create;
        if (ORIGINAL_ENVIRONMENT_CREATE.__MODIFIER_MANAGER_PATCHED === true) {
          return registry;
        }

        let factoryForMethodName = 'factoryFor';
        if (lte('2.13.99999999')) {
          factoryForMethodName = Ember.__loader.require('container').FACTORY_FOR;
        }

        Environment.create = function Polyfilled_EnvironmentCreate() {
          let environment = ORIGINAL_ENVIRONMENT_CREATE.apply(this, arguments);

          environment.hasModifier = function(name, metaOrSymbolTable) {
            let owner = gte('2.15.0-alpha.1')
              ? metaOrSymbolTable.owner
              : metaOrSymbolTable.getMeta().owner;

            return !!this.builtInModifiers[name] || !!owner.hasRegistration(`modifier:${name}`);
          };

          environment.lookupModifier = function(name, metaOrSymbolTable) {
            let modifier = this.builtInModifiers[name];

            if (!modifier) {
              let owner = gte('2.15.0-alpha.1')
                ? metaOrSymbolTable.owner
                : metaOrSymbolTable.getMeta().owner;
              let modifier = owner[factoryForMethodName](`modifier:${name}`);
              if (modifier !== undefined) {
                let managerFactory = getModifierManager(modifier.class);
                let manager = managerFactory(owner);

                return new Polyfilled_CustomModifierManagerLt36(name, modifier, manager);
              }
            }

            if (!modifier) {
              throw new Error(`${name} is not a modifier`);
            }

            return modifier;
          };

          return environment;
        };
        Environment.create.__MODIFIER_MANAGER_PATCHED = true;

        return registry;
      }

      return registry;
    },
  });
})();
