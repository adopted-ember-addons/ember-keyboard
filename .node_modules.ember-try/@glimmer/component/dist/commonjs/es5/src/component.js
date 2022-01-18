"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _util = require("@glimmer/util");

var _application = require("@glimmer/application");

var _component = require("../addon/-private/component");

var _component2 = _interopRequireDefault(_component);

var _componentManager = require("./component-manager");

var _componentManager2 = _interopRequireDefault(_componentManager);

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

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _defaults(subClass, superClass);
}

var Component =
/*#__PURE__*/
function (_BaseComponent) {
  _inheritsLoose(Component, _BaseComponent);

  function Component() {
    return _BaseComponent.apply(this, arguments) || this;
  }

  var _proto = Component.prototype;
  /*
   * Legacy DOM access and lifecycle hooks. These will be deprecated in favor
   * of render modifiers once Glimmer.js supports an element modifier manager
   * API.
   */

  /**
   * Called when the component has been inserted into the DOM.
   * Override this function to do any set up that requires an element in the document body.
   */

  _proto.didInsertElement = function didInsertElement() {}
  /**
   * Called when the component has updated and rerendered itself.
   * Called only during a rerender, not during an initial render.
   */
  ;

  _proto.didUpdate = function didUpdate() {}
  /**
   * The element corresponding to the main element of the component's template.
   * The main element is the element in the template that has `...attributes` set on it:
   *
   * ```hbs
   * <h1>Modal</h1>
   * <div class="contents" ...attributes>
   *   {{yield}}
   * </div>
   * ```
   *
   * In this example, `this.element` would be the `div` with the class `contents`.
   *
   * You should not try to access this property until after the component's `didInsertElement()`
   * lifecycle hook is called.
   */
  ;

  _createClass(Component, [{
    key: "debugName",

    /**
     * Development-mode only name of the component, useful for debugging.
     */
    get: function get() {
      return this.constructor.name;
    }
  }, {
    key: "element",
    get: function get() {
      var bounds = this.bounds;
      (0, _util.assert)(bounds && bounds.firstNode === bounds.lastNode, "The 'element' property can only be accessed on components that contain a single root element in their template. Try using 'bounds' instead to access the first and last nodes.");
      return bounds.firstNode;
    }
  }]);

  return Component;
}(_component2.default);

exports.default = Component;
(0, _application.setComponentManager)(function (owner) {
  return new _componentManager2.default(owner);
}, _component2.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2NvbXBvbmVudC9zcmMvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQU9xQixTOzs7Ozs7Ozs7O0FBVW5COzs7Ozs7QUFNQTs7Ozs7U0FJQSxnQixHQUFBLFNBQUEsZ0JBQUEsR0FBZ0IsQ0FBSztBQUVyQjs7Ozs7O1NBSUEsUyxHQUFBLFNBQUEsU0FBQSxHQUFTLENBQUs7QUFnRmQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXZHQTs7O3dCQUdhO0FBQ1gsYUFBTyxLQUFBLFdBQUEsQ0FBUCxJQUFBO0FBQ0Q7Ozt3QkFrSFU7QUFBQSxVQUNILE1BREcsR0FBQSxLQUFBLE1BQUE7QUFFVCx3QkFDRSxNQUFNLElBQUksTUFBTSxDQUFOLFNBQUEsS0FBcUIsTUFBTSxDQURqQyxRQUFOLEVBQUEsZ0xBQUE7QUFJQSxhQUFPLE1BQU0sQ0FBYixTQUFBO0FBQ0Q7Ozs7RUFqSTBELG1COztrQkFBeEMsUztBQW9JckIsc0NBQW9CLFVBQUEsS0FBQSxFQUFjO0FBQ2hDLFNBQU8sSUFBQSwwQkFBQSxDQUFQLEtBQU8sQ0FBUDtBQURpQixDQUFuQixFQUFBLG1CQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBzZXRDb21wb25lbnRNYW5hZ2VyIH0gZnJvbSAnQGdsaW1tZXIvYXBwbGljYXRpb24nO1xuaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi4vYWRkb24vLXByaXZhdGUvY29tcG9uZW50JztcbmltcG9ydCBHbGltbWVyQ29tcG9uZW50TWFuYWdlciBmcm9tICcuL2NvbXBvbmVudC1tYW5hZ2VyJztcblxuZXhwb3J0IGludGVyZmFjZSBCb3VuZHMge1xuICBmaXJzdE5vZGU6IE5vZGU7XG4gIGxhc3ROb2RlOiBOb2RlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21wb25lbnQ8QXJncyBleHRlbmRzIHt9ID0ge30+IGV4dGVuZHMgQmFzZUNvbXBvbmVudDxBcmdzPiB7XG4gIGFyZ3M6IEFyZ3M7XG5cbiAgLyoqXG4gICAqIERldmVsb3BtZW50LW1vZGUgb25seSBuYW1lIG9mIHRoZSBjb21wb25lbnQsIHVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICAgKi9cbiAgZ2V0IGRlYnVnTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cblxuICAvKlxuICAgKiBMZWdhY3kgRE9NIGFjY2VzcyBhbmQgbGlmZWN5Y2xlIGhvb2tzLiBUaGVzZSB3aWxsIGJlIGRlcHJlY2F0ZWQgaW4gZmF2b3JcbiAgICogb2YgcmVuZGVyIG1vZGlmaWVycyBvbmNlIEdsaW1tZXIuanMgc3VwcG9ydHMgYW4gZWxlbWVudCBtb2RpZmllciBtYW5hZ2VyXG4gICAqIEFQSS5cbiAgICovXG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgKiBPdmVycmlkZSB0aGlzIGZ1bmN0aW9uIHRvIGRvIGFueSBzZXQgdXAgdGhhdCByZXF1aXJlcyBhbiBlbGVtZW50IGluIHRoZSBkb2N1bWVudCBib2R5LlxuICAgKi9cbiAgZGlkSW5zZXJ0RWxlbWVudCgpIHt9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBjb21wb25lbnQgaGFzIHVwZGF0ZWQgYW5kIHJlcmVuZGVyZWQgaXRzZWxmLlxuICAgKiBDYWxsZWQgb25seSBkdXJpbmcgYSByZXJlbmRlciwgbm90IGR1cmluZyBhbiBpbml0aWFsIHJlbmRlci5cbiAgICovXG4gIGRpZFVwZGF0ZSgpIHt9XG5cbiAgLyoqXG4gICAqIENvbnRhaW5zIHRoZSBmaXJzdCBhbmQgbGFzdCBET00gbm9kZXMgb2YgYSBjb21wb25lbnQncyByZW5kZXJlZCB0ZW1wbGF0ZS5cbiAgICogVGhlc2Ugbm9kZXMgY2FuIGJlIHVzZWQgdG8gdHJhdmVyc2UgYWxsIG9mIHRoZSBET00gbm9kZXMgdGhhdCBiZWxvbmcgdG8gYVxuICAgKiBwYXJ0aWN1bGFyIGNvbXBvbmVudC5cbiAgICpcbiAgICogTm90ZSB0aGF0IGEgY29tcG9uZW50J3MgZmlyc3QgYW5kIGxhc3Qgbm9kZXMgKmNhbiogY2hhbmdlIG92ZXIgdGltZSwgaWYgdGhlXG4gICAqIGJlZ2lubmluZyBvciBlbmRpbmcgb2YgdGhlIHRlbXBsYXRlIGlzIGR5bmFtaWMuIFlvdSBzaG91bGQgYWx3YXlzIGFjY2Vzc1xuICAgKiBgYm91bmRzYCBkaXJlY3RseSBhdCB0aGUgdGltZSBhIG5vZGUgaXMgbmVlZGVkIHRvIGVuc3VyZSB5b3UgYXJlIGFjdGluZyBvblxuICAgKiB1cC10by1kYXRlIG5vZGVzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZXNcbiAgICpcbiAgICogRm9yIGNvbXBvbmVudHMgd2l0aCBhIHNpbmdsZSByb290IGVsZW1lbnQsIGB0aGlzLmJvdW5kcy5maXJzdE5vZGVgIGFuZFxuICAgKiBgdGhpcy5ib3VuZHMubGFzdE5vZGVgIGFyZSB0aGUgc2FtZS5cbiAgICpcbiAgICogYGBgaGJzXG4gICAqIDxkaXYgY2xhc3M9XCJ1c2VyLXByb2ZpbGVcIj5cbiAgICogICA8QXZhdGFyIEB1c2VyPXt7dXNlcn19IC8+XG4gICAqIDwvZGl2PlxuICAgKiBgYGBcbiAgICpcbiAgICogYGBgdHNcbiAgICogZXhwb3J0IGRlZmF1bHQgY2xhc3MgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgKiAgIGRpZEluc2VydEVsZW1lbnQoKSB7XG4gICAqICAgICBsZXQgeyBmaXJzdE5vZGUsIGxhc3ROb2RlIH0gPSB0aGlzLmJvdW5kcztcbiAgICogICAgIGNvbnNvbGUubG9nKGZpcnN0Tm9kZSA9PT0gbGFzdE5vZGUpOyAvLyB0cnVlXG4gICAqICAgICBjb25zb2xlLmxvZyhmaXJzdE5vZGUuY2xhc3NOYW1lKTsgLy8gXCJ1c2VyLXByb2ZpbGVcIlxuICAgKiAgIH1cbiAgICogfVxuICAgKiBgYGBcbiAgICpcbiAgICogRm9yIGNvbXBvbmVudHMgd2l0aCBtdWx0aXBsZSByb290IG5vZGVzLCBgdGhpcy5ib3VuZHMuZmlyc3ROb2RlYCByZWZlcnMgdG9cbiAgICogdGhlIGZpcnN0IG5vZGUgaW4gdGhlIHRlbXBsYXRlIGFuZCBgdGhpcy5ib3VuZHMubGFzdE5vZGVgIHJlZmVycyB0byB0aGVcbiAgICogbGFzdDpcbiAgICpcbiAgICogYGBgaGJzXG4gICAqIFdlbGNvbWUgdG8gR2xpbW1lci5qcyFcbiAgICogPHNwYW4+TGV0J3MgYnVpbGQgc29tZSBjb21wb25lbnRzITwvc3Bhbj5cbiAgICogPGltZyBzcmM9XCJsb2dvLnBuZ1wiPlxuICAgKiBgYGBcbiAgICpcbiAgICogYGBgdHNcbiAgICogZXhwb3J0IGRlZmF1bHQgY2xhc3MgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgKiAgIGRpZEluc2VydEVsZW1lbnQoKSB7XG4gICAqICAgICBsZXQgeyBmaXJzdE5vZGUsIGxhc3ROb2RlIH0gPSB0aGlzLmJvdW5kcztcbiAgICpcbiAgICogICAgIC8vIFdhbGsgYWxsIG9mIHRoZSBET00gc2libGluZ3MgZnJvbSB0aGVcbiAgICogICAgIC8vIGZpcnN0Tm9kZSB0byB0aGUgbGFzdE5vZGUgYW5kIHB1c2ggdGhlaXJcbiAgICogICAgIC8vIG5vZGVOYW1lIGludG8gYW4gYXJyYXkuXG4gICAqICAgICBsZXQgbm9kZSA9IGZpcnN0Tm9kZTtcbiAgICogICAgIGxldCBuYW1lcyA9IFtmaXJzdE5vZGUubm9kZU5hbWVdO1xuICAgKiAgICAgZG8ge1xuICAgKiAgICAgICBub2RlID0gbm9kZS5uZXh0U2libGluZztcbiAgICogICAgICAgbmFtZXMucHVzaChub2RlLm5vZGVOYW1lKTtcbiAgICogICAgIH0gd2hpbGUgKG5vZGUgIT09IGxhc3ROb2RlKTtcbiAgICpcbiAgICogICAgIGNvbnNvbGUubG9nKG5hbWVzKTtcbiAgICogICAgIC8vIFtcIiN0ZXh0XCIsIFwiU1BBTlwiLCBcIklNR1wiXVxuICAgKiAgIH1cbiAgICogfVxuICAgKiBgYGBcbiAgICpcbiAgICogVGhlIGJvdW5kcyBjYW4gY2hhbmdlIGlmIHRoZSB0ZW1wbGF0ZSBoYXMgZHluYW1pYyBjb250ZW50IGF0IHRoZSBiZWdpbm5pbmdcbiAgICogb3IgdGhlIGVuZDpcbiAgICpcbiAgICogYGBgaGJzXG4gICAqIHt7I2lmIHVzZXIuaXNBZG1pbn19XG4gICAqICAgPHNwYW4gY2xhc3M9XCJ3YXJuaW5nXCI+QWRtaW48L3NwYW4+XG4gICAqIHt7ZWxzZX19XG4gICAqICAgTm9ybWFsIFVzZXJcbiAgICoge3svaWZ9fVxuICAgKiBgYGBcbiAgICpcbiAgICogSW4gdGhpcyBleGFtcGxlLCB0aGUgYGZpcnN0Tm9kZWAgd2lsbCBjaGFuZ2UgYmV0d2VlbiBhIGBzcGFuYCBlbGVtZW50IGFuZCBhXG4gICAqIGBUZXh0Tm9kZWAgYXMgdGhlIGB1c2VyLmlzQWRtaW5gIHByb3BlcnR5IGNoYW5nZXMuXG4gICAqL1xuICBib3VuZHM6IEJvdW5kcztcblxuICAvKipcbiAgICogVGhlIGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgbWFpbiBlbGVtZW50IG9mIHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZS5cbiAgICogVGhlIG1haW4gZWxlbWVudCBpcyB0aGUgZWxlbWVudCBpbiB0aGUgdGVtcGxhdGUgdGhhdCBoYXMgYC4uLmF0dHJpYnV0ZXNgIHNldCBvbiBpdDpcbiAgICpcbiAgICogYGBgaGJzXG4gICAqIDxoMT5Nb2RhbDwvaDE+XG4gICAqIDxkaXYgY2xhc3M9XCJjb250ZW50c1wiIC4uLmF0dHJpYnV0ZXM+XG4gICAqICAge3t5aWVsZH19XG4gICAqIDwvZGl2PlxuICAgKiBgYGBcbiAgICpcbiAgICogSW4gdGhpcyBleGFtcGxlLCBgdGhpcy5lbGVtZW50YCB3b3VsZCBiZSB0aGUgYGRpdmAgd2l0aCB0aGUgY2xhc3MgYGNvbnRlbnRzYC5cbiAgICpcbiAgICogWW91IHNob3VsZCBub3QgdHJ5IHRvIGFjY2VzcyB0aGlzIHByb3BlcnR5IHVudGlsIGFmdGVyIHRoZSBjb21wb25lbnQncyBgZGlkSW5zZXJ0RWxlbWVudCgpYFxuICAgKiBsaWZlY3ljbGUgaG9vayBpcyBjYWxsZWQuXG4gICAqL1xuICBnZXQgZWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XG4gICAgbGV0IHsgYm91bmRzIH0gPSB0aGlzO1xuICAgIGFzc2VydChcbiAgICAgIGJvdW5kcyAmJiBib3VuZHMuZmlyc3ROb2RlID09PSBib3VuZHMubGFzdE5vZGUsXG4gICAgICBgVGhlICdlbGVtZW50JyBwcm9wZXJ0eSBjYW4gb25seSBiZSBhY2Nlc3NlZCBvbiBjb21wb25lbnRzIHRoYXQgY29udGFpbiBhIHNpbmdsZSByb290IGVsZW1lbnQgaW4gdGhlaXIgdGVtcGxhdGUuIFRyeSB1c2luZyAnYm91bmRzJyBpbnN0ZWFkIHRvIGFjY2VzcyB0aGUgZmlyc3QgYW5kIGxhc3Qgbm9kZXMuYFxuICAgICk7XG4gICAgcmV0dXJuIGJvdW5kcy5maXJzdE5vZGUgYXMgSFRNTEVsZW1lbnQ7XG4gIH1cbn1cblxuc2V0Q29tcG9uZW50TWFuYWdlcigob3duZXI6IHt9KSA9PiB7XG4gIHJldHVybiBuZXcgR2xpbW1lckNvbXBvbmVudE1hbmFnZXIob3duZXIpO1xufSwgQmFzZUNvbXBvbmVudCk7XG4iXSwic291cmNlUm9vdCI6IiJ9