"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SVG_NAMESPACE = undefined;
exports.applySVGInnerHTMLFix = applySVGInnerHTMLFix;

var _util = require("@glimmer/util");

var _operations = require("../dom/operations");

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

var SVG_NAMESPACE = exports.SVG_NAMESPACE = "http://www.w3.org/2000/svg" /* SVG */;
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
function applySVGInnerHTMLFix(document, DOMClass, svgNamespace) {
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
    false && (0, _util.assert)(html !== '', 'html cannot be empty');

    var source = void 0;
    // This is important, because decendants of the <foreignObject> integration
    // point are parsed in the HTML namespace
    if (parent.tagName.toUpperCase() === 'FOREIGNOBJECT') {
        // IE, Edge: also do not correctly support using `innerHTML` on SVG
        // namespaced elements. So here a wrapper is used.
        var wrappedHtml = '<svg><foreignObject>' + html + '</foreignObject></svg>';
        (0, _util.clearElement)(div);
        div.insertAdjacentHTML("afterbegin" /* afterbegin */, wrappedHtml);
        source = div.firstChild.firstChild;
    } else {
        // IE, Edge: also do not correctly support using `innerHTML` on SVG
        // namespaced elements. So here a wrapper is used.
        var _wrappedHtml = '<svg>' + html + '</svg>';
        (0, _util.clearElement)(div);
        div.insertAdjacentHTML("afterbegin" /* afterbegin */, _wrappedHtml);
        source = div.firstChild;
    }
    return (0, _operations.moveNodesBefore)(source, parent, reference);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBhdC9zdmctaW5uZXItaHRtbC1maXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1FBeUJNLG9CLEdBQUEsb0I7O0FBeEJOOztBQVFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRU8sSUFBTSx3Q0FBTiw0QkFBQSxDQUFBLFNBQUE7QUFHUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ00sU0FBQSxvQkFBQSxDQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsWUFBQSxFQUd1QjtBQUUzQixRQUFJLENBQUosUUFBQSxFQUFlLE9BQUEsUUFBQTtBQUVmLFFBQUksQ0FBQyxlQUFBLFFBQUEsRUFBTCxZQUFLLENBQUwsRUFBNkM7QUFDM0MsZUFBQSxRQUFBO0FBQ0Q7QUFFRCxRQUFJLE1BQU0sU0FBQSxhQUFBLENBQVYsS0FBVSxDQUFWO0FBRUEsV0FBQSxVQUFBLFNBQUEsRUFBQTtBQUFBLGtCQUFBLDZCQUFBLEVBQUEsU0FBQTs7QUFBQSxpQkFBQSw2QkFBQSxHQUFBO0FBQUEsNEJBQUEsSUFBQSxFQUFBLDZCQUFBOztBQUFBLG1CQUFBLDJCQUFBLElBQUEsRUFBQSxVQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFBQTs7QUFBQSxzQ0FBQSxTQUFBLENBQUEsZ0JBQUEsR0FBQSxTQUFBLGdCQUFBLENBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQ3VGO0FBQ25GLGdCQUFJLFNBQUosRUFBQSxFQUFpQjtBQUNmLHVCQUFPLFVBQUEsU0FBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFQLElBQU8sQ0FBUDtBQUNEO0FBRUQsZ0JBQUksT0FBQSxZQUFBLEtBQUosWUFBQSxFQUEwQztBQUN4Qyx1QkFBTyxVQUFBLFNBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBUCxJQUFPLENBQVA7QUFDRDtBQUVELG1CQUFPLE9BQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQVAsV0FBTyxDQUFQO0FBVkosU0FBQTs7QUFBQSxlQUFBLDZCQUFBO0FBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQTtBQWFEO0FBRUQsU0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUkrQjtBQUFBLGFBRTdCLGtCQUFPLFNBQVAsRUFBQSxFQUY2QixzQkFFN0IsQ0FGNkI7O0FBSTdCLFFBQUEsU0FBQSxLQUFBLENBQUE7QUFFQTtBQUNBO0FBQ0EsUUFBSSxPQUFBLE9BQUEsQ0FBQSxXQUFBLE9BQUosZUFBQSxFQUFzRDtBQUNwRDtBQUNBO0FBQ0EsWUFBSSxjQUFjLHlCQUFBLElBQUEsR0FBbEIsd0JBQUE7QUFFQSxnQ0FBQSxHQUFBO0FBQ0EsWUFBQSxrQkFBQSxDQUFBLFlBQUEsQ0FBQSxnQkFBQSxFQUFBLFdBQUE7QUFFQSxpQkFBUyxJQUFBLFVBQUEsQ0FBVCxVQUFBO0FBUkYsS0FBQSxNQVNPO0FBQ0w7QUFDQTtBQUNBLFlBQUksZUFBYyxVQUFBLElBQUEsR0FBbEIsUUFBQTtBQUVBLGdDQUFBLEdBQUE7QUFDQSxZQUFBLGtCQUFBLENBQUEsWUFBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUVBLGlCQUFTLElBQVQsVUFBQTtBQUNEO0FBRUQsV0FBTyxpQ0FBQSxNQUFBLEVBQUEsTUFBQSxFQUFQLFNBQU8sQ0FBUDtBQUNEO0FBRUQsU0FBQSxjQUFBLENBQUEsUUFBQSxFQUFBLFlBQUEsRUFBNkU7QUFDM0UsUUFBSSxNQUFNLFNBQUEsZUFBQSxDQUFBLFlBQUEsRUFBVixLQUFVLENBQVY7QUFFQSxRQUFJO0FBQ0YsWUFBQSxrQkFBQSxDQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsbUJBQUE7QUFERixLQUFBLENBRUUsT0FBQSxDQUFBLEVBQVU7QUFDVjtBQUNBO0FBSkYsS0FBQSxTQUtVO0FBQ1I7QUFDQSxZQUNFLElBQUEsVUFBQSxDQUFBLE1BQUEsS0FBQSxDQUFBLElBQ1EsSUFBUCxVQUFPLENBQVAsWUFBTyxLQUZWLGFBQUEsRUFHRTtBQUNBO0FBQ0EsbUJBQUEsS0FBQTtBQUNEO0FBRUQsZUFBQSxJQUFBO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJvdW5kcyB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzZXJ0LCBjbGVhckVsZW1lbnQsIE9wdGlvbiwgdW53cmFwIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQge1xuICBJbnNlcnRQb3NpdGlvbixcbiAgTmFtZXNwYWNlLFxuICBTaW1wbGVEb2N1bWVudCxcbiAgU2ltcGxlRWxlbWVudCxcbiAgU2ltcGxlTm9kZSxcbn0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IERPTU9wZXJhdGlvbnMsIG1vdmVOb2Rlc0JlZm9yZSB9IGZyb20gJy4uL2RvbS9vcGVyYXRpb25zJztcblxuZXhwb3J0IGNvbnN0IFNWR19OQU1FU1BBQ0UgPSBOYW1lc3BhY2UuU1ZHO1xuZXhwb3J0IHR5cGUgU1ZHX05BTUVTUEFDRSA9IHR5cGVvZiBTVkdfTkFNRVNQQUNFO1xuXG4vLyBQYXRjaDogICAgaW5zZXJ0QWRqYWNlbnRIVE1MIG9uIFNWRyBGaXhcbi8vIEJyb3dzZXJzOiBTYWZhcmksIElFLCBFZGdlLCBGaXJlZm94IH4zMy0zNFxuLy8gUmVhc29uOiAgIGluc2VydEFkamFjZW50SFRNTCBkb2VzIG5vdCBleGlzdCBvbiBTVkcgZWxlbWVudHMgaW4gU2FmYXJpLiBJdCBpc1xuLy8gICAgICAgICAgIHByZXNlbnQgYnV0IHRocm93cyBhbiBleGNlcHRpb24gb24gSUUgYW5kIEVkZ2UuIE9sZCB2ZXJzaW9ucyBvZlxuLy8gICAgICAgICAgIEZpcmVmb3ggY3JlYXRlIG5vZGVzIGluIHRoZSBpbmNvcnJlY3QgbmFtZXNwYWNlLlxuLy8gRml4OiAgICAgIFNpbmNlIElFIGFuZCBFZGdlIHNpbGVudGx5IGZhaWwgdG8gY3JlYXRlIFNWRyBub2RlcyB1c2luZ1xuLy8gICAgICAgICAgIGlubmVySFRNTCwgYW5kIGJlY2F1c2UgRmlyZWZveCBtYXkgY3JlYXRlIG5vZGVzIGluIHRoZSBpbmNvcnJlY3Rcbi8vICAgICAgICAgICBuYW1lc3BhY2UgdXNpbmcgaW5uZXJIVE1MIG9uIFNWRyBlbGVtZW50cywgYW4gSFRNTC1zdHJpbmcgd3JhcHBpbmdcbi8vICAgICAgICAgICBhcHByb2FjaCBpcyB1c2VkLiBBIHByZS9wb3N0IFNWRyB0YWcgaXMgYWRkZWQgdG8gdGhlIHN0cmluZywgdGhlblxuLy8gICAgICAgICAgIHRoYXQgd2hvbGUgc3RyaW5nIGlzIGFkZGVkIHRvIGEgZGl2LiBUaGUgY3JlYXRlZCBub2RlcyBhcmUgcGx1Y2tlZFxuLy8gICAgICAgICAgIG91dCBhbmQgYXBwbGllZCB0byB0aGUgdGFyZ2V0IGxvY2F0aW9uIG9uIERPTS5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVNWR0lubmVySFRNTEZpeChcbiAgZG9jdW1lbnQ6IE9wdGlvbjxTaW1wbGVEb2N1bWVudD4sXG4gIERPTUNsYXNzOiB0eXBlb2YgRE9NT3BlcmF0aW9ucyxcbiAgc3ZnTmFtZXNwYWNlOiBTVkdfTkFNRVNQQUNFXG4pOiB0eXBlb2YgRE9NT3BlcmF0aW9ucyB7XG4gIGlmICghZG9jdW1lbnQpIHJldHVybiBET01DbGFzcztcblxuICBpZiAoIXNob3VsZEFwcGx5Rml4KGRvY3VtZW50LCBzdmdOYW1lc3BhY2UpKSB7XG4gICAgcmV0dXJuIERPTUNsYXNzO1xuICB9XG5cbiAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpIGFzIFNpbXBsZUVsZW1lbnQ7XG5cbiAgcmV0dXJuIGNsYXNzIERPTUNoYW5nZXNXaXRoU1ZHSW5uZXJIVE1MRml4IGV4dGVuZHMgRE9NQ2xhc3Mge1xuICAgIGluc2VydEhUTUxCZWZvcmUocGFyZW50OiBTaW1wbGVFbGVtZW50LCBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+LCBodG1sOiBzdHJpbmcpOiBCb3VuZHMge1xuICAgICAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5pbnNlcnRIVE1MQmVmb3JlKHBhcmVudCwgbmV4dFNpYmxpbmcsIGh0bWwpO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyZW50Lm5hbWVzcGFjZVVSSSAhPT0gc3ZnTmFtZXNwYWNlKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5pbnNlcnRIVE1MQmVmb3JlKHBhcmVudCwgbmV4dFNpYmxpbmcsIGh0bWwpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZml4U1ZHKHBhcmVudCwgZGl2LCBodG1sLCBuZXh0U2libGluZyk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBmaXhTVkcoXG4gIHBhcmVudDogU2ltcGxlRWxlbWVudCxcbiAgZGl2OiBTaW1wbGVFbGVtZW50LFxuICBodG1sOiBzdHJpbmcsXG4gIHJlZmVyZW5jZTogT3B0aW9uPFNpbXBsZU5vZGU+XG4pOiBCb3VuZHMge1xuICBhc3NlcnQoaHRtbCAhPT0gJycsICdodG1sIGNhbm5vdCBiZSBlbXB0eScpO1xuXG4gIGxldCBzb3VyY2U6IFNpbXBsZU5vZGU7XG5cbiAgLy8gVGhpcyBpcyBpbXBvcnRhbnQsIGJlY2F1c2UgZGVjZW5kYW50cyBvZiB0aGUgPGZvcmVpZ25PYmplY3Q+IGludGVncmF0aW9uXG4gIC8vIHBvaW50IGFyZSBwYXJzZWQgaW4gdGhlIEhUTUwgbmFtZXNwYWNlXG4gIGlmIChwYXJlbnQudGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnRk9SRUlHTk9CSkVDVCcpIHtcbiAgICAvLyBJRSwgRWRnZTogYWxzbyBkbyBub3QgY29ycmVjdGx5IHN1cHBvcnQgdXNpbmcgYGlubmVySFRNTGAgb24gU1ZHXG4gICAgLy8gbmFtZXNwYWNlZCBlbGVtZW50cy4gU28gaGVyZSBhIHdyYXBwZXIgaXMgdXNlZC5cbiAgICBsZXQgd3JhcHBlZEh0bWwgPSAnPHN2Zz48Zm9yZWlnbk9iamVjdD4nICsgaHRtbCArICc8L2ZvcmVpZ25PYmplY3Q+PC9zdmc+JztcblxuICAgIGNsZWFyRWxlbWVudChkaXYpO1xuICAgIGRpdi5pbnNlcnRBZGphY2VudEhUTUwoSW5zZXJ0UG9zaXRpb24uYWZ0ZXJiZWdpbiwgd3JhcHBlZEh0bWwpO1xuXG4gICAgc291cmNlID0gZGl2LmZpcnN0Q2hpbGQhLmZpcnN0Q2hpbGQhO1xuICB9IGVsc2Uge1xuICAgIC8vIElFLCBFZGdlOiBhbHNvIGRvIG5vdCBjb3JyZWN0bHkgc3VwcG9ydCB1c2luZyBgaW5uZXJIVE1MYCBvbiBTVkdcbiAgICAvLyBuYW1lc3BhY2VkIGVsZW1lbnRzLiBTbyBoZXJlIGEgd3JhcHBlciBpcyB1c2VkLlxuICAgIGxldCB3cmFwcGVkSHRtbCA9ICc8c3ZnPicgKyBodG1sICsgJzwvc3ZnPic7XG5cbiAgICBjbGVhckVsZW1lbnQoZGl2KTtcbiAgICBkaXYuaW5zZXJ0QWRqYWNlbnRIVE1MKEluc2VydFBvc2l0aW9uLmFmdGVyYmVnaW4sIHdyYXBwZWRIdG1sKTtcblxuICAgIHNvdXJjZSA9IGRpdi5maXJzdENoaWxkITtcbiAgfVxuXG4gIHJldHVybiBtb3ZlTm9kZXNCZWZvcmUoc291cmNlLCBwYXJlbnQsIHJlZmVyZW5jZSk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZEFwcGx5Rml4KGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCwgc3ZnTmFtZXNwYWNlOiBTVkdfTkFNRVNQQUNFKSB7XG4gIGxldCBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnTmFtZXNwYWNlLCAnc3ZnJyk7XG5cbiAgdHJ5IHtcbiAgICBzdmcuaW5zZXJ0QWRqYWNlbnRIVE1MKEluc2VydFBvc2l0aW9uLmJlZm9yZWVuZCwgJzxjaXJjbGU+PC9jaXJjbGU+Jyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJRSwgRWRnZTogV2lsbCB0aHJvdywgaW5zZXJ0QWRqYWNlbnRIVE1MIGlzIHVuc3VwcG9ydGVkIG9uIFNWR1xuICAgIC8vIFNhZmFyaTogV2lsbCB0aHJvdywgaW5zZXJ0QWRqYWNlbnRIVE1MIGlzIG5vdCBwcmVzZW50IG9uIFNWR1xuICB9IGZpbmFsbHkge1xuICAgIC8vIEZGOiBPbGQgdmVyc2lvbnMgd2lsbCBjcmVhdGUgYSBub2RlIGluIHRoZSB3cm9uZyBuYW1lc3BhY2VcbiAgICBpZiAoXG4gICAgICBzdmcuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEgJiZcbiAgICAgICh1bndyYXAoc3ZnLmZpcnN0Q2hpbGQpIGFzIE5vZGUpLm5hbWVzcGFjZVVSSSA9PT0gU1ZHX05BTUVTUEFDRVxuICAgICkge1xuICAgICAgLy8gVGhlIHRlc3Qgd29ya2VkIGFzIGV4cGVjdGVkLCBubyBmaXggcmVxdWlyZWRcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==