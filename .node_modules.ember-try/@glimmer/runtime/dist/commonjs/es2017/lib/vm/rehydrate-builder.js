'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RehydrateBuilder = exports.RehydratingCursor = exports.SERIALIZATION_FIRST_NODE_STRING = undefined;
exports.isSerializationFirstNode = isSerializationFirstNode;
exports.rehydrationBuilder = rehydrationBuilder;

var _util = require('@glimmer/util');

var _bounds = require('../bounds');

var _elementBuilder = require('./element-builder');

const SERIALIZATION_FIRST_NODE_STRING = exports.SERIALIZATION_FIRST_NODE_STRING = '%+b:0%';
function isSerializationFirstNode(node) {
    return node.nodeValue === SERIALIZATION_FIRST_NODE_STRING;
}
class RehydratingCursor extends _bounds.CursorImpl {
    constructor(element, nextSibling, startingBlockDepth) {
        super(element, nextSibling);
        this.startingBlockDepth = startingBlockDepth;
        this.candidate = null;
        this.injectedOmittedNode = false;
        this.openBlockDepth = startingBlockDepth - 1;
    }
}
exports.RehydratingCursor = RehydratingCursor;
class RehydrateBuilder extends _elementBuilder.NewElementBuilder {
    // private candidate: Option<SimpleNode> = null;
    constructor(env, parentNode, nextSibling) {
        super(env, parentNode, nextSibling);
        this.unmatchedAttributes = null;
        this.blockDepth = 0;
        if (nextSibling) throw new Error('Rehydration with nextSibling not supported');
        let node = this.currentCursor.element.firstChild;
        while (node !== null) {
            if (isComment(node) && isSerializationFirstNode(node)) {
                break;
            }
            node = node.nextSibling;
        }
        false && (0, _util.assert)(node, `Must have opening comment <!--${SERIALIZATION_FIRST_NODE_STRING}--> for rehydration.`);

        this.candidate = node;
    }
    get currentCursor() {
        return this[_elementBuilder.CURSOR_STACK].current;
    }
    get candidate() {
        if (this.currentCursor) {
            return this.currentCursor.candidate;
        }
        return null;
    }
    set candidate(node) {
        this.currentCursor.candidate = node;
    }
    pushElement(element, nextSibling = null) {
        let { blockDepth = 0 } = this;
        let cursor = new RehydratingCursor(element, nextSibling, blockDepth);
        let currentCursor = this.currentCursor;
        if (currentCursor) {
            if (currentCursor.candidate) {
                /**
                 * <div>   <---------------  currentCursor.element
                 *   <!--%+b:1%-->
                 *   <div> <---------------  currentCursor.candidate -> cursor.element
                 *     <!--%+b:2%--> <-  currentCursor.candidate.firstChild -> cursor.candidate
                 *     Foo
                 *     <!--%-b:2%-->
                 *   </div>
                 *   <!--%-b:1%-->  <--  becomes currentCursor.candidate
                 */
                // where to rehydrate from if we are in rehydration mode
                cursor.candidate = element.firstChild;
                // where to continue when we pop
                currentCursor.candidate = element.nextSibling;
            }
        }
        this[_elementBuilder.CURSOR_STACK].push(cursor);
    }
    clearMismatch(candidate) {
        let current = candidate;
        let currentCursor = this.currentCursor;
        if (currentCursor !== null) {
            let openBlockDepth = currentCursor.openBlockDepth;
            if (openBlockDepth >= currentCursor.startingBlockDepth) {
                while (current && !(isComment(current) && getCloseBlockDepth(current) === openBlockDepth)) {
                    current = this.remove(current);
                }
                false && (0, _util.assert)(current !== null, 'should have found closing block');
            } else {
                while (current !== null) {
                    current = this.remove(current);
                }
            }
            // current cursor parentNode should be openCandidate if element
            // or openCandidate.parentNode if comment
            currentCursor.nextSibling = current;
            // disable rehydration until we popElement or closeBlock for openBlockDepth
            currentCursor.candidate = null;
        }
    }
    __openBlock() {
        let { currentCursor } = this;
        if (currentCursor === null) return;
        let blockDepth = this.blockDepth;
        this.blockDepth++;
        let { candidate } = currentCursor;
        if (candidate === null) return;
        let { tagName } = currentCursor.element;
        if (isComment(candidate) && getOpenBlockDepth(candidate) === blockDepth) {
            currentCursor.candidate = this.remove(candidate);
            currentCursor.openBlockDepth = blockDepth;
        } else if (tagName !== 'TITLE' && tagName !== 'SCRIPT' && tagName !== 'STYLE') {
            this.clearMismatch(candidate);
        }
    }
    __closeBlock() {
        let { currentCursor } = this;
        if (currentCursor === null) return;
        // openBlock is the last rehydrated open block
        let openBlockDepth = currentCursor.openBlockDepth;
        // this currently is the expected next open block depth
        this.blockDepth--;
        let { candidate } = currentCursor;
        // rehydrating
        if (candidate !== null) {
            false && (0, _util.assert)(openBlockDepth === this.blockDepth, 'when rehydrating, openBlockDepth should match this.blockDepth here');

            if (isComment(candidate) && getCloseBlockDepth(candidate) === openBlockDepth) {
                currentCursor.candidate = this.remove(candidate);
                currentCursor.openBlockDepth--;
            } else {
                this.clearMismatch(candidate);
            }
            // if the openBlockDepth matches the blockDepth we just closed to
            // then restore rehydration
        }
        if (currentCursor.openBlockDepth === this.blockDepth) {
            false && (0, _util.assert)(currentCursor.nextSibling !== null && isComment(currentCursor.nextSibling) && getCloseBlockDepth(currentCursor.nextSibling) === openBlockDepth, 'expected close block to match rehydrated open block');

            currentCursor.candidate = this.remove(currentCursor.nextSibling);
            currentCursor.openBlockDepth--;
        }
    }
    __appendNode(node) {
        let { candidate } = this;
        // This code path is only used when inserting precisely one node. It needs more
        // comparison logic, but we can probably lean on the cases where this code path
        // is actually used.
        if (candidate) {
            return candidate;
        } else {
            return super.__appendNode(node);
        }
    }
    __appendHTML(html) {
        let candidateBounds = this.markerBounds();
        if (candidateBounds) {
            let first = candidateBounds.firstNode();
            let last = candidateBounds.lastNode();
            let newBounds = new _bounds.ConcreteBounds(this.element, first.nextSibling, last.previousSibling);
            let possibleEmptyMarker = this.remove(first);
            this.remove(last);
            if (possibleEmptyMarker !== null && isEmpty(possibleEmptyMarker)) {
                this.candidate = this.remove(possibleEmptyMarker);
                if (this.candidate !== null) {
                    this.clearMismatch(this.candidate);
                }
            }
            return newBounds;
        } else {
            return super.__appendHTML(html);
        }
    }
    remove(node) {
        let element = node.parentNode;
        let next = node.nextSibling;
        element.removeChild(node);
        return next;
    }
    markerBounds() {
        let _candidate = this.candidate;
        if (_candidate && isMarker(_candidate)) {
            let first = _candidate;
            let last = first.nextSibling;
            while (last && !isMarker(last)) {
                last = last.nextSibling;
            }
            return new _bounds.ConcreteBounds(this.element, first, last);
        } else {
            return null;
        }
    }
    __appendText(string) {
        let { candidate } = this;
        if (candidate) {
            if (isTextNode(candidate)) {
                if (candidate.nodeValue !== string) {
                    candidate.nodeValue = string;
                }
                this.candidate = candidate.nextSibling;
                return candidate;
            } else if (candidate && (isSeparator(candidate) || isEmpty(candidate))) {
                this.candidate = candidate.nextSibling;
                this.remove(candidate);
                return this.__appendText(string);
            } else if (isEmpty(candidate)) {
                let next = this.remove(candidate);
                this.candidate = next;
                let text = this.dom.createTextNode(string);
                this.dom.insertBefore(this.element, text, next);
                return text;
            } else {
                this.clearMismatch(candidate);
                return super.__appendText(string);
            }
        } else {
            return super.__appendText(string);
        }
    }
    __appendComment(string) {
        let _candidate = this.candidate;
        if (_candidate && isComment(_candidate)) {
            if (_candidate.nodeValue !== string) {
                _candidate.nodeValue = string;
            }
            this.candidate = _candidate.nextSibling;
            return _candidate;
        } else if (_candidate) {
            this.clearMismatch(_candidate);
        }
        return super.__appendComment(string);
    }
    __openElement(tag) {
        let _candidate = this.candidate;
        if (_candidate && isElement(_candidate) && isSameNodeType(_candidate, tag)) {
            this.unmatchedAttributes = [].slice.call(_candidate.attributes);
            return _candidate;
        } else if (_candidate) {
            if (isElement(_candidate) && _candidate.tagName === 'TBODY') {
                this.pushElement(_candidate, null);
                this.currentCursor.injectedOmittedNode = true;
                return this.__openElement(tag);
            }
            this.clearMismatch(_candidate);
        }
        return super.__openElement(tag);
    }
    __setAttribute(name, value, namespace) {
        let unmatched = this.unmatchedAttributes;
        if (unmatched) {
            let attr = findByName(unmatched, name);
            if (attr) {
                if (attr.value !== value) {
                    attr.value = value;
                }
                unmatched.splice(unmatched.indexOf(attr), 1);
                return;
            }
        }
        return super.__setAttribute(name, value, namespace);
    }
    __setProperty(name, value) {
        let unmatched = this.unmatchedAttributes;
        if (unmatched) {
            let attr = findByName(unmatched, name);
            if (attr) {
                if (attr.value !== value) {
                    attr.value = value;
                }
                unmatched.splice(unmatched.indexOf(attr), 1);
                return;
            }
        }
        return super.__setProperty(name, value);
    }
    __flushElement(parent, constructing) {
        let { unmatchedAttributes: unmatched } = this;
        if (unmatched) {
            for (let i = 0; i < unmatched.length; i++) {
                this.constructing.removeAttribute(unmatched[i].name);
            }
            this.unmatchedAttributes = null;
        } else {
            super.__flushElement(parent, constructing);
        }
    }
    willCloseElement() {
        let { candidate, currentCursor } = this;
        if (candidate !== null) {
            this.clearMismatch(candidate);
        }
        if (currentCursor && currentCursor.injectedOmittedNode) {
            this.popElement();
        }
        super.willCloseElement();
    }
    getMarker(element, guid) {
        let marker = element.querySelector(`script[glmr="${guid}"]`);
        if (marker) {
            return marker;
        }
        return null;
    }
    __pushRemoteElement(element, cursorId, insertBefore) {
        let marker = this.getMarker(element, cursorId);
        false && (0, _util.assert)(!marker || marker.parentNode === element, `expected remote element marker's parent node to match remote element`);

        if (insertBefore === undefined) {
            while (element.lastChild !== marker) {
                this.remove(element.lastChild);
            }
        }
        let currentCursor = this.currentCursor;
        let candidate = currentCursor.candidate;
        this.pushElement(element, insertBefore);
        currentCursor.candidate = candidate;
        this.candidate = marker ? this.remove(marker) : null;
        let block = new _elementBuilder.RemoteLiveBlock(element);
        return this.pushLiveBlock(block, true);
    }
    didAppendBounds(bounds) {
        super.didAppendBounds(bounds);
        if (this.candidate) {
            let last = bounds.lastNode();
            this.candidate = last && last.nextSibling;
        }
        return bounds;
    }
}
exports.RehydrateBuilder = RehydrateBuilder;
function isTextNode(node) {
    return node.nodeType === 3;
}
function isComment(node) {
    return node.nodeType === 8;
}
function getOpenBlockDepth(node) {
    let boundsDepth = node.nodeValue.match(/^%\+b:(\d+)%$/);
    if (boundsDepth && boundsDepth[1]) {
        return Number(boundsDepth[1]);
    } else {
        return null;
    }
}
function getCloseBlockDepth(node) {
    let boundsDepth = node.nodeValue.match(/^%\-b:(\d+)%$/);
    if (boundsDepth && boundsDepth[1]) {
        return Number(boundsDepth[1]);
    } else {
        return null;
    }
}
function isElement(node) {
    return node.nodeType === 1;
}
function isMarker(node) {
    return node.nodeType === 8 && node.nodeValue === '%glmr%';
}
function isSeparator(node) {
    return node.nodeType === 8 && node.nodeValue === '%|%';
}
function isEmpty(node) {
    return node.nodeType === 8 && node.nodeValue === '% %';
}
function isSameNodeType(candidate, tag) {
    if (candidate.namespaceURI === "http://www.w3.org/2000/svg" /* SVG */) {
            return candidate.tagName === tag;
        }
    return candidate.tagName === tag.toUpperCase();
}
function findByName(array, name) {
    for (let i = 0; i < array.length; i++) {
        let attr = array[i];
        if (attr.name === name) return attr;
    }
    return undefined;
}
function rehydrationBuilder(env, cursor) {
    return RehydrateBuilder.forInitialRender(env, cursor);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL3JlaHlkcmF0ZS1idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztRQWdCTSx3QixHQUFBLHdCO1FBOGNBLGtCLEdBQUEsa0I7Ozs7QUFuZE47O0FBQ0E7O0FBRU8sTUFBTSw0RUFBTixRQUFBO0FBRUQsU0FBQSx3QkFBQSxDQUFBLElBQUEsRUFBbUQ7QUFDdkQsV0FBTyxLQUFBLFNBQUEsS0FBUCwrQkFBQTtBQUNEO0FBRUssTUFBQSxpQkFBQSxTQUFBLGtCQUFBLENBQTJDO0FBSS9DLGdCQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsa0JBQUEsRUFHNEM7QUFFMUMsY0FBQSxPQUFBLEVBQUEsV0FBQTtBQUZnQixhQUFBLGtCQUFBLEdBQUEsa0JBQUE7QUFObEIsYUFBQSxTQUFBLEdBQUEsSUFBQTtBQUVBLGFBQUEsbUJBQUEsR0FBQSxLQUFBO0FBT0UsYUFBQSxjQUFBLEdBQXNCLHFCQUF0QixDQUFBO0FBQ0Q7QUFYOEM7UUFBM0MsaUIsR0FBQSxpQjtBQWNBLE1BQUEsZ0JBQUEsU0FBQSxpQ0FBQSxDQUFpRDtBQUtyRDtBQUVBLGdCQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUF3RjtBQUN0RixjQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQTtBQVBNLGFBQUEsbUJBQUEsR0FBQSxJQUFBO0FBRUEsYUFBQSxVQUFBLEdBQUEsQ0FBQTtBQU1OLFlBQUEsV0FBQSxFQUFpQixNQUFNLElBQUEsS0FBQSxDQUFOLDRDQUFNLENBQU47QUFFakIsWUFBSSxPQUFPLEtBQUEsYUFBQSxDQUFBLE9BQUEsQ0FBWCxVQUFBO0FBRUEsZUFBTyxTQUFQLElBQUEsRUFBc0I7QUFDcEIsZ0JBQUksVUFBQSxJQUFBLEtBQW1CLHlCQUF2QixJQUF1QixDQUF2QixFQUF1RDtBQUNyRDtBQUNEO0FBQ0QsbUJBQU8sS0FBUCxXQUFBO0FBQ0Q7QUFYcUYsaUJBYXRGLGtCQUFBLElBQUEsRUFFRSxpQ0FBaUMsK0JBZm1ELHNCQWF0RixDQWJzRjs7QUFpQnRGLGFBQUEsU0FBQSxHQUFBLElBQUE7QUFDRDtBQUVELFFBQUEsYUFBQSxHQUFpQjtBQUNmLGVBQU8sS0FBQSw0QkFBQSxFQUFQLE9BQUE7QUFDRDtBQUVELFFBQUEsU0FBQSxHQUFhO0FBQ1gsWUFBSSxLQUFKLGFBQUEsRUFBd0I7QUFDdEIsbUJBQU8sS0FBQSxhQUFBLENBQVAsU0FBQTtBQUNEO0FBRUQsZUFBQSxJQUFBO0FBQ0Q7QUFFRCxRQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQXNDO0FBQ3BDLGFBQUEsYUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBO0FBQ0Q7QUFFRCxnQkFBQSxPQUFBLEVBQW9DLGNBQXBDLElBQUEsRUFBeUU7QUFDdkUsWUFBSSxFQUFFLGFBQUYsQ0FBQSxLQUFKLElBQUE7QUFDQSxZQUFJLFNBQVMsSUFBQSxpQkFBQSxDQUFBLE9BQUEsRUFBQSxXQUFBLEVBQWIsVUFBYSxDQUFiO0FBQ0EsWUFBSSxnQkFBZ0IsS0FBcEIsYUFBQTtBQUNBLFlBQUEsYUFBQSxFQUFtQjtBQUNqQixnQkFBSSxjQUFKLFNBQUEsRUFBNkI7QUFDM0I7Ozs7Ozs7Ozs7QUFXQTtBQUNBLHVCQUFBLFNBQUEsR0FBbUIsUUFBbkIsVUFBQTtBQUNBO0FBQ0EsOEJBQUEsU0FBQSxHQUEwQixRQUExQixXQUFBO0FBQ0Q7QUFDRjtBQUNELGFBQUEsNEJBQUEsRUFBQSxJQUFBLENBQUEsTUFBQTtBQUNEO0FBRU8sa0JBQUEsU0FBQSxFQUFtQztBQUN6QyxZQUFJLFVBQUosU0FBQTtBQUNBLFlBQUksZ0JBQWdCLEtBQXBCLGFBQUE7QUFDQSxZQUFJLGtCQUFKLElBQUEsRUFBNEI7QUFDMUIsZ0JBQUksaUJBQWlCLGNBQXJCLGNBQUE7QUFDQSxnQkFBSSxrQkFBa0IsY0FBdEIsa0JBQUEsRUFBd0Q7QUFDdEQsdUJBQU8sV0FBVyxFQUFFLFVBQUEsT0FBQSxLQUFzQixtQkFBQSxPQUFBLE1BQTFDLGNBQWtCLENBQWxCLEVBQTJGO0FBQ3pGLDhCQUFVLEtBQUEsTUFBQSxDQUFWLE9BQVUsQ0FBVjtBQUNEO0FBSHFELHlCQUl0RCxrQkFBTyxZQUFQLElBQUEsRUFKc0QsaUNBSXRELENBSnNEO0FBQXhELGFBQUEsTUFLTztBQUNMLHVCQUFPLFlBQVAsSUFBQSxFQUF5QjtBQUN2Qiw4QkFBVSxLQUFBLE1BQUEsQ0FBVixPQUFVLENBQVY7QUFDRDtBQUNGO0FBQ0Q7QUFDQTtBQUNBLDBCQUFBLFdBQUEsR0FBQSxPQUFBO0FBQ0E7QUFDQSwwQkFBQSxTQUFBLEdBQUEsSUFBQTtBQUNEO0FBQ0Y7QUFFRCxrQkFBVztBQUNULFlBQUksRUFBQSxhQUFBLEtBQUosSUFBQTtBQUNBLFlBQUksa0JBQUosSUFBQSxFQUE0QjtBQUU1QixZQUFJLGFBQWEsS0FBakIsVUFBQTtBQUVBLGFBQUEsVUFBQTtBQUVBLFlBQUksRUFBQSxTQUFBLEtBQUosYUFBQTtBQUNBLFlBQUksY0FBSixJQUFBLEVBQXdCO0FBRXhCLFlBQUksRUFBQSxPQUFBLEtBQWMsY0FBbEIsT0FBQTtBQUVBLFlBQUksVUFBQSxTQUFBLEtBQXdCLGtCQUFBLFNBQUEsTUFBNUIsVUFBQSxFQUF5RTtBQUN2RSwwQkFBQSxTQUFBLEdBQTBCLEtBQUEsTUFBQSxDQUExQixTQUEwQixDQUExQjtBQUNBLDBCQUFBLGNBQUEsR0FBQSxVQUFBO0FBRkYsU0FBQSxNQUdPLElBQUksWUFBQSxPQUFBLElBQXVCLFlBQXZCLFFBQUEsSUFBK0MsWUFBbkQsT0FBQSxFQUF3RTtBQUM3RSxpQkFBQSxhQUFBLENBQUEsU0FBQTtBQUNEO0FBQ0Y7QUFFRCxtQkFBWTtBQUNWLFlBQUksRUFBQSxhQUFBLEtBQUosSUFBQTtBQUNBLFlBQUksa0JBQUosSUFBQSxFQUE0QjtBQUU1QjtBQUNBLFlBQUksaUJBQWlCLGNBQXJCLGNBQUE7QUFFQTtBQUNBLGFBQUEsVUFBQTtBQUVBLFlBQUksRUFBQSxTQUFBLEtBQUosYUFBQTtBQUNBO0FBQ0EsWUFBSSxjQUFKLElBQUEsRUFBd0I7QUFBQSxxQkFDdEIsa0JBQ0UsbUJBQW1CLEtBRHJCLFVBQUEsRUFEc0Isb0VBQ3RCLENBRHNCOztBQUt0QixnQkFBSSxVQUFBLFNBQUEsS0FBd0IsbUJBQUEsU0FBQSxNQUE1QixjQUFBLEVBQThFO0FBQzVFLDhCQUFBLFNBQUEsR0FBMEIsS0FBQSxNQUFBLENBQTFCLFNBQTBCLENBQTFCO0FBQ0EsOEJBQUEsY0FBQTtBQUZGLGFBQUEsTUFHTztBQUNMLHFCQUFBLGFBQUEsQ0FBQSxTQUFBO0FBQ0Q7QUFDRDtBQUNBO0FBQ0Q7QUFDRCxZQUFJLGNBQUEsY0FBQSxLQUFpQyxLQUFyQyxVQUFBLEVBQXNEO0FBQUEscUJBQ3BELGtCQUNFLGNBQUEsV0FBQSxLQUFBLElBQUEsSUFDRSxVQUFVLGNBRFosV0FDRSxDQURGLElBRUUsbUJBQW1CLGNBQW5CLFdBQUEsTUFISixjQUFBLEVBRG9ELHFEQUNwRCxDQURvRDs7QUFPcEQsMEJBQUEsU0FBQSxHQUEwQixLQUFBLE1BQUEsQ0FBWSxjQUF0QyxXQUEwQixDQUExQjtBQUNBLDBCQUFBLGNBQUE7QUFDRDtBQUNGO0FBRUQsaUJBQUEsSUFBQSxFQUE2QjtBQUMzQixZQUFJLEVBQUEsU0FBQSxLQUFKLElBQUE7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFBLFNBQUEsRUFBZTtBQUNiLG1CQUFBLFNBQUE7QUFERixTQUFBLE1BRU87QUFDTCxtQkFBTyxNQUFBLFlBQUEsQ0FBUCxJQUFPLENBQVA7QUFDRDtBQUNGO0FBRUQsaUJBQUEsSUFBQSxFQUF5QjtBQUN2QixZQUFJLGtCQUFrQixLQUF0QixZQUFzQixFQUF0QjtBQUVBLFlBQUEsZUFBQSxFQUFxQjtBQUNuQixnQkFBSSxRQUFRLGdCQUFaLFNBQVksRUFBWjtBQUNBLGdCQUFJLE9BQU8sZ0JBQVgsUUFBVyxFQUFYO0FBRUEsZ0JBQUksWUFBWSxJQUFBLHNCQUFBLENBQW1CLEtBQW5CLE9BQUEsRUFBaUMsTUFBakMsV0FBQSxFQUFxRCxLQUFyRSxlQUFnQixDQUFoQjtBQUVBLGdCQUFJLHNCQUFzQixLQUFBLE1BQUEsQ0FBMUIsS0FBMEIsQ0FBMUI7QUFDQSxpQkFBQSxNQUFBLENBQUEsSUFBQTtBQUVBLGdCQUFJLHdCQUFBLElBQUEsSUFBZ0MsUUFBcEMsbUJBQW9DLENBQXBDLEVBQWtFO0FBQ2hFLHFCQUFBLFNBQUEsR0FBaUIsS0FBQSxNQUFBLENBQWpCLG1CQUFpQixDQUFqQjtBQUVBLG9CQUFJLEtBQUEsU0FBQSxLQUFKLElBQUEsRUFBNkI7QUFDM0IseUJBQUEsYUFBQSxDQUFtQixLQUFuQixTQUFBO0FBQ0Q7QUFDRjtBQUVELG1CQUFBLFNBQUE7QUFqQkYsU0FBQSxNQWtCTztBQUNMLG1CQUFPLE1BQUEsWUFBQSxDQUFQLElBQU8sQ0FBUDtBQUNEO0FBQ0Y7QUFFUyxXQUFBLElBQUEsRUFBdUI7QUFDL0IsWUFBSSxVQUFpQixLQUFyQixVQUFBO0FBQ0EsWUFBSSxPQUFPLEtBQVgsV0FBQTtBQUNBLGdCQUFBLFdBQUEsQ0FBQSxJQUFBO0FBQ0EsZUFBQSxJQUFBO0FBQ0Q7QUFFTyxtQkFBWTtBQUNsQixZQUFJLGFBQWEsS0FBakIsU0FBQTtBQUVBLFlBQUksY0FBYyxTQUFsQixVQUFrQixDQUFsQixFQUF3QztBQUN0QyxnQkFBSSxRQUFKLFVBQUE7QUFDQSxnQkFBSSxPQUFjLE1BQWxCLFdBQUE7QUFFQSxtQkFBTyxRQUFRLENBQUMsU0FBaEIsSUFBZ0IsQ0FBaEIsRUFBZ0M7QUFDOUIsdUJBQWMsS0FBZCxXQUFBO0FBQ0Q7QUFFRCxtQkFBTyxJQUFBLHNCQUFBLENBQW1CLEtBQW5CLE9BQUEsRUFBQSxLQUFBLEVBQVAsSUFBTyxDQUFQO0FBUkYsU0FBQSxNQVNPO0FBQ0wsbUJBQUEsSUFBQTtBQUNEO0FBQ0Y7QUFFRCxpQkFBQSxNQUFBLEVBQTJCO0FBQ3pCLFlBQUksRUFBQSxTQUFBLEtBQUosSUFBQTtBQUVBLFlBQUEsU0FBQSxFQUFlO0FBQ2IsZ0JBQUksV0FBSixTQUFJLENBQUosRUFBMkI7QUFDekIsb0JBQUksVUFBQSxTQUFBLEtBQUosTUFBQSxFQUFvQztBQUNsQyw4QkFBQSxTQUFBLEdBQUEsTUFBQTtBQUNEO0FBQ0QscUJBQUEsU0FBQSxHQUFpQixVQUFqQixXQUFBO0FBQ0EsdUJBQUEsU0FBQTtBQUxGLGFBQUEsTUFNTyxJQUFJLGNBQWMsWUFBQSxTQUFBLEtBQTBCLFFBQTVDLFNBQTRDLENBQXhDLENBQUosRUFBaUU7QUFDdEUscUJBQUEsU0FBQSxHQUFpQixVQUFqQixXQUFBO0FBQ0EscUJBQUEsTUFBQSxDQUFBLFNBQUE7QUFDQSx1QkFBTyxLQUFBLFlBQUEsQ0FBUCxNQUFPLENBQVA7QUFISyxhQUFBLE1BSUEsSUFBSSxRQUFKLFNBQUksQ0FBSixFQUF3QjtBQUM3QixvQkFBSSxPQUFPLEtBQUEsTUFBQSxDQUFYLFNBQVcsQ0FBWDtBQUNBLHFCQUFBLFNBQUEsR0FBQSxJQUFBO0FBQ0Esb0JBQUksT0FBTyxLQUFBLEdBQUEsQ0FBQSxjQUFBLENBQVgsTUFBVyxDQUFYO0FBQ0EscUJBQUEsR0FBQSxDQUFBLFlBQUEsQ0FBc0IsS0FBdEIsT0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsdUJBQUEsSUFBQTtBQUxLLGFBQUEsTUFNQTtBQUNMLHFCQUFBLGFBQUEsQ0FBQSxTQUFBO0FBQ0EsdUJBQU8sTUFBQSxZQUFBLENBQVAsTUFBTyxDQUFQO0FBQ0Q7QUFwQkgsU0FBQSxNQXFCTztBQUNMLG1CQUFPLE1BQUEsWUFBQSxDQUFQLE1BQU8sQ0FBUDtBQUNEO0FBQ0Y7QUFFRCxvQkFBQSxNQUFBLEVBQThCO0FBQzVCLFlBQUksYUFBYSxLQUFqQixTQUFBO0FBQ0EsWUFBSSxjQUFjLFVBQWxCLFVBQWtCLENBQWxCLEVBQXlDO0FBQ3ZDLGdCQUFJLFdBQUEsU0FBQSxLQUFKLE1BQUEsRUFBcUM7QUFDbkMsMkJBQUEsU0FBQSxHQUFBLE1BQUE7QUFDRDtBQUVELGlCQUFBLFNBQUEsR0FBaUIsV0FBakIsV0FBQTtBQUNBLG1CQUFBLFVBQUE7QUFORixTQUFBLE1BT08sSUFBQSxVQUFBLEVBQWdCO0FBQ3JCLGlCQUFBLGFBQUEsQ0FBQSxVQUFBO0FBQ0Q7QUFFRCxlQUFPLE1BQUEsZUFBQSxDQUFQLE1BQU8sQ0FBUDtBQUNEO0FBRUQsa0JBQUEsR0FBQSxFQUF5QjtBQUN2QixZQUFJLGFBQWEsS0FBakIsU0FBQTtBQUVBLFlBQUksY0FBYyxVQUFkLFVBQWMsQ0FBZCxJQUF1QyxlQUFBLFVBQUEsRUFBM0MsR0FBMkMsQ0FBM0MsRUFBNEU7QUFDMUUsaUJBQUEsbUJBQUEsR0FBMkIsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFjLFdBQXpDLFVBQTJCLENBQTNCO0FBQ0EsbUJBQUEsVUFBQTtBQUZGLFNBQUEsTUFHTyxJQUFBLFVBQUEsRUFBZ0I7QUFDckIsZ0JBQUksVUFBQSxVQUFBLEtBQXlCLFdBQUEsT0FBQSxLQUE3QixPQUFBLEVBQTZEO0FBQzNELHFCQUFBLFdBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQTtBQUNBLHFCQUFBLGFBQUEsQ0FBQSxtQkFBQSxHQUFBLElBQUE7QUFDQSx1QkFBTyxLQUFBLGFBQUEsQ0FBUCxHQUFPLENBQVA7QUFDRDtBQUNELGlCQUFBLGFBQUEsQ0FBQSxVQUFBO0FBQ0Q7QUFFRCxlQUFPLE1BQUEsYUFBQSxDQUFQLEdBQU8sQ0FBUDtBQUNEO0FBRUQsbUJBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQTRFO0FBQzFFLFlBQUksWUFBWSxLQUFoQixtQkFBQTtBQUVBLFlBQUEsU0FBQSxFQUFlO0FBQ2IsZ0JBQUksT0FBTyxXQUFBLFNBQUEsRUFBWCxJQUFXLENBQVg7QUFDQSxnQkFBQSxJQUFBLEVBQVU7QUFDUixvQkFBSSxLQUFBLEtBQUEsS0FBSixLQUFBLEVBQTBCO0FBQ3hCLHlCQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0Q7QUFDRCwwQkFBQSxNQUFBLENBQWlCLFVBQUEsT0FBQSxDQUFqQixJQUFpQixDQUFqQixFQUFBLENBQUE7QUFDQTtBQUNEO0FBQ0Y7QUFFRCxlQUFPLE1BQUEsY0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEVBQVAsU0FBTyxDQUFQO0FBQ0Q7QUFFRCxrQkFBQSxJQUFBLEVBQUEsS0FBQSxFQUF5QztBQUN2QyxZQUFJLFlBQVksS0FBaEIsbUJBQUE7QUFFQSxZQUFBLFNBQUEsRUFBZTtBQUNiLGdCQUFJLE9BQU8sV0FBQSxTQUFBLEVBQVgsSUFBVyxDQUFYO0FBQ0EsZ0JBQUEsSUFBQSxFQUFVO0FBQ1Isb0JBQUksS0FBQSxLQUFBLEtBQUosS0FBQSxFQUEwQjtBQUN4Qix5QkFBQSxLQUFBLEdBQUEsS0FBQTtBQUNEO0FBQ0QsMEJBQUEsTUFBQSxDQUFpQixVQUFBLE9BQUEsQ0FBakIsSUFBaUIsQ0FBakIsRUFBQSxDQUFBO0FBQ0E7QUFDRDtBQUNGO0FBRUQsZUFBTyxNQUFBLGFBQUEsQ0FBQSxJQUFBLEVBQVAsS0FBTyxDQUFQO0FBQ0Q7QUFFRCxtQkFBQSxNQUFBLEVBQUEsWUFBQSxFQUFpRTtBQUMvRCxZQUFJLEVBQUUscUJBQUYsU0FBQSxLQUFKLElBQUE7QUFDQSxZQUFBLFNBQUEsRUFBZTtBQUNiLGlCQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLElBQUksVUFBcEIsTUFBQSxFQUFBLEdBQUEsRUFBMkM7QUFDekMscUJBQUEsWUFBQSxDQUFBLGVBQUEsQ0FBbUMsVUFBQSxDQUFBLEVBQW5DLElBQUE7QUFDRDtBQUNELGlCQUFBLG1CQUFBLEdBQUEsSUFBQTtBQUpGLFNBQUEsTUFLTztBQUNMLGtCQUFBLGNBQUEsQ0FBQSxNQUFBLEVBQUEsWUFBQTtBQUNEO0FBQ0Y7QUFFRCx1QkFBZ0I7QUFDZCxZQUFJLEVBQUEsU0FBQSxFQUFBLGFBQUEsS0FBSixJQUFBO0FBRUEsWUFBSSxjQUFKLElBQUEsRUFBd0I7QUFDdEIsaUJBQUEsYUFBQSxDQUFBLFNBQUE7QUFDRDtBQUVELFlBQUksaUJBQWlCLGNBQXJCLG1CQUFBLEVBQXdEO0FBQ3RELGlCQUFBLFVBQUE7QUFDRDtBQUVELGNBQUEsZ0JBQUE7QUFDRDtBQUVELGNBQUEsT0FBQSxFQUFBLElBQUEsRUFBNEM7QUFDMUMsWUFBSSxTQUFTLFFBQUEsYUFBQSxDQUFzQixnQkFBZ0IsSUFBbkQsSUFBYSxDQUFiO0FBQ0EsWUFBQSxNQUFBLEVBQVk7QUFDVixtQkFBQSxNQUFBO0FBQ0Q7QUFDRCxlQUFBLElBQUE7QUFDRDtBQUVELHdCQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsWUFBQSxFQUdpQztBQUUvQixZQUFJLFNBQVMsS0FBQSxTQUFBLENBQUEsT0FBQSxFQUFiLFFBQWEsQ0FBYjtBQUYrQixpQkFJL0Isa0JBQ0UsQ0FBQSxNQUFBLElBQVcsT0FBQSxVQUFBLEtBRGIsT0FBQSxFQUorQixzRUFJL0IsQ0FKK0I7O0FBUy9CLFlBQUksaUJBQUosU0FBQSxFQUFnQztBQUM5QixtQkFBTyxRQUFBLFNBQUEsS0FBUCxNQUFBLEVBQXFDO0FBQ25DLHFCQUFBLE1BQUEsQ0FBWSxRQUFaLFNBQUE7QUFDRDtBQUNGO0FBRUQsWUFBSSxnQkFBZ0IsS0FBcEIsYUFBQTtBQUNBLFlBQUksWUFBWSxjQUFoQixTQUFBO0FBRUEsYUFBQSxXQUFBLENBQUEsT0FBQSxFQUFBLFlBQUE7QUFFQSxzQkFBQSxTQUFBLEdBQUEsU0FBQTtBQUNBLGFBQUEsU0FBQSxHQUFpQixTQUFTLEtBQUEsTUFBQSxDQUFULE1BQVMsQ0FBVCxHQUFqQixJQUFBO0FBRUEsWUFBSSxRQUFRLElBQUEsK0JBQUEsQ0FBWixPQUFZLENBQVo7QUFDQSxlQUFPLEtBQUEsYUFBQSxDQUFBLEtBQUEsRUFBUCxJQUFPLENBQVA7QUFDRDtBQUVELG9CQUFBLE1BQUEsRUFBOEI7QUFDNUIsY0FBQSxlQUFBLENBQUEsTUFBQTtBQUNBLFlBQUksS0FBSixTQUFBLEVBQW9CO0FBQ2xCLGdCQUFJLE9BQU8sT0FBWCxRQUFXLEVBQVg7QUFDQSxpQkFBQSxTQUFBLEdBQWlCLFFBQVEsS0FBekIsV0FBQTtBQUNEO0FBQ0QsZUFBQSxNQUFBO0FBQ0Q7QUE5WG9EO1FBQWpELGdCLEdBQUEsZ0I7QUFpWU4sU0FBQSxVQUFBLENBQUEsSUFBQSxFQUFvQztBQUNsQyxXQUFPLEtBQUEsUUFBQSxLQUFQLENBQUE7QUFDRDtBQUVELFNBQUEsU0FBQSxDQUFBLElBQUEsRUFBbUM7QUFDakMsV0FBTyxLQUFBLFFBQUEsS0FBUCxDQUFBO0FBQ0Q7QUFFRCxTQUFBLGlCQUFBLENBQUEsSUFBQSxFQUE4QztBQUM1QyxRQUFJLGNBQWMsS0FBQSxTQUFBLENBQUEsS0FBQSxDQUFsQixlQUFrQixDQUFsQjtBQUVBLFFBQUksZUFBZSxZQUFuQixDQUFtQixDQUFuQixFQUFtQztBQUNqQyxlQUFPLE9BQU8sWUFBZCxDQUFjLENBQVAsQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLGVBQUEsSUFBQTtBQUNEO0FBQ0Y7QUFFRCxTQUFBLGtCQUFBLENBQUEsSUFBQSxFQUErQztBQUM3QyxRQUFJLGNBQWMsS0FBQSxTQUFBLENBQUEsS0FBQSxDQUFsQixlQUFrQixDQUFsQjtBQUVBLFFBQUksZUFBZSxZQUFuQixDQUFtQixDQUFuQixFQUFtQztBQUNqQyxlQUFPLE9BQU8sWUFBZCxDQUFjLENBQVAsQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLGVBQUEsSUFBQTtBQUNEO0FBQ0Y7QUFFRCxTQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQW1DO0FBQ2pDLFdBQU8sS0FBQSxRQUFBLEtBQVAsQ0FBQTtBQUNEO0FBRUQsU0FBQSxRQUFBLENBQUEsSUFBQSxFQUFrQztBQUNoQyxXQUFPLEtBQUEsUUFBQSxLQUFBLENBQUEsSUFBdUIsS0FBQSxTQUFBLEtBQTlCLFFBQUE7QUFDRDtBQUVELFNBQUEsV0FBQSxDQUFBLElBQUEsRUFBcUM7QUFDbkMsV0FBTyxLQUFBLFFBQUEsS0FBQSxDQUFBLElBQXVCLEtBQUEsU0FBQSxLQUE5QixLQUFBO0FBQ0Q7QUFFRCxTQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQWlDO0FBQy9CLFdBQU8sS0FBQSxRQUFBLEtBQUEsQ0FBQSxJQUF1QixLQUFBLFNBQUEsS0FBOUIsS0FBQTtBQUNEO0FBQ0QsU0FBQSxjQUFBLENBQUEsU0FBQSxFQUFBLEdBQUEsRUFBNkQ7QUFDM0QsUUFBSSxVQUFBLFlBQUEsS0FBSiw0QkFBQSxDQUFBLFNBQUEsRUFBOEM7QUFDNUMsbUJBQU8sVUFBQSxPQUFBLEtBQVAsR0FBQTtBQUNEO0FBQ0QsV0FBTyxVQUFBLE9BQUEsS0FBc0IsSUFBN0IsV0FBNkIsRUFBN0I7QUFDRDtBQUVELFNBQUEsVUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLEVBQXFEO0FBQ25ELFNBQUssSUFBSSxJQUFULENBQUEsRUFBZ0IsSUFBSSxNQUFwQixNQUFBLEVBQUEsR0FBQSxFQUF1QztBQUNyQyxZQUFJLE9BQU8sTUFBWCxDQUFXLENBQVg7QUFDQSxZQUFJLEtBQUEsSUFBQSxLQUFKLElBQUEsRUFBd0IsT0FBQSxJQUFBO0FBQ3pCO0FBRUQsV0FBQSxTQUFBO0FBQ0Q7QUFFSyxTQUFBLGtCQUFBLENBQUEsR0FBQSxFQUFBLE1BQUEsRUFBaUU7QUFDckUsV0FBTyxpQkFBQSxnQkFBQSxDQUFBLEdBQUEsRUFBUCxNQUFPLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJvdW5kcywgRW52aXJvbm1lbnQsIE9wdGlvbiwgRWxlbWVudEJ1aWxkZXIgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2VydCwgZXhwZWN0LCBTdGFjaywgTWF5YmUgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIEF0dHJOYW1lc3BhY2UsXG4gIE5hbWVzcGFjZSxcbiAgU2ltcGxlQXR0cixcbiAgU2ltcGxlQ29tbWVudCxcbiAgU2ltcGxlRWxlbWVudCxcbiAgU2ltcGxlTm9kZSxcbiAgU2ltcGxlVGV4dCxcbn0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IENvbmNyZXRlQm91bmRzLCBDdXJzb3JJbXBsIH0gZnJvbSAnLi4vYm91bmRzJztcbmltcG9ydCB7IENVUlNPUl9TVEFDSywgTmV3RWxlbWVudEJ1aWxkZXIsIFJlbW90ZUxpdmVCbG9jayB9IGZyb20gJy4vZWxlbWVudC1idWlsZGVyJztcblxuZXhwb3J0IGNvbnN0IFNFUklBTElaQVRJT05fRklSU1RfTk9ERV9TVFJJTkcgPSAnJStiOjAlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2VyaWFsaXphdGlvbkZpcnN0Tm9kZShub2RlOiBTaW1wbGVOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLm5vZGVWYWx1ZSA9PT0gU0VSSUFMSVpBVElPTl9GSVJTVF9OT0RFX1NUUklORztcbn1cblxuZXhwb3J0IGNsYXNzIFJlaHlkcmF0aW5nQ3Vyc29yIGV4dGVuZHMgQ3Vyc29ySW1wbCB7XG4gIGNhbmRpZGF0ZTogT3B0aW9uPFNpbXBsZU5vZGU+ID0gbnVsbDtcbiAgb3BlbkJsb2NrRGVwdGg6IG51bWJlcjtcbiAgaW5qZWN0ZWRPbWl0dGVkTm9kZSA9IGZhbHNlO1xuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT4sXG4gICAgcHVibGljIHJlYWRvbmx5IHN0YXJ0aW5nQmxvY2tEZXB0aDogbnVtYmVyXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnQsIG5leHRTaWJsaW5nKTtcbiAgICB0aGlzLm9wZW5CbG9ja0RlcHRoID0gc3RhcnRpbmdCbG9ja0RlcHRoIC0gMTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVoeWRyYXRlQnVpbGRlciBleHRlbmRzIE5ld0VsZW1lbnRCdWlsZGVyIGltcGxlbWVudHMgRWxlbWVudEJ1aWxkZXIge1xuICBwcml2YXRlIHVubWF0Y2hlZEF0dHJpYnV0ZXM6IE9wdGlvbjxTaW1wbGVBdHRyW10+ID0gbnVsbDtcbiAgW0NVUlNPUl9TVEFDS10hOiBTdGFjazxSZWh5ZHJhdGluZ0N1cnNvcj47IC8vIEhpZGVzIHByb3BlcnR5IG9uIGJhc2UgY2xhc3NcbiAgcHJpdmF0ZSBibG9ja0RlcHRoID0gMDtcblxuICAvLyBwcml2YXRlIGNhbmRpZGF0ZTogT3B0aW9uPFNpbXBsZU5vZGU+ID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihlbnY6IEVudmlyb25tZW50LCBwYXJlbnROb2RlOiBTaW1wbGVFbGVtZW50LCBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+KSB7XG4gICAgc3VwZXIoZW52LCBwYXJlbnROb2RlLCBuZXh0U2libGluZyk7XG4gICAgaWYgKG5leHRTaWJsaW5nKSB0aHJvdyBuZXcgRXJyb3IoJ1JlaHlkcmF0aW9uIHdpdGggbmV4dFNpYmxpbmcgbm90IHN1cHBvcnRlZCcpO1xuXG4gICAgbGV0IG5vZGUgPSB0aGlzLmN1cnJlbnRDdXJzb3IhLmVsZW1lbnQuZmlyc3RDaGlsZDtcblxuICAgIHdoaWxlIChub2RlICE9PSBudWxsKSB7XG4gICAgICBpZiAoaXNDb21tZW50KG5vZGUpICYmIGlzU2VyaWFsaXphdGlvbkZpcnN0Tm9kZShub2RlKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgIH1cblxuICAgIGFzc2VydChcbiAgICAgIG5vZGUsXG4gICAgICBgTXVzdCBoYXZlIG9wZW5pbmcgY29tbWVudCA8IS0tJHtTRVJJQUxJWkFUSU9OX0ZJUlNUX05PREVfU1RSSU5HfS0tPiBmb3IgcmVoeWRyYXRpb24uYFxuICAgICk7XG4gICAgdGhpcy5jYW5kaWRhdGUgPSBub2RlO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRDdXJzb3IoKTogT3B0aW9uPFJlaHlkcmF0aW5nQ3Vyc29yPiB7XG4gICAgcmV0dXJuIHRoaXNbQ1VSU09SX1NUQUNLXS5jdXJyZW50O1xuICB9XG5cbiAgZ2V0IGNhbmRpZGF0ZSgpOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICAgIGlmICh0aGlzLmN1cnJlbnRDdXJzb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRDdXJzb3IuY2FuZGlkYXRlITtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHNldCBjYW5kaWRhdGUobm9kZTogT3B0aW9uPFNpbXBsZU5vZGU+KSB7XG4gICAgdGhpcy5jdXJyZW50Q3Vyc29yIS5jYW5kaWRhdGUgPSBub2RlO1xuICB9XG5cbiAgcHVzaEVsZW1lbnQoZWxlbWVudDogU2ltcGxlRWxlbWVudCwgbmV4dFNpYmxpbmc6IE1heWJlPFNpbXBsZU5vZGU+ID0gbnVsbCkge1xuICAgIGxldCB7IGJsb2NrRGVwdGggPSAwIH0gPSB0aGlzO1xuICAgIGxldCBjdXJzb3IgPSBuZXcgUmVoeWRyYXRpbmdDdXJzb3IoZWxlbWVudCwgbmV4dFNpYmxpbmcsIGJsb2NrRGVwdGgpO1xuICAgIGxldCBjdXJyZW50Q3Vyc29yID0gdGhpcy5jdXJyZW50Q3Vyc29yO1xuICAgIGlmIChjdXJyZW50Q3Vyc29yKSB7XG4gICAgICBpZiAoY3VycmVudEN1cnNvci5jYW5kaWRhdGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIDxkaXY+ICAgPC0tLS0tLS0tLS0tLS0tLSAgY3VycmVudEN1cnNvci5lbGVtZW50XG4gICAgICAgICAqICAgPCEtLSUrYjoxJS0tPlxuICAgICAgICAgKiAgIDxkaXY+IDwtLS0tLS0tLS0tLS0tLS0gIGN1cnJlbnRDdXJzb3IuY2FuZGlkYXRlIC0+IGN1cnNvci5lbGVtZW50XG4gICAgICAgICAqICAgICA8IS0tJStiOjIlLS0+IDwtICBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZS5maXJzdENoaWxkIC0+IGN1cnNvci5jYW5kaWRhdGVcbiAgICAgICAgICogICAgIEZvb1xuICAgICAgICAgKiAgICAgPCEtLSUtYjoyJS0tPlxuICAgICAgICAgKiAgIDwvZGl2PlxuICAgICAgICAgKiAgIDwhLS0lLWI6MSUtLT4gIDwtLSAgYmVjb21lcyBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZVxuICAgICAgICAgKi9cblxuICAgICAgICAvLyB3aGVyZSB0byByZWh5ZHJhdGUgZnJvbSBpZiB3ZSBhcmUgaW4gcmVoeWRyYXRpb24gbW9kZVxuICAgICAgICBjdXJzb3IuY2FuZGlkYXRlID0gZWxlbWVudC5maXJzdENoaWxkO1xuICAgICAgICAvLyB3aGVyZSB0byBjb250aW51ZSB3aGVuIHdlIHBvcFxuICAgICAgICBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZSA9IGVsZW1lbnQubmV4dFNpYmxpbmc7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXNbQ1VSU09SX1NUQUNLXS5wdXNoKGN1cnNvcik7XG4gIH1cblxuICBwcml2YXRlIGNsZWFyTWlzbWF0Y2goY2FuZGlkYXRlOiBTaW1wbGVOb2RlKSB7XG4gICAgbGV0IGN1cnJlbnQ6IE9wdGlvbjxTaW1wbGVOb2RlPiA9IGNhbmRpZGF0ZTtcbiAgICBsZXQgY3VycmVudEN1cnNvciA9IHRoaXMuY3VycmVudEN1cnNvcjtcbiAgICBpZiAoY3VycmVudEN1cnNvciAhPT0gbnVsbCkge1xuICAgICAgbGV0IG9wZW5CbG9ja0RlcHRoID0gY3VycmVudEN1cnNvci5vcGVuQmxvY2tEZXB0aDtcbiAgICAgIGlmIChvcGVuQmxvY2tEZXB0aCA+PSBjdXJyZW50Q3Vyc29yLnN0YXJ0aW5nQmxvY2tEZXB0aCkge1xuICAgICAgICB3aGlsZSAoY3VycmVudCAmJiAhKGlzQ29tbWVudChjdXJyZW50KSAmJiBnZXRDbG9zZUJsb2NrRGVwdGgoY3VycmVudCkgPT09IG9wZW5CbG9ja0RlcHRoKSkge1xuICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLnJlbW92ZShjdXJyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBhc3NlcnQoY3VycmVudCAhPT0gbnVsbCwgJ3Nob3VsZCBoYXZlIGZvdW5kIGNsb3NpbmcgYmxvY2snKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgY3VycmVudCA9IHRoaXMucmVtb3ZlKGN1cnJlbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBjdXJyZW50IGN1cnNvciBwYXJlbnROb2RlIHNob3VsZCBiZSBvcGVuQ2FuZGlkYXRlIGlmIGVsZW1lbnRcbiAgICAgIC8vIG9yIG9wZW5DYW5kaWRhdGUucGFyZW50Tm9kZSBpZiBjb21tZW50XG4gICAgICBjdXJyZW50Q3Vyc29yLm5leHRTaWJsaW5nID0gY3VycmVudDtcbiAgICAgIC8vIGRpc2FibGUgcmVoeWRyYXRpb24gdW50aWwgd2UgcG9wRWxlbWVudCBvciBjbG9zZUJsb2NrIGZvciBvcGVuQmxvY2tEZXB0aFxuICAgICAgY3VycmVudEN1cnNvci5jYW5kaWRhdGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9fb3BlbkJsb2NrKCk6IHZvaWQge1xuICAgIGxldCB7IGN1cnJlbnRDdXJzb3IgfSA9IHRoaXM7XG4gICAgaWYgKGN1cnJlbnRDdXJzb3IgPT09IG51bGwpIHJldHVybjtcblxuICAgIGxldCBibG9ja0RlcHRoID0gdGhpcy5ibG9ja0RlcHRoO1xuXG4gICAgdGhpcy5ibG9ja0RlcHRoKys7XG5cbiAgICBsZXQgeyBjYW5kaWRhdGUgfSA9IGN1cnJlbnRDdXJzb3I7XG4gICAgaWYgKGNhbmRpZGF0ZSA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgbGV0IHsgdGFnTmFtZSB9ID0gY3VycmVudEN1cnNvci5lbGVtZW50O1xuXG4gICAgaWYgKGlzQ29tbWVudChjYW5kaWRhdGUpICYmIGdldE9wZW5CbG9ja0RlcHRoKGNhbmRpZGF0ZSkgPT09IGJsb2NrRGVwdGgpIHtcbiAgICAgIGN1cnJlbnRDdXJzb3IuY2FuZGlkYXRlID0gdGhpcy5yZW1vdmUoY2FuZGlkYXRlKTtcbiAgICAgIGN1cnJlbnRDdXJzb3Iub3BlbkJsb2NrRGVwdGggPSBibG9ja0RlcHRoO1xuICAgIH0gZWxzZSBpZiAodGFnTmFtZSAhPT0gJ1RJVExFJyAmJiB0YWdOYW1lICE9PSAnU0NSSVBUJyAmJiB0YWdOYW1lICE9PSAnU1RZTEUnKSB7XG4gICAgICB0aGlzLmNsZWFyTWlzbWF0Y2goY2FuZGlkYXRlKTtcbiAgICB9XG4gIH1cblxuICBfX2Nsb3NlQmxvY2soKTogdm9pZCB7XG4gICAgbGV0IHsgY3VycmVudEN1cnNvciB9ID0gdGhpcztcbiAgICBpZiAoY3VycmVudEN1cnNvciA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgLy8gb3BlbkJsb2NrIGlzIHRoZSBsYXN0IHJlaHlkcmF0ZWQgb3BlbiBibG9ja1xuICAgIGxldCBvcGVuQmxvY2tEZXB0aCA9IGN1cnJlbnRDdXJzb3Iub3BlbkJsb2NrRGVwdGg7XG5cbiAgICAvLyB0aGlzIGN1cnJlbnRseSBpcyB0aGUgZXhwZWN0ZWQgbmV4dCBvcGVuIGJsb2NrIGRlcHRoXG4gICAgdGhpcy5ibG9ja0RlcHRoLS07XG5cbiAgICBsZXQgeyBjYW5kaWRhdGUgfSA9IGN1cnJlbnRDdXJzb3I7XG4gICAgLy8gcmVoeWRyYXRpbmdcbiAgICBpZiAoY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICBhc3NlcnQoXG4gICAgICAgIG9wZW5CbG9ja0RlcHRoID09PSB0aGlzLmJsb2NrRGVwdGgsXG4gICAgICAgICd3aGVuIHJlaHlkcmF0aW5nLCBvcGVuQmxvY2tEZXB0aCBzaG91bGQgbWF0Y2ggdGhpcy5ibG9ja0RlcHRoIGhlcmUnXG4gICAgICApO1xuICAgICAgaWYgKGlzQ29tbWVudChjYW5kaWRhdGUpICYmIGdldENsb3NlQmxvY2tEZXB0aChjYW5kaWRhdGUpID09PSBvcGVuQmxvY2tEZXB0aCkge1xuICAgICAgICBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZSA9IHRoaXMucmVtb3ZlKGNhbmRpZGF0ZSk7XG4gICAgICAgIGN1cnJlbnRDdXJzb3Iub3BlbkJsb2NrRGVwdGgtLTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2xlYXJNaXNtYXRjaChjYW5kaWRhdGUpO1xuICAgICAgfVxuICAgICAgLy8gaWYgdGhlIG9wZW5CbG9ja0RlcHRoIG1hdGNoZXMgdGhlIGJsb2NrRGVwdGggd2UganVzdCBjbG9zZWQgdG9cbiAgICAgIC8vIHRoZW4gcmVzdG9yZSByZWh5ZHJhdGlvblxuICAgIH1cbiAgICBpZiAoY3VycmVudEN1cnNvci5vcGVuQmxvY2tEZXB0aCA9PT0gdGhpcy5ibG9ja0RlcHRoKSB7XG4gICAgICBhc3NlcnQoXG4gICAgICAgIGN1cnJlbnRDdXJzb3IubmV4dFNpYmxpbmcgIT09IG51bGwgJiZcbiAgICAgICAgICBpc0NvbW1lbnQoY3VycmVudEN1cnNvci5uZXh0U2libGluZykgJiZcbiAgICAgICAgICBnZXRDbG9zZUJsb2NrRGVwdGgoY3VycmVudEN1cnNvci5uZXh0U2libGluZykgPT09IG9wZW5CbG9ja0RlcHRoLFxuICAgICAgICAnZXhwZWN0ZWQgY2xvc2UgYmxvY2sgdG8gbWF0Y2ggcmVoeWRyYXRlZCBvcGVuIGJsb2NrJ1xuICAgICAgKTtcbiAgICAgIGN1cnJlbnRDdXJzb3IuY2FuZGlkYXRlID0gdGhpcy5yZW1vdmUoY3VycmVudEN1cnNvci5uZXh0U2libGluZyEpO1xuICAgICAgY3VycmVudEN1cnNvci5vcGVuQmxvY2tEZXB0aC0tO1xuICAgIH1cbiAgfVxuXG4gIF9fYXBwZW5kTm9kZShub2RlOiBTaW1wbGVOb2RlKTogU2ltcGxlTm9kZSB7XG4gICAgbGV0IHsgY2FuZGlkYXRlIH0gPSB0aGlzO1xuXG4gICAgLy8gVGhpcyBjb2RlIHBhdGggaXMgb25seSB1c2VkIHdoZW4gaW5zZXJ0aW5nIHByZWNpc2VseSBvbmUgbm9kZS4gSXQgbmVlZHMgbW9yZVxuICAgIC8vIGNvbXBhcmlzb24gbG9naWMsIGJ1dCB3ZSBjYW4gcHJvYmFibHkgbGVhbiBvbiB0aGUgY2FzZXMgd2hlcmUgdGhpcyBjb2RlIHBhdGhcbiAgICAvLyBpcyBhY3R1YWxseSB1c2VkLlxuICAgIGlmIChjYW5kaWRhdGUpIHtcbiAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdXBlci5fX2FwcGVuZE5vZGUobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgX19hcHBlbmRIVE1MKGh0bWw6IHN0cmluZyk6IEJvdW5kcyB7XG4gICAgbGV0IGNhbmRpZGF0ZUJvdW5kcyA9IHRoaXMubWFya2VyQm91bmRzKCk7XG5cbiAgICBpZiAoY2FuZGlkYXRlQm91bmRzKSB7XG4gICAgICBsZXQgZmlyc3QgPSBjYW5kaWRhdGVCb3VuZHMuZmlyc3ROb2RlKCkhO1xuICAgICAgbGV0IGxhc3QgPSBjYW5kaWRhdGVCb3VuZHMubGFzdE5vZGUoKSE7XG5cbiAgICAgIGxldCBuZXdCb3VuZHMgPSBuZXcgQ29uY3JldGVCb3VuZHModGhpcy5lbGVtZW50LCBmaXJzdC5uZXh0U2libGluZyEsIGxhc3QucHJldmlvdXNTaWJsaW5nISk7XG5cbiAgICAgIGxldCBwb3NzaWJsZUVtcHR5TWFya2VyID0gdGhpcy5yZW1vdmUoZmlyc3QpO1xuICAgICAgdGhpcy5yZW1vdmUobGFzdCk7XG5cbiAgICAgIGlmIChwb3NzaWJsZUVtcHR5TWFya2VyICE9PSBudWxsICYmIGlzRW1wdHkocG9zc2libGVFbXB0eU1hcmtlcikpIHtcbiAgICAgICAgdGhpcy5jYW5kaWRhdGUgPSB0aGlzLnJlbW92ZShwb3NzaWJsZUVtcHR5TWFya2VyKTtcblxuICAgICAgICBpZiAodGhpcy5jYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmNsZWFyTWlzbWF0Y2godGhpcy5jYW5kaWRhdGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXdCb3VuZHM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdXBlci5fX2FwcGVuZEhUTUwoaHRtbCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIHJlbW92ZShub2RlOiBTaW1wbGVOb2RlKTogT3B0aW9uPFNpbXBsZU5vZGU+IHtcbiAgICBsZXQgZWxlbWVudCA9IGV4cGVjdChub2RlLnBhcmVudE5vZGUsIGBjYW5ub3QgcmVtb3ZlIGEgZGV0YWNoZWQgbm9kZWApIGFzIFNpbXBsZUVsZW1lbnQ7XG4gICAgbGV0IG5leHQgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgcmV0dXJuIG5leHQ7XG4gIH1cblxuICBwcml2YXRlIG1hcmtlckJvdW5kcygpOiBPcHRpb248Qm91bmRzPiB7XG4gICAgbGV0IF9jYW5kaWRhdGUgPSB0aGlzLmNhbmRpZGF0ZTtcblxuICAgIGlmIChfY2FuZGlkYXRlICYmIGlzTWFya2VyKF9jYW5kaWRhdGUpKSB7XG4gICAgICBsZXQgZmlyc3QgPSBfY2FuZGlkYXRlO1xuICAgICAgbGV0IGxhc3QgPSBleHBlY3QoZmlyc3QubmV4dFNpYmxpbmcsIGBCVUc6IHNlcmlhbGl6YXRpb24gbWFya2VycyBtdXN0IGJlIHBhaXJlZGApO1xuXG4gICAgICB3aGlsZSAobGFzdCAmJiAhaXNNYXJrZXIobGFzdCkpIHtcbiAgICAgICAgbGFzdCA9IGV4cGVjdChsYXN0Lm5leHRTaWJsaW5nLCBgQlVHOiBzZXJpYWxpemF0aW9uIG1hcmtlcnMgbXVzdCBiZSBwYWlyZWRgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBDb25jcmV0ZUJvdW5kcyh0aGlzLmVsZW1lbnQsIGZpcnN0LCBsYXN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgX19hcHBlbmRUZXh0KHN0cmluZzogc3RyaW5nKTogU2ltcGxlVGV4dCB7XG4gICAgbGV0IHsgY2FuZGlkYXRlIH0gPSB0aGlzO1xuXG4gICAgaWYgKGNhbmRpZGF0ZSkge1xuICAgICAgaWYgKGlzVGV4dE5vZGUoY2FuZGlkYXRlKSkge1xuICAgICAgICBpZiAoY2FuZGlkYXRlLm5vZGVWYWx1ZSAhPT0gc3RyaW5nKSB7XG4gICAgICAgICAgY2FuZGlkYXRlLm5vZGVWYWx1ZSA9IHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbmRpZGF0ZSA9IGNhbmRpZGF0ZS5uZXh0U2libGluZztcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgIH0gZWxzZSBpZiAoY2FuZGlkYXRlICYmIChpc1NlcGFyYXRvcihjYW5kaWRhdGUpIHx8IGlzRW1wdHkoY2FuZGlkYXRlKSkpIHtcbiAgICAgICAgdGhpcy5jYW5kaWRhdGUgPSBjYW5kaWRhdGUubmV4dFNpYmxpbmc7XG4gICAgICAgIHRoaXMucmVtb3ZlKGNhbmRpZGF0ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLl9fYXBwZW5kVGV4dChzdHJpbmcpO1xuICAgICAgfSBlbHNlIGlmIChpc0VtcHR5KGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLnJlbW92ZShjYW5kaWRhdGUpO1xuICAgICAgICB0aGlzLmNhbmRpZGF0ZSA9IG5leHQ7XG4gICAgICAgIGxldCB0ZXh0ID0gdGhpcy5kb20uY3JlYXRlVGV4dE5vZGUoc3RyaW5nKTtcbiAgICAgICAgdGhpcy5kb20uaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgdGV4dCwgbmV4dCk7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbGVhck1pc21hdGNoKGNhbmRpZGF0ZSk7XG4gICAgICAgIHJldHVybiBzdXBlci5fX2FwcGVuZFRleHQoc3RyaW5nKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLl9fYXBwZW5kVGV4dChzdHJpbmcpO1xuICAgIH1cbiAgfVxuXG4gIF9fYXBwZW5kQ29tbWVudChzdHJpbmc6IHN0cmluZyk6IFNpbXBsZUNvbW1lbnQge1xuICAgIGxldCBfY2FuZGlkYXRlID0gdGhpcy5jYW5kaWRhdGU7XG4gICAgaWYgKF9jYW5kaWRhdGUgJiYgaXNDb21tZW50KF9jYW5kaWRhdGUpKSB7XG4gICAgICBpZiAoX2NhbmRpZGF0ZS5ub2RlVmFsdWUgIT09IHN0cmluZykge1xuICAgICAgICBfY2FuZGlkYXRlLm5vZGVWYWx1ZSA9IHN0cmluZztcbiAgICAgIH1cblxuICAgICAgdGhpcy5jYW5kaWRhdGUgPSBfY2FuZGlkYXRlLm5leHRTaWJsaW5nO1xuICAgICAgcmV0dXJuIF9jYW5kaWRhdGU7XG4gICAgfSBlbHNlIGlmIChfY2FuZGlkYXRlKSB7XG4gICAgICB0aGlzLmNsZWFyTWlzbWF0Y2goX2NhbmRpZGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyLl9fYXBwZW5kQ29tbWVudChzdHJpbmcpO1xuICB9XG5cbiAgX19vcGVuRWxlbWVudCh0YWc6IHN0cmluZyk6IFNpbXBsZUVsZW1lbnQge1xuICAgIGxldCBfY2FuZGlkYXRlID0gdGhpcy5jYW5kaWRhdGU7XG5cbiAgICBpZiAoX2NhbmRpZGF0ZSAmJiBpc0VsZW1lbnQoX2NhbmRpZGF0ZSkgJiYgaXNTYW1lTm9kZVR5cGUoX2NhbmRpZGF0ZSwgdGFnKSkge1xuICAgICAgdGhpcy51bm1hdGNoZWRBdHRyaWJ1dGVzID0gW10uc2xpY2UuY2FsbChfY2FuZGlkYXRlLmF0dHJpYnV0ZXMpO1xuICAgICAgcmV0dXJuIF9jYW5kaWRhdGU7XG4gICAgfSBlbHNlIGlmIChfY2FuZGlkYXRlKSB7XG4gICAgICBpZiAoaXNFbGVtZW50KF9jYW5kaWRhdGUpICYmIF9jYW5kaWRhdGUudGFnTmFtZSA9PT0gJ1RCT0RZJykge1xuICAgICAgICB0aGlzLnB1c2hFbGVtZW50KF9jYW5kaWRhdGUsIG51bGwpO1xuICAgICAgICB0aGlzLmN1cnJlbnRDdXJzb3IhLmluamVjdGVkT21pdHRlZE5vZGUgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcy5fX29wZW5FbGVtZW50KHRhZyk7XG4gICAgICB9XG4gICAgICB0aGlzLmNsZWFyTWlzbWF0Y2goX2NhbmRpZGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyLl9fb3BlbkVsZW1lbnQodGFnKTtcbiAgfVxuXG4gIF9fc2V0QXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT4pOiB2b2lkIHtcbiAgICBsZXQgdW5tYXRjaGVkID0gdGhpcy51bm1hdGNoZWRBdHRyaWJ1dGVzO1xuXG4gICAgaWYgKHVubWF0Y2hlZCkge1xuICAgICAgbGV0IGF0dHIgPSBmaW5kQnlOYW1lKHVubWF0Y2hlZCwgbmFtZSk7XG4gICAgICBpZiAoYXR0cikge1xuICAgICAgICBpZiAoYXR0ci52YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICBhdHRyLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdW5tYXRjaGVkLnNwbGljZSh1bm1hdGNoZWQuaW5kZXhPZihhdHRyKSwgMSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIuX19zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUsIG5hbWVzcGFjZSk7XG4gIH1cblxuICBfX3NldFByb3BlcnR5KG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGxldCB1bm1hdGNoZWQgPSB0aGlzLnVubWF0Y2hlZEF0dHJpYnV0ZXM7XG5cbiAgICBpZiAodW5tYXRjaGVkKSB7XG4gICAgICBsZXQgYXR0ciA9IGZpbmRCeU5hbWUodW5tYXRjaGVkLCBuYW1lKTtcbiAgICAgIGlmIChhdHRyKSB7XG4gICAgICAgIGlmIChhdHRyLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgIGF0dHIudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB1bm1hdGNoZWQuc3BsaWNlKHVubWF0Y2hlZC5pbmRleE9mKGF0dHIpLCAxKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdXBlci5fX3NldFByb3BlcnR5KG5hbWUsIHZhbHVlKTtcbiAgfVxuXG4gIF9fZmx1c2hFbGVtZW50KHBhcmVudDogU2ltcGxlRWxlbWVudCwgY29uc3RydWN0aW5nOiBTaW1wbGVFbGVtZW50KTogdm9pZCB7XG4gICAgbGV0IHsgdW5tYXRjaGVkQXR0cmlidXRlczogdW5tYXRjaGVkIH0gPSB0aGlzO1xuICAgIGlmICh1bm1hdGNoZWQpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5tYXRjaGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuY29uc3RydWN0aW5nIS5yZW1vdmVBdHRyaWJ1dGUodW5tYXRjaGVkW2ldLm5hbWUpO1xuICAgICAgfVxuICAgICAgdGhpcy51bm1hdGNoZWRBdHRyaWJ1dGVzID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIuX19mbHVzaEVsZW1lbnQocGFyZW50LCBjb25zdHJ1Y3RpbmcpO1xuICAgIH1cbiAgfVxuXG4gIHdpbGxDbG9zZUVsZW1lbnQoKSB7XG4gICAgbGV0IHsgY2FuZGlkYXRlLCBjdXJyZW50Q3Vyc29yIH0gPSB0aGlzO1xuXG4gICAgaWYgKGNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5jbGVhck1pc21hdGNoKGNhbmRpZGF0ZSk7XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRDdXJzb3IgJiYgY3VycmVudEN1cnNvci5pbmplY3RlZE9taXR0ZWROb2RlKSB7XG4gICAgICB0aGlzLnBvcEVsZW1lbnQoKTtcbiAgICB9XG5cbiAgICBzdXBlci53aWxsQ2xvc2VFbGVtZW50KCk7XG4gIH1cblxuICBnZXRNYXJrZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGd1aWQ6IHN0cmluZyk6IE9wdGlvbjxTaW1wbGVOb2RlPiB7XG4gICAgbGV0IG1hcmtlciA9IGVsZW1lbnQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2dsbXI9XCIke2d1aWR9XCJdYCk7XG4gICAgaWYgKG1hcmtlcikge1xuICAgICAgcmV0dXJuIG1hcmtlciBhcyBTaW1wbGVOb2RlO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIF9fcHVzaFJlbW90ZUVsZW1lbnQoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBjdXJzb3JJZDogc3RyaW5nLFxuICAgIGluc2VydEJlZm9yZTogTWF5YmU8U2ltcGxlTm9kZT5cbiAgKTogT3B0aW9uPFJlbW90ZUxpdmVCbG9jaz4ge1xuICAgIGxldCBtYXJrZXIgPSB0aGlzLmdldE1hcmtlcihlbGVtZW50IGFzIEhUTUxFbGVtZW50LCBjdXJzb3JJZCk7XG5cbiAgICBhc3NlcnQoXG4gICAgICAhbWFya2VyIHx8IG1hcmtlci5wYXJlbnROb2RlID09PSBlbGVtZW50LFxuICAgICAgYGV4cGVjdGVkIHJlbW90ZSBlbGVtZW50IG1hcmtlcidzIHBhcmVudCBub2RlIHRvIG1hdGNoIHJlbW90ZSBlbGVtZW50YFxuICAgICk7XG5cbiAgICBpZiAoaW5zZXJ0QmVmb3JlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHdoaWxlIChlbGVtZW50Lmxhc3RDaGlsZCAhPT0gbWFya2VyKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKGVsZW1lbnQubGFzdENoaWxkISk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbnRDdXJzb3IgPSB0aGlzLmN1cnJlbnRDdXJzb3I7XG4gICAgbGV0IGNhbmRpZGF0ZSA9IGN1cnJlbnRDdXJzb3IhLmNhbmRpZGF0ZTtcblxuICAgIHRoaXMucHVzaEVsZW1lbnQoZWxlbWVudCwgaW5zZXJ0QmVmb3JlKTtcblxuICAgIGN1cnJlbnRDdXJzb3IhLmNhbmRpZGF0ZSA9IGNhbmRpZGF0ZTtcbiAgICB0aGlzLmNhbmRpZGF0ZSA9IG1hcmtlciA/IHRoaXMucmVtb3ZlKG1hcmtlcikgOiBudWxsO1xuXG4gICAgbGV0IGJsb2NrID0gbmV3IFJlbW90ZUxpdmVCbG9jayhlbGVtZW50KTtcbiAgICByZXR1cm4gdGhpcy5wdXNoTGl2ZUJsb2NrKGJsb2NrLCB0cnVlKTtcbiAgfVxuXG4gIGRpZEFwcGVuZEJvdW5kcyhib3VuZHM6IEJvdW5kcyk6IEJvdW5kcyB7XG4gICAgc3VwZXIuZGlkQXBwZW5kQm91bmRzKGJvdW5kcyk7XG4gICAgaWYgKHRoaXMuY2FuZGlkYXRlKSB7XG4gICAgICBsZXQgbGFzdCA9IGJvdW5kcy5sYXN0Tm9kZSgpO1xuICAgICAgdGhpcy5jYW5kaWRhdGUgPSBsYXN0ICYmIGxhc3QubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIHJldHVybiBib3VuZHM7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNUZXh0Tm9kZShub2RlOiBTaW1wbGVOb2RlKTogbm9kZSBpcyBTaW1wbGVUZXh0IHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5cbmZ1bmN0aW9uIGlzQ29tbWVudChub2RlOiBTaW1wbGVOb2RlKTogbm9kZSBpcyBTaW1wbGVDb21tZW50IHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDg7XG59XG5cbmZ1bmN0aW9uIGdldE9wZW5CbG9ja0RlcHRoKG5vZGU6IFNpbXBsZUNvbW1lbnQpOiBPcHRpb248bnVtYmVyPiB7XG4gIGxldCBib3VuZHNEZXB0aCA9IG5vZGUubm9kZVZhbHVlIS5tYXRjaCgvXiVcXCtiOihcXGQrKSUkLyk7XG5cbiAgaWYgKGJvdW5kc0RlcHRoICYmIGJvdW5kc0RlcHRoWzFdKSB7XG4gICAgcmV0dXJuIE51bWJlcihib3VuZHNEZXB0aFsxXSBhcyBzdHJpbmcpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldENsb3NlQmxvY2tEZXB0aChub2RlOiBTaW1wbGVDb21tZW50KTogT3B0aW9uPG51bWJlcj4ge1xuICBsZXQgYm91bmRzRGVwdGggPSBub2RlLm5vZGVWYWx1ZSEubWF0Y2goL14lXFwtYjooXFxkKyklJC8pO1xuXG4gIGlmIChib3VuZHNEZXB0aCAmJiBib3VuZHNEZXB0aFsxXSkge1xuICAgIHJldHVybiBOdW1iZXIoYm91bmRzRGVwdGhbMV0gYXMgc3RyaW5nKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0VsZW1lbnQobm9kZTogU2ltcGxlTm9kZSk6IG5vZGUgaXMgU2ltcGxlRWxlbWVudCB7XG4gIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAxO1xufVxuXG5mdW5jdGlvbiBpc01hcmtlcihub2RlOiBTaW1wbGVOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLm5vZGVUeXBlID09PSA4ICYmIG5vZGUubm9kZVZhbHVlID09PSAnJWdsbXIlJztcbn1cblxuZnVuY3Rpb24gaXNTZXBhcmF0b3Iobm9kZTogU2ltcGxlTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gOCAmJiBub2RlLm5vZGVWYWx1ZSA9PT0gJyV8JSc7XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHkobm9kZTogU2ltcGxlTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gOCAmJiBub2RlLm5vZGVWYWx1ZSA9PT0gJyUgJSc7XG59XG5mdW5jdGlvbiBpc1NhbWVOb2RlVHlwZShjYW5kaWRhdGU6IFNpbXBsZUVsZW1lbnQsIHRhZzogc3RyaW5nKSB7XG4gIGlmIChjYW5kaWRhdGUubmFtZXNwYWNlVVJJID09PSBOYW1lc3BhY2UuU1ZHKSB7XG4gICAgcmV0dXJuIGNhbmRpZGF0ZS50YWdOYW1lID09PSB0YWc7XG4gIH1cbiAgcmV0dXJuIGNhbmRpZGF0ZS50YWdOYW1lID09PSB0YWcudG9VcHBlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gZmluZEJ5TmFtZShhcnJheTogU2ltcGxlQXR0cltdLCBuYW1lOiBzdHJpbmcpOiBTaW1wbGVBdHRyIHwgdW5kZWZpbmVkIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIGxldCBhdHRyID0gYXJyYXlbaV07XG4gICAgaWYgKGF0dHIubmFtZSA9PT0gbmFtZSkgcmV0dXJuIGF0dHI7XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVoeWRyYXRpb25CdWlsZGVyKGVudjogRW52aXJvbm1lbnQsIGN1cnNvcjogQ3Vyc29ySW1wbCk6IEVsZW1lbnRCdWlsZGVyIHtcbiAgcmV0dXJuIFJlaHlkcmF0ZUJ1aWxkZXIuZm9ySW5pdGlhbFJlbmRlcihlbnYsIGN1cnNvcik7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9