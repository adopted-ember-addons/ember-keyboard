"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ALLOW_CYCLES", {
  enumerable: true,
  get: function () {
    return _validators.ALLOW_CYCLES;
  }
});
Object.defineProperty(exports, "bump", {
  enumerable: true,
  get: function () {
    return _validators.bump;
  }
});
Object.defineProperty(exports, "combine", {
  enumerable: true,
  get: function () {
    return _validators.combine;
  }
});
Object.defineProperty(exports, "COMPUTE", {
  enumerable: true,
  get: function () {
    return _validators.COMPUTE;
  }
});
Object.defineProperty(exports, "CONSTANT_TAG", {
  enumerable: true,
  get: function () {
    return _validators.CONSTANT_TAG;
  }
});
Object.defineProperty(exports, "CONSTANT", {
  enumerable: true,
  get: function () {
    return _validators.CONSTANT;
  }
});
Object.defineProperty(exports, "createTag", {
  enumerable: true,
  get: function () {
    return _validators.createTag;
  }
});
Object.defineProperty(exports, "createUpdatableTag", {
  enumerable: true,
  get: function () {
    return _validators.createUpdatableTag;
  }
});
Object.defineProperty(exports, "CurrentTag", {
  enumerable: true,
  get: function () {
    return _validators.CurrentTag;
  }
});
Object.defineProperty(exports, "CURRENT_TAG", {
  enumerable: true,
  get: function () {
    return _validators.CURRENT_TAG;
  }
});
Object.defineProperty(exports, "dirtyTag", {
  enumerable: true,
  get: function () {
    return _validators.DIRTY_TAG;
  }
});
Object.defineProperty(exports, "INITIAL", {
  enumerable: true,
  get: function () {
    return _validators.INITIAL;
  }
});
Object.defineProperty(exports, "isConstTag", {
  enumerable: true,
  get: function () {
    return _validators.isConstTag;
  }
});
Object.defineProperty(exports, "updateTag", {
  enumerable: true,
  get: function () {
    return _validators.UPDATE_TAG;
  }
});
Object.defineProperty(exports, "validateTag", {
  enumerable: true,
  get: function () {
    return _validators.validateTag;
  }
});
Object.defineProperty(exports, "valueForTag", {
  enumerable: true,
  get: function () {
    return _validators.valueForTag;
  }
});
Object.defineProperty(exports, "VolatileTag", {
  enumerable: true,
  get: function () {
    return _validators.VolatileTag;
  }
});
Object.defineProperty(exports, "VOLATILE_TAG", {
  enumerable: true,
  get: function () {
    return _validators.VOLATILE_TAG;
  }
});
Object.defineProperty(exports, "VOLATILE", {
  enumerable: true,
  get: function () {
    return _validators.VOLATILE;
  }
});
Object.defineProperty(exports, "dirtyTagFor", {
  enumerable: true,
  get: function () {
    return _meta.dirtyTagFor;
  }
});
Object.defineProperty(exports, "tagFor", {
  enumerable: true,
  get: function () {
    return _meta.tagFor;
  }
});
Object.defineProperty(exports, "tagMetaFor", {
  enumerable: true,
  get: function () {
    return _meta.tagMetaFor;
  }
});
Object.defineProperty(exports, "beginTrackFrame", {
  enumerable: true,
  get: function () {
    return _tracking.beginTrackFrame;
  }
});
Object.defineProperty(exports, "endTrackFrame", {
  enumerable: true,
  get: function () {
    return _tracking.endTrackFrame;
  }
});
Object.defineProperty(exports, "beginUntrackFrame", {
  enumerable: true,
  get: function () {
    return _tracking.beginUntrackFrame;
  }
});
Object.defineProperty(exports, "endUntrackFrame", {
  enumerable: true,
  get: function () {
    return _tracking.endUntrackFrame;
  }
});
Object.defineProperty(exports, "resetTracking", {
  enumerable: true,
  get: function () {
    return _tracking.resetTracking;
  }
});
Object.defineProperty(exports, "consumeTag", {
  enumerable: true,
  get: function () {
    return _tracking.consumeTag;
  }
});
Object.defineProperty(exports, "isTracking", {
  enumerable: true,
  get: function () {
    return _tracking.isTracking;
  }
});
Object.defineProperty(exports, "track", {
  enumerable: true,
  get: function () {
    return _tracking.track;
  }
});
Object.defineProperty(exports, "untrack", {
  enumerable: true,
  get: function () {
    return _tracking.untrack;
  }
});
Object.defineProperty(exports, "createCache", {
  enumerable: true,
  get: function () {
    return _tracking.createCache;
  }
});
Object.defineProperty(exports, "isConst", {
  enumerable: true,
  get: function () {
    return _tracking.isConst;
  }
});
Object.defineProperty(exports, "getValue", {
  enumerable: true,
  get: function () {
    return _tracking.getValue;
  }
});
Object.defineProperty(exports, "trackedData", {
  enumerable: true,
  get: function () {
    return _trackedData.trackedData;
  }
});
Object.defineProperty(exports, "logTrackingStack", {
  enumerable: true,
  get: function () {
    return _debug.logTrackingStack;
  }
});
Object.defineProperty(exports, "setTrackingTransactionEnv", {
  enumerable: true,
  get: function () {
    return _debug.setTrackingTransactionEnv;
  }
});
Object.defineProperty(exports, "runInTrackingTransaction", {
  enumerable: true,
  get: function () {
    return _debug.runInTrackingTransaction;
  }
});
Object.defineProperty(exports, "beginTrackingTransaction", {
  enumerable: true,
  get: function () {
    return _debug.beginTrackingTransaction;
  }
});
Object.defineProperty(exports, "endTrackingTransaction", {
  enumerable: true,
  get: function () {
    return _debug.endTrackingTransaction;
  }
});
Object.defineProperty(exports, "deprecateMutationsInTrackingTransaction", {
  enumerable: true,
  get: function () {
    return _debug.deprecateMutationsInTrackingTransaction;
  }
});

var _utils = require("./lib/utils");

var _validators = require("./lib/validators");

var _meta = require("./lib/meta");

var _tracking = require("./lib/tracking");

var _trackedData = require("./lib/tracked-data");

var _debug = require("./lib/debug");

var GLIMMER_VALIDATOR_REGISTRATION = (0, _utils.symbolFor)('GLIMMER_VALIDATOR_REGISTRATION');
var globalObj = (0, _utils.getGlobal)();

if (globalObj[GLIMMER_VALIDATOR_REGISTRATION] === true) {
  throw new Error('The `@glimmer/validator` library has been included twice in this application. It could be different versions of the package, or the same version included twice by mistake. `@glimmer/validator` depends on having a single copy of the package in use at any time in an application, even if they are the same version. You must dedupe your build to remove the duplicate packages in order to prevent this error.');
}

globalObj[GLIMMER_VALIDATOR_REGISTRATION] = true;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFjQTs7QUE2QkE7O0FBRUE7O0FBZ0JBOztBQUVBOztBQTdEQSxJQUFNLDhCQUE4QixHQUFHLHNCQUF2QyxnQ0FBdUMsQ0FBdkM7QUFFQSxJQUFNLFNBQVMsR0FBZix1QkFBQTs7QUFFQSxJQUFJLFNBQVMsQ0FBVCw4QkFBUyxDQUFULEtBQUosSUFBQSxFQUF3RDtBQUN0RCxRQUFNLElBQUEsS0FBQSxDQUFOLHNaQUFNLENBQU47QUFHRDs7QUFFRCxTQUFTLENBQVQsOEJBQVMsQ0FBVCxHQUFBLElBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzeW1ib2xGb3IsIGdldEdsb2JhbCB9IGZyb20gJy4vbGliL3V0aWxzJztcblxuY29uc3QgR0xJTU1FUl9WQUxJREFUT1JfUkVHSVNUUkFUSU9OID0gc3ltYm9sRm9yKCdHTElNTUVSX1ZBTElEQVRPUl9SRUdJU1RSQVRJT04nKTtcblxuY29uc3QgZ2xvYmFsT2JqID0gZ2V0R2xvYmFsKCk7XG5cbmlmIChnbG9iYWxPYmpbR0xJTU1FUl9WQUxJREFUT1JfUkVHSVNUUkFUSU9OXSA9PT0gdHJ1ZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgJ1RoZSBgQGdsaW1tZXIvdmFsaWRhdG9yYCBsaWJyYXJ5IGhhcyBiZWVuIGluY2x1ZGVkIHR3aWNlIGluIHRoaXMgYXBwbGljYXRpb24uIEl0IGNvdWxkIGJlIGRpZmZlcmVudCB2ZXJzaW9ucyBvZiB0aGUgcGFja2FnZSwgb3IgdGhlIHNhbWUgdmVyc2lvbiBpbmNsdWRlZCB0d2ljZSBieSBtaXN0YWtlLiBgQGdsaW1tZXIvdmFsaWRhdG9yYCBkZXBlbmRzIG9uIGhhdmluZyBhIHNpbmdsZSBjb3B5IG9mIHRoZSBwYWNrYWdlIGluIHVzZSBhdCBhbnkgdGltZSBpbiBhbiBhcHBsaWNhdGlvbiwgZXZlbiBpZiB0aGV5IGFyZSB0aGUgc2FtZSB2ZXJzaW9uLiBZb3UgbXVzdCBkZWR1cGUgeW91ciBidWlsZCB0byByZW1vdmUgdGhlIGR1cGxpY2F0ZSBwYWNrYWdlcyBpbiBvcmRlciB0byBwcmV2ZW50IHRoaXMgZXJyb3IuJ1xuICApO1xufVxuXG5nbG9iYWxPYmpbR0xJTU1FUl9WQUxJREFUT1JfUkVHSVNUUkFUSU9OXSA9IHRydWU7XG5cbmV4cG9ydCB7XG4gIEFMTE9XX0NZQ0xFUyxcbiAgYnVtcCxcbiAgQ29tYmluYXRvclRhZyxcbiAgY29tYmluZSxcbiAgQ09NUFVURSxcbiAgQ09OU1RBTlRfVEFHLFxuICBDT05TVEFOVCxcbiAgQ29uc3RhbnRUYWcsXG4gIGNyZWF0ZVRhZyxcbiAgY3JlYXRlVXBkYXRhYmxlVGFnLFxuICBDdXJyZW50VGFnLFxuICBDVVJSRU5UX1RBRyxcbiAgRElSVFlfVEFHIGFzIGRpcnR5VGFnLFxuICBEaXJ0eWFibGVUYWcsXG4gIEVudGl0eVRhZyxcbiAgSU5JVElBTCxcbiAgaXNDb25zdFRhZyxcbiAgUmV2aXNpb24sXG4gIFRhZyxcbiAgVXBkYXRhYmxlVGFnLFxuICBVUERBVEVfVEFHIGFzIHVwZGF0ZVRhZyxcbiAgdmFsaWRhdGVUYWcsXG4gIHZhbHVlRm9yVGFnLFxuICBWb2xhdGlsZVRhZyxcbiAgVk9MQVRJTEVfVEFHLFxuICBWT0xBVElMRSxcbn0gZnJvbSAnLi9saWIvdmFsaWRhdG9ycyc7XG5cbmV4cG9ydCB7IGRpcnR5VGFnRm9yLCB0YWdGb3IsIHRhZ01ldGFGb3IsIFRhZ01ldGEgfSBmcm9tICcuL2xpYi9tZXRhJztcblxuZXhwb3J0IHtcbiAgYmVnaW5UcmFja0ZyYW1lLFxuICBlbmRUcmFja0ZyYW1lLFxuICBiZWdpblVudHJhY2tGcmFtZSxcbiAgZW5kVW50cmFja0ZyYW1lLFxuICByZXNldFRyYWNraW5nLFxuICBjb25zdW1lVGFnLFxuICBpc1RyYWNraW5nLFxuICB0cmFjayxcbiAgdW50cmFjayxcbiAgQ2FjaGUsXG4gIGNyZWF0ZUNhY2hlLFxuICBpc0NvbnN0LFxuICBnZXRWYWx1ZSxcbn0gZnJvbSAnLi9saWIvdHJhY2tpbmcnO1xuXG5leHBvcnQgeyB0cmFja2VkRGF0YSB9IGZyb20gJy4vbGliL3RyYWNrZWQtZGF0YSc7XG5cbmV4cG9ydCB7XG4gIGxvZ1RyYWNraW5nU3RhY2ssXG4gIHNldFRyYWNraW5nVHJhbnNhY3Rpb25FbnYsXG4gIHJ1bkluVHJhY2tpbmdUcmFuc2FjdGlvbixcbiAgYmVnaW5UcmFja2luZ1RyYW5zYWN0aW9uLFxuICBlbmRUcmFja2luZ1RyYW5zYWN0aW9uLFxuICBkZXByZWNhdGVNdXRhdGlvbnNJblRyYWNraW5nVHJhbnNhY3Rpb24sXG59IGZyb20gJy4vbGliL2RlYnVnJztcbiJdLCJzb3VyY2VSb290IjoiIn0=