"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UpdatableBlockImpl = exports.RemoteLiveBlock = exports.SimpleLiveBlock = exports.NewElementBuilder = exports.CURSOR_STACK = exports.Fragment = undefined;
exports.clientBuilder = clientBuilder;

var _util = require("@glimmer/util");

var _bounds2 = require("../bounds");

var _lifetime = require("../lifetime");

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
        var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
        }
    }return obj;
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

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var _a;


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

var Fragment = exports.Fragment = function () {
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
var CURSOR_STACK = exports.CURSOR_STACK = 'CURSOR_STACK [31ea0d2f-7c22-4814-9db7-28e4469b54e6]';
var NewElementBuilder = exports.NewElementBuilder = function () {
    function NewElementBuilder(env, parentNode, nextSibling) {
        _classCallCheck(this, NewElementBuilder);

        this.constructing = null;
        this.operations = null;
        this[_a] = new _util.Stack();
        this.modifierStack = new _util.Stack();
        this.blockStack = new _util.Stack();
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

        this[CURSOR_STACK].push(new _bounds2.CursorImpl(element, nextSibling));
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
            var ret = new _bounds2.ConcreteBounds(this.element, first, fragment.lastChild);
            this.dom.insertBefore(this.element, fragment, this.nextSibling);
            return ret;
        } else {
            return new _bounds2.SingleNodeBounds(this.element, this.__appendComment(''));
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
        var bounds = new _bounds2.SingleNodeBounds(this.element, node);
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
var SimpleLiveBlock = exports.SimpleLiveBlock = function () {
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
var RemoteLiveBlock = exports.RemoteLiveBlock = function (_SimpleLiveBlock) {
    _inherits(RemoteLiveBlock, _SimpleLiveBlock);

    function RemoteLiveBlock() {
        _classCallCheck(this, RemoteLiveBlock);

        return _possibleConstructorReturn(this, _SimpleLiveBlock.apply(this, arguments));
    }

    RemoteLiveBlock.prototype[_util.DESTROY] = function () {
        (0, _bounds2.clear)(this);
    };

    return RemoteLiveBlock;
}(SimpleLiveBlock);
var UpdatableBlockImpl = exports.UpdatableBlockImpl = function (_SimpleLiveBlock2) {
    _inherits(UpdatableBlockImpl, _SimpleLiveBlock2);

    function UpdatableBlockImpl() {
        _classCallCheck(this, UpdatableBlockImpl);

        return _possibleConstructorReturn(this, _SimpleLiveBlock2.apply(this, arguments));
    }

    UpdatableBlockImpl.prototype.reset = function reset(env) {
        var nextSibling = (0, _lifetime.detachChildren)(this, env);
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
        false && (0, _util.assert)(false, 'Cannot openElement directly inside a block list');
    };

    LiveBlockList.prototype.closeElement = function closeElement() {
        false && (0, _util.assert)(false, 'Cannot closeElement directly inside a block list');
    };

    LiveBlockList.prototype.didAppendNode = function didAppendNode(_node) {
        false && (0, _util.assert)(false, 'Cannot create a new node directly inside a block list');
    };

    LiveBlockList.prototype.didAppendBounds = function didAppendBounds(_bounds) {};

    LiveBlockList.prototype.finalize = function finalize(_stack) {
        false && (0, _util.assert)(this.boundList.head() !== null, 'boundsList cannot be empty');
    };

    return LiveBlockList;
}();

function clientBuilder(env, cursor) {
    return NewElementBuilder.forInitialRender(env, cursor);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2VsZW1lbnQtYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7UUFtZ0JNLGEsR0FBQSxhOztBQXBmTjs7QUFrQkE7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBV0EsUTtBQUNFLGFBQUEsS0FBQSxDQUFBLElBQUEsRUFBb0M7QUFBQSx3QkFBQSxJQUFBLEVBQUEsS0FBQTs7QUFBaEIsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUFvQjs7b0JBRXhDLFMsd0JBQVM7QUFDUCxlQUFPLEtBQVAsSUFBQTs7Ozs7O0lBSUosTztBQUNFLGFBQUEsSUFBQSxDQUFBLElBQUEsRUFBb0M7QUFBQSx3QkFBQSxJQUFBLEVBQUEsSUFBQTs7QUFBaEIsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUFvQjs7bUJBRXhDLFEsdUJBQVE7QUFDTixlQUFPLEtBQVAsSUFBQTs7Ozs7O0FBSUosSUFBQSw4QkFBQSxZQUFBO0FBR0UsYUFBQSxRQUFBLENBQUEsTUFBQSxFQUEwQjtBQUFBLHdCQUFBLElBQUEsRUFBQSxRQUFBOztBQUN4QixhQUFBLE1BQUEsR0FBQSxNQUFBO0FBQ0Q7O0FBTEgsYUFBQSxTQUFBLENBQUEsYUFBQSxHQUFBLFNBQUEsYUFBQSxHQU9lO0FBQ1gsZUFBTyxLQUFBLE1BQUEsQ0FBUCxhQUFPLEVBQVA7QUFSSixLQUFBOztBQUFBLGFBQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLFNBQUEsR0FXVztBQUNQLGVBQU8sS0FBQSxNQUFBLENBQVAsU0FBTyxFQUFQO0FBWkosS0FBQTs7QUFBQSxhQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLEdBZVU7QUFDTixlQUFPLEtBQUEsTUFBQSxDQUFQLFFBQU8sRUFBUDtBQWhCSixLQUFBOztBQUFBLFdBQUEsUUFBQTtBQUFBLENBQUEsRUFBQTtBQW9CTyxJQUFN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Q0EsYUFBQSxTQUFBLEdBQUEsU0FBQTtBQUVqQixhQUFBLE1BQUEsR0FBQSxNQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsU0FBQTtBQUNEOzs0QkFFRCxhLDRCQUFhO0FBQ1gsZUFBTyxLQUFQLE1BQUE7Ozs0QkFHRixTLHdCQUFTO0FBQ1AsWUFBSSxPQUNGLEtBQUEsU0FBQSxDQURGLElBQ0UsRUFERjtBQUtBLGVBQU8sS0FBUCxTQUFPLEVBQVA7Ozs0QkFHRixRLHVCQUFRO0FBQ04sWUFBSSxPQUNGLEtBQUEsU0FBQSxDQURGLElBQ0UsRUFERjtBQUtBLGVBQU8sS0FBUCxRQUFPLEVBQVA7Ozs0QkFHRixXLHdCQUFBLFEsRUFBbUM7QUFBQSxpQkFDakMsa0JBQUEsS0FBQSxFQURpQyxpREFDakMsQ0FEaUM7Ozs0QkFJbkMsWSwyQkFBWTtBQUFBLGlCQUNWLGtCQUFBLEtBQUEsRUFEVSxrREFDVixDQURVOzs7NEJBSVosYSwwQkFBQSxLLEVBQStCO0FBQUEsaUJBQzdCLGtCQUFBLEtBQUEsRUFENkIsdURBQzdCLENBRDZCOzs7NEJBSS9CLGUsNEJBQUEsTyxFQUErQixDOzs0QkFFL0IsUSxxQkFBQSxNLEVBQStCO0FBQUEsaUJBQzdCLGtCQUFPLEtBQUEsU0FBQSxDQUFBLElBQUEsT0FBUCxJQUFBLEVBRDZCLDRCQUM3QixDQUQ2Qjs7Ozs7O0FBSzNCLFNBQUEsYUFBQSxDQUFBLEdBQUEsRUFBQSxNQUFBLEVBQTREO0FBQ2hFLFdBQU8sa0JBQUEsZ0JBQUEsQ0FBQSxHQUFBLEVBQVAsTUFBTyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBCb3VuZHMsXG4gIERpY3QsXG4gIEVsZW1lbnRPcGVyYXRpb25zLFxuICBFbnZpcm9ubWVudCxcbiAgR2xpbW1lclRyZWVDaGFuZ2VzLFxuICBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbixcbiAgU3ltYm9sRGVzdHJveWFibGUsXG4gIEVsZW1lbnRCdWlsZGVyLFxuICBMaXZlQmxvY2ssXG4gIEN1cnNvclN0YWNrU3ltYm9sLFxuICBVcGRhdGFibGVCbG9jayxcbiAgQ3Vyc29yLFxuICBNb2RpZmllck1hbmFnZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgYXNzZXJ0LFxuICBERVNUUk9ZLFxuICBleHBlY3QsXG4gIExpbmtlZExpc3QsXG4gIExpbmtlZExpc3ROb2RlLFxuICBPcHRpb24sXG4gIFN0YWNrLFxuICBNYXliZSxcbn0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQge1xuICBBdHRyTmFtZXNwYWNlLFxuICBTaW1wbGVDb21tZW50LFxuICBTaW1wbGVEb2N1bWVudEZyYWdtZW50LFxuICBTaW1wbGVFbGVtZW50LFxuICBTaW1wbGVOb2RlLFxuICBTaW1wbGVUZXh0LFxufSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgY2xlYXIsIENvbmNyZXRlQm91bmRzLCBDdXJzb3JJbXBsLCBTaW5nbGVOb2RlQm91bmRzIH0gZnJvbSAnLi4vYm91bmRzJztcbmltcG9ydCB7IGRldGFjaENoaWxkcmVuIH0gZnJvbSAnLi4vbGlmZXRpbWUnO1xuaW1wb3J0IHsgRHluYW1pY0F0dHJpYnV0ZSB9IGZyb20gJy4vYXR0cmlidXRlcy9keW5hbWljJztcblxuZXhwb3J0IGludGVyZmFjZSBGaXJzdE5vZGUge1xuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMYXN0Tm9kZSB7XG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGU7XG59XG5cbmNsYXNzIEZpcnN0IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBub2RlOiBTaW1wbGVOb2RlKSB7fVxuXG4gIGZpcnN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlO1xuICB9XG59XG5cbmNsYXNzIExhc3Qge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5vZGU6IFNpbXBsZU5vZGUpIHt9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRnJhZ21lbnQgaW1wbGVtZW50cyBCb3VuZHMge1xuICBwcml2YXRlIGJvdW5kczogQm91bmRzO1xuXG4gIGNvbnN0cnVjdG9yKGJvdW5kczogQm91bmRzKSB7XG4gICAgdGhpcy5ib3VuZHMgPSBib3VuZHM7XG4gIH1cblxuICBwYXJlbnRFbGVtZW50KCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5wYXJlbnRFbGVtZW50KCk7XG4gIH1cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmZpcnN0Tm9kZSgpO1xuICB9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmxhc3ROb2RlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IENVUlNPUl9TVEFDSzogQ3Vyc29yU3RhY2tTeW1ib2wgPVxuICAnQ1VSU09SX1NUQUNLIFszMWVhMGQyZi03YzIyLTQ4MTQtOWRiNy0yOGU0NDY5YjU0ZTZdJztcblxuZXhwb3J0IGNsYXNzIE5ld0VsZW1lbnRCdWlsZGVyIGltcGxlbWVudHMgRWxlbWVudEJ1aWxkZXIge1xuICBwdWJsaWMgZG9tOiBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbjtcbiAgcHVibGljIHVwZGF0ZU9wZXJhdGlvbnM6IEdsaW1tZXJUcmVlQ2hhbmdlcztcbiAgcHVibGljIGNvbnN0cnVjdGluZzogT3B0aW9uPFNpbXBsZUVsZW1lbnQ+ID0gbnVsbDtcbiAgcHVibGljIG9wZXJhdGlvbnM6IE9wdGlvbjxFbGVtZW50T3BlcmF0aW9ucz4gPSBudWxsO1xuICBwcml2YXRlIGVudjogRW52aXJvbm1lbnQ7XG5cbiAgW0NVUlNPUl9TVEFDS10gPSBuZXcgU3RhY2s8Q3Vyc29yPigpO1xuICBwcml2YXRlIG1vZGlmaWVyU3RhY2sgPSBuZXcgU3RhY2s8T3B0aW9uPFtNb2RpZmllck1hbmFnZXIsIHVua25vd25dW10+PigpO1xuICBwcml2YXRlIGJsb2NrU3RhY2sgPSBuZXcgU3RhY2s8TGl2ZUJsb2NrPigpO1xuXG4gIHN0YXRpYyBmb3JJbml0aWFsUmVuZGVyKGVudjogRW52aXJvbm1lbnQsIGN1cnNvcjogQ3Vyc29ySW1wbCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhlbnYsIGN1cnNvci5lbGVtZW50LCBjdXJzb3IubmV4dFNpYmxpbmcpLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIHN0YXRpYyByZXN1bWUoZW52OiBFbnZpcm9ubWVudCwgYmxvY2s6IFVwZGF0YWJsZUJsb2NrKTogTmV3RWxlbWVudEJ1aWxkZXIge1xuICAgIGxldCBwYXJlbnROb2RlID0gYmxvY2sucGFyZW50RWxlbWVudCgpO1xuICAgIGxldCBuZXh0U2libGluZyA9IGJsb2NrLnJlc2V0KGVudik7XG5cbiAgICBsZXQgc3RhY2sgPSBuZXcgdGhpcyhlbnYsIHBhcmVudE5vZGUsIG5leHRTaWJsaW5nKS5pbml0aWFsaXplKCk7XG4gICAgc3RhY2sucHVzaExpdmVCbG9jayhibG9jayk7XG5cbiAgICByZXR1cm4gc3RhY2s7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihlbnY6IEVudmlyb25tZW50LCBwYXJlbnROb2RlOiBTaW1wbGVFbGVtZW50LCBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+KSB7XG4gICAgdGhpcy5wdXNoRWxlbWVudChwYXJlbnROb2RlLCBuZXh0U2libGluZyk7XG5cbiAgICB0aGlzLmVudiA9IGVudjtcbiAgICB0aGlzLmRvbSA9IGVudi5nZXRBcHBlbmRPcGVyYXRpb25zKCk7XG4gICAgdGhpcy51cGRhdGVPcGVyYXRpb25zID0gZW52LmdldERPTSgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKTogdGhpcyB7XG4gICAgdGhpcy5wdXNoU2ltcGxlQmxvY2soKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRlYnVnQmxvY2tzKCk6IExpdmVCbG9ja1tdIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja1N0YWNrLnRvQXJyYXkoKTtcbiAgfVxuXG4gIGdldCBlbGVtZW50KCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzW0NVUlNPUl9TVEFDS10uY3VycmVudCEuZWxlbWVudDtcbiAgfVxuXG4gIGdldCBuZXh0U2libGluZygpOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICAgIHJldHVybiB0aGlzW0NVUlNPUl9TVEFDS10uY3VycmVudCEubmV4dFNpYmxpbmc7XG4gIH1cblxuICBibG9jaygpOiBMaXZlQmxvY2sge1xuICAgIHJldHVybiBleHBlY3QodGhpcy5ibG9ja1N0YWNrLmN1cnJlbnQsICdFeHBlY3RlZCBhIGN1cnJlbnQgbGl2ZSBibG9jaycpO1xuICB9XG5cbiAgcG9wRWxlbWVudCgpIHtcbiAgICB0aGlzW0NVUlNPUl9TVEFDS10ucG9wKCk7XG4gICAgZXhwZWN0KHRoaXNbQ1VSU09SX1NUQUNLXS5jdXJyZW50LCBcImNhbid0IHBvcCBwYXN0IHRoZSBsYXN0IGVsZW1lbnRcIik7XG4gIH1cblxuICBwdXNoU2ltcGxlQmxvY2soKTogTGl2ZUJsb2NrIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoTGl2ZUJsb2NrKG5ldyBTaW1wbGVMaXZlQmxvY2sodGhpcy5lbGVtZW50KSk7XG4gIH1cblxuICBwdXNoVXBkYXRhYmxlQmxvY2soKTogVXBkYXRhYmxlQmxvY2tJbXBsIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoTGl2ZUJsb2NrKG5ldyBVcGRhdGFibGVCbG9ja0ltcGwodGhpcy5lbGVtZW50KSk7XG4gIH1cblxuICBwdXNoQmxvY2tMaXN0KGxpc3Q6IExpbmtlZExpc3Q8TGlua2VkTGlzdE5vZGUgJiBMaXZlQmxvY2s+KTogTGl2ZUJsb2NrTGlzdCB7XG4gICAgcmV0dXJuIHRoaXMucHVzaExpdmVCbG9jayhuZXcgTGl2ZUJsb2NrTGlzdCh0aGlzLmVsZW1lbnQsIGxpc3QpKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBwdXNoTGl2ZUJsb2NrPFQgZXh0ZW5kcyBMaXZlQmxvY2s+KGJsb2NrOiBULCBpc1JlbW90ZSA9IGZhbHNlKTogVCB7XG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmJsb2NrU3RhY2suY3VycmVudDtcblxuICAgIGlmIChjdXJyZW50ICE9PSBudWxsKSB7XG4gICAgICBpZiAoIWlzUmVtb3RlKSB7XG4gICAgICAgIGN1cnJlbnQuZGlkQXBwZW5kQm91bmRzKGJsb2NrKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9fb3BlbkJsb2NrKCk7XG4gICAgdGhpcy5ibG9ja1N0YWNrLnB1c2goYmxvY2spO1xuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIHBvcEJsb2NrKCk6IExpdmVCbG9jayB7XG4gICAgdGhpcy5ibG9jaygpLmZpbmFsaXplKHRoaXMpO1xuICAgIHRoaXMuX19jbG9zZUJsb2NrKCk7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzLmJsb2NrU3RhY2sucG9wKCksICdFeHBlY3RlZCBwb3BCbG9jayB0byByZXR1cm4gYSBibG9jaycpO1xuICB9XG5cbiAgX19vcGVuQmxvY2soKTogdm9pZCB7fVxuICBfX2Nsb3NlQmxvY2soKTogdm9pZCB7fVxuXG4gIC8vIHRvZG8gcmV0dXJuIHNlZW1zIHVudXNlZFxuICBvcGVuRWxlbWVudCh0YWc6IHN0cmluZyk6IFNpbXBsZUVsZW1lbnQge1xuICAgIGxldCBlbGVtZW50ID0gdGhpcy5fX29wZW5FbGVtZW50KHRhZyk7XG4gICAgdGhpcy5jb25zdHJ1Y3RpbmcgPSBlbGVtZW50O1xuXG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICBfX29wZW5FbGVtZW50KHRhZzogc3RyaW5nKTogU2ltcGxlRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuZG9tLmNyZWF0ZUVsZW1lbnQodGFnLCB0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgZmx1c2hFbGVtZW50KG1vZGlmaWVyczogT3B0aW9uPFtNb2RpZmllck1hbmFnZXIsIHVua25vd25dW10+KSB7XG4gICAgbGV0IHBhcmVudCA9IHRoaXMuZWxlbWVudDtcbiAgICBsZXQgZWxlbWVudCA9IGV4cGVjdChcbiAgICAgIHRoaXMuY29uc3RydWN0aW5nLFxuICAgICAgYGZsdXNoRWxlbWVudCBzaG91bGQgb25seSBiZSBjYWxsZWQgd2hlbiBjb25zdHJ1Y3RpbmcgYW4gZWxlbWVudGBcbiAgICApO1xuXG4gICAgdGhpcy5fX2ZsdXNoRWxlbWVudChwYXJlbnQsIGVsZW1lbnQpO1xuXG4gICAgdGhpcy5jb25zdHJ1Y3RpbmcgPSBudWxsO1xuICAgIHRoaXMub3BlcmF0aW9ucyA9IG51bGw7XG5cbiAgICB0aGlzLnB1c2hNb2RpZmllcnMobW9kaWZpZXJzKTtcbiAgICB0aGlzLnB1c2hFbGVtZW50KGVsZW1lbnQsIG51bGwpO1xuICAgIHRoaXMuZGlkT3BlbkVsZW1lbnQoZWxlbWVudCk7XG4gIH1cblxuICBfX2ZsdXNoRWxlbWVudChwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsIGNvbnN0cnVjdGluZzogU2ltcGxlRWxlbWVudCkge1xuICAgIHRoaXMuZG9tLmluc2VydEJlZm9yZShwYXJlbnQsIGNvbnN0cnVjdGluZywgdGhpcy5uZXh0U2libGluZyk7XG4gIH1cblxuICBjbG9zZUVsZW1lbnQoKTogT3B0aW9uPFtNb2RpZmllck1hbmFnZXIsIHVua25vd25dW10+IHtcbiAgICB0aGlzLndpbGxDbG9zZUVsZW1lbnQoKTtcbiAgICB0aGlzLnBvcEVsZW1lbnQoKTtcbiAgICByZXR1cm4gdGhpcy5wb3BNb2RpZmllcnMoKTtcbiAgfVxuXG4gIHB1c2hSZW1vdGVFbGVtZW50KFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgZ3VpZDogc3RyaW5nLFxuICAgIGluc2VydEJlZm9yZTogTWF5YmU8U2ltcGxlTm9kZT5cbiAgKTogT3B0aW9uPFJlbW90ZUxpdmVCbG9jaz4ge1xuICAgIHJldHVybiB0aGlzLl9fcHVzaFJlbW90ZUVsZW1lbnQoZWxlbWVudCwgZ3VpZCwgaW5zZXJ0QmVmb3JlKTtcbiAgfVxuXG4gIF9fcHVzaFJlbW90ZUVsZW1lbnQoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBfZ3VpZDogc3RyaW5nLFxuICAgIGluc2VydEJlZm9yZTogTWF5YmU8U2ltcGxlTm9kZT5cbiAgKTogT3B0aW9uPFJlbW90ZUxpdmVCbG9jaz4ge1xuICAgIHRoaXMucHVzaEVsZW1lbnQoZWxlbWVudCwgaW5zZXJ0QmVmb3JlKTtcblxuICAgIGlmIChpbnNlcnRCZWZvcmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgd2hpbGUgKGVsZW1lbnQubGFzdENoaWxkKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudC5sYXN0Q2hpbGQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBibG9jayA9IG5ldyBSZW1vdGVMaXZlQmxvY2soZWxlbWVudCk7XG5cbiAgICByZXR1cm4gdGhpcy5wdXNoTGl2ZUJsb2NrKGJsb2NrLCB0cnVlKTtcbiAgfVxuXG4gIHBvcFJlbW90ZUVsZW1lbnQoKSB7XG4gICAgdGhpcy5wb3BCbG9jaygpO1xuICAgIHRoaXMucG9wRWxlbWVudCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHB1c2hFbGVtZW50KGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsIG5leHRTaWJsaW5nOiBNYXliZTxTaW1wbGVOb2RlPiA9IG51bGwpIHtcbiAgICB0aGlzW0NVUlNPUl9TVEFDS10ucHVzaChuZXcgQ3Vyc29ySW1wbChlbGVtZW50LCBuZXh0U2libGluZykpO1xuICB9XG5cbiAgcHJpdmF0ZSBwdXNoTW9kaWZpZXJzKG1vZGlmaWVyczogT3B0aW9uPFtNb2RpZmllck1hbmFnZXIsIHVua25vd25dW10+KTogdm9pZCB7XG4gICAgdGhpcy5tb2RpZmllclN0YWNrLnB1c2gobW9kaWZpZXJzKTtcbiAgfVxuXG4gIHByaXZhdGUgcG9wTW9kaWZpZXJzKCk6IE9wdGlvbjxbTW9kaWZpZXJNYW5hZ2VyLCB1bmtub3duXVtdPiB7XG4gICAgcmV0dXJuIHRoaXMubW9kaWZpZXJTdGFjay5wb3AoKTtcbiAgfVxuXG4gIGRpZEFwcGVuZEJvdW5kcyhib3VuZHM6IEJvdW5kcyk6IEJvdW5kcyB7XG4gICAgdGhpcy5ibG9jaygpLmRpZEFwcGVuZEJvdW5kcyhib3VuZHMpO1xuICAgIHJldHVybiBib3VuZHM7XG4gIH1cblxuICBkaWRBcHBlbmROb2RlPFQgZXh0ZW5kcyBTaW1wbGVOb2RlPihub2RlOiBUKTogVCB7XG4gICAgdGhpcy5ibG9jaygpLmRpZEFwcGVuZE5vZGUobm9kZSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBkaWRPcGVuRWxlbWVudChlbGVtZW50OiBTaW1wbGVFbGVtZW50KTogU2ltcGxlRWxlbWVudCB7XG4gICAgdGhpcy5ibG9jaygpLm9wZW5FbGVtZW50KGVsZW1lbnQpO1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgd2lsbENsb3NlRWxlbWVudCgpIHtcbiAgICB0aGlzLmJsb2NrKCkuY2xvc2VFbGVtZW50KCk7XG4gIH1cblxuICBhcHBlbmRUZXh0KHN0cmluZzogc3RyaW5nKTogU2ltcGxlVGV4dCB7XG4gICAgcmV0dXJuIHRoaXMuZGlkQXBwZW5kTm9kZSh0aGlzLl9fYXBwZW5kVGV4dChzdHJpbmcpKTtcbiAgfVxuXG4gIF9fYXBwZW5kVGV4dCh0ZXh0OiBzdHJpbmcpOiBTaW1wbGVUZXh0IHtcbiAgICBsZXQgeyBkb20sIGVsZW1lbnQsIG5leHRTaWJsaW5nIH0gPSB0aGlzO1xuICAgIGxldCBub2RlID0gZG9tLmNyZWF0ZVRleHROb2RlKHRleHQpO1xuICAgIGRvbS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgbm9kZSwgbmV4dFNpYmxpbmcpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgX19hcHBlbmROb2RlKG5vZGU6IFNpbXBsZU5vZGUpOiBTaW1wbGVOb2RlIHtcbiAgICB0aGlzLmRvbS5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBub2RlLCB0aGlzLm5leHRTaWJsaW5nKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIF9fYXBwZW5kRnJhZ21lbnQoZnJhZ21lbnQ6IFNpbXBsZURvY3VtZW50RnJhZ21lbnQpOiBCb3VuZHMge1xuICAgIGxldCBmaXJzdCA9IGZyYWdtZW50LmZpcnN0Q2hpbGQ7XG5cbiAgICBpZiAoZmlyc3QpIHtcbiAgICAgIGxldCByZXQgPSBuZXcgQ29uY3JldGVCb3VuZHModGhpcy5lbGVtZW50LCBmaXJzdCwgZnJhZ21lbnQubGFzdENoaWxkISk7XG4gICAgICB0aGlzLmRvbS5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBmcmFnbWVudCwgdGhpcy5uZXh0U2libGluZyk7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFNpbmdsZU5vZGVCb3VuZHModGhpcy5lbGVtZW50LCB0aGlzLl9fYXBwZW5kQ29tbWVudCgnJykpO1xuICAgIH1cbiAgfVxuXG4gIF9fYXBwZW5kSFRNTChodG1sOiBzdHJpbmcpOiBCb3VuZHMge1xuICAgIHJldHVybiB0aGlzLmRvbS5pbnNlcnRIVE1MQmVmb3JlKHRoaXMuZWxlbWVudCwgdGhpcy5uZXh0U2libGluZywgaHRtbCk7XG4gIH1cblxuICBhcHBlbmREeW5hbWljSFRNTCh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGJvdW5kcyA9IHRoaXMudHJ1c3RlZENvbnRlbnQodmFsdWUpO1xuICAgIHRoaXMuZGlkQXBwZW5kQm91bmRzKGJvdW5kcyk7XG4gIH1cblxuICBhcHBlbmREeW5hbWljVGV4dCh2YWx1ZTogc3RyaW5nKTogU2ltcGxlVGV4dCB7XG4gICAgbGV0IG5vZGUgPSB0aGlzLnVudHJ1c3RlZENvbnRlbnQodmFsdWUpO1xuICAgIHRoaXMuZGlkQXBwZW5kTm9kZShub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGFwcGVuZER5bmFtaWNGcmFnbWVudCh2YWx1ZTogU2ltcGxlRG9jdW1lbnRGcmFnbWVudCk6IHZvaWQge1xuICAgIGxldCBib3VuZHMgPSB0aGlzLl9fYXBwZW5kRnJhZ21lbnQodmFsdWUpO1xuICAgIHRoaXMuZGlkQXBwZW5kQm91bmRzKGJvdW5kcyk7XG4gIH1cblxuICBhcHBlbmREeW5hbWljTm9kZSh2YWx1ZTogU2ltcGxlTm9kZSk6IHZvaWQge1xuICAgIGxldCBub2RlID0gdGhpcy5fX2FwcGVuZE5vZGUodmFsdWUpO1xuICAgIGxldCBib3VuZHMgPSBuZXcgU2luZ2xlTm9kZUJvdW5kcyh0aGlzLmVsZW1lbnQsIG5vZGUpO1xuICAgIHRoaXMuZGlkQXBwZW5kQm91bmRzKGJvdW5kcyk7XG4gIH1cblxuICBwcml2YXRlIHRydXN0ZWRDb250ZW50KHZhbHVlOiBzdHJpbmcpOiBCb3VuZHMge1xuICAgIHJldHVybiB0aGlzLl9fYXBwZW5kSFRNTCh2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIHVudHJ1c3RlZENvbnRlbnQodmFsdWU6IHN0cmluZyk6IFNpbXBsZVRleHQge1xuICAgIHJldHVybiB0aGlzLl9fYXBwZW5kVGV4dCh2YWx1ZSk7XG4gIH1cblxuICBhcHBlbmRDb21tZW50KHN0cmluZzogc3RyaW5nKTogU2ltcGxlQ29tbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuZGlkQXBwZW5kTm9kZSh0aGlzLl9fYXBwZW5kQ29tbWVudChzdHJpbmcpKTtcbiAgfVxuXG4gIF9fYXBwZW5kQ29tbWVudChzdHJpbmc6IHN0cmluZyk6IFNpbXBsZUNvbW1lbnQge1xuICAgIGxldCB7IGRvbSwgZWxlbWVudCwgbmV4dFNpYmxpbmcgfSA9IHRoaXM7XG4gICAgbGV0IG5vZGUgPSBkb20uY3JlYXRlQ29tbWVudChzdHJpbmcpO1xuICAgIGRvbS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgbm9kZSwgbmV4dFNpYmxpbmcpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgX19zZXRBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPik6IHZvaWQge1xuICAgIHRoaXMuZG9tLnNldEF0dHJpYnV0ZSh0aGlzLmNvbnN0cnVjdGluZyEsIG5hbWUsIHZhbHVlLCBuYW1lc3BhY2UpO1xuICB9XG5cbiAgX19zZXRQcm9wZXJ0eShuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgKHRoaXMuY29uc3RydWN0aW5nISBhcyBEaWN0KVtuYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgc2V0U3RhdGljQXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT4pOiB2b2lkIHtcbiAgICB0aGlzLl9fc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlLCBuYW1lc3BhY2UpO1xuICB9XG5cbiAgc2V0RHluYW1pY0F0dHJpYnV0ZShcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdmFsdWU6IHVua25vd24sXG4gICAgdHJ1c3Rpbmc6IGJvb2xlYW4sXG4gICAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT5cbiAgKTogRHluYW1pY0F0dHJpYnV0ZSB7XG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmNvbnN0cnVjdGluZyE7XG4gICAgbGV0IGF0dHJpYnV0ZSA9IHRoaXMuZW52LmF0dHJpYnV0ZUZvcihlbGVtZW50LCBuYW1lLCB0cnVzdGluZywgbmFtZXNwYWNlKTtcbiAgICBhdHRyaWJ1dGUuc2V0KHRoaXMsIHZhbHVlLCB0aGlzLmVudik7XG4gICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2ltcGxlTGl2ZUJsb2NrIGltcGxlbWVudHMgTGl2ZUJsb2NrIHtcbiAgcHJvdGVjdGVkIGZpcnN0OiBPcHRpb248Rmlyc3ROb2RlPiA9IG51bGw7XG4gIHByb3RlY3RlZCBsYXN0OiBPcHRpb248TGFzdE5vZGU+ID0gbnVsbDtcbiAgcHJvdGVjdGVkIGRlc3Ryb3lhYmxlczogT3B0aW9uPFN5bWJvbERlc3Ryb3lhYmxlW10+ID0gbnVsbDtcbiAgcHJvdGVjdGVkIG5lc3RpbmcgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFyZW50OiBTaW1wbGVFbGVtZW50KSB7fVxuXG4gIHBhcmVudEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50O1xuICB9XG5cbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIGxldCBmaXJzdCA9IGV4cGVjdChcbiAgICAgIHRoaXMuZmlyc3QsXG4gICAgICAnY2Fubm90IGNhbGwgYGZpcnN0Tm9kZSgpYCB3aGlsZSBgU2ltcGxlTGl2ZUJsb2NrYCBpcyBzdGlsbCBpbml0aWFsaXppbmcnXG4gICAgKTtcblxuICAgIHJldHVybiBmaXJzdC5maXJzdE5vZGUoKTtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIGxldCBsYXN0ID0gZXhwZWN0KFxuICAgICAgdGhpcy5sYXN0LFxuICAgICAgJ2Nhbm5vdCBjYWxsIGBsYXN0Tm9kZSgpYCB3aGlsZSBgU2ltcGxlTGl2ZUJsb2NrYCBpcyBzdGlsbCBpbml0aWFsaXppbmcnXG4gICAgKTtcblxuICAgIHJldHVybiBsYXN0Lmxhc3ROb2RlKCk7XG4gIH1cblxuICBvcGVuRWxlbWVudChlbGVtZW50OiBTaW1wbGVFbGVtZW50KSB7XG4gICAgdGhpcy5kaWRBcHBlbmROb2RlKGVsZW1lbnQpO1xuICAgIHRoaXMubmVzdGluZysrO1xuICB9XG5cbiAgY2xvc2VFbGVtZW50KCkge1xuICAgIHRoaXMubmVzdGluZy0tO1xuICB9XG5cbiAgZGlkQXBwZW5kTm9kZShub2RlOiBTaW1wbGVOb2RlKSB7XG4gICAgaWYgKHRoaXMubmVzdGluZyAhPT0gMCkgcmV0dXJuO1xuXG4gICAgaWYgKCF0aGlzLmZpcnN0KSB7XG4gICAgICB0aGlzLmZpcnN0ID0gbmV3IEZpcnN0KG5vZGUpO1xuICAgIH1cblxuICAgIHRoaXMubGFzdCA9IG5ldyBMYXN0KG5vZGUpO1xuICB9XG5cbiAgZGlkQXBwZW5kQm91bmRzKGJvdW5kczogQm91bmRzKSB7XG4gICAgaWYgKHRoaXMubmVzdGluZyAhPT0gMCkgcmV0dXJuO1xuXG4gICAgaWYgKCF0aGlzLmZpcnN0KSB7XG4gICAgICB0aGlzLmZpcnN0ID0gYm91bmRzO1xuICAgIH1cblxuICAgIHRoaXMubGFzdCA9IGJvdW5kcztcbiAgfVxuXG4gIGZpbmFsaXplKHN0YWNrOiBFbGVtZW50QnVpbGRlcikge1xuICAgIGlmICh0aGlzLmZpcnN0ID09PSBudWxsKSB7XG4gICAgICBzdGFjay5hcHBlbmRDb21tZW50KCcnKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW90ZUxpdmVCbG9jayBleHRlbmRzIFNpbXBsZUxpdmVCbG9jayBpbXBsZW1lbnRzIFN5bWJvbERlc3Ryb3lhYmxlIHtcbiAgW0RFU1RST1ldKCkge1xuICAgIGNsZWFyKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGFibGVCbG9ja0ltcGwgZXh0ZW5kcyBTaW1wbGVMaXZlQmxvY2sgaW1wbGVtZW50cyBVcGRhdGFibGVCbG9jayB7XG4gIHJlc2V0KGVudjogRW52aXJvbm1lbnQpOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICAgIGxldCBuZXh0U2libGluZyA9IGRldGFjaENoaWxkcmVuKHRoaXMsIGVudik7XG5cbiAgICAvLyBsZXQgbmV4dFNpYmxpbmcgPSBjbGVhcih0aGlzKTtcblxuICAgIHRoaXMuZmlyc3QgPSBudWxsO1xuICAgIHRoaXMubGFzdCA9IG51bGw7XG4gICAgdGhpcy5kZXN0cm95YWJsZXMgPSBudWxsO1xuICAgIHRoaXMubmVzdGluZyA9IDA7XG5cbiAgICByZXR1cm4gbmV4dFNpYmxpbmc7XG4gIH1cbn1cblxuLy8gRklYTUU6IEFsbCB0aGUgbm9vcHMgaW4gaGVyZSBpbmRpY2F0ZSBhIG1vZGVsbGluZyBwcm9ibGVtXG5jbGFzcyBMaXZlQmxvY2tMaXN0IGltcGxlbWVudHMgTGl2ZUJsb2NrIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgcHJpdmF0ZSByZWFkb25seSBib3VuZExpc3Q6IExpbmtlZExpc3Q8TGlua2VkTGlzdE5vZGUgJiBMaXZlQmxvY2s+XG4gICkge1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuYm91bmRMaXN0ID0gYm91bmRMaXN0O1xuICB9XG5cbiAgcGFyZW50RWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQ7XG4gIH1cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgbGV0IGhlYWQgPSBleHBlY3QoXG4gICAgICB0aGlzLmJvdW5kTGlzdC5oZWFkKCksXG4gICAgICAnY2Fubm90IGNhbGwgYGZpcnN0Tm9kZSgpYCB3aGlsZSBgTGl2ZUJsb2NrTGlzdGAgaXMgc3RpbGwgaW5pdGlhbGl6aW5nJ1xuICAgICk7XG5cbiAgICByZXR1cm4gaGVhZC5maXJzdE5vZGUoKTtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIGxldCB0YWlsID0gZXhwZWN0KFxuICAgICAgdGhpcy5ib3VuZExpc3QudGFpbCgpLFxuICAgICAgJ2Nhbm5vdCBjYWxsIGBsYXN0Tm9kZSgpYCB3aGlsZSBgTGl2ZUJsb2NrTGlzdGAgaXMgc3RpbGwgaW5pdGlhbGl6aW5nJ1xuICAgICk7XG5cbiAgICByZXR1cm4gdGFpbC5sYXN0Tm9kZSgpO1xuICB9XG5cbiAgb3BlbkVsZW1lbnQoX2VsZW1lbnQ6IFNpbXBsZUVsZW1lbnQpIHtcbiAgICBhc3NlcnQoZmFsc2UsICdDYW5ub3Qgb3BlbkVsZW1lbnQgZGlyZWN0bHkgaW5zaWRlIGEgYmxvY2sgbGlzdCcpO1xuICB9XG5cbiAgY2xvc2VFbGVtZW50KCkge1xuICAgIGFzc2VydChmYWxzZSwgJ0Nhbm5vdCBjbG9zZUVsZW1lbnQgZGlyZWN0bHkgaW5zaWRlIGEgYmxvY2sgbGlzdCcpO1xuICB9XG5cbiAgZGlkQXBwZW5kTm9kZShfbm9kZTogU2ltcGxlTm9kZSkge1xuICAgIGFzc2VydChmYWxzZSwgJ0Nhbm5vdCBjcmVhdGUgYSBuZXcgbm9kZSBkaXJlY3RseSBpbnNpZGUgYSBibG9jayBsaXN0Jyk7XG4gIH1cblxuICBkaWRBcHBlbmRCb3VuZHMoX2JvdW5kczogQm91bmRzKSB7fVxuXG4gIGZpbmFsaXplKF9zdGFjazogRWxlbWVudEJ1aWxkZXIpIHtcbiAgICBhc3NlcnQodGhpcy5ib3VuZExpc3QuaGVhZCgpICE9PSBudWxsLCAnYm91bmRzTGlzdCBjYW5ub3QgYmUgZW1wdHknKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xpZW50QnVpbGRlcihlbnY6IEVudmlyb25tZW50LCBjdXJzb3I6IEN1cnNvckltcGwpOiBFbGVtZW50QnVpbGRlciB7XG4gIHJldHVybiBOZXdFbGVtZW50QnVpbGRlci5mb3JJbml0aWFsUmVuZGVyKGVudiwgY3Vyc29yKTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=