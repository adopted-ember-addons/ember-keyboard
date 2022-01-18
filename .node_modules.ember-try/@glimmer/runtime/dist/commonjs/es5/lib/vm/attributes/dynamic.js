"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OptionSelectedDynamicAttribute = exports.InputValueDynamicAttribute = exports.SafeDynamicAttribute = exports.SafeDynamicProperty = exports.DefaultDynamicProperty = exports.SimpleDynamicAttribute = exports.DynamicAttribute = undefined;
exports.dynamicAttribute = dynamicAttribute;

var _normalize = require("../../dom/normalize");

var _props = require("../../dom/props");

var _sanitizedValues = require("../../dom/sanitized-values");

function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
        var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
        }
    }return obj;
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

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function dynamicAttribute(element, attr, namespace) {
    var tagName = element.tagName,
        namespaceURI = element.namespaceURI;

    var attribute = { element: element, name: attr, namespace: namespace };
    if (namespaceURI === "http://www.w3.org/2000/svg" /* SVG */) {
            return buildDynamicAttribute(tagName, attr, attribute);
        }

    var _normalizeProperty = (0, _props.normalizeProperty)(element, attr),
        type = _normalizeProperty.type,
        normalized = _normalizeProperty.normalized;

    if (type === 'attr') {
        return buildDynamicAttribute(tagName, normalized, attribute);
    } else {
        return buildDynamicProperty(tagName, normalized, attribute);
    }
}
function buildDynamicAttribute(tagName, name, attribute) {
    if ((0, _sanitizedValues.requiresSanitization)(tagName, name)) {
        return new SafeDynamicAttribute(attribute);
    } else {
        return new SimpleDynamicAttribute(attribute);
    }
}
function buildDynamicProperty(tagName, name, attribute) {
    if ((0, _sanitizedValues.requiresSanitization)(tagName, name)) {
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
var DynamicAttribute = exports.DynamicAttribute = function DynamicAttribute(attribute) {
    _classCallCheck(this, DynamicAttribute);

    this.attribute = attribute;
};
var SimpleDynamicAttribute = exports.SimpleDynamicAttribute = function (_DynamicAttribute) {
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
var DefaultDynamicProperty = exports.DefaultDynamicProperty = function (_DynamicAttribute2) {
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
var SafeDynamicProperty = exports.SafeDynamicProperty = function (_DefaultDynamicProper) {
    _inherits(SafeDynamicProperty, _DefaultDynamicProper);

    function SafeDynamicProperty() {
        _classCallCheck(this, SafeDynamicProperty);

        return _possibleConstructorReturn(this, _DefaultDynamicProper.apply(this, arguments));
    }

    SafeDynamicProperty.prototype.set = function set(dom, value, env) {
        var _attribute4 = this.attribute,
            element = _attribute4.element,
            name = _attribute4.name;

        var sanitized = (0, _sanitizedValues.sanitizeAttributeValue)(env, element, name, value);
        _DefaultDynamicProper.prototype.set.call(this, dom, sanitized, env);
    };

    SafeDynamicProperty.prototype.update = function update(value, env) {
        var _attribute5 = this.attribute,
            element = _attribute5.element,
            name = _attribute5.name;

        var sanitized = (0, _sanitizedValues.sanitizeAttributeValue)(env, element, name, value);
        _DefaultDynamicProper.prototype.update.call(this, sanitized, env);
    };

    return SafeDynamicProperty;
}(DefaultDynamicProperty);
var SafeDynamicAttribute = exports.SafeDynamicAttribute = function (_SimpleDynamicAttribu) {
    _inherits(SafeDynamicAttribute, _SimpleDynamicAttribu);

    function SafeDynamicAttribute() {
        _classCallCheck(this, SafeDynamicAttribute);

        return _possibleConstructorReturn(this, _SimpleDynamicAttribu.apply(this, arguments));
    }

    SafeDynamicAttribute.prototype.set = function set(dom, value, env) {
        var _attribute6 = this.attribute,
            element = _attribute6.element,
            name = _attribute6.name;

        var sanitized = (0, _sanitizedValues.sanitizeAttributeValue)(env, element, name, value);
        _SimpleDynamicAttribu.prototype.set.call(this, dom, sanitized, env);
    };

    SafeDynamicAttribute.prototype.update = function update(value, env) {
        var _attribute7 = this.attribute,
            element = _attribute7.element,
            name = _attribute7.name;

        var sanitized = (0, _sanitizedValues.sanitizeAttributeValue)(env, element, name, value);
        _SimpleDynamicAttribu.prototype.update.call(this, sanitized, env);
    };

    return SafeDynamicAttribute;
}(SimpleDynamicAttribute);
var InputValueDynamicAttribute = exports.InputValueDynamicAttribute = function (_DefaultDynamicProper2) {
    _inherits(InputValueDynamicAttribute, _DefaultDynamicProper2);

    function InputValueDynamicAttribute() {
        _classCallCheck(this, InputValueDynamicAttribute);

        return _possibleConstructorReturn(this, _DefaultDynamicProper2.apply(this, arguments));
    }

    InputValueDynamicAttribute.prototype.set = function set(dom, value) {
        dom.__setProperty('value', (0, _normalize.normalizeStringValue)(value));
    };

    InputValueDynamicAttribute.prototype.update = function update(value) {
        var input = this.attribute.element;
        var currentValue = input.value;
        var normalizedValue = (0, _normalize.normalizeStringValue)(value);
        if (currentValue !== normalizedValue) {
            input.value = normalizedValue;
        }
    };

    return InputValueDynamicAttribute;
}(DefaultDynamicProperty);
var OptionSelectedDynamicAttribute = exports.OptionSelectedDynamicAttribute = function (_DefaultDynamicProper3) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2F0dHJpYnV0ZXMvZHluYW1pYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7UUFPTSxnQixHQUFBLGdCOztBQUxOOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR00sU0FBQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUc0QjtBQUFBLFFBQUEsVUFBQSxRQUFBLE9BQUE7QUFBQSxRQUFBLGVBQUEsUUFBQSxZQUFBOztBQUdoQyxRQUFJLFlBQVksRUFBQSxTQUFBLE9BQUEsRUFBVyxNQUFYLElBQUEsRUFBaEIsV0FBQSxTQUFnQixFQUFoQjtBQUVBLFFBQUksaUJBQUosNEJBQUEsQ0FBQSxTQUFBLEVBQW9DO0FBQ2xDLG1CQUFPLHNCQUFBLE9BQUEsRUFBQSxJQUFBLEVBQVAsU0FBTyxDQUFQO0FBQ0Q7O0FBUCtCLFFBQUEscUJBU0wsOEJBQUEsT0FBQSxFQVRLLElBU0wsQ0FUSztBQUFBLFFBQUEsT0FBQSxtQkFBQSxJQUFBO0FBQUEsUUFBQSxhQUFBLG1CQUFBLFVBQUE7O0FBV2hDLFFBQUksU0FBSixNQUFBLEVBQXFCO0FBQ25CLGVBQU8sc0JBQUEsT0FBQSxFQUFBLFVBQUEsRUFBUCxTQUFPLENBQVA7QUFERixLQUFBLE1BRU87QUFDTCxlQUFPLHFCQUFBLE9BQUEsRUFBQSxVQUFBLEVBQVAsU0FBTyxDQUFQO0FBQ0Q7QUFDRjtBQUVELFNBQUEscUJBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFHc0I7QUFFcEIsUUFBSSwyQ0FBQSxPQUFBLEVBQUosSUFBSSxDQUFKLEVBQXlDO0FBQ3ZDLGVBQU8sSUFBQSxvQkFBQSxDQUFQLFNBQU8sQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLGVBQU8sSUFBQSxzQkFBQSxDQUFQLFNBQU8sQ0FBUDtBQUNEO0FBQ0Y7QUFFRCxTQUFBLG9C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Q0EsVUFEQSxTQUFBLElBRUEsVUFGQSxJQUFBLElBR0EsT0FBUSxNQUFSLFFBQUEsS0FKRixXQUFBLEVBS0U7QUFDQSxlQUFBLElBQUE7QUFDRDtBQUNELFFBQUksVUFBSixJQUFBLEVBQW9CO0FBQ2xCLGVBQUEsRUFBQTtBQUNEO0FBQ0Q7QUFDQSxRQUFJLE9BQUEsS0FBQSxLQUFKLFVBQUEsRUFBaUM7QUFDL0IsZUFBQSxJQUFBO0FBQ0Q7QUFFRCxXQUFPLE9BQVAsS0FBTyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaWN0LCBFbnZpcm9ubWVudCwgT3B0aW9uLCBFbGVtZW50QnVpbGRlciB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQXR0ck5hbWVzcGFjZSwgTmFtZXNwYWNlLCBTaW1wbGVFbGVtZW50IH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IG5vcm1hbGl6ZVN0cmluZ1ZhbHVlIH0gZnJvbSAnLi4vLi4vZG9tL25vcm1hbGl6ZSc7XG5pbXBvcnQgeyBub3JtYWxpemVQcm9wZXJ0eSB9IGZyb20gJy4uLy4uL2RvbS9wcm9wcyc7XG5pbXBvcnQgeyByZXF1aXJlc1Nhbml0aXphdGlvbiwgc2FuaXRpemVBdHRyaWJ1dGVWYWx1ZSB9IGZyb20gJy4uLy4uL2RvbS9zYW5pdGl6ZWQtdmFsdWVzJztcbmltcG9ydCB7IEF0dHJpYnV0ZSwgQXR0cmlidXRlT3BlcmF0aW9uIH0gZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBkeW5hbWljQXR0cmlidXRlKFxuICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICBhdHRyOiBzdHJpbmcsXG4gIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+XG4pOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgbGV0IHsgdGFnTmFtZSwgbmFtZXNwYWNlVVJJIH0gPSBlbGVtZW50O1xuICBsZXQgYXR0cmlidXRlID0geyBlbGVtZW50LCBuYW1lOiBhdHRyLCBuYW1lc3BhY2UgfTtcblxuICBpZiAobmFtZXNwYWNlVVJJID09PSBOYW1lc3BhY2UuU1ZHKSB7XG4gICAgcmV0dXJuIGJ1aWxkRHluYW1pY0F0dHJpYnV0ZSh0YWdOYW1lLCBhdHRyLCBhdHRyaWJ1dGUpO1xuICB9XG5cbiAgbGV0IHsgdHlwZSwgbm9ybWFsaXplZCB9ID0gbm9ybWFsaXplUHJvcGVydHkoZWxlbWVudCwgYXR0cik7XG5cbiAgaWYgKHR5cGUgPT09ICdhdHRyJykge1xuICAgIHJldHVybiBidWlsZER5bmFtaWNBdHRyaWJ1dGUodGFnTmFtZSwgbm9ybWFsaXplZCwgYXR0cmlidXRlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYnVpbGREeW5hbWljUHJvcGVydHkodGFnTmFtZSwgbm9ybWFsaXplZCwgYXR0cmlidXRlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZER5bmFtaWNBdHRyaWJ1dGUoXG4gIHRhZ05hbWU6IHN0cmluZyxcbiAgbmFtZTogc3RyaW5nLFxuICBhdHRyaWJ1dGU6IEF0dHJpYnV0ZVxuKTogRHluYW1pY0F0dHJpYnV0ZSB7XG4gIGlmIChyZXF1aXJlc1Nhbml0aXphdGlvbih0YWdOYW1lLCBuYW1lKSkge1xuICAgIHJldHVybiBuZXcgU2FmZUR5bmFtaWNBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFNpbXBsZUR5bmFtaWNBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZER5bmFtaWNQcm9wZXJ0eShcbiAgdGFnTmFtZTogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIGF0dHJpYnV0ZTogQXR0cmlidXRlXG4pOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgaWYgKHJlcXVpcmVzU2FuaXRpemF0aW9uKHRhZ05hbWUsIG5hbWUpKSB7XG4gICAgcmV0dXJuIG5ldyBTYWZlRHluYW1pY1Byb3BlcnR5KG5hbWUsIGF0dHJpYnV0ZSk7XG4gIH1cblxuICBpZiAoaXNVc2VySW5wdXRWYWx1ZSh0YWdOYW1lLCBuYW1lKSkge1xuICAgIHJldHVybiBuZXcgSW5wdXRWYWx1ZUR5bmFtaWNBdHRyaWJ1dGUobmFtZSwgYXR0cmlidXRlKTtcbiAgfVxuXG4gIGlmIChpc09wdGlvblNlbGVjdGVkKHRhZ05hbWUsIG5hbWUpKSB7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25TZWxlY3RlZER5bmFtaWNBdHRyaWJ1dGUobmFtZSwgYXR0cmlidXRlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRGVmYXVsdER5bmFtaWNQcm9wZXJ0eShuYW1lLCBhdHRyaWJ1dGUpO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHluYW1pY0F0dHJpYnV0ZSBpbXBsZW1lbnRzIEF0dHJpYnV0ZU9wZXJhdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBhdHRyaWJ1dGU6IEF0dHJpYnV0ZSkge31cblxuICBhYnN0cmFjdCBzZXQoZG9tOiBFbGVtZW50QnVpbGRlciwgdmFsdWU6IHVua25vd24sIGVudjogRW52aXJvbm1lbnQpOiB2b2lkO1xuICBhYnN0cmFjdCB1cGRhdGUodmFsdWU6IHVua25vd24sIGVudjogRW52aXJvbm1lbnQpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgU2ltcGxlRHluYW1pY0F0dHJpYnV0ZSBleHRlbmRzIER5bmFtaWNBdHRyaWJ1dGUge1xuICBzZXQoZG9tOiBFbGVtZW50QnVpbGRlciwgdmFsdWU6IHVua25vd24sIF9lbnY6IEVudmlyb25tZW50KTogdm9pZCB7XG4gICAgbGV0IG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKTtcblxuICAgIGlmIChub3JtYWxpemVkVmFsdWUgIT09IG51bGwpIHtcbiAgICAgIGxldCB7IG5hbWUsIG5hbWVzcGFjZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG4gICAgICBkb20uX19zZXRBdHRyaWJ1dGUobmFtZSwgbm9ybWFsaXplZFZhbHVlLCBuYW1lc3BhY2UpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93biwgX2VudjogRW52aXJvbm1lbnQpOiB2b2lkIHtcbiAgICBsZXQgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpO1xuICAgIGxldCB7IGVsZW1lbnQsIG5hbWUgfSA9IHRoaXMuYXR0cmlidXRlO1xuXG4gICAgaWYgKG5vcm1hbGl6ZWRWYWx1ZSA9PT0gbnVsbCkge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIG5vcm1hbGl6ZWRWYWx1ZSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0RHluYW1pY1Byb3BlcnR5IGV4dGVuZHMgRHluYW1pY0F0dHJpYnV0ZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbm9ybWFsaXplZE5hbWU6IHN0cmluZywgYXR0cmlidXRlOiBBdHRyaWJ1dGUpIHtcbiAgICBzdXBlcihhdHRyaWJ1dGUpO1xuICB9XG5cbiAgdmFsdWU6IHVua25vd247XG4gIHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93biwgX2VudjogRW52aXJvbm1lbnQpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgZG9tLl9fc2V0UHJvcGVydHkodGhpcy5ub3JtYWxpemVkTmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93biwgX2VudjogRW52aXJvbm1lbnQpOiB2b2lkIHtcbiAgICBsZXQgeyBlbGVtZW50IH0gPSB0aGlzLmF0dHJpYnV0ZTtcblxuICAgIGlmICh0aGlzLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgKGVsZW1lbnQgYXMgRGljdClbdGhpcy5ub3JtYWxpemVkTmFtZV0gPSB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIHJlbW92ZUF0dHJpYnV0ZSgpIHtcbiAgICAvLyBUT0RPIHRoaXMgc3Vja3MgYnV0IHRvIHByZXNlcnZlIHByb3BlcnRpZXMgZmlyc3QgYW5kIHRvIG1lZXQgY3VycmVudFxuICAgIC8vIHNlbWFudGljcyB3ZSBtdXN0IGRvIHRoaXMuXG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZXNwYWNlIH0gPSB0aGlzLmF0dHJpYnV0ZTtcblxuICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlTlMobmFtZXNwYWNlLCB0aGlzLm5vcm1hbGl6ZWROYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5ub3JtYWxpemVkTmFtZSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTYWZlRHluYW1pY1Byb3BlcnR5IGV4dGVuZHMgRGVmYXVsdER5bmFtaWNQcm9wZXJ0eSB7XG4gIHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCB7IGVsZW1lbnQsIG5hbWUgfSA9IHRoaXMuYXR0cmlidXRlO1xuICAgIGxldCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGVudiwgZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgIHN1cGVyLnNldChkb20sIHNhbml0aXplZCwgZW52KTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCB7IGVsZW1lbnQsIG5hbWUgfSA9IHRoaXMuYXR0cmlidXRlO1xuICAgIGxldCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGVudiwgZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgIHN1cGVyLnVwZGF0ZShzYW5pdGl6ZWQsIGVudik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhZmVEeW5hbWljQXR0cmlidXRlIGV4dGVuZHMgU2ltcGxlRHluYW1pY0F0dHJpYnV0ZSB7XG4gIHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCB7IGVsZW1lbnQsIG5hbWUgfSA9IHRoaXMuYXR0cmlidXRlO1xuICAgIGxldCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGVudiwgZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgIHN1cGVyLnNldChkb20sIHNhbml0aXplZCwgZW52KTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCB7IGVsZW1lbnQsIG5hbWUgfSA9IHRoaXMuYXR0cmlidXRlO1xuICAgIGxldCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGVudiwgZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgIHN1cGVyLnVwZGF0ZShzYW5pdGl6ZWQsIGVudik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIElucHV0VmFsdWVEeW5hbWljQXR0cmlidXRlIGV4dGVuZHMgRGVmYXVsdER5bmFtaWNQcm9wZXJ0eSB7XG4gIHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93bikge1xuICAgIGRvbS5fX3NldFByb3BlcnR5KCd2YWx1ZScsIG5vcm1hbGl6ZVN0cmluZ1ZhbHVlKHZhbHVlKSk7XG4gIH1cblxuICB1cGRhdGUodmFsdWU6IHVua25vd24pIHtcbiAgICBsZXQgaW5wdXQgPSB0aGlzLmF0dHJpYnV0ZS5lbGVtZW50IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgbGV0IGN1cnJlbnRWYWx1ZSA9IGlucHV0LnZhbHVlO1xuICAgIGxldCBub3JtYWxpemVkVmFsdWUgPSBub3JtYWxpemVTdHJpbmdWYWx1ZSh2YWx1ZSk7XG4gICAgaWYgKGN1cnJlbnRWYWx1ZSAhPT0gbm9ybWFsaXplZFZhbHVlKSB7XG4gICAgICBpbnB1dC52YWx1ZSA9IG5vcm1hbGl6ZWRWYWx1ZSE7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPcHRpb25TZWxlY3RlZER5bmFtaWNBdHRyaWJ1dGUgZXh0ZW5kcyBEZWZhdWx0RHluYW1pY1Byb3BlcnR5IHtcbiAgc2V0KGRvbTogRWxlbWVudEJ1aWxkZXIsIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IGZhbHNlKSB7XG4gICAgICBkb20uX19zZXRQcm9wZXJ0eSgnc2VsZWN0ZWQnLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUodmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBsZXQgb3B0aW9uID0gdGhpcy5hdHRyaWJ1dGUuZWxlbWVudCBhcyBIVE1MT3B0aW9uRWxlbWVudDtcblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9uLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzT3B0aW9uU2VsZWN0ZWQodGFnTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGU6IHN0cmluZykge1xuICByZXR1cm4gdGFnTmFtZSA9PT0gJ09QVElPTicgJiYgYXR0cmlidXRlID09PSAnc2VsZWN0ZWQnO1xufVxuXG5mdW5jdGlvbiBpc1VzZXJJbnB1dFZhbHVlKHRhZ05hbWU6IHN0cmluZywgYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgcmV0dXJuICh0YWdOYW1lID09PSAnSU5QVVQnIHx8IHRhZ05hbWUgPT09ICdURVhUQVJFQScpICYmIGF0dHJpYnV0ZSA9PT0gJ3ZhbHVlJztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWU6IHVua25vd24pOiBPcHRpb248c3RyaW5nPiB7XG4gIGlmIChcbiAgICB2YWx1ZSA9PT0gZmFsc2UgfHxcbiAgICB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgdmFsdWUgPT09IG51bGwgfHxcbiAgICB0eXBlb2YgKHZhbHVlIGFzIERpY3QpLnRvU3RyaW5nID09PSAndW5kZWZpbmVkJ1xuICApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgLy8gb25jbGljayBmdW5jdGlvbiBldGMgaW4gU1NSXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBTdHJpbmcodmFsdWUpO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==