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
export function applyTextNodeMergingFix(document, DOMClass) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBhdC90ZXh0LW5vZGUtbWVyZ2luZy1maXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFNLFNBQVUsdUJBQVYsQ0FDSixRQURJLEVBRUosUUFGSSxFQUUwQjtBQUU5QixRQUFJLENBQUMsUUFBTCxFQUFlLE9BQU8sUUFBUDtBQUVmLFFBQUksQ0FBQyxlQUFlLFFBQWYsQ0FBTCxFQUErQjtBQUM3QixlQUFPLFFBQVA7QUFDRDtBQUVELFdBQU8sTUFBTSxnQ0FBTixTQUErQyxRQUEvQyxDQUF1RDtBQUc1RCxvQkFBWSxRQUFaLEVBQW9DO0FBQ2xDLGtCQUFNLFFBQU47QUFDQSxpQkFBSyxjQUFMLEdBQXNCLFNBQVMsYUFBVCxDQUF1QixFQUF2QixDQUF0QjtBQUNEO0FBRUQseUJBQWlCLE1BQWpCLEVBQXdDLFdBQXhDLEVBQXlFLElBQXpFLEVBQXFGO0FBQ25GLGdCQUFJLFNBQVMsRUFBYixFQUFpQjtBQUNmLHVCQUFPLE1BQU0sZ0JBQU4sQ0FBdUIsTUFBdkIsRUFBK0IsV0FBL0IsRUFBNEMsSUFBNUMsQ0FBUDtBQUNEO0FBRUQsZ0JBQUksdUJBQXVCLEtBQTNCO0FBRUEsZ0JBQUksZUFBZSxjQUFjLFlBQVksZUFBMUIsR0FBNEMsT0FBTyxTQUF0RTtBQUVBLGdCQUFJLGdCQUFnQix3QkFBd0IsSUFBNUMsRUFBa0Q7QUFDaEQsdUNBQXVCLElBQXZCO0FBQ0EsdUJBQU8sWUFBUCxDQUFvQixLQUFLLGNBQXpCLEVBQXlDLFdBQXpDO0FBQ0Q7QUFFRCxnQkFBSSxTQUFTLE1BQU0sZ0JBQU4sQ0FBdUIsTUFBdkIsRUFBK0IsV0FBL0IsRUFBNEMsSUFBNUMsQ0FBYjtBQUVBLGdCQUFJLG9CQUFKLEVBQTBCO0FBQ3hCLHVCQUFPLFdBQVAsQ0FBbUIsS0FBSyxjQUF4QjtBQUNEO0FBRUQsbUJBQU8sTUFBUDtBQUNEO0FBN0IyRCxLQUE5RDtBQStCRDtBQUVELFNBQVMsY0FBVCxDQUF3QixRQUF4QixFQUFnRDtBQUM5QyxRQUFJLGlCQUFpQixTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBckI7QUFFQSxtQkFBZSxXQUFmLENBQTJCLFNBQVMsY0FBVCxDQUF3QixPQUF4QixDQUEzQjtBQUNBLG1CQUFlLGtCQUFmLENBQWlDLFdBQWpDLENBQWlDLGVBQWpDLEVBQTRELFFBQTVEO0FBRUEsUUFBSSxlQUFlLFVBQWYsQ0FBMEIsTUFBMUIsS0FBcUMsQ0FBekMsRUFBNEM7QUFDMUM7QUFDQSxlQUFPLEtBQVA7QUFDRDtBQUVELFdBQU8sSUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQm91bmRzIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIFNpbXBsZURvY3VtZW50LFxuICBTaW1wbGVDb21tZW50LFxuICBJbnNlcnRQb3NpdGlvbixcbiAgU2ltcGxlRWxlbWVudCxcbiAgU2ltcGxlTm9kZSxcbn0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IERPTU9wZXJhdGlvbnMgfSBmcm9tICcuLi9kb20vb3BlcmF0aW9ucyc7XG5cbi8vIFBhdGNoOiAgICBBZGphY2VudCB0ZXh0IG5vZGUgbWVyZ2luZyBmaXhcbi8vIEJyb3dzZXJzOiBJRSwgRWRnZSwgRmlyZWZveCB3L28gaW5zcGVjdG9yIG9wZW5cbi8vIFJlYXNvbjogICBUaGVzZSBicm93c2VycyB3aWxsIG1lcmdlIGFkamFjZW50IHRleHQgbm9kZXMuIEZvciBleG1hcGxlIGdpdmVuXG4vLyAgICAgICAgICAgPGRpdj5IZWxsbzwvZGl2PiB3aXRoIGRpdi5pbnNlcnRBZGphY2VudEhUTUwoJyB3b3JsZCcpIGJyb3dzZXJzXG4vLyAgICAgICAgICAgd2l0aCBwcm9wZXIgYmVoYXZpb3Igd2lsbCBwb3B1bGF0ZSBkaXYuY2hpbGROb2RlcyB3aXRoIHR3byBpdGVtcy5cbi8vICAgICAgICAgICBUaGVzZSBicm93c2VycyB3aWxsIHBvcHVsYXRlIGl0IHdpdGggb25lIG1lcmdlZCBub2RlIGluc3RlYWQuXG4vLyBGaXg6ICAgICAgQWRkIHRoZXNlIG5vZGVzIHRvIGEgd3JhcHBlciBlbGVtZW50LCB0aGVuIGl0ZXJhdGUgdGhlIGNoaWxkTm9kZXNcbi8vICAgICAgICAgICBvZiB0aGF0IHdyYXBwZXIgYW5kIG1vdmUgdGhlIG5vZGVzIHRvIHRoZWlyIHRhcmdldCBsb2NhdGlvbi4gTm90ZVxuLy8gICAgICAgICAgIHRoYXQgcG90ZW50aWFsIFNWRyBidWdzIHdpbGwgaGF2ZSBiZWVuIGhhbmRsZWQgYmVmb3JlIHRoaXMgZml4LlxuLy8gICAgICAgICAgIE5vdGUgdGhhdCB0aGlzIGZpeCBtdXN0IG9ubHkgYXBwbHkgdG8gdGhlIHByZXZpb3VzIHRleHQgbm9kZSwgYXNcbi8vICAgICAgICAgICB0aGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgaW5zZXJ0SFRNTEJlZm9yZWAgYWxyZWFkeSBoYW5kbGVzXG4vLyAgICAgICAgICAgZm9sbG93aW5nIHRleHQgbm9kZXMgY29ycmVjdGx5LlxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5VGV4dE5vZGVNZXJnaW5nRml4KFxuICBkb2N1bWVudDogT3B0aW9uPFNpbXBsZURvY3VtZW50PixcbiAgRE9NQ2xhc3M6IHR5cGVvZiBET01PcGVyYXRpb25zXG4pOiB0eXBlb2YgRE9NT3BlcmF0aW9ucyB7XG4gIGlmICghZG9jdW1lbnQpIHJldHVybiBET01DbGFzcztcblxuICBpZiAoIXNob3VsZEFwcGx5Rml4KGRvY3VtZW50KSkge1xuICAgIHJldHVybiBET01DbGFzcztcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBET01DaGFuZ2VzV2l0aFRleHROb2RlTWVyZ2luZ0ZpeCBleHRlbmRzIERPTUNsYXNzIHtcbiAgICBwcml2YXRlIHVzZWxlc3NDb21tZW50OiBTaW1wbGVDb21tZW50O1xuXG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50KSB7XG4gICAgICBzdXBlcihkb2N1bWVudCk7XG4gICAgICB0aGlzLnVzZWxlc3NDb21tZW50ID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJyk7XG4gICAgfVxuXG4gICAgaW5zZXJ0SFRNTEJlZm9yZShwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsIG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT4sIGh0bWw6IHN0cmluZyk6IEJvdW5kcyB7XG4gICAgICBpZiAoaHRtbCA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmluc2VydEhUTUxCZWZvcmUocGFyZW50LCBuZXh0U2libGluZywgaHRtbCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBkaWRTZXRVc2VsZXNzQ29tbWVudCA9IGZhbHNlO1xuXG4gICAgICBsZXQgbmV4dFByZXZpb3VzID0gbmV4dFNpYmxpbmcgPyBuZXh0U2libGluZy5wcmV2aW91c1NpYmxpbmcgOiBwYXJlbnQubGFzdENoaWxkO1xuXG4gICAgICBpZiAobmV4dFByZXZpb3VzICYmIG5leHRQcmV2aW91cyBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICAgICAgZGlkU2V0VXNlbGVzc0NvbW1lbnQgPSB0cnVlO1xuICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKHRoaXMudXNlbGVzc0NvbW1lbnQsIG5leHRTaWJsaW5nKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGJvdW5kcyA9IHN1cGVyLmluc2VydEhUTUxCZWZvcmUocGFyZW50LCBuZXh0U2libGluZywgaHRtbCk7XG5cbiAgICAgIGlmIChkaWRTZXRVc2VsZXNzQ29tbWVudCkge1xuICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcy51c2VsZXNzQ29tbWVudCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBzaG91bGRBcHBseUZpeChkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQpIHtcbiAgbGV0IG1lcmdpbmdUZXh0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgbWVyZ2luZ1RleHREaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ2ZpcnN0JykpO1xuICBtZXJnaW5nVGV4dERpdi5pbnNlcnRBZGphY2VudEhUTUwoSW5zZXJ0UG9zaXRpb24uYmVmb3JlZW5kLCAnc2Vjb25kJyk7XG5cbiAgaWYgKG1lcmdpbmdUZXh0RGl2LmNoaWxkTm9kZXMubGVuZ3RoID09PSAyKSB7XG4gICAgLy8gSXQgd29ya2VkIGFzIGV4cGVjdGVkLCBubyBmaXggcmVxdWlyZWRcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=