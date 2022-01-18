function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _defaults(subClass, superClass); }

import { capabilities } from '@glimmer/application';
import { setOwner, getOwner } from '@glimmer/di';
import BaseComponentManager from '../addon/-private/base-component-manager';
import { setDestroying, setDestroyed } from '../addon/-private/destroyables';
var CAPABILITIES = capabilities('3.13', {
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
    setDestroying(component);
    component.willDestroy();
    setDestroyed(component);
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
}(BaseComponentManager(setOwner, getOwner, CAPABILITIES));

export { GlimmerComponentManager as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2NvbXBvbmVudC9zcmMvY29tcG9uZW50LW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLFNBQVMsWUFBVCxRQUFxQyxzQkFBckM7QUFDQSxTQUFTLFFBQVQsRUFBbUIsUUFBbkIsUUFBbUMsYUFBbkM7QUFFQSxPQUFPLG9CQUFQLE1BQWlDLDBDQUFqQztBQUNBLFNBQVMsYUFBVCxFQUF3QixZQUF4QixRQUE0QyxnQ0FBNUM7QUFHQSxJQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsTUFBRCxFQUFTO0FBQ3hDLEVBQUEsdUJBQXVCLEVBQUUsSUFEZTtBQUV4QyxFQUFBLFVBQVUsRUFBRSxJQUY0QjtBQUd4QyxFQUFBLFVBQVUsRUFBRTtBQUg0QixDQUFULENBQWpDO0FBTUE7Ozs7Ozs7SUFNcUIsdUI7Ozs7Ozs7Ozs7O1NBS25CLGdCLEdBQUEsMEJBQWlCLFNBQWpCLEVBQTRDO0FBQzFDLElBQUEsYUFBYSxDQUFDLFNBQUQsQ0FBYjtBQUNBLElBQUEsU0FBUyxDQUFDLFdBQVY7QUFDQSxJQUFBLFlBQVksQ0FBQyxTQUFELENBQVo7QUFDRCxHOztTQUVELGtCLEdBQUEsNEJBQW1CLFNBQW5CLEVBQThDO0FBQzVDLElBQUEsU0FBUyxDQUFDLGdCQUFWO0FBQ0QsRzs7U0FFRCxlLEdBQUEsMkJBQWUsQ0FBTSxDOztTQUVyQixrQixHQUFBLDRCQUFtQixTQUFuQixFQUE4QztBQUM1QyxJQUFBLFNBQVMsQ0FBQyxTQUFWO0FBQ0QsRzs7U0FFRCwwQixHQUFBLG9DQUEyQixTQUEzQixFQUF3RCxNQUF4RCxFQUFzRTtBQUNwRSxJQUFBLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLE1BQW5CO0FBQ0QsRzs7O0VBdkJrRCxvQkFBb0IsQ0FDdkUsUUFEdUUsRUFFdkUsUUFGdUUsRUFHdkUsWUFIdUUsQzs7U0FBcEQsdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjYXBhYmlsaXRpZXMsIEJvdW5kcyB9IGZyb20gJ0BnbGltbWVyL2FwcGxpY2F0aW9uJztcbmltcG9ydCB7IHNldE93bmVyLCBnZXRPd25lciB9IGZyb20gJ0BnbGltbWVyL2RpJztcblxuaW1wb3J0IEJhc2VDb21wb25lbnRNYW5hZ2VyIGZyb20gJy4uL2FkZG9uLy1wcml2YXRlL2Jhc2UtY29tcG9uZW50LW1hbmFnZXInO1xuaW1wb3J0IHsgc2V0RGVzdHJveWluZywgc2V0RGVzdHJveWVkIH0gZnJvbSAnLi4vYWRkb24vLXByaXZhdGUvZGVzdHJveWFibGVzJztcbmltcG9ydCBHbGltbWVyQ29tcG9uZW50IGZyb20gJy4vY29tcG9uZW50JztcblxuY29uc3QgQ0FQQUJJTElUSUVTID0gY2FwYWJpbGl0aWVzKCczLjEzJywge1xuICBhc3luY0xpZmVjeWNsZUNhbGxiYWNrczogdHJ1ZSxcbiAgdXBkYXRlSG9vazogdHJ1ZSxcbiAgZGVzdHJ1Y3RvcjogdHJ1ZSxcbn0pO1xuXG4vKipcbiAqIFRoaXMgY29tcG9uZW50IG1hbmFnZXIgcnVucyBpbiBHbGltbWVyLmpzIGVudmlyb25tZW50cyBhbmQgZXh0ZW5kcyB0aGUgYmFzZSBjb21wb25lbnQgbWFuYWdlciB0bzpcbiAqXG4gKiAxLiBJbXBsZW1lbnQgYSBsaWdodHdlaWdodCBkZXN0cnVjdGlvbiBwcm90b2NvbCAoY3VycmVudGx5IG5vdCBkZWZlcnJlZCwgbGlrZSBpbiBFbWJlcilcbiAqIDIuIEludm9rZSBsZWdhY3kgY29tcG9uZW50IGxpZmVjeWNsZSBob29rcyAoZGlkSW5zZXJ0RWxlbWVudCBhbmQgZGlkVXBkYXRlKVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHbGltbWVyQ29tcG9uZW50TWFuYWdlciBleHRlbmRzIEJhc2VDb21wb25lbnRNYW5hZ2VyKFxuICBzZXRPd25lcixcbiAgZ2V0T3duZXIsXG4gIENBUEFCSUxJVElFU1xuKSB7XG4gIGRlc3Ryb3lDb21wb25lbnQoY29tcG9uZW50OiBHbGltbWVyQ29tcG9uZW50KSB7XG4gICAgc2V0RGVzdHJveWluZyhjb21wb25lbnQpO1xuICAgIGNvbXBvbmVudC53aWxsRGVzdHJveSgpO1xuICAgIHNldERlc3Ryb3llZChjb21wb25lbnQpO1xuICB9XG5cbiAgZGlkQ3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudDogR2xpbW1lckNvbXBvbmVudCkge1xuICAgIGNvbXBvbmVudC5kaWRJbnNlcnRFbGVtZW50KCk7XG4gIH1cblxuICB1cGRhdGVDb21wb25lbnQoKSB7IH1cblxuICBkaWRVcGRhdGVDb21wb25lbnQoY29tcG9uZW50OiBHbGltbWVyQ29tcG9uZW50KSB7XG4gICAgY29tcG9uZW50LmRpZFVwZGF0ZSgpO1xuICB9XG5cbiAgX19nbGltbWVyX19kaWRSZW5kZXJMYXlvdXQoY29tcG9uZW50OiBHbGltbWVyQ29tcG9uZW50LCBib3VuZHM6IEJvdW5kcykge1xuICAgIGNvbXBvbmVudC5ib3VuZHMgPSBib3VuZHM7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=