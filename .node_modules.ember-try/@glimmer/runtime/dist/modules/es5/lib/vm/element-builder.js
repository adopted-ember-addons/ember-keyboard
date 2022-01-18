var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _a;
import { assert, DESTROY, Stack } from '@glimmer/util';
import { clear, ConcreteBounds, CursorImpl, SingleNodeBounds } from '../bounds';
import { detachChildren } from '../lifetime';

var First = function () {
    function First(node) {
        _classCallCheck(this, First);

        this.node = node;
    }

    First.prototype.firstNode = function firstNode() {
        return this.node;
    };

    return First;
}();

var Last = function () {
    function Last(node) {
        _classCallCheck(this, Last);

        this.node = node;
    }

    Last.prototype.lastNode = function lastNode() {
        return this.node;
    };

    return Last;
}();

export var Fragment = function () {
    function Fragment(bounds) {
        _classCallCheck(this, Fragment);

        this.bounds = bounds;
    }

    Fragment.prototype.parentElement = function parentElement() {
        return this.bounds.parentElement();
    };

    Fragment.prototype.firstNode = function firstNode() {
        return this.bounds.firstNode();
    };

    Fragment.prototype.lastNode = function lastNode() {
        return this.bounds.lastNode();
    };

    return Fragment;
}();
export var CURSOR_STACK = 'CURSOR_STACK [31ea0d2f-7c22-4814-9db7-28e4469b54e6]';
export var NewElementBuilder = function () {
    function NewElementBuilder(env, parentNode, nextSibling) {
        _classCallCheck(this, NewElementBuilder);

        this.constructing = null;
        this.operations = null;
        this[_a] = new Stack();
        this.modifierStack = new Stack();
        this.blockStack = new Stack();
        this.pushElement(parentNode, nextSibling);
        this.env = env;
        this.dom = env.getAppendOperations();
        this.updateOperations = env.getDOM();
    }

    NewElementBuilder.forInitialRender = function forInitialRender(env, cursor) {
        return new this(env, cursor.element, cursor.nextSibling).initialize();
    };

    NewElementBuilder.resume = function resume(env, block) {
        var parentNode = block.parentElement();
        var nextSibling = block.reset(env);
        var stack = new this(env, parentNode, nextSibling).initialize();
        stack.pushLiveBlock(block);
        return stack;
    };

    NewElementBuilder.prototype.initialize = function initialize() {
        this.pushSimpleBlock();
        return this;
    };

    NewElementBuilder.prototype.debugBlocks = function debugBlocks() {
        return this.blockStack.toArray();
    };

    NewElementBuilder.prototype.block = function block() {
        return this.blockStack.current;
    };

    NewElementBuilder.prototype.popElement = function popElement() {
        this[CURSOR_STACK].pop();
        this[CURSOR_STACK].current;
    };

    NewElementBuilder.prototype.pushSimpleBlock = function pushSimpleBlock() {
        return this.pushLiveBlock(new SimpleLiveBlock(this.element));
    };

    NewElementBuilder.prototype.pushUpdatableBlock = function pushUpdatableBlock() {
        return this.pushLiveBlock(new UpdatableBlockImpl(this.element));
    };

    NewElementBuilder.prototype.pushBlockList = function pushBlockList(list) {
        return this.pushLiveBlock(new LiveBlockList(this.element, list));
    };

    NewElementBuilder.prototype.pushLiveBlock = function pushLiveBlock(block) {
        var isRemote = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var current = this.blockStack.current;
        if (current !== null) {
            if (!isRemote) {
                current.didAppendBounds(block);
            }
        }
        this.__openBlock();
        this.blockStack.push(block);
        return block;
    };

    NewElementBuilder.prototype.popBlock = function popBlock() {
        this.block().finalize(this);
        this.__closeBlock();
        return this.blockStack.pop();
    };

    NewElementBuilder.prototype.__openBlock = function __openBlock() {};

    NewElementBuilder.prototype.__closeBlock = function __closeBlock() {};
    // todo return seems unused


    NewElementBuilder.prototype.openElement = function openElement(tag) {
        var element = this.__openElement(tag);
        this.constructing = element;
        return element;
    };

    NewElementBuilder.prototype.__openElement = function __openElement(tag) {
        return this.dom.createElement(tag, this.element);
    };

    NewElementBuilder.prototype.flushElement = function flushElement(modifiers) {
        var parent = this.element;
        var element = this.constructing;
        this.__flushElement(parent, element);
        this.constructing = null;
        this.operations = null;
        this.pushModifiers(modifiers);
        this.pushElement(element, null);
        this.didOpenElement(element);
    };

    NewElementBuilder.prototype.__flushElement = function __flushElement(parent, constructing) {
        this.dom.insertBefore(parent, constructing, this.nextSibling);
    };

    NewElementBuilder.prototype.closeElement = function closeElement() {
        this.willCloseElement();
        this.popElement();
        return this.popModifiers();
    };

    NewElementBuilder.prototype.pushRemoteElement = function pushRemoteElement(element, guid, insertBefore) {
        return this.__pushRemoteElement(element, guid, insertBefore);
    };

    NewElementBuilder.prototype.__pushRemoteElement = function __pushRemoteElement(element, _guid, insertBefore) {
        this.pushElement(element, insertBefore);
        if (insertBefore === undefined) {
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }
        }
        var block = new RemoteLiveBlock(element);
        return this.pushLiveBlock(block, true);
    };

    NewElementBuilder.prototype.popRemoteElement = function popRemoteElement() {
        this.popBlock();
        this.popElement();
    };

    NewElementBuilder.prototype.pushElement = function pushElement(element) {
        var nextSibling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        this[CURSOR_STACK].push(new CursorImpl(element, nextSibling));
    };

    NewElementBuilder.prototype.pushModifiers = function pushModifiers(modifiers) {
        this.modifierStack.push(modifiers);
    };

    NewElementBuilder.prototype.popModifiers = function popModifiers() {
        return this.modifierStack.pop();
    };

    NewElementBuilder.prototype.didAppendBounds = function didAppendBounds(bounds) {
        this.block().didAppendBounds(bounds);
        return bounds;
    };

    NewElementBuilder.prototype.didAppendNode = function didAppendNode(node) {
        this.block().didAppendNode(node);
        return node;
    };

    NewElementBuilder.prototype.didOpenElement = function didOpenElement(element) {
        this.block().openElement(element);
        return element;
    };

    NewElementBuilder.prototype.willCloseElement = function willCloseElement() {
        this.block().closeElement();
    };

    NewElementBuilder.prototype.appendText = function appendText(string) {
        return this.didAppendNode(this.__appendText(string));
    };

    NewElementBuilder.prototype.__appendText = function __appendText(text) {
        var dom = this.dom,
            element = this.element,
            nextSibling = this.nextSibling;

        var node = dom.createTextNode(text);
        dom.insertBefore(element, node, nextSibling);
        return node;
    };

    NewElementBuilder.prototype.__appendNode = function __appendNode(node) {
        this.dom.insertBefore(this.element, node, this.nextSibling);
        return node;
    };

    NewElementBuilder.prototype.__appendFragment = function __appendFragment(fragment) {
        var first = fragment.firstChild;
        if (first) {
            var ret = new ConcreteBounds(this.element, first, fragment.lastChild);
            this.dom.insertBefore(this.element, fragment, this.nextSibling);
            return ret;
        } else {
            return new SingleNodeBounds(this.element, this.__appendComment(''));
        }
    };

    NewElementBuilder.prototype.__appendHTML = function __appendHTML(html) {
        return this.dom.insertHTMLBefore(this.element, this.nextSibling, html);
    };

    NewElementBuilder.prototype.appendDynamicHTML = function appendDynamicHTML(value) {
        var bounds = this.trustedContent(value);
        this.didAppendBounds(bounds);
    };

    NewElementBuilder.prototype.appendDynamicText = function appendDynamicText(value) {
        var node = this.untrustedContent(value);
        this.didAppendNode(node);
        return node;
    };

    NewElementBuilder.prototype.appendDynamicFragment = function appendDynamicFragment(value) {
        var bounds = this.__appendFragment(value);
        this.didAppendBounds(bounds);
    };

    NewElementBuilder.prototype.appendDynamicNode = function appendDynamicNode(value) {
        var node = this.__appendNode(value);
        var bounds = new SingleNodeBounds(this.element, node);
        this.didAppendBounds(bounds);
    };

    NewElementBuilder.prototype.trustedContent = function trustedContent(value) {
        return this.__appendHTML(value);
    };

    NewElementBuilder.prototype.untrustedContent = function untrustedContent(value) {
        return this.__appendText(value);
    };

    NewElementBuilder.prototype.appendComment = function appendComment(string) {
        return this.didAppendNode(this.__appendComment(string));
    };

    NewElementBuilder.prototype.__appendComment = function __appendComment(string) {
        var dom = this.dom,
            element = this.element,
            nextSibling = this.nextSibling;

        var node = dom.createComment(string);
        dom.insertBefore(element, node, nextSibling);
        return node;
    };

    NewElementBuilder.prototype.__setAttribute = function __setAttribute(name, value, namespace) {
        this.dom.setAttribute(this.constructing, name, value, namespace);
    };

    NewElementBuilder.prototype.__setProperty = function __setProperty(name, value) {
        this.constructing[name] = value;
    };

    NewElementBuilder.prototype.setStaticAttribute = function setStaticAttribute(name, value, namespace) {
        this.__setAttribute(name, value, namespace);
    };

    NewElementBuilder.prototype.setDynamicAttribute = function setDynamicAttribute(name, value, trusting, namespace) {
        var element = this.constructing;
        var attribute = this.env.attributeFor(element, name, trusting, namespace);
        attribute.set(this, value, this.env);
        return attribute;
    };

    _createClass(NewElementBuilder, [{
        key: 'element',
        get: function get() {
            return this[CURSOR_STACK].current.element;
        }
    }, {
        key: 'nextSibling',
        get: function get() {
            return this[CURSOR_STACK].current.nextSibling;
        }
    }]);

    return NewElementBuilder;
}();
_a = CURSOR_STACK;
export var SimpleLiveBlock = function () {
    function SimpleLiveBlock(parent) {
        _classCallCheck(this, SimpleLiveBlock);

        this.parent = parent;
        this.first = null;
        this.last = null;
        this.destroyables = null;
        this.nesting = 0;
    }

    SimpleLiveBlock.prototype.parentElement = function parentElement() {
        return this.parent;
    };

    SimpleLiveBlock.prototype.firstNode = function firstNode() {
        var first = this.first;
        return first.firstNode();
    };

    SimpleLiveBlock.prototype.lastNode = function lastNode() {
        var last = this.last;
        return last.lastNode();
    };

    SimpleLiveBlock.prototype.openElement = function openElement(element) {
        this.didAppendNode(element);
        this.nesting++;
    };

    SimpleLiveBlock.prototype.closeElement = function closeElement() {
        this.nesting--;
    };

    SimpleLiveBlock.prototype.didAppendNode = function didAppendNode(node) {
        if (this.nesting !== 0) return;
        if (!this.first) {
            this.first = new First(node);
        }
        this.last = new Last(node);
    };

    SimpleLiveBlock.prototype.didAppendBounds = function didAppendBounds(bounds) {
        if (this.nesting !== 0) return;
        if (!this.first) {
            this.first = bounds;
        }
        this.last = bounds;
    };

    SimpleLiveBlock.prototype.finalize = function finalize(stack) {
        if (this.first === null) {
            stack.appendComment('');
        }
    };

    return SimpleLiveBlock;
}();
export var RemoteLiveBlock = function (_SimpleLiveBlock) {
    _inherits(RemoteLiveBlock, _SimpleLiveBlock);

    function RemoteLiveBlock() {
        _classCallCheck(this, RemoteLiveBlock);

        return _possibleConstructorReturn(this, _SimpleLiveBlock.apply(this, arguments));
    }

    RemoteLiveBlock.prototype[DESTROY] = function () {
        clear(this);
    };

    return RemoteLiveBlock;
}(SimpleLiveBlock);
export var UpdatableBlockImpl = function (_SimpleLiveBlock2) {
    _inherits(UpdatableBlockImpl, _SimpleLiveBlock2);

    function UpdatableBlockImpl() {
        _classCallCheck(this, UpdatableBlockImpl);

        return _possibleConstructorReturn(this, _SimpleLiveBlock2.apply(this, arguments));
    }

    UpdatableBlockImpl.prototype.reset = function reset(env) {
        var nextSibling = detachChildren(this, env);
        // let nextSibling = clear(this);
        this.first = null;
        this.last = null;
        this.destroyables = null;
        this.nesting = 0;
        return nextSibling;
    };

    return UpdatableBlockImpl;
}(SimpleLiveBlock);
// FIXME: All the noops in here indicate a modelling problem

var LiveBlockList = function () {
    function LiveBlockList(parent, boundList) {
        _classCallCheck(this, LiveBlockList);

        this.parent = parent;
        this.boundList = boundList;
        this.parent = parent;
        this.boundList = boundList;
    }

    LiveBlockList.prototype.parentElement = function parentElement() {
        return this.parent;
    };

    LiveBlockList.prototype.firstNode = function firstNode() {
        var head = this.boundList.head();
        return head.firstNode();
    };

    LiveBlockList.prototype.lastNode = function lastNode() {
        var tail = this.boundList.tail();
        return tail.lastNode();
    };

    LiveBlockList.prototype.openElement = function openElement(_element) {
        false && assert(false, 'Cannot openElement directly inside a block list');
    };

    LiveBlockList.prototype.closeElement = function closeElement() {
        false && assert(false, 'Cannot closeElement directly inside a block list');
    };

    LiveBlockList.prototype.didAppendNode = function didAppendNode(_node) {
        false && assert(false, 'Cannot create a new node directly inside a block list');
    };

    LiveBlockList.prototype.didAppendBounds = function didAppendBounds(_bounds) {};

    LiveBlockList.prototype.finalize = function finalize(_stack) {
        false && assert(this.boundList.head() !== null, 'boundsList cannot be empty');
    };

    return LiveBlockList;
}();

export function clientBuilder(env, cursor) {
    return NewElementBuilder.forInitialRender(env, cursor);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2VsZW1lbnQtYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWVBLFNBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxLQUFBLFFBQUEsZUFBQTtBQWtCQSxTQUFBLEtBQUEsRUFBQSxjQUFBLEVBQUEsVUFBQSxFQUFBLGdCQUFBLFFBQUEsV0FBQTtBQUNBLFNBQUEsY0FBQSxRQUFBLGFBQUE7O0lBV0EsSztBQUNFLG1CQUFBLElBQUEsRUFBb0M7QUFBQTs7QUFBaEIsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUFvQjs7b0JBRXhDLFMsd0JBQVM7QUFDUCxlQUFPLEtBQVAsSUFBQTtBQUNELEs7Ozs7O0lBR0gsSTtBQUNFLGtCQUFBLElBQUEsRUFBb0M7QUFBQTs7QUFBaEIsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUFvQjs7bUJBRXhDLFEsdUJBQVE7QUFDTixlQUFPLEtBQVAsSUFBQTtBQUNELEs7Ozs7O0FBR0gsV0FBTSxRQUFOO0FBR0Usc0JBQUEsTUFBQSxFQUEwQjtBQUFBOztBQUN4QixhQUFBLE1BQUEsR0FBQSxNQUFBO0FBQ0Q7O0FBTEgsdUJBT0UsYUFQRiw0QkFPZTtBQUNYLGVBQU8sS0FBQSxNQUFBLENBQVAsYUFBTyxFQUFQO0FBQ0QsS0FUSDs7QUFBQSx1QkFXRSxTQVhGLHdCQVdXO0FBQ1AsZUFBTyxLQUFBLE1BQUEsQ0FBUCxTQUFPLEVBQVA7QUFDRCxLQWJIOztBQUFBLHVCQWVFLFFBZkYsdUJBZVU7QUFDTixlQUFPLEtBQUEsTUFBQSxDQUFQLFFBQU8sRUFBUDtBQUNELEtBakJIOztBQUFBO0FBQUE7QUFvQkEsT0FBTyxJQUFNLGVBQU4scURBQUE7QUFHUCxXQUFNLGlCQUFOO0FBeUJFLCtCQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUF3RjtBQUFBOztBQXRCakYsYUFBQSxZQUFBLEdBQUEsSUFBQTtBQUNBLGFB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U0FBQSxHQUFBLFNBQUE7QUFFakIsYUFBQSxNQUFBLEdBQUEsTUFBQTtBQUNBLGFBQUEsU0FBQSxHQUFBLFNBQUE7QUFDRDs7NEJBRUQsYSw0QkFBYTtBQUNYLGVBQU8sS0FBUCxNQUFBO0FBQ0QsSzs7NEJBRUQsUyx3QkFBUztBQUNQLFlBQUksT0FDRixLQUFBLFNBQUEsQ0FERixJQUNFLEVBREY7QUFLQSxlQUFPLEtBQVAsU0FBTyxFQUFQO0FBQ0QsSzs7NEJBRUQsUSx1QkFBUTtBQUNOLFlBQUksT0FDRixLQUFBLFNBQUEsQ0FERixJQUNFLEVBREY7QUFLQSxlQUFPLEtBQVAsUUFBTyxFQUFQO0FBQ0QsSzs7NEJBRUQsVyx3QkFBQSxRLEVBQW1DO0FBQUEsaUJBQ2pDLE9BQUEsS0FBQSxFQURpQyxpREFDakMsQ0FEaUM7QUFFbEMsSzs7NEJBRUQsWSwyQkFBWTtBQUFBLGlCQUNWLE9BQUEsS0FBQSxFQURVLGtEQUNWLENBRFU7QUFFWCxLOzs0QkFFRCxhLDBCQUFBLEssRUFBK0I7QUFBQSxpQkFDN0IsT0FBQSxLQUFBLEVBRDZCLHVEQUM3QixDQUQ2QjtBQUU5QixLOzs0QkFFRCxlLDRCQUFBLE8sRUFBK0IsQ0FBSSxDOzs0QkFFbkMsUSxxQkFBQSxNLEVBQStCO0FBQUEsaUJBQzdCLE9BQU8sS0FBQSxTQUFBLENBQUEsSUFBQSxPQUFQLElBQUEsRUFENkIsNEJBQzdCLENBRDZCO0FBRTlCLEs7Ozs7O0FBR0gsT0FBTSxTQUFBLGFBQUEsQ0FBQSxHQUFBLEVBQUEsTUFBQSxFQUE0RDtBQUNoRSxXQUFPLGtCQUFBLGdCQUFBLENBQUEsR0FBQSxFQUFQLE1BQU8sQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQm91bmRzLFxuICBEaWN0LFxuICBFbGVtZW50T3BlcmF0aW9ucyxcbiAgRW52aXJvbm1lbnQsXG4gIEdsaW1tZXJUcmVlQ2hhbmdlcyxcbiAgR2xpbW1lclRyZWVDb25zdHJ1Y3Rpb24sXG4gIFN5bWJvbERlc3Ryb3lhYmxlLFxuICBFbGVtZW50QnVpbGRlcixcbiAgTGl2ZUJsb2NrLFxuICBDdXJzb3JTdGFja1N5bWJvbCxcbiAgVXBkYXRhYmxlQmxvY2ssXG4gIEN1cnNvcixcbiAgTW9kaWZpZXJNYW5hZ2VyLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7XG4gIGFzc2VydCxcbiAgREVTVFJPWSxcbiAgZXhwZWN0LFxuICBMaW5rZWRMaXN0LFxuICBMaW5rZWRMaXN0Tm9kZSxcbiAgT3B0aW9uLFxuICBTdGFjayxcbiAgTWF5YmUsXG59IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHtcbiAgQXR0ck5hbWVzcGFjZSxcbiAgU2ltcGxlQ29tbWVudCxcbiAgU2ltcGxlRG9jdW1lbnRGcmFnbWVudCxcbiAgU2ltcGxlRWxlbWVudCxcbiAgU2ltcGxlTm9kZSxcbiAgU2ltcGxlVGV4dCxcbn0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IGNsZWFyLCBDb25jcmV0ZUJvdW5kcywgQ3Vyc29ySW1wbCwgU2luZ2xlTm9kZUJvdW5kcyB9IGZyb20gJy4uL2JvdW5kcyc7XG5pbXBvcnQgeyBkZXRhY2hDaGlsZHJlbiB9IGZyb20gJy4uL2xpZmV0aW1lJztcbmltcG9ydCB7IER5bmFtaWNBdHRyaWJ1dGUgfSBmcm9tICcuL2F0dHJpYnV0ZXMvZHluYW1pYyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlyc3ROb2RlIHtcbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGFzdE5vZGUge1xuICBsYXN0Tm9kZSgpOiBTaW1wbGVOb2RlO1xufVxuXG5jbGFzcyBGaXJzdCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbm9kZTogU2ltcGxlTm9kZSkge31cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgfVxufVxuXG5jbGFzcyBMYXN0IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBub2RlOiBTaW1wbGVOb2RlKSB7fVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLm5vZGU7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZyYWdtZW50IGltcGxlbWVudHMgQm91bmRzIHtcbiAgcHJpdmF0ZSBib3VuZHM6IEJvdW5kcztcblxuICBjb25zdHJ1Y3Rvcihib3VuZHM6IEJvdW5kcykge1xuICAgIHRoaXMuYm91bmRzID0gYm91bmRzO1xuICB9XG5cbiAgcGFyZW50RWxlbWVudCgpOiBTaW1wbGVFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMucGFyZW50RWxlbWVudCgpO1xuICB9XG5cbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5maXJzdE5vZGUoKTtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5sYXN0Tm9kZSgpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBDVVJTT1JfU1RBQ0s6IEN1cnNvclN0YWNrU3ltYm9sID1cbiAgJ0NVUlNPUl9TVEFDSyBbMzFlYTBkMmYtN2MyMi00ODE0LTlkYjctMjhlNDQ2OWI1NGU2XSc7XG5cbmV4cG9ydCBjbGFzcyBOZXdFbGVtZW50QnVpbGRlciBpbXBsZW1lbnRzIEVsZW1lbnRCdWlsZGVyIHtcbiAgcHVibGljIGRvbTogR2xpbW1lclRyZWVDb25zdHJ1Y3Rpb247XG4gIHB1YmxpYyB1cGRhdGVPcGVyYXRpb25zOiBHbGltbWVyVHJlZUNoYW5nZXM7XG4gIHB1YmxpYyBjb25zdHJ1Y3Rpbmc6IE9wdGlvbjxTaW1wbGVFbGVtZW50PiA9IG51bGw7XG4gIHB1YmxpYyBvcGVyYXRpb25zOiBPcHRpb248RWxlbWVudE9wZXJhdGlvbnM+ID0gbnVsbDtcbiAgcHJpdmF0ZSBlbnY6IEVudmlyb25tZW50O1xuXG4gIFtDVVJTT1JfU1RBQ0tdID0gbmV3IFN0YWNrPEN1cnNvcj4oKTtcbiAgcHJpdmF0ZSBtb2RpZmllclN0YWNrID0gbmV3IFN0YWNrPE9wdGlvbjxbTW9kaWZpZXJNYW5hZ2VyLCB1bmtub3duXVtdPj4oKTtcbiAgcHJpdmF0ZSBibG9ja1N0YWNrID0gbmV3IFN0YWNrPExpdmVCbG9jaz4oKTtcblxuICBzdGF0aWMgZm9ySW5pdGlhbFJlbmRlcihlbnY6IEVudmlyb25tZW50LCBjdXJzb3I6IEN1cnNvckltcGwpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoZW52LCBjdXJzb3IuZWxlbWVudCwgY3Vyc29yLm5leHRTaWJsaW5nKS5pbml0aWFsaXplKCk7XG4gIH1cblxuICBzdGF0aWMgcmVzdW1lKGVudjogRW52aXJvbm1lbnQsIGJsb2NrOiBVcGRhdGFibGVCbG9jayk6IE5ld0VsZW1lbnRCdWlsZGVyIHtcbiAgICBsZXQgcGFyZW50Tm9kZSA9IGJsb2NrLnBhcmVudEVsZW1lbnQoKTtcbiAgICBsZXQgbmV4dFNpYmxpbmcgPSBibG9jay5yZXNldChlbnYpO1xuXG4gICAgbGV0IHN0YWNrID0gbmV3IHRoaXMoZW52LCBwYXJlbnROb2RlLCBuZXh0U2libGluZykuaW5pdGlhbGl6ZSgpO1xuICAgIHN0YWNrLnB1c2hMaXZlQmxvY2soYmxvY2spO1xuXG4gICAgcmV0dXJuIHN0YWNrO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW52OiBFbnZpcm9ubWVudCwgcGFyZW50Tm9kZTogU2ltcGxlRWxlbWVudCwgbmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPikge1xuICAgIHRoaXMucHVzaEVsZW1lbnQocGFyZW50Tm9kZSwgbmV4dFNpYmxpbmcpO1xuXG4gICAgdGhpcy5lbnYgPSBlbnY7XG4gICAgdGhpcy5kb20gPSBlbnYuZ2V0QXBwZW5kT3BlcmF0aW9ucygpO1xuICAgIHRoaXMudXBkYXRlT3BlcmF0aW9ucyA9IGVudi5nZXRET00oKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCk6IHRoaXMge1xuICAgIHRoaXMucHVzaFNpbXBsZUJsb2NrKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkZWJ1Z0Jsb2NrcygpOiBMaXZlQmxvY2tbXSB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tTdGFjay50b0FycmF5KCk7XG4gIH1cblxuICBnZXQgZWxlbWVudCgpOiBTaW1wbGVFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpc1tDVVJTT1JfU1RBQ0tdLmN1cnJlbnQhLmVsZW1lbnQ7XG4gIH1cblxuICBnZXQgbmV4dFNpYmxpbmcoKTogT3B0aW9uPFNpbXBsZU5vZGU+IHtcbiAgICByZXR1cm4gdGhpc1tDVVJTT1JfU1RBQ0tdLmN1cnJlbnQhLm5leHRTaWJsaW5nO1xuICB9XG5cbiAgYmxvY2soKTogTGl2ZUJsb2NrIHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXMuYmxvY2tTdGFjay5jdXJyZW50LCAnRXhwZWN0ZWQgYSBjdXJyZW50IGxpdmUgYmxvY2snKTtcbiAgfVxuXG4gIHBvcEVsZW1lbnQoKSB7XG4gICAgdGhpc1tDVVJTT1JfU1RBQ0tdLnBvcCgpO1xuICAgIGV4cGVjdCh0aGlzW0NVUlNPUl9TVEFDS10uY3VycmVudCwgXCJjYW4ndCBwb3AgcGFzdCB0aGUgbGFzdCBlbGVtZW50XCIpO1xuICB9XG5cbiAgcHVzaFNpbXBsZUJsb2NrKCk6IExpdmVCbG9jayB7XG4gICAgcmV0dXJuIHRoaXMucHVzaExpdmVCbG9jayhuZXcgU2ltcGxlTGl2ZUJsb2NrKHRoaXMuZWxlbWVudCkpO1xuICB9XG5cbiAgcHVzaFVwZGF0YWJsZUJsb2NrKCk6IFVwZGF0YWJsZUJsb2NrSW1wbCB7XG4gICAgcmV0dXJuIHRoaXMucHVzaExpdmVCbG9jayhuZXcgVXBkYXRhYmxlQmxvY2tJbXBsKHRoaXMuZWxlbWVudCkpO1xuICB9XG5cbiAgcHVzaEJsb2NrTGlzdChsaXN0OiBMaW5rZWRMaXN0PExpbmtlZExpc3ROb2RlICYgTGl2ZUJsb2NrPik6IExpdmVCbG9ja0xpc3Qge1xuICAgIHJldHVybiB0aGlzLnB1c2hMaXZlQmxvY2sobmV3IExpdmVCbG9ja0xpc3QodGhpcy5lbGVtZW50LCBsaXN0KSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcHVzaExpdmVCbG9jazxUIGV4dGVuZHMgTGl2ZUJsb2NrPihibG9jazogVCwgaXNSZW1vdGUgPSBmYWxzZSk6IFQge1xuICAgIGxldCBjdXJyZW50ID0gdGhpcy5ibG9ja1N0YWNrLmN1cnJlbnQ7XG5cbiAgICBpZiAoY3VycmVudCAhPT0gbnVsbCkge1xuICAgICAgaWYgKCFpc1JlbW90ZSkge1xuICAgICAgICBjdXJyZW50LmRpZEFwcGVuZEJvdW5kcyhibG9jayk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fX29wZW5CbG9jaygpO1xuICAgIHRoaXMuYmxvY2tTdGFjay5wdXNoKGJsb2NrKTtcbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cblxuICBwb3BCbG9jaygpOiBMaXZlQmxvY2sge1xuICAgIHRoaXMuYmxvY2soKS5maW5hbGl6ZSh0aGlzKTtcbiAgICB0aGlzLl9fY2xvc2VCbG9jaygpO1xuICAgIHJldHVybiBleHBlY3QodGhpcy5ibG9ja1N0YWNrLnBvcCgpLCAnRXhwZWN0ZWQgcG9wQmxvY2sgdG8gcmV0dXJuIGEgYmxvY2snKTtcbiAgfVxuXG4gIF9fb3BlbkJsb2NrKCk6IHZvaWQge31cbiAgX19jbG9zZUJsb2NrKCk6IHZvaWQge31cblxuICAvLyB0b2RvIHJldHVybiBzZWVtcyB1bnVzZWRcbiAgb3BlbkVsZW1lbnQodGFnOiBzdHJpbmcpOiBTaW1wbGVFbGVtZW50IHtcbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuX19vcGVuRWxlbWVudCh0YWcpO1xuICAgIHRoaXMuY29uc3RydWN0aW5nID0gZWxlbWVudDtcblxuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgX19vcGVuRWxlbWVudCh0YWc6IHN0cmluZyk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmRvbS5jcmVhdGVFbGVtZW50KHRhZywgdGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGZsdXNoRWxlbWVudChtb2RpZmllcnM6IE9wdGlvbjxbTW9kaWZpZXJNYW5hZ2VyLCB1bmtub3duXVtdPikge1xuICAgIGxldCBwYXJlbnQgPSB0aGlzLmVsZW1lbnQ7XG4gICAgbGV0IGVsZW1lbnQgPSBleHBlY3QoXG4gICAgICB0aGlzLmNvbnN0cnVjdGluZyxcbiAgICAgIGBmbHVzaEVsZW1lbnQgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdoZW4gY29uc3RydWN0aW5nIGFuIGVsZW1lbnRgXG4gICAgKTtcblxuICAgIHRoaXMuX19mbHVzaEVsZW1lbnQocGFyZW50LCBlbGVtZW50KTtcblxuICAgIHRoaXMuY29uc3RydWN0aW5nID0gbnVsbDtcbiAgICB0aGlzLm9wZXJhdGlvbnMgPSBudWxsO1xuXG4gICAgdGhpcy5wdXNoTW9kaWZpZXJzKG1vZGlmaWVycyk7XG4gICAgdGhpcy5wdXNoRWxlbWVudChlbGVtZW50LCBudWxsKTtcbiAgICB0aGlzLmRpZE9wZW5FbGVtZW50KGVsZW1lbnQpO1xuICB9XG5cbiAgX19mbHVzaEVsZW1lbnQocGFyZW50OiBTaW1wbGVFbGVtZW50LCBjb25zdHJ1Y3Rpbmc6IFNpbXBsZUVsZW1lbnQpIHtcbiAgICB0aGlzLmRvbS5pbnNlcnRCZWZvcmUocGFyZW50LCBjb25zdHJ1Y3RpbmcsIHRoaXMubmV4dFNpYmxpbmcpO1xuICB9XG5cbiAgY2xvc2VFbGVtZW50KCk6IE9wdGlvbjxbTW9kaWZpZXJNYW5hZ2VyLCB1bmtub3duXVtdPiB7XG4gICAgdGhpcy53aWxsQ2xvc2VFbGVtZW50KCk7XG4gICAgdGhpcy5wb3BFbGVtZW50KCk7XG4gICAgcmV0dXJuIHRoaXMucG9wTW9kaWZpZXJzKCk7XG4gIH1cblxuICBwdXNoUmVtb3RlRWxlbWVudChcbiAgICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIGd1aWQ6IHN0cmluZyxcbiAgICBpbnNlcnRCZWZvcmU6IE1heWJlPFNpbXBsZU5vZGU+XG4gICk6IE9wdGlvbjxSZW1vdGVMaXZlQmxvY2s+IHtcbiAgICByZXR1cm4gdGhpcy5fX3B1c2hSZW1vdGVFbGVtZW50KGVsZW1lbnQsIGd1aWQsIGluc2VydEJlZm9yZSk7XG4gIH1cblxuICBfX3B1c2hSZW1vdGVFbGVtZW50KFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgX2d1aWQ6IHN0cmluZyxcbiAgICBpbnNlcnRCZWZvcmU6IE1heWJlPFNpbXBsZU5vZGU+XG4gICk6IE9wdGlvbjxSZW1vdGVMaXZlQmxvY2s+IHtcbiAgICB0aGlzLnB1c2hFbGVtZW50KGVsZW1lbnQsIGluc2VydEJlZm9yZSk7XG5cbiAgICBpZiAoaW5zZXJ0QmVmb3JlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHdoaWxlIChlbGVtZW50Lmxhc3RDaGlsZCkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQubGFzdENoaWxkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgYmxvY2sgPSBuZXcgUmVtb3RlTGl2ZUJsb2NrKGVsZW1lbnQpO1xuXG4gICAgcmV0dXJuIHRoaXMucHVzaExpdmVCbG9jayhibG9jaywgdHJ1ZSk7XG4gIH1cblxuICBwb3BSZW1vdGVFbGVtZW50KCkge1xuICAgIHRoaXMucG9wQmxvY2soKTtcbiAgICB0aGlzLnBvcEVsZW1lbnQoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBwdXNoRWxlbWVudChlbGVtZW50OiBTaW1wbGVFbGVtZW50LCBuZXh0U2libGluZzogTWF5YmU8U2ltcGxlTm9kZT4gPSBudWxsKSB7XG4gICAgdGhpc1tDVVJTT1JfU1RBQ0tdLnB1c2gobmV3IEN1cnNvckltcGwoZWxlbWVudCwgbmV4dFNpYmxpbmcpKTtcbiAgfVxuXG4gIHByaXZhdGUgcHVzaE1vZGlmaWVycyhtb2RpZmllcnM6IE9wdGlvbjxbTW9kaWZpZXJNYW5hZ2VyLCB1bmtub3duXVtdPik6IHZvaWQge1xuICAgIHRoaXMubW9kaWZpZXJTdGFjay5wdXNoKG1vZGlmaWVycyk7XG4gIH1cblxuICBwcml2YXRlIHBvcE1vZGlmaWVycygpOiBPcHRpb248W01vZGlmaWVyTWFuYWdlciwgdW5rbm93bl1bXT4ge1xuICAgIHJldHVybiB0aGlzLm1vZGlmaWVyU3RhY2sucG9wKCk7XG4gIH1cblxuICBkaWRBcHBlbmRCb3VuZHMoYm91bmRzOiBCb3VuZHMpOiBCb3VuZHMge1xuICAgIHRoaXMuYmxvY2soKS5kaWRBcHBlbmRCb3VuZHMoYm91bmRzKTtcbiAgICByZXR1cm4gYm91bmRzO1xuICB9XG5cbiAgZGlkQXBwZW5kTm9kZTxUIGV4dGVuZHMgU2ltcGxlTm9kZT4obm9kZTogVCk6IFQge1xuICAgIHRoaXMuYmxvY2soKS5kaWRBcHBlbmROb2RlKG5vZGUpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgZGlkT3BlbkVsZW1lbnQoZWxlbWVudDogU2ltcGxlRWxlbWVudCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHRoaXMuYmxvY2soKS5vcGVuRWxlbWVudChlbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIHdpbGxDbG9zZUVsZW1lbnQoKSB7XG4gICAgdGhpcy5ibG9jaygpLmNsb3NlRWxlbWVudCgpO1xuICB9XG5cbiAgYXBwZW5kVGV4dChzdHJpbmc6IHN0cmluZyk6IFNpbXBsZVRleHQge1xuICAgIHJldHVybiB0aGlzLmRpZEFwcGVuZE5vZGUodGhpcy5fX2FwcGVuZFRleHQoc3RyaW5nKSk7XG4gIH1cblxuICBfX2FwcGVuZFRleHQodGV4dDogc3RyaW5nKTogU2ltcGxlVGV4dCB7XG4gICAgbGV0IHsgZG9tLCBlbGVtZW50LCBuZXh0U2libGluZyB9ID0gdGhpcztcbiAgICBsZXQgbm9kZSA9IGRvbS5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbiAgICBkb20uaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIG5vZGUsIG5leHRTaWJsaW5nKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIF9fYXBwZW5kTm9kZShub2RlOiBTaW1wbGVOb2RlKTogU2ltcGxlTm9kZSB7XG4gICAgdGhpcy5kb20uaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgbm9kZSwgdGhpcy5uZXh0U2libGluZyk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBfX2FwcGVuZEZyYWdtZW50KGZyYWdtZW50OiBTaW1wbGVEb2N1bWVudEZyYWdtZW50KTogQm91bmRzIHtcbiAgICBsZXQgZmlyc3QgPSBmcmFnbWVudC5maXJzdENoaWxkO1xuXG4gICAgaWYgKGZpcnN0KSB7XG4gICAgICBsZXQgcmV0ID0gbmV3IENvbmNyZXRlQm91bmRzKHRoaXMuZWxlbWVudCwgZmlyc3QsIGZyYWdtZW50Lmxhc3RDaGlsZCEpO1xuICAgICAgdGhpcy5kb20uaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgZnJhZ21lbnQsIHRoaXMubmV4dFNpYmxpbmcpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBTaW5nbGVOb2RlQm91bmRzKHRoaXMuZWxlbWVudCwgdGhpcy5fX2FwcGVuZENvbW1lbnQoJycpKTtcbiAgICB9XG4gIH1cblxuICBfX2FwcGVuZEhUTUwoaHRtbDogc3RyaW5nKTogQm91bmRzIHtcbiAgICByZXR1cm4gdGhpcy5kb20uaW5zZXJ0SFRNTEJlZm9yZSh0aGlzLmVsZW1lbnQsIHRoaXMubmV4dFNpYmxpbmcsIGh0bWwpO1xuICB9XG5cbiAgYXBwZW5kRHluYW1pY0hUTUwodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGxldCBib3VuZHMgPSB0aGlzLnRydXN0ZWRDb250ZW50KHZhbHVlKTtcbiAgICB0aGlzLmRpZEFwcGVuZEJvdW5kcyhib3VuZHMpO1xuICB9XG5cbiAgYXBwZW5kRHluYW1pY1RleHQodmFsdWU6IHN0cmluZyk6IFNpbXBsZVRleHQge1xuICAgIGxldCBub2RlID0gdGhpcy51bnRydXN0ZWRDb250ZW50KHZhbHVlKTtcbiAgICB0aGlzLmRpZEFwcGVuZE5vZGUobm9kZSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBhcHBlbmREeW5hbWljRnJhZ21lbnQodmFsdWU6IFNpbXBsZURvY3VtZW50RnJhZ21lbnQpOiB2b2lkIHtcbiAgICBsZXQgYm91bmRzID0gdGhpcy5fX2FwcGVuZEZyYWdtZW50KHZhbHVlKTtcbiAgICB0aGlzLmRpZEFwcGVuZEJvdW5kcyhib3VuZHMpO1xuICB9XG5cbiAgYXBwZW5kRHluYW1pY05vZGUodmFsdWU6IFNpbXBsZU5vZGUpOiB2b2lkIHtcbiAgICBsZXQgbm9kZSA9IHRoaXMuX19hcHBlbmROb2RlKHZhbHVlKTtcbiAgICBsZXQgYm91bmRzID0gbmV3IFNpbmdsZU5vZGVCb3VuZHModGhpcy5lbGVtZW50LCBub2RlKTtcbiAgICB0aGlzLmRpZEFwcGVuZEJvdW5kcyhib3VuZHMpO1xuICB9XG5cbiAgcHJpdmF0ZSB0cnVzdGVkQ29udGVudCh2YWx1ZTogc3RyaW5nKTogQm91bmRzIHtcbiAgICByZXR1cm4gdGhpcy5fX2FwcGVuZEhUTUwodmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSB1bnRydXN0ZWRDb250ZW50KHZhbHVlOiBzdHJpbmcpOiBTaW1wbGVUZXh0IHtcbiAgICByZXR1cm4gdGhpcy5fX2FwcGVuZFRleHQodmFsdWUpO1xuICB9XG5cbiAgYXBwZW5kQ29tbWVudChzdHJpbmc6IHN0cmluZyk6IFNpbXBsZUNvbW1lbnQge1xuICAgIHJldHVybiB0aGlzLmRpZEFwcGVuZE5vZGUodGhpcy5fX2FwcGVuZENvbW1lbnQoc3RyaW5nKSk7XG4gIH1cblxuICBfX2FwcGVuZENvbW1lbnQoc3RyaW5nOiBzdHJpbmcpOiBTaW1wbGVDb21tZW50IHtcbiAgICBsZXQgeyBkb20sIGVsZW1lbnQsIG5leHRTaWJsaW5nIH0gPSB0aGlzO1xuICAgIGxldCBub2RlID0gZG9tLmNyZWF0ZUNvbW1lbnQoc3RyaW5nKTtcbiAgICBkb20uaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIG5vZGUsIG5leHRTaWJsaW5nKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIF9fc2V0QXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT4pOiB2b2lkIHtcbiAgICB0aGlzLmRvbS5zZXRBdHRyaWJ1dGUodGhpcy5jb25zdHJ1Y3RpbmchLCBuYW1lLCB2YWx1ZSwgbmFtZXNwYWNlKTtcbiAgfVxuXG4gIF9fc2V0UHJvcGVydHkobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgICh0aGlzLmNvbnN0cnVjdGluZyEgYXMgRGljdClbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHNldFN0YXRpY0F0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+KTogdm9pZCB7XG4gICAgdGhpcy5fX3NldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSwgbmFtZXNwYWNlKTtcbiAgfVxuXG4gIHNldER5bmFtaWNBdHRyaWJ1dGUoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHZhbHVlOiB1bmtub3duLFxuICAgIHRydXN0aW5nOiBib29sZWFuLFxuICAgIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+XG4gICk6IER5bmFtaWNBdHRyaWJ1dGUge1xuICAgIGxldCBlbGVtZW50ID0gdGhpcy5jb25zdHJ1Y3RpbmchO1xuICAgIGxldCBhdHRyaWJ1dGUgPSB0aGlzLmVudi5hdHRyaWJ1dGVGb3IoZWxlbWVudCwgbmFtZSwgdHJ1c3RpbmcsIG5hbWVzcGFjZSk7XG4gICAgYXR0cmlidXRlLnNldCh0aGlzLCB2YWx1ZSwgdGhpcy5lbnYpO1xuICAgIHJldHVybiBhdHRyaWJ1dGU7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNpbXBsZUxpdmVCbG9jayBpbXBsZW1lbnRzIExpdmVCbG9jayB7XG4gIHByb3RlY3RlZCBmaXJzdDogT3B0aW9uPEZpcnN0Tm9kZT4gPSBudWxsO1xuICBwcm90ZWN0ZWQgbGFzdDogT3B0aW9uPExhc3ROb2RlPiA9IG51bGw7XG4gIHByb3RlY3RlZCBkZXN0cm95YWJsZXM6IE9wdGlvbjxTeW1ib2xEZXN0cm95YWJsZVtdPiA9IG51bGw7XG4gIHByb3RlY3RlZCBuZXN0aW5nID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcmVudDogU2ltcGxlRWxlbWVudCkge31cblxuICBwYXJlbnRFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLnBhcmVudDtcbiAgfVxuXG4gIGZpcnN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICBsZXQgZmlyc3QgPSBleHBlY3QoXG4gICAgICB0aGlzLmZpcnN0LFxuICAgICAgJ2Nhbm5vdCBjYWxsIGBmaXJzdE5vZGUoKWAgd2hpbGUgYFNpbXBsZUxpdmVCbG9ja2AgaXMgc3RpbGwgaW5pdGlhbGl6aW5nJ1xuICAgICk7XG5cbiAgICByZXR1cm4gZmlyc3QuZmlyc3ROb2RlKCk7XG4gIH1cblxuICBsYXN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICBsZXQgbGFzdCA9IGV4cGVjdChcbiAgICAgIHRoaXMubGFzdCxcbiAgICAgICdjYW5ub3QgY2FsbCBgbGFzdE5vZGUoKWAgd2hpbGUgYFNpbXBsZUxpdmVCbG9ja2AgaXMgc3RpbGwgaW5pdGlhbGl6aW5nJ1xuICAgICk7XG5cbiAgICByZXR1cm4gbGFzdC5sYXN0Tm9kZSgpO1xuICB9XG5cbiAgb3BlbkVsZW1lbnQoZWxlbWVudDogU2ltcGxlRWxlbWVudCkge1xuICAgIHRoaXMuZGlkQXBwZW5kTm9kZShlbGVtZW50KTtcbiAgICB0aGlzLm5lc3RpbmcrKztcbiAgfVxuXG4gIGNsb3NlRWxlbWVudCgpIHtcbiAgICB0aGlzLm5lc3RpbmctLTtcbiAgfVxuXG4gIGRpZEFwcGVuZE5vZGUobm9kZTogU2ltcGxlTm9kZSkge1xuICAgIGlmICh0aGlzLm5lc3RpbmcgIT09IDApIHJldHVybjtcblxuICAgIGlmICghdGhpcy5maXJzdCkge1xuICAgICAgdGhpcy5maXJzdCA9IG5ldyBGaXJzdChub2RlKTtcbiAgICB9XG5cbiAgICB0aGlzLmxhc3QgPSBuZXcgTGFzdChub2RlKTtcbiAgfVxuXG4gIGRpZEFwcGVuZEJvdW5kcyhib3VuZHM6IEJvdW5kcykge1xuICAgIGlmICh0aGlzLm5lc3RpbmcgIT09IDApIHJldHVybjtcblxuICAgIGlmICghdGhpcy5maXJzdCkge1xuICAgICAgdGhpcy5maXJzdCA9IGJvdW5kcztcbiAgICB9XG5cbiAgICB0aGlzLmxhc3QgPSBib3VuZHM7XG4gIH1cblxuICBmaW5hbGl6ZShzdGFjazogRWxlbWVudEJ1aWxkZXIpIHtcbiAgICBpZiAodGhpcy5maXJzdCA9PT0gbnVsbCkge1xuICAgICAgc3RhY2suYXBwZW5kQ29tbWVudCgnJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW1vdGVMaXZlQmxvY2sgZXh0ZW5kcyBTaW1wbGVMaXZlQmxvY2sgaW1wbGVtZW50cyBTeW1ib2xEZXN0cm95YWJsZSB7XG4gIFtERVNUUk9ZXSgpIHtcbiAgICBjbGVhcih0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVXBkYXRhYmxlQmxvY2tJbXBsIGV4dGVuZHMgU2ltcGxlTGl2ZUJsb2NrIGltcGxlbWVudHMgVXBkYXRhYmxlQmxvY2sge1xuICByZXNldChlbnY6IEVudmlyb25tZW50KTogT3B0aW9uPFNpbXBsZU5vZGU+IHtcbiAgICBsZXQgbmV4dFNpYmxpbmcgPSBkZXRhY2hDaGlsZHJlbih0aGlzLCBlbnYpO1xuXG4gICAgLy8gbGV0IG5leHRTaWJsaW5nID0gY2xlYXIodGhpcyk7XG5cbiAgICB0aGlzLmZpcnN0ID0gbnVsbDtcbiAgICB0aGlzLmxhc3QgPSBudWxsO1xuICAgIHRoaXMuZGVzdHJveWFibGVzID0gbnVsbDtcbiAgICB0aGlzLm5lc3RpbmcgPSAwO1xuXG4gICAgcmV0dXJuIG5leHRTaWJsaW5nO1xuICB9XG59XG5cbi8vIEZJWE1FOiBBbGwgdGhlIG5vb3BzIGluIGhlcmUgaW5kaWNhdGUgYSBtb2RlbGxpbmcgcHJvYmxlbVxuY2xhc3MgTGl2ZUJsb2NrTGlzdCBpbXBsZW1lbnRzIExpdmVCbG9jayB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgcGFyZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgYm91bmRMaXN0OiBMaW5rZWRMaXN0PExpbmtlZExpc3ROb2RlICYgTGl2ZUJsb2NrPlxuICApIHtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmJvdW5kTGlzdCA9IGJvdW5kTGlzdDtcbiAgfVxuXG4gIHBhcmVudEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50O1xuICB9XG5cbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIGxldCBoZWFkID0gZXhwZWN0KFxuICAgICAgdGhpcy5ib3VuZExpc3QuaGVhZCgpLFxuICAgICAgJ2Nhbm5vdCBjYWxsIGBmaXJzdE5vZGUoKWAgd2hpbGUgYExpdmVCbG9ja0xpc3RgIGlzIHN0aWxsIGluaXRpYWxpemluZydcbiAgICApO1xuXG4gICAgcmV0dXJuIGhlYWQuZmlyc3ROb2RlKCk7XG4gIH1cblxuICBsYXN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICBsZXQgdGFpbCA9IGV4cGVjdChcbiAgICAgIHRoaXMuYm91bmRMaXN0LnRhaWwoKSxcbiAgICAgICdjYW5ub3QgY2FsbCBgbGFzdE5vZGUoKWAgd2hpbGUgYExpdmVCbG9ja0xpc3RgIGlzIHN0aWxsIGluaXRpYWxpemluZydcbiAgICApO1xuXG4gICAgcmV0dXJuIHRhaWwubGFzdE5vZGUoKTtcbiAgfVxuXG4gIG9wZW5FbGVtZW50KF9lbGVtZW50OiBTaW1wbGVFbGVtZW50KSB7XG4gICAgYXNzZXJ0KGZhbHNlLCAnQ2Fubm90IG9wZW5FbGVtZW50IGRpcmVjdGx5IGluc2lkZSBhIGJsb2NrIGxpc3QnKTtcbiAgfVxuXG4gIGNsb3NlRWxlbWVudCgpIHtcbiAgICBhc3NlcnQoZmFsc2UsICdDYW5ub3QgY2xvc2VFbGVtZW50IGRpcmVjdGx5IGluc2lkZSBhIGJsb2NrIGxpc3QnKTtcbiAgfVxuXG4gIGRpZEFwcGVuZE5vZGUoX25vZGU6IFNpbXBsZU5vZGUpIHtcbiAgICBhc3NlcnQoZmFsc2UsICdDYW5ub3QgY3JlYXRlIGEgbmV3IG5vZGUgZGlyZWN0bHkgaW5zaWRlIGEgYmxvY2sgbGlzdCcpO1xuICB9XG5cbiAgZGlkQXBwZW5kQm91bmRzKF9ib3VuZHM6IEJvdW5kcykge31cblxuICBmaW5hbGl6ZShfc3RhY2s6IEVsZW1lbnRCdWlsZGVyKSB7XG4gICAgYXNzZXJ0KHRoaXMuYm91bmRMaXN0LmhlYWQoKSAhPT0gbnVsbCwgJ2JvdW5kc0xpc3QgY2Fubm90IGJlIGVtcHR5Jyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsaWVudEJ1aWxkZXIoZW52OiBFbnZpcm9ubWVudCwgY3Vyc29yOiBDdXJzb3JJbXBsKTogRWxlbWVudEJ1aWxkZXIge1xuICByZXR1cm4gTmV3RWxlbWVudEJ1aWxkZXIuZm9ySW5pdGlhbFJlbmRlcihlbnYsIGN1cnNvcik7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9