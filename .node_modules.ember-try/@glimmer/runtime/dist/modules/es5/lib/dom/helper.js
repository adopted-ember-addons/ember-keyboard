function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { applySVGInnerHTMLFix } from '../compat/svg-inner-html-fix';
import { applyTextNodeMergingFix } from '../compat/text-node-merging-fix';
import { DOMOperations, BLACKLIST_TABLE } from './operations';
['b', 'big', 'blockquote', 'body', 'br', 'center', 'code', 'dd', 'div', 'dl', 'dt', 'em', 'embed', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'i', 'img', 'li', 'listing', 'main', 'meta', 'nobr', 'ol', 'p', 'pre', 'ruby', 's', 'small', 'span', 'strong', 'strike', 'sub', 'sup', 'table', 'tt', 'u', 'ul', 'var'].forEach(function (tag) {
    return BLACKLIST_TABLE[tag] = 1;
});
var WHITESPACE = /[\t-\r \xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/;
var doc = typeof document === 'undefined' ? null : document;
export function isWhitespace(string) {
    return WHITESPACE.test(string);
}
export var DOM;
(function (DOM) {
    var TreeConstruction = function (_DOMOperations) {
        _inherits(TreeConstruction, _DOMOperations);

        function TreeConstruction() {
            _classCallCheck(this, TreeConstruction);

            return _possibleConstructorReturn(this, _DOMOperations.apply(this, arguments));
        }

        TreeConstruction.prototype.createElementNS = function createElementNS(namespace, tag) {
            return this.document.createElementNS(namespace, tag);
        };

        TreeConstruction.prototype.setAttribute = function setAttribute(element, name, value) {
            var namespace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

            if (namespace) {
                element.setAttributeNS(namespace, name, value);
            } else {
                element.setAttribute(name, value);
            }
        };

        return TreeConstruction;
    }(DOMOperations);

    DOM.TreeConstruction = TreeConstruction;
    var appliedTreeContruction = TreeConstruction;
    appliedTreeContruction = applyTextNodeMergingFix(doc, appliedTreeContruction);
    appliedTreeContruction = applySVGInnerHTMLFix(doc, appliedTreeContruction, "http://www.w3.org/2000/svg" /* SVG */);
    DOM.DOMTreeConstruction = appliedTreeContruction;
})(DOM || (DOM = {}));
export var DOMChangesImpl = function (_DOMOperations2) {
    _inherits(DOMChangesImpl, _DOMOperations2);

    function DOMChangesImpl(document) {
        _classCallCheck(this, DOMChangesImpl);

        var _this2 = _possibleConstructorReturn(this, _DOMOperations2.call(this, document));

        _this2.document = document;
        _this2.namespace = null;
        return _this2;
    }

    DOMChangesImpl.prototype.setAttribute = function setAttribute(element, name, value) {
        element.setAttribute(name, value);
    };

    DOMChangesImpl.prototype.removeAttribute = function removeAttribute(element, name) {
        element.removeAttribute(name);
    };

    DOMChangesImpl.prototype.insertAfter = function insertAfter(element, node, reference) {
        this.insertBefore(element, node, reference.nextSibling);
    };

    return DOMChangesImpl;
}(DOMOperations);
var helper = DOMChangesImpl;
helper = applyTextNodeMergingFix(doc, helper);
helper = applySVGInnerHTMLFix(doc, helper, "http://www.w3.org/2000/svg" /* SVG */);
export default helper;
export var DOMTreeConstruction = DOM.DOMTreeConstruction;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2RvbS9oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFVQSxTQUFBLG9CQUFBLFFBQUEsOEJBQUE7QUFDQSxTQUFBLHVCQUFBLFFBQUEsaUNBQUE7QUFDQSxTQUFBLGFBQUEsRUFBQSxlQUFBLFFBQUEsY0FBQTtBQUVBLENBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLENBNkNVO0FBQUEsV0FBUSxnQkFBQSxHQUFBLElBN0NsQixDQTZDVTtBQUFBLENBN0NWO0FBK0NBLElBQU0sYUFBTiwyRUFBQTtBQUVBLElBQUksTUFDRixPQUFBLFFBQUEsS0FBQSxXQUFBLEdBQUEsSUFBQSxHQURGLFFBQUE7QUFHQSxPQUFNLFNBQUEsWUFBQSxDQUFBLE1BQUEsRUFBcUM7QUFDekMsV0FBTyxXQUFBLElBQUEsQ0FBUCxNQUFPLENBQVA7QUFDRDtBQUVELE9BQU0sSUFBQSxHQUFBO0FBQU4sQ0FBQSxVQUFBLEdBQUEsRUFBb0I7QUFBQSxRQUNsQixnQkFEa0I7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUEsbUNBRWhCLGVBRmdCLDRCQUVoQixTQUZnQixFQUVoQixHQUZnQixFQUV3QztBQUN0RCxtQkFBTyxLQUFBLFFBQUEsQ0FBQSxlQUFBLENBQUEsU0FBQSxFQUFQLEdBQU8sQ0FBUDtBQUNELFNBSmU7O0FBQUEsbUNBTWhCLFlBTmdCLHlCQU1oQixPQU5nQixFQU1oQixJQU5nQixFQU1oQixLQU5nQixFQVV5QjtBQUFBLGdCQUF2QyxTQUF1Qyx1RUFKekMsSUFJeUM7O0FBRXZDLGdCQUFBLFNBQUEsRUFBZTtBQUNiLHdCQUFBLGNBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUE7QUFERixhQUFBLE1BRU87QUFDTCx3QkFBQSxZQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDRDtBQUNGLFNBakJlOztBQUFBO0FBQUEsTUFDbEIsYUFEa0I7O0FBQ0wsUUFBQSxnQkFBQSxHQUFBLGdCQUFBO0FBbUJiLFFBQUkseUJBQUosZ0JBQUE7QUFDQSw2QkFBeUIsd0JBQUEsR0FBQSxFQUF6QixzQkFBeUIsQ0FBekI7QUFJQSw2QkFBeUIscUJBQUEsR0FBQSxFQUFBLHNCQUFBLEVBQUEsNEJBQUEsQ0FBekIsU0FBeUIsQ0FBekI7QUFNYSxRQUFBLG1CQUFBLEdBQUEsc0JBQUE7QUEvQmYsQ0FBQSxFQUFpQixRQUFBLE1BQWpCLEVBQWlCLENBQWpCO0FBbUNBLFdBQU0sY0FBTjtBQUFBOztBQUdFLDRCQUFBLFFBQUEsRUFBOEM7QUFBQTs7QUFBQSxzREFDNUMsMkJBQUEsUUFBQSxDQUQ0Qzs7QUFBeEIsZUFBQSxRQUFBLEdBQUEsUUFBQTtBQUVwQixlQUFBLFNBQUEsR0FBQSxJQUFBO0FBRjRDO0FBRzdDOztBQU5ILDZCQVFFLFlBUkYseUJBUUUsT0FSRixFQVFFLElBUkYsRUFRRSxLQVJGLEVBUWtFO0FBQzlELGdCQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQTtBQUNELEtBVkg7O0FBQUEsNkJBWUUsZUFaRiw0QkFZRSxPQVpGLEVBWUUsSUFaRixFQVlzRDtBQUNsRCxnQkFBQSxlQUFBLENBQUEsSUFBQTtBQUNELEtBZEg7O0FBQUEsNkJBZ0JFLFdBaEJGLHdCQWdCRSxPQWhCRixFQWdCRSxJQWhCRixFQWdCRSxTQWhCRixFQWdCNkU7QUFDekUsYUFBQSxZQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFBaUMsVUFBakMsV0FBQTtBQUNELEtBbEJIOztBQUFBO0FBQUEsRUFBTSxhQUFOO0FBcUJBLElBQUksU0FBSixjQUFBO0FBRUEsU0FBUyx3QkFBQSxHQUFBLEVBQVQsTUFBUyxDQUFUO0FBQ0EsU0FBUyxxQkFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLDRCQUFBLENBQVQsU0FBUyxDQUFUO0FBRUEsZUFBQSxNQUFBO0FBQ0EsT0FBTyxJQUFNLHNCQUFzQixJQUE1QixtQkFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEdsaW1tZXJUcmVlQ2hhbmdlcywgR2xpbW1lclRyZWVDb25zdHJ1Y3Rpb24gfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHtcbiAgQXR0ck5hbWVzcGFjZSxcbiAgRWxlbWVudE5hbWVzcGFjZSxcbiAgTmFtZXNwYWNlLFxuICBTaW1wbGVEb2N1bWVudCxcbiAgU2ltcGxlRWxlbWVudCxcbiAgU2ltcGxlTm9kZSxcbn0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IGFwcGx5U1ZHSW5uZXJIVE1MRml4IH0gZnJvbSAnLi4vY29tcGF0L3N2Zy1pbm5lci1odG1sLWZpeCc7XG5pbXBvcnQgeyBhcHBseVRleHROb2RlTWVyZ2luZ0ZpeCB9IGZyb20gJy4uL2NvbXBhdC90ZXh0LW5vZGUtbWVyZ2luZy1maXgnO1xuaW1wb3J0IHsgRE9NT3BlcmF0aW9ucywgQkxBQ0tMSVNUX1RBQkxFIH0gZnJvbSAnLi9vcGVyYXRpb25zJztcblxuW1xuICAnYicsXG4gICdiaWcnLFxuICAnYmxvY2txdW90ZScsXG4gICdib2R5JyxcbiAgJ2JyJyxcbiAgJ2NlbnRlcicsXG4gICdjb2RlJyxcbiAgJ2RkJyxcbiAgJ2RpdicsXG4gICdkbCcsXG4gICdkdCcsXG4gICdlbScsXG4gICdlbWJlZCcsXG4gICdoMScsXG4gICdoMicsXG4gICdoMycsXG4gICdoNCcsXG4gICdoNScsXG4gICdoNicsXG4gICdoZWFkJyxcbiAgJ2hyJyxcbiAgJ2knLFxuICAnaW1nJyxcbiAgJ2xpJyxcbiAgJ2xpc3RpbmcnLFxuICAnbWFpbicsXG4gICdtZXRhJyxcbiAgJ25vYnInLFxuICAnb2wnLFxuICAncCcsXG4gICdwcmUnLFxuICAncnVieScsXG4gICdzJyxcbiAgJ3NtYWxsJyxcbiAgJ3NwYW4nLFxuICAnc3Ryb25nJyxcbiAgJ3N0cmlrZScsXG4gICdzdWInLFxuICAnc3VwJyxcbiAgJ3RhYmxlJyxcbiAgJ3R0JyxcbiAgJ3UnLFxuICAndWwnLFxuICAndmFyJyxcbl0uZm9yRWFjaCh0YWcgPT4gKEJMQUNLTElTVF9UQUJMRVt0YWddID0gMSkpO1xuXG5jb25zdCBXSElURVNQQUNFID0gL1tcXHQtXFxyIFxceEEwXFx1MTY4MFxcdTE4MEVcXHUyMDAwLVxcdTIwMEFcXHUyMDI4XFx1MjAyOVxcdTIwMkZcXHUyMDVGXFx1MzAwMFxcdUZFRkZdLztcblxubGV0IGRvYzogT3B0aW9uPFNpbXBsZURvY3VtZW50PiA9XG4gIHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogKGRvY3VtZW50IGFzIFNpbXBsZURvY3VtZW50KTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzV2hpdGVzcGFjZShzdHJpbmc6IHN0cmluZykge1xuICByZXR1cm4gV0hJVEVTUEFDRS50ZXN0KHN0cmluZyk7XG59XG5cbmV4cG9ydCBuYW1lc3BhY2UgRE9NIHtcbiAgZXhwb3J0IGNsYXNzIFRyZWVDb25zdHJ1Y3Rpb24gZXh0ZW5kcyBET01PcGVyYXRpb25zIGltcGxlbWVudHMgR2xpbW1lclRyZWVDb25zdHJ1Y3Rpb24ge1xuICAgIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2U6IEVsZW1lbnROYW1lc3BhY2UsIHRhZzogc3RyaW5nKTogU2ltcGxlRWxlbWVudCB7XG4gICAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCB0YWcpO1xuICAgIH1cblxuICAgIHNldEF0dHJpYnV0ZShcbiAgICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgICBuYW1lOiBzdHJpbmcsXG4gICAgICB2YWx1ZTogc3RyaW5nLFxuICAgICAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT4gPSBudWxsXG4gICAgKSB7XG4gICAgICBpZiAobmFtZXNwYWNlKSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlTlMobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGV0IGFwcGxpZWRUcmVlQ29udHJ1Y3Rpb24gPSBUcmVlQ29uc3RydWN0aW9uO1xuICBhcHBsaWVkVHJlZUNvbnRydWN0aW9uID0gYXBwbHlUZXh0Tm9kZU1lcmdpbmdGaXgoXG4gICAgZG9jLFxuICAgIGFwcGxpZWRUcmVlQ29udHJ1Y3Rpb25cbiAgKSBhcyB0eXBlb2YgVHJlZUNvbnN0cnVjdGlvbjtcbiAgYXBwbGllZFRyZWVDb250cnVjdGlvbiA9IGFwcGx5U1ZHSW5uZXJIVE1MRml4KFxuICAgIGRvYyxcbiAgICBhcHBsaWVkVHJlZUNvbnRydWN0aW9uLFxuICAgIE5hbWVzcGFjZS5TVkdcbiAgKSBhcyB0eXBlb2YgVHJlZUNvbnN0cnVjdGlvbjtcblxuICBleHBvcnQgY29uc3QgRE9NVHJlZUNvbnN0cnVjdGlvbiA9IGFwcGxpZWRUcmVlQ29udHJ1Y3Rpb247XG4gIGV4cG9ydCB0eXBlIERPTVRyZWVDb25zdHJ1Y3Rpb24gPSBUcmVlQ29uc3RydWN0aW9uO1xufVxuXG5leHBvcnQgY2xhc3MgRE9NQ2hhbmdlc0ltcGwgZXh0ZW5kcyBET01PcGVyYXRpb25zIGltcGxlbWVudHMgR2xpbW1lclRyZWVDaGFuZ2VzIHtcbiAgcHJvdGVjdGVkIG5hbWVzcGFjZTogT3B0aW9uPHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCkge1xuICAgIHN1cGVyKGRvY3VtZW50KTtcbiAgICB0aGlzLm5hbWVzcGFjZSA9IG51bGw7XG4gIH1cblxuICBzZXRBdHRyaWJ1dGUoZWxlbWVudDogU2ltcGxlRWxlbWVudCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICB9XG5cbiAgcmVtb3ZlQXR0cmlidXRlKGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsIG5hbWU6IHN0cmluZykge1xuICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9XG5cbiAgaW5zZXJ0QWZ0ZXIoZWxlbWVudDogU2ltcGxlRWxlbWVudCwgbm9kZTogU2ltcGxlTm9kZSwgcmVmZXJlbmNlOiBTaW1wbGVOb2RlKSB7XG4gICAgdGhpcy5pbnNlcnRCZWZvcmUoZWxlbWVudCwgbm9kZSwgcmVmZXJlbmNlLm5leHRTaWJsaW5nKTtcbiAgfVxufVxuXG5sZXQgaGVscGVyID0gRE9NQ2hhbmdlc0ltcGw7XG5cbmhlbHBlciA9IGFwcGx5VGV4dE5vZGVNZXJnaW5nRml4KGRvYywgaGVscGVyKSBhcyB0eXBlb2YgRE9NQ2hhbmdlc0ltcGw7XG5oZWxwZXIgPSBhcHBseVNWR0lubmVySFRNTEZpeChkb2MsIGhlbHBlciwgTmFtZXNwYWNlLlNWRykgYXMgdHlwZW9mIERPTUNoYW5nZXNJbXBsO1xuXG5leHBvcnQgZGVmYXVsdCBoZWxwZXI7XG5leHBvcnQgY29uc3QgRE9NVHJlZUNvbnN0cnVjdGlvbiA9IERPTS5ET01UcmVlQ29uc3RydWN0aW9uO1xuZXhwb3J0IHR5cGUgRE9NVHJlZUNvbnN0cnVjdGlvbiA9IERPTS5ET01UcmVlQ29uc3RydWN0aW9uO1xuZXhwb3J0IHR5cGUgRE9NTmFtZXNwYWNlID0gTmFtZXNwYWNlO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==