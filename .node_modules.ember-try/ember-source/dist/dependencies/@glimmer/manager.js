import { DEBUG } from '@glimmer/env';
import { debugToString, _WeakSet, HAS_NATIVE_PROXY, assign, dict } from '@glimmer/util';
import { valueForRef, createConstRef, createComputeRef, UNDEFINED_REFERENCE } from '@glimmer/reference';
import { track, deprecateMutationsInTrackingTransaction, createUpdatableTag, untrack } from '@glimmer/validator';
import { registerDestructor, associateDestroyableChild } from '@glimmer/destroyable';
import { setOwner } from '@glimmer/owner';

const COMPONENT_MANAGERS = new WeakMap();
const MODIFIER_MANAGERS = new WeakMap();
const HELPER_MANAGERS = new WeakMap(); ///////////

const getPrototypeOf = Object.getPrototypeOf;

function setManager(map, manager, obj) {
  if (DEBUG && (typeof obj !== 'object' || obj === null) && typeof obj !== 'function') {
    throw new Error(`Attempted to set a manager on a non-object value. Managers can only be associated with objects or functions. Value was ${debugToString(obj)}`);
  }

  if (DEBUG && map.has(obj)) {
    throw new Error(`Attempted to set the same type of manager multiple times on a value. You can only associate one manager of each type with a given value. Value was ${debugToString(obj)}`);
  }

  map.set(obj, manager);
  return obj;
}

function getManager(map, obj) {
  let pointer = obj;

  while (pointer !== undefined && pointer !== null) {
    const manager = map.get(pointer);

    if (manager !== undefined) {
      return manager;
    }

    pointer = getPrototypeOf(pointer);
  }

  return undefined;
} ///////////


function setInternalModifierManager(manager, definition) {
  return setManager(MODIFIER_MANAGERS, manager, definition);
}
function getInternalModifierManager(definition, isOptional) {
  if (DEBUG && typeof definition !== 'function' && (typeof definition !== 'object' || definition === null)) {
    throw new Error(`Attempted to use a value as a modifier, but it was not an object or function. Modifier definitions must be objects or functions with an associated modifier manager. The value was: ${definition}`);
  }

  const manager = getManager(MODIFIER_MANAGERS, definition);

  if (manager === undefined) {
    if (isOptional === true) {
      return null;
    } else if (DEBUG) {
      throw new Error(`Attempted to load a modifier, but there wasn't a modifier manager associated with the definition. The definition was: ${debugToString(definition)}`);
    }
  }

  return manager;
}
function setInternalHelperManager(manager, definition) {
  return setManager(HELPER_MANAGERS, manager, definition);
}
function getInternalHelperManager(definition, isOptional) {
  if (DEBUG && typeof definition !== 'function' && (typeof definition !== 'object' || definition === null)) {
    throw new Error(`Attempted to use a value as a helper, but it was not an object or function. Helper definitions must be objects or functions with an associated helper manager. The value was: ${definition}`);
  }

  const manager = getManager(HELPER_MANAGERS, definition);

  if (manager === undefined) {
    if (isOptional === true) {
      return null;
    } else if (DEBUG) {
      throw new Error(`Attempted to load a helper, but there wasn't a helper manager associated with the definition. The definition was: ${debugToString(definition)}`);
    }
  }

  return manager;
}
function setInternalComponentManager(factory, obj) {
  return setManager(COMPONENT_MANAGERS, factory, obj);
}
function getInternalComponentManager(definition, isOptional) {
  if (DEBUG && typeof definition !== 'function' && (typeof definition !== 'object' || definition === null)) {
    throw new Error(`Attempted to use a value as a component, but it was not an object or function. Component definitions must be objects or functions with an associated component manager. The value was: ${definition}`);
  }

  const manager = getManager(COMPONENT_MANAGERS, definition);

  if (manager === undefined) {
    if (isOptional === true) {
      return null;
    } else if (DEBUG) {
      throw new Error(`Attempted to load a component, but there wasn't a component manager associated with the definition. The definition was: ${debugToString(definition)}`);
    }
  }

  return manager;
} ///////////

function hasInternalComponentManager(definition) {
  return getManager(COMPONENT_MANAGERS, definition) !== undefined;
}
function hasInternalHelperManager(definition) {
  return getManager(HELPER_MANAGERS, definition) !== undefined;
}
function hasInternalModifierManager(definition) {
  return getManager(MODIFIER_MANAGERS, definition) !== undefined;
}

const FROM_CAPABILITIES = DEBUG ? new _WeakSet() : undefined;
function buildCapabilities(capabilities) {
  if (DEBUG) {
    FROM_CAPABILITIES.add(capabilities);
    Object.freeze(capabilities);
  }

  return capabilities;
}
/**
 * Converts a ComponentCapabilities object into a 32-bit integer representation.
 */

function capabilityFlagsFrom(capabilities) {
  return 0 | (capabilities.dynamicLayout ? 1
  /* DynamicLayout */
  : 0) | (capabilities.dynamicTag ? 2
  /* DynamicTag */
  : 0) | (capabilities.prepareArgs ? 4
  /* PrepareArgs */
  : 0) | (capabilities.createArgs ? 8
  /* CreateArgs */
  : 0) | (capabilities.attributeHook ? 16
  /* AttributeHook */
  : 0) | (capabilities.elementHook ? 32
  /* ElementHook */
  : 0) | (capabilities.dynamicScope ? 64
  /* DynamicScope */
  : 0) | (capabilities.createCaller ? 128
  /* CreateCaller */
  : 0) | (capabilities.updateHook ? 256
  /* UpdateHook */
  : 0) | (capabilities.createInstance ? 512
  /* CreateInstance */
  : 0) | (capabilities.wrapped ? 1024
  /* Wrapped */
  : 0) | (capabilities.willDestroy ? 2048
  /* WillDestroy */
  : 0) | (capabilities.hasSubOwner ? 4096
  /* HasSubOwner */
  : 0);
}
function managerHasCapability(_manager, capabilities, capability) {
  return !!(capabilities & capability);
}
function hasCapability(capabilities, capability) {
  return !!(capabilities & capability);
}

const CUSTOM_TAG_FOR = new WeakMap();
function getCustomTagFor(obj) {
  return CUSTOM_TAG_FOR.get(obj);
}
function setCustomTagFor(obj, customTagFn) {
  CUSTOM_TAG_FOR.set(obj, customTagFn);
}

function convertToInt(prop) {
  if (typeof prop === 'symbol') return null;
  const num = Number(prop);
  if (isNaN(num)) return null;
  return num % 1 === 0 ? num : null;
}

function tagForNamedArg(namedArgs, key) {
  return track(() => {
    if (key in namedArgs) {
      valueForRef(namedArgs[key]);
    }
  });
}

function tagForPositionalArg(positionalArgs, key) {
  return track(() => {
    if (key === '[]') {
      // consume all of the tags in the positional array
      positionalArgs.forEach(valueForRef);
    }

    const parsed = convertToInt(key);

    if (parsed !== null && parsed < positionalArgs.length) {
      // consume the tag of the referenced index
      valueForRef(positionalArgs[parsed]);
    }
  });
}

let argsProxyFor;

class NamedArgsProxy {
  constructor(named) {
    this.named = named;
  }

  get(_target, prop) {
    const ref = this.named[prop];

    if (ref !== undefined) {
      return valueForRef(ref);
    }
  }

  has(_target, prop) {
    return prop in this.named;
  }

  ownKeys() {
    return Object.keys(this.named);
  }

  isExtensible() {
    return false;
  }

  getOwnPropertyDescriptor(_target, prop) {
    if (DEBUG && !(prop in this.named)) {
      throw new Error(`args proxies do not have real property descriptors, so you should never need to call getOwnPropertyDescriptor yourself. This code exists for enumerability, such as in for-in loops and Object.keys(). Attempted to get the descriptor for \`${String(prop)}\``);
    }

    return {
      enumerable: true,
      configurable: true
    };
  }

}

class PositionalArgsProxy {
  constructor(positional) {
    this.positional = positional;
  }

  get(target, prop) {
    let {
      positional
    } = this;

    if (prop === 'length') {
      return positional.length;
    }

    const parsed = convertToInt(prop);

    if (parsed !== null && parsed < positional.length) {
      return valueForRef(positional[parsed]);
    }

    return target[prop];
  }

  isExtensible() {
    return false;
  }

  has(_target, prop) {
    const parsed = convertToInt(prop);
    return parsed !== null && parsed < this.positional.length;
  }

}

if (HAS_NATIVE_PROXY) {
  argsProxyFor = (capturedArgs, type) => {
    const {
      named,
      positional
    } = capturedArgs;

    let getNamedTag = (_obj, key) => tagForNamedArg(named, key);

    let getPositionalTag = (_obj, key) => tagForPositionalArg(positional, key);

    const namedHandler = new NamedArgsProxy(named);
    const positionalHandler = new PositionalArgsProxy(positional);
    const namedTarget = Object.create(null);
    const positionalTarget = [];

    if (DEBUG) {
      const setHandler = function (_target, prop) {
        throw new Error(`You attempted to set ${String(prop)} on the arguments of a component, helper, or modifier. Arguments are immutable and cannot be updated directly, they always represent the values that is passed down. If you want to set default values, you should use a getter and local tracked state instead.`);
      };

      const forInDebugHandler = () => {
        throw new Error(`Object.keys() was called on the positional arguments array for a ${type}, which is not supported. This function is a low-level function that should not need to be called for positional argument arrays. You may be attempting to iterate over the array using for...in instead of for...of.`);
      };

      namedHandler.set = setHandler;
      positionalHandler.set = setHandler;
      positionalHandler.ownKeys = forInDebugHandler;
    }

    const namedProxy = new Proxy(namedTarget, namedHandler);
    const positionalProxy = new Proxy(positionalTarget, positionalHandler);
    setCustomTagFor(namedProxy, getNamedTag);
    setCustomTagFor(positionalProxy, getPositionalTag);
    return {
      named: namedProxy,
      positional: positionalProxy
    };
  };
} else {
  argsProxyFor = (capturedArgs, _type) => {
    const {
      named,
      positional
    } = capturedArgs;

    let getNamedTag = (_obj, key) => tagForNamedArg(named, key);

    let getPositionalTag = (_obj, key) => tagForPositionalArg(positional, key);

    let namedProxy = {};
    let positionalProxy = [];
    setCustomTagFor(namedProxy, getNamedTag);
    setCustomTagFor(positionalProxy, getPositionalTag);
    Object.keys(named).forEach(name => {
      Object.defineProperty(namedProxy, name, {
        enumerable: true,
        configurable: true,

        get() {
          return valueForRef(named[name]);
        }

      });
    });
    positional.forEach((ref, index) => {
      Object.defineProperty(positionalProxy, index, {
        enumerable: true,
        configurable: true,

        get() {
          return valueForRef(ref);
        }

      });
    });

    if (DEBUG) {
      // Prevent mutations in development mode. This will not prevent the
      // proxy from updating, but will prevent assigning new values or pushing
      // for instance.
      Object.freeze(namedProxy);
      Object.freeze(positionalProxy);
    }

    return {
      named: namedProxy,
      positional: positionalProxy
    };
  };
}

const CAPABILITIES = {
  dynamicLayout: false,
  dynamicTag: false,
  prepareArgs: false,
  createArgs: true,
  attributeHook: false,
  elementHook: false,
  createCaller: false,
  dynamicScope: true,
  updateHook: true,
  createInstance: true,
  wrapped: false,
  willDestroy: false,
  hasSubOwner: false
};
function componentCapabilities(managerAPI, options = {}) {
  if (DEBUG && managerAPI !== '3.4' && managerAPI !== '3.13') {
    throw new Error('Invalid component manager compatibility specified');
  }

  let updateHook = true;

  if (managerAPI === '3.13') {
    updateHook = Boolean(options.updateHook);
  }

  return buildCapabilities({
    asyncLifeCycleCallbacks: Boolean(options.asyncLifecycleCallbacks),
    destructor: Boolean(options.destructor),
    updateHook
  });
}
function hasAsyncLifeCycleCallbacks(delegate) {
  return delegate.capabilities.asyncLifeCycleCallbacks;
}
function hasUpdateHook(delegate) {
  return delegate.capabilities.updateHook;
}
function hasAsyncUpdateHook(delegate) {
  return hasAsyncLifeCycleCallbacks(delegate) && hasUpdateHook(delegate);
}
function hasDestructors(delegate) {
  return delegate.capabilities.destructor;
}
/**
  The CustomComponentManager allows addons to provide custom component
  implementations that integrate seamlessly into Ember. This is accomplished
  through a delegate, registered with the custom component manager, which
  implements a set of hooks that determine component behavior.

  To create a custom component manager, instantiate a new CustomComponentManager
  class and pass the delegate as the first argument:

  ```js
  let manager = new CustomComponentManager({
    // ...delegate implementation...
  });
  ```

  ## Delegate Hooks

  Throughout the lifecycle of a component, the component manager will invoke
  delegate hooks that are responsible for surfacing those lifecycle changes to
  the end developer.

  * `create()` - invoked when a new instance of a component should be created
  * `update()` - invoked when the arguments passed to a component change
  * `getContext()` - returns the object that should be
*/

class CustomComponentManager {
  constructor(factory) {
    this.factory = factory;
    this.componentManagerDelegates = new WeakMap();
  }

  getDelegateFor(owner) {
    let {
      componentManagerDelegates
    } = this;
    let delegate = componentManagerDelegates.get(owner);

    if (delegate === undefined) {
      let {
        factory
      } = this;
      delegate = factory(owner);

      if (DEBUG && !FROM_CAPABILITIES.has(delegate.capabilities)) {
        // TODO: This error message should make sense in both Ember and Glimmer https://github.com/glimmerjs/glimmer-vm/issues/1200
        throw new Error(`Custom component managers must have a \`capabilities\` property that is the result of calling the \`capabilities('3.4' | '3.13')\` (imported via \`import { capabilities } from '@ember/component';\`). Received: \`${JSON.stringify(delegate.capabilities)}\` for: \`${delegate}\``);
      }

      componentManagerDelegates.set(owner, delegate);
    }

    return delegate;
  }

  create(owner, definition, vmArgs) {
    let delegate = this.getDelegateFor(owner);
    let args = argsProxyFor(vmArgs.capture(), 'component');
    let component;

    if (DEBUG && deprecateMutationsInTrackingTransaction !== undefined) {
      deprecateMutationsInTrackingTransaction(() => {
        component = delegate.createComponent(definition, args);
      });
    } else {
      component = delegate.createComponent(definition, args);
    }

    return new CustomComponentState(component, delegate, args);
  }

  getDebugName(definition) {
    return typeof definition === 'function' ? definition.name : definition.toString();
  }

  update(bucket) {
    let {
      delegate
    } = bucket;

    if (hasUpdateHook(delegate)) {
      let {
        component,
        args
      } = bucket;
      delegate.updateComponent(component, args);
    }
  }

  didCreate({
    component,
    delegate
  }) {
    if (hasAsyncLifeCycleCallbacks(delegate)) {
      delegate.didCreateComponent(component);
    }
  }

  didUpdate({
    component,
    delegate
  }) {
    if (hasAsyncUpdateHook(delegate)) {
      delegate.didUpdateComponent(component);
    }
  }

  didRenderLayout() {}

  didUpdateLayout() {}

  getSelf({
    component,
    delegate
  }) {
    return createConstRef(delegate.getContext(component), 'this');
  }

  getDestroyable(bucket) {
    const {
      delegate
    } = bucket;

    if (hasDestructors(delegate)) {
      const {
        component
      } = bucket;
      registerDestructor(bucket, () => delegate.destroyComponent(component));
      return bucket;
    }

    return null;
  }

  getCapabilities() {
    return CAPABILITIES;
  }

}
/**
 * Stores internal state about a component instance after it's been created.
 */

class CustomComponentState {
  constructor(component, delegate, args) {
    this.component = component;
    this.delegate = delegate;
    this.args = args;
  }

}

function modifierCapabilities(managerAPI, optionalFeatures = {}) {
  if (DEBUG && managerAPI !== '3.13' && managerAPI !== '3.22') {
    throw new Error('Invalid modifier manager compatibility specified');
  }

  return buildCapabilities({
    disableAutoTracking: Boolean(optionalFeatures.disableAutoTracking),
    useArgsProxy: managerAPI === '3.13' ? false : true,
    // This capability is used in Ember, exclusively in resolution mode. See the
    // Ember glimmer resolver for details.
    passFactoryToCreate: managerAPI === '3.13'
  });
}
/**
  The CustomModifierManager allows addons to provide custom modifier
  implementations that integrate seamlessly into Ember. This is accomplished
  through a delegate, registered with the custom modifier manager, which
  implements a set of hooks that determine modifier behavior.
  To create a custom modifier manager, instantiate a new CustomModifierManager
  class and pass the delegate as the first argument:

  ```js
  let manager = new CustomModifierManager({
    // ...delegate implementation...
  });
  ```

  ## Delegate Hooks

  Throughout the lifecycle of a modifier, the modifier manager will invoke
  delegate hooks that are responsible for surfacing those lifecycle changes to
  the end developer.
  * `createModifier()` - invoked when a new instance of a modifier should be created
  * `installModifier()` - invoked when the modifier is installed on the element
  * `updateModifier()` - invoked when the arguments passed to a modifier change
  * `destroyModifier()` - invoked when the modifier is about to be destroyed
*/

class CustomModifierManager {
  constructor(factory) {
    this.factory = factory;
    this.componentManagerDelegates = new WeakMap();
  }

  getDelegateFor(owner) {
    let {
      componentManagerDelegates
    } = this;
    let delegate = componentManagerDelegates.get(owner);

    if (delegate === undefined) {
      let {
        factory
      } = this;
      delegate = factory(owner);

      if (DEBUG && !FROM_CAPABILITIES.has(delegate.capabilities)) {
        // TODO: This error message should make sense in both Ember and Glimmer https://github.com/glimmerjs/glimmer-vm/issues/1200
        throw new Error(`Custom modifier managers must have a \`capabilities\` property that is the result of calling the \`capabilities('3.13' | '3.22')\` (imported via \`import { capabilities } from '@ember/modifier';\`). Received: \`${JSON.stringify(delegate.capabilities)}\` for: \`${delegate}\``);
      }

      componentManagerDelegates.set(owner, delegate);
    }

    return delegate;
  }

  create(owner, element, definition, capturedArgs) {
    let delegate = this.getDelegateFor(owner);
    let {
      useArgsProxy,
      passFactoryToCreate
    } = delegate.capabilities;
    let argsProxy = argsProxyFor(capturedArgs, 'modifier');
    let args = useArgsProxy ? argsProxy : reifyArgs(capturedArgs);
    let instance;
    let factoryOrDefinition = definition;

    if (passFactoryToCreate) {
      // Make a fake factory. While not perfect, this should generally prevent
      // breakage in users of older modifier capabilities.
      factoryOrDefinition = {
        create(args) {
          let params = assign({}, args);
          setOwner(params, owner);
          return definition.create(args);
        },

        class: definition
      };
    }

    if (DEBUG && deprecateMutationsInTrackingTransaction !== undefined) {
      deprecateMutationsInTrackingTransaction(() => {
        instance = delegate.createModifier(factoryOrDefinition, args);
      });
    } else {
      instance = delegate.createModifier(factoryOrDefinition, args);
    }

    let tag = createUpdatableTag();
    let state;

    if (useArgsProxy) {
      state = {
        tag,
        element,
        delegate,
        args,
        modifier: instance
      };
    } else {
      state = {
        tag,
        element,
        modifier: instance,
        delegate,

        get args() {
          return reifyArgs(capturedArgs);
        }

      };
    }

    if (DEBUG) {
      state.debugName = typeof definition === 'function' ? definition.name : definition.toString();
    }

    registerDestructor(state, () => delegate.destroyModifier(instance, argsProxy));
    return state;
  }

  getDebugName({
    debugName
  }) {
    return debugName;
  }

  getTag({
    tag
  }) {
    return tag;
  }

  install({
    element,
    args,
    modifier,
    delegate
  }) {
    let {
      capabilities
    } = delegate;

    if (capabilities.disableAutoTracking === true) {
      untrack(() => delegate.installModifier(modifier, element, args));
    } else {
      delegate.installModifier(modifier, element, args);
    }
  }

  update({
    args,
    modifier,
    delegate
  }) {
    let {
      capabilities
    } = delegate;

    if (capabilities.disableAutoTracking === true) {
      untrack(() => delegate.updateModifier(modifier, args));
    } else {
      delegate.updateModifier(modifier, args);
    }
  }

  getDestroyable(state) {
    return state;
  }

}
function reifyArgs({
  named,
  positional
}) {
  let reifiedNamed = dict();

  for (let key in named) {
    reifiedNamed[key] = valueForRef(named[key]);
  }

  let reifiedPositional = positional.map(valueForRef);
  return {
    named: reifiedNamed,
    positional: reifiedPositional
  };
}

function helperCapabilities(managerAPI, options = {}) {
  if (DEBUG && managerAPI !== '3.23') {
    throw new Error('Invalid helper manager compatibility specified');
  }

  if (DEBUG && (!(options.hasValue || options.hasScheduledEffect) || options.hasValue && options.hasScheduledEffect)) {
    throw new Error('You must pass either the `hasValue` OR the `hasScheduledEffect` capability when defining a helper manager. Passing neither, or both, is not permitted.');
  }

  if (DEBUG && options.hasScheduledEffect) {
    throw new Error('The `hasScheduledEffect` capability has not yet been implemented for helper managers. Please pass `hasValue` instead');
  }

  return buildCapabilities({
    hasValue: Boolean(options.hasValue),
    hasDestroyable: Boolean(options.hasDestroyable),
    hasScheduledEffect: Boolean(options.hasScheduledEffect)
  });
} ////////////

function hasValue(manager) {
  return manager.capabilities.hasValue;
}
function hasDestroyable(manager) {
  return manager.capabilities.hasDestroyable;
} ////////////

class CustomHelperManager {
  constructor(factory) {
    this.factory = factory;
    this.helperManagerDelegates = new WeakMap();
    this.undefinedDelegate = null;
  }

  getDelegateForOwner(owner) {
    let delegate = this.helperManagerDelegates.get(owner);

    if (delegate === undefined) {
      let {
        factory
      } = this;
      delegate = factory(owner);

      if (DEBUG && !FROM_CAPABILITIES.has(delegate.capabilities)) {
        // TODO: This error message should make sense in both Ember and Glimmer https://github.com/glimmerjs/glimmer-vm/issues/1200
        throw new Error(`Custom helper managers must have a \`capabilities\` property that is the result of calling the \`capabilities('3.23')\` (imported via \`import { capabilities } from '@ember/helper';\`). Received: \`${JSON.stringify(delegate.capabilities)}\` for: \`${delegate}\``);
      }

      this.helperManagerDelegates.set(owner, delegate);
    }

    return delegate;
  }

  getDelegateFor(owner) {
    if (owner === undefined) {
      let {
        undefinedDelegate
      } = this;

      if (undefinedDelegate === null) {
        let {
          factory
        } = this;
        this.undefinedDelegate = undefinedDelegate = factory(undefined);
      }

      return undefinedDelegate;
    } else {
      return this.getDelegateForOwner(owner);
    }
  }

  getHelper(definition) {
    return (capturedArgs, owner) => {
      var _a, _b;

      let manager = this.getDelegateFor(owner);
      const args = argsProxyFor(capturedArgs, 'helper');
      const bucket = manager.createHelper(definition, args);

      if (hasValue(manager)) {
        let cache = createComputeRef(() => manager.getValue(bucket), null, DEBUG && manager.getDebugName && manager.getDebugName(definition));

        if (hasDestroyable(manager)) {
          associateDestroyableChild(cache, manager.getDestroyable(bucket));
        }

        return cache;
      } else if (hasDestroyable(manager)) {
        let ref = createConstRef(undefined, DEBUG && ((_b = (_a = manager.getDebugName) === null || _a === void 0 ? void 0 : _a.call(manager, definition)) !== null && _b !== void 0 ? _b : 'unknown helper'));
        associateDestroyableChild(ref, manager.getDestroyable(bucket));
        return ref;
      } else {
        return UNDEFINED_REFERENCE;
      }
    };
  }

}

function setComponentManager(factory, obj) {
  return setInternalComponentManager(new CustomComponentManager(factory), obj);
}
function setModifierManager(factory, obj) {
  return setInternalModifierManager(new CustomModifierManager(factory), obj);
}
function setHelperManager(factory, obj) {
  return setInternalHelperManager(new CustomHelperManager(factory), obj);
}

const TEMPLATES = new WeakMap();
const getPrototypeOf$1 = Object.getPrototypeOf;
function setComponentTemplate(factory, obj) {
  if (DEBUG && !(obj !== null && (typeof obj === 'object' || typeof obj === 'function'))) {
    throw new Error(`Cannot call \`setComponentTemplate\` on \`${debugToString(obj)}\``);
  }

  if (DEBUG && TEMPLATES.has(obj)) {
    throw new Error(`Cannot call \`setComponentTemplate\` multiple times on the same class (\`${debugToString(obj)}\`)`);
  }

  TEMPLATES.set(obj, factory);
  return obj;
}
function getComponentTemplate(obj) {
  let pointer = obj;

  while (pointer !== null) {
    let template = TEMPLATES.get(pointer);

    if (template !== undefined) {
      return template;
    }

    pointer = getPrototypeOf$1(pointer);
  }

  return undefined;
}

export { setInternalHelperManager, setInternalModifierManager, setInternalComponentManager, getInternalHelperManager, getInternalModifierManager, getInternalComponentManager, hasInternalHelperManager, hasInternalModifierManager, hasInternalComponentManager, setHelperManager, setModifierManager, setComponentManager, componentCapabilities, CustomComponentManager, modifierCapabilities, CustomModifierManager, helperCapabilities, hasDestroyable, hasValue, CustomHelperManager, getComponentTemplate, setComponentTemplate, capabilityFlagsFrom, hasCapability, managerHasCapability, getCustomTagFor, setCustomTagFor };
