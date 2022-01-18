import { ConcreteBounds } from '../bounds';

// http://www.w3.org/TR/html/syntax.html#html-integration-point
const SVG_INTEGRATION_POINTS = { foreignObject: 1, desc: 1, title: 1 };
// http://www.w3.org/TR/html/syntax.html#adjust-svg-attributes
// TODO: Adjust SVG attributes
// http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
// TODO: Adjust SVG elements
// http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
export const BLACKLIST_TABLE = Object.create(null);
export class DOMOperations {
    constructor(document) {
        this.document = document;
        this.setupUselessElement();
    }
    // split into seperate method so that NodeDOMTreeConstruction
    // can override it.
    setupUselessElement() {
        this.uselessElement = this.document.createElement('div');
    }
    createElement(tag, context) {
        let isElementInSVGNamespace, isHTMLIntegrationPoint;
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
                throw new Error(`Cannot create a ${tag} inside an SVG context`);
            }
            return this.document.createElementNS("http://www.w3.org/2000/svg" /* SVG */, tag);
        } else {
            return this.document.createElement(tag);
        }
    }
    insertBefore(parent, node, reference) {
        parent.insertBefore(node, reference);
    }
    insertHTMLBefore(parent, nextSibling, html) {
        if (html === '') {
            let comment = this.createComment('');
            parent.insertBefore(comment, nextSibling);
            return new ConcreteBounds(parent, comment, comment);
        }
        let prev = nextSibling ? nextSibling.previousSibling : parent.lastChild;
        let last;
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
            let { uselessElement } = this;
            parent.insertBefore(uselessElement, nextSibling);
            uselessElement.insertAdjacentHTML("beforebegin" /* beforebegin */, html);
            last = uselessElement.previousSibling;
            parent.removeChild(uselessElement);
        }
        let first = prev ? prev.nextSibling : parent.firstChild;
        return new ConcreteBounds(parent, first, last);
    }
    createTextNode(text) {
        return this.document.createTextNode(text);
    }
    createComment(data) {
        return this.document.createComment(data);
    }
}
export function moveNodesBefore(source, target, nextSibling) {
    let first = source.firstChild;
    let last = first;
    let current = first;
    while (current) {
        let next = current.nextSibling;
        target.insertBefore(current, nextSibling);
        last = current;
        current = next;
    }
    return new ConcreteBounds(target, first, last);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2RvbS9vcGVyYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVVBLFNBQVMsY0FBVCxRQUErQixXQUEvQjs7QUFHQTtBQUNBLE1BQU0seUJBQXlCLEVBQUUsZUFBZSxDQUFqQixFQUFvQixNQUFNLENBQTFCLEVBQTZCLE9BQU8sQ0FBcEMsRUFBL0I7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0EsT0FBTyxNQUFNLGtCQUFrQixPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQXhCO0FBRVAsT0FBTSxNQUFPLGFBQVAsQ0FBb0I7QUFHeEIsZ0JBQXNCLFFBQXRCLEVBQThDO0FBQXhCLGFBQUEsUUFBQSxHQUFBLFFBQUE7QUFDcEIsYUFBSyxtQkFBTDtBQUNEO0FBRUQ7QUFDQTtBQUNVLDBCQUFtQjtBQUMzQixhQUFLLGNBQUwsR0FBc0IsS0FBSyxRQUFMLENBQWMsYUFBZCxDQUE0QixLQUE1QixDQUF0QjtBQUNEO0FBRUQsa0JBQWMsR0FBZCxFQUEyQixPQUEzQixFQUFrRDtBQUNoRCxZQUFJLHVCQUFKLEVBQXNDLHNCQUF0QztBQUVBLFlBQUksT0FBSixFQUFhO0FBQ1gsc0NBQTBCLFFBQVEsWUFBUixLQUFvQiw0QkFBcEIsQ0FBb0IsU0FBcEIsSUFBMEMsUUFBUSxLQUE1RTtBQUNBLHFDQUF5QixDQUFDLENBQUUsdUJBQXdDLFFBQVEsT0FBaEQsQ0FBNUI7QUFDRCxTQUhELE1BR087QUFDTCxzQ0FBMEIsUUFBUSxLQUFsQztBQUNBLHFDQUF5QixLQUF6QjtBQUNEO0FBRUQsWUFBSSwyQkFBMkIsQ0FBQyxzQkFBaEMsRUFBd0Q7QUFDdEQ7QUFDQTtBQUNBO0FBQ0EsZ0JBQUksZ0JBQWdCLEdBQWhCLENBQUosRUFBMEI7QUFDeEIsc0JBQU0sSUFBSSxLQUFKLENBQVUsbUJBQW1CLEdBQUcsd0JBQWhDLENBQU47QUFDRDtBQUVELG1CQUFPLEtBQUssUUFBTCxDQUFjLGVBQWQsQ0FBNkIsNEJBQTdCLENBQTZCLFNBQTdCLEVBQTZDLEdBQTdDLENBQVA7QUFDRCxTQVRELE1BU087QUFDTCxtQkFBTyxLQUFLLFFBQUwsQ0FBYyxhQUFkLENBQTRCLEdBQTVCLENBQVA7QUFDRDtBQUNGO0FBRUQsaUJBQWEsTUFBYixFQUFvQyxJQUFwQyxFQUFzRCxTQUF0RCxFQUFtRjtBQUNqRixlQUFPLFlBQVAsQ0FBb0IsSUFBcEIsRUFBMEIsU0FBMUI7QUFDRDtBQUVELHFCQUFpQixNQUFqQixFQUF3QyxXQUF4QyxFQUF5RSxJQUF6RSxFQUFxRjtBQUNuRixZQUFJLFNBQVMsRUFBYixFQUFpQjtBQUNmLGdCQUFJLFVBQVUsS0FBSyxhQUFMLENBQW1CLEVBQW5CLENBQWQ7QUFDQSxtQkFBTyxZQUFQLENBQW9CLE9BQXBCLEVBQTZCLFdBQTdCO0FBQ0EsbUJBQU8sSUFBSSxjQUFKLENBQW1CLE1BQW5CLEVBQTJCLE9BQTNCLEVBQW9DLE9BQXBDLENBQVA7QUFDRDtBQUVELFlBQUksT0FBTyxjQUFjLFlBQVksZUFBMUIsR0FBNEMsT0FBTyxTQUE5RDtBQUNBLFlBQUksSUFBSjtBQUVBLFlBQUksZ0JBQWdCLElBQXBCLEVBQTBCO0FBQ3hCLG1CQUFPLGtCQUFQLENBQXlCLFdBQXpCLENBQXlCLGVBQXpCLEVBQW9ELElBQXBEO0FBQ0EsbUJBQWMsT0FBTyxTQUFyQjtBQUNELFNBSEQsTUFHTyxJQUFJLHVCQUF1QixXQUEzQixFQUF3QztBQUM3Qyx3QkFBWSxrQkFBWixDQUErQixhQUEvQixFQUE4QyxJQUE5QztBQUNBLG1CQUFjLFlBQVksZUFBMUI7QUFDRCxTQUhNLE1BR0E7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQUksRUFBRSxjQUFGLEtBQXFCLElBQXpCO0FBRUEsbUJBQU8sWUFBUCxDQUFvQixjQUFwQixFQUFvQyxXQUFwQztBQUNBLDJCQUFlLGtCQUFmLENBQWlDLGFBQWpDLENBQWlDLGlCQUFqQyxFQUE4RCxJQUE5RDtBQUNBLG1CQUFjLGVBQWUsZUFBN0I7QUFDQSxtQkFBTyxXQUFQLENBQW1CLGNBQW5CO0FBQ0Q7QUFFRCxZQUFJLFFBQWUsT0FBTyxLQUFLLFdBQVosR0FBMEIsT0FBTyxVQUFwRDtBQUNBLGVBQU8sSUFBSSxjQUFKLENBQW1CLE1BQW5CLEVBQTJCLEtBQTNCLEVBQWtDLElBQWxDLENBQVA7QUFDRDtBQUVELG1CQUFlLElBQWYsRUFBMkI7QUFDekIsZUFBTyxLQUFLLFFBQUwsQ0FBYyxjQUFkLENBQTZCLElBQTdCLENBQVA7QUFDRDtBQUVELGtCQUFjLElBQWQsRUFBMEI7QUFDeEIsZUFBTyxLQUFLLFFBQUwsQ0FBYyxhQUFkLENBQTRCLElBQTVCLENBQVA7QUFDRDtBQWxGdUI7QUFxRjFCLE9BQU0sU0FBVSxlQUFWLENBQ0osTUFESSxFQUVKLE1BRkksRUFHSixXQUhJLEVBRzJCO0FBRS9CLFFBQUksUUFBZSxPQUFPLFVBQTFCO0FBQ0EsUUFBSSxPQUFtQixLQUF2QjtBQUNBLFFBQUksVUFBOEIsS0FBbEM7QUFFQSxXQUFPLE9BQVAsRUFBZ0I7QUFDZCxZQUFJLE9BQTJCLFFBQVEsV0FBdkM7QUFFQSxlQUFPLFlBQVAsQ0FBb0IsT0FBcEIsRUFBNkIsV0FBN0I7QUFFQSxlQUFPLE9BQVA7QUFDQSxrQkFBVSxJQUFWO0FBQ0Q7QUFFRCxXQUFPLElBQUksY0FBSixDQUFtQixNQUFuQixFQUEyQixLQUEzQixFQUFrQyxJQUFsQyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBTaW1wbGVFbGVtZW50LFxuICBTaW1wbGVEb2N1bWVudCxcbiAgTmFtZXNwYWNlLFxuICBTaW1wbGVOb2RlLFxuICBJbnNlcnRQb3NpdGlvbixcbiAgU2ltcGxlVGV4dCxcbiAgU2ltcGxlQ29tbWVudCxcbn0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IERpY3QsIE9wdGlvbiwgQm91bmRzIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBDb25jcmV0ZUJvdW5kcyB9IGZyb20gJy4uL2JvdW5kcyc7XG5pbXBvcnQgeyBleHBlY3QgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcblxuLy8gaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbC9zeW50YXguaHRtbCNodG1sLWludGVncmF0aW9uLXBvaW50XG5jb25zdCBTVkdfSU5URUdSQVRJT05fUE9JTlRTID0geyBmb3JlaWduT2JqZWN0OiAxLCBkZXNjOiAxLCB0aXRsZTogMSB9O1xuXG4vLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sL3N5bnRheC5odG1sI2FkanVzdC1zdmctYXR0cmlidXRlc1xuLy8gVE9ETzogQWRqdXN0IFNWRyBhdHRyaWJ1dGVzXG5cbi8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWwvc3ludGF4Lmh0bWwjcGFyc2luZy1tYWluLWluZm9yZWlnblxuLy8gVE9ETzogQWRqdXN0IFNWRyBlbGVtZW50c1xuXG4vLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sL3N5bnRheC5odG1sI3BhcnNpbmctbWFpbi1pbmZvcmVpZ25cbmV4cG9ydCBjb25zdCBCTEFDS0xJU1RfVEFCTEUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5leHBvcnQgY2xhc3MgRE9NT3BlcmF0aW9ucyB7XG4gIHByb3RlY3RlZCB1c2VsZXNzRWxlbWVudCE6IFNpbXBsZUVsZW1lbnQ7IC8vIFNldCBieSB0aGlzLnNldHVwVXNlbGVzc0VsZW1lbnQoKSBpbiBjb25zdHJ1Y3RvclxuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQpIHtcbiAgICB0aGlzLnNldHVwVXNlbGVzc0VsZW1lbnQoKTtcbiAgfVxuXG4gIC8vIHNwbGl0IGludG8gc2VwZXJhdGUgbWV0aG9kIHNvIHRoYXQgTm9kZURPTVRyZWVDb25zdHJ1Y3Rpb25cbiAgLy8gY2FuIG92ZXJyaWRlIGl0LlxuICBwcm90ZWN0ZWQgc2V0dXBVc2VsZXNzRWxlbWVudCgpIHtcbiAgICB0aGlzLnVzZWxlc3NFbGVtZW50ID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgfVxuXG4gIGNyZWF0ZUVsZW1lbnQodGFnOiBzdHJpbmcsIGNvbnRleHQ/OiBTaW1wbGVFbGVtZW50KTogU2ltcGxlRWxlbWVudCB7XG4gICAgbGV0IGlzRWxlbWVudEluU1ZHTmFtZXNwYWNlOiBib29sZWFuLCBpc0hUTUxJbnRlZ3JhdGlvblBvaW50OiBib29sZWFuO1xuXG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIGlzRWxlbWVudEluU1ZHTmFtZXNwYWNlID0gY29udGV4dC5uYW1lc3BhY2VVUkkgPT09IE5hbWVzcGFjZS5TVkcgfHwgdGFnID09PSAnc3ZnJztcbiAgICAgIGlzSFRNTEludGVncmF0aW9uUG9pbnQgPSAhIShTVkdfSU5URUdSQVRJT05fUE9JTlRTIGFzIERpY3Q8bnVtYmVyPilbY29udGV4dC50YWdOYW1lXTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNFbGVtZW50SW5TVkdOYW1lc3BhY2UgPSB0YWcgPT09ICdzdmcnO1xuICAgICAgaXNIVE1MSW50ZWdyYXRpb25Qb2ludCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChpc0VsZW1lbnRJblNWR05hbWVzcGFjZSAmJiAhaXNIVE1MSW50ZWdyYXRpb25Qb2ludCkge1xuICAgICAgLy8gRklYTUU6IFRoaXMgZG9lcyBub3QgcHJvcGVybHkgaGFuZGxlIDxmb250PiB3aXRoIGNvbG9yLCBmYWNlLCBvclxuICAgICAgLy8gc2l6ZSBhdHRyaWJ1dGVzLCB3aGljaCBpcyBhbHNvIGRpc2FsbG93ZWQgYnkgdGhlIHNwZWMuIFdlIHNob3VsZCBmaXhcbiAgICAgIC8vIHRoaXMuXG4gICAgICBpZiAoQkxBQ0tMSVNUX1RBQkxFW3RhZ10pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY3JlYXRlIGEgJHt0YWd9IGluc2lkZSBhbiBTVkcgY29udGV4dGApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoTmFtZXNwYWNlLlNWRywgdGFnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgIH1cbiAgfVxuXG4gIGluc2VydEJlZm9yZShwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsIG5vZGU6IFNpbXBsZU5vZGUsIHJlZmVyZW5jZTogT3B0aW9uPFNpbXBsZU5vZGU+KSB7XG4gICAgcGFyZW50Lmluc2VydEJlZm9yZShub2RlLCByZWZlcmVuY2UpO1xuICB9XG5cbiAgaW5zZXJ0SFRNTEJlZm9yZShwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsIG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT4sIGh0bWw6IHN0cmluZyk6IEJvdW5kcyB7XG4gICAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgICBsZXQgY29tbWVudCA9IHRoaXMuY3JlYXRlQ29tbWVudCgnJyk7XG4gICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNvbW1lbnQsIG5leHRTaWJsaW5nKTtcbiAgICAgIHJldHVybiBuZXcgQ29uY3JldGVCb3VuZHMocGFyZW50LCBjb21tZW50LCBjb21tZW50KTtcbiAgICB9XG5cbiAgICBsZXQgcHJldiA9IG5leHRTaWJsaW5nID8gbmV4dFNpYmxpbmcucHJldmlvdXNTaWJsaW5nIDogcGFyZW50Lmxhc3RDaGlsZDtcbiAgICBsZXQgbGFzdDogU2ltcGxlTm9kZTtcblxuICAgIGlmIChuZXh0U2libGluZyA9PT0gbnVsbCkge1xuICAgICAgcGFyZW50Lmluc2VydEFkamFjZW50SFRNTChJbnNlcnRQb3NpdGlvbi5iZWZvcmVlbmQsIGh0bWwpO1xuICAgICAgbGFzdCA9IGV4cGVjdChwYXJlbnQubGFzdENoaWxkLCAnYnVnIGluIGluc2VydEFkamFjZW50SFRNTD8nKTtcbiAgICB9IGVsc2UgaWYgKG5leHRTaWJsaW5nIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgIG5leHRTaWJsaW5nLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlYmVnaW4nLCBodG1sKTtcbiAgICAgIGxhc3QgPSBleHBlY3QobmV4dFNpYmxpbmcucHJldmlvdXNTaWJsaW5nLCAnYnVnIGluIGluc2VydEFkamFjZW50SFRNTD8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm9uLWVsZW1lbnQgbm9kZXMgZG8gbm90IHN1cHBvcnQgaW5zZXJ0QWRqYWNlbnRIVE1MLCBzbyBhZGQgYW5cbiAgICAgIC8vIGVsZW1lbnQgYW5kIGNhbGwgaXQgb24gdGhhdCBlbGVtZW50LiBUaGVuIHJlbW92ZSB0aGUgZWxlbWVudC5cbiAgICAgIC8vXG4gICAgICAvLyBUaGlzIGFsc28gcHJvdGVjdHMgRWRnZSwgSUUgYW5kIEZpcmVmb3ggdy9vIHRoZSBpbnNwZWN0b3Igb3BlblxuICAgICAgLy8gZnJvbSBtZXJnaW5nIGFkamFjZW50IHRleHQgbm9kZXMuIFNlZSAuL2NvbXBhdC90ZXh0LW5vZGUtbWVyZ2luZy1maXgudHNcbiAgICAgIGxldCB7IHVzZWxlc3NFbGVtZW50IH0gPSB0aGlzO1xuXG4gICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKHVzZWxlc3NFbGVtZW50LCBuZXh0U2libGluZyk7XG4gICAgICB1c2VsZXNzRWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoSW5zZXJ0UG9zaXRpb24uYmVmb3JlYmVnaW4sIGh0bWwpO1xuICAgICAgbGFzdCA9IGV4cGVjdCh1c2VsZXNzRWxlbWVudC5wcmV2aW91c1NpYmxpbmcsICdidWcgaW4gaW5zZXJ0QWRqYWNlbnRIVE1MPycpO1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKHVzZWxlc3NFbGVtZW50KTtcbiAgICB9XG5cbiAgICBsZXQgZmlyc3QgPSBleHBlY3QocHJldiA/IHByZXYubmV4dFNpYmxpbmcgOiBwYXJlbnQuZmlyc3RDaGlsZCwgJ2J1ZyBpbiBpbnNlcnRBZGphY2VudEhUTUw/Jyk7XG4gICAgcmV0dXJuIG5ldyBDb25jcmV0ZUJvdW5kcyhwYXJlbnQsIGZpcnN0LCBsYXN0KTtcbiAgfVxuXG4gIGNyZWF0ZVRleHROb2RlKHRleHQ6IHN0cmluZyk6IFNpbXBsZVRleHQge1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xuICB9XG5cbiAgY3JlYXRlQ29tbWVudChkYXRhOiBzdHJpbmcpOiBTaW1wbGVDb21tZW50IHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVDb21tZW50KGRhdGEpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlTm9kZXNCZWZvcmUoXG4gIHNvdXJjZTogU2ltcGxlTm9kZSxcbiAgdGFyZ2V0OiBTaW1wbGVFbGVtZW50LFxuICBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+XG4pOiBCb3VuZHMge1xuICBsZXQgZmlyc3QgPSBleHBlY3Qoc291cmNlLmZpcnN0Q2hpbGQsICdzb3VyY2UgaXMgZW1wdHknKTtcbiAgbGV0IGxhc3Q6IFNpbXBsZU5vZGUgPSBmaXJzdDtcbiAgbGV0IGN1cnJlbnQ6IE9wdGlvbjxTaW1wbGVOb2RlPiA9IGZpcnN0O1xuXG4gIHdoaWxlIChjdXJyZW50KSB7XG4gICAgbGV0IG5leHQ6IE9wdGlvbjxTaW1wbGVOb2RlPiA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG5cbiAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKGN1cnJlbnQsIG5leHRTaWJsaW5nKTtcblxuICAgIGxhc3QgPSBjdXJyZW50O1xuICAgIGN1cnJlbnQgPSBuZXh0O1xuICB9XG5cbiAgcmV0dXJuIG5ldyBDb25jcmV0ZUJvdW5kcyh0YXJnZXQsIGZpcnN0LCBsYXN0KTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=