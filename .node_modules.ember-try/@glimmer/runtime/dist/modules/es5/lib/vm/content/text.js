function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { isEmpty, isString } from '../../dom/normalize';
import { UpdatingOpcode } from '../../opcodes';
import { value, validate } from '@glimmer/reference';

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
        _this.lastRevision = value(_this.tag);
        return _this;
    }

    DynamicTextContent.prototype.evaluate = function evaluate() {
        var reference = this.reference,
            tag = this.tag;

        if (!validate(tag, this.lastRevision)) {
            this.lastRevision = value(tag);
            this.update(reference.value());
        }
    };

    DynamicTextContent.prototype.update = function update(value) {
        var lastValue = this.lastValue;

        if (value === lastValue) return;
        var normalized = void 0;
        if (isEmpty(value)) {
            normalized = '';
        } else if (isString(value)) {
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
}(UpdatingOpcode);

export default DynamicTextContent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2NvbnRlbnQvdGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLFNBQUEsT0FBQSxFQUFBLFFBQUEsUUFBQSxxQkFBQTtBQUNBLFNBQUEsY0FBQSxRQUFBLGVBQUE7QUFDQSxTQUFBLEtBQUEsRUFBQSxRQUFBLFFBQUEsb0JBQUE7O0lBR2Msa0I7OztBQU1aLGdDQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUcyQjtBQUFBOztBQUFBLHFEQUV6QiwwQkFGeUI7O0FBRmxCLGNBQUEsSUFBQSxHQUFBLElBQUE7QUFDQyxjQUFBLFNBQUEsR0FBQSxTQUFBO0FBQ0EsY0FBQSxTQUFBLEdBQUEsU0FBQTtBQVJILGNBQUEsSUFBQSxHQUFBLGNBQUE7QUFXTCxjQUFBLEdBQUEsR0FBVyxVQUFYLEdBQUE7QUFDQSxjQUFBLFlBQUEsR0FBb0IsTUFBTSxNQUExQixHQUFvQixDQUFwQjtBQUp5QjtBQUsxQjs7aUNBRUQsUSx1QkFBUTtBQUFBLFlBQ0YsU0FERSxHQUNOLElBRE0sQ0FDRixTQURFO0FBQUEsWUFDRixHQURFLEdBQ04sSUFETSxDQUNGLEdBREU7O0FBR04sWUFBSSxDQUFDLFNBQUEsR0FBQSxFQUFjLEtBQW5CLFlBQUssQ0FBTCxFQUF1QztBQUNyQyxpQkFBQSxZQUFBLEdBQW9CLE1BQXBCLEdBQW9CLENBQXBCO0FBQ0EsaUJBQUEsTUFBQSxDQUFZLFVBQVosS0FBWSxFQUFaO0FBQ0Q7QUFDRixLOztpQ0FFRCxNLG1CQUFBLEssRUFBcUI7QUFBQSxZQUNmLFNBRGUsR0FDbkIsSUFEbUIsQ0FDZixTQURlOztBQUduQixZQUFJLFVBQUosU0FBQSxFQUF5QjtBQUV6QixZQUFBLG1CQUFBO0FBRUEsWUFBSSxRQUFKLEtBQUksQ0FBSixFQUFvQjtBQUNsQix5QkFBQSxFQUFBO0FBREYsU0FBQSxNQUVPLElBQUksU0FBSixLQUFJLENBQUosRUFBcUI7QUFDMUIseUJBQUEsS0FBQTtBQURLLFNBQUEsTUFFQTtBQUNMLHlCQUFhLE9BQWIsS0FBYSxDQUFiO0FBQ0Q7QUFFRCxZQUFJLGVBQUosU0FBQSxFQUE4QjtBQUM1QixnQkFBSSxXQUFXLEtBQWYsSUFBQTtBQUNBLHFCQUFBLFNBQUEsR0FBcUIsS0FBQSxTQUFBLEdBQXJCLFVBQUE7QUFDRDtBQUNGLEs7OztFQTVDVyxjOztlQUFBLGtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNFbXB0eSwgaXNTdHJpbmcgfSBmcm9tICcuLi8uLi9kb20vbm9ybWFsaXplJztcbmltcG9ydCB7IFVwZGF0aW5nT3Bjb2RlIH0gZnJvbSAnLi4vLi4vb3Bjb2Rlcyc7XG5pbXBvcnQgeyBUYWcsIFZlcnNpb25lZFJlZmVyZW5jZSwgdmFsdWUsIHZhbGlkYXRlLCBSZXZpc2lvbiB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBTaW1wbGVUZXh0IH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHluYW1pY1RleHRDb250ZW50IGV4dGVuZHMgVXBkYXRpbmdPcGNvZGUge1xuICBwdWJsaWMgdHlwZSA9ICdkeW5hbWljLXRleHQnO1xuXG4gIHB1YmxpYyB0YWc6IFRhZztcbiAgcHVibGljIGxhc3RSZXZpc2lvbjogUmV2aXNpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG5vZGU6IFNpbXBsZVRleHQsXG4gICAgcHJpdmF0ZSByZWZlcmVuY2U6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBwcml2YXRlIGxhc3RWYWx1ZTogc3RyaW5nXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy50YWcgPSByZWZlcmVuY2UudGFnO1xuICAgIHRoaXMubGFzdFJldmlzaW9uID0gdmFsdWUodGhpcy50YWcpO1xuICB9XG5cbiAgZXZhbHVhdGUoKSB7XG4gICAgbGV0IHsgcmVmZXJlbmNlLCB0YWcgfSA9IHRoaXM7XG5cbiAgICBpZiAoIXZhbGlkYXRlKHRhZywgdGhpcy5sYXN0UmV2aXNpb24pKSB7XG4gICAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG4gICAgICB0aGlzLnVwZGF0ZShyZWZlcmVuY2UudmFsdWUoKSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgbGV0IHsgbGFzdFZhbHVlIH0gPSB0aGlzO1xuXG4gICAgaWYgKHZhbHVlID09PSBsYXN0VmFsdWUpIHJldHVybjtcblxuICAgIGxldCBub3JtYWxpemVkOiBzdHJpbmc7XG5cbiAgICBpZiAoaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgIG5vcm1hbGl6ZWQgPSAnJztcbiAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgbm9ybWFsaXplZCA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBub3JtYWxpemVkID0gU3RyaW5nKHZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAobm9ybWFsaXplZCAhPT0gbGFzdFZhbHVlKSB7XG4gICAgICBsZXQgdGV4dE5vZGUgPSB0aGlzLm5vZGU7XG4gICAgICB0ZXh0Tm9kZS5ub2RlVmFsdWUgPSB0aGlzLmxhc3RWYWx1ZSA9IG5vcm1hbGl6ZWQ7XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9