'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.normalizeProperty = normalizeProperty;
exports.normalizePropertyValue = normalizePropertyValue;
/*
 * @method normalizeProperty
 * @param element {HTMLElement}
 * @param slotName {String}
 * @returns {Object} { name, type }
 */
function normalizeProperty(element, slotName) {
    var type = void 0,
        normalized = void 0;
    if (slotName in element) {
        normalized = slotName;
        type = 'prop';
    } else {
        var lower = slotName.toLowerCase();
        if (lower in element) {
            type = 'prop';
            normalized = lower;
        } else {
            type = 'attr';
            normalized = slotName;
        }
    }
    if (type === 'prop' && (normalized.toLowerCase() === 'style' || preferAttr(element.tagName, normalized))) {
        type = 'attr';
    }
    return { normalized: normalized, type: type };
}
function normalizePropertyValue(value) {
    if (value === '') {
        return true;
    }
    return value;
}
// properties that MUST be set as attributes, due to:
// * browser bug
// * strange spec outlier
var ATTR_OVERRIDES = {
    INPUT: {
        form: true,
        // Chrome 46.0.2464.0: 'autocorrect' in document.createElement('input') === false
        // Safari 8.0.7: 'autocorrect' in document.createElement('input') === false
        // Mobile Safari (iOS 8.4 simulator): 'autocorrect' in document.createElement('input') === true
        autocorrect: true,
        // Chrome 54.0.2840.98: 'list' in document.createElement('input') === true
        // Safari 9.1.3: 'list' in document.createElement('input') === false
        list: true
    },
    // element.form is actually a legitimate readOnly property, that is to be
    // mutated, but must be mutated by setAttribute...
    SELECT: { form: true },
    OPTION: { form: true },
    TEXTAREA: { form: true },
    LABEL: { form: true },
    FIELDSET: { form: true },
    LEGEND: { form: true },
    OBJECT: { form: true },
    BUTTON: { form: true }
};
function preferAttr(tagName, propName) {
    var tag = ATTR_OVERRIDES[tagName.toUpperCase()];
    return tag && tag[propName.toLowerCase()] || false;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2RvbS9wcm9wcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQVNNLGlCLEdBQUEsaUI7UUEyQkEsc0IsR0FBQSxzQjs7Ozs7OztBQTNCQSxTQUFBLGlCQUFBLENBQUEsT0FBQSxFQUFBLFFBQUEsRUFBb0U7QUFDeEUsUUFBQSxPQUFBLEtBQUEsQ0FBQTtBQUFBLFFBQUEsYUFBQSxLQUFBLENBQUE7QUFFQSxRQUFJLFlBQUosT0FBQSxFQUF5QjtBQUN2QixxQkFBQSxRQUFBO0FBQ0EsZUFBQSxNQUFBO0FBRkYsS0FBQSxNQUdPO0FBQ0wsWUFBSSxRQUFRLFNBQVosV0FBWSxFQUFaO0FBQ0EsWUFBSSxTQUFKLE9BQUEsRUFBc0I7QUFDcEIsbUJBQUEsTUFBQTtBQUNBLHlCQUFBLEtBQUE7QUFGRixTQUFBLE1BR087QUFDTCxtQkFBQSxNQUFBO0FBQ0EseUJBQUEsUUFBQTtBQUNEO0FBQ0Y7QUFFRCxRQUNFLFNBQUEsTUFBQSxLQUNDLFdBQUEsV0FBQSxPQUFBLE9BQUEsSUFBd0MsV0FBVyxRQUFYLE9BQUEsRUFGM0MsVUFFMkMsQ0FEekMsQ0FERixFQUdFO0FBQ0EsZUFBQSxNQUFBO0FBQ0Q7QUFFRCxXQUFPLEVBQUEsWUFBQSxVQUFBLEVBQVAsTUFBQSxJQUFPLEVBQVA7QUFDRDtBQUVLLFNBQUEsc0JBQUEsQ0FBQSxLQUFBLEVBQStDO0FBQ25ELFFBQUksVUFBSixFQUFBLEVBQWtCO0FBQ2hCLGVBQUEsSUFBQTtBQUNEO0FBRUQsV0FBQSxLQUFBO0FBQ0Q7QUFFRDtBQUNBO0FBQ0E7QUFDQSxJQUFNLGlCQUE2QjtBQUNqQyxXQUFPO0FBQ0wsY0FESyxJQUFBO0FBRUw7QUFDQTtBQUNBO0FBQ0EscUJBTEssSUFBQTtBQU1MO0FBQ0E7QUFDQSxjQUFNO0FBUkQsS0FEMEI7QUFZakM7QUFDQTtBQUNBLFlBQVEsRUFBRSxNQWR1QixJQWN6QixFQWR5QjtBQWVqQyxZQUFRLEVBQUUsTUFmdUIsSUFlekIsRUFmeUI7QUFnQmpDLGNBQVUsRUFBRSxNQWhCcUIsSUFnQnZCLEVBaEJ1QjtBQWlCakMsV0FBTyxFQUFFLE1BakJ3QixJQWlCMUIsRUFqQjBCO0FBa0JqQyxjQUFVLEVBQUUsTUFsQnFCLElBa0J2QixFQWxCdUI7QUFtQmpDLFlBQVEsRUFBRSxNQW5CdUIsSUFtQnpCLEVBbkJ5QjtBQW9CakMsWUFBUSxFQUFFLE1BcEJ1QixJQW9CekIsRUFwQnlCO0FBcUJqQyxZQUFRLEVBQUUsTUFBRixJQUFBO0FBckJ5QixDQUFuQztBQXdCQSxTQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQUEsUUFBQSxFQUFxRDtBQUNuRCxRQUFJLE1BQU0sZUFBZSxRQUF6QixXQUF5QixFQUFmLENBQVY7QUFDQSxXQUFRLE9BQU8sSUFBSSxTQUFaLFdBQVksRUFBSixDQUFQLElBQVIsS0FBQTtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGljdCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgU2ltcGxlRWxlbWVudCB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5cbi8qXG4gKiBAbWV0aG9kIG5vcm1hbGl6ZVByb3BlcnR5XG4gKiBAcGFyYW0gZWxlbWVudCB7SFRNTEVsZW1lbnR9XG4gKiBAcGFyYW0gc2xvdE5hbWUge1N0cmluZ31cbiAqIEByZXR1cm5zIHtPYmplY3R9IHsgbmFtZSwgdHlwZSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0eShlbGVtZW50OiBTaW1wbGVFbGVtZW50LCBzbG90TmFtZTogc3RyaW5nKSB7XG4gIGxldCB0eXBlLCBub3JtYWxpemVkO1xuXG4gIGlmIChzbG90TmFtZSBpbiBlbGVtZW50KSB7XG4gICAgbm9ybWFsaXplZCA9IHNsb3ROYW1lO1xuICAgIHR5cGUgPSAncHJvcCc7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGxvd2VyID0gc2xvdE5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobG93ZXIgaW4gZWxlbWVudCkge1xuICAgICAgdHlwZSA9ICdwcm9wJztcbiAgICAgIG5vcm1hbGl6ZWQgPSBsb3dlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdHlwZSA9ICdhdHRyJztcbiAgICAgIG5vcm1hbGl6ZWQgPSBzbG90TmFtZTtcbiAgICB9XG4gIH1cblxuICBpZiAoXG4gICAgdHlwZSA9PT0gJ3Byb3AnICYmXG4gICAgKG5vcm1hbGl6ZWQudG9Mb3dlckNhc2UoKSA9PT0gJ3N0eWxlJyB8fCBwcmVmZXJBdHRyKGVsZW1lbnQudGFnTmFtZSwgbm9ybWFsaXplZCkpXG4gICkge1xuICAgIHR5cGUgPSAnYXR0cic7XG4gIH1cblxuICByZXR1cm4geyBub3JtYWxpemVkLCB0eXBlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0eVZhbHVlKHZhbHVlOiB1bmtub3duKTogdW5rbm93biB7XG4gIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLy8gcHJvcGVydGllcyB0aGF0IE1VU1QgYmUgc2V0IGFzIGF0dHJpYnV0ZXMsIGR1ZSB0bzpcbi8vICogYnJvd3NlciBidWdcbi8vICogc3RyYW5nZSBzcGVjIG91dGxpZXJcbmNvbnN0IEFUVFJfT1ZFUlJJREVTOiBEaWN0PERpY3Q+ID0ge1xuICBJTlBVVDoge1xuICAgIGZvcm06IHRydWUsXG4gICAgLy8gQ2hyb21lIDQ2LjAuMjQ2NC4wOiAnYXV0b2NvcnJlY3QnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgPT09IGZhbHNlXG4gICAgLy8gU2FmYXJpIDguMC43OiAnYXV0b2NvcnJlY3QnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgPT09IGZhbHNlXG4gICAgLy8gTW9iaWxlIFNhZmFyaSAoaU9TIDguNCBzaW11bGF0b3IpOiAnYXV0b2NvcnJlY3QnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgPT09IHRydWVcbiAgICBhdXRvY29ycmVjdDogdHJ1ZSxcbiAgICAvLyBDaHJvbWUgNTQuMC4yODQwLjk4OiAnbGlzdCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKSA9PT0gdHJ1ZVxuICAgIC8vIFNhZmFyaSA5LjEuMzogJ2xpc3QnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgPT09IGZhbHNlXG4gICAgbGlzdDogdHJ1ZSxcbiAgfSxcblxuICAvLyBlbGVtZW50LmZvcm0gaXMgYWN0dWFsbHkgYSBsZWdpdGltYXRlIHJlYWRPbmx5IHByb3BlcnR5LCB0aGF0IGlzIHRvIGJlXG4gIC8vIG11dGF0ZWQsIGJ1dCBtdXN0IGJlIG11dGF0ZWQgYnkgc2V0QXR0cmlidXRlLi4uXG4gIFNFTEVDVDogeyBmb3JtOiB0cnVlIH0sXG4gIE9QVElPTjogeyBmb3JtOiB0cnVlIH0sXG4gIFRFWFRBUkVBOiB7IGZvcm06IHRydWUgfSxcbiAgTEFCRUw6IHsgZm9ybTogdHJ1ZSB9LFxuICBGSUVMRFNFVDogeyBmb3JtOiB0cnVlIH0sXG4gIExFR0VORDogeyBmb3JtOiB0cnVlIH0sXG4gIE9CSkVDVDogeyBmb3JtOiB0cnVlIH0sXG4gIEJVVFRPTjogeyBmb3JtOiB0cnVlIH0sXG59O1xuXG5mdW5jdGlvbiBwcmVmZXJBdHRyKHRhZ05hbWU6IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZykge1xuICBsZXQgdGFnID0gQVRUUl9PVkVSUklERVNbdGFnTmFtZS50b1VwcGVyQ2FzZSgpXTtcbiAgcmV0dXJuICh0YWcgJiYgdGFnW3Byb3BOYW1lLnRvTG93ZXJDYXNlKCldKSB8fCBmYWxzZTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=