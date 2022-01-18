'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DOMOperations = exports.BLACKLIST_TABLE = undefined;
exports.moveNodesBefore = moveNodesBefore;

var _bounds = require('../bounds');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

// http://www.w3.org/TR/html/syntax.html#html-integration-point
var SVG_INTEGRATION_POINTS = { foreignObject: 1, desc: 1, title: 1 };
// http://www.w3.org/TR/html/syntax.html#adjust-svg-attributes
// TODO: Adjust SVG attributes
// http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
// TODO: Adjust SVG elements
// http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
var BLACKLIST_TABLE = exports.BLACKLIST_TABLE = Object.create(null);
var DOMOperations = exports.DOMOperations = function () {
    function DOMOperations(document) {
        _classCallCheck(this, DOMOperations);

        this.document = document;
        this.setupUselessElement();
    }
    // split into seperate method so that NodeDOMTreeConstruction
    // can override it.


    DOMOperations.prototype.setupUselessElement = function setupUselessElement() {
        this.uselessElement = this.document.createElement('div');
    };

    DOMOperations.prototype.createElement = function createElement(tag, context) {
        var isElementInSVGNamespace = void 0,
            isHTMLIntegrationPoint = void 0;
        if (context) {
            isElementInSVGNamespace = context.namespaceURI === "http://www.w3.org/2000/svg" /* SVG */ || tag === 'svg';
            isHTMLIntegrationPoint = !!SVG_INTEGRATION_POINTS[context.tagName];
        } else {
            isElementInSVGNamespace = tag === 'svg';
            isHTMLIntegrationPoint = false;
        }
        if (isElementInSVGNamespace && !isHTMLIntegrationPoint) {
            // FIXME: This does not properly handle <font> with color, face, or
            // size attributes, which is also disallowed by the spec. We should fix
            // this.
            if (BLACKLIST_TABLE[tag]) {
                throw new Error('Cannot create a ' + tag + ' inside an SVG context');
            }
            return this.document.createElementNS("http://www.w3.org/2000/svg" /* SVG */, tag);
        } else {
            return this.document.createElement(tag);
        }
    };

    DOMOperations.prototype.insertBefore = function insertBefore(parent, node, reference) {
        parent.insertBefore(node, reference);
    };

    DOMOperations.prototype.insertHTMLBefore = function insertHTMLBefore(parent, nextSibling, html) {
        if (html === '') {
            var comment = this.createComment('');
            parent.insertBefore(comment, nextSibling);
            return new _bounds.ConcreteBounds(parent, comment, comment);
        }
        var prev = nextSibling ? nextSibling.previousSibling : parent.lastChild;
        var last = void 0;
        if (nextSibling === null) {
            parent.insertAdjacentHTML("beforeend" /* beforeend */, html);
            last = parent.lastChild;
        } else if (nextSibling instanceof HTMLElement) {
            nextSibling.insertAdjacentHTML('beforebegin', html);
            last = nextSibling.previousSibling;
        } else {
            // Non-element nodes do not support insertAdjacentHTML, so add an
            // element and call it on that element. Then remove the element.
            //
            // This also protects Edge, IE and Firefox w/o the inspector open
            // from merging adjacent text nodes. See ./compat/text-node-merging-fix.ts
            var uselessElement = this.uselessElement;

            parent.insertBefore(uselessElement, nextSibling);
            uselessElement.insertAdjacentHTML("beforebegin" /* beforebegin */, html);
            last = uselessElement.previousSibling;
            parent.removeChild(uselessElement);
        }
        var first = prev ? prev.nextSibling : parent.firstChild;
        return new _bounds.ConcreteBounds(parent, first, last);
    };

    DOMOperations.prototype.createTextNode = function createTextNode(text) {
        return this.document.createTextNode(text);
    };

    DOMOperations.prototype.createComment = function createComment(data) {
        return this.document.createComment(data);
    };

    return DOMOperations;
}();
function moveNodesBefore(source, target, nextSibling) {
    var first = source.firstChild;
    var last = first;
    var current = first;
    while (current) {
        var next = current.nextSibling;
        target.insertBefore(current, nextSibling);
        last = current;
        current = next;
    }
    return new _bounds.ConcreteBounds(target, first, last);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2RvbS9vcGVyYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztRQThHTSxlLEdBQUEsZTs7QUFwR047Ozs7Ozs7O0FBR0E7QUFDQSxJQUFNLHlCQUF5QixFQUFFLGVBQUYsQ0FBQSxFQUFvQixNQUFwQixDQUFBLEVBQTZCLE9BQTVELENBQStCLEVBQS9CO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNPLElBQU0sNENBQWtCLE9BQUEsTUFBQSxDQUF4QixJQUF3QixDQUF4QjtBQUVQLElBQUEsd0NBQUEsWUFBQTtBQUdFLGFBQUEsYUFBQSxDQUFBLFFBQUEsRUFBOEM7QUFBQSx3QkFBQSxJQUFBLEVBQUEsYUFBQTs7QUFBeEIsYUFBQSxRQUFBLEdBQUEsUUFBQTtBQUNwQixhQUFBLG1CQUFBO0FBQ0Q7QUFFRDtBQUNBOzs7QUFSRixrQkFBQSxTQUFBLENBQUEsbUJBQUEsR0FBQSxTQUFBLG1CQUFBLEdBUytCO0FBQzNCLGFBQUEsY0FBQSxHQUFzQixLQUFBLFFBQUEsQ0FBQSxhQUFBLENBQXRCLEtBQXNCLENBQXRCO0FBVkosS0FBQTs7QUFBQSxrQkFBQSxTQUFBLENBQUEsYUFBQSxHQUFBLFNBQUEsYUFBQSxDQUFBLEdBQUEsRUFBQSxPQUFBLEVBYW9EO0FBQ2hELFlBQUEsMEJBQUEsS0FBQSxDQUFBO0FBQUEsWUFBQSx5QkFBQSxLQUFBLENBQUE7QUFFQSxZQUFBLE9BQUEsRUFBYTtBQUNYLHNDQUEwQixRQUFBLFlBQUEsS0FBQSw0QkFBQSxDQUFBLFNBQUEsSUFBMEMsUUFBcEUsS0FBQTtBQUNBLHFDQUF5QixDQUFDLENBQUUsdUJBQXdDLFFBQXBFLE9BQTRCLENBQTVCO0FBRkYsU0FBQSxNQUdPO0FBQ0wsc0NBQTBCLFFBQTFCLEtBQUE7QUFDQSxxQ0FBQSxLQUFBO0FBQ0Q7QUFFRCxZQUFJLDJCQUEyQixDQUEvQixzQkFBQSxFQUF3RDtBQUN0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cGxlRWxlbWVudCxcbiAgU2ltcGxlRG9jdW1lbnQsXG4gIE5hbWVzcGFjZSxcbiAgU2ltcGxlTm9kZSxcbiAgSW5zZXJ0UG9zaXRpb24sXG4gIFNpbXBsZVRleHQsXG4gIFNpbXBsZUNvbW1lbnQsXG59IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBEaWN0LCBPcHRpb24sIEJvdW5kcyB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQ29uY3JldGVCb3VuZHMgfSBmcm9tICcuLi9ib3VuZHMnO1xuaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbi8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWwvc3ludGF4Lmh0bWwjaHRtbC1pbnRlZ3JhdGlvbi1wb2ludFxuY29uc3QgU1ZHX0lOVEVHUkFUSU9OX1BPSU5UUyA9IHsgZm9yZWlnbk9iamVjdDogMSwgZGVzYzogMSwgdGl0bGU6IDEgfTtcblxuLy8gaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbC9zeW50YXguaHRtbCNhZGp1c3Qtc3ZnLWF0dHJpYnV0ZXNcbi8vIFRPRE86IEFkanVzdCBTVkcgYXR0cmlidXRlc1xuXG4vLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sL3N5bnRheC5odG1sI3BhcnNpbmctbWFpbi1pbmZvcmVpZ25cbi8vIFRPRE86IEFkanVzdCBTVkcgZWxlbWVudHNcblxuLy8gaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbC9zeW50YXguaHRtbCNwYXJzaW5nLW1haW4taW5mb3JlaWduXG5leHBvcnQgY29uc3QgQkxBQ0tMSVNUX1RBQkxFID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuZXhwb3J0IGNsYXNzIERPTU9wZXJhdGlvbnMge1xuICBwcm90ZWN0ZWQgdXNlbGVzc0VsZW1lbnQhOiBTaW1wbGVFbGVtZW50OyAvLyBTZXQgYnkgdGhpcy5zZXR1cFVzZWxlc3NFbGVtZW50KCkgaW4gY29uc3RydWN0b3JcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50KSB7XG4gICAgdGhpcy5zZXR1cFVzZWxlc3NFbGVtZW50KCk7XG4gIH1cblxuICAvLyBzcGxpdCBpbnRvIHNlcGVyYXRlIG1ldGhvZCBzbyB0aGF0IE5vZGVET01UcmVlQ29uc3RydWN0aW9uXG4gIC8vIGNhbiBvdmVycmlkZSBpdC5cbiAgcHJvdGVjdGVkIHNldHVwVXNlbGVzc0VsZW1lbnQoKSB7XG4gICAgdGhpcy51c2VsZXNzRWxlbWVudCA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIH1cblxuICBjcmVhdGVFbGVtZW50KHRhZzogc3RyaW5nLCBjb250ZXh0PzogU2ltcGxlRWxlbWVudCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIGxldCBpc0VsZW1lbnRJblNWR05hbWVzcGFjZTogYm9vbGVhbiwgaXNIVE1MSW50ZWdyYXRpb25Qb2ludDogYm9vbGVhbjtcblxuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICBpc0VsZW1lbnRJblNWR05hbWVzcGFjZSA9IGNvbnRleHQubmFtZXNwYWNlVVJJID09PSBOYW1lc3BhY2UuU1ZHIHx8IHRhZyA9PT0gJ3N2Zyc7XG4gICAgICBpc0hUTUxJbnRlZ3JhdGlvblBvaW50ID0gISEoU1ZHX0lOVEVHUkFUSU9OX1BPSU5UUyBhcyBEaWN0PG51bWJlcj4pW2NvbnRleHQudGFnTmFtZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzRWxlbWVudEluU1ZHTmFtZXNwYWNlID0gdGFnID09PSAnc3ZnJztcbiAgICAgIGlzSFRNTEludGVncmF0aW9uUG9pbnQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoaXNFbGVtZW50SW5TVkdOYW1lc3BhY2UgJiYgIWlzSFRNTEludGVncmF0aW9uUG9pbnQpIHtcbiAgICAgIC8vIEZJWE1FOiBUaGlzIGRvZXMgbm90IHByb3Blcmx5IGhhbmRsZSA8Zm9udD4gd2l0aCBjb2xvciwgZmFjZSwgb3JcbiAgICAgIC8vIHNpemUgYXR0cmlidXRlcywgd2hpY2ggaXMgYWxzbyBkaXNhbGxvd2VkIGJ5IHRoZSBzcGVjLiBXZSBzaG91bGQgZml4XG4gICAgICAvLyB0aGlzLlxuICAgICAgaWYgKEJMQUNLTElTVF9UQUJMRVt0YWddKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGNyZWF0ZSBhICR7dGFnfSBpbnNpZGUgYW4gU1ZHIGNvbnRleHRgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKE5hbWVzcGFjZS5TVkcsIHRhZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICB9XG4gIH1cblxuICBpbnNlcnRCZWZvcmUocGFyZW50OiBTaW1wbGVFbGVtZW50LCBub2RlOiBTaW1wbGVOb2RlLCByZWZlcmVuY2U6IE9wdGlvbjxTaW1wbGVOb2RlPikge1xuICAgIHBhcmVudC5pbnNlcnRCZWZvcmUobm9kZSwgcmVmZXJlbmNlKTtcbiAgfVxuXG4gIGluc2VydEhUTUxCZWZvcmUocGFyZW50OiBTaW1wbGVFbGVtZW50LCBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+LCBodG1sOiBzdHJpbmcpOiBCb3VuZHMge1xuICAgIGlmIChodG1sID09PSAnJykge1xuICAgICAgbGV0IGNvbW1lbnQgPSB0aGlzLmNyZWF0ZUNvbW1lbnQoJycpO1xuICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjb21tZW50LCBuZXh0U2libGluZyk7XG4gICAgICByZXR1cm4gbmV3IENvbmNyZXRlQm91bmRzKHBhcmVudCwgY29tbWVudCwgY29tbWVudCk7XG4gICAgfVxuXG4gICAgbGV0IHByZXYgPSBuZXh0U2libGluZyA/IG5leHRTaWJsaW5nLnByZXZpb3VzU2libGluZyA6IHBhcmVudC5sYXN0Q2hpbGQ7XG4gICAgbGV0IGxhc3Q6IFNpbXBsZU5vZGU7XG5cbiAgICBpZiAobmV4dFNpYmxpbmcgPT09IG51bGwpIHtcbiAgICAgIHBhcmVudC5pbnNlcnRBZGphY2VudEhUTUwoSW5zZXJ0UG9zaXRpb24uYmVmb3JlZW5kLCBodG1sKTtcbiAgICAgIGxhc3QgPSBleHBlY3QocGFyZW50Lmxhc3RDaGlsZCwgJ2J1ZyBpbiBpbnNlcnRBZGphY2VudEhUTUw/Jyk7XG4gICAgfSBlbHNlIGlmIChuZXh0U2libGluZyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICBuZXh0U2libGluZy5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWJlZ2luJywgaHRtbCk7XG4gICAgICBsYXN0ID0gZXhwZWN0KG5leHRTaWJsaW5nLnByZXZpb3VzU2libGluZywgJ2J1ZyBpbiBpbnNlcnRBZGphY2VudEhUTUw/Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vbi1lbGVtZW50IG5vZGVzIGRvIG5vdCBzdXBwb3J0IGluc2VydEFkamFjZW50SFRNTCwgc28gYWRkIGFuXG4gICAgICAvLyBlbGVtZW50IGFuZCBjYWxsIGl0IG9uIHRoYXQgZWxlbWVudC4gVGhlbiByZW1vdmUgdGhlIGVsZW1lbnQuXG4gICAgICAvL1xuICAgICAgLy8gVGhpcyBhbHNvIHByb3RlY3RzIEVkZ2UsIElFIGFuZCBGaXJlZm94IHcvbyB0aGUgaW5zcGVjdG9yIG9wZW5cbiAgICAgIC8vIGZyb20gbWVyZ2luZyBhZGphY2VudCB0ZXh0IG5vZGVzLiBTZWUgLi9jb21wYXQvdGV4dC1ub2RlLW1lcmdpbmctZml4LnRzXG4gICAgICBsZXQgeyB1c2VsZXNzRWxlbWVudCB9ID0gdGhpcztcblxuICAgICAgcGFyZW50Lmluc2VydEJlZm9yZSh1c2VsZXNzRWxlbWVudCwgbmV4dFNpYmxpbmcpO1xuICAgICAgdXNlbGVzc0VsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKEluc2VydFBvc2l0aW9uLmJlZm9yZWJlZ2luLCBodG1sKTtcbiAgICAgIGxhc3QgPSBleHBlY3QodXNlbGVzc0VsZW1lbnQucHJldmlvdXNTaWJsaW5nLCAnYnVnIGluIGluc2VydEFkamFjZW50SFRNTD8nKTtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZCh1c2VsZXNzRWxlbWVudCk7XG4gICAgfVxuXG4gICAgbGV0IGZpcnN0ID0gZXhwZWN0KHByZXYgPyBwcmV2Lm5leHRTaWJsaW5nIDogcGFyZW50LmZpcnN0Q2hpbGQsICdidWcgaW4gaW5zZXJ0QWRqYWNlbnRIVE1MPycpO1xuICAgIHJldHVybiBuZXcgQ29uY3JldGVCb3VuZHMocGFyZW50LCBmaXJzdCwgbGFzdCk7XG4gIH1cblxuICBjcmVhdGVUZXh0Tm9kZSh0ZXh0OiBzdHJpbmcpOiBTaW1wbGVUZXh0IHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbiAgfVxuXG4gIGNyZWF0ZUNvbW1lbnQoZGF0YTogc3RyaW5nKTogU2ltcGxlQ29tbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuY3JlYXRlQ29tbWVudChkYXRhKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZU5vZGVzQmVmb3JlKFxuICBzb3VyY2U6IFNpbXBsZU5vZGUsXG4gIHRhcmdldDogU2ltcGxlRWxlbWVudCxcbiAgbmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPlxuKTogQm91bmRzIHtcbiAgbGV0IGZpcnN0ID0gZXhwZWN0KHNvdXJjZS5maXJzdENoaWxkLCAnc291cmNlIGlzIGVtcHR5Jyk7XG4gIGxldCBsYXN0OiBTaW1wbGVOb2RlID0gZmlyc3Q7XG4gIGxldCBjdXJyZW50OiBPcHRpb248U2ltcGxlTm9kZT4gPSBmaXJzdDtcblxuICB3aGlsZSAoY3VycmVudCkge1xuICAgIGxldCBuZXh0OiBPcHRpb248U2ltcGxlTm9kZT4gPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuXG4gICAgdGFyZ2V0Lmluc2VydEJlZm9yZShjdXJyZW50LCBuZXh0U2libGluZyk7XG5cbiAgICBsYXN0ID0gY3VycmVudDtcbiAgICBjdXJyZW50ID0gbmV4dDtcbiAgfVxuXG4gIHJldHVybiBuZXcgQ29uY3JldGVCb3VuZHModGFyZ2V0LCBmaXJzdCwgbGFzdCk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9