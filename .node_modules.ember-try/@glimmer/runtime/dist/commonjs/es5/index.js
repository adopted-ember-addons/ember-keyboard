'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SERIALIZATION_FIRST_NODE_STRING = exports.rehydrationBuilder = exports.RehydrateBuilder = exports.isSerializationFirstNode = exports.RemoteLiveBlock = exports.UpdatableBlockImpl = exports.NewElementBuilder = exports.clientBuilder = exports.SimpleDynamicAttribute = exports.dynamicAttribute = exports.DynamicAttribute = exports.EMPTY_ARGS = exports.LowLevelVM = exports.UpdatingVM = exports.renderSync = exports.renderJitMain = exports.renderJitComponent = exports.renderAotMain = exports.renderAotComponent = exports.renderAot = exports.UNDEFINED_REFERENCE = exports.PrimitiveReference = exports.NULL_REFERENCE = exports.ConditionalReference = exports.getDynamicVar = exports.ScopeImpl = exports.RuntimeEnvironment = exports.JitRuntime = exports.JitRuntimeFromProgram = exports.CustomJitRuntime = exports.DefaultEnvironment = exports.EnvironmentImpl = exports.AotRuntime = exports.DefaultDynamicScope = exports.normalizeProperty = exports.isWhitespace = exports.DOMTreeConstruction = exports.IDOMChanges = exports.DOMChanges = exports.MINIMAL_CAPABILITIES = exports.DEFAULT_CAPABILITIES = exports.isCurriedComponentDefinition = exports.curry = exports.CurriedComponentDefinition = exports.setDebuggerCallback = exports.resetDebuggerCallback = exports.hasCapability = exports.capabilityFlagsFrom = exports.CursorImpl = exports.ConcreteBounds = exports.clear = undefined;

var _bounds = require('./lib/bounds');

Object.defineProperty(exports, 'clear', {
  enumerable: true,
  get: function () {
    return _bounds.clear;
  }
});
Object.defineProperty(exports, 'ConcreteBounds', {
  enumerable: true,
  get: function () {
    return _bounds.ConcreteBounds;
  }
});
Object.defineProperty(exports, 'CursorImpl', {
  enumerable: true,
  get: function () {
    return _bounds.CursorImpl;
  }
});

var _capabilities = require('./lib/capabilities');

Object.defineProperty(exports, 'capabilityFlagsFrom', {
  enumerable: true,
  get: function () {
    return _capabilities.capabilityFlagsFrom;
  }
});
Object.defineProperty(exports, 'hasCapability', {
  enumerable: true,
  get: function () {
    return _capabilities.hasCapability;
  }
});

var _debugger = require('./lib/compiled/opcodes/debugger');

Object.defineProperty(exports, 'resetDebuggerCallback', {
  enumerable: true,
  get: function () {
    return _debugger.resetDebuggerCallback;
  }
});
Object.defineProperty(exports, 'setDebuggerCallback', {
  enumerable: true,
  get: function () {
    return _debugger.setDebuggerCallback;
  }
});

var _curriedComponent = require('./lib/component/curried-component');

Object.defineProperty(exports, 'CurriedComponentDefinition', {
  enumerable: true,
  get: function () {
    return _curriedComponent.CurriedComponentDefinition;
  }
});
Object.defineProperty(exports, 'curry', {
  enumerable: true,
  get: function () {
    return _curriedComponent.curry;
  }
});
Object.defineProperty(exports, 'isCurriedComponentDefinition', {
  enumerable: true,
  get: function () {
    return _curriedComponent.isCurriedComponentDefinition;
  }
});

var _interfaces = require('./lib/component/interfaces');

Object.defineProperty(exports, 'DEFAULT_CAPABILITIES', {
  enumerable: true,
  get: function () {
    return _interfaces.DEFAULT_CAPABILITIES;
  }
});
Object.defineProperty(exports, 'MINIMAL_CAPABILITIES', {
  enumerable: true,
  get: function () {
    return _interfaces.MINIMAL_CAPABILITIES;
  }
});

var _manager = require('./lib/component/manager');

Object.keys(_manager).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _manager[key];
    }
  });
});

var _helper = require('./lib/dom/helper');

Object.defineProperty(exports, 'DOMChanges', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_helper).default;
  }
});
Object.defineProperty(exports, 'IDOMChanges', {
  enumerable: true,
  get: function () {
    return _helper.DOMChangesImpl;
  }
});
Object.defineProperty(exports, 'DOMTreeConstruction', {
  enumerable: true,
  get: function () {
    return _helper.DOMTreeConstruction;
  }
});
Object.defineProperty(exports, 'isWhitespace', {
  enumerable: true,
  get: function () {
    return _helper.isWhitespace;
  }
});

var _props = require('./lib/dom/props');

Object.defineProperty(exports, 'normalizeProperty', {
  enumerable: true,
  get: function () {
    return _props.normalizeProperty;
  }
});

var _dynamicScope = require('./lib/dynamic-scope');

Object.defineProperty(exports, 'DefaultDynamicScope', {
  enumerable: true,
  get: function () {
    return _dynamicScope.DefaultDynamicScope;
  }
});

var _environment = require('./lib/environment');

Object.defineProperty(exports, 'AotRuntime', {
  enumerable: true,
  get: function () {
    return _environment.AotRuntime;
  }
});
Object.defineProperty(exports, 'EnvironmentImpl', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_environment).default;
  }
});
Object.defineProperty(exports, 'DefaultEnvironment', {
  enumerable: true,
  get: function () {
    return _environment.DefaultEnvironment;
  }
});
Object.defineProperty(exports, 'CustomJitRuntime', {
  enumerable: true,
  get: function () {
    return _environment.CustomJitRuntime;
  }
});
Object.defineProperty(exports, 'JitRuntimeFromProgram', {
  enumerable: true,
  get: function () {
    return _environment.JitRuntimeFromProgram;
  }
});
Object.defineProperty(exports, 'JitRuntime', {
  enumerable: true,
  get: function () {
    return _environment.JitRuntime;
  }
});
Object.defineProperty(exports, 'RuntimeEnvironment', {
  enumerable: true,
  get: function () {
    return _environment.RuntimeEnvironment;
  }
});
Object.defineProperty(exports, 'ScopeImpl', {
  enumerable: true,
  get: function () {
    return _environment.ScopeImpl;
  }
});

var _getDynamicVar = require('./lib/helpers/get-dynamic-var');

Object.defineProperty(exports, 'getDynamicVar', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_getDynamicVar).default;
  }
});

var _references = require('./lib/references');

Object.defineProperty(exports, 'ConditionalReference', {
  enumerable: true,
  get: function () {
    return _references.ConditionalReference;
  }
});
Object.defineProperty(exports, 'NULL_REFERENCE', {
  enumerable: true,
  get: function () {
    return _references.NULL_REFERENCE;
  }
});
Object.defineProperty(exports, 'PrimitiveReference', {
  enumerable: true,
  get: function () {
    return _references.PrimitiveReference;
  }
});
Object.defineProperty(exports, 'UNDEFINED_REFERENCE', {
  enumerable: true,
  get: function () {
    return _references.UNDEFINED_REFERENCE;
  }
});

var _render = require('./lib/render');

Object.defineProperty(exports, 'renderAot', {
  enumerable: true,
  get: function () {
    return _render.renderAot;
  }
});
Object.defineProperty(exports, 'renderAotComponent', {
  enumerable: true,
  get: function () {
    return _render.renderAotComponent;
  }
});
Object.defineProperty(exports, 'renderAotMain', {
  enumerable: true,
  get: function () {
    return _render.renderAotMain;
  }
});
Object.defineProperty(exports, 'renderJitComponent', {
  enumerable: true,
  get: function () {
    return _render.renderJitComponent;
  }
});
Object.defineProperty(exports, 'renderJitMain', {
  enumerable: true,
  get: function () {
    return _render.renderJitMain;
  }
});
Object.defineProperty(exports, 'renderSync', {
  enumerable: true,
  get: function () {
    return _render.renderSync;
  }
});

var _vm = require('./lib/vm');

Object.defineProperty(exports, 'UpdatingVM', {
  enumerable: true,
  get: function () {
    return _vm.UpdatingVM;
  }
});
Object.defineProperty(exports, 'LowLevelVM', {
  enumerable: true,
  get: function () {
    return _vm.VM;
  }
});

var _arguments = require('./lib/vm/arguments');

Object.defineProperty(exports, 'EMPTY_ARGS', {
  enumerable: true,
  get: function () {
    return _arguments.EMPTY_ARGS;
  }
});

var _dynamic = require('./lib/vm/attributes/dynamic');

Object.defineProperty(exports, 'DynamicAttribute', {
  enumerable: true,
  get: function () {
    return _dynamic.DynamicAttribute;
  }
});
Object.defineProperty(exports, 'dynamicAttribute', {
  enumerable: true,
  get: function () {
    return _dynamic.dynamicAttribute;
  }
});
Object.defineProperty(exports, 'SimpleDynamicAttribute', {
  enumerable: true,
  get: function () {
    return _dynamic.SimpleDynamicAttribute;
  }
});

var _elementBuilder = require('./lib/vm/element-builder');

Object.defineProperty(exports, 'clientBuilder', {
  enumerable: true,
  get: function () {
    return _elementBuilder.clientBuilder;
  }
});
Object.defineProperty(exports, 'NewElementBuilder', {
  enumerable: true,
  get: function () {
    return _elementBuilder.NewElementBuilder;
  }
});
Object.defineProperty(exports, 'UpdatableBlockImpl', {
  enumerable: true,
  get: function () {
    return _elementBuilder.UpdatableBlockImpl;
  }
});
Object.defineProperty(exports, 'RemoteLiveBlock', {
  enumerable: true,
  get: function () {
    return _elementBuilder.RemoteLiveBlock;
  }
});

var _rehydrateBuilder = require('./lib/vm/rehydrate-builder');

Object.defineProperty(exports, 'isSerializationFirstNode', {
  enumerable: true,
  get: function () {
    return _rehydrateBuilder.isSerializationFirstNode;
  }
});
Object.defineProperty(exports, 'RehydrateBuilder', {
  enumerable: true,
  get: function () {
    return _rehydrateBuilder.RehydrateBuilder;
  }
});
Object.defineProperty(exports, 'rehydrationBuilder', {
  enumerable: true,
  get: function () {
    return _rehydrateBuilder.rehydrationBuilder;
  }
});
Object.defineProperty(exports, 'SERIALIZATION_FIRST_NODE_STRING', {
  enumerable: true,
  get: function () {
    return _rehydrateBuilder.SERIALIZATION_FIRST_NODE_STRING;
  }
});

require('./lib/bootstrap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O21CQU1BLEs7Ozs7OzttQkFBQSxjOzs7Ozs7bUJBQUEsVTs7Ozs7Ozs7O3lCQUNBLG1COzs7Ozs7eUJBQUEsYTs7Ozs7Ozs7O3FCQUNBLHFCOzs7Ozs7cUJBQUEsbUI7Ozs7Ozs7Ozs2QkFLQSwwQjs7Ozs7OzZCQUFBLEs7Ozs7Ozs2QkFBQSw0Qjs7Ozs7Ozs7O3VCQUtBLG9COzs7Ozs7dUJBQUEsb0I7Ozs7OztBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7Ozs7OzsyQ0FDQSxPOzs7Ozs7bUJBQUEsYzs7Ozs7O21CQUFBLG1COzs7Ozs7bUJBQUEsWTs7Ozs7Ozs7O2tCQU1BLGlCOzs7Ozs7Ozs7eUJBQ0EsbUI7Ozs7Ozs7Ozt3QkFDQSxVOzs7Ozs7Z0RBQUEsTzs7Ozs7O3dCQUFBLGtCOzs7Ozs7d0JBQUEsZ0I7Ozs7Ozt3QkFBQSxxQjs7Ozs7O3dCQUFBLFU7Ozs7Ozt3QkFBQSxrQjs7Ozs7O3dCQUFBLFM7Ozs7Ozs7OztrREFZQSxPOzs7Ozs7Ozs7dUJBRUEsb0I7Ozs7Ozt1QkFBQSxjOzs7Ozs7dUJBQUEsa0I7Ozs7Ozt1QkFBQSxtQjs7Ozs7Ozs7O21CQU1BLFM7Ozs7OzttQkFBQSxrQjs7Ozs7O21CQUFBLGE7Ozs7OzttQkFBQSxrQjs7Ozs7O21CQUFBLGE7Ozs7OzttQkFBQSxVOzs7Ozs7Ozs7ZUFVQSxVOzs7Ozs7ZUFBQSxFOzs7Ozs7Ozs7c0JBQ0EsVTs7Ozs7Ozs7O29CQUVBLGdCOzs7Ozs7b0JBQUEsZ0I7Ozs7OztvQkFBQSxzQjs7Ozs7Ozs7OzJCQUtBLGE7Ozs7OzsyQkFBQSxpQjs7Ozs7OzJCQUFBLGtCOzs7Ozs7MkJBQUEsZTs7Ozs7Ozs7OzZCQU1BLHdCOzs7Ozs7NkJBQUEsZ0I7Ozs7Ozs2QkFBQSxrQjs7Ozs7OzZCQUFBLCtCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZGVwcmVjYXRlZCB1c2UgUmljaEl0ZXJhdG9yUmVzdWx0PFRpY2ssIFJldHVybj4gb3IgVGVtcGxhdGVJdGVyYXRvciBpbnN0ZWFkXG4gKi9cbmltcG9ydCB7IFJpY2hJdGVyYXRvclJlc3VsdCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0ICcuL2xpYi9ib290c3RyYXAnO1xuXG5leHBvcnQgeyBjbGVhciwgQ29uY3JldGVCb3VuZHMsIEN1cnNvckltcGwgfSBmcm9tICcuL2xpYi9ib3VuZHMnO1xuZXhwb3J0IHsgQ2FwYWJpbGl0eSwgY2FwYWJpbGl0eUZsYWdzRnJvbSwgaGFzQ2FwYWJpbGl0eSB9IGZyb20gJy4vbGliL2NhcGFiaWxpdGllcyc7XG5leHBvcnQge1xuICBEZWJ1Z0NhbGxiYWNrLFxuICByZXNldERlYnVnZ2VyQ2FsbGJhY2ssXG4gIHNldERlYnVnZ2VyQ2FsbGJhY2ssXG59IGZyb20gJy4vbGliL2NvbXBpbGVkL29wY29kZXMvZGVidWdnZXInO1xuZXhwb3J0IHtcbiAgQ3VycmllZENvbXBvbmVudERlZmluaXRpb24sXG4gIGN1cnJ5LFxuICBpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uLFxufSBmcm9tICcuL2xpYi9jb21wb25lbnQvY3VycmllZC1jb21wb25lbnQnO1xuZXhwb3J0IHsgREVGQVVMVF9DQVBBQklMSVRJRVMsIE1JTklNQUxfQ0FQQUJJTElUSUVTIH0gZnJvbSAnLi9saWIvY29tcG9uZW50L2ludGVyZmFjZXMnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvY29tcG9uZW50L21hbmFnZXInO1xuZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyBET01DaGFuZ2VzLFxuICBET01DaGFuZ2VzSW1wbCBhcyBJRE9NQ2hhbmdlcyxcbiAgRE9NVHJlZUNvbnN0cnVjdGlvbixcbiAgaXNXaGl0ZXNwYWNlLFxufSBmcm9tICcuL2xpYi9kb20vaGVscGVyJztcbmV4cG9ydCB7IG5vcm1hbGl6ZVByb3BlcnR5IH0gZnJvbSAnLi9saWIvZG9tL3Byb3BzJztcbmV4cG9ydCB7IERlZmF1bHREeW5hbWljU2NvcGUgfSBmcm9tICcuL2xpYi9keW5hbWljLXNjb3BlJztcbmV4cG9ydCB7XG4gIEFvdFJ1bnRpbWUsXG4gIGRlZmF1bHQgYXMgRW52aXJvbm1lbnRJbXBsLFxuICBEZWZhdWx0RW52aXJvbm1lbnQsXG4gIEN1c3RvbUppdFJ1bnRpbWUsXG4gIEppdFJ1bnRpbWVGcm9tUHJvZ3JhbSxcbiAgSml0UnVudGltZSxcbiAgUnVudGltZUVudmlyb25tZW50LFxuICBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZSxcbiAgU2NvcGVJbXBsLFxuICBKaXRTeW50YXhDb21waWxhdGlvbkNvbnRleHQsXG59IGZyb20gJy4vbGliL2Vudmlyb25tZW50JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgZ2V0RHluYW1pY1ZhciB9IGZyb20gJy4vbGliL2hlbHBlcnMvZ2V0LWR5bmFtaWMtdmFyJztcbmV4cG9ydCB7IFB1YmxpY01vZGlmaWVyRGVmaW5pdGlvbiBhcyBNb2RpZmllckRlZmluaXRpb24gfSBmcm9tICcuL2xpYi9tb2RpZmllci9pbnRlcmZhY2VzJztcbmV4cG9ydCB7XG4gIENvbmRpdGlvbmFsUmVmZXJlbmNlLFxuICBOVUxMX1JFRkVSRU5DRSxcbiAgUHJpbWl0aXZlUmVmZXJlbmNlLFxuICBVTkRFRklORURfUkVGRVJFTkNFLFxufSBmcm9tICcuL2xpYi9yZWZlcmVuY2VzJztcbmV4cG9ydCB7XG4gIHJlbmRlckFvdCxcbiAgcmVuZGVyQW90Q29tcG9uZW50LFxuICByZW5kZXJBb3RNYWluLFxuICBSZW5kZXJDb21wb25lbnRBcmdzLFxuICByZW5kZXJKaXRDb21wb25lbnQsXG4gIHJlbmRlckppdE1haW4sXG4gIHJlbmRlclN5bmMsXG59IGZyb20gJy4vbGliL3JlbmRlcic7XG5leHBvcnQgeyBTYWZlU3RyaW5nIH0gZnJvbSAnLi9saWIvdXBzZXJ0JztcbmV4cG9ydCB7IEludGVybmFsVk0sIFVwZGF0aW5nVk0sIFZNIGFzIExvd0xldmVsVk0gfSBmcm9tICcuL2xpYi92bSc7XG5leHBvcnQgeyBFTVBUWV9BUkdTIH0gZnJvbSAnLi9saWIvdm0vYXJndW1lbnRzJztcbmV4cG9ydCB7IEF0dHJpYnV0ZU9wZXJhdGlvbiB9IGZyb20gJy4vbGliL3ZtL2F0dHJpYnV0ZXMnO1xuZXhwb3J0IHtcbiAgRHluYW1pY0F0dHJpYnV0ZSxcbiAgZHluYW1pY0F0dHJpYnV0ZSxcbiAgU2ltcGxlRHluYW1pY0F0dHJpYnV0ZSxcbn0gZnJvbSAnLi9saWIvdm0vYXR0cmlidXRlcy9keW5hbWljJztcbmV4cG9ydCB7XG4gIGNsaWVudEJ1aWxkZXIsXG4gIE5ld0VsZW1lbnRCdWlsZGVyLFxuICBVcGRhdGFibGVCbG9ja0ltcGwsXG4gIFJlbW90ZUxpdmVCbG9jayxcbn0gZnJvbSAnLi9saWIvdm0vZWxlbWVudC1idWlsZGVyJztcbmV4cG9ydCB7XG4gIGlzU2VyaWFsaXphdGlvbkZpcnN0Tm9kZSxcbiAgUmVoeWRyYXRlQnVpbGRlcixcbiAgcmVoeWRyYXRpb25CdWlsZGVyLFxuICBTRVJJQUxJWkFUSU9OX0ZJUlNUX05PREVfU1RSSU5HLFxufSBmcm9tICcuL2xpYi92bS9yZWh5ZHJhdGUtYnVpbGRlcic7XG5cbmV4cG9ydCB0eXBlIEl0ZXJhdG9yUmVzdWx0PFQ+ID0gUmljaEl0ZXJhdG9yUmVzdWx0PG51bGwsIFQ+O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==