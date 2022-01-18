'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.applyTextNodeMergingFix = applyTextNodeMergingFix;
// Patch:    Adjacent text node merging fix
// Browsers: IE, Edge, Firefox w/o inspector open
// Reason:   These browsers will merge adjacent text nodes. For exmaple given
//           <div>Hello</div> with div.insertAdjacentHTML(' world') browsers
//           with proper behavior will populate div.childNodes with two items.
//           These browsers will populate it with one merged node instead.
// Fix:      Add these nodes to a wrapper element, then iterate the childNodes
//           of that wrapper and move the nodes to their target location. Note
//           that potential SVG bugs will have been handled before this fix.
//           Note that this fix must only apply to the previous text node, as
//           the base implementation of `insertHTMLBefore` already handles
//           following text nodes correctly.
function applyTextNodeMergingFix(document, DOMClass) {
    if (!document) return DOMClass;
    if (!shouldApplyFix(document)) {
        return DOMClass;
    }
    return class DOMChangesWithTextNodeMergingFix extends DOMClass {
        constructor(document) {
            super(document);
            this.uselessComment = document.createComment('');
        }
        insertHTMLBefore(parent, nextSibling, html) {
            if (html === '') {
                return super.insertHTMLBefore(parent, nextSibling, html);
            }
            let didSetUselessComment = false;
            let nextPrevious = nextSibling ? nextSibling.previousSibling : parent.lastChild;
            if (nextPrevious && nextPrevious instanceof Text) {
                didSetUselessComment = true;
                parent.insertBefore(this.uselessComment, nextSibling);
            }
            let bounds = super.insertHTMLBefore(parent, nextSibling, html);
            if (didSetUselessComment) {
                parent.removeChild(this.uselessComment);
            }
            return bounds;
        }
    };
}
function shouldApplyFix(document) {
    let mergingTextDiv = document.createElement('div');
    mergingTextDiv.appendChild(document.createTextNode('first'));
    mergingTextDiv.insertAdjacentHTML("beforeend" /* beforeend */, 'second');
    if (mergingTextDiv.childNodes.length === 2) {
        // It worked as expected, no fix required
        return false;
    }
    return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBhdC90ZXh0LW5vZGUtbWVyZ2luZy1maXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7UUF1Qk0sdUIsR0FBQSx1Qjs7QUFYTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ00sU0FBQSx1QkFBQSxDQUFBLFFBQUEsRUFBQSxRQUFBLEVBRTBCO0FBRTlCLFFBQUksQ0FBSixRQUFBLEVBQWUsT0FBQSxRQUFBO0FBRWYsUUFBSSxDQUFDLGVBQUwsUUFBSyxDQUFMLEVBQStCO0FBQzdCLGVBQUEsUUFBQTtBQUNEO0FBRUQsV0FBTyxNQUFBLGdDQUFBLFNBQUEsUUFBQSxDQUF1RDtBQUc1RCxvQkFBQSxRQUFBLEVBQW9DO0FBQ2xDLGtCQUFBLFFBQUE7QUFDQSxpQkFBQSxjQUFBLEdBQXNCLFNBQUEsYUFBQSxDQUF0QixFQUFzQixDQUF0QjtBQUNEO0FBRUQseUJBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQXFGO0FBQ25GLGdCQUFJLFNBQUosRUFBQSxFQUFpQjtBQUNmLHVCQUFPLE1BQUEsZ0JBQUEsQ0FBQSxNQUFBLEVBQUEsV0FBQSxFQUFQLElBQU8sQ0FBUDtBQUNEO0FBRUQsZ0JBQUksdUJBQUosS0FBQTtBQUVBLGdCQUFJLGVBQWUsY0FBYyxZQUFkLGVBQUEsR0FBNEMsT0FBL0QsU0FBQTtBQUVBLGdCQUFJLGdCQUFnQix3QkFBcEIsSUFBQSxFQUFrRDtBQUNoRCx1Q0FBQSxJQUFBO0FBQ0EsdUJBQUEsWUFBQSxDQUFvQixLQUFwQixjQUFBLEVBQUEsV0FBQTtBQUNEO0FBRUQsZ0JBQUksU0FBUyxNQUFBLGdCQUFBLENBQUEsTUFBQSxFQUFBLFdBQUEsRUFBYixJQUFhLENBQWI7QUFFQSxnQkFBQSxvQkFBQSxFQUEwQjtBQUN4Qix1QkFBQSxXQUFBLENBQW1CLEtBQW5CLGNBQUE7QUFDRDtBQUVELG1CQUFBLE1BQUE7QUFDRDtBQTdCMkQsS0FBOUQ7QUErQkQ7QUFFRCxTQUFBLGNBQUEsQ0FBQSxRQUFBLEVBQWdEO0FBQzlDLFFBQUksaUJBQWlCLFNBQUEsYUFBQSxDQUFyQixLQUFxQixDQUFyQjtBQUVBLG1CQUFBLFdBQUEsQ0FBMkIsU0FBQSxjQUFBLENBQTNCLE9BQTJCLENBQTNCO0FBQ0EsbUJBQUEsa0JBQUEsQ0FBQSxXQUFBLENBQUEsZUFBQSxFQUFBLFFBQUE7QUFFQSxRQUFJLGVBQUEsVUFBQSxDQUFBLE1BQUEsS0FBSixDQUFBLEVBQTRDO0FBQzFDO0FBQ0EsZUFBQSxLQUFBO0FBQ0Q7QUFFRCxXQUFBLElBQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJvdW5kcyB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQge1xuICBTaW1wbGVEb2N1bWVudCxcbiAgU2ltcGxlQ29tbWVudCxcbiAgSW5zZXJ0UG9zaXRpb24sXG4gIFNpbXBsZUVsZW1lbnQsXG4gIFNpbXBsZU5vZGUsXG59IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBET01PcGVyYXRpb25zIH0gZnJvbSAnLi4vZG9tL29wZXJhdGlvbnMnO1xuXG4vLyBQYXRjaDogICAgQWRqYWNlbnQgdGV4dCBub2RlIG1lcmdpbmcgZml4XG4vLyBCcm93c2VyczogSUUsIEVkZ2UsIEZpcmVmb3ggdy9vIGluc3BlY3RvciBvcGVuXG4vLyBSZWFzb246ICAgVGhlc2UgYnJvd3NlcnMgd2lsbCBtZXJnZSBhZGphY2VudCB0ZXh0IG5vZGVzLiBGb3IgZXhtYXBsZSBnaXZlblxuLy8gICAgICAgICAgIDxkaXY+SGVsbG88L2Rpdj4gd2l0aCBkaXYuaW5zZXJ0QWRqYWNlbnRIVE1MKCcgd29ybGQnKSBicm93c2Vyc1xuLy8gICAgICAgICAgIHdpdGggcHJvcGVyIGJlaGF2aW9yIHdpbGwgcG9wdWxhdGUgZGl2LmNoaWxkTm9kZXMgd2l0aCB0d28gaXRlbXMuXG4vLyAgICAgICAgICAgVGhlc2UgYnJvd3NlcnMgd2lsbCBwb3B1bGF0ZSBpdCB3aXRoIG9uZSBtZXJnZWQgbm9kZSBpbnN0ZWFkLlxuLy8gRml4OiAgICAgIEFkZCB0aGVzZSBub2RlcyB0byBhIHdyYXBwZXIgZWxlbWVudCwgdGhlbiBpdGVyYXRlIHRoZSBjaGlsZE5vZGVzXG4vLyAgICAgICAgICAgb2YgdGhhdCB3cmFwcGVyIGFuZCBtb3ZlIHRoZSBub2RlcyB0byB0aGVpciB0YXJnZXQgbG9jYXRpb24uIE5vdGVcbi8vICAgICAgICAgICB0aGF0IHBvdGVudGlhbCBTVkcgYnVncyB3aWxsIGhhdmUgYmVlbiBoYW5kbGVkIGJlZm9yZSB0aGlzIGZpeC5cbi8vICAgICAgICAgICBOb3RlIHRoYXQgdGhpcyBmaXggbXVzdCBvbmx5IGFwcGx5IHRvIHRoZSBwcmV2aW91cyB0ZXh0IG5vZGUsIGFzXG4vLyAgICAgICAgICAgdGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGluc2VydEhUTUxCZWZvcmVgIGFscmVhZHkgaGFuZGxlc1xuLy8gICAgICAgICAgIGZvbGxvd2luZyB0ZXh0IG5vZGVzIGNvcnJlY3RseS5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVRleHROb2RlTWVyZ2luZ0ZpeChcbiAgZG9jdW1lbnQ6IE9wdGlvbjxTaW1wbGVEb2N1bWVudD4sXG4gIERPTUNsYXNzOiB0eXBlb2YgRE9NT3BlcmF0aW9uc1xuKTogdHlwZW9mIERPTU9wZXJhdGlvbnMge1xuICBpZiAoIWRvY3VtZW50KSByZXR1cm4gRE9NQ2xhc3M7XG5cbiAgaWYgKCFzaG91bGRBcHBseUZpeChkb2N1bWVudCkpIHtcbiAgICByZXR1cm4gRE9NQ2xhc3M7XG4gIH1cblxuICByZXR1cm4gY2xhc3MgRE9NQ2hhbmdlc1dpdGhUZXh0Tm9kZU1lcmdpbmdGaXggZXh0ZW5kcyBET01DbGFzcyB7XG4gICAgcHJpdmF0ZSB1c2VsZXNzQ29tbWVudDogU2ltcGxlQ29tbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCkge1xuICAgICAgc3VwZXIoZG9jdW1lbnQpO1xuICAgICAgdGhpcy51c2VsZXNzQ29tbWVudCA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpO1xuICAgIH1cblxuICAgIGluc2VydEhUTUxCZWZvcmUocGFyZW50OiBTaW1wbGVFbGVtZW50LCBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+LCBodG1sOiBzdHJpbmcpOiBCb3VuZHMge1xuICAgICAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5pbnNlcnRIVE1MQmVmb3JlKHBhcmVudCwgbmV4dFNpYmxpbmcsIGh0bWwpO1xuICAgICAgfVxuXG4gICAgICBsZXQgZGlkU2V0VXNlbGVzc0NvbW1lbnQgPSBmYWxzZTtcblxuICAgICAgbGV0IG5leHRQcmV2aW91cyA9IG5leHRTaWJsaW5nID8gbmV4dFNpYmxpbmcucHJldmlvdXNTaWJsaW5nIDogcGFyZW50Lmxhc3RDaGlsZDtcblxuICAgICAgaWYgKG5leHRQcmV2aW91cyAmJiBuZXh0UHJldmlvdXMgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgIGRpZFNldFVzZWxlc3NDb21tZW50ID0gdHJ1ZTtcbiAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZSh0aGlzLnVzZWxlc3NDb21tZW50LCBuZXh0U2libGluZyk7XG4gICAgICB9XG5cbiAgICAgIGxldCBib3VuZHMgPSBzdXBlci5pbnNlcnRIVE1MQmVmb3JlKHBhcmVudCwgbmV4dFNpYmxpbmcsIGh0bWwpO1xuXG4gICAgICBpZiAoZGlkU2V0VXNlbGVzc0NvbW1lbnQpIHtcbiAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMudXNlbGVzc0NvbW1lbnQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkQXBwbHlGaXgoZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50KSB7XG4gIGxldCBtZXJnaW5nVGV4dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gIG1lcmdpbmdUZXh0RGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdmaXJzdCcpKTtcbiAgbWVyZ2luZ1RleHREaXYuaW5zZXJ0QWRqYWNlbnRIVE1MKEluc2VydFBvc2l0aW9uLmJlZm9yZWVuZCwgJ3NlY29uZCcpO1xuXG4gIGlmIChtZXJnaW5nVGV4dERpdi5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMikge1xuICAgIC8vIEl0IHdvcmtlZCBhcyBleHBlY3RlZCwgbm8gZml4IHJlcXVpcmVkXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9