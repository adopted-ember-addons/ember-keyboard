'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OptionSelectedDynamicAttribute = exports.InputValueDynamicAttribute = exports.SafeDynamicAttribute = exports.SafeDynamicProperty = exports.DefaultDynamicProperty = exports.SimpleDynamicAttribute = exports.DynamicAttribute = undefined;
exports.dynamicAttribute = dynamicAttribute;

var _normalize = require('../../dom/normalize');

var _props = require('../../dom/props');

var _sanitizedValues = require('../../dom/sanitized-values');

function dynamicAttribute(element, attr, namespace) {
    let { tagName, namespaceURI } = element;
    let attribute = { element, name: attr, namespace };
    if (namespaceURI === "http://www.w3.org/2000/svg" /* SVG */) {
            return buildDynamicAttribute(tagName, attr, attribute);
        }
    let { type, normalized } = (0, _props.normalizeProperty)(element, attr);
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
class DynamicAttribute {
    constructor(attribute) {
        this.attribute = attribute;
    }
}
exports.DynamicAttribute = DynamicAttribute;
class SimpleDynamicAttribute extends DynamicAttribute {
    set(dom, value, _env) {
        let normalizedValue = normalizeValue(value);
        if (normalizedValue !== null) {
            let { name, namespace } = this.attribute;
            dom.__setAttribute(name, normalizedValue, namespace);
        }
    }
    update(value, _env) {
        let normalizedValue = normalizeValue(value);
        let { element, name } = this.attribute;
        if (normalizedValue === null) {
            element.removeAttribute(name);
        } else {
            element.setAttribute(name, normalizedValue);
        }
    }
}
exports.SimpleDynamicAttribute = SimpleDynamicAttribute;
class DefaultDynamicProperty extends DynamicAttribute {
    constructor(normalizedName, attribute) {
        super(attribute);
        this.normalizedName = normalizedName;
    }
    set(dom, value, _env) {
        if (value !== null && value !== undefined) {
            this.value = value;
            dom.__setProperty(this.normalizedName, value);
        }
    }
    update(value, _env) {
        let { element } = this.attribute;
        if (this.value !== value) {
            element[this.normalizedName] = this.value = value;
            if (value === null || value === undefined) {
                this.removeAttribute();
            }
        }
    }
    removeAttribute() {
        // TODO this sucks but to preserve properties first and to meet current
        // semantics we must do this.
        let { element, namespace } = this.attribute;
        if (namespace) {
            element.removeAttributeNS(namespace, this.normalizedName);
        } else {
            element.removeAttribute(this.normalizedName);
        }
    }
}
exports.DefaultDynamicProperty = DefaultDynamicProperty;
class SafeDynamicProperty extends DefaultDynamicProperty {
    set(dom, value, env) {
        let { element, name } = this.attribute;
        let sanitized = (0, _sanitizedValues.sanitizeAttributeValue)(env, element, name, value);
        super.set(dom, sanitized, env);
    }
    update(value, env) {
        let { element, name } = this.attribute;
        let sanitized = (0, _sanitizedValues.sanitizeAttributeValue)(env, element, name, value);
        super.update(sanitized, env);
    }
}
exports.SafeDynamicProperty = SafeDynamicProperty;
class SafeDynamicAttribute extends SimpleDynamicAttribute {
    set(dom, value, env) {
        let { element, name } = this.attribute;
        let sanitized = (0, _sanitizedValues.sanitizeAttributeValue)(env, element, name, value);
        super.set(dom, sanitized, env);
    }
    update(value, env) {
        let { element, name } = this.attribute;
        let sanitized = (0, _sanitizedValues.sanitizeAttributeValue)(env, element, name, value);
        super.update(sanitized, env);
    }
}
exports.SafeDynamicAttribute = SafeDynamicAttribute;
class InputValueDynamicAttribute extends DefaultDynamicProperty {
    set(dom, value) {
        dom.__setProperty('value', (0, _normalize.normalizeStringValue)(value));
    }
    update(value) {
        let input = this.attribute.element;
        let currentValue = input.value;
        let normalizedValue = (0, _normalize.normalizeStringValue)(value);
        if (currentValue !== normalizedValue) {
            input.value = normalizedValue;
        }
    }
}
exports.InputValueDynamicAttribute = InputValueDynamicAttribute;
class OptionSelectedDynamicAttribute extends DefaultDynamicProperty {
    set(dom, value) {
        if (value !== null && value !== undefined && value !== false) {
            dom.__setProperty('selected', true);
        }
    }
    update(value) {
        let option = this.attribute.element;
        if (value) {
            option.selected = true;
        } else {
            option.selected = false;
        }
    }
}
exports.OptionSelectedDynamicAttribute = OptionSelectedDynamicAttribute;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2F0dHJpYnV0ZXMvZHluYW1pYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7UUFPTSxnQixHQUFBLGdCOzs7O0FBSk47O0FBQ0E7O0FBR00sU0FBQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUc0QjtBQUVoQyxRQUFJLEVBQUEsT0FBQSxFQUFBLFlBQUEsS0FBSixPQUFBO0FBQ0EsUUFBSSxZQUFZLEVBQUEsT0FBQSxFQUFXLE1BQVgsSUFBQSxFQUFoQixTQUFnQixFQUFoQjtBQUVBLFFBQUksaUJBQUosNEJBQUEsQ0FBQSxTQUFBLEVBQW9DO0FBQ2xDLG1CQUFPLHNCQUFBLE9BQUEsRUFBQSxJQUFBLEVBQVAsU0FBTyxDQUFQO0FBQ0Q7QUFFRCxRQUFJLEVBQUEsSUFBQSxFQUFBLFVBQUEsS0FBdUIsOEJBQUEsT0FBQSxFQUEzQixJQUEyQixDQUEzQjtBQUVBLFFBQUksU0FBSixNQUFBLEVBQXFCO0FBQ25CLGVBQU8sc0JBQUEsT0FBQSxFQUFBLFVBQUEsRUFBUCxTQUFPLENBQVA7QUFERixLQUFBLE1BRU87QUFDTCxlQUFPLHFCQUFBLE9BQUEsRUFBQSxVQUFBLEVBQVAsU0FBTyxDQUFQO0FBQ0Q7QUFDRjtBQUVELFNBQUEscUJBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFHc0I7QUFFcEIsUUFBSSwyQ0FBQSxPQUFBLEVBQUosSUFBSSxDQUFKLEVBQXlDO0FBQ3ZDLGVBQU8sSUFBQSxvQkFBQSxDQUFQLFNBQU8sQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLGVBQU8sSUFBQSxzQkFBQSxDQUFQLFNBQU8sQ0FBUDtBQUNEO0FBQ0Y7QUFFRCxTQUFBLG9CQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBR3NCO0FBRXBCLFFBQUksMkNBQUEsT0FBQSxFQUFKLElBQUksQ0FBSixFQUF5QztB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QUFBLElBQUE7QUFDRDtBQUVELFdBQU8sT0FBUCxLQUFPLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpY3QsIEVudmlyb25tZW50LCBPcHRpb24sIEVsZW1lbnRCdWlsZGVyIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBBdHRyTmFtZXNwYWNlLCBOYW1lc3BhY2UsIFNpbXBsZUVsZW1lbnQgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgbm9ybWFsaXplU3RyaW5nVmFsdWUgfSBmcm9tICcuLi8uLi9kb20vbm9ybWFsaXplJztcbmltcG9ydCB7IG5vcm1hbGl6ZVByb3BlcnR5IH0gZnJvbSAnLi4vLi4vZG9tL3Byb3BzJztcbmltcG9ydCB7IHJlcXVpcmVzU2FuaXRpemF0aW9uLCBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlIH0gZnJvbSAnLi4vLi4vZG9tL3Nhbml0aXplZC12YWx1ZXMnO1xuaW1wb3J0IHsgQXR0cmlidXRlLCBBdHRyaWJ1dGVPcGVyYXRpb24gfSBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGZ1bmN0aW9uIGR5bmFtaWNBdHRyaWJ1dGUoXG4gIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gIGF0dHI6IHN0cmluZyxcbiAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT5cbik6IER5bmFtaWNBdHRyaWJ1dGUge1xuICBsZXQgeyB0YWdOYW1lLCBuYW1lc3BhY2VVUkkgfSA9IGVsZW1lbnQ7XG4gIGxldCBhdHRyaWJ1dGUgPSB7IGVsZW1lbnQsIG5hbWU6IGF0dHIsIG5hbWVzcGFjZSB9O1xuXG4gIGlmIChuYW1lc3BhY2VVUkkgPT09IE5hbWVzcGFjZS5TVkcpIHtcbiAgICByZXR1cm4gYnVpbGREeW5hbWljQXR0cmlidXRlKHRhZ05hbWUsIGF0dHIsIGF0dHJpYnV0ZSk7XG4gIH1cblxuICBsZXQgeyB0eXBlLCBub3JtYWxpemVkIH0gPSBub3JtYWxpemVQcm9wZXJ0eShlbGVtZW50LCBhdHRyKTtcblxuICBpZiAodHlwZSA9PT0gJ2F0dHInKSB7XG4gICAgcmV0dXJuIGJ1aWxkRHluYW1pY0F0dHJpYnV0ZSh0YWdOYW1lLCBub3JtYWxpemVkLCBhdHRyaWJ1dGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBidWlsZER5bmFtaWNQcm9wZXJ0eSh0YWdOYW1lLCBub3JtYWxpemVkLCBhdHRyaWJ1dGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkRHluYW1pY0F0dHJpYnV0ZShcbiAgdGFnTmFtZTogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIGF0dHJpYnV0ZTogQXR0cmlidXRlXG4pOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgaWYgKHJlcXVpcmVzU2FuaXRpemF0aW9uKHRhZ05hbWUsIG5hbWUpKSB7XG4gICAgcmV0dXJuIG5ldyBTYWZlRHluYW1pY0F0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgU2ltcGxlRHluYW1pY0F0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkRHluYW1pY1Byb3BlcnR5KFxuICB0YWdOYW1lOiBzdHJpbmcsXG4gIG5hbWU6IHN0cmluZyxcbiAgYXR0cmlidXRlOiBBdHRyaWJ1dGVcbik6IER5bmFtaWNBdHRyaWJ1dGUge1xuICBpZiAocmVxdWlyZXNTYW5pdGl6YXRpb24odGFnTmFtZSwgbmFtZSkpIHtcbiAgICByZXR1cm4gbmV3IFNhZmVEeW5hbWljUHJvcGVydHkobmFtZSwgYXR0cmlidXRlKTtcbiAgfVxuXG4gIGlmIChpc1VzZXJJbnB1dFZhbHVlKHRhZ05hbWUsIG5hbWUpKSB7XG4gICAgcmV0dXJuIG5ldyBJbnB1dFZhbHVlRHluYW1pY0F0dHJpYnV0ZShuYW1lLCBhdHRyaWJ1dGUpO1xuICB9XG5cbiAgaWYgKGlzT3B0aW9uU2VsZWN0ZWQodGFnTmFtZSwgbmFtZSkpIHtcbiAgICByZXR1cm4gbmV3IE9wdGlvblNlbGVjdGVkRHluYW1pY0F0dHJpYnV0ZShuYW1lLCBhdHRyaWJ1dGUpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBEZWZhdWx0RHluYW1pY1Byb3BlcnR5KG5hbWUsIGF0dHJpYnV0ZSk7XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEeW5hbWljQXR0cmlidXRlIGltcGxlbWVudHMgQXR0cmlidXRlT3BlcmF0aW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIGF0dHJpYnV0ZTogQXR0cmlidXRlKSB7fVxuXG4gIGFic3RyYWN0IHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQ7XG4gIGFic3RyYWN0IHVwZGF0ZSh2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBTaW1wbGVEeW5hbWljQXR0cmlidXRlIGV4dGVuZHMgRHluYW1pY0F0dHJpYnV0ZSB7XG4gIHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93biwgX2VudjogRW52aXJvbm1lbnQpOiB2b2lkIHtcbiAgICBsZXQgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpO1xuXG4gICAgaWYgKG5vcm1hbGl6ZWRWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgbGV0IHsgbmFtZSwgbmFtZXNwYWNlIH0gPSB0aGlzLmF0dHJpYnV0ZTtcbiAgICAgIGRvbS5fX3NldEF0dHJpYnV0ZShuYW1lLCBub3JtYWxpemVkVmFsdWUsIG5hbWVzcGFjZSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKHZhbHVlOiB1bmtub3duLCBfZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCBub3JtYWxpemVkVmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSk7XG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG5cbiAgICBpZiAobm9ybWFsaXplZFZhbHVlID09PSBudWxsKSB7XG4gICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUobmFtZSwgbm9ybWFsaXplZFZhbHVlKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHREeW5hbWljUHJvcGVydHkgZXh0ZW5kcyBEeW5hbWljQXR0cmlidXRlIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBub3JtYWxpemVkTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGU6IEF0dHJpYnV0ZSkge1xuICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gIH1cblxuICB2YWx1ZTogdW5rbm93bjtcbiAgc2V0KGRvbTogRWxlbWVudEJ1aWxkZXIsIHZhbHVlOiB1bmtub3duLCBfZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICBkb20uX19zZXRQcm9wZXJ0eSh0aGlzLm5vcm1hbGl6ZWROYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKHZhbHVlOiB1bmtub3duLCBfZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCB7IGVsZW1lbnQgfSA9IHRoaXMuYXR0cmlidXRlO1xuXG4gICAgaWYgKHRoaXMudmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAoZWxlbWVudCBhcyBEaWN0KVt0aGlzLm5vcm1hbGl6ZWROYW1lXSA9IHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVtb3ZlQXR0cmlidXRlKCkge1xuICAgIC8vIFRPRE8gdGhpcyBzdWNrcyBidXQgdG8gcHJlc2VydmUgcHJvcGVydGllcyBmaXJzdCBhbmQgdG8gbWVldCBjdXJyZW50XG4gICAgLy8gc2VtYW50aWNzIHdlIG11c3QgZG8gdGhpcy5cbiAgICBsZXQgeyBlbGVtZW50LCBuYW1lc3BhY2UgfSA9IHRoaXMuYXR0cmlidXRlO1xuXG4gICAgaWYgKG5hbWVzcGFjZSkge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGVOUyhuYW1lc3BhY2UsIHRoaXMubm9ybWFsaXplZE5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSh0aGlzLm5vcm1hbGl6ZWROYW1lKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhZmVEeW5hbWljUHJvcGVydHkgZXh0ZW5kcyBEZWZhdWx0RHluYW1pY1Byb3BlcnR5IHtcbiAgc2V0KGRvbTogRWxlbWVudEJ1aWxkZXIsIHZhbHVlOiB1bmtub3duLCBlbnY6IEVudmlyb25tZW50KTogdm9pZCB7XG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG4gICAgbGV0IHNhbml0aXplZCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZW52LCBlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgc3VwZXIuc2V0KGRvbSwgc2FuaXRpemVkLCBlbnYpO1xuICB9XG5cbiAgdXBkYXRlKHZhbHVlOiB1bmtub3duLCBlbnY6IEVudmlyb25tZW50KTogdm9pZCB7XG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG4gICAgbGV0IHNhbml0aXplZCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZW52LCBlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgc3VwZXIudXBkYXRlKHNhbml0aXplZCwgZW52KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2FmZUR5bmFtaWNBdHRyaWJ1dGUgZXh0ZW5kcyBTaW1wbGVEeW5hbWljQXR0cmlidXRlIHtcbiAgc2V0KGRvbTogRWxlbWVudEJ1aWxkZXIsIHZhbHVlOiB1bmtub3duLCBlbnY6IEVudmlyb25tZW50KTogdm9pZCB7XG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG4gICAgbGV0IHNhbml0aXplZCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZW52LCBlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgc3VwZXIuc2V0KGRvbSwgc2FuaXRpemVkLCBlbnYpO1xuICB9XG5cbiAgdXBkYXRlKHZhbHVlOiB1bmtub3duLCBlbnY6IEVudmlyb25tZW50KTogdm9pZCB7XG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG4gICAgbGV0IHNhbml0aXplZCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZW52LCBlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgc3VwZXIudXBkYXRlKHNhbml0aXplZCwgZW52KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW5wdXRWYWx1ZUR5bmFtaWNBdHRyaWJ1dGUgZXh0ZW5kcyBEZWZhdWx0RHluYW1pY1Byb3BlcnR5IHtcbiAgc2V0KGRvbTogRWxlbWVudEJ1aWxkZXIsIHZhbHVlOiB1bmtub3duKSB7XG4gICAgZG9tLl9fc2V0UHJvcGVydHkoJ3ZhbHVlJywgbm9ybWFsaXplU3RyaW5nVmFsdWUodmFsdWUpKTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93bikge1xuICAgIGxldCBpbnB1dCA9IHRoaXMuYXR0cmlidXRlLmVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBsZXQgY3VycmVudFZhbHVlID0gaW5wdXQudmFsdWU7XG4gICAgbGV0IG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZVN0cmluZ1ZhbHVlKHZhbHVlKTtcbiAgICBpZiAoY3VycmVudFZhbHVlICE9PSBub3JtYWxpemVkVmFsdWUpIHtcbiAgICAgIGlucHV0LnZhbHVlID0gbm9ybWFsaXplZFZhbHVlITtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9wdGlvblNlbGVjdGVkRHluYW1pY0F0dHJpYnV0ZSBleHRlbmRzIERlZmF1bHREeW5hbWljUHJvcGVydHkge1xuICBzZXQoZG9tOiBFbGVtZW50QnVpbGRlciwgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gZmFsc2UpIHtcbiAgICAgIGRvbS5fX3NldFByb3BlcnR5KCdzZWxlY3RlZCcsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGxldCBvcHRpb24gPSB0aGlzLmF0dHJpYnV0ZS5lbGVtZW50IGFzIEhUTUxPcHRpb25FbGVtZW50O1xuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNPcHRpb25TZWxlY3RlZCh0YWdOYW1lOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gIHJldHVybiB0YWdOYW1lID09PSAnT1BUSU9OJyAmJiBhdHRyaWJ1dGUgPT09ICdzZWxlY3RlZCc7XG59XG5cbmZ1bmN0aW9uIGlzVXNlcklucHV0VmFsdWUodGFnTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGU6IHN0cmluZykge1xuICByZXR1cm4gKHRhZ05hbWUgPT09ICdJTlBVVCcgfHwgdGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykgJiYgYXR0cmlidXRlID09PSAndmFsdWUnO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZTogdW5rbm93bik6IE9wdGlvbjxzdHJpbmc+IHtcbiAgaWYgKFxuICAgIHZhbHVlID09PSBmYWxzZSB8fFxuICAgIHZhbHVlID09PSB1bmRlZmluZWQgfHxcbiAgICB2YWx1ZSA9PT0gbnVsbCB8fFxuICAgIHR5cGVvZiAodmFsdWUgYXMgRGljdCkudG9TdHJpbmcgPT09ICd1bmRlZmluZWQnXG4gICkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICAvLyBvbmNsaWNrIGZ1bmN0aW9uIGV0YyBpbiBTU1JcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9