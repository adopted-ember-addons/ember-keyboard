function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import { DEBUG } from '@glimmer/env';
import { setOwner } from './owner';
import { isDestroying, isDestroyed } from './destroyables';
export var ARGS_SET;

if (DEBUG) {
  ARGS_SET = new WeakMap();
}
/**
 * The `Component` class defines an encapsulated UI element that is rendered to
 * the DOM. A component is made up of a template and, optionally, this component
 * object.
 *
 * ## Defining a Component
 *
 * To define a component, subclass `Component` and add your own properties,
 * methods and lifecycle hooks:
 *
 * ```ts
 * import Component from '@glimmer/component';
 *
 * export default class extends Component {
 * }
 * ```
 *
 * ## Lifecycle Hooks
 *
 * Lifecycle hooks allow you to respond to changes to a component, such as when
 * it gets created, rendered, updated or destroyed. To add a lifecycle hook to a
 * component, implement the hook as a method on your component subclass.
 *
 * For example, to be notified when Glimmer has rendered your component so you
 * can attach a legacy jQuery plugin, implement the `didInsertElement()` method:
 *
 * ```ts
 * import Component from '@glimmer/component';
 *
 * export default class extends Component {
 *   didInsertElement() {
 *     $(this.element).pickadate();
 *   }
 * }
 * ```
 *
 * ## Data for Templates
 *
 * `Component`s have two different kinds of data, or state, that can be
 * displayed in templates:
 *
 * 1. Arguments
 * 2. Properties
 *
 * Arguments are data that is passed in to a component from its parent
 * component. For example, if I have a `UserGreeting` component, I can pass it
 * a name and greeting to use:
 *
 * ```hbs
 * <UserGreeting @name="Ricardo" @greeting="Olá" />
 * ```
 *
 * Inside my `UserGreeting` template, I can access the `@name` and `@greeting`
 * arguments that I've been given:
 *
 * ```hbs
 * {{@greeting}}, {{@name}}!
 * ```
 *
 * Arguments are also available inside my component:
 *
 * ```ts
 * console.log(this.args.greeting); // prints "Olá"
 * ```
 *
 * Properties, on the other hand, are internal to the component and declared in
 * the class. You can use properties to store data that you want to show in the
 * template, or pass to another component as an argument.
 *
 * ```ts
 * import Component from '@glimmer/component';
 *
 * export default class extends Component {
 *   user = {
 *     name: 'Robbie'
 *   }
 * }
 * ```
 *
 * In the above example, we've defined a component with a `user` property that
 * contains an object with its own `name` property.
 *
 * We can render that property in our template:
 *
 * ```hbs
 * Hello, {{user.name}}!
 * ```
 *
 * We can also take that property and pass it as an argument to the
 * `UserGreeting` component we defined above:
 *
 * ```hbs
 * <UserGreeting @greeting="Hello" @name={{user.name}} />
 * ```
 *
 * ## Arguments vs. Properties
 *
 * Remember, arguments are data that was given to your component by its parent
 * component, and properties are data your component has defined for itself.
 *
 * You can tell the difference between arguments and properties in templates
 * because arguments always start with an `@` sign (think "A is for arguments"):
 *
 * ```hbs
 * {{@firstName}}
 * ```
 *
 * We know that `@firstName` came from the parent component, not the current
 * component, because it starts with `@` and is therefore an argument.
 *
 * On the other hand, if we see:
 *
 * ```hbs
 * {{name}}
 * ```
 *
 * We know that `name` is a property on the component. If we want to know where
 * the data is coming from, we can go look at our component class to find out.
 *
 * Inside the component itself, arguments always show up inside the component's
 * `args` property. For example, if `{{@firstName}}` is `Tom` in the template,
 * inside the component `this.args.firstName` would also be `Tom`.
 */


var BaseComponent =
/*#__PURE__*/
function () {
  /**
   * Constructs a new component and assigns itself the passed properties. You
   * should not construct new components yourself. Instead, Glimmer will
   * instantiate new components automatically as it renders.
   *
   * @param owner
   * @param args
   */
  function BaseComponent(owner, args) {
    if (DEBUG && !(owner !== null && typeof owner === 'object' && ARGS_SET.has(args))) {
      throw new Error("You must pass both the owner and args to super() in your component: " + this.constructor.name + ". You can pass them directly, or use ...arguments to pass all arguments through.");
    }

    this.args = args;
    setOwner(this, owner);
  }

  var _proto = BaseComponent.prototype;

  /**
   * Called before the component has been removed from the DOM.
   */
  _proto.willDestroy = function willDestroy() {};

  _createClass(BaseComponent, [{
    key: "isDestroying",
    get: function get() {
      return isDestroying(this);
    }
  }, {
    key: "isDestroyed",
    get: function get() {
      return isDestroyed(this);
    }
  }]);

  return BaseComponent;
}();

export { BaseComponent as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2NvbXBvbmVudC9hZGRvbi8tcHJpdmF0ZS9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLFNBQVMsS0FBVCxRQUFzQixjQUF0QjtBQUNBLFNBQVMsUUFBVCxRQUF5QixTQUF6QjtBQUNBLFNBQVMsWUFBVCxFQUF1QixXQUF2QixRQUEwQyxnQkFBMUM7QUFFQSxPQUFPLElBQUksUUFBSjs7QUFFUCxJQUFJLEtBQUosRUFBVztBQUNULEVBQUEsUUFBUSxHQUFHLElBQUksT0FBSixFQUFYO0FBQ0Q7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUEySHFCLGE7OztBQUNuQjs7Ozs7Ozs7QUFRQSx5QkFBWSxLQUFaLEVBQTRCLElBQTVCLEVBQW1DO0FBQ2pDLFFBQUksS0FBSyxJQUFJLEVBQUUsS0FBSyxLQUFLLElBQVYsSUFBa0IsT0FBTyxLQUFQLEtBQWlCLFFBQW5DLElBQStDLFFBQVEsQ0FBQyxHQUFULENBQWEsSUFBYixDQUFqRCxDQUFiLEVBQW1GO0FBQ2pGLFlBQU0sSUFBSSxLQUFKLDBFQUVGLEtBQUssV0FBTCxDQUFpQixJQUZmLHNGQUFOO0FBS0Q7O0FBRUQsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLElBQUEsUUFBUSxDQUFDLElBQUQsRUFBTyxLQUFQLENBQVI7QUFDRDs7OztBQW9DRDs7O1NBR0EsVyxHQUFBLHVCQUFXLENBQUssQzs7Ozt3QkFYQTtBQUNkLGFBQU8sWUFBWSxDQUFDLElBQUQsQ0FBbkI7QUFDRDs7O3dCQUVjO0FBQ2IsYUFBTyxXQUFXLENBQUMsSUFBRCxDQUFsQjtBQUNEOzs7Ozs7U0F0RGtCLGEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2Vudic7XG5pbXBvcnQgeyBzZXRPd25lciB9IGZyb20gJy4vb3duZXInO1xuaW1wb3J0IHsgaXNEZXN0cm95aW5nLCBpc0Rlc3Ryb3llZCB9IGZyb20gJy4vZGVzdHJveWFibGVzJztcblxuZXhwb3J0IGxldCBBUkdTX1NFVDogV2Vha01hcDxhbnksIGJvb2xlYW4+O1xuXG5pZiAoREVCVUcpIHtcbiAgQVJHU19TRVQgPSBuZXcgV2Vha01hcCgpO1xufVxuXG4vKipcbiAqIFRoZSBgQ29tcG9uZW50YCBjbGFzcyBkZWZpbmVzIGFuIGVuY2Fwc3VsYXRlZCBVSSBlbGVtZW50IHRoYXQgaXMgcmVuZGVyZWQgdG9cbiAqIHRoZSBET00uIEEgY29tcG9uZW50IGlzIG1hZGUgdXAgb2YgYSB0ZW1wbGF0ZSBhbmQsIG9wdGlvbmFsbHksIHRoaXMgY29tcG9uZW50XG4gKiBvYmplY3QuXG4gKlxuICogIyMgRGVmaW5pbmcgYSBDb21wb25lbnRcbiAqXG4gKiBUbyBkZWZpbmUgYSBjb21wb25lbnQsIHN1YmNsYXNzIGBDb21wb25lbnRgIGFuZCBhZGQgeW91ciBvd24gcHJvcGVydGllcyxcbiAqIG1ldGhvZHMgYW5kIGxpZmVjeWNsZSBob29rczpcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IENvbXBvbmVudCBmcm9tICdAZ2xpbW1lci9jb21wb25lbnQnO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGNsYXNzIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIExpZmVjeWNsZSBIb29rc1xuICpcbiAqIExpZmVjeWNsZSBob29rcyBhbGxvdyB5b3UgdG8gcmVzcG9uZCB0byBjaGFuZ2VzIHRvIGEgY29tcG9uZW50LCBzdWNoIGFzIHdoZW5cbiAqIGl0IGdldHMgY3JlYXRlZCwgcmVuZGVyZWQsIHVwZGF0ZWQgb3IgZGVzdHJveWVkLiBUbyBhZGQgYSBsaWZlY3ljbGUgaG9vayB0byBhXG4gKiBjb21wb25lbnQsIGltcGxlbWVudCB0aGUgaG9vayBhcyBhIG1ldGhvZCBvbiB5b3VyIGNvbXBvbmVudCBzdWJjbGFzcy5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdG8gYmUgbm90aWZpZWQgd2hlbiBHbGltbWVyIGhhcyByZW5kZXJlZCB5b3VyIGNvbXBvbmVudCBzbyB5b3VcbiAqIGNhbiBhdHRhY2ggYSBsZWdhY3kgalF1ZXJ5IHBsdWdpbiwgaW1wbGVtZW50IHRoZSBgZGlkSW5zZXJ0RWxlbWVudCgpYCBtZXRob2Q6XG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCBDb21wb25lbnQgZnJvbSAnQGdsaW1tZXIvY29tcG9uZW50JztcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBjbGFzcyBleHRlbmRzIENvbXBvbmVudCB7XG4gKiAgIGRpZEluc2VydEVsZW1lbnQoKSB7XG4gKiAgICAgJCh0aGlzLmVsZW1lbnQpLnBpY2thZGF0ZSgpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyBEYXRhIGZvciBUZW1wbGF0ZXNcbiAqXG4gKiBgQ29tcG9uZW50YHMgaGF2ZSB0d28gZGlmZmVyZW50IGtpbmRzIG9mIGRhdGEsIG9yIHN0YXRlLCB0aGF0IGNhbiBiZVxuICogZGlzcGxheWVkIGluIHRlbXBsYXRlczpcbiAqXG4gKiAxLiBBcmd1bWVudHNcbiAqIDIuIFByb3BlcnRpZXNcbiAqXG4gKiBBcmd1bWVudHMgYXJlIGRhdGEgdGhhdCBpcyBwYXNzZWQgaW4gdG8gYSBjb21wb25lbnQgZnJvbSBpdHMgcGFyZW50XG4gKiBjb21wb25lbnQuIEZvciBleGFtcGxlLCBpZiBJIGhhdmUgYSBgVXNlckdyZWV0aW5nYCBjb21wb25lbnQsIEkgY2FuIHBhc3MgaXRcbiAqIGEgbmFtZSBhbmQgZ3JlZXRpbmcgdG8gdXNlOlxuICpcbiAqIGBgYGhic1xuICogPFVzZXJHcmVldGluZyBAbmFtZT1cIlJpY2FyZG9cIiBAZ3JlZXRpbmc9XCJPbMOhXCIgLz5cbiAqIGBgYFxuICpcbiAqIEluc2lkZSBteSBgVXNlckdyZWV0aW5nYCB0ZW1wbGF0ZSwgSSBjYW4gYWNjZXNzIHRoZSBgQG5hbWVgIGFuZCBgQGdyZWV0aW5nYFxuICogYXJndW1lbnRzIHRoYXQgSSd2ZSBiZWVuIGdpdmVuOlxuICpcbiAqIGBgYGhic1xuICoge3tAZ3JlZXRpbmd9fSwge3tAbmFtZX19IVxuICogYGBgXG4gKlxuICogQXJndW1lbnRzIGFyZSBhbHNvIGF2YWlsYWJsZSBpbnNpZGUgbXkgY29tcG9uZW50OlxuICpcbiAqIGBgYHRzXG4gKiBjb25zb2xlLmxvZyh0aGlzLmFyZ3MuZ3JlZXRpbmcpOyAvLyBwcmludHMgXCJPbMOhXCJcbiAqIGBgYFxuICpcbiAqIFByb3BlcnRpZXMsIG9uIHRoZSBvdGhlciBoYW5kLCBhcmUgaW50ZXJuYWwgdG8gdGhlIGNvbXBvbmVudCBhbmQgZGVjbGFyZWQgaW5cbiAqIHRoZSBjbGFzcy4gWW91IGNhbiB1c2UgcHJvcGVydGllcyB0byBzdG9yZSBkYXRhIHRoYXQgeW91IHdhbnQgdG8gc2hvdyBpbiB0aGVcbiAqIHRlbXBsYXRlLCBvciBwYXNzIHRvIGFub3RoZXIgY29tcG9uZW50IGFzIGFuIGFyZ3VtZW50LlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgQ29tcG9uZW50IGZyb20gJ0BnbGltbWVyL2NvbXBvbmVudCc7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgY2xhc3MgZXh0ZW5kcyBDb21wb25lbnQge1xuICogICB1c2VyID0ge1xuICogICAgIG5hbWU6ICdSb2JiaWUnXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEluIHRoZSBhYm92ZSBleGFtcGxlLCB3ZSd2ZSBkZWZpbmVkIGEgY29tcG9uZW50IHdpdGggYSBgdXNlcmAgcHJvcGVydHkgdGhhdFxuICogY29udGFpbnMgYW4gb2JqZWN0IHdpdGggaXRzIG93biBgbmFtZWAgcHJvcGVydHkuXG4gKlxuICogV2UgY2FuIHJlbmRlciB0aGF0IHByb3BlcnR5IGluIG91ciB0ZW1wbGF0ZTpcbiAqXG4gKiBgYGBoYnNcbiAqIEhlbGxvLCB7e3VzZXIubmFtZX19IVxuICogYGBgXG4gKlxuICogV2UgY2FuIGFsc28gdGFrZSB0aGF0IHByb3BlcnR5IGFuZCBwYXNzIGl0IGFzIGFuIGFyZ3VtZW50IHRvIHRoZVxuICogYFVzZXJHcmVldGluZ2AgY29tcG9uZW50IHdlIGRlZmluZWQgYWJvdmU6XG4gKlxuICogYGBgaGJzXG4gKiA8VXNlckdyZWV0aW5nIEBncmVldGluZz1cIkhlbGxvXCIgQG5hbWU9e3t1c2VyLm5hbWV9fSAvPlxuICogYGBgXG4gKlxuICogIyMgQXJndW1lbnRzIHZzLiBQcm9wZXJ0aWVzXG4gKlxuICogUmVtZW1iZXIsIGFyZ3VtZW50cyBhcmUgZGF0YSB0aGF0IHdhcyBnaXZlbiB0byB5b3VyIGNvbXBvbmVudCBieSBpdHMgcGFyZW50XG4gKiBjb21wb25lbnQsIGFuZCBwcm9wZXJ0aWVzIGFyZSBkYXRhIHlvdXIgY29tcG9uZW50IGhhcyBkZWZpbmVkIGZvciBpdHNlbGYuXG4gKlxuICogWW91IGNhbiB0ZWxsIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gYXJndW1lbnRzIGFuZCBwcm9wZXJ0aWVzIGluIHRlbXBsYXRlc1xuICogYmVjYXVzZSBhcmd1bWVudHMgYWx3YXlzIHN0YXJ0IHdpdGggYW4gYEBgIHNpZ24gKHRoaW5rIFwiQSBpcyBmb3IgYXJndW1lbnRzXCIpOlxuICpcbiAqIGBgYGhic1xuICoge3tAZmlyc3ROYW1lfX1cbiAqIGBgYFxuICpcbiAqIFdlIGtub3cgdGhhdCBgQGZpcnN0TmFtZWAgY2FtZSBmcm9tIHRoZSBwYXJlbnQgY29tcG9uZW50LCBub3QgdGhlIGN1cnJlbnRcbiAqIGNvbXBvbmVudCwgYmVjYXVzZSBpdCBzdGFydHMgd2l0aCBgQGAgYW5kIGlzIHRoZXJlZm9yZSBhbiBhcmd1bWVudC5cbiAqXG4gKiBPbiB0aGUgb3RoZXIgaGFuZCwgaWYgd2Ugc2VlOlxuICpcbiAqIGBgYGhic1xuICoge3tuYW1lfX1cbiAqIGBgYFxuICpcbiAqIFdlIGtub3cgdGhhdCBgbmFtZWAgaXMgYSBwcm9wZXJ0eSBvbiB0aGUgY29tcG9uZW50LiBJZiB3ZSB3YW50IHRvIGtub3cgd2hlcmVcbiAqIHRoZSBkYXRhIGlzIGNvbWluZyBmcm9tLCB3ZSBjYW4gZ28gbG9vayBhdCBvdXIgY29tcG9uZW50IGNsYXNzIHRvIGZpbmQgb3V0LlxuICpcbiAqIEluc2lkZSB0aGUgY29tcG9uZW50IGl0c2VsZiwgYXJndW1lbnRzIGFsd2F5cyBzaG93IHVwIGluc2lkZSB0aGUgY29tcG9uZW50J3NcbiAqIGBhcmdzYCBwcm9wZXJ0eS4gRm9yIGV4YW1wbGUsIGlmIGB7e0BmaXJzdE5hbWV9fWAgaXMgYFRvbWAgaW4gdGhlIHRlbXBsYXRlLFxuICogaW5zaWRlIHRoZSBjb21wb25lbnQgYHRoaXMuYXJncy5maXJzdE5hbWVgIHdvdWxkIGFsc28gYmUgYFRvbWAuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VDb21wb25lbnQ8VCA9IG9iamVjdD4ge1xuICAvKipcbiAgICogQ29uc3RydWN0cyBhIG5ldyBjb21wb25lbnQgYW5kIGFzc2lnbnMgaXRzZWxmIHRoZSBwYXNzZWQgcHJvcGVydGllcy4gWW91XG4gICAqIHNob3VsZCBub3QgY29uc3RydWN0IG5ldyBjb21wb25lbnRzIHlvdXJzZWxmLiBJbnN0ZWFkLCBHbGltbWVyIHdpbGxcbiAgICogaW5zdGFudGlhdGUgbmV3IGNvbXBvbmVudHMgYXV0b21hdGljYWxseSBhcyBpdCByZW5kZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gb3duZXJcbiAgICogQHBhcmFtIGFyZ3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKG93bmVyOiB1bmtub3duLCBhcmdzOiBUKSB7XG4gICAgaWYgKERFQlVHICYmICEob3duZXIgIT09IG51bGwgJiYgdHlwZW9mIG93bmVyID09PSAnb2JqZWN0JyAmJiBBUkdTX1NFVC5oYXMoYXJncykpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBZb3UgbXVzdCBwYXNzIGJvdGggdGhlIG93bmVyIGFuZCBhcmdzIHRvIHN1cGVyKCkgaW4geW91ciBjb21wb25lbnQ6ICR7XG4gICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lXG4gICAgICAgIH0uIFlvdSBjYW4gcGFzcyB0aGVtIGRpcmVjdGx5LCBvciB1c2UgLi4uYXJndW1lbnRzIHRvIHBhc3MgYWxsIGFyZ3VtZW50cyB0aHJvdWdoLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5hcmdzID0gYXJncztcbiAgICBzZXRPd25lcih0aGlzLCBvd25lciBhcyBhbnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hbWVkIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGNvbXBvbmVudCBmcm9tIGl0cyBwYXJlbnQgY29tcG9uZW50LlxuICAgKiBUaGV5IGNhbiBiZSBhY2Nlc3NlZCBpbiBKYXZhU2NyaXB0IHZpYSBgdGhpcy5hcmdzLmFyZ3VtZW50TmFtZWAgYW5kIGluIHRoZSB0ZW1wbGF0ZSB2aWEgYEBhcmd1bWVudE5hbWVgLlxuICAgKlxuICAgKiBTYXkgeW91IGhhdmUgdGhlIGZvbGxvd2luZyBjb21wb25lbnQsIHdoaWNoIHdpbGwgaGF2ZSB0d28gYGFyZ3NgLCBgZmlyc3ROYW1lYCBhbmQgYGxhc3ROYW1lYDpcbiAgICpcbiAgICogYGBgaGJzXG4gICAqIDxteS1jb21wb25lbnQgQGZpcnN0TmFtZT1cIkFydGh1clwiIEBsYXN0TmFtZT1cIkRlbnRcIiAvPlxuICAgKiBgYGBcbiAgICpcbiAgICogSWYgeW91IG5lZWRlZCB0byBjYWxjdWxhdGUgYGZ1bGxOYW1lYCBieSBjb21iaW5pbmcgYm90aCBvZiB0aGVtLCB5b3Ugd291bGQgZG86XG4gICAqXG4gICAqIGBgYHRzXG4gICAqIGRpZEluc2VydEVsZW1lbnQoKSB7XG4gICAqICAgY29uc29sZS5sb2coYEhpLCBteSBmdWxsIG5hbWUgaXMgJHt0aGlzLmFyZ3MuZmlyc3ROYW1lfSAke3RoaXMuYXJncy5sYXN0TmFtZX1gKTtcbiAgICogfVxuICAgKiBgYGBcbiAgICpcbiAgICogV2hpbGUgaW4gdGhlIHRlbXBsYXRlIHlvdSBjb3VsZCBkbzpcbiAgICpcbiAgICogYGBgaGJzXG4gICAqIDxwPldlbGNvbWUsIHt7QGZpcnN0TmFtZX19IHt7QGxhc3ROYW1lfX0hPC9wPlxuICAgKiBgYGBcbiAgICovXG4gIGFyZ3M6IFJlYWRvbmx5PFQ+O1xuXG4gIGdldCBpc0Rlc3Ryb3lpbmcoKSB7XG4gICAgcmV0dXJuIGlzRGVzdHJveWluZyh0aGlzKTtcbiAgfVxuXG4gIGdldCBpc0Rlc3Ryb3llZCgpIHtcbiAgICByZXR1cm4gaXNEZXN0cm95ZWQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJlZm9yZSB0aGUgY29tcG9uZW50IGhhcyBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICAgKi9cbiAgd2lsbERlc3Ryb3koKSB7fVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==