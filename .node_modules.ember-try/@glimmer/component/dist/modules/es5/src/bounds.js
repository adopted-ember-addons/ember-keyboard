function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Contains the first and last DOM nodes in a component's rendered
 * template. These nodes can be used to traverse the section of DOM
 * that belongs to a particular component.
 *
 * Note that these nodes *can* change over the lifetime of a component
 * if the beginning or ending of the template is dynamic.
 */
var Bounds =
/*#__PURE__*/
function () {
  function Bounds(_bounds) {
    this._bounds = _bounds;
  }

  _createClass(Bounds, [{
    key: "firstNode",
    get: function get() {
      return this._bounds.firstNode();
    }
  }, {
    key: "lastNode",
    get: function get() {
      return this._bounds.lastNode();
    }
  }]);

  return Bounds;
}();

export { Bounds as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2NvbXBvbmVudC9zcmMvYm91bmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFFQTs7Ozs7Ozs7SUFRcUIsTTs7O0FBQ25CLGtCQUFvQixPQUFwQixFQUFxQztBQUFqQixTQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ25COzs7O3dCQUVZO0FBQ1gsYUFBTyxLQUFLLE9BQUwsQ0FBYSxTQUFiLEVBQVA7QUFDRDs7O3dCQUVXO0FBQ1YsYUFBTyxLQUFLLE9BQUwsQ0FBYSxRQUFiLEVBQVA7QUFDRDs7Ozs7O1NBVmtCLE0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCb3VuZHMgYXMgVk1Cb3VuZHMgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBDb250YWlucyB0aGUgZmlyc3QgYW5kIGxhc3QgRE9NIG5vZGVzIGluIGEgY29tcG9uZW50J3MgcmVuZGVyZWRcbiAqIHRlbXBsYXRlLiBUaGVzZSBub2RlcyBjYW4gYmUgdXNlZCB0byB0cmF2ZXJzZSB0aGUgc2VjdGlvbiBvZiBET01cbiAqIHRoYXQgYmVsb25ncyB0byBhIHBhcnRpY3VsYXIgY29tcG9uZW50LlxuICpcbiAqIE5vdGUgdGhhdCB0aGVzZSBub2RlcyAqY2FuKiBjaGFuZ2Ugb3ZlciB0aGUgbGlmZXRpbWUgb2YgYSBjb21wb25lbnRcbiAqIGlmIHRoZSBiZWdpbm5pbmcgb3IgZW5kaW5nIG9mIHRoZSB0ZW1wbGF0ZSBpcyBkeW5hbWljLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb3VuZHMge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9ib3VuZHM6IFZNQm91bmRzKSB7XG4gIH1cblxuICBnZXQgZmlyc3ROb2RlKCk6IE5vZGUge1xuICAgIHJldHVybiB0aGlzLl9ib3VuZHMuZmlyc3ROb2RlKCkgYXMgTm9kZTtcbiAgfVxuXG4gIGdldCBsYXN0Tm9kZSgpOiBOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5fYm91bmRzLmxhc3ROb2RlKCkgYXMgTm9kZTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==