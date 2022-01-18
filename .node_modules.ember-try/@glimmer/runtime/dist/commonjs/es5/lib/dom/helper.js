"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DOMTreeConstruction = exports.DOMChangesImpl = exports.DOM = undefined;
exports.isWhitespace = isWhitespace;

var _svgInnerHtmlFix = require("../compat/svg-inner-html-fix");

var _textNodeMergingFix = require("../compat/text-node-merging-fix");

var _operations = require("./operations");

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

['b', 'big', 'blockquote', 'body', 'br', 'center', 'code', 'dd', 'div', 'dl', 'dt', 'em', 'embed', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'i', 'img', 'li', 'listing', 'main', 'meta', 'nobr', 'ol', 'p', 'pre', 'ruby', 's', 'small', 'span', 'strong', 'strike', 'sub', 'sup', 'table', 'tt', 'u', 'ul', 'var'].forEach(function (tag) {
    return _operations.BLACKLIST_TABLE[tag] = 1;
});
var WHITESPACE = /[\t-\r \xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/;
var doc = typeof document === 'undefined' ? null : document;
function isWhitespace(string) {
    return WHITESPACE.test(string);
}
var DOM = exports.DOM = undefined;
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
    }(_operations.DOMOperations);

    DOM.TreeConstruction = TreeConstruction;
    var appliedTreeContruction = TreeConstruction;
    appliedTreeContruction = (0, _textNodeMergingFix.applyTextNodeMergingFix)(doc, appliedTreeContruction);
    appliedTreeContruction = (0, _svgInnerHtmlFix.applySVGInnerHTMLFix)(doc, appliedTreeContruction, "http://www.w3.org/2000/svg" /* SVG */);
    DOM.DOMTreeConstruction = appliedTreeContruction;
})(DOM || (exports.DOM = DOM = {}));
var DOMChangesImpl = exports.DOMChangesImpl = function (_DOMOperations2) {
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
}(_operations.DOMOperations);
var helper = DOMChangesImpl;
helper = (0, _textNodeMergingFix.applyTextNodeMergingFix)(doc, helper);
helper = (0, _svgInnerHtmlFix.applySVGInnerHTMLFix)(doc, helper, "http://www.w3.org/2000/svg" /* SVG */);
exports.default = helper;
var DOMTreeConstruction = exports.DOMTreeConstruction = DOM.DOMTreeConstruction;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2RvbS9oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1FBa0VNLFksR0FBQSxZOztBQXhETjs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLENBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLENBNkNVLFVBQUEsR0FBQSxFQUFBO0FBQUEsV0FBUSw0QkFBQSxHQUFBLElBN0NsQixDQTZDVTtBQTdDVixDQUFBO0FBK0NBLElBQU0sYUFBTiwyRUFBQTtBQUVBLElBQUksTUFDRixPQUFBLFFBQUEsS0FBQSxXQUFBLEdBQUEsSUFBQSxHQURGLFFBQUE7QUFHTSxTQUFBLFlBQUEsQ0FBQSxNQUFBLEVBQXFDO0FBQ3pDLFdBQU8sV0FBQSxJQUFBLENBQVAsTUFBTyxDQUFQO0FBQ0Q7QUFFSyxJQUFBLDZCQUFBO0FBQU4sQ0FBQSxVQUFBLEdBQUEsRUFBb0I7QUFBQSxRQUFBLG1CQUFBLFVBQUEsY0FBQSxFQUFBO0FBQUEsa0JBQUEsZ0JBQUEsRUFBQSxjQUFBOztBQUFBLGlCQUFBLGdCQUFBLEdBQUE7QUFBQSw0QkFBQSxJQUFBLEVBQUEsZ0JBQUE7O0FBQUEsbUJBQUEsMkJBQUEsSUFBQSxFQUFBLGVBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBOztBQUFBLHlCQUFBLFNBQUEsQ0FBQSxlQUFBLEdBQUEsU0FBQSxlQUFBLENBQUEsU0FBQSxFQUFBLEdBQUEsRUFFd0M7QUFDdEQsbUJBQU8sS0FBQSxRQUFBLENBQUEsZUFBQSxDQUFBLFNBQUEsRUFBUCxHQUFPLENBQVA7QUFIYyxTQUFBOztBQUFBLHlCQUFBLFNBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxZQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBVXlCO0FBQUEsZ0JBQXZDLFlBQXVDLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FKekMsSUFJeUM7O0FBRXZDLGdCQUFBLFNBQUEsRUFBZTtBQUNiLHdCQUFBLGNBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUE7QUFERixhQUFBLE1BRU87QUFDTCx3QkFBQSxZQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDRDtBQWhCYSxTQUFBOztBQUFBLGVBQUEsZ0JBQUE7QUFBQSxLQUFBLENBQUEseUJBQUEsQ0FBQTs7QUFDTCxRQUFBLGdCQUFBLEdBQUEsZ0JBQUE7QUFtQmIsUUFBSSx5QkFBSixnQkFBQTtBQUNBLDZCQUF5QixpREFBQSxHQUFBLEVBQXpCLHNCQUF5QixDQUF6QjtBQUlBLDZCQUF5QiwyQ0FBQSxHQUFBLEVBQUEsc0JBQUEsRUFBQSw0QkFBQSxDQUF6QixTQUF5QixDQUF6QjtBQU1hLFFBQUEsbUJBQUEsR0FBQSxzQkFBQTtBQS9CZixDQUFBLEVBQWlCLGdCQUFYLEdBQVcsR0FBQSxNQUFqQixFQUFpQixDQUFqQjtBQW1DQSxJQUFBLDBDQUFBLFVBQUEsZUFBQSxFQUFBO0FBQUEsY0FBQSxjQUFBLEVBQUEsZUFBQTs7QUFHRSxhQUFBLGNBQUEsQ0FBQSxRQUFBLEVBQThDO0FBQUEsd0JBQUEsSUFBQSxFQUFBLGNBQUE7O0FBQUEsWUFBQSxTQUFBLDJCQUFBLElBQUEsRUFDNUMsZ0JBQUEsSUFBQSxDQUFBLElBQUEsRUFENEMsUUFDNUMsQ0FENEMsQ0FBQTs7QUFBeEIsZUFBQSxRQUFBLEdBQUEsUUFBQTtBQUVwQixlQUFBLFNBQUEsR0FBQSxJQUFBO0FBRjRDLGVBQUEsTUFBQTtBQUc3Qzs7QUFOSCxtQkFBQSxTQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsWUFBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQVFrRTtBQUM5RCxnQkFBQSxZQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFUSixLQUFBOztBQUFBLG1CQUFBLFNBQUEsQ0FBQSxlQUFBLEdBQUEsU0FBQSxlQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFZc0Q7QUFDbEQsZ0JBQUEsZUFBQSxDQUFBLElBQUE7QUFiSixLQUFBOztBQUFBLG1CQUFBLFNBQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBZ0I2RTtBQUN6RSxhQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxFQUFpQyxVQUFqQyxXQUFBO0FBakJKLEtBQUE7O0FBQUEsV0FBQSxjQUFBO0FBQUEsQ0FBQSxDQUFBLHlCQUFBLENBQUE7QUFxQkEsSUFBSSxTQUFKLGNBQUE7QUFFQSxTQUFTLGlEQUFBLEdBQUEsRUFBVCxNQUFTLENBQVQ7QUFDQSxTQUFTLDJDQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsNEJBQUEsQ0FBVCxTQUFTLENBQVQ7a0JBRUEsTTtBQUNPLElBQU0sb0RBQXNCLElBQTVCLG1CQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgR2xpbW1lclRyZWVDaGFuZ2VzLCBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbiB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQge1xuICBBdHRyTmFtZXNwYWNlLFxuICBFbGVtZW50TmFtZXNwYWNlLFxuICBOYW1lc3BhY2UsXG4gIFNpbXBsZURvY3VtZW50LFxuICBTaW1wbGVFbGVtZW50LFxuICBTaW1wbGVOb2RlLFxufSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgYXBwbHlTVkdJbm5lckhUTUxGaXggfSBmcm9tICcuLi9jb21wYXQvc3ZnLWlubmVyLWh0bWwtZml4JztcbmltcG9ydCB7IGFwcGx5VGV4dE5vZGVNZXJnaW5nRml4IH0gZnJvbSAnLi4vY29tcGF0L3RleHQtbm9kZS1tZXJnaW5nLWZpeCc7XG5pbXBvcnQgeyBET01PcGVyYXRpb25zLCBCTEFDS0xJU1RfVEFCTEUgfSBmcm9tICcuL29wZXJhdGlvbnMnO1xuXG5bXG4gICdiJyxcbiAgJ2JpZycsXG4gICdibG9ja3F1b3RlJyxcbiAgJ2JvZHknLFxuICAnYnInLFxuICAnY2VudGVyJyxcbiAgJ2NvZGUnLFxuICAnZGQnLFxuICAnZGl2JyxcbiAgJ2RsJyxcbiAgJ2R0JyxcbiAgJ2VtJyxcbiAgJ2VtYmVkJyxcbiAgJ2gxJyxcbiAgJ2gyJyxcbiAgJ2gzJyxcbiAgJ2g0JyxcbiAgJ2g1JyxcbiAgJ2g2JyxcbiAgJ2hlYWQnLFxuICAnaHInLFxuICAnaScsXG4gICdpbWcnLFxuICAnbGknLFxuICAnbGlzdGluZycsXG4gICdtYWluJyxcbiAgJ21ldGEnLFxuICAnbm9icicsXG4gICdvbCcsXG4gICdwJyxcbiAgJ3ByZScsXG4gICdydWJ5JyxcbiAgJ3MnLFxuICAnc21hbGwnLFxuICAnc3BhbicsXG4gICdzdHJvbmcnLFxuICAnc3RyaWtlJyxcbiAgJ3N1YicsXG4gICdzdXAnLFxuICAndGFibGUnLFxuICAndHQnLFxuICAndScsXG4gICd1bCcsXG4gICd2YXInLFxuXS5mb3JFYWNoKHRhZyA9PiAoQkxBQ0tMSVNUX1RBQkxFW3RhZ10gPSAxKSk7XG5cbmNvbnN0IFdISVRFU1BBQ0UgPSAvW1xcdC1cXHIgXFx4QTBcXHUxNjgwXFx1MTgwRVxcdTIwMDAtXFx1MjAwQVxcdTIwMjhcXHUyMDI5XFx1MjAyRlxcdTIwNUZcXHUzMDAwXFx1RkVGRl0vO1xuXG5sZXQgZG9jOiBPcHRpb248U2ltcGxlRG9jdW1lbnQ+ID1cbiAgdHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiAoZG9jdW1lbnQgYXMgU2ltcGxlRG9jdW1lbnQpO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKHN0cmluZzogc3RyaW5nKSB7XG4gIHJldHVybiBXSElURVNQQUNFLnRlc3Qoc3RyaW5nKTtcbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBET00ge1xuICBleHBvcnQgY2xhc3MgVHJlZUNvbnN0cnVjdGlvbiBleHRlbmRzIERPTU9wZXJhdGlvbnMgaW1wbGVtZW50cyBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbiB7XG4gICAgY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZTogRWxlbWVudE5hbWVzcGFjZSwgdGFnOiBzdHJpbmcpOiBTaW1wbGVFbGVtZW50IHtcbiAgICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIHRhZyk7XG4gICAgfVxuXG4gICAgc2V0QXR0cmlidXRlKFxuICAgICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPiA9IG51bGxcbiAgICApIHtcbiAgICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhuYW1lc3BhY2UsIG5hbWUsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsZXQgYXBwbGllZFRyZWVDb250cnVjdGlvbiA9IFRyZWVDb25zdHJ1Y3Rpb247XG4gIGFwcGxpZWRUcmVlQ29udHJ1Y3Rpb24gPSBhcHBseVRleHROb2RlTWVyZ2luZ0ZpeChcbiAgICBkb2MsXG4gICAgYXBwbGllZFRyZWVDb250cnVjdGlvblxuICApIGFzIHR5cGVvZiBUcmVlQ29uc3RydWN0aW9uO1xuICBhcHBsaWVkVHJlZUNvbnRydWN0aW9uID0gYXBwbHlTVkdJbm5lckhUTUxGaXgoXG4gICAgZG9jLFxuICAgIGFwcGxpZWRUcmVlQ29udHJ1Y3Rpb24sXG4gICAgTmFtZXNwYWNlLlNWR1xuICApIGFzIHR5cGVvZiBUcmVlQ29uc3RydWN0aW9uO1xuXG4gIGV4cG9ydCBjb25zdCBET01UcmVlQ29uc3RydWN0aW9uID0gYXBwbGllZFRyZWVDb250cnVjdGlvbjtcbiAgZXhwb3J0IHR5cGUgRE9NVHJlZUNvbnN0cnVjdGlvbiA9IFRyZWVDb25zdHJ1Y3Rpb247XG59XG5cbmV4cG9ydCBjbGFzcyBET01DaGFuZ2VzSW1wbCBleHRlbmRzIERPTU9wZXJhdGlvbnMgaW1wbGVtZW50cyBHbGltbWVyVHJlZUNoYW5nZXMge1xuICBwcm90ZWN0ZWQgbmFtZXNwYWNlOiBPcHRpb248c3RyaW5nPjtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50KSB7XG4gICAgc3VwZXIoZG9jdW1lbnQpO1xuICAgIHRoaXMubmFtZXNwYWNlID0gbnVsbDtcbiAgfVxuXG4gIHNldEF0dHJpYnV0ZShlbGVtZW50OiBTaW1wbGVFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gIH1cblxuICByZW1vdmVBdHRyaWJ1dGUoZWxlbWVudDogU2ltcGxlRWxlbWVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH1cblxuICBpbnNlcnRBZnRlcihlbGVtZW50OiBTaW1wbGVFbGVtZW50LCBub2RlOiBTaW1wbGVOb2RlLCByZWZlcmVuY2U6IFNpbXBsZU5vZGUpIHtcbiAgICB0aGlzLmluc2VydEJlZm9yZShlbGVtZW50LCBub2RlLCByZWZlcmVuY2UubmV4dFNpYmxpbmcpO1xuICB9XG59XG5cbmxldCBoZWxwZXIgPSBET01DaGFuZ2VzSW1wbDtcblxuaGVscGVyID0gYXBwbHlUZXh0Tm9kZU1lcmdpbmdGaXgoZG9jLCBoZWxwZXIpIGFzIHR5cGVvZiBET01DaGFuZ2VzSW1wbDtcbmhlbHBlciA9IGFwcGx5U1ZHSW5uZXJIVE1MRml4KGRvYywgaGVscGVyLCBOYW1lc3BhY2UuU1ZHKSBhcyB0eXBlb2YgRE9NQ2hhbmdlc0ltcGw7XG5cbmV4cG9ydCBkZWZhdWx0IGhlbHBlcjtcbmV4cG9ydCBjb25zdCBET01UcmVlQ29uc3RydWN0aW9uID0gRE9NLkRPTVRyZWVDb25zdHJ1Y3Rpb247XG5leHBvcnQgdHlwZSBET01UcmVlQ29uc3RydWN0aW9uID0gRE9NLkRPTVRyZWVDb25zdHJ1Y3Rpb247XG5leHBvcnQgdHlwZSBET01OYW1lc3BhY2UgPSBOYW1lc3BhY2U7XG4iXSwic291cmNlUm9vdCI6IiJ9