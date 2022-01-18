import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

import {
  HAS_NATIVE_COMPUTED_GETTERS,
  HAS_DESCRIPTOR_TRAP,
  gte,
} from 'ember-compatibility-helpers';

(function() {
  function isFieldDescriptor(possibleDesc) {
    let [target, key, desc] = possibleDesc;

    return (
      possibleDesc.length === 3 &&
      typeof target === 'object' &&
      target !== null &&
      typeof key === 'string' &&
      ((typeof desc === 'object' &&
        desc !== null &&
        'enumerable' in desc &&
        'configurable' in desc) ||
        desc === undefined) // TS compatibility
    );
  }

  const {
    wrap,
    assign,
    computed: emberComputed,
    ComputedProperty,
    defineProperty,
    inject: { controller: injectController, service: injectService },
  } = Ember;

  // ***** UTILITIES *****

  const DESCRIPTOR = '__DESCRIPTOR__';

  function isCPGetter(getter) {
    // Hack for descriptor traps, we want to be able to tell if the function
    // is a descriptor trap before we call it at all
    return (
      getter !== null &&
      typeof getter === 'function' &&
      getter.toString().indexOf('CPGETTER_FUNCTION') !== -1
    );
  }

  function isDescriptorTrap(possibleDesc) {
    if (HAS_DESCRIPTOR_TRAP && DEBUG) {
      return (
        possibleDesc !== null &&
        typeof possibleDesc === 'object' &&
        possibleDesc[DESCRIPTOR] !== undefined
      );
    } else {
      throw new Error('Cannot call `isDescriptorTrap` in production');
    }
  }

  function getInheritedComputedDescriptor(obj, keyName) {
    let meta = Ember.meta(obj);
    let parentSource = meta && meta.parent ? meta.parent.source : undefined;
    while (parentSource) {
      let computedDesc = computedDescriptorFor(parentSource, keyName);
      if (computedDesc) {
        return computedDesc;
      }
      parentSource = parentSource.parent
        ? parentSource.parent.source
        : undefined;
    }
  }

  function isComputedDescriptor(possibleDesc) {
    return (
      possibleDesc !== null &&
      typeof possibleDesc === 'object' &&
      possibleDesc.isDescriptor
    );
  }

  function computedDescriptorFor(obj, keyName) {
    assert('Cannot call `descriptorFor` on null', obj !== null);
    assert('Cannot call `descriptorFor` on undefined', obj !== undefined);
    assert(
      `Cannot call \`descriptorFor\` on ${typeof obj}`,
      typeof obj === 'object' || typeof obj === 'function'
    );

    if (HAS_NATIVE_COMPUTED_GETTERS) {
      let meta = Ember.meta(obj);

      if (meta !== undefined && typeof meta._descriptors === 'object') {
        // TODO: Just return the standard descriptor
        if (gte('3.8.0')) {
          return meta._descriptors.get(keyName);
        } else {
          return meta._descriptors[keyName];
        }
      }
    } else if (Object.hasOwnProperty.call(obj, keyName)) {
      let {
        value: possibleDesc,
        get: possibleCPGetter,
      } = Object.getOwnPropertyDescriptor(obj, keyName);

      if (DEBUG && HAS_DESCRIPTOR_TRAP && isCPGetter(possibleCPGetter)) {
        possibleDesc = possibleCPGetter.call(obj);

        if (isDescriptorTrap(possibleDesc)) {
          return possibleDesc[DESCRIPTOR];
        }
      }

      return isComputedDescriptor(possibleDesc) ? possibleDesc : undefined;
    }
  }

  const DECORATOR_COMPUTED_FN = new WeakMap();
  const DECORATOR_PARAMS = new WeakMap();
  const DECORATOR_MODIFIERS = new WeakMap();

  // eslint-disable-next-line no-inner-declarations
  function buildComputedDesc(dec, prototype, key, desc) {
    let fn = DECORATOR_COMPUTED_FN.get(dec);
    let params = DECORATOR_PARAMS.get(dec);
    let modifiers = DECORATOR_MODIFIERS.get(dec);

    let computedDesc = fn(prototype, key, desc, params);

    assert(
      `computed decorators must return an instance of an Ember ComputedProperty descriptor, received ${computedDesc}`,
      isComputedDescriptor(computedDesc)
    );

    if (modifiers) {
      modifiers.forEach(m => {
        if (Array.isArray(m)) {
          computedDesc[m[0]](...m[1]);
        } else {
          computedDesc[m]();
        }
      });
    }

    return computedDesc;
  }

  class DecoratorDescriptor extends ComputedProperty {
    setup(obj, key, meta) {
      if (!this._computedDesc) {
        this._computedDesc = buildComputedDesc(this, obj, key, {});
      }

      if (gte('3.6.0')) {
        this._computedDesc.setup(obj, key, meta);
      } else if (gte('3.1.0')) {
        let meta = Ember.meta(obj);
        let desc = this._computedDesc;

        Object.defineProperty(obj, key, {
          configurable: true,
          enumerable: true,
          get() {
            return desc.get(this, key);
          },
        });

        meta.writeDescriptors(key, this._computedDesc);
      } else {
        Object.defineProperty(obj, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: this._computedDesc,
        });
      }
    }

    _addModifier(modifier) {
      let modifiers = DECORATOR_MODIFIERS.get(this);

      if (modifiers === undefined) {
        modifiers = [];
        DECORATOR_MODIFIERS.set(this, modifiers);
      }

      modifiers.push(modifier);
    }

    get() {
      return this._innerComputed.get.apply(this, arguments);
    }

    set() {
      return this._innerComputed.get.apply(this, arguments);
    }

    readOnly() {
      this._addModifier('readOnly');
      return this;
    }

    volatile() {
      this._addModifier('volatile');
      return this;
    }

    property(...keys) {
      this._addModifier(['property', keys]);
      return this;
    }

    meta(...args) {
      this._addModifier(['meta', args]);
      return this;
    }

    get _dependentKeys() {
      let params = DECORATOR_PARAMS.get(this) || [];

      return params.filter(item => typeof item === 'string');
    }
  }

  DecoratorDescriptor.prototype.isDescriptor = true;
  DecoratorDescriptor.prototype.__IS_POLYFILLED_COMPUTED = true;

  function computedDecorator(fn, params) {
    let dec = function(prototype, key, desc) {
      assert(
        `ES6 property getters/setters only need to be decorated once, '${key}' was decorated on both the getter and the setter`,
        !computedDescriptorFor(prototype, key)
      );

      let computedDesc = buildComputedDesc(dec, prototype, key, desc);

      if (!HAS_NATIVE_COMPUTED_GETTERS) {
        // Until recent versions of Ember, computed properties would be defined
        // by just setting them. We need to blow away any predefined properties
        // (getters/setters, etc.) to allow Ember.defineProperty to work correctly.
        Object.defineProperty(prototype, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: undefined,
        });
      }

      defineProperty(prototype, key, computedDesc);

      // There's currently no way to disable redefining the property when decorators
      // are run, so return the property descriptor we just assigned
      return Object.getOwnPropertyDescriptor(prototype, key);
    };

    Object.setPrototypeOf(dec, DecoratorDescriptor.prototype);
    DECORATOR_COMPUTED_FN.set(dec, fn);
    DECORATOR_PARAMS.set(dec, params);
    return dec;
  }

  function computedDecoratorWithParams(fn) {
    return function(...params) {
      if (isFieldDescriptor(params)) {
        return Function.apply.call(computedDecorator(fn), undefined, params);
      } else {
        return computedDecorator(fn, params);
      }
    };
  }

  function computedDecoratorWithRequiredParams(fn, name) {
    return function(...params) {
      assert(
        `The @${name || fn.name} decorator requires parameters`,
        !isFieldDescriptor(params) && params.length > 0
      );

      return computedDecorator(fn, params);
    };
  }

  function legacyMacro(fn, fnName) {
    let decorator = computedDecoratorWithRequiredParams(
      (prototype, key, desc, params) => {
        return fn(...params);
      },
      fnName
    );

    if (DEBUG) {
      let desc = Object.getOwnPropertyDescriptor(decorator, 'name');
      // Pre ES2015 non standard implementation, "Function.name" is non configurable field
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
      if (desc && desc.configurable) {
        Object.defineProperty(decorator, 'name', {
          value: fnName,
        });
      }
    }

    return decorator;
  }

  // ***** COMPUTED *****

  Ember.ComputedProperty = DecoratorDescriptor;
  Ember.computed = computedDecoratorWithParams(
    (prototype, key, desc, params = []) => {
      assert(
        `@computed can only be used on accessors or fields, attempted to use it with ${key} but that was a method. Try converting it to a getter (e.g. \`get ${key}() {}\`)`,
        !(desc && typeof desc.value === 'function')
      );

      assert(
        `@computed can only be used on empty fields. ${key} has an initial value (e.g. \`${key} = someValue\`)`,
        !(desc && desc.initializer)
      );

      let lastArg = params[params.length - 1];
      let get, set;

      assert(
        `computed properties should not be passed to @computed directly`,
        !(
          (typeof lastArg === 'function' || typeof lastArg === 'object') &&
          lastArg instanceof ComputedProperty
        )
      );

      if (typeof lastArg === 'function') {
        params.pop();
        get = lastArg;
      }

      if (typeof lastArg === 'object' && lastArg !== null) {
        params.pop();
        get = lastArg.get;
        set = lastArg.set;
      }

      assert(
        `Attempted to apply a computed property that already has a getter/setter to a ${key}, but it is a method or an accessor. If you passed @computed a function or getter/setter (e.g. \`@computed({ get() { ... } })\`), then it must be applied to a field`,
        !(
          desc &&
          (typeof get === 'function' || typeof set === 'function') &&
          (typeof desc.get === 'function' || typeof desc.get === 'function')
        )
      );

      let usedClassDescriptor = false;

      if (get === undefined && set === undefined) {
        usedClassDescriptor = true;
        get = desc.get;
        set = desc.set;
      }

      assert(
        `Attempted to use @computed on ${key}, but it did not have a getter or a setter. You must either pass a get a function or getter/setter to @computed directly (e.g. \`@computed({ get() { ... } })\`) or apply @computed directly to a getter/setter`,
        typeof get === 'function' || typeof set === 'function'
      );

      if (desc !== undefined) {
        // Unset the getter and setter so the descriptor just has a plain value
        desc.get = undefined;
        desc.set = undefined;
      }
      let superDesc = getInheritedComputedDescriptor(prototype, key);
      if (superDesc && superDesc instanceof ComputedProperty) {
        get = wrap(get, superDesc._getter);
        if (set !== undefined && typeof superDesc._setter === 'function') {
          set = wrap(set, superDesc._setter);
        }
      }

      let setter = set;

      if (usedClassDescriptor === true && typeof set === 'function') {
        // Because the setter was defined using class syntax, it cannot have the
        // same `set(key, value)` signature, and it may not return a value. We
        // convert the call internally to pass the value as the first parameter,
        // and check to see if the return value is undefined and if so call the
        // getter again to get the value explicitly.
        setter = function(key, value) {
          let ret = set.call(this, value);
          return typeof ret === 'undefined' ? get.call(this) : ret;
        };
      }

      return emberComputed(...params, { get, set: setter });
    }
  );

  // ***** COMPUTED MACROS *****

  Ember.computed.alias = legacyMacro(emberComputed.alias, 'alias');
  Ember.computed.and = legacyMacro(emberComputed.and, 'and');
  Ember.computed.bool = legacyMacro(emberComputed.bool, 'bool');
  Ember.computed.collect = legacyMacro(emberComputed.collect, 'collect');
  Ember.computed.deprecatingAlias = legacyMacro(
    emberComputed.deprecatingAlias,
    'deprecatingAlias'
  );
  Ember.computed.empty = legacyMacro(emberComputed.empty, 'empty');
  Ember.computed.equal = legacyMacro(emberComputed.equal, 'equal');
  Ember.computed.filter = legacyMacro(emberComputed.filter, 'filter');
  Ember.computed.filterBy = legacyMacro(emberComputed.filterBy, 'filterBy');
  Ember.computed.gt = legacyMacro(emberComputed.gt, 'gt');
  Ember.computed.gte = legacyMacro(emberComputed.gte, 'gte');
  Ember.computed.intersect = legacyMacro(emberComputed.intersect, 'intersect');
  Ember.computed.lt = legacyMacro(emberComputed.lt, 'lt');
  Ember.computed.lte = legacyMacro(emberComputed.lte, 'lte');
  Ember.computed.map = legacyMacro(emberComputed.map, 'map');
  Ember.computed.mapBy = legacyMacro(emberComputed.mapBy, 'mapBy');
  Ember.computed.match = legacyMacro(emberComputed.match, 'match');
  Ember.computed.max = legacyMacro(emberComputed.max, 'max');
  Ember.computed.min = legacyMacro(emberComputed.min, 'min');
  Ember.computed.none = legacyMacro(emberComputed.none, 'none');
  Ember.computed.not = legacyMacro(emberComputed.not, 'not');
  Ember.computed.notEmpty = legacyMacro(emberComputed.notEmpty, 'notEmpty');
  Ember.computed.oneWay = legacyMacro(emberComputed.oneWay, 'oneWay');
  Ember.computed.or = legacyMacro(emberComputed.or, 'or');
  Ember.computed.reads = legacyMacro(emberComputed.reads, 'reads');
  Ember.computed.readOnly = legacyMacro(emberComputed.readOnly, 'readOnly');
  Ember.computed.setDiff = legacyMacro(emberComputed.setDiff, 'setDiff');
  Ember.computed.sort = legacyMacro(emberComputed.sort, 'sort');
  Ember.computed.sum = legacyMacro(emberComputed.sum, 'sum');
  Ember.computed.union = legacyMacro(emberComputed.union, 'union');
  Ember.computed.uniq = legacyMacro(emberComputed.uniq, 'uniq');
  Ember.computed.uniqBy = legacyMacro(emberComputed.uniqBy, 'uniqBy');

  // ***** INJECTIONS *****

  Ember.inject.controller = computedDecoratorWithParams(
    (prototype, key, desc, params) => {
      return injectController.apply(this, params);
    }
  );

  Ember.inject.service = computedDecoratorWithParams(
    (prototype, key, desc, params) => {
      return injectService.apply(this, params);
    }
  );

  // ***** ACTION *****

  let BINDINGS_MAP = new WeakMap();

  function setupAction(target, key, actionFn) {
    if (
      target.constructor !== undefined &&
      typeof target.constructor.proto === 'function'
    ) {
      target.constructor.proto();
    }

    if (!target.hasOwnProperty('actions')) {
      let parentActions = target.actions;
      // we need to assign because of the way mixins copy actions down when inheriting
      target.actions = parentActions ? assign({}, parentActions) : {};
    }

    target.actions[key] = actionFn;

    return {
      get() {
        let bindings = BINDINGS_MAP.get(this);

        if (bindings === undefined) {
          bindings = new Map();
          BINDINGS_MAP.set(this, bindings);
        }

        let fn = bindings.get(actionFn);

        if (fn === undefined) {
          fn = actionFn.bind(this);
          bindings.set(actionFn, fn);
        }

        return fn;
      },
    };
  }

  class ActionDecoratorDescriptor extends ComputedProperty {
    setup(obj, key, meta) {
      assert(
        'The action() decorator must be passed a method when used in classic classes',
        typeof this.__ACTION_FN__ === 'function'
      );

      Object.defineProperty(
        obj,
        key,
        setupAction(obj, key, this.__ACTION_FN__)
      );
    }

    get(obj, key) {
      return obj[key];
    }
  }

  Ember._action = function(target, key, desc) {
    let actionFn;

    if (!isFieldDescriptor([target, key, desc])) {
      actionFn = target;

      let decorator = function(target, key, desc) {
        assert(
          'The @action decorator may only be passed a method when used in classic classes. You should decorate methods directly in native classes',
          false
        );
      };

      decorator.__ACTION_FN__ = actionFn;

      Object.setPrototypeOf(decorator, ActionDecoratorDescriptor.prototype);

      return decorator;
    }

    actionFn = desc.value;

    assert(
      'The @action decorator must be applied to methods when used in native classes',
      typeof actionFn === 'function'
    );

    return setupAction(target, key, actionFn);
  };
})();
