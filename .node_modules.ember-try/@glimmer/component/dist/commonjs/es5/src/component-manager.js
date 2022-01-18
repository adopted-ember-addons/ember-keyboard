"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _application = require("@glimmer/application");

var _di = require("@glimmer/di");

var _baseComponentManager = require("../addon/-private/base-component-manager");

var _baseComponentManager2 = _interopRequireDefault(_baseComponentManager);

var _destroyables = require("../addon/-private/destroyables");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _defaults(subClass, superClass);
}

var CAPABILITIES = (0, _application.capabilities)('3.13', {
  asyncLifecycleCallbacks: true,
  updateHook: true,
  destructor: true
});
/**
 * This component manager runs in Glimmer.js environments and extends the base component manager to:
 *
 * 1. Implement a lightweight destruction protocol (currently not deferred, like in Ember)
 * 2. Invoke legacy component lifecycle hooks (didInsertElement and didUpdate)
 */

var GlimmerComponentManager =
/*#__PURE__*/
function (_BaseComponentManager) {
  _inheritsLoose(GlimmerComponentManager, _BaseComponentManager);

  function GlimmerComponentManager() {
    return _BaseComponentManager.apply(this, arguments) || this;
  }

  var _proto = GlimmerComponentManager.prototype;

  _proto.destroyComponent = function destroyComponent(component) {
    (0, _destroyables.setDestroying)(component);
    component.willDestroy();
    (0, _destroyables.setDestroyed)(component);
  };

  _proto.didCreateComponent = function didCreateComponent(component) {
    component.didInsertElement();
  };

  _proto.updateComponent = function updateComponent() {};

  _proto.didUpdateComponent = function didUpdateComponent(component) {
    component.didUpdate();
  };

  _proto.__glimmer__didRenderLayout = function __glimmer__didRenderLayout(component, bounds) {
    component.bounds = bounds;
  };

  return GlimmerComponentManager;
}((0, _baseComponentManager2.default)(_di.setOwner, _di.getOwner, CAPABILITIES));

exports.default = GlimmerComponentManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2NvbXBvbmVudC9zcmMvY29tcG9uZW50LW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsSUFBTSxZQUFZLEdBQUcsK0JBQVksTUFBWixFQUFxQjtBQUN4QyxFQUFBLHVCQUF1QixFQURpQixJQUFBO0FBRXhDLEVBQUEsVUFBVSxFQUY4QixJQUFBO0FBR3hDLEVBQUEsVUFBVSxFQUFFO0FBSDRCLENBQXJCLENBQXJCO0FBTUE7Ozs7Ozs7SUFNcUIsdUI7Ozs7Ozs7Ozs7O1NBS25CLGdCLEdBQUEsU0FBQSxnQkFBQSxDQUFBLFNBQUEsRUFBNEM7QUFDMUMscUNBQUEsU0FBQTtBQUNBLElBQUEsU0FBUyxDQUFULFdBQUE7QUFDQSxvQ0FBQSxTQUFBOzs7U0FHRixrQixHQUFBLFNBQUEsa0JBQUEsQ0FBQSxTQUFBLEVBQThDO0FBQzVDLElBQUEsU0FBUyxDQUFULGdCQUFBOzs7U0FHRixlLEdBQUEsU0FBQSxlQUFBLEdBQWUsQzs7U0FFZixrQixHQUFBLFNBQUEsa0JBQUEsQ0FBQSxTQUFBLEVBQThDO0FBQzVDLElBQUEsU0FBUyxDQUFULFNBQUE7OztTQUdGLDBCLEdBQUEsU0FBQSwwQkFBQSxDQUFBLFNBQUEsRUFBQSxNQUFBLEVBQXNFO0FBQ3BFLElBQUEsU0FBUyxDQUFULE1BQUEsR0FBQSxNQUFBOzs7O0VBdEJpRCxvQ0FBb0IsWUFBcEIsRUFBb0IsWUFBcEIsRUFBb0IsWUFBcEIsQzs7a0JBQWhDLHVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY2FwYWJpbGl0aWVzLCBCb3VuZHMgfSBmcm9tICdAZ2xpbW1lci9hcHBsaWNhdGlvbic7XG5pbXBvcnQgeyBzZXRPd25lciwgZ2V0T3duZXIgfSBmcm9tICdAZ2xpbW1lci9kaSc7XG5cbmltcG9ydCBCYXNlQ29tcG9uZW50TWFuYWdlciBmcm9tICcuLi9hZGRvbi8tcHJpdmF0ZS9iYXNlLWNvbXBvbmVudC1tYW5hZ2VyJztcbmltcG9ydCB7IHNldERlc3Ryb3lpbmcsIHNldERlc3Ryb3llZCB9IGZyb20gJy4uL2FkZG9uLy1wcml2YXRlL2Rlc3Ryb3lhYmxlcyc7XG5pbXBvcnQgR2xpbW1lckNvbXBvbmVudCBmcm9tICcuL2NvbXBvbmVudCc7XG5cbmNvbnN0IENBUEFCSUxJVElFUyA9IGNhcGFiaWxpdGllcygnMy4xMycsIHtcbiAgYXN5bmNMaWZlY3ljbGVDYWxsYmFja3M6IHRydWUsXG4gIHVwZGF0ZUhvb2s6IHRydWUsXG4gIGRlc3RydWN0b3I6IHRydWUsXG59KTtcblxuLyoqXG4gKiBUaGlzIGNvbXBvbmVudCBtYW5hZ2VyIHJ1bnMgaW4gR2xpbW1lci5qcyBlbnZpcm9ubWVudHMgYW5kIGV4dGVuZHMgdGhlIGJhc2UgY29tcG9uZW50IG1hbmFnZXIgdG86XG4gKlxuICogMS4gSW1wbGVtZW50IGEgbGlnaHR3ZWlnaHQgZGVzdHJ1Y3Rpb24gcHJvdG9jb2wgKGN1cnJlbnRseSBub3QgZGVmZXJyZWQsIGxpa2UgaW4gRW1iZXIpXG4gKiAyLiBJbnZva2UgbGVnYWN5IGNvbXBvbmVudCBsaWZlY3ljbGUgaG9va3MgKGRpZEluc2VydEVsZW1lbnQgYW5kIGRpZFVwZGF0ZSlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2xpbW1lckNvbXBvbmVudE1hbmFnZXIgZXh0ZW5kcyBCYXNlQ29tcG9uZW50TWFuYWdlcihcbiAgc2V0T3duZXIsXG4gIGdldE93bmVyLFxuICBDQVBBQklMSVRJRVNcbikge1xuICBkZXN0cm95Q29tcG9uZW50KGNvbXBvbmVudDogR2xpbW1lckNvbXBvbmVudCkge1xuICAgIHNldERlc3Ryb3lpbmcoY29tcG9uZW50KTtcbiAgICBjb21wb25lbnQud2lsbERlc3Ryb3koKTtcbiAgICBzZXREZXN0cm95ZWQoY29tcG9uZW50KTtcbiAgfVxuXG4gIGRpZENyZWF0ZUNvbXBvbmVudChjb21wb25lbnQ6IEdsaW1tZXJDb21wb25lbnQpIHtcbiAgICBjb21wb25lbnQuZGlkSW5zZXJ0RWxlbWVudCgpO1xuICB9XG5cbiAgdXBkYXRlQ29tcG9uZW50KCkgeyB9XG5cbiAgZGlkVXBkYXRlQ29tcG9uZW50KGNvbXBvbmVudDogR2xpbW1lckNvbXBvbmVudCkge1xuICAgIGNvbXBvbmVudC5kaWRVcGRhdGUoKTtcbiAgfVxuXG4gIF9fZ2xpbW1lcl9fZGlkUmVuZGVyTGF5b3V0KGNvbXBvbmVudDogR2xpbW1lckNvbXBvbmVudCwgYm91bmRzOiBCb3VuZHMpIHtcbiAgICBjb21wb25lbnQuYm91bmRzID0gYm91bmRzO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9