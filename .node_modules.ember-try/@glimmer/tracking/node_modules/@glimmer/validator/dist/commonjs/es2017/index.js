'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _validators = require('./lib/validators');

Object.defineProperty(exports, 'ALLOW_CYCLES', {
  enumerable: true,
  get: function () {
    return _validators.ALLOW_CYCLES;
  }
});
Object.defineProperty(exports, 'bump', {
  enumerable: true,
  get: function () {
    return _validators.bump;
  }
});
Object.defineProperty(exports, 'combine', {
  enumerable: true,
  get: function () {
    return _validators.combine;
  }
});
Object.defineProperty(exports, 'COMPUTE', {
  enumerable: true,
  get: function () {
    return _validators.COMPUTE;
  }
});
Object.defineProperty(exports, 'CONSTANT_TAG', {
  enumerable: true,
  get: function () {
    return _validators.CONSTANT_TAG;
  }
});
Object.defineProperty(exports, 'CONSTANT', {
  enumerable: true,
  get: function () {
    return _validators.CONSTANT;
  }
});
Object.defineProperty(exports, 'createCombinatorTag', {
  enumerable: true,
  get: function () {
    return _validators.createCombinatorTag;
  }
});
Object.defineProperty(exports, 'createTag', {
  enumerable: true,
  get: function () {
    return _validators.createTag;
  }
});
Object.defineProperty(exports, 'createUpdatableTag', {
  enumerable: true,
  get: function () {
    return _validators.createUpdatableTag;
  }
});
Object.defineProperty(exports, 'CURRENT_TAG', {
  enumerable: true,
  get: function () {
    return _validators.CURRENT_TAG;
  }
});
Object.defineProperty(exports, 'dirty', {
  enumerable: true,
  get: function () {
    return _validators.dirty;
  }
});
Object.defineProperty(exports, 'INITIAL', {
  enumerable: true,
  get: function () {
    return _validators.INITIAL;
  }
});
Object.defineProperty(exports, 'isConst', {
  enumerable: true,
  get: function () {
    return _validators.isConst;
  }
});
Object.defineProperty(exports, 'isConstTag', {
  enumerable: true,
  get: function () {
    return _validators.isConstTag;
  }
});
Object.defineProperty(exports, 'update', {
  enumerable: true,
  get: function () {
    return _validators.update;
  }
});
Object.defineProperty(exports, 'validate', {
  enumerable: true,
  get: function () {
    return _validators.validate;
  }
});
Object.defineProperty(exports, 'value', {
  enumerable: true,
  get: function () {
    return _validators.value;
  }
});
Object.defineProperty(exports, 'VOLATILE_TAG', {
  enumerable: true,
  get: function () {
    return _validators.VOLATILE_TAG;
  }
});
Object.defineProperty(exports, 'VOLATILE', {
  enumerable: true,
  get: function () {
    return _validators.VOLATILE;
  }
});

var _meta = require('./lib/meta');

Object.defineProperty(exports, 'dirtyTag', {
  enumerable: true,
  get: function () {
    return _meta.dirtyTag;
  }
});
Object.defineProperty(exports, 'tagFor', {
  enumerable: true,
  get: function () {
    return _meta.tagFor;
  }
});
Object.defineProperty(exports, 'updateTag', {
  enumerable: true,
  get: function () {
    return _meta.updateTag;
  }
});

var _tracking = require('./lib/tracking');

Object.defineProperty(exports, 'track', {
  enumerable: true,
  get: function () {
    return _tracking.track;
  }
});
Object.defineProperty(exports, 'consume', {
  enumerable: true,
  get: function () {
    return _tracking.consume;
  }
});
Object.defineProperty(exports, 'EPOCH', {
  enumerable: true,
  get: function () {
    return _tracking.EPOCH;
  }
});
Object.defineProperty(exports, 'trackedData', {
  enumerable: true,
  get: function () {
    return _tracking.trackedData;
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozt1QkFBQSxJOzs7Ozs7dUJBQUEsTzs7Ozs7O3VCQUFBLE87Ozs7Ozt1QkFBQSxZOzs7Ozs7dUJBQUEsUTs7Ozs7O3VCQUFBLG1COzs7Ozs7dUJBQUEsUzs7Ozs7O3VCQUFBLGtCOzs7Ozs7dUJBQUEsVzs7Ozs7O3VCQUFBLEs7Ozs7Ozt1QkFBQSxPOzs7Ozs7dUJBQUEsTzs7Ozs7O3VCQUFBLFU7Ozs7Ozt1QkFBQSxNOzs7Ozs7dUJBQUEsUTs7Ozs7O3VCQUFBLEs7Ozs7Ozt1QkFBQSxZOzs7Ozs7dUJBQUEsUTs7Ozs7Ozs7O2lCQStCQSxROzs7Ozs7aUJBQUEsTTs7Ozs7O2lCQUFBLFM7Ozs7Ozs7OztxQkFFQSxLOzs7Ozs7cUJBQUEsTzs7Ozs7O3FCQUFBLEs7Ozs7OztxQkFBQSxXIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHtcbiAgQUxMT1dfQ1lDTEVTLFxuICBidW1wLFxuICBDb21iaW5hdG9yVGFnLFxuICBjb21iaW5lLFxuICBDT01QVVRFLFxuICBDT05TVEFOVF9UQUcsXG4gIENPTlNUQU5ULFxuICBDb25zdGFudFRhZyxcbiAgY3JlYXRlQ29tYmluYXRvclRhZyxcbiAgY3JlYXRlVGFnLFxuICBjcmVhdGVVcGRhdGFibGVUYWcsXG4gIENVUlJFTlRfVEFHLFxuICBkaXJ0eSxcbiAgRGlydHlhYmxlVGFnLFxuICBFbnRpdHlUYWcsXG4gIEVudGl0eVRhZ2dlZCxcbiAgSU5JVElBTCxcbiAgaXNDb25zdCxcbiAgaXNDb25zdFRhZyxcbiAgUmV2aXNpb24sXG4gIFRhZyxcbiAgVGFnZ2VkLFxuICBVcGRhdGFibGVUYWcsXG4gIHVwZGF0ZSxcbiAgdmFsaWRhdGUsXG4gIHZhbHVlLFxuICBWT0xBVElMRV9UQUcsXG4gIFZPTEFUSUxFLFxufSBmcm9tICcuL2xpYi92YWxpZGF0b3JzJztcblxuZXhwb3J0IHsgZGlydHlUYWcsIHRhZ0ZvciwgdXBkYXRlVGFnIH0gZnJvbSAnLi9saWIvbWV0YSc7XG5cbmV4cG9ydCB7IHRyYWNrLCBjb25zdW1lLCBFUE9DSCwgdHJhY2tlZERhdGEgfSBmcm9tICcuL2xpYi90cmFja2luZyc7XG4iXSwic291cmNlUm9vdCI6IiJ9