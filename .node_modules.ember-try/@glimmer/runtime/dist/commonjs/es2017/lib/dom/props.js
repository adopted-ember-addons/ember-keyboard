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
    let type, normalized;
    if (slotName in element) {
        normalized = slotName;
        type = 'prop';
    } else {
        let lower = slotName.toLowerCase();
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
    return { normalized, type };
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
const ATTR_OVERRIDES = {
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
    let tag = ATTR_OVERRIDES[tagName.toUpperCase()];
    return tag && tag[propName.toLowerCase()] || false;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2RvbS9wcm9wcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQVNNLGlCLEdBQUEsaUI7UUEyQkEsc0IsR0FBQSxzQjs7Ozs7OztBQTNCQSxTQUFBLGlCQUFBLENBQUEsT0FBQSxFQUFBLFFBQUEsRUFBb0U7QUFDeEUsUUFBQSxJQUFBLEVBQUEsVUFBQTtBQUVBLFFBQUksWUFBSixPQUFBLEVBQXlCO0FBQ3ZCLHFCQUFBLFFBQUE7QUFDQSxlQUFBLE1BQUE7QUFGRixLQUFBLE1BR087QUFDTCxZQUFJLFFBQVEsU0FBWixXQUFZLEVBQVo7QUFDQSxZQUFJLFNBQUosT0FBQSxFQUFzQjtBQUNwQixtQkFBQSxNQUFBO0FBQ0EseUJBQUEsS0FBQTtBQUZGLFNBQUEsTUFHTztBQUNMLG1CQUFBLE1BQUE7QUFDQSx5QkFBQSxRQUFBO0FBQ0Q7QUFDRjtBQUVELFFBQ0UsU0FBQSxNQUFBLEtBQ0MsV0FBQSxXQUFBLE9BQUEsT0FBQSxJQUF3QyxXQUFXLFFBQVgsT0FBQSxFQUYzQyxVQUUyQyxDQUR6QyxDQURGLEVBR0U7QUFDQSxlQUFBLE1BQUE7QUFDRDtBQUVELFdBQU8sRUFBQSxVQUFBLEVBQVAsSUFBTyxFQUFQO0FBQ0Q7QUFFSyxTQUFBLHNCQUFBLENBQUEsS0FBQSxFQUErQztBQUNuRCxRQUFJLFVBQUosRUFBQSxFQUFrQjtBQUNoQixlQUFBLElBQUE7QUFDRDtBQUVELFdBQUEsS0FBQTtBQUNEO0FBRUQ7QUFDQTtBQUNBO0FBQ0EsTUFBTSxpQkFBNkI7QUFDakMsV0FBTztBQUNMLGNBREssSUFBQTtBQUVMO0FBQ0E7QUFDQTtBQUNBLHFCQUxLLElBQUE7QUFNTDtBQUNBO0FBQ0EsY0FBTTtBQVJELEtBRDBCO0FBWWpDO0FBQ0E7QUFDQSxZQUFRLEVBQUUsTUFkdUIsSUFjekIsRUFkeUI7QUFlakMsWUFBUSxFQUFFLE1BZnVCLElBZXpCLEVBZnlCO0FBZ0JqQyxjQUFVLEVBQUUsTUFoQnFCLElBZ0J2QixFQWhCdUI7QUFpQmpDLFdBQU8sRUFBRSxNQWpCd0IsSUFpQjFCLEVBakIwQjtBQWtCakMsY0FBVSxFQUFFLE1BbEJxQixJQWtCdkIsRUFsQnVCO0FBbUJqQyxZQUFRLEVBQUUsTUFuQnVCLElBbUJ6QixFQW5CeUI7QUFvQmpDLFlBQVEsRUFBRSxNQXBCdUIsSUFvQnpCLEVBcEJ5QjtBQXFCakMsWUFBUSxFQUFFLE1BQUYsSUFBQTtBQXJCeUIsQ0FBbkM7QUF3QkEsU0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBLFFBQUEsRUFBcUQ7QUFDbkQsUUFBSSxNQUFNLGVBQWUsUUFBekIsV0FBeUIsRUFBZixDQUFWO0FBQ0EsV0FBUSxPQUFPLElBQUksU0FBWixXQUFZLEVBQUosQ0FBUCxJQUFSLEtBQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpY3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFNpbXBsZUVsZW1lbnQgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuXG4vKlxuICogQG1ldGhvZCBub3JtYWxpemVQcm9wZXJ0eVxuICogQHBhcmFtIGVsZW1lbnQge0hUTUxFbGVtZW50fVxuICogQHBhcmFtIHNsb3ROYW1lIHtTdHJpbmd9XG4gKiBAcmV0dXJucyB7T2JqZWN0fSB7IG5hbWUsIHR5cGUgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydHkoZWxlbWVudDogU2ltcGxlRWxlbWVudCwgc2xvdE5hbWU6IHN0cmluZykge1xuICBsZXQgdHlwZSwgbm9ybWFsaXplZDtcblxuICBpZiAoc2xvdE5hbWUgaW4gZWxlbWVudCkge1xuICAgIG5vcm1hbGl6ZWQgPSBzbG90TmFtZTtcbiAgICB0eXBlID0gJ3Byb3AnO1xuICB9IGVsc2Uge1xuICAgIGxldCBsb3dlciA9IHNsb3ROYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKGxvd2VyIGluIGVsZW1lbnQpIHtcbiAgICAgIHR5cGUgPSAncHJvcCc7XG4gICAgICBub3JtYWxpemVkID0gbG93ZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHR5cGUgPSAnYXR0cic7XG4gICAgICBub3JtYWxpemVkID0gc2xvdE5hbWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKFxuICAgIHR5cGUgPT09ICdwcm9wJyAmJlxuICAgIChub3JtYWxpemVkLnRvTG93ZXJDYXNlKCkgPT09ICdzdHlsZScgfHwgcHJlZmVyQXR0cihlbGVtZW50LnRhZ05hbWUsIG5vcm1hbGl6ZWQpKVxuICApIHtcbiAgICB0eXBlID0gJ2F0dHInO1xuICB9XG5cbiAgcmV0dXJuIHsgbm9ybWFsaXplZCwgdHlwZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydHlWYWx1ZSh2YWx1ZTogdW5rbm93bik6IHVua25vd24ge1xuICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8vIHByb3BlcnRpZXMgdGhhdCBNVVNUIGJlIHNldCBhcyBhdHRyaWJ1dGVzLCBkdWUgdG86XG4vLyAqIGJyb3dzZXIgYnVnXG4vLyAqIHN0cmFuZ2Ugc3BlYyBvdXRsaWVyXG5jb25zdCBBVFRSX09WRVJSSURFUzogRGljdDxEaWN0PiA9IHtcbiAgSU5QVVQ6IHtcbiAgICBmb3JtOiB0cnVlLFxuICAgIC8vIENocm9tZSA0Ni4wLjI0NjQuMDogJ2F1dG9jb3JyZWN0JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpID09PSBmYWxzZVxuICAgIC8vIFNhZmFyaSA4LjAuNzogJ2F1dG9jb3JyZWN0JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpID09PSBmYWxzZVxuICAgIC8vIE1vYmlsZSBTYWZhcmkgKGlPUyA4LjQgc2ltdWxhdG9yKTogJ2F1dG9jb3JyZWN0JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpID09PSB0cnVlXG4gICAgYXV0b2NvcnJlY3Q6IHRydWUsXG4gICAgLy8gQ2hyb21lIDU0LjAuMjg0MC45ODogJ2xpc3QnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgPT09IHRydWVcbiAgICAvLyBTYWZhcmkgOS4xLjM6ICdsaXN0JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpID09PSBmYWxzZVxuICAgIGxpc3Q6IHRydWUsXG4gIH0sXG5cbiAgLy8gZWxlbWVudC5mb3JtIGlzIGFjdHVhbGx5IGEgbGVnaXRpbWF0ZSByZWFkT25seSBwcm9wZXJ0eSwgdGhhdCBpcyB0byBiZVxuICAvLyBtdXRhdGVkLCBidXQgbXVzdCBiZSBtdXRhdGVkIGJ5IHNldEF0dHJpYnV0ZS4uLlxuICBTRUxFQ1Q6IHsgZm9ybTogdHJ1ZSB9LFxuICBPUFRJT046IHsgZm9ybTogdHJ1ZSB9LFxuICBURVhUQVJFQTogeyBmb3JtOiB0cnVlIH0sXG4gIExBQkVMOiB7IGZvcm06IHRydWUgfSxcbiAgRklFTERTRVQ6IHsgZm9ybTogdHJ1ZSB9LFxuICBMRUdFTkQ6IHsgZm9ybTogdHJ1ZSB9LFxuICBPQkpFQ1Q6IHsgZm9ybTogdHJ1ZSB9LFxuICBCVVRUT046IHsgZm9ybTogdHJ1ZSB9LFxufTtcblxuZnVuY3Rpb24gcHJlZmVyQXR0cih0YWdOYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcpIHtcbiAgbGV0IHRhZyA9IEFUVFJfT1ZFUlJJREVTW3RhZ05hbWUudG9VcHBlckNhc2UoKV07XG4gIHJldHVybiAodGFnICYmIHRhZ1twcm9wTmFtZS50b0xvd2VyQ2FzZSgpXSkgfHwgZmFsc2U7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9