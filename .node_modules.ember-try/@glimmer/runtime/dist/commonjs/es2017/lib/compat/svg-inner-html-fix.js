'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SVG_NAMESPACE = undefined;
exports.applySVGInnerHTMLFix = applySVGInnerHTMLFix;

var _util = require('@glimmer/util');

var _operations = require('../dom/operations');

const SVG_NAMESPACE = exports.SVG_NAMESPACE = "http://www.w3.org/2000/svg" /* SVG */;
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
    let div = document.createElement('div');
    return class DOMChangesWithSVGInnerHTMLFix extends DOMClass {
        insertHTMLBefore(parent, nextSibling, html) {
            if (html === '') {
                return super.insertHTMLBefore(parent, nextSibling, html);
            }
            if (parent.namespaceURI !== svgNamespace) {
                return super.insertHTMLBefore(parent, nextSibling, html);
            }
            return fixSVG(parent, div, html, nextSibling);
        }
    };
}
function fixSVG(parent, div, html, reference) {
    false && (0, _util.assert)(html !== '', 'html cannot be empty');

    let source;
    // This is important, because decendants of the <foreignObject> integration
    // point are parsed in the HTML namespace
    if (parent.tagName.toUpperCase() === 'FOREIGNOBJECT') {
        // IE, Edge: also do not correctly support using `innerHTML` on SVG
        // namespaced elements. So here a wrapper is used.
        let wrappedHtml = '<svg><foreignObject>' + html + '</foreignObject></svg>';
        (0, _util.clearElement)(div);
        div.insertAdjacentHTML("afterbegin" /* afterbegin */, wrappedHtml);
        source = div.firstChild.firstChild;
    } else {
        // IE, Edge: also do not correctly support using `innerHTML` on SVG
        // namespaced elements. So here a wrapper is used.
        let wrappedHtml = '<svg>' + html + '</svg>';
        (0, _util.clearElement)(div);
        div.insertAdjacentHTML("afterbegin" /* afterbegin */, wrappedHtml);
        source = div.firstChild;
    }
    return (0, _operations.moveNodesBefore)(source, parent, reference);
}
function shouldApplyFix(document, svgNamespace) {
    let svg = document.createElementNS(svgNamespace, 'svg');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBhdC9zdmctaW5uZXItaHRtbC1maXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1FBeUJNLG9CLEdBQUEsb0I7Ozs7QUFoQk47O0FBRU8sTUFBTSx3Q0FBTiw0QkFBQSxDQUFBLFNBQUE7QUFHUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ00sU0FBQSxvQkFBQSxDQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsWUFBQSxFQUd1QjtBQUUzQixRQUFJLENBQUosUUFBQSxFQUFlLE9BQUEsUUFBQTtBQUVmLFFBQUksQ0FBQyxlQUFBLFFBQUEsRUFBTCxZQUFLLENBQUwsRUFBNkM7QUFDM0MsZUFBQSxRQUFBO0FBQ0Q7QUFFRCxRQUFJLE1BQU0sU0FBQSxhQUFBLENBQVYsS0FBVSxDQUFWO0FBRUEsV0FBTyxNQUFBLDZCQUFBLFNBQUEsUUFBQSxDQUFvRDtBQUN6RCx5QkFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBcUY7QUFDbkYsZ0JBQUksU0FBSixFQUFBLEVBQWlCO0FBQ2YsdUJBQU8sTUFBQSxnQkFBQSxDQUFBLE1BQUEsRUFBQSxXQUFBLEVBQVAsSUFBTyxDQUFQO0FBQ0Q7QUFFRCxnQkFBSSxPQUFBLFlBQUEsS0FBSixZQUFBLEVBQTBDO0FBQ3hDLHVCQUFPLE1BQUEsZ0JBQUEsQ0FBQSxNQUFBLEVBQUEsV0FBQSxFQUFQLElBQU8sQ0FBUDtBQUNEO0FBRUQsbUJBQU8sT0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBUCxXQUFPLENBQVA7QUFDRDtBQVh3RCxLQUEzRDtBQWFEO0FBRUQsU0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUkrQjtBQUFBLGFBRTdCLGtCQUFPLFNBQVAsRUFBQSxFQUY2QixzQkFFN0IsQ0FGNkI7O0FBSTdCLFFBQUEsTUFBQTtBQUVBO0FBQ0E7QUFDQSxRQUFJLE9BQUEsT0FBQSxDQUFBLFdBQUEsT0FBSixlQUFBLEVBQXNEO0FBQ3BEO0FBQ0E7QUFDQSxZQUFJLGNBQWMseUJBQUEsSUFBQSxHQUFsQix3QkFBQTtBQUVBLGdDQUFBLEdBQUE7QUFDQSxZQUFBLGtCQUFBLENBQUEsWUFBQSxDQUFBLGdCQUFBLEVBQUEsV0FBQTtBQUVBLGlCQUFTLElBQUEsVUFBQSxDQUFULFVBQUE7QUFSRixLQUFBLE1BU087QUFDTDtBQUNBO0FBQ0EsWUFBSSxjQUFjLFVBQUEsSUFBQSxHQUFsQixRQUFBO0FBRUEsZ0NBQUEsR0FBQTtBQUNBLFlBQUEsa0JBQUEsQ0FBQSxZQUFBLENBQUEsZ0JBQUEsRUFBQSxXQUFBO0FBRUEsaUJBQVMsSUFBVCxVQUFBO0FBQ0Q7QUFFRCxXQUFPLGlDQUFBLE1BQUEsRUFBQSxNQUFBLEVBQVAsU0FBTyxDQUFQO0FBQ0Q7QUFFRCxTQUFBLGNBQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQSxFQUE2RTtBQUMzRSxRQUFJLE1BQU0sU0FBQSxlQUFBLENBQUEsWUFBQSxFQUFWLEtBQVUsQ0FBVjtBQUVBLFFBQUk7QUFDRixZQUFBLGtCQUFBLENBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxtQkFBQTtBQURGLEtBQUEsQ0FFRSxPQUFBLENBQUEsRUFBVTtBQUNWO0FBQ0E7QUFKRixLQUFBLFNBS1U7QUFDUjtBQUNBLFlBQ0UsSUFBQSxVQUFBLENBQUEsTUFBQSxLQUFBLENBQUEsSUFDUSxJQUFQLFVBQU8sQ0FBUCxZQUFPLEtBRlYsYUFBQSxFQUdFO0FBQ0E7QUFDQSxtQkFBQSxLQUFBO0FBQ0Q7QUFFRCxlQUFBLElBQUE7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQm91bmRzIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NlcnQsIGNsZWFyRWxlbWVudCwgT3B0aW9uLCB1bndyYXAgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIEluc2VydFBvc2l0aW9uLFxuICBOYW1lc3BhY2UsXG4gIFNpbXBsZURvY3VtZW50LFxuICBTaW1wbGVFbGVtZW50LFxuICBTaW1wbGVOb2RlLFxufSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgRE9NT3BlcmF0aW9ucywgbW92ZU5vZGVzQmVmb3JlIH0gZnJvbSAnLi4vZG9tL29wZXJhdGlvbnMnO1xuXG5leHBvcnQgY29uc3QgU1ZHX05BTUVTUEFDRSA9IE5hbWVzcGFjZS5TVkc7XG5leHBvcnQgdHlwZSBTVkdfTkFNRVNQQUNFID0gdHlwZW9mIFNWR19OQU1FU1BBQ0U7XG5cbi8vIFBhdGNoOiAgICBpbnNlcnRBZGphY2VudEhUTUwgb24gU1ZHIEZpeFxuLy8gQnJvd3NlcnM6IFNhZmFyaSwgSUUsIEVkZ2UsIEZpcmVmb3ggfjMzLTM0XG4vLyBSZWFzb246ICAgaW5zZXJ0QWRqYWNlbnRIVE1MIGRvZXMgbm90IGV4aXN0IG9uIFNWRyBlbGVtZW50cyBpbiBTYWZhcmkuIEl0IGlzXG4vLyAgICAgICAgICAgcHJlc2VudCBidXQgdGhyb3dzIGFuIGV4Y2VwdGlvbiBvbiBJRSBhbmQgRWRnZS4gT2xkIHZlcnNpb25zIG9mXG4vLyAgICAgICAgICAgRmlyZWZveCBjcmVhdGUgbm9kZXMgaW4gdGhlIGluY29ycmVjdCBuYW1lc3BhY2UuXG4vLyBGaXg6ICAgICAgU2luY2UgSUUgYW5kIEVkZ2Ugc2lsZW50bHkgZmFpbCB0byBjcmVhdGUgU1ZHIG5vZGVzIHVzaW5nXG4vLyAgICAgICAgICAgaW5uZXJIVE1MLCBhbmQgYmVjYXVzZSBGaXJlZm94IG1heSBjcmVhdGUgbm9kZXMgaW4gdGhlIGluY29ycmVjdFxuLy8gICAgICAgICAgIG5hbWVzcGFjZSB1c2luZyBpbm5lckhUTUwgb24gU1ZHIGVsZW1lbnRzLCBhbiBIVE1MLXN0cmluZyB3cmFwcGluZ1xuLy8gICAgICAgICAgIGFwcHJvYWNoIGlzIHVzZWQuIEEgcHJlL3Bvc3QgU1ZHIHRhZyBpcyBhZGRlZCB0byB0aGUgc3RyaW5nLCB0aGVuXG4vLyAgICAgICAgICAgdGhhdCB3aG9sZSBzdHJpbmcgaXMgYWRkZWQgdG8gYSBkaXYuIFRoZSBjcmVhdGVkIG5vZGVzIGFyZSBwbHVja2VkXG4vLyAgICAgICAgICAgb3V0IGFuZCBhcHBsaWVkIHRvIHRoZSB0YXJnZXQgbG9jYXRpb24gb24gRE9NLlxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U1ZHSW5uZXJIVE1MRml4KFxuICBkb2N1bWVudDogT3B0aW9uPFNpbXBsZURvY3VtZW50PixcbiAgRE9NQ2xhc3M6IHR5cGVvZiBET01PcGVyYXRpb25zLFxuICBzdmdOYW1lc3BhY2U6IFNWR19OQU1FU1BBQ0Vcbik6IHR5cGVvZiBET01PcGVyYXRpb25zIHtcbiAgaWYgKCFkb2N1bWVudCkgcmV0dXJuIERPTUNsYXNzO1xuXG4gIGlmICghc2hvdWxkQXBwbHlGaXgoZG9jdW1lbnQsIHN2Z05hbWVzcGFjZSkpIHtcbiAgICByZXR1cm4gRE9NQ2xhc3M7XG4gIH1cblxuICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgYXMgU2ltcGxlRWxlbWVudDtcblxuICByZXR1cm4gY2xhc3MgRE9NQ2hhbmdlc1dpdGhTVkdJbm5lckhUTUxGaXggZXh0ZW5kcyBET01DbGFzcyB7XG4gICAgaW5zZXJ0SFRNTEJlZm9yZShwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsIG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT4sIGh0bWw6IHN0cmluZyk6IEJvdW5kcyB7XG4gICAgICBpZiAoaHRtbCA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmluc2VydEhUTUxCZWZvcmUocGFyZW50LCBuZXh0U2libGluZywgaHRtbCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJlbnQubmFtZXNwYWNlVVJJICE9PSBzdmdOYW1lc3BhY2UpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmluc2VydEhUTUxCZWZvcmUocGFyZW50LCBuZXh0U2libGluZywgaHRtbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmaXhTVkcocGFyZW50LCBkaXYsIGh0bWwsIG5leHRTaWJsaW5nKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGZpeFNWRyhcbiAgcGFyZW50OiBTaW1wbGVFbGVtZW50LFxuICBkaXY6IFNpbXBsZUVsZW1lbnQsXG4gIGh0bWw6IHN0cmluZyxcbiAgcmVmZXJlbmNlOiBPcHRpb248U2ltcGxlTm9kZT5cbik6IEJvdW5kcyB7XG4gIGFzc2VydChodG1sICE9PSAnJywgJ2h0bWwgY2Fubm90IGJlIGVtcHR5Jyk7XG5cbiAgbGV0IHNvdXJjZTogU2ltcGxlTm9kZTtcblxuICAvLyBUaGlzIGlzIGltcG9ydGFudCwgYmVjYXVzZSBkZWNlbmRhbnRzIG9mIHRoZSA8Zm9yZWlnbk9iamVjdD4gaW50ZWdyYXRpb25cbiAgLy8gcG9pbnQgYXJlIHBhcnNlZCBpbiB0aGUgSFRNTCBuYW1lc3BhY2VcbiAgaWYgKHBhcmVudC50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdGT1JFSUdOT0JKRUNUJykge1xuICAgIC8vIElFLCBFZGdlOiBhbHNvIGRvIG5vdCBjb3JyZWN0bHkgc3VwcG9ydCB1c2luZyBgaW5uZXJIVE1MYCBvbiBTVkdcbiAgICAvLyBuYW1lc3BhY2VkIGVsZW1lbnRzLiBTbyBoZXJlIGEgd3JhcHBlciBpcyB1c2VkLlxuICAgIGxldCB3cmFwcGVkSHRtbCA9ICc8c3ZnPjxmb3JlaWduT2JqZWN0PicgKyBodG1sICsgJzwvZm9yZWlnbk9iamVjdD48L3N2Zz4nO1xuXG4gICAgY2xlYXJFbGVtZW50KGRpdik7XG4gICAgZGl2Lmluc2VydEFkamFjZW50SFRNTChJbnNlcnRQb3NpdGlvbi5hZnRlcmJlZ2luLCB3cmFwcGVkSHRtbCk7XG5cbiAgICBzb3VyY2UgPSBkaXYuZmlyc3RDaGlsZCEuZmlyc3RDaGlsZCE7XG4gIH0gZWxzZSB7XG4gICAgLy8gSUUsIEVkZ2U6IGFsc28gZG8gbm90IGNvcnJlY3RseSBzdXBwb3J0IHVzaW5nIGBpbm5lckhUTUxgIG9uIFNWR1xuICAgIC8vIG5hbWVzcGFjZWQgZWxlbWVudHMuIFNvIGhlcmUgYSB3cmFwcGVyIGlzIHVzZWQuXG4gICAgbGV0IHdyYXBwZWRIdG1sID0gJzxzdmc+JyArIGh0bWwgKyAnPC9zdmc+JztcblxuICAgIGNsZWFyRWxlbWVudChkaXYpO1xuICAgIGRpdi5pbnNlcnRBZGphY2VudEhUTUwoSW5zZXJ0UG9zaXRpb24uYWZ0ZXJiZWdpbiwgd3JhcHBlZEh0bWwpO1xuXG4gICAgc291cmNlID0gZGl2LmZpcnN0Q2hpbGQhO1xuICB9XG5cbiAgcmV0dXJuIG1vdmVOb2Rlc0JlZm9yZShzb3VyY2UsIHBhcmVudCwgcmVmZXJlbmNlKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkQXBwbHlGaXgoZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50LCBzdmdOYW1lc3BhY2U6IFNWR19OQU1FU1BBQ0UpIHtcbiAgbGV0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhzdmdOYW1lc3BhY2UsICdzdmcnKTtcblxuICB0cnkge1xuICAgIHN2Zy5pbnNlcnRBZGphY2VudEhUTUwoSW5zZXJ0UG9zaXRpb24uYmVmb3JlZW5kLCAnPGNpcmNsZT48L2NpcmNsZT4nKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElFLCBFZGdlOiBXaWxsIHRocm93LCBpbnNlcnRBZGphY2VudEhUTUwgaXMgdW5zdXBwb3J0ZWQgb24gU1ZHXG4gICAgLy8gU2FmYXJpOiBXaWxsIHRocm93LCBpbnNlcnRBZGphY2VudEhUTUwgaXMgbm90IHByZXNlbnQgb24gU1ZHXG4gIH0gZmluYWxseSB7XG4gICAgLy8gRkY6IE9sZCB2ZXJzaW9ucyB3aWxsIGNyZWF0ZSBhIG5vZGUgaW4gdGhlIHdyb25nIG5hbWVzcGFjZVxuICAgIGlmIChcbiAgICAgIHN2Zy5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgKHVud3JhcChzdmcuZmlyc3RDaGlsZCkgYXMgTm9kZSkubmFtZXNwYWNlVVJJID09PSBTVkdfTkFNRVNQQUNFXG4gICAgKSB7XG4gICAgICAvLyBUaGUgdGVzdCB3b3JrZWQgYXMgZXhwZWN0ZWQsIG5vIGZpeCByZXF1aXJlZFxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9