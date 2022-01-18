"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _normalize = require("../../dom/normalize");

var _opcodes = require("../../opcodes");

var _reference = require("@glimmer/reference");

function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
        var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
        }
    }return obj;
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass);
}

var DynamicTextContent = function (_UpdatingOpcode) {
    _inherits(DynamicTextContent, _UpdatingOpcode);

    function DynamicTextContent(node, reference, lastValue) {
        _classCallCheck(this, DynamicTextContent);

        var _this = _possibleConstructorReturn(this, _UpdatingOpcode.call(this));

        _this.node = node;
        _this.reference = reference;
        _this.lastValue = lastValue;
        _this.type = 'dynamic-text';
        _this.tag = reference.tag;
        _this.lastRevision = (0, _reference.value)(_this.tag);
        return _this;
    }

    DynamicTextContent.prototype.evaluate = function evaluate() {
        var reference = this.reference,
            tag = this.tag;

        if (!(0, _reference.validate)(tag, this.lastRevision)) {
            this.lastRevision = (0, _reference.value)(tag);
            this.update(reference.value());
        }
    };

    DynamicTextContent.prototype.update = function update(value) {
        var lastValue = this.lastValue;

        if (value === lastValue) return;
        var normalized = void 0;
        if ((0, _normalize.isEmpty)(value)) {
            normalized = '';
        } else if ((0, _normalize.isString)(value)) {
            normalized = value;
        } else {
            normalized = String(value);
        }
        if (normalized !== lastValue) {
            var textNode = this.node;
            textNode.nodeValue = this.lastValue = normalized;
        }
    };

    return DynamicTextContent;
}(_opcodes.UpdatingOpcode);

exports.default = DynamicTextContent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2NvbnRlbnQvdGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUdjLHFCOzs7QUFNWixhQUFBLGtCQUFBLENBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBRzJCO0FBQUEsd0JBQUEsSUFBQSxFQUFBLGtCQUFBOztBQUFBLFlBQUEsUUFBQSwyQkFBQSxJQUFBLEVBRXpCLGdCQUFBLElBQUEsQ0FGeUIsSUFFekIsQ0FGeUIsQ0FBQTs7QUFGbEIsY0FBQSxJQUFBLEdBQUEsSUFBQTtBQUNDLGNBQUEsU0FBQSxHQUFBLFNBQUE7QUFDQSxjQUFBLFNBQUEsR0FBQSxTQUFBO0FBUkgsY0FBQSxJQUFBLEdBQUEsY0FBQTtBQVdMLGNBQUEsR0FBQSxHQUFXLFVBQVgsR0FBQTtBQUNBLGNBQUEsWUFBQSxHQUFvQixzQkFBTSxNQUExQixHQUFvQixDQUFwQjtBQUp5QixlQUFBLEtBQUE7QUFLMUI7O2lDQUVELFEsdUJBQVE7QUFBQSxZQUFBLFlBQUEsS0FBQSxTQUFBO0FBQUEsWUFBQSxNQUFBLEtBQUEsR0FBQTs7QUFHTixZQUFJLENBQUMseUJBQUEsR0FBQSxFQUFjLEtBQW5CLFlBQUssQ0FBTCxFQUF1QztBQUNyQyxpQkFBQSxZQUFBLEdBQW9CLHNCQUFwQixHQUFvQixDQUFwQjtBQUNBLGlCQUFBLE1BQUEsQ0FBWSxVQUFaLEtBQVksRUFBWjtBQUNEOzs7aUNBR0gsTSxtQkFBQSxLLEVBQXFCO0FBQUEsWUFBQSxZQUFBLEtBQUEsU0FBQTs7QUFHbkIsWUFBSSxVQUFKLFNBQUEsRUFBeUI7QUFFekIsWUFBQSxhQUFBLEtBQUEsQ0FBQTtBQUVBLFlBQUksd0JBQUosS0FBSSxDQUFKLEVBQW9CO0FBQ2xCLHlCQUFBLEVBQUE7QUFERixTQUFBLE1BRU8sSUFBSSx5QkFBSixLQUFJLENBQUosRUFBcUI7QUFDMUIseUJBQUEsS0FBQTtBQURLLFNBQUEsTUFFQTtBQUNMLHlCQUFhLE9BQWIsS0FBYSxDQUFiO0FBQ0Q7QUFFRCxZQUFJLGVBQUosU0FBQSxFQUE4QjtBQUM1QixnQkFBSSxXQUFXLEtBQWYsSUFBQTtBQUNBLHFCQUFBLFNBQUEsR0FBcUIsS0FBQSxTQUFBLEdBQXJCLFVBQUE7QUFDRDs7OztFQTNDUyx1Qjs7a0JBQUEsa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc0VtcHR5LCBpc1N0cmluZyB9IGZyb20gJy4uLy4uL2RvbS9ub3JtYWxpemUnO1xuaW1wb3J0IHsgVXBkYXRpbmdPcGNvZGUgfSBmcm9tICcuLi8uLi9vcGNvZGVzJztcbmltcG9ydCB7IFRhZywgVmVyc2lvbmVkUmVmZXJlbmNlLCB2YWx1ZSwgdmFsaWRhdGUsIFJldmlzaW9uIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IFNpbXBsZVRleHQgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEeW5hbWljVGV4dENvbnRlbnQgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSB7XG4gIHB1YmxpYyB0eXBlID0gJ2R5bmFtaWMtdGV4dCc7XG5cbiAgcHVibGljIHRhZzogVGFnO1xuICBwdWJsaWMgbGFzdFJldmlzaW9uOiBSZXZpc2lvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbm9kZTogU2ltcGxlVGV4dCxcbiAgICBwcml2YXRlIHJlZmVyZW5jZTogVmVyc2lvbmVkUmVmZXJlbmNlPHVua25vd24+LFxuICAgIHByaXZhdGUgbGFzdFZhbHVlOiBzdHJpbmdcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnRhZyA9IHJlZmVyZW5jZS50YWc7XG4gICAgdGhpcy5sYXN0UmV2aXNpb24gPSB2YWx1ZSh0aGlzLnRhZyk7XG4gIH1cblxuICBldmFsdWF0ZSgpIHtcbiAgICBsZXQgeyByZWZlcmVuY2UsIHRhZyB9ID0gdGhpcztcblxuICAgIGlmICghdmFsaWRhdGUodGFnLCB0aGlzLmxhc3RSZXZpc2lvbikpIHtcbiAgICAgIHRoaXMubGFzdFJldmlzaW9uID0gdmFsdWUodGFnKTtcbiAgICAgIHRoaXMudXBkYXRlKHJlZmVyZW5jZS52YWx1ZSgpKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUodmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBsZXQgeyBsYXN0VmFsdWUgfSA9IHRoaXM7XG5cbiAgICBpZiAodmFsdWUgPT09IGxhc3RWYWx1ZSkgcmV0dXJuO1xuXG4gICAgbGV0IG5vcm1hbGl6ZWQ6IHN0cmluZztcblxuICAgIGlmIChpc0VtcHR5KHZhbHVlKSkge1xuICAgICAgbm9ybWFsaXplZCA9ICcnO1xuICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICBub3JtYWxpemVkID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vcm1hbGl6ZWQgPSBTdHJpbmcodmFsdWUpO1xuICAgIH1cblxuICAgIGlmIChub3JtYWxpemVkICE9PSBsYXN0VmFsdWUpIHtcbiAgICAgIGxldCB0ZXh0Tm9kZSA9IHRoaXMubm9kZTtcbiAgICAgIHRleHROb2RlLm5vZGVWYWx1ZSA9IHRoaXMubGFzdFZhbHVlID0gbm9ybWFsaXplZDtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=