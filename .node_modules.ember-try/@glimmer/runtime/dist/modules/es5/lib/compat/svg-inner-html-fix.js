function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { assert, clearElement } from '@glimmer/util';
import { moveNodesBefore } from '../dom/operations';
export var SVG_NAMESPACE = "http://www.w3.org/2000/svg" /* SVG */;
// Patch:    insertAdjacentHTML on SVG Fix
// Browsers: Safari, IE, Edge, Firefox ~33-34
// Reason:   insertAdjacentHTML does not exist on SVG elements in Safari. It is
//           present but throws an exception on IE and Edge. Old versions of
//           Firefox create nodes in the incorrect namespace.
// Fix:      Since IE and Edge silently fail to create SVG nodes using
//           innerHTML, and because Firefox may create nodes in the incorrect
//           namespace using innerHTML on SVG elements, an HTML-string wrapping
//           approach is used. A pre/post SVG tag is added to the string, then
//           that whole string is added to a div. The created nodes are plucked
//           out and applied to the target location on DOM.
export function applySVGInnerHTMLFix(document, DOMClass, svgNamespace) {
    if (!document) return DOMClass;
    if (!shouldApplyFix(document, svgNamespace)) {
        return DOMClass;
    }
    var div = document.createElement('div');
    return function (_DOMClass) {
        _inherits(DOMChangesWithSVGInnerHTMLFix, _DOMClass);

        function DOMChangesWithSVGInnerHTMLFix() {
            _classCallCheck(this, DOMChangesWithSVGInnerHTMLFix);

            return _possibleConstructorReturn(this, _DOMClass.apply(this, arguments));
        }

        DOMChangesWithSVGInnerHTMLFix.prototype.insertHTMLBefore = function insertHTMLBefore(parent, nextSibling, html) {
            if (html === '') {
                return _DOMClass.prototype.insertHTMLBefore.call(this, parent, nextSibling, html);
            }
            if (parent.namespaceURI !== svgNamespace) {
                return _DOMClass.prototype.insertHTMLBefore.call(this, parent, nextSibling, html);
            }
            return fixSVG(parent, div, html, nextSibling);
        };

        return DOMChangesWithSVGInnerHTMLFix;
    }(DOMClass);
}
function fixSVG(parent, div, html, reference) {
    false && assert(html !== '', 'html cannot be empty');

    var source = void 0;
    // This is important, because decendants of the <foreignObject> integration
    // point are parsed in the HTML namespace
    if (parent.tagName.toUpperCase() === 'FOREIGNOBJECT') {
        // IE, Edge: also do not correctly support using `innerHTML` on SVG
        // namespaced elements. So here a wrapper is used.
        var wrappedHtml = '<svg><foreignObject>' + html + '</foreignObject></svg>';
        clearElement(div);
        div.insertAdjacentHTML("afterbegin" /* afterbegin */, wrappedHtml);
        source = div.firstChild.firstChild;
    } else {
        // IE, Edge: also do not correctly support using `innerHTML` on SVG
        // namespaced elements. So here a wrapper is used.
        var _wrappedHtml = '<svg>' + html + '</svg>';
        clearElement(div);
        div.insertAdjacentHTML("afterbegin" /* afterbegin */, _wrappedHtml);
        source = div.firstChild;
    }
    return moveNodesBefore(source, parent, reference);
}
function shouldApplyFix(document, svgNamespace) {
    var svg = document.createElementNS(svgNamespace, 'svg');
    try {
        svg.insertAdjacentHTML("beforeend" /* beforeend */, '<circle></circle>');
    } catch (e) {
        // IE, Edge: Will throw, insertAdjacentHTML is unsupported on SVG
        // Safari: Will throw, insertAdjacentHTML is not present on SVG
    } finally {
        // FF: Old versions will create a node in the wrong namespace
        if (svg.childNodes.length === 1 && svg.firstChild.namespaceURI === SVG_NAMESPACE) {
            // The test worked as expected, no fix required
            return false;
        }
        return true;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBhdC9zdmctaW5uZXItaHRtbC1maXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQSxTQUFBLE1BQUEsRUFBQSxZQUFBLFFBQUEsZUFBQTtBQVFBLFNBQUEsZUFBQSxRQUFBLG1CQUFBO0FBRUEsT0FBTyxJQUFNLGdCQUFOLDRCQUFBLENBQUEsU0FBQTtBQUdQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFNLFNBQUEsb0JBQUEsQ0FBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLFlBQUEsRUFHdUI7QUFFM0IsUUFBSSxDQUFKLFFBQUEsRUFBZSxPQUFBLFFBQUE7QUFFZixRQUFJLENBQUMsZUFBQSxRQUFBLEVBQUwsWUFBSyxDQUFMLEVBQTZDO0FBQzNDLGVBQUEsUUFBQTtBQUNEO0FBRUQsUUFBSSxNQUFNLFNBQUEsYUFBQSxDQUFWLEtBQVUsQ0FBVjtBQUVBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBLGdEQUNFLGdCQURGLDZCQUNFLE1BREYsRUFDRSxXQURGLEVBQ0UsSUFERixFQUN1RjtBQUNuRixnQkFBSSxTQUFKLEVBQUEsRUFBaUI7QUFDZix1QkFBTyxvQkFBQSxnQkFBQSxZQUFBLE1BQUEsRUFBQSxXQUFBLEVBQVAsSUFBTyxDQUFQO0FBQ0Q7QUFFRCxnQkFBSSxPQUFBLFlBQUEsS0FBSixZQUFBLEVBQTBDO0FBQ3hDLHVCQUFPLG9CQUFBLGdCQUFBLFlBQUEsTUFBQSxFQUFBLFdBQUEsRUFBUCxJQUFPLENBQVA7QUFDRDtBQUVELG1CQUFPLE9BQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQVAsV0FBTyxDQUFQO0FBQ0QsU0FYSDs7QUFBQTtBQUFBLE1BQU8sUUFBUDtBQWFEO0FBRUQsU0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUkrQjtBQUFBLGFBRTdCLE9BQU8sU0FBUCxFQUFBLEVBRjZCLHNCQUU3QixDQUY2Qjs7QUFJN0IsUUFBQSxlQUFBO0FBRUE7QUFDQTtBQUNBLFFBQUksT0FBQSxPQUFBLENBQUEsV0FBQSxPQUFKLGVBQUEsRUFBc0Q7QUFDcEQ7QUFDQTtBQUNBLFlBQUksY0FBYyx5QkFBQSxJQUFBLEdBQWxCLHdCQUFBO0FBRUEscUJBQUEsR0FBQTtBQUNBLFlBQUEsa0JBQUEsQ0FBQSxZQUFBLENBQUEsZ0JBQUEsRUFBQSxXQUFBO0FBRUEsaUJBQVMsSUFBQSxVQUFBLENBQVQsVUFBQTtBQVJGLEtBQUEsTUFTTztBQUNMO0FBQ0E7QUFDQSxZQUFJLGVBQWMsVUFBQSxJQUFBLEdBQWxCLFFBQUE7QUFFQSxxQkFBQSxHQUFBO0FBQ0EsWUFBQSxrQkFBQSxDQUFBLFlBQUEsQ0FBQSxnQkFBQSxFQUFBLFlBQUE7QUFFQSxpQkFBUyxJQUFULFVBQUE7QUFDRDtBQUVELFdBQU8sZ0JBQUEsTUFBQSxFQUFBLE1BQUEsRUFBUCxTQUFPLENBQVA7QUFDRDtBQUVELFNBQUEsY0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBLEVBQTZFO0FBQzNFLFFBQUksTUFBTSxTQUFBLGVBQUEsQ0FBQSxZQUFBLEVBQVYsS0FBVSxDQUFWO0FBRUEsUUFBSTtBQUNGLFlBQUEsa0JBQUEsQ0FBQSxXQUFBLENBQUEsZUFBQSxFQUFBLG1CQUFBO0FBREYsS0FBQSxDQUVFLE9BQUEsQ0FBQSxFQUFVO0FBQ1Y7QUFDQTtBQUpGLEtBQUEsU0FLVTtBQUNSO0FBQ0EsWUFDRSxJQUFBLFVBQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxJQUNRLElBQVAsVUFBTyxDQUFQLFlBQU8sS0FGVixhQUFBLEVBR0U7QUFDQTtBQUNBLG1CQUFBLEtBQUE7QUFDRDtBQUVELGVBQUEsSUFBQTtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCb3VuZHMgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2VydCwgY2xlYXJFbGVtZW50LCBPcHRpb24sIHVud3JhcCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHtcbiAgSW5zZXJ0UG9zaXRpb24sXG4gIE5hbWVzcGFjZSxcbiAgU2ltcGxlRG9jdW1lbnQsXG4gIFNpbXBsZUVsZW1lbnQsXG4gIFNpbXBsZU5vZGUsXG59IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBET01PcGVyYXRpb25zLCBtb3ZlTm9kZXNCZWZvcmUgfSBmcm9tICcuLi9kb20vb3BlcmF0aW9ucyc7XG5cbmV4cG9ydCBjb25zdCBTVkdfTkFNRVNQQUNFID0gTmFtZXNwYWNlLlNWRztcbmV4cG9ydCB0eXBlIFNWR19OQU1FU1BBQ0UgPSB0eXBlb2YgU1ZHX05BTUVTUEFDRTtcblxuLy8gUGF0Y2g6ICAgIGluc2VydEFkamFjZW50SFRNTCBvbiBTVkcgRml4XG4vLyBCcm93c2VyczogU2FmYXJpLCBJRSwgRWRnZSwgRmlyZWZveCB+MzMtMzRcbi8vIFJlYXNvbjogICBpbnNlcnRBZGphY2VudEhUTUwgZG9lcyBub3QgZXhpc3Qgb24gU1ZHIGVsZW1lbnRzIGluIFNhZmFyaS4gSXQgaXNcbi8vICAgICAgICAgICBwcmVzZW50IGJ1dCB0aHJvd3MgYW4gZXhjZXB0aW9uIG9uIElFIGFuZCBFZGdlLiBPbGQgdmVyc2lvbnMgb2Zcbi8vICAgICAgICAgICBGaXJlZm94IGNyZWF0ZSBub2RlcyBpbiB0aGUgaW5jb3JyZWN0IG5hbWVzcGFjZS5cbi8vIEZpeDogICAgICBTaW5jZSBJRSBhbmQgRWRnZSBzaWxlbnRseSBmYWlsIHRvIGNyZWF0ZSBTVkcgbm9kZXMgdXNpbmdcbi8vICAgICAgICAgICBpbm5lckhUTUwsIGFuZCBiZWNhdXNlIEZpcmVmb3ggbWF5IGNyZWF0ZSBub2RlcyBpbiB0aGUgaW5jb3JyZWN0XG4vLyAgICAgICAgICAgbmFtZXNwYWNlIHVzaW5nIGlubmVySFRNTCBvbiBTVkcgZWxlbWVudHMsIGFuIEhUTUwtc3RyaW5nIHdyYXBwaW5nXG4vLyAgICAgICAgICAgYXBwcm9hY2ggaXMgdXNlZC4gQSBwcmUvcG9zdCBTVkcgdGFnIGlzIGFkZGVkIHRvIHRoZSBzdHJpbmcsIHRoZW5cbi8vICAgICAgICAgICB0aGF0IHdob2xlIHN0cmluZyBpcyBhZGRlZCB0byBhIGRpdi4gVGhlIGNyZWF0ZWQgbm9kZXMgYXJlIHBsdWNrZWRcbi8vICAgICAgICAgICBvdXQgYW5kIGFwcGxpZWQgdG8gdGhlIHRhcmdldCBsb2NhdGlvbiBvbiBET00uXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlTVkdJbm5lckhUTUxGaXgoXG4gIGRvY3VtZW50OiBPcHRpb248U2ltcGxlRG9jdW1lbnQ+LFxuICBET01DbGFzczogdHlwZW9mIERPTU9wZXJhdGlvbnMsXG4gIHN2Z05hbWVzcGFjZTogU1ZHX05BTUVTUEFDRVxuKTogdHlwZW9mIERPTU9wZXJhdGlvbnMge1xuICBpZiAoIWRvY3VtZW50KSByZXR1cm4gRE9NQ2xhc3M7XG5cbiAgaWYgKCFzaG91bGRBcHBseUZpeChkb2N1bWVudCwgc3ZnTmFtZXNwYWNlKSkge1xuICAgIHJldHVybiBET01DbGFzcztcbiAgfVxuXG4gIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSBhcyBTaW1wbGVFbGVtZW50O1xuXG4gIHJldHVybiBjbGFzcyBET01DaGFuZ2VzV2l0aFNWR0lubmVySFRNTEZpeCBleHRlbmRzIERPTUNsYXNzIHtcbiAgICBpbnNlcnRIVE1MQmVmb3JlKHBhcmVudDogU2ltcGxlRWxlbWVudCwgbmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPiwgaHRtbDogc3RyaW5nKTogQm91bmRzIHtcbiAgICAgIGlmIChodG1sID09PSAnJykge1xuICAgICAgICByZXR1cm4gc3VwZXIuaW5zZXJ0SFRNTEJlZm9yZShwYXJlbnQsIG5leHRTaWJsaW5nLCBodG1sKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmVudC5uYW1lc3BhY2VVUkkgIT09IHN2Z05hbWVzcGFjZSkge1xuICAgICAgICByZXR1cm4gc3VwZXIuaW5zZXJ0SFRNTEJlZm9yZShwYXJlbnQsIG5leHRTaWJsaW5nLCBodG1sKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZpeFNWRyhwYXJlbnQsIGRpdiwgaHRtbCwgbmV4dFNpYmxpbmcpO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZml4U1ZHKFxuICBwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsXG4gIGRpdjogU2ltcGxlRWxlbWVudCxcbiAgaHRtbDogc3RyaW5nLFxuICByZWZlcmVuY2U6IE9wdGlvbjxTaW1wbGVOb2RlPlxuKTogQm91bmRzIHtcbiAgYXNzZXJ0KGh0bWwgIT09ICcnLCAnaHRtbCBjYW5ub3QgYmUgZW1wdHknKTtcblxuICBsZXQgc291cmNlOiBTaW1wbGVOb2RlO1xuXG4gIC8vIFRoaXMgaXMgaW1wb3J0YW50LCBiZWNhdXNlIGRlY2VuZGFudHMgb2YgdGhlIDxmb3JlaWduT2JqZWN0PiBpbnRlZ3JhdGlvblxuICAvLyBwb2ludCBhcmUgcGFyc2VkIGluIHRoZSBIVE1MIG5hbWVzcGFjZVxuICBpZiAocGFyZW50LnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gJ0ZPUkVJR05PQkpFQ1QnKSB7XG4gICAgLy8gSUUsIEVkZ2U6IGFsc28gZG8gbm90IGNvcnJlY3RseSBzdXBwb3J0IHVzaW5nIGBpbm5lckhUTUxgIG9uIFNWR1xuICAgIC8vIG5hbWVzcGFjZWQgZWxlbWVudHMuIFNvIGhlcmUgYSB3cmFwcGVyIGlzIHVzZWQuXG4gICAgbGV0IHdyYXBwZWRIdG1sID0gJzxzdmc+PGZvcmVpZ25PYmplY3Q+JyArIGh0bWwgKyAnPC9mb3JlaWduT2JqZWN0Pjwvc3ZnPic7XG5cbiAgICBjbGVhckVsZW1lbnQoZGl2KTtcbiAgICBkaXYuaW5zZXJ0QWRqYWNlbnRIVE1MKEluc2VydFBvc2l0aW9uLmFmdGVyYmVnaW4sIHdyYXBwZWRIdG1sKTtcblxuICAgIHNvdXJjZSA9IGRpdi5maXJzdENoaWxkIS5maXJzdENoaWxkITtcbiAgfSBlbHNlIHtcbiAgICAvLyBJRSwgRWRnZTogYWxzbyBkbyBub3QgY29ycmVjdGx5IHN1cHBvcnQgdXNpbmcgYGlubmVySFRNTGAgb24gU1ZHXG4gICAgLy8gbmFtZXNwYWNlZCBlbGVtZW50cy4gU28gaGVyZSBhIHdyYXBwZXIgaXMgdXNlZC5cbiAgICBsZXQgd3JhcHBlZEh0bWwgPSAnPHN2Zz4nICsgaHRtbCArICc8L3N2Zz4nO1xuXG4gICAgY2xlYXJFbGVtZW50KGRpdik7XG4gICAgZGl2Lmluc2VydEFkamFjZW50SFRNTChJbnNlcnRQb3NpdGlvbi5hZnRlcmJlZ2luLCB3cmFwcGVkSHRtbCk7XG5cbiAgICBzb3VyY2UgPSBkaXYuZmlyc3RDaGlsZCE7XG4gIH1cblxuICByZXR1cm4gbW92ZU5vZGVzQmVmb3JlKHNvdXJjZSwgcGFyZW50LCByZWZlcmVuY2UpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRBcHBseUZpeChkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQsIHN2Z05hbWVzcGFjZTogU1ZHX05BTUVTUEFDRSkge1xuICBsZXQgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHN2Z05hbWVzcGFjZSwgJ3N2ZycpO1xuXG4gIHRyeSB7XG4gICAgc3ZnLmluc2VydEFkamFjZW50SFRNTChJbnNlcnRQb3NpdGlvbi5iZWZvcmVlbmQsICc8Y2lyY2xlPjwvY2lyY2xlPicpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSUUsIEVkZ2U6IFdpbGwgdGhyb3csIGluc2VydEFkamFjZW50SFRNTCBpcyB1bnN1cHBvcnRlZCBvbiBTVkdcbiAgICAvLyBTYWZhcmk6IFdpbGwgdGhyb3csIGluc2VydEFkamFjZW50SFRNTCBpcyBub3QgcHJlc2VudCBvbiBTVkdcbiAgfSBmaW5hbGx5IHtcbiAgICAvLyBGRjogT2xkIHZlcnNpb25zIHdpbGwgY3JlYXRlIGEgbm9kZSBpbiB0aGUgd3JvbmcgbmFtZXNwYWNlXG4gICAgaWYgKFxuICAgICAgc3ZnLmNoaWxkTm9kZXMubGVuZ3RoID09PSAxICYmXG4gICAgICAodW53cmFwKHN2Zy5maXJzdENoaWxkKSBhcyBOb2RlKS5uYW1lc3BhY2VVUkkgPT09IFNWR19OQU1FU1BBQ0VcbiAgICApIHtcbiAgICAgIC8vIFRoZSB0ZXN0IHdvcmtlZCBhcyBleHBlY3RlZCwgbm8gZml4IHJlcXVpcmVkXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=