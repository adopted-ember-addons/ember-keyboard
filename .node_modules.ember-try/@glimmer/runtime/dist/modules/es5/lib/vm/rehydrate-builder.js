var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { assert } from '@glimmer/util';
import { ConcreteBounds, CursorImpl } from '../bounds';
import { CURSOR_STACK, NewElementBuilder, RemoteLiveBlock } from './element-builder';
export var SERIALIZATION_FIRST_NODE_STRING = '%+b:0%';
export function isSerializationFirstNode(node) {
    return node.nodeValue === SERIALIZATION_FIRST_NODE_STRING;
}
export var RehydratingCursor = function (_CursorImpl) {
    _inherits(RehydratingCursor, _CursorImpl);

    function RehydratingCursor(element, nextSibling, startingBlockDepth) {
        _classCallCheck(this, RehydratingCursor);

        var _this = _possibleConstructorReturn(this, _CursorImpl.call(this, element, nextSibling));

        _this.startingBlockDepth = startingBlockDepth;
        _this.candidate = null;
        _this.injectedOmittedNode = false;
        _this.openBlockDepth = startingBlockDepth - 1;
        return _this;
    }

    return RehydratingCursor;
}(CursorImpl);
export var RehydrateBuilder = function (_NewElementBuilder) {
    _inherits(RehydrateBuilder, _NewElementBuilder);

    // private candidate: Option<SimpleNode> = null;
    function RehydrateBuilder(env, parentNode, nextSibling) {
        _classCallCheck(this, RehydrateBuilder);

        var _this2 = _possibleConstructorReturn(this, _NewElementBuilder.call(this, env, parentNode, nextSibling));

        _this2.unmatchedAttributes = null;
        _this2.blockDepth = 0;
        if (nextSibling) throw new Error('Rehydration with nextSibling not supported');
        var node = _this2.currentCursor.element.firstChild;
        while (node !== null) {
            if (isComment(node) && isSerializationFirstNode(node)) {
                break;
            }
            node = node.nextSibling;
        }
        false && assert(node, 'Must have opening comment <!--' + SERIALIZATION_FIRST_NODE_STRING + '--> for rehydration.');

        _this2.candidate = node;
        return _this2;
    }

    RehydrateBuilder.prototype.pushElement = function pushElement(element) {
        var nextSibling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var _blockDepth = this.blockDepth,
            blockDepth = _blockDepth === undefined ? 0 : _blockDepth;

        var cursor = new RehydratingCursor(element, nextSibling, blockDepth);
        var currentCursor = this.currentCursor;
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
        this[CURSOR_STACK].push(cursor);
    };

    RehydrateBuilder.prototype.clearMismatch = function clearMismatch(candidate) {
        var current = candidate;
        var currentCursor = this.currentCursor;
        if (currentCursor !== null) {
            var openBlockDepth = currentCursor.openBlockDepth;
            if (openBlockDepth >= currentCursor.startingBlockDepth) {
                while (current && !(isComment(current) && getCloseBlockDepth(current) === openBlockDepth)) {
                    current = this.remove(current);
                }
                false && assert(current !== null, 'should have found closing block');
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
    };

    RehydrateBuilder.prototype.__openBlock = function __openBlock() {
        var currentCursor = this.currentCursor;

        if (currentCursor === null) return;
        var blockDepth = this.blockDepth;
        this.blockDepth++;
        var candidate = currentCursor.candidate;

        if (candidate === null) return;
        var tagName = currentCursor.element.tagName;

        if (isComment(candidate) && getOpenBlockDepth(candidate) === blockDepth) {
            currentCursor.candidate = this.remove(candidate);
            currentCursor.openBlockDepth = blockDepth;
        } else if (tagName !== 'TITLE' && tagName !== 'SCRIPT' && tagName !== 'STYLE') {
            this.clearMismatch(candidate);
        }
    };

    RehydrateBuilder.prototype.__closeBlock = function __closeBlock() {
        var currentCursor = this.currentCursor;

        if (currentCursor === null) return;
        // openBlock is the last rehydrated open block
        var openBlockDepth = currentCursor.openBlockDepth;
        // this currently is the expected next open block depth
        this.blockDepth--;
        var candidate = currentCursor.candidate;
        // rehydrating

        if (candidate !== null) {
            false && assert(openBlockDepth === this.blockDepth, 'when rehydrating, openBlockDepth should match this.blockDepth here');

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
            false && assert(currentCursor.nextSibling !== null && isComment(currentCursor.nextSibling) && getCloseBlockDepth(currentCursor.nextSibling) === openBlockDepth, 'expected close block to match rehydrated open block');

            currentCursor.candidate = this.remove(currentCursor.nextSibling);
            currentCursor.openBlockDepth--;
        }
    };

    RehydrateBuilder.prototype.__appendNode = function __appendNode(node) {
        var candidate = this.candidate;
        // This code path is only used when inserting precisely one node. It needs more
        // comparison logic, but we can probably lean on the cases where this code path
        // is actually used.

        if (candidate) {
            return candidate;
        } else {
            return _NewElementBuilder.prototype.__appendNode.call(this, node);
        }
    };

    RehydrateBuilder.prototype.__appendHTML = function __appendHTML(html) {
        var candidateBounds = this.markerBounds();
        if (candidateBounds) {
            var first = candidateBounds.firstNode();
            var last = candidateBounds.lastNode();
            var newBounds = new ConcreteBounds(this.element, first.nextSibling, last.previousSibling);
            var possibleEmptyMarker = this.remove(first);
            this.remove(last);
            if (possibleEmptyMarker !== null && isEmpty(possibleEmptyMarker)) {
                this.candidate = this.remove(possibleEmptyMarker);
                if (this.candidate !== null) {
                    this.clearMismatch(this.candidate);
                }
            }
            return newBounds;
        } else {
            return _NewElementBuilder.prototype.__appendHTML.call(this, html);
        }
    };

    RehydrateBuilder.prototype.remove = function remove(node) {
        var element = node.parentNode;
        var next = node.nextSibling;
        element.removeChild(node);
        return next;
    };

    RehydrateBuilder.prototype.markerBounds = function markerBounds() {
        var _candidate = this.candidate;
        if (_candidate && isMarker(_candidate)) {
            var first = _candidate;
            var last = first.nextSibling;
            while (last && !isMarker(last)) {
                last = last.nextSibling;
            }
            return new ConcreteBounds(this.element, first, last);
        } else {
            return null;
        }
    };

    RehydrateBuilder.prototype.__appendText = function __appendText(string) {
        var candidate = this.candidate;

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
                var next = this.remove(candidate);
                this.candidate = next;
                var text = this.dom.createTextNode(string);
                this.dom.insertBefore(this.element, text, next);
                return text;
            } else {
                this.clearMismatch(candidate);
                return _NewElementBuilder.prototype.__appendText.call(this, string);
            }
        } else {
            return _NewElementBuilder.prototype.__appendText.call(this, string);
        }
    };

    RehydrateBuilder.prototype.__appendComment = function __appendComment(string) {
        var _candidate = this.candidate;
        if (_candidate && isComment(_candidate)) {
            if (_candidate.nodeValue !== string) {
                _candidate.nodeValue = string;
            }
            this.candidate = _candidate.nextSibling;
            return _candidate;
        } else if (_candidate) {
            this.clearMismatch(_candidate);
        }
        return _NewElementBuilder.prototype.__appendComment.call(this, string);
    };

    RehydrateBuilder.prototype.__openElement = function __openElement(tag) {
        var _candidate = this.candidate;
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
        return _NewElementBuilder.prototype.__openElement.call(this, tag);
    };

    RehydrateBuilder.prototype.__setAttribute = function __setAttribute(name, value, namespace) {
        var unmatched = this.unmatchedAttributes;
        if (unmatched) {
            var attr = findByName(unmatched, name);
            if (attr) {
                if (attr.value !== value) {
                    attr.value = value;
                }
                unmatched.splice(unmatched.indexOf(attr), 1);
                return;
            }
        }
        return _NewElementBuilder.prototype.__setAttribute.call(this, name, value, namespace);
    };

    RehydrateBuilder.prototype.__setProperty = function __setProperty(name, value) {
        var unmatched = this.unmatchedAttributes;
        if (unmatched) {
            var attr = findByName(unmatched, name);
            if (attr) {
                if (attr.value !== value) {
                    attr.value = value;
                }
                unmatched.splice(unmatched.indexOf(attr), 1);
                return;
            }
        }
        return _NewElementBuilder.prototype.__setProperty.call(this, name, value);
    };

    RehydrateBuilder.prototype.__flushElement = function __flushElement(parent, constructing) {
        var unmatched = this.unmatchedAttributes;

        if (unmatched) {
            for (var i = 0; i < unmatched.length; i++) {
                this.constructing.removeAttribute(unmatched[i].name);
            }
            this.unmatchedAttributes = null;
        } else {
            _NewElementBuilder.prototype.__flushElement.call(this, parent, constructing);
        }
    };

    RehydrateBuilder.prototype.willCloseElement = function willCloseElement() {
        var candidate = this.candidate,
            currentCursor = this.currentCursor;

        if (candidate !== null) {
            this.clearMismatch(candidate);
        }
        if (currentCursor && currentCursor.injectedOmittedNode) {
            this.popElement();
        }
        _NewElementBuilder.prototype.willCloseElement.call(this);
    };

    RehydrateBuilder.prototype.getMarker = function getMarker(element, guid) {
        var marker = element.querySelector('script[glmr="' + guid + '"]');
        if (marker) {
            return marker;
        }
        return null;
    };

    RehydrateBuilder.prototype.__pushRemoteElement = function __pushRemoteElement(element, cursorId, insertBefore) {
        var marker = this.getMarker(element, cursorId);
        false && assert(!marker || marker.parentNode === element, 'expected remote element marker\'s parent node to match remote element');

        if (insertBefore === undefined) {
            while (element.lastChild !== marker) {
                this.remove(element.lastChild);
            }
        }
        var currentCursor = this.currentCursor;
        var candidate = currentCursor.candidate;
        this.pushElement(element, insertBefore);
        currentCursor.candidate = candidate;
        this.candidate = marker ? this.remove(marker) : null;
        var block = new RemoteLiveBlock(element);
        return this.pushLiveBlock(block, true);
    };

    RehydrateBuilder.prototype.didAppendBounds = function didAppendBounds(bounds) {
        _NewElementBuilder.prototype.didAppendBounds.call(this, bounds);
        if (this.candidate) {
            var last = bounds.lastNode();
            this.candidate = last && last.nextSibling;
        }
        return bounds;
    };

    _createClass(RehydrateBuilder, [{
        key: 'currentCursor',
        get: function get() {
            return this[CURSOR_STACK].current;
        }
    }, {
        key: 'candidate',
        get: function get() {
            if (this.currentCursor) {
                return this.currentCursor.candidate;
            }
            return null;
        },
        set: function set(node) {
            this.currentCursor.candidate = node;
        }
    }]);

    return RehydrateBuilder;
}(NewElementBuilder);
function isTextNode(node) {
    return node.nodeType === 3;
}
function isComment(node) {
    return node.nodeType === 8;
}
function getOpenBlockDepth(node) {
    var boundsDepth = node.nodeValue.match(/^%\+b:(\d+)%$/);
    if (boundsDepth && boundsDepth[1]) {
        return Number(boundsDepth[1]);
    } else {
        return null;
    }
}
function getCloseBlockDepth(node) {
    var boundsDepth = node.nodeValue.match(/^%\-b:(\d+)%$/);
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
    for (var i = 0; i < array.length; i++) {
        var attr = array[i];
        if (attr.name === name) return attr;
    }
    return undefined;
}
export function rehydrationBuilder(env, cursor) {
    return RehydrateBuilder.forInitialRender(env, cursor);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL3JlaHlkcmF0ZS1idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSxTQUFBLE1BQUEsUUFBQSxlQUFBO0FBVUEsU0FBQSxjQUFBLEVBQUEsVUFBQSxRQUFBLFdBQUE7QUFDQSxTQUFBLFlBQUEsRUFBQSxpQkFBQSxFQUFBLGVBQUEsUUFBQSxtQkFBQTtBQUVBLE9BQU8sSUFBTSxrQ0FBTixRQUFBO0FBRVAsT0FBTSxTQUFBLHdCQUFBLENBQUEsSUFBQSxFQUFtRDtBQUN2RCxXQUFPLEtBQUEsU0FBQSxLQUFQLCtCQUFBO0FBQ0Q7QUFFRCxXQUFNLGlCQUFOO0FBQUE7O0FBSUUsK0JBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxrQkFBQSxFQUc0QztBQUFBOztBQUFBLHFEQUUxQyx1QkFBQSxPQUFBLEVBQUEsV0FBQSxDQUYwQzs7QUFBMUIsY0FBQSxrQkFBQSxHQUFBLGtCQUFBO0FBTmxCLGNBQUEsU0FBQSxHQUFBLElBQUE7QUFFQSxjQUFBLG1CQUFBLEdBQUEsS0FBQTtBQU9FLGNBQUEsY0FBQSxHQUFzQixxQkFBdEIsQ0FBQTtBQUgwQztBQUkzQzs7QUFYSDtBQUFBLEVBQU0sVUFBTjtBQWNBLFdBQU0sZ0JBQU47QUFBQTs7QUFLRTtBQUVBLDhCQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUF3RjtBQUFBOztBQUFBLHNEQUN0Riw4QkFBQSxHQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsQ0FEc0Y7O0FBTmhGLGVBQUEsbUJBQUEsR0FBQSxJQUFBO0FBRUEsZUFBQSxVQUFBLEdBQUEsQ0FBQTtBQU1OLFlBQUEsV0FBQSxFQUFpQixNQUFNLElBQUEsS0FBQSxDQUFOLDRDQUFNLENBQU47QUFFakIsWUFBSSxPQUFPLE9BQUEsYUFBQSxDQUFBLE9BQUEsQ0FBWCxVQUFBO0FBRUEsZUFBTyxTQUFQLElBQUEsRUFBc0I7QUFDcEIs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LFdBQU8saUJBQUEsZ0JBQUEsQ0FBQSxHQUFBLEVBQVAsTUFBTyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCb3VuZHMsIEVudmlyb25tZW50LCBPcHRpb24sIEVsZW1lbnRCdWlsZGVyIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NlcnQsIGV4cGVjdCwgU3RhY2ssIE1heWJlIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQge1xuICBBdHRyTmFtZXNwYWNlLFxuICBOYW1lc3BhY2UsXG4gIFNpbXBsZUF0dHIsXG4gIFNpbXBsZUNvbW1lbnQsXG4gIFNpbXBsZUVsZW1lbnQsXG4gIFNpbXBsZU5vZGUsXG4gIFNpbXBsZVRleHQsXG59IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBDb25jcmV0ZUJvdW5kcywgQ3Vyc29ySW1wbCB9IGZyb20gJy4uL2JvdW5kcyc7XG5pbXBvcnQgeyBDVVJTT1JfU1RBQ0ssIE5ld0VsZW1lbnRCdWlsZGVyLCBSZW1vdGVMaXZlQmxvY2sgfSBmcm9tICcuL2VsZW1lbnQtYnVpbGRlcic7XG5cbmV4cG9ydCBjb25zdCBTRVJJQUxJWkFUSU9OX0ZJUlNUX05PREVfU1RSSU5HID0gJyUrYjowJSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NlcmlhbGl6YXRpb25GaXJzdE5vZGUobm9kZTogU2ltcGxlTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5ub2RlVmFsdWUgPT09IFNFUklBTElaQVRJT05fRklSU1RfTk9ERV9TVFJJTkc7XG59XG5cbmV4cG9ydCBjbGFzcyBSZWh5ZHJhdGluZ0N1cnNvciBleHRlbmRzIEN1cnNvckltcGwge1xuICBjYW5kaWRhdGU6IE9wdGlvbjxTaW1wbGVOb2RlPiA9IG51bGw7XG4gIG9wZW5CbG9ja0RlcHRoOiBudW1iZXI7XG4gIGluamVjdGVkT21pdHRlZE5vZGUgPSBmYWxzZTtcbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+LFxuICAgIHB1YmxpYyByZWFkb25seSBzdGFydGluZ0Jsb2NrRGVwdGg6IG51bWJlclxuICApIHtcbiAgICBzdXBlcihlbGVtZW50LCBuZXh0U2libGluZyk7XG4gICAgdGhpcy5vcGVuQmxvY2tEZXB0aCA9IHN0YXJ0aW5nQmxvY2tEZXB0aCAtIDE7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlaHlkcmF0ZUJ1aWxkZXIgZXh0ZW5kcyBOZXdFbGVtZW50QnVpbGRlciBpbXBsZW1lbnRzIEVsZW1lbnRCdWlsZGVyIHtcbiAgcHJpdmF0ZSB1bm1hdGNoZWRBdHRyaWJ1dGVzOiBPcHRpb248U2ltcGxlQXR0cltdPiA9IG51bGw7XG4gIFtDVVJTT1JfU1RBQ0tdITogU3RhY2s8UmVoeWRyYXRpbmdDdXJzb3I+OyAvLyBIaWRlcyBwcm9wZXJ0eSBvbiBiYXNlIGNsYXNzXG4gIHByaXZhdGUgYmxvY2tEZXB0aCA9IDA7XG5cbiAgLy8gcHJpdmF0ZSBjYW5kaWRhdGU6IE9wdGlvbjxTaW1wbGVOb2RlPiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoZW52OiBFbnZpcm9ubWVudCwgcGFyZW50Tm9kZTogU2ltcGxlRWxlbWVudCwgbmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPikge1xuICAgIHN1cGVyKGVudiwgcGFyZW50Tm9kZSwgbmV4dFNpYmxpbmcpO1xuICAgIGlmIChuZXh0U2libGluZykgdGhyb3cgbmV3IEVycm9yKCdSZWh5ZHJhdGlvbiB3aXRoIG5leHRTaWJsaW5nIG5vdCBzdXBwb3J0ZWQnKTtcblxuICAgIGxldCBub2RlID0gdGhpcy5jdXJyZW50Q3Vyc29yIS5lbGVtZW50LmZpcnN0Q2hpbGQ7XG5cbiAgICB3aGlsZSAobm9kZSAhPT0gbnVsbCkge1xuICAgICAgaWYgKGlzQ29tbWVudChub2RlKSAmJiBpc1NlcmlhbGl6YXRpb25GaXJzdE5vZGUobm9kZSkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBub2RlID0gbm9kZS5uZXh0U2libGluZztcbiAgICB9XG5cbiAgICBhc3NlcnQoXG4gICAgICBub2RlLFxuICAgICAgYE11c3QgaGF2ZSBvcGVuaW5nIGNvbW1lbnQgPCEtLSR7U0VSSUFMSVpBVElPTl9GSVJTVF9OT0RFX1NUUklOR30tLT4gZm9yIHJlaHlkcmF0aW9uLmBcbiAgICApO1xuICAgIHRoaXMuY2FuZGlkYXRlID0gbm9kZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50Q3Vyc29yKCk6IE9wdGlvbjxSZWh5ZHJhdGluZ0N1cnNvcj4ge1xuICAgIHJldHVybiB0aGlzW0NVUlNPUl9TVEFDS10uY3VycmVudDtcbiAgfVxuXG4gIGdldCBjYW5kaWRhdGUoKTogT3B0aW9uPFNpbXBsZU5vZGU+IHtcbiAgICBpZiAodGhpcy5jdXJyZW50Q3Vyc29yKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZSE7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBzZXQgY2FuZGlkYXRlKG5vZGU6IE9wdGlvbjxTaW1wbGVOb2RlPikge1xuICAgIHRoaXMuY3VycmVudEN1cnNvciEuY2FuZGlkYXRlID0gbm9kZTtcbiAgfVxuXG4gIHB1c2hFbGVtZW50KGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsIG5leHRTaWJsaW5nOiBNYXliZTxTaW1wbGVOb2RlPiA9IG51bGwpIHtcbiAgICBsZXQgeyBibG9ja0RlcHRoID0gMCB9ID0gdGhpcztcbiAgICBsZXQgY3Vyc29yID0gbmV3IFJlaHlkcmF0aW5nQ3Vyc29yKGVsZW1lbnQsIG5leHRTaWJsaW5nLCBibG9ja0RlcHRoKTtcbiAgICBsZXQgY3VycmVudEN1cnNvciA9IHRoaXMuY3VycmVudEN1cnNvcjtcbiAgICBpZiAoY3VycmVudEN1cnNvcikge1xuICAgICAgaWYgKGN1cnJlbnRDdXJzb3IuY2FuZGlkYXRlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiA8ZGl2PiAgIDwtLS0tLS0tLS0tLS0tLS0gIGN1cnJlbnRDdXJzb3IuZWxlbWVudFxuICAgICAgICAgKiAgIDwhLS0lK2I6MSUtLT5cbiAgICAgICAgICogICA8ZGl2PiA8LS0tLS0tLS0tLS0tLS0tICBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZSAtPiBjdXJzb3IuZWxlbWVudFxuICAgICAgICAgKiAgICAgPCEtLSUrYjoyJS0tPiA8LSAgY3VycmVudEN1cnNvci5jYW5kaWRhdGUuZmlyc3RDaGlsZCAtPiBjdXJzb3IuY2FuZGlkYXRlXG4gICAgICAgICAqICAgICBGb29cbiAgICAgICAgICogICAgIDwhLS0lLWI6MiUtLT5cbiAgICAgICAgICogICA8L2Rpdj5cbiAgICAgICAgICogICA8IS0tJS1iOjElLS0+ICA8LS0gIGJlY29tZXMgY3VycmVudEN1cnNvci5jYW5kaWRhdGVcbiAgICAgICAgICovXG5cbiAgICAgICAgLy8gd2hlcmUgdG8gcmVoeWRyYXRlIGZyb20gaWYgd2UgYXJlIGluIHJlaHlkcmF0aW9uIG1vZGVcbiAgICAgICAgY3Vyc29yLmNhbmRpZGF0ZSA9IGVsZW1lbnQuZmlyc3RDaGlsZDtcbiAgICAgICAgLy8gd2hlcmUgdG8gY29udGludWUgd2hlbiB3ZSBwb3BcbiAgICAgICAgY3VycmVudEN1cnNvci5jYW5kaWRhdGUgPSBlbGVtZW50Lm5leHRTaWJsaW5nO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzW0NVUlNPUl9TVEFDS10ucHVzaChjdXJzb3IpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhck1pc21hdGNoKGNhbmRpZGF0ZTogU2ltcGxlTm9kZSkge1xuICAgIGxldCBjdXJyZW50OiBPcHRpb248U2ltcGxlTm9kZT4gPSBjYW5kaWRhdGU7XG4gICAgbGV0IGN1cnJlbnRDdXJzb3IgPSB0aGlzLmN1cnJlbnRDdXJzb3I7XG4gICAgaWYgKGN1cnJlbnRDdXJzb3IgIT09IG51bGwpIHtcbiAgICAgIGxldCBvcGVuQmxvY2tEZXB0aCA9IGN1cnJlbnRDdXJzb3Iub3BlbkJsb2NrRGVwdGg7XG4gICAgICBpZiAob3BlbkJsb2NrRGVwdGggPj0gY3VycmVudEN1cnNvci5zdGFydGluZ0Jsb2NrRGVwdGgpIHtcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQgJiYgIShpc0NvbW1lbnQoY3VycmVudCkgJiYgZ2V0Q2xvc2VCbG9ja0RlcHRoKGN1cnJlbnQpID09PSBvcGVuQmxvY2tEZXB0aCkpIHtcbiAgICAgICAgICBjdXJyZW50ID0gdGhpcy5yZW1vdmUoY3VycmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgYXNzZXJ0KGN1cnJlbnQgIT09IG51bGwsICdzaG91bGQgaGF2ZSBmb3VuZCBjbG9zaW5nIGJsb2NrJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLnJlbW92ZShjdXJyZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gY3VycmVudCBjdXJzb3IgcGFyZW50Tm9kZSBzaG91bGQgYmUgb3BlbkNhbmRpZGF0ZSBpZiBlbGVtZW50XG4gICAgICAvLyBvciBvcGVuQ2FuZGlkYXRlLnBhcmVudE5vZGUgaWYgY29tbWVudFxuICAgICAgY3VycmVudEN1cnNvci5uZXh0U2libGluZyA9IGN1cnJlbnQ7XG4gICAgICAvLyBkaXNhYmxlIHJlaHlkcmF0aW9uIHVudGlsIHdlIHBvcEVsZW1lbnQgb3IgY2xvc2VCbG9jayBmb3Igb3BlbkJsb2NrRGVwdGhcbiAgICAgIGN1cnJlbnRDdXJzb3IuY2FuZGlkYXRlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfX29wZW5CbG9jaygpOiB2b2lkIHtcbiAgICBsZXQgeyBjdXJyZW50Q3Vyc29yIH0gPSB0aGlzO1xuICAgIGlmIChjdXJyZW50Q3Vyc29yID09PSBudWxsKSByZXR1cm47XG5cbiAgICBsZXQgYmxvY2tEZXB0aCA9IHRoaXMuYmxvY2tEZXB0aDtcblxuICAgIHRoaXMuYmxvY2tEZXB0aCsrO1xuXG4gICAgbGV0IHsgY2FuZGlkYXRlIH0gPSBjdXJyZW50Q3Vyc29yO1xuICAgIGlmIChjYW5kaWRhdGUgPT09IG51bGwpIHJldHVybjtcblxuICAgIGxldCB7IHRhZ05hbWUgfSA9IGN1cnJlbnRDdXJzb3IuZWxlbWVudDtcblxuICAgIGlmIChpc0NvbW1lbnQoY2FuZGlkYXRlKSAmJiBnZXRPcGVuQmxvY2tEZXB0aChjYW5kaWRhdGUpID09PSBibG9ja0RlcHRoKSB7XG4gICAgICBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZSA9IHRoaXMucmVtb3ZlKGNhbmRpZGF0ZSk7XG4gICAgICBjdXJyZW50Q3Vyc29yLm9wZW5CbG9ja0RlcHRoID0gYmxvY2tEZXB0aDtcbiAgICB9IGVsc2UgaWYgKHRhZ05hbWUgIT09ICdUSVRMRScgJiYgdGFnTmFtZSAhPT0gJ1NDUklQVCcgJiYgdGFnTmFtZSAhPT0gJ1NUWUxFJykge1xuICAgICAgdGhpcy5jbGVhck1pc21hdGNoKGNhbmRpZGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgX19jbG9zZUJsb2NrKCk6IHZvaWQge1xuICAgIGxldCB7IGN1cnJlbnRDdXJzb3IgfSA9IHRoaXM7XG4gICAgaWYgKGN1cnJlbnRDdXJzb3IgPT09IG51bGwpIHJldHVybjtcblxuICAgIC8vIG9wZW5CbG9jayBpcyB0aGUgbGFzdCByZWh5ZHJhdGVkIG9wZW4gYmxvY2tcbiAgICBsZXQgb3BlbkJsb2NrRGVwdGggPSBjdXJyZW50Q3Vyc29yLm9wZW5CbG9ja0RlcHRoO1xuXG4gICAgLy8gdGhpcyBjdXJyZW50bHkgaXMgdGhlIGV4cGVjdGVkIG5leHQgb3BlbiBibG9jayBkZXB0aFxuICAgIHRoaXMuYmxvY2tEZXB0aC0tO1xuXG4gICAgbGV0IHsgY2FuZGlkYXRlIH0gPSBjdXJyZW50Q3Vyc29yO1xuICAgIC8vIHJlaHlkcmF0aW5nXG4gICAgaWYgKGNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgYXNzZXJ0KFxuICAgICAgICBvcGVuQmxvY2tEZXB0aCA9PT0gdGhpcy5ibG9ja0RlcHRoLFxuICAgICAgICAnd2hlbiByZWh5ZHJhdGluZywgb3BlbkJsb2NrRGVwdGggc2hvdWxkIG1hdGNoIHRoaXMuYmxvY2tEZXB0aCBoZXJlJ1xuICAgICAgKTtcbiAgICAgIGlmIChpc0NvbW1lbnQoY2FuZGlkYXRlKSAmJiBnZXRDbG9zZUJsb2NrRGVwdGgoY2FuZGlkYXRlKSA9PT0gb3BlbkJsb2NrRGVwdGgpIHtcbiAgICAgICAgY3VycmVudEN1cnNvci5jYW5kaWRhdGUgPSB0aGlzLnJlbW92ZShjYW5kaWRhdGUpO1xuICAgICAgICBjdXJyZW50Q3Vyc29yLm9wZW5CbG9ja0RlcHRoLS07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsZWFyTWlzbWF0Y2goY2FuZGlkYXRlKTtcbiAgICAgIH1cbiAgICAgIC8vIGlmIHRoZSBvcGVuQmxvY2tEZXB0aCBtYXRjaGVzIHRoZSBibG9ja0RlcHRoIHdlIGp1c3QgY2xvc2VkIHRvXG4gICAgICAvLyB0aGVuIHJlc3RvcmUgcmVoeWRyYXRpb25cbiAgICB9XG4gICAgaWYgKGN1cnJlbnRDdXJzb3Iub3BlbkJsb2NrRGVwdGggPT09IHRoaXMuYmxvY2tEZXB0aCkge1xuICAgICAgYXNzZXJ0KFxuICAgICAgICBjdXJyZW50Q3Vyc29yLm5leHRTaWJsaW5nICE9PSBudWxsICYmXG4gICAgICAgICAgaXNDb21tZW50KGN1cnJlbnRDdXJzb3IubmV4dFNpYmxpbmcpICYmXG4gICAgICAgICAgZ2V0Q2xvc2VCbG9ja0RlcHRoKGN1cnJlbnRDdXJzb3IubmV4dFNpYmxpbmcpID09PSBvcGVuQmxvY2tEZXB0aCxcbiAgICAgICAgJ2V4cGVjdGVkIGNsb3NlIGJsb2NrIHRvIG1hdGNoIHJlaHlkcmF0ZWQgb3BlbiBibG9jaydcbiAgICAgICk7XG4gICAgICBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZSA9IHRoaXMucmVtb3ZlKGN1cnJlbnRDdXJzb3IubmV4dFNpYmxpbmchKTtcbiAgICAgIGN1cnJlbnRDdXJzb3Iub3BlbkJsb2NrRGVwdGgtLTtcbiAgICB9XG4gIH1cblxuICBfX2FwcGVuZE5vZGUobm9kZTogU2ltcGxlTm9kZSk6IFNpbXBsZU5vZGUge1xuICAgIGxldCB7IGNhbmRpZGF0ZSB9ID0gdGhpcztcblxuICAgIC8vIFRoaXMgY29kZSBwYXRoIGlzIG9ubHkgdXNlZCB3aGVuIGluc2VydGluZyBwcmVjaXNlbHkgb25lIG5vZGUuIEl0IG5lZWRzIG1vcmVcbiAgICAvLyBjb21wYXJpc29uIGxvZ2ljLCBidXQgd2UgY2FuIHByb2JhYmx5IGxlYW4gb24gdGhlIGNhc2VzIHdoZXJlIHRoaXMgY29kZSBwYXRoXG4gICAgLy8gaXMgYWN0dWFsbHkgdXNlZC5cbiAgICBpZiAoY2FuZGlkYXRlKSB7XG4gICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuX19hcHBlbmROb2RlKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIF9fYXBwZW5kSFRNTChodG1sOiBzdHJpbmcpOiBCb3VuZHMge1xuICAgIGxldCBjYW5kaWRhdGVCb3VuZHMgPSB0aGlzLm1hcmtlckJvdW5kcygpO1xuXG4gICAgaWYgKGNhbmRpZGF0ZUJvdW5kcykge1xuICAgICAgbGV0IGZpcnN0ID0gY2FuZGlkYXRlQm91bmRzLmZpcnN0Tm9kZSgpITtcbiAgICAgIGxldCBsYXN0ID0gY2FuZGlkYXRlQm91bmRzLmxhc3ROb2RlKCkhO1xuXG4gICAgICBsZXQgbmV3Qm91bmRzID0gbmV3IENvbmNyZXRlQm91bmRzKHRoaXMuZWxlbWVudCwgZmlyc3QubmV4dFNpYmxpbmchLCBsYXN0LnByZXZpb3VzU2libGluZyEpO1xuXG4gICAgICBsZXQgcG9zc2libGVFbXB0eU1hcmtlciA9IHRoaXMucmVtb3ZlKGZpcnN0KTtcbiAgICAgIHRoaXMucmVtb3ZlKGxhc3QpO1xuXG4gICAgICBpZiAocG9zc2libGVFbXB0eU1hcmtlciAhPT0gbnVsbCAmJiBpc0VtcHR5KHBvc3NpYmxlRW1wdHlNYXJrZXIpKSB7XG4gICAgICAgIHRoaXMuY2FuZGlkYXRlID0gdGhpcy5yZW1vdmUocG9zc2libGVFbXB0eU1hcmtlcik7XG5cbiAgICAgICAgaWYgKHRoaXMuY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5jbGVhck1pc21hdGNoKHRoaXMuY2FuZGlkYXRlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3Qm91bmRzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuX19hcHBlbmRIVE1MKGh0bWwpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCByZW1vdmUobm9kZTogU2ltcGxlTm9kZSk6IE9wdGlvbjxTaW1wbGVOb2RlPiB7XG4gICAgbGV0IGVsZW1lbnQgPSBleHBlY3Qobm9kZS5wYXJlbnROb2RlLCBgY2Fubm90IHJlbW92ZSBhIGRldGFjaGVkIG5vZGVgKSBhcyBTaW1wbGVFbGVtZW50O1xuICAgIGxldCBuZXh0ID0gbm9kZS5uZXh0U2libGluZztcbiAgICBlbGVtZW50LnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIHJldHVybiBuZXh0O1xuICB9XG5cbiAgcHJpdmF0ZSBtYXJrZXJCb3VuZHMoKTogT3B0aW9uPEJvdW5kcz4ge1xuICAgIGxldCBfY2FuZGlkYXRlID0gdGhpcy5jYW5kaWRhdGU7XG5cbiAgICBpZiAoX2NhbmRpZGF0ZSAmJiBpc01hcmtlcihfY2FuZGlkYXRlKSkge1xuICAgICAgbGV0IGZpcnN0ID0gX2NhbmRpZGF0ZTtcbiAgICAgIGxldCBsYXN0ID0gZXhwZWN0KGZpcnN0Lm5leHRTaWJsaW5nLCBgQlVHOiBzZXJpYWxpemF0aW9uIG1hcmtlcnMgbXVzdCBiZSBwYWlyZWRgKTtcblxuICAgICAgd2hpbGUgKGxhc3QgJiYgIWlzTWFya2VyKGxhc3QpKSB7XG4gICAgICAgIGxhc3QgPSBleHBlY3QobGFzdC5uZXh0U2libGluZywgYEJVRzogc2VyaWFsaXphdGlvbiBtYXJrZXJzIG11c3QgYmUgcGFpcmVkYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgQ29uY3JldGVCb3VuZHModGhpcy5lbGVtZW50LCBmaXJzdCwgbGFzdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9fYXBwZW5kVGV4dChzdHJpbmc6IHN0cmluZyk6IFNpbXBsZVRleHQge1xuICAgIGxldCB7IGNhbmRpZGF0ZSB9ID0gdGhpcztcblxuICAgIGlmIChjYW5kaWRhdGUpIHtcbiAgICAgIGlmIChpc1RleHROb2RlKGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5ub2RlVmFsdWUgIT09IHN0cmluZykge1xuICAgICAgICAgIGNhbmRpZGF0ZS5ub2RlVmFsdWUgPSBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYW5kaWRhdGUgPSBjYW5kaWRhdGUubmV4dFNpYmxpbmc7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICB9IGVsc2UgaWYgKGNhbmRpZGF0ZSAmJiAoaXNTZXBhcmF0b3IoY2FuZGlkYXRlKSB8fCBpc0VtcHR5KGNhbmRpZGF0ZSkpKSB7XG4gICAgICAgIHRoaXMuY2FuZGlkYXRlID0gY2FuZGlkYXRlLm5leHRTaWJsaW5nO1xuICAgICAgICB0aGlzLnJlbW92ZShjYW5kaWRhdGUpO1xuICAgICAgICByZXR1cm4gdGhpcy5fX2FwcGVuZFRleHQoc3RyaW5nKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNFbXB0eShjYW5kaWRhdGUpKSB7XG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5yZW1vdmUoY2FuZGlkYXRlKTtcbiAgICAgICAgdGhpcy5jYW5kaWRhdGUgPSBuZXh0O1xuICAgICAgICBsZXQgdGV4dCA9IHRoaXMuZG9tLmNyZWF0ZVRleHROb2RlKHN0cmluZyk7XG4gICAgICAgIHRoaXMuZG9tLmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIHRleHQsIG5leHQpO1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2xlYXJNaXNtYXRjaChjYW5kaWRhdGUpO1xuICAgICAgICByZXR1cm4gc3VwZXIuX19hcHBlbmRUZXh0KHN0cmluZyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdXBlci5fX2FwcGVuZFRleHQoc3RyaW5nKTtcbiAgICB9XG4gIH1cblxuICBfX2FwcGVuZENvbW1lbnQoc3RyaW5nOiBzdHJpbmcpOiBTaW1wbGVDb21tZW50IHtcbiAgICBsZXQgX2NhbmRpZGF0ZSA9IHRoaXMuY2FuZGlkYXRlO1xuICAgIGlmIChfY2FuZGlkYXRlICYmIGlzQ29tbWVudChfY2FuZGlkYXRlKSkge1xuICAgICAgaWYgKF9jYW5kaWRhdGUubm9kZVZhbHVlICE9PSBzdHJpbmcpIHtcbiAgICAgICAgX2NhbmRpZGF0ZS5ub2RlVmFsdWUgPSBzdHJpbmc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2FuZGlkYXRlID0gX2NhbmRpZGF0ZS5uZXh0U2libGluZztcbiAgICAgIHJldHVybiBfY2FuZGlkYXRlO1xuICAgIH0gZWxzZSBpZiAoX2NhbmRpZGF0ZSkge1xuICAgICAgdGhpcy5jbGVhck1pc21hdGNoKF9jYW5kaWRhdGUpO1xuICAgIH1cblxuICAgIHJldHVybiBzdXBlci5fX2FwcGVuZENvbW1lbnQoc3RyaW5nKTtcbiAgfVxuXG4gIF9fb3BlbkVsZW1lbnQodGFnOiBzdHJpbmcpOiBTaW1wbGVFbGVtZW50IHtcbiAgICBsZXQgX2NhbmRpZGF0ZSA9IHRoaXMuY2FuZGlkYXRlO1xuXG4gICAgaWYgKF9jYW5kaWRhdGUgJiYgaXNFbGVtZW50KF9jYW5kaWRhdGUpICYmIGlzU2FtZU5vZGVUeXBlKF9jYW5kaWRhdGUsIHRhZykpIHtcbiAgICAgIHRoaXMudW5tYXRjaGVkQXR0cmlidXRlcyA9IFtdLnNsaWNlLmNhbGwoX2NhbmRpZGF0ZS5hdHRyaWJ1dGVzKTtcbiAgICAgIHJldHVybiBfY2FuZGlkYXRlO1xuICAgIH0gZWxzZSBpZiAoX2NhbmRpZGF0ZSkge1xuICAgICAgaWYgKGlzRWxlbWVudChfY2FuZGlkYXRlKSAmJiBfY2FuZGlkYXRlLnRhZ05hbWUgPT09ICdUQk9EWScpIHtcbiAgICAgICAgdGhpcy5wdXNoRWxlbWVudChfY2FuZGlkYXRlLCBudWxsKTtcbiAgICAgICAgdGhpcy5jdXJyZW50Q3Vyc29yIS5pbmplY3RlZE9taXR0ZWROb2RlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19vcGVuRWxlbWVudCh0YWcpO1xuICAgICAgfVxuICAgICAgdGhpcy5jbGVhck1pc21hdGNoKF9jYW5kaWRhdGUpO1xuICAgIH1cblxuICAgIHJldHVybiBzdXBlci5fX29wZW5FbGVtZW50KHRhZyk7XG4gIH1cblxuICBfX3NldEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+KTogdm9pZCB7XG4gICAgbGV0IHVubWF0Y2hlZCA9IHRoaXMudW5tYXRjaGVkQXR0cmlidXRlcztcblxuICAgIGlmICh1bm1hdGNoZWQpIHtcbiAgICAgIGxldCBhdHRyID0gZmluZEJ5TmFtZSh1bm1hdGNoZWQsIG5hbWUpO1xuICAgICAgaWYgKGF0dHIpIHtcbiAgICAgICAgaWYgKGF0dHIudmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgYXR0ci52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHVubWF0Y2hlZC5zcGxpY2UodW5tYXRjaGVkLmluZGV4T2YoYXR0ciksIDEpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyLl9fc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlLCBuYW1lc3BhY2UpO1xuICB9XG5cbiAgX19zZXRQcm9wZXJ0eShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgdW5tYXRjaGVkID0gdGhpcy51bm1hdGNoZWRBdHRyaWJ1dGVzO1xuXG4gICAgaWYgKHVubWF0Y2hlZCkge1xuICAgICAgbGV0IGF0dHIgPSBmaW5kQnlOYW1lKHVubWF0Y2hlZCwgbmFtZSk7XG4gICAgICBpZiAoYXR0cikge1xuICAgICAgICBpZiAoYXR0ci52YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICBhdHRyLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdW5tYXRjaGVkLnNwbGljZSh1bm1hdGNoZWQuaW5kZXhPZihhdHRyKSwgMSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIuX19zZXRQcm9wZXJ0eShuYW1lLCB2YWx1ZSk7XG4gIH1cblxuICBfX2ZsdXNoRWxlbWVudChwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsIGNvbnN0cnVjdGluZzogU2ltcGxlRWxlbWVudCk6IHZvaWQge1xuICAgIGxldCB7IHVubWF0Y2hlZEF0dHJpYnV0ZXM6IHVubWF0Y2hlZCB9ID0gdGhpcztcbiAgICBpZiAodW5tYXRjaGVkKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVubWF0Y2hlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdGluZyEucmVtb3ZlQXR0cmlidXRlKHVubWF0Y2hlZFtpXS5uYW1lKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudW5tYXRjaGVkQXR0cmlidXRlcyA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1cGVyLl9fZmx1c2hFbGVtZW50KHBhcmVudCwgY29uc3RydWN0aW5nKTtcbiAgICB9XG4gIH1cblxuICB3aWxsQ2xvc2VFbGVtZW50KCkge1xuICAgIGxldCB7IGNhbmRpZGF0ZSwgY3VycmVudEN1cnNvciB9ID0gdGhpcztcblxuICAgIGlmIChjYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuY2xlYXJNaXNtYXRjaChjYW5kaWRhdGUpO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50Q3Vyc29yICYmIGN1cnJlbnRDdXJzb3IuaW5qZWN0ZWRPbWl0dGVkTm9kZSkge1xuICAgICAgdGhpcy5wb3BFbGVtZW50KCk7XG4gICAgfVxuXG4gICAgc3VwZXIud2lsbENsb3NlRWxlbWVudCgpO1xuICB9XG5cbiAgZ2V0TWFya2VyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBndWlkOiBzdHJpbmcpOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICAgIGxldCBtYXJrZXIgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtnbG1yPVwiJHtndWlkfVwiXWApO1xuICAgIGlmIChtYXJrZXIpIHtcbiAgICAgIHJldHVybiBtYXJrZXIgYXMgU2ltcGxlTm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBfX3B1c2hSZW1vdGVFbGVtZW50KFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgY3Vyc29ySWQ6IHN0cmluZyxcbiAgICBpbnNlcnRCZWZvcmU6IE1heWJlPFNpbXBsZU5vZGU+XG4gICk6IE9wdGlvbjxSZW1vdGVMaXZlQmxvY2s+IHtcbiAgICBsZXQgbWFya2VyID0gdGhpcy5nZXRNYXJrZXIoZWxlbWVudCBhcyBIVE1MRWxlbWVudCwgY3Vyc29ySWQpO1xuXG4gICAgYXNzZXJ0KFxuICAgICAgIW1hcmtlciB8fCBtYXJrZXIucGFyZW50Tm9kZSA9PT0gZWxlbWVudCxcbiAgICAgIGBleHBlY3RlZCByZW1vdGUgZWxlbWVudCBtYXJrZXIncyBwYXJlbnQgbm9kZSB0byBtYXRjaCByZW1vdGUgZWxlbWVudGBcbiAgICApO1xuXG4gICAgaWYgKGluc2VydEJlZm9yZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB3aGlsZSAoZWxlbWVudC5sYXN0Q2hpbGQgIT09IG1hcmtlcikge1xuICAgICAgICB0aGlzLnJlbW92ZShlbGVtZW50Lmxhc3RDaGlsZCEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBjdXJyZW50Q3Vyc29yID0gdGhpcy5jdXJyZW50Q3Vyc29yO1xuICAgIGxldCBjYW5kaWRhdGUgPSBjdXJyZW50Q3Vyc29yIS5jYW5kaWRhdGU7XG5cbiAgICB0aGlzLnB1c2hFbGVtZW50KGVsZW1lbnQsIGluc2VydEJlZm9yZSk7XG5cbiAgICBjdXJyZW50Q3Vyc29yIS5jYW5kaWRhdGUgPSBjYW5kaWRhdGU7XG4gICAgdGhpcy5jYW5kaWRhdGUgPSBtYXJrZXIgPyB0aGlzLnJlbW92ZShtYXJrZXIpIDogbnVsbDtcblxuICAgIGxldCBibG9jayA9IG5ldyBSZW1vdGVMaXZlQmxvY2soZWxlbWVudCk7XG4gICAgcmV0dXJuIHRoaXMucHVzaExpdmVCbG9jayhibG9jaywgdHJ1ZSk7XG4gIH1cblxuICBkaWRBcHBlbmRCb3VuZHMoYm91bmRzOiBCb3VuZHMpOiBCb3VuZHMge1xuICAgIHN1cGVyLmRpZEFwcGVuZEJvdW5kcyhib3VuZHMpO1xuICAgIGlmICh0aGlzLmNhbmRpZGF0ZSkge1xuICAgICAgbGV0IGxhc3QgPSBib3VuZHMubGFzdE5vZGUoKTtcbiAgICAgIHRoaXMuY2FuZGlkYXRlID0gbGFzdCAmJiBsYXN0Lm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICByZXR1cm4gYm91bmRzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVGV4dE5vZGUobm9kZTogU2ltcGxlTm9kZSk6IG5vZGUgaXMgU2ltcGxlVGV4dCB7XG4gIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAzO1xufVxuXG5mdW5jdGlvbiBpc0NvbW1lbnQobm9kZTogU2ltcGxlTm9kZSk6IG5vZGUgaXMgU2ltcGxlQ29tbWVudCB7XG4gIHJldHVybiBub2RlLm5vZGVUeXBlID09PSA4O1xufVxuXG5mdW5jdGlvbiBnZXRPcGVuQmxvY2tEZXB0aChub2RlOiBTaW1wbGVDb21tZW50KTogT3B0aW9uPG51bWJlcj4ge1xuICBsZXQgYm91bmRzRGVwdGggPSBub2RlLm5vZGVWYWx1ZSEubWF0Y2goL14lXFwrYjooXFxkKyklJC8pO1xuXG4gIGlmIChib3VuZHNEZXB0aCAmJiBib3VuZHNEZXB0aFsxXSkge1xuICAgIHJldHVybiBOdW1iZXIoYm91bmRzRGVwdGhbMV0gYXMgc3RyaW5nKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRDbG9zZUJsb2NrRGVwdGgobm9kZTogU2ltcGxlQ29tbWVudCk6IE9wdGlvbjxudW1iZXI+IHtcbiAgbGV0IGJvdW5kc0RlcHRoID0gbm9kZS5ub2RlVmFsdWUhLm1hdGNoKC9eJVxcLWI6KFxcZCspJSQvKTtcblxuICBpZiAoYm91bmRzRGVwdGggJiYgYm91bmRzRGVwdGhbMV0pIHtcbiAgICByZXR1cm4gTnVtYmVyKGJvdW5kc0RlcHRoWzFdIGFzIHN0cmluZyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGU6IFNpbXBsZU5vZGUpOiBub2RlIGlzIFNpbXBsZUVsZW1lbnQge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTtcbn1cblxuZnVuY3Rpb24gaXNNYXJrZXIobm9kZTogU2ltcGxlTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gOCAmJiBub2RlLm5vZGVWYWx1ZSA9PT0gJyVnbG1yJSc7XG59XG5cbmZ1bmN0aW9uIGlzU2VwYXJhdG9yKG5vZGU6IFNpbXBsZU5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDggJiYgbm9kZS5ub2RlVmFsdWUgPT09ICclfCUnO1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5KG5vZGU6IFNpbXBsZU5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDggJiYgbm9kZS5ub2RlVmFsdWUgPT09ICclICUnO1xufVxuZnVuY3Rpb24gaXNTYW1lTm9kZVR5cGUoY2FuZGlkYXRlOiBTaW1wbGVFbGVtZW50LCB0YWc6IHN0cmluZykge1xuICBpZiAoY2FuZGlkYXRlLm5hbWVzcGFjZVVSSSA9PT0gTmFtZXNwYWNlLlNWRykge1xuICAgIHJldHVybiBjYW5kaWRhdGUudGFnTmFtZSA9PT0gdGFnO1xuICB9XG4gIHJldHVybiBjYW5kaWRhdGUudGFnTmFtZSA9PT0gdGFnLnRvVXBwZXJDYXNlKCk7XG59XG5cbmZ1bmN0aW9uIGZpbmRCeU5hbWUoYXJyYXk6IFNpbXBsZUF0dHJbXSwgbmFtZTogc3RyaW5nKTogU2ltcGxlQXR0ciB8IHVuZGVmaW5lZCB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgYXR0ciA9IGFycmF5W2ldO1xuICAgIGlmIChhdHRyLm5hbWUgPT09IG5hbWUpIHJldHVybiBhdHRyO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlaHlkcmF0aW9uQnVpbGRlcihlbnY6IEVudmlyb25tZW50LCBjdXJzb3I6IEN1cnNvckltcGwpOiBFbGVtZW50QnVpbGRlciB7XG4gIHJldHVybiBSZWh5ZHJhdGVCdWlsZGVyLmZvckluaXRpYWxSZW5kZXIoZW52LCBjdXJzb3IpO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==