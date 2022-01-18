"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.applyTextNodeMergingFix = applyTextNodeMergingFix;
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
    return function (_DOMClass) {
        _inherits(DOMChangesWithTextNodeMergingFix, _DOMClass);

        function DOMChangesWithTextNodeMergingFix(document) {
            _classCallCheck(this, DOMChangesWithTextNodeMergingFix);

            var _this = _possibleConstructorReturn(this, _DOMClass.call(this, document));

            _this.uselessComment = document.createComment('');
            return _this;
        }

        DOMChangesWithTextNodeMergingFix.prototype.insertHTMLBefore = function insertHTMLBefore(parent, nextSibling, html) {
            if (html === '') {
                return _DOMClass.prototype.insertHTMLBefore.call(this, parent, nextSibling, html);
            }
            var didSetUselessComment = false;
            var nextPrevious = nextSibling ? nextSibling.previousSibling : parent.lastChild;
            if (nextPrevious && nextPrevious instanceof Text) {
                didSetUselessComment = true;
                parent.insertBefore(this.uselessComment, nextSibling);
            }
            var bounds = _DOMClass.prototype.insertHTMLBefore.call(this, parent, nextSibling, html);
            if (didSetUselessComment) {
                parent.removeChild(this.uselessComment);
            }
            return bounds;
        };

        return DOMChangesWithTextNodeMergingFix;
    }(DOMClass);
}
function shouldApplyFix(document) {
    var mergingTextDiv = document.createElement('div');
    mergingTextDiv.appendChild(document.createTextNode('first'));
    mergingTextDiv.insertAdjacentHTML("beforeend" /* beforeend */, 'second');
    if (mergingTextDiv.childNodes.length === 2) {
        // It worked as expected, no fix required
        return false;
    }
    return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBhdC90ZXh0LW5vZGUtbWVyZ2luZy1maXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7UUF1Qk0sdUIsR0FBQSx1Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVhOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTSxTQUFBLHVCQUFBLENBQUEsUUFBQSxFQUFBLFFBQUEsRUFFMEI7QUFFOUIsUUFBSSxDQUFKLFFBQUEsRUFBZSxPQUFBLFFBQUE7QUFFZixRQUFJLENBQUMsZUFBTCxRQUFLLENBQUwsRUFBK0I7QUFDN0IsZUFBQSxRQUFBO0FBQ0Q7QUFFRCxXQUFBLFVBQUEsU0FBQSxFQUFBO0FBQUEsa0JBQUEsZ0NBQUEsRUFBQSxTQUFBOztBQUdFLGlCQUFBLGdDQUFBLENBQUEsUUFBQSxFQUFvQztBQUFBLDRCQUFBLElBQUEsRUFBQSxnQ0FBQTs7QUFBQSxnQkFBQSxRQUFBLDJCQUFBLElBQUEsRUFDbEMsVUFBQSxJQUFBLENBQUEsSUFBQSxFQURrQyxRQUNsQyxDQURrQyxDQUFBOztBQUVsQyxrQkFBQSxjQUFBLEdBQXNCLFNBQUEsYUFBQSxDQUF0QixFQUFzQixDQUF0QjtBQUZrQyxtQkFBQSxLQUFBO0FBR25DOztBQU5ILHlDQUFBLFNBQUEsQ0FBQSxnQkFBQSxHQUFBLFNBQUEsZ0JBQUEsQ0FBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFRdUY7QUFDbkYsZ0JBQUksU0FBSixFQUFBLEVBQWlCO0FBQ2YsdUJBQU8sVUFBQSxTQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQVAsSUFBTyxDQUFQO0FBQ0Q7QUFFRCxnQkFBSSx1QkFBSixLQUFBO0FBRUEsZ0JBQUksZUFBZSxjQUFjLFlBQWQsZUFBQSxHQUE0QyxPQUEvRCxTQUFBO0FBRUEsZ0JBQUksZ0JBQWdCLHdCQUFwQixJQUFBLEVBQWtEO0FBQ2hELHVDQUFBLElBQUE7QUFDQSx1QkFBQSxZQUFBLENBQW9CLEtBQXBCLGNBQUEsRUFBQSxXQUFBO0FBQ0Q7QUFFRCxnQkFBSSxTQUFTLFVBQUEsU0FBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFiLElBQWEsQ0FBYjtBQUVBLGdCQUFBLG9CQUFBLEVBQTBCO0FBQ3hCLHVCQUFBLFdBQUEsQ0FBbUIsS0FBbkIsY0FBQTtBQUNEO0FBRUQsbUJBQUEsTUFBQTtBQTVCSixTQUFBOztBQUFBLGVBQUEsZ0NBQUE7QUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBO0FBK0JEO0FBRUQsU0FBQSxjQUFBLENBQUEsUUFBQSxFQUFnRDtBQUM5QyxRQUFJLGlCQUFpQixTQUFBLGFBQUEsQ0FBckIsS0FBcUIsQ0FBckI7QUFFQSxtQkFBQSxXQUFBLENBQTJCLFNBQUEsY0FBQSxDQUEzQixPQUEyQixDQUEzQjtBQUNBLG1CQUFBLGtCQUFBLENBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxRQUFBO0FBRUEsUUFBSSxlQUFBLFVBQUEsQ0FBQSxNQUFBLEtBQUosQ0FBQSxFQUE0QztBQUMxQztBQUNBLGVBQUEsS0FBQTtBQUNEO0FBRUQsV0FBQSxJQUFBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCb3VuZHMgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHtcbiAgU2ltcGxlRG9jdW1lbnQsXG4gIFNpbXBsZUNvbW1lbnQsXG4gIEluc2VydFBvc2l0aW9uLFxuICBTaW1wbGVFbGVtZW50LFxuICBTaW1wbGVOb2RlLFxufSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgRE9NT3BlcmF0aW9ucyB9IGZyb20gJy4uL2RvbS9vcGVyYXRpb25zJztcblxuLy8gUGF0Y2g6ICAgIEFkamFjZW50IHRleHQgbm9kZSBtZXJnaW5nIGZpeFxuLy8gQnJvd3NlcnM6IElFLCBFZGdlLCBGaXJlZm94IHcvbyBpbnNwZWN0b3Igb3BlblxuLy8gUmVhc29uOiAgIFRoZXNlIGJyb3dzZXJzIHdpbGwgbWVyZ2UgYWRqYWNlbnQgdGV4dCBub2Rlcy4gRm9yIGV4bWFwbGUgZ2l2ZW5cbi8vICAgICAgICAgICA8ZGl2PkhlbGxvPC9kaXY+IHdpdGggZGl2Lmluc2VydEFkamFjZW50SFRNTCgnIHdvcmxkJykgYnJvd3NlcnNcbi8vICAgICAgICAgICB3aXRoIHByb3BlciBiZWhhdmlvciB3aWxsIHBvcHVsYXRlIGRpdi5jaGlsZE5vZGVzIHdpdGggdHdvIGl0ZW1zLlxuLy8gICAgICAgICAgIFRoZXNlIGJyb3dzZXJzIHdpbGwgcG9wdWxhdGUgaXQgd2l0aCBvbmUgbWVyZ2VkIG5vZGUgaW5zdGVhZC5cbi8vIEZpeDogICAgICBBZGQgdGhlc2Ugbm9kZXMgdG8gYSB3cmFwcGVyIGVsZW1lbnQsIHRoZW4gaXRlcmF0ZSB0aGUgY2hpbGROb2Rlc1xuLy8gICAgICAgICAgIG9mIHRoYXQgd3JhcHBlciBhbmQgbW92ZSB0aGUgbm9kZXMgdG8gdGhlaXIgdGFyZ2V0IGxvY2F0aW9uLiBOb3RlXG4vLyAgICAgICAgICAgdGhhdCBwb3RlbnRpYWwgU1ZHIGJ1Z3Mgd2lsbCBoYXZlIGJlZW4gaGFuZGxlZCBiZWZvcmUgdGhpcyBmaXguXG4vLyAgICAgICAgICAgTm90ZSB0aGF0IHRoaXMgZml4IG11c3Qgb25seSBhcHBseSB0byB0aGUgcHJldmlvdXMgdGV4dCBub2RlLCBhc1xuLy8gICAgICAgICAgIHRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBpbnNlcnRIVE1MQmVmb3JlYCBhbHJlYWR5IGhhbmRsZXNcbi8vICAgICAgICAgICBmb2xsb3dpbmcgdGV4dCBub2RlcyBjb3JyZWN0bHkuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlUZXh0Tm9kZU1lcmdpbmdGaXgoXG4gIGRvY3VtZW50OiBPcHRpb248U2ltcGxlRG9jdW1lbnQ+LFxuICBET01DbGFzczogdHlwZW9mIERPTU9wZXJhdGlvbnNcbik6IHR5cGVvZiBET01PcGVyYXRpb25zIHtcbiAgaWYgKCFkb2N1bWVudCkgcmV0dXJuIERPTUNsYXNzO1xuXG4gIGlmICghc2hvdWxkQXBwbHlGaXgoZG9jdW1lbnQpKSB7XG4gICAgcmV0dXJuIERPTUNsYXNzO1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIERPTUNoYW5nZXNXaXRoVGV4dE5vZGVNZXJnaW5nRml4IGV4dGVuZHMgRE9NQ2xhc3Mge1xuICAgIHByaXZhdGUgdXNlbGVzc0NvbW1lbnQ6IFNpbXBsZUNvbW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQpIHtcbiAgICAgIHN1cGVyKGRvY3VtZW50KTtcbiAgICAgIHRoaXMudXNlbGVzc0NvbW1lbnQgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbiAgICB9XG5cbiAgICBpbnNlcnRIVE1MQmVmb3JlKHBhcmVudDogU2ltcGxlRWxlbWVudCwgbmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPiwgaHRtbDogc3RyaW5nKTogQm91bmRzIHtcbiAgICAgIGlmIChodG1sID09PSAnJykge1xuICAgICAgICByZXR1cm4gc3VwZXIuaW5zZXJ0SFRNTEJlZm9yZShwYXJlbnQsIG5leHRTaWJsaW5nLCBodG1sKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGRpZFNldFVzZWxlc3NDb21tZW50ID0gZmFsc2U7XG5cbiAgICAgIGxldCBuZXh0UHJldmlvdXMgPSBuZXh0U2libGluZyA/IG5leHRTaWJsaW5nLnByZXZpb3VzU2libGluZyA6IHBhcmVudC5sYXN0Q2hpbGQ7XG5cbiAgICAgIGlmIChuZXh0UHJldmlvdXMgJiYgbmV4dFByZXZpb3VzIGluc3RhbmNlb2YgVGV4dCkge1xuICAgICAgICBkaWRTZXRVc2VsZXNzQ29tbWVudCA9IHRydWU7XG4gICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodGhpcy51c2VsZXNzQ29tbWVudCwgbmV4dFNpYmxpbmcpO1xuICAgICAgfVxuXG4gICAgICBsZXQgYm91bmRzID0gc3VwZXIuaW5zZXJ0SFRNTEJlZm9yZShwYXJlbnQsIG5leHRTaWJsaW5nLCBodG1sKTtcblxuICAgICAgaWYgKGRpZFNldFVzZWxlc3NDb21tZW50KSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzLnVzZWxlc3NDb21tZW50KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHNob3VsZEFwcGx5Rml4KGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCkge1xuICBsZXQgbWVyZ2luZ1RleHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICBtZXJnaW5nVGV4dERpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnZmlyc3QnKSk7XG4gIG1lcmdpbmdUZXh0RGl2Lmluc2VydEFkamFjZW50SFRNTChJbnNlcnRQb3NpdGlvbi5iZWZvcmVlbmQsICdzZWNvbmQnKTtcblxuICBpZiAobWVyZ2luZ1RleHREaXYuY2hpbGROb2Rlcy5sZW5ndGggPT09IDIpIHtcbiAgICAvLyBJdCB3b3JrZWQgYXMgZXhwZWN0ZWQsIG5vIGZpeCByZXF1aXJlZFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==