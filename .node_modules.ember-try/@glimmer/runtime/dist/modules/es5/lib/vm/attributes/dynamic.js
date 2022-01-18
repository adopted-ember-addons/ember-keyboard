function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { normalizeStringValue } from '../../dom/normalize';
import { normalizeProperty } from '../../dom/props';
import { requiresSanitization, sanitizeAttributeValue } from '../../dom/sanitized-values';
export function dynamicAttribute(element, attr, namespace) {
    var tagName = element.tagName,
        namespaceURI = element.namespaceURI;

    var attribute = { element: element, name: attr, namespace: namespace };
    if (namespaceURI === "http://www.w3.org/2000/svg" /* SVG */) {
            return buildDynamicAttribute(tagName, attr, attribute);
        }

    var _normalizeProperty = normalizeProperty(element, attr),
        type = _normalizeProperty.type,
        normalized = _normalizeProperty.normalized;

    if (type === 'attr') {
        return buildDynamicAttribute(tagName, normalized, attribute);
    } else {
        return buildDynamicProperty(tagName, normalized, attribute);
    }
}
function buildDynamicAttribute(tagName, name, attribute) {
    if (requiresSanitization(tagName, name)) {
        return new SafeDynamicAttribute(attribute);
    } else {
        return new SimpleDynamicAttribute(attribute);
    }
}
function buildDynamicProperty(tagName, name, attribute) {
    if (requiresSanitization(tagName, name)) {
        return new SafeDynamicProperty(name, attribute);
    }
    if (isUserInputValue(tagName, name)) {
        return new InputValueDynamicAttribute(name, attribute);
    }
    if (isOptionSelected(tagName, name)) {
        return new OptionSelectedDynamicAttribute(name, attribute);
    }
    return new DefaultDynamicProperty(name, attribute);
}
export var DynamicAttribute = function DynamicAttribute(attribute) {
    _classCallCheck(this, DynamicAttribute);

    this.attribute = attribute;
};
export var SimpleDynamicAttribute = function (_DynamicAttribute) {
    _inherits(SimpleDynamicAttribute, _DynamicAttribute);

    function SimpleDynamicAttribute() {
        _classCallCheck(this, SimpleDynamicAttribute);

        return _possibleConstructorReturn(this, _DynamicAttribute.apply(this, arguments));
    }

    SimpleDynamicAttribute.prototype.set = function set(dom, value, _env) {
        var normalizedValue = normalizeValue(value);
        if (normalizedValue !== null) {
            var _attribute = this.attribute,
                name = _attribute.name,
                namespace = _attribute.namespace;

            dom.__setAttribute(name, normalizedValue, namespace);
        }
    };

    SimpleDynamicAttribute.prototype.update = function update(value, _env) {
        var normalizedValue = normalizeValue(value);
        var _attribute2 = this.attribute,
            element = _attribute2.element,
            name = _attribute2.name;

        if (normalizedValue === null) {
            element.removeAttribute(name);
        } else {
            element.setAttribute(name, normalizedValue);
        }
    };

    return SimpleDynamicAttribute;
}(DynamicAttribute);
export var DefaultDynamicProperty = function (_DynamicAttribute2) {
    _inherits(DefaultDynamicProperty, _DynamicAttribute2);

    function DefaultDynamicProperty(normalizedName, attribute) {
        _classCallCheck(this, DefaultDynamicProperty);

        var _this2 = _possibleConstructorReturn(this, _DynamicAttribute2.call(this, attribute));

        _this2.normalizedName = normalizedName;
        return _this2;
    }

    DefaultDynamicProperty.prototype.set = function set(dom, value, _env) {
        if (value !== null && value !== undefined) {
            this.value = value;
            dom.__setProperty(this.normalizedName, value);
        }
    };

    DefaultDynamicProperty.prototype.update = function update(value, _env) {
        var element = this.attribute.element;

        if (this.value !== value) {
            element[this.normalizedName] = this.value = value;
            if (value === null || value === undefined) {
                this.removeAttribute();
            }
        }
    };

    DefaultDynamicProperty.prototype.removeAttribute = function removeAttribute() {
        // TODO this sucks but to preserve properties first and to meet current
        // semantics we must do this.
        var _attribute3 = this.attribute,
            element = _attribute3.element,
            namespace = _attribute3.namespace;

        if (namespace) {
            element.removeAttributeNS(namespace, this.normalizedName);
        } else {
            element.removeAttribute(this.normalizedName);
        }
    };

    return DefaultDynamicProperty;
}(DynamicAttribute);
export var SafeDynamicProperty = function (_DefaultDynamicProper) {
    _inherits(SafeDynamicProperty, _DefaultDynamicProper);

    function SafeDynamicProperty() {
        _classCallCheck(this, SafeDynamicProperty);

        return _possibleConstructorReturn(this, _DefaultDynamicProper.apply(this, arguments));
    }

    SafeDynamicProperty.prototype.set = function set(dom, value, env) {
        var _attribute4 = this.attribute,
            element = _attribute4.element,
            name = _attribute4.name;

        var sanitized = sanitizeAttributeValue(env, element, name, value);
        _DefaultDynamicProper.prototype.set.call(this, dom, sanitized, env);
    };

    SafeDynamicProperty.prototype.update = function update(value, env) {
        var _attribute5 = this.attribute,
            element = _attribute5.element,
            name = _attribute5.name;

        var sanitized = sanitizeAttributeValue(env, element, name, value);
        _DefaultDynamicProper.prototype.update.call(this, sanitized, env);
    };

    return SafeDynamicProperty;
}(DefaultDynamicProperty);
export var SafeDynamicAttribute = function (_SimpleDynamicAttribu) {
    _inherits(SafeDynamicAttribute, _SimpleDynamicAttribu);

    function SafeDynamicAttribute() {
        _classCallCheck(this, SafeDynamicAttribute);

        return _possibleConstructorReturn(this, _SimpleDynamicAttribu.apply(this, arguments));
    }

    SafeDynamicAttribute.prototype.set = function set(dom, value, env) {
        var _attribute6 = this.attribute,
            element = _attribute6.element,
            name = _attribute6.name;

        var sanitized = sanitizeAttributeValue(env, element, name, value);
        _SimpleDynamicAttribu.prototype.set.call(this, dom, sanitized, env);
    };

    SafeDynamicAttribute.prototype.update = function update(value, env) {
        var _attribute7 = this.attribute,
            element = _attribute7.element,
            name = _attribute7.name;

        var sanitized = sanitizeAttributeValue(env, element, name, value);
        _SimpleDynamicAttribu.prototype.update.call(this, sanitized, env);
    };

    return SafeDynamicAttribute;
}(SimpleDynamicAttribute);
export var InputValueDynamicAttribute = function (_DefaultDynamicProper2) {
    _inherits(InputValueDynamicAttribute, _DefaultDynamicProper2);

    function InputValueDynamicAttribute() {
        _classCallCheck(this, InputValueDynamicAttribute);

        return _possibleConstructorReturn(this, _DefaultDynamicProper2.apply(this, arguments));
    }

    InputValueDynamicAttribute.prototype.set = function set(dom, value) {
        dom.__setProperty('value', normalizeStringValue(value));
    };

    InputValueDynamicAttribute.prototype.update = function update(value) {
        var input = this.attribute.element;
        var currentValue = input.value;
        var normalizedValue = normalizeStringValue(value);
        if (currentValue !== normalizedValue) {
            input.value = normalizedValue;
        }
    };

    return InputValueDynamicAttribute;
}(DefaultDynamicProperty);
export var OptionSelectedDynamicAttribute = function (_DefaultDynamicProper3) {
    _inherits(OptionSelectedDynamicAttribute, _DefaultDynamicProper3);

    function OptionSelectedDynamicAttribute() {
        _classCallCheck(this, OptionSelectedDynamicAttribute);

        return _possibleConstructorReturn(this, _DefaultDynamicProper3.apply(this, arguments));
    }

    OptionSelectedDynamicAttribute.prototype.set = function set(dom, value) {
        if (value !== null && value !== undefined && value !== false) {
            dom.__setProperty('selected', true);
        }
    };

    OptionSelectedDynamicAttribute.prototype.update = function update(value) {
        var option = this.attribute.element;
        if (value) {
            option.selected = true;
        } else {
            option.selected = false;
        }
    };

    return OptionSelectedDynamicAttribute;
}(DefaultDynamicProperty);
function isOptionSelected(tagName, attribute) {
    return tagName === 'OPTION' && attribute === 'selected';
}
function isUserInputValue(tagName, attribute) {
    return (tagName === 'INPUT' || tagName === 'TEXTAREA') && attribute === 'value';
}
function normalizeValue(value) {
    if (value === false || value === undefined || value === null || typeof value.toString === 'undefined') {
        return null;
    }
    if (value === true) {
        return '';
    }
    // onclick function etc in SSR
    if (typeof value === 'function') {
        return null;
    }
    return String(value);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2F0dHJpYnV0ZXMvZHluYW1pYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUVBLFNBQUEsb0JBQUEsUUFBQSxxQkFBQTtBQUNBLFNBQUEsaUJBQUEsUUFBQSxpQkFBQTtBQUNBLFNBQUEsb0JBQUEsRUFBQSxzQkFBQSxRQUFBLDRCQUFBO0FBR0EsT0FBTSxTQUFBLGdCQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBRzRCO0FBQUEsUUFFNUIsT0FGNEIsR0FFaEMsT0FGZ0MsQ0FFNUIsT0FGNEI7QUFBQSxRQUU1QixZQUY0QixHQUVoQyxPQUZnQyxDQUU1QixZQUY0Qjs7QUFHaEMsUUFBSSxZQUFZLEVBQUEsZ0JBQUEsRUFBVyxNQUFYLElBQUEsRUFBaEIsb0JBQWdCLEVBQWhCO0FBRUEsUUFBSSxpQkFBSiw0QkFBQSxDQUFBLFNBQUEsRUFBb0M7QUFDbEMsbUJBQU8sc0JBQUEsT0FBQSxFQUFBLElBQUEsRUFBUCxTQUFPLENBQVA7QUFDRDs7QUFQK0IsNkJBU0wsa0JBQUEsT0FBQSxFQUEzQixJQUEyQixDQVRLO0FBQUEsUUFTNUIsSUFUNEIsc0JBUzVCLElBVDRCO0FBQUEsUUFTNUIsVUFUNEIsc0JBUzVCLFVBVDRCOztBQVdoQyxRQUFJLFNBQUosTUFBQSxFQUFxQjtBQUNuQixlQUFPLHNCQUFBLE9BQUEsRUFBQSxVQUFBLEVBQVAsU0FBTyxDQUFQO0FBREYsS0FBQSxNQUVPO0FBQ0wsZUFBTyxxQkFBQSxPQUFBLEVBQUEsVUFBQSxFQUFQLFNBQU8sQ0FBUDtBQUNEO0FBQ0Y7QUFFRCxTQUFBLHFCQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBR3NCO0FBRXBCLFFBQUkscUJBQUEsT0FBQSxFQUFKLElBQUksQ0FBSixFQUF5QztBQUN2QyxlQUFPLElBQUEsb0JBQUEsQ0FBUCxTQUFPLENBQVA7QUFERixL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QUF5QyxVQUE3QyxLQUFBLEVBQThEO0FBQzVELGdCQUFBLGFBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQTtBQUNEO0FBQ0YsS0FMSDs7QUFBQSw2Q0FPRSxNQVBGLG1CQU9FLEtBUEYsRUFPdUI7QUFDbkIsWUFBSSxTQUFTLEtBQUEsU0FBQSxDQUFiLE9BQUE7QUFFQSxZQUFBLEtBQUEsRUFBVztBQUNULG1CQUFBLFFBQUEsR0FBQSxJQUFBO0FBREYsU0FBQSxNQUVPO0FBQ0wsbUJBQUEsUUFBQSxHQUFBLEtBQUE7QUFDRDtBQUNGLEtBZkg7O0FBQUE7QUFBQSxFQUFNLHNCQUFOO0FBa0JBLFNBQUEsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsU0FBQSxFQUE0RDtBQUMxRCxXQUFPLFlBQUEsUUFBQSxJQUF3QixjQUEvQixVQUFBO0FBQ0Q7QUFFRCxTQUFBLGdCQUFBLENBQUEsT0FBQSxFQUFBLFNBQUEsRUFBNEQ7QUFDMUQsV0FBTyxDQUFDLFlBQUEsT0FBQSxJQUF1QixZQUF4QixVQUFBLEtBQW1ELGNBQTFELE9BQUE7QUFDRDtBQUVELFNBQUEsY0FBQSxDQUFBLEtBQUEsRUFBc0M7QUFDcEMsUUFDRSxVQUFBLEtBQUEsSUFDQSxVQURBLFNBQUEsSUFFQSxVQUZBLElBQUEsSUFHQSxPQUFRLE1BQVIsUUFBQSxLQUpGLFdBQUEsRUFLRTtBQUNBLGVBQUEsSUFBQTtBQUNEO0FBQ0QsUUFBSSxVQUFKLElBQUEsRUFBb0I7QUFDbEIsZUFBQSxFQUFBO0FBQ0Q7QUFDRDtBQUNBLFFBQUksT0FBQSxLQUFBLEtBQUosVUFBQSxFQUFpQztBQUMvQixlQUFBLElBQUE7QUFDRDtBQUVELFdBQU8sT0FBUCxLQUFPLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpY3QsIEVudmlyb25tZW50LCBPcHRpb24sIEVsZW1lbnRCdWlsZGVyIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBBdHRyTmFtZXNwYWNlLCBOYW1lc3BhY2UsIFNpbXBsZUVsZW1lbnQgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgbm9ybWFsaXplU3RyaW5nVmFsdWUgfSBmcm9tICcuLi8uLi9kb20vbm9ybWFsaXplJztcbmltcG9ydCB7IG5vcm1hbGl6ZVByb3BlcnR5IH0gZnJvbSAnLi4vLi4vZG9tL3Byb3BzJztcbmltcG9ydCB7IHJlcXVpcmVzU2FuaXRpemF0aW9uLCBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlIH0gZnJvbSAnLi4vLi4vZG9tL3Nhbml0aXplZC12YWx1ZXMnO1xuaW1wb3J0IHsgQXR0cmlidXRlLCBBdHRyaWJ1dGVPcGVyYXRpb24gfSBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGZ1bmN0aW9uIGR5bmFtaWNBdHRyaWJ1dGUoXG4gIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gIGF0dHI6IHN0cmluZyxcbiAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT5cbik6IER5bmFtaWNBdHRyaWJ1dGUge1xuICBsZXQgeyB0YWdOYW1lLCBuYW1lc3BhY2VVUkkgfSA9IGVsZW1lbnQ7XG4gIGxldCBhdHRyaWJ1dGUgPSB7IGVsZW1lbnQsIG5hbWU6IGF0dHIsIG5hbWVzcGFjZSB9O1xuXG4gIGlmIChuYW1lc3BhY2VVUkkgPT09IE5hbWVzcGFjZS5TVkcpIHtcbiAgICByZXR1cm4gYnVpbGREeW5hbWljQXR0cmlidXRlKHRhZ05hbWUsIGF0dHIsIGF0dHJpYnV0ZSk7XG4gIH1cblxuICBsZXQgeyB0eXBlLCBub3JtYWxpemVkIH0gPSBub3JtYWxpemVQcm9wZXJ0eShlbGVtZW50LCBhdHRyKTtcblxuICBpZiAodHlwZSA9PT0gJ2F0dHInKSB7XG4gICAgcmV0dXJuIGJ1aWxkRHluYW1pY0F0dHJpYnV0ZSh0YWdOYW1lLCBub3JtYWxpemVkLCBhdHRyaWJ1dGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBidWlsZER5bmFtaWNQcm9wZXJ0eSh0YWdOYW1lLCBub3JtYWxpemVkLCBhdHRyaWJ1dGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkRHluYW1pY0F0dHJpYnV0ZShcbiAgdGFnTmFtZTogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIGF0dHJpYnV0ZTogQXR0cmlidXRlXG4pOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgaWYgKHJlcXVpcmVzU2FuaXRpemF0aW9uKHRhZ05hbWUsIG5hbWUpKSB7XG4gICAgcmV0dXJuIG5ldyBTYWZlRHluYW1pY0F0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgU2ltcGxlRHluYW1pY0F0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkRHluYW1pY1Byb3BlcnR5KFxuICB0YWdOYW1lOiBzdHJpbmcsXG4gIG5hbWU6IHN0cmluZyxcbiAgYXR0cmlidXRlOiBBdHRyaWJ1dGVcbik6IER5bmFtaWNBdHRyaWJ1dGUge1xuICBpZiAocmVxdWlyZXNTYW5pdGl6YXRpb24odGFnTmFtZSwgbmFtZSkpIHtcbiAgICByZXR1cm4gbmV3IFNhZmVEeW5hbWljUHJvcGVydHkobmFtZSwgYXR0cmlidXRlKTtcbiAgfVxuXG4gIGlmIChpc1VzZXJJbnB1dFZhbHVlKHRhZ05hbWUsIG5hbWUpKSB7XG4gICAgcmV0dXJuIG5ldyBJbnB1dFZhbHVlRHluYW1pY0F0dHJpYnV0ZShuYW1lLCBhdHRyaWJ1dGUpO1xuICB9XG5cbiAgaWYgKGlzT3B0aW9uU2VsZWN0ZWQodGFnTmFtZSwgbmFtZSkpIHtcbiAgICByZXR1cm4gbmV3IE9wdGlvblNlbGVjdGVkRHluYW1pY0F0dHJpYnV0ZShuYW1lLCBhdHRyaWJ1dGUpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBEZWZhdWx0RHluYW1pY1Byb3BlcnR5KG5hbWUsIGF0dHJpYnV0ZSk7XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEeW5hbWljQXR0cmlidXRlIGltcGxlbWVudHMgQXR0cmlidXRlT3BlcmF0aW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIGF0dHJpYnV0ZTogQXR0cmlidXRlKSB7fVxuXG4gIGFic3RyYWN0IHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQ7XG4gIGFic3RyYWN0IHVwZGF0ZSh2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBTaW1wbGVEeW5hbWljQXR0cmlidXRlIGV4dGVuZHMgRHluYW1pY0F0dHJpYnV0ZSB7XG4gIHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93biwgX2VudjogRW52aXJvbm1lbnQpOiB2b2lkIHtcbiAgICBsZXQgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpO1xuXG4gICAgaWYgKG5vcm1hbGl6ZWRWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgbGV0IHsgbmFtZSwgbmFtZXNwYWNlIH0gPSB0aGlzLmF0dHJpYnV0ZTtcbiAgICAgIGRvbS5fX3NldEF0dHJpYnV0ZShuYW1lLCBub3JtYWxpemVkVmFsdWUsIG5hbWVzcGFjZSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKHZhbHVlOiB1bmtub3duLCBfZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCBub3JtYWxpemVkVmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSk7XG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG5cbiAgICBpZiAobm9ybWFsaXplZFZhbHVlID09PSBudWxsKSB7XG4gICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUobmFtZSwgbm9ybWFsaXplZFZhbHVlKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHREeW5hbWljUHJvcGVydHkgZXh0ZW5kcyBEeW5hbWljQXR0cmlidXRlIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBub3JtYWxpemVkTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGU6IEF0dHJpYnV0ZSkge1xuICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gIH1cblxuICB2YWx1ZTogdW5rbm93bjtcbiAgc2V0KGRvbTogRWxlbWVudEJ1aWxkZXIsIHZhbHVlOiB1bmtub3duLCBfZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICBkb20uX19zZXRQcm9wZXJ0eSh0aGlzLm5vcm1hbGl6ZWROYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKHZhbHVlOiB1bmtub3duLCBfZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCB7IGVsZW1lbnQgfSA9IHRoaXMuYXR0cmlidXRlO1xuXG4gICAgaWYgKHRoaXMudmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAoZWxlbWVudCBhcyBEaWN0KVt0aGlzLm5vcm1hbGl6ZWROYW1lXSA9IHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVtb3ZlQXR0cmlidXRlKCkge1xuICAgIC8vIFRPRE8gdGhpcyBzdWNrcyBidXQgdG8gcHJlc2VydmUgcHJvcGVydGllcyBmaXJzdCBhbmQgdG8gbWVldCBjdXJyZW50XG4gICAgLy8gc2VtYW50aWNzIHdlIG11c3QgZG8gdGhpcy5cbiAgICBsZXQgeyBlbGVtZW50LCBuYW1lc3BhY2UgfSA9IHRoaXMuYXR0cmlidXRlO1xuXG4gICAgaWYgKG5hbWVzcGFjZSkge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGVOUyhuYW1lc3BhY2UsIHRoaXMubm9ybWFsaXplZE5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSh0aGlzLm5vcm1hbGl6ZWROYW1lKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhZmVEeW5hbWljUHJvcGVydHkgZXh0ZW5kcyBEZWZhdWx0RHluYW1pY1Byb3BlcnR5IHtcbiAgc2V0KGRvbTogRWxlbWVudEJ1aWxkZXIsIHZhbHVlOiB1bmtub3duLCBlbnY6IEVudmlyb25tZW50KTogdm9pZCB7XG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG4gICAgbGV0IHNhbml0aXplZCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZW52LCBlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgc3VwZXIuc2V0KGRvbSwgc2FuaXRpemVkLCBlbnYpO1xuICB9XG5cbiAgdXBkYXRlKHZhbHVlOiB1bmtub3duLCBlbnY6IEVudmlyb25tZW50KTogdm9pZCB7XG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG4gICAgbGV0IHNhbml0aXplZCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZW52LCBlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgc3VwZXIudXBkYXRlKHNhbml0aXplZCwgZW52KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2FmZUR5bmFtaWNBdHRyaWJ1dGUgZXh0ZW5kcyBTaW1wbGVEeW5hbWljQXR0cmlidXRlIHtcbiAgc2V0KGRvbTogRWxlbWVudEJ1aWxkZXIsIHZhbHVlOiB1bmtub3duLCBlbnY6IEVudmlyb25tZW50KTogdm9pZCB7XG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG4gICAgbGV0IHNhbml0aXplZCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZW52LCBlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgc3VwZXIuc2V0KGRvbSwgc2FuaXRpemVkLCBlbnYpO1xuICB9XG5cbiAgdXBkYXRlKHZhbHVlOiB1bmtub3duLCBlbnY6IEVudmlyb25tZW50KTogdm9pZCB7XG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG4gICAgbGV0IHNhbml0aXplZCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZW52LCBlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgc3VwZXIudXBkYXRlKHNhbml0aXplZCwgZW52KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW5wdXRWYWx1ZUR5bmFtaWNBdHRyaWJ1dGUgZXh0ZW5kcyBEZWZhdWx0RHluYW1pY1Byb3BlcnR5IHtcbiAgc2V0KGRvbTogRWxlbWVudEJ1aWxkZXIsIHZhbHVlOiB1bmtub3duKSB7XG4gICAgZG9tLl9fc2V0UHJvcGVydHkoJ3ZhbHVlJywgbm9ybWFsaXplU3RyaW5nVmFsdWUodmFsdWUpKTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93bikge1xuICAgIGxldCBpbnB1dCA9IHRoaXMuYXR0cmlidXRlLmVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBsZXQgY3VycmVudFZhbHVlID0gaW5wdXQudmFsdWU7XG4gICAgbGV0IG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZVN0cmluZ1ZhbHVlKHZhbHVlKTtcbiAgICBpZiAoY3VycmVudFZhbHVlICE9PSBub3JtYWxpemVkVmFsdWUpIHtcbiAgICAgIGlucHV0LnZhbHVlID0gbm9ybWFsaXplZFZhbHVlITtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9wdGlvblNlbGVjdGVkRHluYW1pY0F0dHJpYnV0ZSBleHRlbmRzIERlZmF1bHREeW5hbWljUHJvcGVydHkge1xuICBzZXQoZG9tOiBFbGVtZW50QnVpbGRlciwgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gZmFsc2UpIHtcbiAgICAgIGRvbS5fX3NldFByb3BlcnR5KCdzZWxlY3RlZCcsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGxldCBvcHRpb24gPSB0aGlzLmF0dHJpYnV0ZS5lbGVtZW50IGFzIEhUTUxPcHRpb25FbGVtZW50O1xuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNPcHRpb25TZWxlY3RlZCh0YWdOYW1lOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gIHJldHVybiB0YWdOYW1lID09PSAnT1BUSU9OJyAmJiBhdHRyaWJ1dGUgPT09ICdzZWxlY3RlZCc7XG59XG5cbmZ1bmN0aW9uIGlzVXNlcklucHV0VmFsdWUodGFnTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGU6IHN0cmluZykge1xuICByZXR1cm4gKHRhZ05hbWUgPT09ICdJTlBVVCcgfHwgdGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykgJiYgYXR0cmlidXRlID09PSAndmFsdWUnO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZTogdW5rbm93bik6IE9wdGlvbjxzdHJpbmc+IHtcbiAgaWYgKFxuICAgIHZhbHVlID09PSBmYWxzZSB8fFxuICAgIHZhbHVlID09PSB1bmRlZmluZWQgfHxcbiAgICB2YWx1ZSA9PT0gbnVsbCB8fFxuICAgIHR5cGVvZiAodmFsdWUgYXMgRGljdCkudG9TdHJpbmcgPT09ICd1bmRlZmluZWQnXG4gICkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICAvLyBvbmNsaWNrIGZ1bmN0aW9uIGV0YyBpbiBTU1JcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9