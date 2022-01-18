define('@glimmer/di/index', ['exports', '@glimmer/di/container', '@glimmer/di/registry', '@glimmer/di/owner', '@glimmer/di/specifier'], function (exports, _container, _registry, _owner, _specifier) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'Container', {
    enumerable: true,
    get: function () {
      return _interopRequireDefault(_container).default;
    }
  });
  Object.defineProperty(exports, 'Registry', {
    enumerable: true,
    get: function () {
      return _interopRequireDefault(_registry).default;
    }
  });
  Object.defineProperty(exports, 'getOwner', {
    enumerable: true,
    get: function () {
      return _owner.getOwner;
    }
  });
  Object.defineProperty(exports, 'setOwner', {
    enumerable: true,
    get: function () {
      return _owner.setOwner;
    }
  });
  Object.defineProperty(exports, 'OWNER', {
    enumerable: true,
    get: function () {
      return _owner.OWNER;
    }
  });
  Object.defineProperty(exports, 'isSpecifierStringAbsolute', {
    enumerable: true,
    get: function () {
      return _specifier.isSpecifierStringAbsolute;
    }
  });
  Object.defineProperty(exports, 'isSpecifierObjectAbsolute', {
    enumerable: true,
    get: function () {
      return _specifier.isSpecifierObjectAbsolute;
    }
  });
  Object.defineProperty(exports, 'serializeSpecifier', {
    enumerable: true,
    get: function () {
      return _specifier.serializeSpecifier;
    }
  });
  Object.defineProperty(exports, 'deserializeSpecifier', {
    enumerable: true,
    get: function () {
      return _specifier.deserializeSpecifier;
    }
  });

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O2dEQUFTLEFBQU8sQUFBSSxBQUFTLEFBQUUsQUFBTSxBQUFhLEFBQUMsQUFHbkQsQUFBTzs7Ozs7OytDQUlMLEFBQU8sQUFBSSxBQUFRLEFBR3BCLEFBQU0sQUFBWSxBQUFDLEFBRXBCLEFBQU87Ozs7OztvQkFBUyxBQUFROzs7Ozs7b0JBQUUsQUFBUTs7Ozs7O29CQUFFLEFBQUssQUFBRSxBQUFNLEFBQVMsQUFBQyxBQUMzRCxBQUFPOzs7Ozs7d0JBRUwsQUFBeUI7Ozs7Ozt3QkFDekIsQUFBeUI7Ozs7Ozt3QkFDekIsQUFBa0I7Ozs7Ozt3QkFDbEIsQUFBb0IsQUFDckIsQUFBTSxBQUFhLEFBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgeyBkZWZhdWx0IGFzIENvbnRhaW5lciB9IGZyb20gJy4vY29udGFpbmVyJztcbmV4cG9ydCAqIGZyb20gJy4vZGljdCc7XG5leHBvcnQgKiBmcm9tICcuL2ZhY3RvcnknO1xuZXhwb3J0IHsgXG4gIFJlZ2lzdHJ5UmVhZGVyLFxuICBSZWdpc3RyeVdyaXRlcixcbiAgUmVnaXN0cnlBY2Nlc3NvcixcbiAgZGVmYXVsdCBhcyBSZWdpc3RyeSwgXG4gIEluamVjdGlvbiwgXG4gIFJlZ2lzdHJhdGlvbk9wdGlvbnMgXG59IGZyb20gJy4vcmVnaXN0cnknO1xuZXhwb3J0IHsgUmVzb2x2ZXIgfSBmcm9tICcuL3Jlc29sdmVyJztcbmV4cG9ydCB7IE93bmVyLCBnZXRPd25lciwgc2V0T3duZXIsIE9XTkVSIH0gZnJvbSAnLi9vd25lcic7XG5leHBvcnQge1xuICBTcGVjaWZpZXIsXG4gIGlzU3BlY2lmaWVyU3RyaW5nQWJzb2x1dGUsXG4gIGlzU3BlY2lmaWVyT2JqZWN0QWJzb2x1dGUsXG4gIHNlcmlhbGl6ZVNwZWNpZmllcixcbiAgZGVzZXJpYWxpemVTcGVjaWZpZXJcbn0gZnJvbSAnLi9zcGVjaWZpZXInO1xuIl19