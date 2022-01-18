'use strict';

const broccoliFeatures = Object.freeze({
  persistentOutputFlag: true,
  sourceDirectories: true,
  needsCacheFlag: true,
  volatileFlag: true,
});

function isPossibleNode(node) {
  let type = typeof node;

  if (node === null) {
    return false;
  } else if (type === 'string') {
    return true;
  } else if (type === 'object' && typeof node.__broccoliGetInfo__ === 'function') {
    // Broccoli 1.x+
    return true;
  } else if (type === 'object' && typeof node.read === 'function') {
    // Broccoli / broccoli-builder <= 0.18
    return true;
  } else {
    return false;
  }
}

module.exports = class Plugin {
  constructor(inputNodes, options) {
    // Remember current call stack (minus "Error" line)
    this._instantiationStack = new Error().stack.replace(/[^\n]*\n/, '');

    options = options || {};
    if (options.name != null) {
      this._name = options.name;
    } else if (this.constructor && this.constructor.name != null) {
      this._name = this.constructor.name;
    } else {
      this._name = 'Plugin';
    }
    this._annotation = options.annotation;

    let label = this._name + (this._annotation != null ? ' (' + this._annotation + ')' : '');
    if (!Array.isArray(inputNodes))
      throw new TypeError(
        label + ': Expected an array of input nodes (input trees), got ' + inputNodes
      );
    for (let i = 0; i < inputNodes.length; i++) {
      if (!isPossibleNode(inputNodes[i])) {
        throw new TypeError(
          label + ': Expected Broccoli node, got ' + inputNodes[i] + ' for inputNodes[' + i + ']'
        );
      }
    }

    this._baseConstructorCalled = true;
    this._inputNodes = inputNodes;
    this._persistentOutput = !!options.persistentOutput;
    this._needsCache = options.needsCache != null ? !!options.needsCache : true;
    this._volatile = !!options.volatile;

    this._checkOverrides();

    // For future extensibility, we version the API using feature flags
    this.__broccoliFeatures__ = broccoliFeatures;
  }

  _checkOverrides() {
    if (typeof this.rebuild === 'function') {
      throw new Error('For compatibility, plugins must not define a plugin.rebuild() function');
    }
    if (this.read !== Plugin.prototype.read) {
      throw new Error('For compatibility, plugins must not define a plugin.read() function');
    }
    if (this.cleanup !== Plugin.prototype.cleanup) {
      throw new Error('For compatibility, plugins must not define a plugin.cleanup() function');
    }
  }

  // The Broccoli builder calls plugin.__broccoliGetInfo__
  __broccoliGetInfo__(builderFeatures) {
    this.builderFeatures = this._checkBuilderFeatures(builderFeatures);
    if (!this._baseConstructorCalled)
      throw new Error(
        'Plugin subclasses must call the superclass constructor: Plugin.call(this, inputNodes)'
      );

    let nodeInfo = {
      nodeType: 'transform',
      inputNodes: this._inputNodes,
      setup: this._setup.bind(this),
      getCallbackObject: this.getCallbackObject.bind(this), // .build, indirectly
      instantiationStack: this._instantiationStack,
      name: this._name,
      annotation: this._annotation,
      persistentOutput: this._persistentOutput,
      needsCache: this._needsCache,
      volatile: this._volatile,
    };

    // Go backwards in time, removing properties from nodeInfo if they are not
    // supported by the builder. Add new features at the top.
    if (!this.builderFeatures.needsCacheFlag) {
      delete nodeInfo.needsCache;
    }

    if (!this.builderFeatures.volatileFlag) {
      delete nodeInfo.volatile;
    }

    return nodeInfo;
  }

  _checkBuilderFeatures(builderFeatures) {
    if (builderFeatures == null) builderFeatures = this.__broccoliFeatures__;
    if (!builderFeatures.persistentOutputFlag || !builderFeatures.sourceDirectories) {
      // No builder in the wild implements less than these.
      throw new Error(
        'Minimum builderFeatures required: { persistentOutputFlag: true, sourceDirectories: true }'
      );
    }
    return builderFeatures;
  }

  _setup(builderFeatures, options) {
    builderFeatures = this._checkBuilderFeatures(builderFeatures);
    this._builderFeatures = builderFeatures;
    this.inputPaths = options.inputPaths;
    this.outputPath = options.outputPath;
    if (!this.builderFeatures.needsCacheFlag) {
      this.cachePath = this._needsCache ? options.cachePath : undefined;
    } else {
      this.cachePath = options.cachePath;
    }
  }

  toString() {
    return '[' + this._name + (this._annotation != null ? ': ' + this._annotation : '') + ']';
  }

  // Return obj on which the builder will call obj.build() repeatedly
  //
  // This indirection allows subclasses like broccoli-caching-writer to hook
  // into calls from the builder, by returning { build: someFunction }
  getCallbackObject() {
    return this;
  }

  build() {
    throw new Error('Plugin subclasses must implement a .build() function');
  }

  // Compatibility code so plugins can run on old, .read-based Broccoli:
  read(readTree) {
    if (this._readCompat == null) {
      try {
        this._initializeReadCompat(); // call this.__broccoliGetInfo__()
      } catch (err) {
        // Prevent trying to initialize again on next .read
        this._readCompat = false;
        // Remember error so we can throw it on all subsequent .read calls
        this._readCompatError = err;
      }
    }

    if (this._readCompatError != null) throw this._readCompatError;

    return this._readCompat.read(readTree);
  }

  cleanup() {
    if (this._readCompat) return this._readCompat.cleanup();
  }

  _initializeReadCompat() {
    let ReadCompat = require('./read_compat');
    this._readCompat = new ReadCompat(this);
  }
};
