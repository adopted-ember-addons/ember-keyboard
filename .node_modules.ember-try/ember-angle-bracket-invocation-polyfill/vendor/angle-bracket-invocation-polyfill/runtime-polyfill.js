/* globals Ember */
/* eslint-disable ember/new-module-imports */
import { lte, gte } from 'ember-compatibility-helpers';

(function() {
  const P = Ember.__loader.require('container').privatize;
  const { Application, Component, Engine, computed, getOwner } = Ember;
  const { combineTagged } = Ember.__loader.require(
    gte('2.13.0-alpha.1') ? '@glimmer/reference' : 'glimmer-reference'
  );
  const { clientBuilder } = Ember.__loader.require(
    gte('2.13.0-alpha.1') ? '@glimmer/runtime' : 'glimmer-runtime'
  );

  // This is entirely cribbed from the real ClassListReference in glimmer-vm.
  class ClassListReference {
    constructor(list) {
      this.tag = combineTagged(list);
      this.list = list;
    }

    value() {
      let ret = [];
      let { list } = this;

      for (let i = 0; i < list.length; i++) {
        let value = this._normalizeStringValue(list[i].value());
        if (value) ret.push(value);
      }

      return ret.length === 0 ? null : ret.join(' ');
    }

    _normalizeStringValue(value) {
      if (value === null || value === undefined || typeof value.toString !== 'function') {
        return '';
      }
      return String(value);
    }
  }

  class MergedAttributesReference {
    constructor(references) {
      this.references = references;

      let referencesArray = [];
      for (let reference in references) {
        referencesArray.push(references[reference]);
      }
      this.tag = combineTagged(referencesArray);
    }

    value() {
      let value = Object.create(null);
      for (let key in this.references) {
        value[key] = this.references[key].value();
      }
      return value;
    }

    get(property) {
      return this.references[property];
    }
  }

  function mergeAttributesHelper(_vm, args) {
    let references = {};
    let classReferences = [];
    for (let i = 0; i < args.positional.length; i++) {
      let arg = args.positional.at(i);
      let snapshot = arg.value();
      if (snapshot) {
        let names = Object.keys(arg.value());
        for (let i = 0; i < names.length; i++) {
          let name = names[i];
          let reference = arg.get(name);
          if (name === 'class') {
            classReferences.push(reference);
          } else {
            references[name] = reference;
          }
        }
      }
    }
    if (classReferences.length > 1) {
      references['class'] = new ClassListReference(classReferences);
    } else if (classReferences.length > 0) {
      references['class'] = classReferences[0];
    }

    return new MergedAttributesReference(references);
  }

  if (gte('3.1.0-beta.1')) {
    const buildRegistry = function buildRegistry() {
      let registry = this._super(...arguments);

      let compilerName = gte('3.2.0-alpha.1')
        ? P`template-compiler:main`
        : P`template-options:main`;
      let TemplateCompiler = registry.resolve(compilerName);

      registry.register(
        'component-lookup:main',
        Ember.Object.extend({
          componentFor(name, owner, options) {
            let fullName = `component:${name}`;
            return owner.factoryFor(fullName, options);
          },

          layoutFor(name, owner, options) {
            let templateFullName = `template:components/${name}`;
            return owner.lookup(templateFullName, options);
          },
        })
      );

      let originalCreate = TemplateCompiler.create;
      TemplateCompiler.create = function(options) {
        let owner = getOwner(options);
        let compiler = originalCreate(...arguments);
        let compileTimeLookup = compiler.resolver;
        let runtimeResolver = compileTimeLookup.resolver;

        // setup our reference capture system
        runtimeResolver.builtInHelpers['-merge-attrs'] = mergeAttributesHelper;

        class AttributeTracker {
          constructor(environment, element, attributeName, reference) {
            this._environment = environment;
            this._attribute = environment.attributeFor(element, attributeName, false);
            this._reference = reference;
            this.tag = reference.tag;
            this.lastRevision = this.tag.value();
          }

          set(dom) {
            this._attribute.set(dom, this._reference.value(), this._environment);
            this.lastRevision = this.tag.value();
          }

          update() {
            if (!this.tag.validate(this.lastRevision)) {
              this._attribute.update(this._reference.value(), this._environment);
              this.lastRevision = this.tag.value();
            }
          }
        }

        runtimeResolver.builtInModifiers = Ember.assign({}, runtimeResolver.builtInModifiers);
        runtimeResolver.builtInModifiers._splattributes = {
          create(element, args, scope, dom) {
            let environment = owner.lookup('service:-glimmer-environment');
            let domBuilder = clientBuilder(environment, {});
            domBuilder.constructing = element;

            let { positional } = args.capture();
            let invocationAttributesReference = positional.at(0);
            let invocationAttributes = invocationAttributesReference.value();
            let attributeNames = invocationAttributes ? Object.keys(invocationAttributes) : [];
            let dynamicAttributes = {};
            let references = [];

            for (let i = 0; i < attributeNames.length; i++) {
              let attributeName = attributeNames[i];
              let ref = invocationAttributesReference.get(attributeName);
              dynamicAttributes[attributeName] = new AttributeTracker(
                environment,
                element,
                attributeName,
                ref
              );
              references.push(ref);
            }

            return {
              references,
              dynamicAttributes,
              dom,
              domBuilder,
              environment,
            };
          },

          getTag({ references }) {
            return combineTagged(references);
          },

          install(bucket) {
            let { dynamicAttributes, domBuilder } = bucket;

            for (let name in dynamicAttributes) {
              let attribute = dynamicAttributes[name];
              attribute.set(domBuilder);
            }
          },

          update(bucket) {
            let { dynamicAttributes } = bucket;

            for (let name in dynamicAttributes) {
              let attribute = dynamicAttributes[name];
              attribute.update();
            }
          },

          getDestructor() {},
        };

        // setup our custom attribute bindings directly from the references passed in
        let ORIGINAL_LOOKUP_COMPONENT_DEFINITION = runtimeResolver._lookupComponentDefinition;
        let manager = null;
        runtimeResolver._lookupComponentDefinition = function() {
          // call the original implementation
          let definition = ORIGINAL_LOOKUP_COMPONENT_DEFINITION.apply(this, arguments);

          if (definition && manager) {
            definition.manager = manager;
            return definition;
          }

          if (definition) {
            let Manager = definition.manager.constructor;
            manager = definition.manager = new Manager();

            let ORIGINAL_DID_CREATE_ELEMENT = manager.didCreateElement;
            manager.didCreateElement = function(bucket, element, operations) {
              ORIGINAL_DID_CREATE_ELEMENT.apply(this, arguments);
              let { args } = bucket;
              if (args.has('__ANGLE_ATTRS__')) {
                let angleAttrs = args.get('__ANGLE_ATTRS__');
                // this use of value is OK because the set of keys isn't allowed to change dynamically
                let snapshot = angleAttrs.value();
                if (snapshot) {
                  for (let attributeName in snapshot) {
                    let attributeReference = angleAttrs.get(attributeName);
                    operations.setAttribute(attributeName, attributeReference, false, null);
                  }
                }
              }
            };
          }

          return definition;
        };

        return compiler;
      };

      return registry;
    };
    Application.reopenClass({ buildRegistry });
    Engine.reopenClass({ buildRegistry });
  } else if (gte('2.12.0-beta.1')) {
    const buildRegistry = function buildRegistry() {
      let registry = this._super(...arguments);

      let factoryForMethodName = 'factoryFor';
      if (lte('2.13.99999999')) {
        factoryForMethodName = Ember.__loader.require('container').FACTORY_FOR;
      }

      registry.register(
        'component-lookup:main',
        Ember.Object.extend({
          componentFor(name, owner, options) {
            let fullName = `component:${name}`;
            return owner[factoryForMethodName](fullName, options);
          },

          layoutFor(name, owner, options) {
            let templateFullName = `template:components/${name}`;
            return owner.lookup(templateFullName, options);
          },
        })
      );
      let Environment = registry.resolve('service:-glimmer-environment');
      let ORIGINAL_ENVIRONMENT_CREATE = Environment.create;
      if (!Environment.create.__IS_ANGLE_BRACKET_PATCHED__) {
        Environment.create = function() {
          let environment = ORIGINAL_ENVIRONMENT_CREATE.apply(this, arguments);
          let installedCustomDidCreateElement = false;

          environment.builtInHelpers['-merge-attrs'] = mergeAttributesHelper;

          class AttributeTracker {
            constructor(element, attributeName, reference) {
              this._element = element;
              this._attribute = environment.attributeFor(element, attributeName, false);
              this._reference = reference;
              this.tag = reference.tag;
              this.lastRevision = this.tag.value();
            }

            set() {
              this._attribute.setAttribute(environment, this._element, this._reference.value());
              this.lastRevision = this.tag.value();
            }

            update() {
              if (!this.tag.validate(this.lastRevision)) {
                this._attribute.updateAttribute(
                  environment,
                  this._element,
                  this._reference.value()
                );
                this.lastRevision = this.tag.value();
              }
            }
          }

          environment.builtInModifiers._splattributes = {
            create(element, args, scope, dom) {
              let positional = gte('2.15.0-beta.1') ? args.capture().positional : args.positional;
              let invocationAttributesReference = positional.at(0);
              let invocationAttributes = invocationAttributesReference.value();
              let attributeNames = invocationAttributes ? Object.keys(invocationAttributes) : [];
              let dynamicAttributes = {};
              let references = [];

              for (let i = 0; i < attributeNames.length; i++) {
                let attributeName = attributeNames[i];
                let ref = invocationAttributesReference.get(attributeName);
                dynamicAttributes[attributeName] = new AttributeTracker(
                  element,
                  attributeName,
                  ref
                );
                references.push(ref);
              }

              return {
                references,
                dynamicAttributes,
                dom,
                environment,
              };
            },

            getTag({ references }) {
              return combineTagged(references);
            },

            install(bucket) {
              let { dynamicAttributes } = bucket;

              for (let name in dynamicAttributes) {
                let attribute = dynamicAttributes[name];
                attribute.set();
              }
            },

            update(bucket) {
              let { dynamicAttributes } = bucket;

              for (let name in dynamicAttributes) {
                let attribute = dynamicAttributes[name];
                attribute.update();
              }
            },

            getDestructor() {},
          };

          let originalGetComponentDefinition = environment.getComponentDefinition;
          environment.getComponentDefinition = function() {
            let definition = originalGetComponentDefinition.apply(this, arguments);

            if (!installedCustomDidCreateElement && definition) {
              installedCustomDidCreateElement = true;

              let { manager } = definition;

              let ORIGINAL_DID_CREATE_ELEMENT = manager.didCreateElement;
              manager.didCreateElement = function(bucket, element, operations) {
                ORIGINAL_DID_CREATE_ELEMENT.apply(this, arguments);
                let { args } = bucket;

                if (lte('2.15.0-beta.1')) {
                  args = args.namedArgs;
                }

                // on < 2.15 `namedArgs` is only present when there were arguments
                if (args && args.has('__ANGLE_ATTRS__')) {
                  let attributeReferences = args.get('__ANGLE_ATTRS__');
                  let snapshot = attributeReferences.value();
                  if (snapshot) {
                    let names = Object.keys(snapshot);
                    for (let i = 0; i < names.length; i++) {
                      let attributeName = names[i];
                      let attributeReference = attributeReferences.get(attributeName);

                      operations.addDynamicAttribute(
                        element,
                        attributeName,
                        attributeReference,
                        false,
                        null
                      );
                    }
                  }
                }
              };
            }

            return definition;
          };

          return environment;
        };
        Environment.create.__IS_ANGLE_BRACKET_PATCHED__ = true;
      }

      return registry;
    };
    Application.reopenClass({ buildRegistry });
    Engine.reopenClass({ buildRegistry });
  } else {
    // Based heavily on https://github.com/mmun/ember-component-attributes
    Component.reopen({
      __ANGLE_ATTRS__: computed({
        set(key, value) {
          let { invocationAttributes, attrSplat } = value;

          let combinedAttributes = Ember.assign({}, invocationAttributes, attrSplat);

          if (this.tagName === '') {
            return combinedAttributes;
          }

          let attributes = Object.keys(combinedAttributes);
          let attributeBindingsOverride = [];

          for (let i = 0; i < attributes.length; i++) {
            let attribute = attributes[i];

            attributeBindingsOverride.push(`__ANGLE_ATTRS__.${attribute}:${attribute}`);
          }

          if (this.attributeBindings) {
            let attributeBindings = this.attributeBindings.filter(microsyntax => {
              // See https://github.com/emberjs/ember.js/blob/6a6f279df3b1a0979b5fd000bf49cd775c720f01/packages/ember-glimmer/lib/utils/bindings.js#L59-L73
              let colonIndex = microsyntax.indexOf(':');
              let attribute =
                colonIndex === -1 ? microsyntax : microsyntax.substring(colonIndex + 1);

              return attributes.indexOf(attribute) === -1;
            });

            this.attributeBindings = attributeBindingsOverride.concat(attributeBindings);
          } else {
            this.attributeBindings = attributeBindingsOverride;
          }

          return combinedAttributes;
        },
      }),
    });
  }
})();
