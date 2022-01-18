define('@glimmer/runtime', ['exports', '@glimmer/util', '@glimmer/reference', '@glimmer/program', '@glimmer/vm', '@glimmer/low-level'], function (exports, util, reference, program, vm, lowLevel) { 'use strict';

    // These symbols represent "friend" properties that are used inside of
    // the VM in other classes, but are not intended to be a part of
    // Glimmer's API.
    var INNER_VM = 'INNER_VM [dca1b7fe-b48e-462e-b775-08fd7a31017e]';
    var DESTRUCTOR_STACK = 'DESTRUCTOR_STACK [e42a81ff-9d89-4d65-9ad9-be4c9590fdad]';
    var STACKS = 'STACKS [70876a06-8897-4609-a396-e9b0ceac967b]';
    var REGISTERS = 'REGISTERS [435c3390-2d57-430f-954a-1bf98d880ce0]';
    var HEAP = 'HEAP [06377b5b-f0b2-4933-913a-da577a047a0a]';
    var CONSTANTS = 'CONSTANTS [340fd695-d3f5-4492-91db-7f923ae95d8e]';
    var ARGS = 'ARGS [5cd2e5b3-8a3b-4c2f-ac4f-96e360253d6f]';

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var CursorImpl = function CursorImpl(element, nextSibling) {
        _classCallCheck(this, CursorImpl);

        this.element = element;
        this.nextSibling = nextSibling;
    };
    var ConcreteBounds = function () {
        function ConcreteBounds(parentNode, first, last) {
            _classCallCheck(this, ConcreteBounds);

            this.parentNode = parentNode;
            this.first = first;
            this.last = last;
        }

        ConcreteBounds.prototype.parentElement = function parentElement() {
            return this.parentNode;
        };

        ConcreteBounds.prototype.firstNode = function firstNode() {
            return this.first;
        };

        ConcreteBounds.prototype.lastNode = function lastNode() {
            return this.last;
        };

        return ConcreteBounds;
    }();
    var SingleNodeBounds = function () {
        function SingleNodeBounds(parentNode, node) {
            _classCallCheck(this, SingleNodeBounds);

            this.parentNode = parentNode;
            this.node = node;
        }

        SingleNodeBounds.prototype.parentElement = function parentElement() {
            return this.parentNode;
        };

        SingleNodeBounds.prototype.firstNode = function firstNode() {
            return this.node;
        };

        SingleNodeBounds.prototype.lastNode = function lastNode() {
            return this.node;
        };

        return SingleNodeBounds;
    }();
    function move(bounds, reference$$1) {
        var parent = bounds.parentElement();
        var first = bounds.firstNode();
        var last = bounds.lastNode();
        var current = first;
        while (true) {
            var next = current.nextSibling;
            parent.insertBefore(current, reference$$1);
            if (current === last) {
                return next;
            }
            current = next;
        }
    }
    function clear(bounds) {
        var parent = bounds.parentElement();
        var first = bounds.firstNode();
        var last = bounds.lastNode();
        var current = first;
        while (true) {
            var next = current.nextSibling;
            parent.removeChild(current);
            if (current === last) {
                return next;
            }
            current = next;
        }
    }

    function asyncReset(parent, env) {
        var linked = util.takeAssociated(parent);
        if (linked) {
            env.didDestroy(util.snapshot(linked));
        }
    }
    function asyncDestroy(parent, env) {
        env.didDestroy(util.destructor(parent));
    }
    function detach(parent, env) {
        clear(parent);
        asyncDestroy(parent, env);
    }
    function detachChildren(parent, env) {
        asyncReset(parent, env);
        return clear(parent);
    }

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

    function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var _a;

    var First = function () {
        function First(node) {
            _classCallCheck$1(this, First);

            this.node = node;
        }

        First.prototype.firstNode = function firstNode() {
            return this.node;
        };

        return First;
    }();

    var Last = function () {
        function Last(node) {
            _classCallCheck$1(this, Last);

            this.node = node;
        }

        Last.prototype.lastNode = function lastNode() {
            return this.node;
        };

        return Last;
    }();
    var CURSOR_STACK = 'CURSOR_STACK [31ea0d2f-7c22-4814-9db7-28e4469b54e6]';
    var NewElementBuilder = function () {
        function NewElementBuilder(env, parentNode, nextSibling) {
            _classCallCheck$1(this, NewElementBuilder);

            this.constructing = null;
            this.operations = null;
            this[_a] = new util.Stack();
            this.modifierStack = new util.Stack();
            this.blockStack = new util.Stack();
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
    var SimpleLiveBlock = function () {
        function SimpleLiveBlock(parent) {
            _classCallCheck$1(this, SimpleLiveBlock);

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
    var RemoteLiveBlock = function (_SimpleLiveBlock) {
        _inherits(RemoteLiveBlock, _SimpleLiveBlock);

        function RemoteLiveBlock() {
            _classCallCheck$1(this, RemoteLiveBlock);

            return _possibleConstructorReturn(this, _SimpleLiveBlock.apply(this, arguments));
        }

        RemoteLiveBlock.prototype[util.DESTROY] = function () {
            clear(this);
        };

        return RemoteLiveBlock;
    }(SimpleLiveBlock);
    var UpdatableBlockImpl = function (_SimpleLiveBlock2) {
        _inherits(UpdatableBlockImpl, _SimpleLiveBlock2);

        function UpdatableBlockImpl() {
            _classCallCheck$1(this, UpdatableBlockImpl);

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
            _classCallCheck$1(this, LiveBlockList);

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
        };

        LiveBlockList.prototype.closeElement = function closeElement() {
        };

        LiveBlockList.prototype.didAppendNode = function didAppendNode(_node) {
        };

        LiveBlockList.prototype.didAppendBounds = function didAppendBounds(_bounds) {};

        LiveBlockList.prototype.finalize = function finalize(_stack) {
        };

        return LiveBlockList;
    }();

    function clientBuilder(env, cursor) {
        return NewElementBuilder.forInitialRender(env, cursor);
    }

    function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    // http://www.w3.org/TR/html/syntax.html#html-integration-point
    var SVG_INTEGRATION_POINTS = { foreignObject: 1, desc: 1, title: 1 };
    // http://www.w3.org/TR/html/syntax.html#adjust-svg-attributes
    // TODO: Adjust SVG attributes
    // http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
    // TODO: Adjust SVG elements
    // http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
    var BLACKLIST_TABLE = Object.create(null);
    var DOMOperations = function () {
        function DOMOperations(document) {
            _classCallCheck$2(this, DOMOperations);

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

        DOMOperations.prototype.insertBefore = function insertBefore(parent, node, reference$$1) {
            parent.insertBefore(node, reference$$1);
        };

        DOMOperations.prototype.insertHTMLBefore = function insertHTMLBefore(parent, nextSibling, html) {
            if (html === '') {
                var comment = this.createComment('');
                parent.insertBefore(comment, nextSibling);
                return new ConcreteBounds(parent, comment, comment);
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
            return new ConcreteBounds(parent, first, last);
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
        return new ConcreteBounds(target, first, last);
    }

    function _defaults$1(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$1(subClass, superClass); }
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg" /* SVG */;
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
        var div = document.createElement('div');
        return function (_DOMClass) {
            _inherits$1(DOMChangesWithSVGInnerHTMLFix, _DOMClass);

            function DOMChangesWithSVGInnerHTMLFix() {
                _classCallCheck$3(this, DOMChangesWithSVGInnerHTMLFix);

                return _possibleConstructorReturn$1(this, _DOMClass.apply(this, arguments));
            }

            DOMChangesWithSVGInnerHTMLFix.prototype.insertHTMLBefore = function insertHTMLBefore(parent, nextSibling, html) {
                if (html === '') {
                    return _DOMClass.prototype.insertHTMLBefore.call(this, parent, nextSibling, html);
                }
                if (parent.namespaceURI !== svgNamespace) {
                    return _DOMClass.prototype.insertHTMLBefore.call(this, parent, nextSibling, html);
                }
                return fixSVG(parent, div, html, nextSibling);
            };

            return DOMChangesWithSVGInnerHTMLFix;
        }(DOMClass);
    }
    function fixSVG(parent, div, html, reference$$1) {

        var source = void 0;
        // This is important, because decendants of the <foreignObject> integration
        // point are parsed in the HTML namespace
        if (parent.tagName.toUpperCase() === 'FOREIGNOBJECT') {
            // IE, Edge: also do not correctly support using `innerHTML` on SVG
            // namespaced elements. So here a wrapper is used.
            var wrappedHtml = '<svg><foreignObject>' + html + '</foreignObject></svg>';
            util.clearElement(div);
            div.insertAdjacentHTML("afterbegin" /* afterbegin */, wrappedHtml);
            source = div.firstChild.firstChild;
        } else {
            // IE, Edge: also do not correctly support using `innerHTML` on SVG
            // namespaced elements. So here a wrapper is used.
            var _wrappedHtml = '<svg>' + html + '</svg>';
            util.clearElement(div);
            div.insertAdjacentHTML("afterbegin" /* afterbegin */, _wrappedHtml);
            source = div.firstChild;
        }
        return moveNodesBefore(source, parent, reference$$1);
    }
    function shouldApplyFix(document, svgNamespace) {
        var svg = document.createElementNS(svgNamespace, 'svg');
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

    function _defaults$2(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$2(subClass, superClass); }

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
        if (!shouldApplyFix$1(document)) {
            return DOMClass;
        }
        return function (_DOMClass) {
            _inherits$2(DOMChangesWithTextNodeMergingFix, _DOMClass);

            function DOMChangesWithTextNodeMergingFix(document) {
                _classCallCheck$4(this, DOMChangesWithTextNodeMergingFix);

                var _this = _possibleConstructorReturn$2(this, _DOMClass.call(this, document));

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
    function shouldApplyFix$1(document) {
        var mergingTextDiv = document.createElement('div');
        mergingTextDiv.appendChild(document.createTextNode('first'));
        mergingTextDiv.insertAdjacentHTML("beforeend" /* beforeend */, 'second');
        if (mergingTextDiv.childNodes.length === 2) {
            // It worked as expected, no fix required
            return false;
        }
        return true;
    }

    function _defaults$3(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$3(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$3(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$3(subClass, superClass); }
    ['b', 'big', 'blockquote', 'body', 'br', 'center', 'code', 'dd', 'div', 'dl', 'dt', 'em', 'embed', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'i', 'img', 'li', 'listing', 'main', 'meta', 'nobr', 'ol', 'p', 'pre', 'ruby', 's', 'small', 'span', 'strong', 'strike', 'sub', 'sup', 'table', 'tt', 'u', 'ul', 'var'].forEach(function (tag) {
        return BLACKLIST_TABLE[tag] = 1;
    });
    var WHITESPACE = /[\t-\r \xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/;
    var doc = typeof document === 'undefined' ? null : document;
    function isWhitespace(string) {
        return WHITESPACE.test(string);
    }
    var DOM;
    (function (DOM) {
        var TreeConstruction = function (_DOMOperations) {
            _inherits$3(TreeConstruction, _DOMOperations);

            function TreeConstruction() {
                _classCallCheck$5(this, TreeConstruction);

                return _possibleConstructorReturn$3(this, _DOMOperations.apply(this, arguments));
            }

            TreeConstruction.prototype.createElementNS = function createElementNS(namespace, tag) {
                return this.document.createElementNS(namespace, tag);
            };

            TreeConstruction.prototype.setAttribute = function setAttribute(element, name, value) {
                var namespace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

                if (namespace) {
                    element.setAttributeNS(namespace, name, value);
                } else {
                    element.setAttribute(name, value);
                }
            };

            return TreeConstruction;
        }(DOMOperations);

        DOM.TreeConstruction = TreeConstruction;
        var appliedTreeContruction = TreeConstruction;
        appliedTreeContruction = applyTextNodeMergingFix(doc, appliedTreeContruction);
        appliedTreeContruction = applySVGInnerHTMLFix(doc, appliedTreeContruction, "http://www.w3.org/2000/svg" /* SVG */);
        DOM.DOMTreeConstruction = appliedTreeContruction;
    })(DOM || (DOM = {}));
    var DOMChangesImpl = function (_DOMOperations2) {
        _inherits$3(DOMChangesImpl, _DOMOperations2);

        function DOMChangesImpl(document) {
            _classCallCheck$5(this, DOMChangesImpl);

            var _this2 = _possibleConstructorReturn$3(this, _DOMOperations2.call(this, document));

            _this2.document = document;
            _this2.namespace = null;
            return _this2;
        }

        DOMChangesImpl.prototype.setAttribute = function setAttribute(element, name, value) {
            element.setAttribute(name, value);
        };

        DOMChangesImpl.prototype.removeAttribute = function removeAttribute(element, name) {
            element.removeAttribute(name);
        };

        DOMChangesImpl.prototype.insertAfter = function insertAfter(element, node, reference$$1) {
            this.insertBefore(element, node, reference$$1.nextSibling);
        };

        return DOMChangesImpl;
    }(DOMOperations);
    var helper = DOMChangesImpl;
    helper = applyTextNodeMergingFix(doc, helper);
    helper = applySVGInnerHTMLFix(doc, helper, "http://www.w3.org/2000/svg" /* SVG */);
    var helper$1 = helper;
    var DOMTreeConstruction = DOM.DOMTreeConstruction;

    function _defaults$4(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$4(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$4(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$4(subClass, superClass); }
    var PrimitiveReference = function (_ConstReference) {
        _inherits$4(PrimitiveReference, _ConstReference);

        function PrimitiveReference(value) {
            _classCallCheck$6(this, PrimitiveReference);

            return _possibleConstructorReturn$4(this, _ConstReference.call(this, value));
        }

        PrimitiveReference.create = function create(value) {
            if (value === undefined) {
                return UNDEFINED_REFERENCE;
            } else if (value === null) {
                return NULL_REFERENCE;
            } else if (value === true) {
                return TRUE_REFERENCE;
            } else if (value === false) {
                return FALSE_REFERENCE;
            } else if (typeof value === 'number') {
                return new ValueReference(value);
            } else {
                return new StringReference(value);
            }
        };

        PrimitiveReference.prototype.get = function get(_key) {
            return UNDEFINED_REFERENCE;
        };

        return PrimitiveReference;
    }(reference.ConstReference);

    var StringReference = function (_PrimitiveReference) {
        _inherits$4(StringReference, _PrimitiveReference);

        function StringReference() {
            _classCallCheck$6(this, StringReference);

            var _this2 = _possibleConstructorReturn$4(this, _PrimitiveReference.apply(this, arguments));

            _this2.lengthReference = null;
            return _this2;
        }

        StringReference.prototype.get = function get(key) {
            if (key === 'length') {
                var lengthReference = this.lengthReference;

                if (lengthReference === null) {
                    lengthReference = this.lengthReference = new ValueReference(this.inner.length);
                }
                return lengthReference;
            } else {
                return _PrimitiveReference.prototype.get.call(this, key);
            }
        };

        return StringReference;
    }(PrimitiveReference);

    var ValueReference = function (_PrimitiveReference2) {
        _inherits$4(ValueReference, _PrimitiveReference2);

        function ValueReference(value) {
            _classCallCheck$6(this, ValueReference);

            return _possibleConstructorReturn$4(this, _PrimitiveReference2.call(this, value));
        }

        return ValueReference;
    }(PrimitiveReference);

    var UNDEFINED_REFERENCE = new ValueReference(undefined);
    var NULL_REFERENCE = new ValueReference(null);
    var TRUE_REFERENCE = new ValueReference(true);
    var FALSE_REFERENCE = new ValueReference(false);
    var ConditionalReference = function () {
        function ConditionalReference(inner) {
            var toBool = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultToBool;

            _classCallCheck$6(this, ConditionalReference);

            this.inner = inner;
            this.toBool = toBool;
            this.tag = inner.tag;
        }

        ConditionalReference.prototype.value = function value() {
            return this.toBool(this.inner.value());
        };

        return ConditionalReference;
    }();
    function defaultToBool(value) {
        return !!value;
    }

    function normalizeStringValue(value) {
        if (isEmpty(value)) {
            return '';
        }
        return String(value);
    }
    function shouldCoerce(value) {
        return isString(value) || isEmpty(value) || typeof value === 'boolean' || typeof value === 'number';
    }
    function isEmpty(value) {
        return value === null || value === undefined || typeof value.toString !== 'function';
    }
    function isSafeString(value) {
        return typeof value === 'object' && value !== null && typeof value.toHTML === 'function';
    }
    function isNode(value) {
        return typeof value === 'object' && value !== null && typeof value.nodeType === 'number';
    }
    function isFragment(value) {
        return isNode(value) && value.nodeType === 11;
    }
    function isString(value) {
        return typeof value === 'string';
    }

    /*
     * @method normalizeProperty
     * @param element {HTMLElement}
     * @param slotName {String}
     * @returns {Object} { name, type }
     */
    function normalizeProperty(element, slotName) {
        var type = void 0,
            normalized = void 0;
        if (slotName in element) {
            normalized = slotName;
            type = 'prop';
        } else {
            var lower = slotName.toLowerCase();
            if (lower in element) {
                type = 'prop';
                normalized = lower;
            } else {
                type = 'attr';
                normalized = slotName;
            }
        }
        if (type === 'prop' && (normalized.toLowerCase() === 'style' || preferAttr(element.tagName, normalized))) {
            type = 'attr';
        }
        return { normalized: normalized, type: type };
    }
    // properties that MUST be set as attributes, due to:
    // * browser bug
    // * strange spec outlier
    var ATTR_OVERRIDES = {
        INPUT: {
            form: true,
            // Chrome 46.0.2464.0: 'autocorrect' in document.createElement('input') === false
            // Safari 8.0.7: 'autocorrect' in document.createElement('input') === false
            // Mobile Safari (iOS 8.4 simulator): 'autocorrect' in document.createElement('input') === true
            autocorrect: true,
            // Chrome 54.0.2840.98: 'list' in document.createElement('input') === true
            // Safari 9.1.3: 'list' in document.createElement('input') === false
            list: true
        },
        // element.form is actually a legitimate readOnly property, that is to be
        // mutated, but must be mutated by setAttribute...
        SELECT: { form: true },
        OPTION: { form: true },
        TEXTAREA: { form: true },
        LABEL: { form: true },
        FIELDSET: { form: true },
        LEGEND: { form: true },
        OBJECT: { form: true },
        BUTTON: { form: true }
    };
    function preferAttr(tagName, propName) {
        var tag = ATTR_OVERRIDES[tagName.toUpperCase()];
        return tag && tag[propName.toLowerCase()] || false;
    }

    var badProtocols = ['javascript:', 'vbscript:'];
    var badTags = ['A', 'BODY', 'LINK', 'IMG', 'IFRAME', 'BASE', 'FORM'];
    var badTagsForDataURI = ['EMBED'];
    var badAttributes = ['href', 'src', 'background', 'action'];
    var badAttributesForDataURI = ['src'];
    function has(array, item) {
        return array.indexOf(item) !== -1;
    }
    function checkURI(tagName, attribute) {
        return (tagName === null || has(badTags, tagName)) && has(badAttributes, attribute);
    }
    function checkDataURI(tagName, attribute) {
        if (tagName === null) return false;
        return has(badTagsForDataURI, tagName) && has(badAttributesForDataURI, attribute);
    }
    function requiresSanitization(tagName, attribute) {
        return checkURI(tagName, attribute) || checkDataURI(tagName, attribute);
    }
    function sanitizeAttributeValue(env, element, attribute, value) {
        var tagName = null;
        if (value === null || value === undefined) {
            return value;
        }
        if (isSafeString(value)) {
            return value.toHTML();
        }
        if (!element) {
            tagName = null;
        } else {
            tagName = element.tagName.toUpperCase();
        }
        var str = normalizeStringValue(value);
        if (checkURI(tagName, attribute)) {
            var protocol = env.protocolForURL(str);
            if (has(badProtocols, protocol)) {
                return 'unsafe:' + str;
            }
        }
        if (checkDataURI(tagName, attribute)) {
            return 'unsafe:' + str;
        }
        return str;
    }

    function _defaults$5(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _possibleConstructorReturn$5(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$5(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$5(subClass, superClass); }

    function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function dynamicAttribute(element, attr, namespace) {
        var tagName = element.tagName,
            namespaceURI = element.namespaceURI;

        var attribute = { element: element, name: attr, namespace: namespace };
        if (namespaceURI === "http://www.w3.org/2000/svg" /* SVG */) {
                return buildDynamicAttribute(tagName, attr, attribute);
            }

        var _normalizeProperty = normalizeProperty(element, attr),
            type = _normalizeProperty.type,
            normalized = _normalizeProperty.normalized;

        if (type === 'attr') {
            return buildDynamicAttribute(tagName, normalized, attribute);
        } else {
            return buildDynamicProperty(tagName, normalized, attribute);
        }
    }
    function buildDynamicAttribute(tagName, name, attribute) {
        if (requiresSanitization(tagName, name)) {
            return new SafeDynamicAttribute(attribute);
        } else {
            return new SimpleDynamicAttribute(attribute);
        }
    }
    function buildDynamicProperty(tagName, name, attribute) {
        if (requiresSanitization(tagName, name)) {
            return new SafeDynamicProperty(name, attribute);
        }
        if (isUserInputValue(tagName, name)) {
            return new InputValueDynamicAttribute(name, attribute);
        }
        if (isOptionSelected(tagName, name)) {
            return new OptionSelectedDynamicAttribute(name, attribute);
        }
        return new DefaultDynamicProperty(name, attribute);
    }
    var DynamicAttribute = function DynamicAttribute(attribute) {
        _classCallCheck$7(this, DynamicAttribute);

        this.attribute = attribute;
    };
    var SimpleDynamicAttribute = function (_DynamicAttribute) {
        _inherits$5(SimpleDynamicAttribute, _DynamicAttribute);

        function SimpleDynamicAttribute() {
            _classCallCheck$7(this, SimpleDynamicAttribute);

            return _possibleConstructorReturn$5(this, _DynamicAttribute.apply(this, arguments));
        }

        SimpleDynamicAttribute.prototype.set = function set(dom, value, _env) {
            var normalizedValue = normalizeValue(value);
            if (normalizedValue !== null) {
                var _attribute = this.attribute,
                    name = _attribute.name,
                    namespace = _attribute.namespace;

                dom.__setAttribute(name, normalizedValue, namespace);
            }
        };

        SimpleDynamicAttribute.prototype.update = function update(value, _env) {
            var normalizedValue = normalizeValue(value);
            var _attribute2 = this.attribute,
                element = _attribute2.element,
                name = _attribute2.name;

            if (normalizedValue === null) {
                element.removeAttribute(name);
            } else {
                element.setAttribute(name, normalizedValue);
            }
        };

        return SimpleDynamicAttribute;
    }(DynamicAttribute);
    var DefaultDynamicProperty = function (_DynamicAttribute2) {
        _inherits$5(DefaultDynamicProperty, _DynamicAttribute2);

        function DefaultDynamicProperty(normalizedName, attribute) {
            _classCallCheck$7(this, DefaultDynamicProperty);

            var _this2 = _possibleConstructorReturn$5(this, _DynamicAttribute2.call(this, attribute));

            _this2.normalizedName = normalizedName;
            return _this2;
        }

        DefaultDynamicProperty.prototype.set = function set(dom, value, _env) {
            if (value !== null && value !== undefined) {
                this.value = value;
                dom.__setProperty(this.normalizedName, value);
            }
        };

        DefaultDynamicProperty.prototype.update = function update(value, _env) {
            var element = this.attribute.element;

            if (this.value !== value) {
                element[this.normalizedName] = this.value = value;
                if (value === null || value === undefined) {
                    this.removeAttribute();
                }
            }
        };

        DefaultDynamicProperty.prototype.removeAttribute = function removeAttribute() {
            // TODO this sucks but to preserve properties first and to meet current
            // semantics we must do this.
            var _attribute3 = this.attribute,
                element = _attribute3.element,
                namespace = _attribute3.namespace;

            if (namespace) {
                element.removeAttributeNS(namespace, this.normalizedName);
            } else {
                element.removeAttribute(this.normalizedName);
            }
        };

        return DefaultDynamicProperty;
    }(DynamicAttribute);
    var SafeDynamicProperty = function (_DefaultDynamicProper) {
        _inherits$5(SafeDynamicProperty, _DefaultDynamicProper);

        function SafeDynamicProperty() {
            _classCallCheck$7(this, SafeDynamicProperty);

            return _possibleConstructorReturn$5(this, _DefaultDynamicProper.apply(this, arguments));
        }

        SafeDynamicProperty.prototype.set = function set(dom, value, env) {
            var _attribute4 = this.attribute,
                element = _attribute4.element,
                name = _attribute4.name;

            var sanitized = sanitizeAttributeValue(env, element, name, value);
            _DefaultDynamicProper.prototype.set.call(this, dom, sanitized, env);
        };

        SafeDynamicProperty.prototype.update = function update(value, env) {
            var _attribute5 = this.attribute,
                element = _attribute5.element,
                name = _attribute5.name;

            var sanitized = sanitizeAttributeValue(env, element, name, value);
            _DefaultDynamicProper.prototype.update.call(this, sanitized, env);
        };

        return SafeDynamicProperty;
    }(DefaultDynamicProperty);
    var SafeDynamicAttribute = function (_SimpleDynamicAttribu) {
        _inherits$5(SafeDynamicAttribute, _SimpleDynamicAttribu);

        function SafeDynamicAttribute() {
            _classCallCheck$7(this, SafeDynamicAttribute);

            return _possibleConstructorReturn$5(this, _SimpleDynamicAttribu.apply(this, arguments));
        }

        SafeDynamicAttribute.prototype.set = function set(dom, value, env) {
            var _attribute6 = this.attribute,
                element = _attribute6.element,
                name = _attribute6.name;

            var sanitized = sanitizeAttributeValue(env, element, name, value);
            _SimpleDynamicAttribu.prototype.set.call(this, dom, sanitized, env);
        };

        SafeDynamicAttribute.prototype.update = function update(value, env) {
            var _attribute7 = this.attribute,
                element = _attribute7.element,
                name = _attribute7.name;

            var sanitized = sanitizeAttributeValue(env, element, name, value);
            _SimpleDynamicAttribu.prototype.update.call(this, sanitized, env);
        };

        return SafeDynamicAttribute;
    }(SimpleDynamicAttribute);
    var InputValueDynamicAttribute = function (_DefaultDynamicProper2) {
        _inherits$5(InputValueDynamicAttribute, _DefaultDynamicProper2);

        function InputValueDynamicAttribute() {
            _classCallCheck$7(this, InputValueDynamicAttribute);

            return _possibleConstructorReturn$5(this, _DefaultDynamicProper2.apply(this, arguments));
        }

        InputValueDynamicAttribute.prototype.set = function set(dom, value) {
            dom.__setProperty('value', normalizeStringValue(value));
        };

        InputValueDynamicAttribute.prototype.update = function update(value) {
            var input = this.attribute.element;
            var currentValue = input.value;
            var normalizedValue = normalizeStringValue(value);
            if (currentValue !== normalizedValue) {
                input.value = normalizedValue;
            }
        };

        return InputValueDynamicAttribute;
    }(DefaultDynamicProperty);
    var OptionSelectedDynamicAttribute = function (_DefaultDynamicProper3) {
        _inherits$5(OptionSelectedDynamicAttribute, _DefaultDynamicProper3);

        function OptionSelectedDynamicAttribute() {
            _classCallCheck$7(this, OptionSelectedDynamicAttribute);

            return _possibleConstructorReturn$5(this, _DefaultDynamicProper3.apply(this, arguments));
        }

        OptionSelectedDynamicAttribute.prototype.set = function set(dom, value) {
            if (value !== null && value !== undefined && value !== false) {
                dom.__setProperty('selected', true);
            }
        };

        OptionSelectedDynamicAttribute.prototype.update = function update(value) {
            var option = this.attribute.element;
            if (value) {
                option.selected = true;
            } else {
                option.selected = false;
            }
        };

        return OptionSelectedDynamicAttribute;
    }(DefaultDynamicProperty);
    function isOptionSelected(tagName, attribute) {
        return tagName === 'OPTION' && attribute === 'selected';
    }
    function isUserInputValue(tagName, attribute) {
        return (tagName === 'INPUT' || tagName === 'TEXTAREA') && attribute === 'value';
    }
    function normalizeValue(value) {
        if (value === false || value === undefined || value === null || typeof value.toString === 'undefined') {
            return null;
        }
        if (value === true) {
            return '';
        }
        // onclick function etc in SSR
        if (typeof value === 'function') {
            return null;
        }
        return String(value);
    }

    var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _defaults$6(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _possibleConstructorReturn$6(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$6(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$6(subClass, superClass); }

    function _classCallCheck$8(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var _a$1;
    var ScopeImpl = function () {
        function ScopeImpl(
        // the 0th slot is `self`
        slots, callerScope,
        // named arguments and blocks passed to a layout that uses eval
        evalScope,
        // locals in scope when the partial was invoked
        partialMap) {
            _classCallCheck$8(this, ScopeImpl);

            this.slots = slots;
            this.callerScope = callerScope;
            this.evalScope = evalScope;
            this.partialMap = partialMap;
        }

        ScopeImpl.root = function root(self) {
            var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var refs = new Array(size + 1);
            for (var i = 0; i <= size; i++) {
                refs[i] = UNDEFINED_REFERENCE;
            }
            return new ScopeImpl(refs, null, null, null).init({ self: self });
        };

        ScopeImpl.sized = function sized() {
            var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            var refs = new Array(size + 1);
            for (var i = 0; i <= size; i++) {
                refs[i] = UNDEFINED_REFERENCE;
            }
            return new ScopeImpl(refs, null, null, null);
        };

        ScopeImpl.prototype.init = function init(_ref) {
            var self = _ref.self;

            this.slots[0] = self;
            return this;
        };

        ScopeImpl.prototype.getSelf = function getSelf() {
            return this.get(0);
        };

        ScopeImpl.prototype.getSymbol = function getSymbol(symbol) {
            return this.get(symbol);
        };

        ScopeImpl.prototype.getBlock = function getBlock(symbol) {
            var block = this.get(symbol);
            return block === UNDEFINED_REFERENCE ? null : block;
        };

        ScopeImpl.prototype.getEvalScope = function getEvalScope() {
            return this.evalScope;
        };

        ScopeImpl.prototype.getPartialMap = function getPartialMap() {
            return this.partialMap;
        };

        ScopeImpl.prototype.bind = function bind(symbol, value) {
            this.set(symbol, value);
        };

        ScopeImpl.prototype.bindSelf = function bindSelf(self) {
            this.set(0, self);
        };

        ScopeImpl.prototype.bindSymbol = function bindSymbol(symbol, value) {
            this.set(symbol, value);
        };

        ScopeImpl.prototype.bindBlock = function bindBlock(symbol, value) {
            this.set(symbol, value);
        };

        ScopeImpl.prototype.bindEvalScope = function bindEvalScope(map) {
            this.evalScope = map;
        };

        ScopeImpl.prototype.bindPartialMap = function bindPartialMap(map) {
            this.partialMap = map;
        };

        ScopeImpl.prototype.bindCallerScope = function bindCallerScope(scope) {
            this.callerScope = scope;
        };

        ScopeImpl.prototype.getCallerScope = function getCallerScope() {
            return this.callerScope;
        };

        ScopeImpl.prototype.child = function child() {
            return new ScopeImpl(this.slots.slice(), this.callerScope, this.evalScope, this.partialMap);
        };

        ScopeImpl.prototype.get = function get(index) {
            if (index >= this.slots.length) {
                throw new RangeError('BUG: cannot get $' + index + ' from scope; length=' + this.slots.length);
            }
            return this.slots[index];
        };

        ScopeImpl.prototype.set = function set(index, value) {
            if (index >= this.slots.length) {
                throw new RangeError('BUG: cannot get $' + index + ' from scope; length=' + this.slots.length);
            }
            this.slots[index] = value;
        };

        return ScopeImpl;
    }();
    var TRANSACTION = 'TRANSACTION [c3938885-aba0-422f-b540-3fd3431c78b5]';

    var TransactionImpl = function () {
        function TransactionImpl() {
            _classCallCheck$8(this, TransactionImpl);

            this.scheduledInstallManagers = [];
            this.scheduledInstallModifiers = [];
            this.scheduledUpdateModifierManagers = [];
            this.scheduledUpdateModifiers = [];
            this.createdComponents = [];
            this.createdManagers = [];
            this.updatedComponents = [];
            this.updatedManagers = [];
            this.destructors = [];
        }

        TransactionImpl.prototype.didCreate = function didCreate(component, manager) {
            this.createdComponents.push(component);
            this.createdManagers.push(manager);
        };

        TransactionImpl.prototype.didUpdate = function didUpdate(component, manager) {
            this.updatedComponents.push(component);
            this.updatedManagers.push(manager);
        };

        TransactionImpl.prototype.scheduleInstallModifier = function scheduleInstallModifier(modifier, manager) {
            this.scheduledInstallModifiers.push(modifier);
            this.scheduledInstallManagers.push(manager);
        };

        TransactionImpl.prototype.scheduleUpdateModifier = function scheduleUpdateModifier(modifier, manager) {
            this.scheduledUpdateModifiers.push(modifier);
            this.scheduledUpdateModifierManagers.push(manager);
        };

        TransactionImpl.prototype.didDestroy = function didDestroy(d) {
            this.destructors.push(d);
        };

        TransactionImpl.prototype.commit = function commit() {
            var createdComponents = this.createdComponents,
                createdManagers = this.createdManagers;

            for (var i = 0; i < createdComponents.length; i++) {
                var component = createdComponents[i];
                var manager = createdManagers[i];
                manager.didCreate(component);
            }
            var updatedComponents = this.updatedComponents,
                updatedManagers = this.updatedManagers;

            for (var _i = 0; _i < updatedComponents.length; _i++) {
                var _component = updatedComponents[_i];
                var _manager = updatedManagers[_i];
                _manager.didUpdate(_component);
            }
            var destructors = this.destructors;

            for (var _i2 = 0; _i2 < destructors.length; _i2++) {
                destructors[_i2][util.DROP]();
            }
            var scheduledInstallManagers = this.scheduledInstallManagers,
                scheduledInstallModifiers = this.scheduledInstallModifiers;

            for (var _i3 = 0; _i3 < scheduledInstallManagers.length; _i3++) {
                var modifier = scheduledInstallModifiers[_i3];
                var _manager2 = scheduledInstallManagers[_i3];
                _manager2.install(modifier);
            }
            var scheduledUpdateModifierManagers = this.scheduledUpdateModifierManagers,
                scheduledUpdateModifiers = this.scheduledUpdateModifiers;

            for (var _i4 = 0; _i4 < scheduledUpdateModifierManagers.length; _i4++) {
                var _modifier = scheduledUpdateModifiers[_i4];
                var _manager3 = scheduledUpdateModifierManagers[_i4];
                _manager3.update(_modifier);
            }
        };

        return TransactionImpl;
    }();

    function toBool(value) {
        return !!value;
    }
    var EnvironmentImpl = function () {
        function EnvironmentImpl(_ref2) {
            var appendOperations = _ref2.appendOperations,
                updateOperations = _ref2.updateOperations;

            _classCallCheck$8(this, EnvironmentImpl);

            this[_a$1] = null;
            this.appendOperations = appendOperations;
            this.updateOperations = updateOperations;
        }

        EnvironmentImpl.prototype.toConditionalReference = function toConditionalReference(reference$$1) {
            return new ConditionalReference(reference$$1, toBool);
        };

        EnvironmentImpl.prototype.getAppendOperations = function getAppendOperations() {
            return this.appendOperations;
        };

        EnvironmentImpl.prototype.getDOM = function getDOM() {
            return this.updateOperations;
        };

        EnvironmentImpl.prototype.begin = function begin() {

            this[TRANSACTION] = new TransactionImpl();
        };

        EnvironmentImpl.prototype.didCreate = function didCreate(component, manager) {
            this.transaction.didCreate(component, manager);
        };

        EnvironmentImpl.prototype.didUpdate = function didUpdate(component, manager) {
            this.transaction.didUpdate(component, manager);
        };

        EnvironmentImpl.prototype.scheduleInstallModifier = function scheduleInstallModifier(modifier, manager) {
            this.transaction.scheduleInstallModifier(modifier, manager);
        };

        EnvironmentImpl.prototype.scheduleUpdateModifier = function scheduleUpdateModifier(modifier, manager) {
            this.transaction.scheduleUpdateModifier(modifier, manager);
        };

        EnvironmentImpl.prototype.didDestroy = function didDestroy(d) {
            this.transaction.didDestroy(d);
        };

        EnvironmentImpl.prototype.commit = function commit() {
            var transaction = this.transaction;
            this[TRANSACTION] = null;
            transaction.commit();
        };

        EnvironmentImpl.prototype.attributeFor = function attributeFor(element, attr, _isTrusting) {
            var namespace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

            return dynamicAttribute(element, attr, namespace);
        };

        _createClass$1(EnvironmentImpl, [{
            key: 'transaction',
            get: function get() {
                return this[TRANSACTION];
            }
        }]);

        return EnvironmentImpl;
    }();
    _a$1 = TRANSACTION;
    var RuntimeEnvironmentDelegateImpl = function () {
        function RuntimeEnvironmentDelegateImpl() {
            var inner = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck$8(this, RuntimeEnvironmentDelegateImpl);

            this.inner = inner;
            this.iterable = {
                named: {
                    '@index': function index(_, _index) {
                        return String(_index);
                    },
                    '@primitive': function primitive(item) {
                        return String(item);
                    },
                    '@identity': function identity(item) {
                        return item;
                    }
                },
                default: function _default(key) {
                    return function (item) {
                        return item[key];
                    };
                }
            };
            if (inner.toBool) {
                this.toBool = inner.toBool;
            } else {
                this.toBool = function (value) {
                    return !!value;
                };
            }
        }

        RuntimeEnvironmentDelegateImpl.prototype.protocolForURL = function protocolForURL(url) {
            if (this.inner.protocolForURL) {
                return this.inner.protocolForURL(url);
            } else if (typeof URL === 'object' || typeof URL === 'undefined') {
                return legacyProtocolForURL(url);
            } else if (typeof document !== 'undefined') {
                return new URL(url, document.baseURI).protocol;
            } else {
                return new URL(url, 'https://www.example.com').protocol;
            }
        };

        RuntimeEnvironmentDelegateImpl.prototype.attributeFor = function attributeFor(element, attr, isTrusting, namespace) {
            if (this.inner.attributeFor) {
                return this.inner.attributeFor(element, attr, isTrusting, namespace);
            } else {
                return dynamicAttribute(element, attr, namespace);
            }
        };

        return RuntimeEnvironmentDelegateImpl;
    }();
    function legacyProtocolForURL(url) {
        if (typeof window === 'undefined') {
            var match = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i.exec(url);
            return match && match[1] ? match[1].toLowerCase() : '';
        }
        var anchor = window.document.createElement('a');
        anchor.href = url;
        return anchor.protocol;
    }
    var DefaultRuntimeResolver = function () {
        function DefaultRuntimeResolver(inner) {
            _classCallCheck$8(this, DefaultRuntimeResolver);

            this.inner = inner;
        }

        DefaultRuntimeResolver.prototype.lookupComponent = function lookupComponent(name, referrer) {
            if (this.inner.lookupComponent) {
                var component = this.inner.lookupComponent(name, referrer);
                if (component === undefined) {
                    throw new Error('Unexpected component ' + name + ' (from ' + referrer + ') (lookupComponent returned undefined)');
                }
                return component;
            } else {
                throw new Error('lookupComponent not implemented on RuntimeResolver.');
            }
        };

        DefaultRuntimeResolver.prototype.lookupPartial = function lookupPartial(name, referrer) {
            if (this.inner.lookupPartial) {
                var partial = this.inner.lookupPartial(name, referrer);
                if (partial === undefined) {
                    throw new Error('Unexpected partial ' + name + ' (from ' + referrer + ') (lookupPartial returned undefined)');
                }
                return partial;
            } else {
                throw new Error('lookupPartial not implemented on RuntimeResolver.');
            }
        };

        DefaultRuntimeResolver.prototype.resolve = function resolve(handle) {
            if (this.inner.resolve) {
                var resolved = this.inner.resolve(handle);
                if (resolved === undefined) {
                    throw new Error('Unexpected handle ' + handle + ' (resolve returned undefined)');
                }
                return resolved;
            } else {
                throw new Error('resolve not implemented on RuntimeResolver.');
            }
        };

        DefaultRuntimeResolver.prototype.compilable = function compilable(locator) {
            if (this.inner.compilable) {
                var resolved = this.inner.compilable(locator);
                if (resolved === undefined) {
                    throw new Error('Unable to compile ' + name + ' (compilable returned undefined)');
                }
                return resolved;
            } else {
                throw new Error('compilable not implemented on RuntimeResolver.');
            }
        };

        DefaultRuntimeResolver.prototype.getInvocation = function getInvocation(locator) {
            if (this.inner.getInvocation) {
                var invocation = this.inner.getInvocation(locator);
                if (invocation === undefined) {
                    throw new Error('Unable to get invocation for ' + JSON.stringify(locator) + ' (getInvocation returned undefined)');
                }
                return invocation;
            } else {
                throw new Error('getInvocation not implemented on RuntimeResolver.');
            }
        };

        return DefaultRuntimeResolver;
    }();
    function AotRuntime(document, program$$1) {
        var resolver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var delegate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        var env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
        return {
            env: env,
            resolver: new DefaultRuntimeResolver(resolver),
            program: program.RuntimeProgramImpl.hydrate(program$$1)
        };
    }
    // TODO: There are a lot of variants here. Some are here for transitional purposes
    // and some might be GCable once the design stabilizes.
    function CustomJitRuntime(resolver, context, env) {
        var program$$1 = new program.RuntimeProgramImpl(context.program.constants, context.program.heap);
        return {
            env: env,
            resolver: new DefaultRuntimeResolver(resolver),
            program: program$$1
        };
    }
    function JitRuntime(document) {
        var resolver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var delegate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
        var constants = new program.Constants();
        var heap = new program.HeapImpl();
        var program$$1 = new program.RuntimeProgramImpl(constants, heap);
        return {
            env: env,
            resolver: new DefaultRuntimeResolver(resolver),
            program: program$$1
        };
    }
    function JitRuntimeFromProgram(document, program$$1) {
        var resolver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var delegate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        var env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
        return {
            env: env,
            resolver: new DefaultRuntimeResolver(resolver),
            program: program$$1
        };
    }
    var RuntimeEnvironment = function (_EnvironmentImpl) {
        _inherits$6(RuntimeEnvironment, _EnvironmentImpl);

        function RuntimeEnvironment(document, delegate) {
            _classCallCheck$8(this, RuntimeEnvironment);

            var _this = _possibleConstructorReturn$6(this, _EnvironmentImpl.call(this, {
                appendOperations: new DOMTreeConstruction(document),
                updateOperations: new DOMChangesImpl(document)
            }));

            _this.delegate = new RuntimeEnvironmentDelegateImpl(delegate);
            return _this;
        }

        RuntimeEnvironment.prototype.protocolForURL = function protocolForURL(url) {
            return this.delegate.protocolForURL(url);
        };

        RuntimeEnvironment.prototype.iterableFor = function iterableFor(ref, inputKey) {
            var key = String(inputKey);
            var def = this.delegate.iterable;
            var keyFor = key in def.named ? def.named[key] : def.default(key);
            return new reference.IterableImpl(ref, keyFor);
        };

        RuntimeEnvironment.prototype.toConditionalReference = function toConditionalReference(input) {
            return new ConditionalReference(input, this.delegate.toBool);
        };

        RuntimeEnvironment.prototype.attributeFor = function attributeFor(element, attr, isTrusting, namespace) {
            return this.delegate.attributeFor(element, attr, isTrusting, namespace);
        };

        return RuntimeEnvironment;
    }(EnvironmentImpl);
    function inTransaction(env, cb) {
        if (!env[TRANSACTION]) {
            env.begin();
            try {
                cb();
            } finally {
                env.commit();
            }
        } else {
            cb();
        }
    }
    var DefaultEnvironment = function (_EnvironmentImpl2) {
        _inherits$6(DefaultEnvironment, _EnvironmentImpl2);

        function DefaultEnvironment(options) {
            _classCallCheck$8(this, DefaultEnvironment);

            if (!options) {
                var _document = window.document;
                var appendOperations = new DOMTreeConstruction(_document);
                var updateOperations = new DOMChangesImpl(_document);
                options = { appendOperations: appendOperations, updateOperations: updateOperations };
            }
            return _possibleConstructorReturn$6(this, _EnvironmentImpl2.call(this, options));
        }

        return DefaultEnvironment;
    }(EnvironmentImpl);

    function _defaults$7(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _possibleConstructorReturn$7(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$7(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$7(subClass, superClass); }

    function _classCallCheck$9(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    var AppendOpcodes = function () {
        function AppendOpcodes() {
            _classCallCheck$9(this, AppendOpcodes);

            this.evaluateOpcode = util.fillNulls(90 /* Size */).slice();
        }

        AppendOpcodes.prototype.add = function add(name, evaluate) {
            var kind = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'syscall';

            this.evaluateOpcode[name] = {
                syscall: kind !== 'machine',
                evaluate: evaluate
            };
        };

        AppendOpcodes.prototype.debugBefore = function debugBefore(vm$$1, opcode) {
            var params = undefined;
            var opName = undefined;
            
            var sp = void 0;

            return {
                sp: sp,
                pc: vm$$1.fetchValue(vm.$pc),
                name: opName,
                params: params,
                type: opcode.type,
                isMachine: opcode.isMachine,
                size: opcode.size,
                state: undefined
            };
        };

        AppendOpcodes.prototype.debugAfter = function debugAfter(vm$$1, pre) {
            var sp = pre.sp,
                type = pre.type,
                isMachine = pre.isMachine,
                pc = pre.pc;

            
        };

        AppendOpcodes.prototype.evaluate = function evaluate(vm$$1, opcode, type) {
            var operation = this.evaluateOpcode[type];
            if (operation.syscall) {

                operation.evaluate(vm$$1, opcode);
            } else {

                operation.evaluate(vm$$1[INNER_VM], opcode);
            }
        };

        return AppendOpcodes;
    }();
    var APPEND_OPCODES = new AppendOpcodes();
    var AbstractOpcode = function AbstractOpcode() {
        _classCallCheck$9(this, AbstractOpcode);

        util.initializeGuid(this);
    };
    var UpdatingOpcode = function (_AbstractOpcode) {
        _inherits$7(UpdatingOpcode, _AbstractOpcode);

        function UpdatingOpcode() {
            _classCallCheck$9(this, UpdatingOpcode);

            var _this = _possibleConstructorReturn$7(this, _AbstractOpcode.apply(this, arguments));

            _this.next = null;
            _this.prev = null;
            return _this;
        }

        return UpdatingOpcode;
    }(AbstractOpcode);

    function _defaults$8(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$10(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$8(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$8(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$8(subClass, superClass); }
    var ConcatReference = function (_CachedReference) {
        _inherits$8(ConcatReference, _CachedReference);

        function ConcatReference(parts) {
            _classCallCheck$10(this, ConcatReference);

            var _this = _possibleConstructorReturn$8(this, _CachedReference.call(this));

            _this.parts = parts;
            _this.tag = reference.combineTagged(parts);
            return _this;
        }

        ConcatReference.prototype.compute = function compute() {
            var parts = new Array();
            for (var i = 0; i < this.parts.length; i++) {
                var value = this.parts[i].value();
                if (value !== null && value !== undefined) {
                    parts[i] = castToString(value);
                }
            }
            if (parts.length > 0) {
                return parts.join('');
            }
            return null;
        };

        return ConcatReference;
    }(reference.CachedReference);
    function castToString(value) {
        if (typeof value.toString !== 'function') {
            return '';
        }
        return String(value);
    }

    APPEND_OPCODES.add(16 /* Helper */, function (vm$$1, _ref) {
        var handle = _ref.op1;

        var stack = vm$$1.stack;
        var helper = vm$$1.runtime.resolver.resolve(handle);
        var args = stack.pop();
        var value = helper(args, vm$$1);
        vm$$1.loadValue(vm.$v0, value);
    });
    APPEND_OPCODES.add(22 /* GetVariable */, function (vm$$1, _ref2) {
        var symbol = _ref2.op1;

        var expr = vm$$1.referenceForSymbol(symbol);
        vm$$1.stack.push(expr);
    });
    APPEND_OPCODES.add(19 /* SetVariable */, function (vm$$1, _ref3) {
        var symbol = _ref3.op1;

        var expr = vm$$1.stack.pop();
        vm$$1.scope().bindSymbol(symbol, expr);
    });
    APPEND_OPCODES.add(21 /* SetJitBlock */, function (vm$$1, _ref4) {
        var symbol = _ref4.op1;

        var handle = vm$$1.stack.pop();
        var scope = vm$$1.stack.pop();
        var table = vm$$1.stack.pop();
        var block = table ? [handle, scope, table] : null;
        vm$$1.scope().bindBlock(symbol, block);
    }, 'jit');
    APPEND_OPCODES.add(20 /* SetAotBlock */, function (vm$$1, _ref5) {
        var symbol = _ref5.op1;

        var handle = vm$$1.stack.pop();
        var scope = vm$$1.stack.pop();
        var table = vm$$1.stack.pop();
        var block = table ? [handle, scope, table] : null;
        vm$$1.scope().bindBlock(symbol, block);
    });
    APPEND_OPCODES.add(104 /* ResolveMaybeLocal */, function (vm$$1, _ref6) {
        var _name = _ref6.op1;

        var name = vm$$1[CONSTANTS].getString(_name);
        var locals = vm$$1.scope().getPartialMap();
        var ref = locals[name];
        if (ref === undefined) {
            ref = vm$$1.getSelf().get(name);
        }
        vm$$1.stack.push(ref);
    });
    APPEND_OPCODES.add(36 /* RootScope */, function (vm$$1, _ref7) {
        var symbols = _ref7.op1;

        vm$$1.pushRootScope(symbols);
    });
    APPEND_OPCODES.add(23 /* GetProperty */, function (vm$$1, _ref8) {
        var _key = _ref8.op1;

        var key = vm$$1[CONSTANTS].getString(_key);
        var expr = vm$$1.stack.pop();
        vm$$1.stack.push(expr.get(key));
    });
    APPEND_OPCODES.add(24 /* GetBlock */, function (vm$$1, _ref9) {
        var _block = _ref9.op1;
        var stack = vm$$1.stack;

        var block = vm$$1.scope().getBlock(_block);
        if (block) {
            stack.push(block[2]);
            stack.push(block[1]);
            stack.push(block[0]);
        } else {
            stack.push(null);
            stack.push(null);
            stack.push(null);
        }
    });
    APPEND_OPCODES.add(25 /* HasBlock */, function (vm$$1, _ref10) {
        var _block = _ref10.op1;

        var hasBlock = !!vm$$1.scope().getBlock(_block);
        vm$$1.stack.push(hasBlock ? TRUE_REFERENCE : FALSE_REFERENCE);
    });
    APPEND_OPCODES.add(26 /* HasBlockParams */, function (vm$$1) {
        // FIXME(mmun): should only need to push the symbol table
        var block = vm$$1.stack.pop();
        var scope = vm$$1.stack.pop();

        var table = vm$$1.stack.pop();

        var hasBlockParams = table && table.parameters.length;
        vm$$1.stack.push(hasBlockParams ? TRUE_REFERENCE : FALSE_REFERENCE);
    });
    APPEND_OPCODES.add(27 /* Concat */, function (vm$$1, _ref11) {
        var count = _ref11.op1;

        var out = new Array(count);
        for (var i = count; i > 0; i--) {
            var offset = i - 1;
            out[offset] = vm$$1.stack.pop();
        }
        vm$$1.stack.push(new ConcatReference(out));
    });

    /**
     * Converts a ComponentCapabilities object into a 32-bit integer representation.
     */
    function capabilityFlagsFrom(capabilities) {
        return 0 | (capabilities.dynamicLayout ? 1 /* DynamicLayout */ : 0) | (capabilities.dynamicTag ? 2 /* DynamicTag */ : 0) | (capabilities.prepareArgs ? 4 /* PrepareArgs */ : 0) | (capabilities.createArgs ? 8 /* CreateArgs */ : 0) | (capabilities.attributeHook ? 16 /* AttributeHook */ : 0) | (capabilities.elementHook ? 32 /* ElementHook */ : 0) | (capabilities.dynamicScope ? 64 /* DynamicScope */ : 0) | (capabilities.createCaller ? 128 /* CreateCaller */ : 0) | (capabilities.updateHook ? 256 /* UpdateHook */ : 0) | (capabilities.createInstance ? 512 /* CreateInstance */ : 0) | (capabilities.wrapped ? 1024 /* Wrapped */ : 0);
    }
    function managerHasCapability(_manager, capabilities, capability) {
        return !!(capabilities & capability);
    }
    function hasCapability(capabilities, capability) {
        return !!(capabilities & capability);
    }

    var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$11(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var _a$2;
    var CURRIED_COMPONENT_DEFINITION_BRAND = 'CURRIED COMPONENT DEFINITION [id=6f00feb9-a0ef-4547-99ea-ac328f80acea]';
    function isCurriedComponentDefinition(definition) {
        return !!(definition && definition[CURRIED_COMPONENT_DEFINITION_BRAND]);
    }
    function isComponentDefinition(definition) {
        return !!(definition && definition[CURRIED_COMPONENT_DEFINITION_BRAND]);
    }
    var CurriedComponentDefinition = function () {
        /** @internal */
        function CurriedComponentDefinition(inner, args) {
            _classCallCheck$11(this, CurriedComponentDefinition);

            this.inner = inner;
            this.args = args;
            this[_a$2] = true;
        }

        CurriedComponentDefinition.prototype.unwrap = function unwrap(args) {
            args.realloc(this.offset);
            var definition = this;
            while (true) {
                var _definition = definition,
                    curriedArgs = _definition.args,
                    inner = _definition.inner;

                if (curriedArgs) {
                    args.positional.prepend(curriedArgs.positional);
                    args.named.merge(curriedArgs.named);
                }
                if (!isCurriedComponentDefinition(inner)) {
                    return inner;
                }
                definition = inner;
            }
        };
        /** @internal */


        _createClass$2(CurriedComponentDefinition, [{
            key: 'offset',
            get: function get() {
                var inner = this.inner,
                    args = this.args;

                var length = args ? args.positional.length : 0;
                return isCurriedComponentDefinition(inner) ? length + inner.offset : length;
            }
        }]);

        return CurriedComponentDefinition;
    }();
    _a$2 = CURRIED_COMPONENT_DEFINITION_BRAND;
    function curry(spec) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        return new CurriedComponentDefinition(spec, args);
    }

    function resolveComponent(resolver, name, meta) {
        var definition = resolver.lookupComponent(name, meta);

        return definition;
    }

    function _classCallCheck$12(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var ClassListReference = function () {
        function ClassListReference(list) {
            _classCallCheck$12(this, ClassListReference);

            this.list = list;
            this.tag = reference.combineTagged(list);
            this.list = list;
        }

        ClassListReference.prototype.value = function value() {
            var ret = [];
            var list = this.list;

            for (var i = 0; i < list.length; i++) {
                var value = normalizeStringValue(list[i].value());
                if (value) ret.push(value);
            }
            return ret.length === 0 ? null : ret.join(' ');
        };

        return ClassListReference;
    }();

    function _classCallCheck$13(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var CurryComponentReference = function () {
        function CurryComponentReference(inner, resolver, meta, args) {
            _classCallCheck$13(this, CurryComponentReference);

            this.inner = inner;
            this.resolver = resolver;
            this.meta = meta;
            this.args = args;
            this.tag = inner.tag;
            this.lastValue = null;
            this.lastDefinition = null;
        }

        CurryComponentReference.prototype.value = function value() {
            var inner = this.inner,
                lastValue = this.lastValue;

            var value = inner.value();
            if (value === lastValue) {
                return this.lastDefinition;
            }
            var definition = null;
            if (isCurriedComponentDefinition(value)) {
                definition = value;
            } else if (typeof value === 'string' && value) {
                var resolver = this.resolver,
                    meta = this.meta;

                definition = resolveComponent(resolver, value, meta);
            }
            definition = this.curry(definition);
            this.lastValue = value;
            this.lastDefinition = definition;
            return definition;
        };

        CurryComponentReference.prototype.get = function get() {
            return UNDEFINED_REFERENCE;
        };

        CurryComponentReference.prototype.curry = function curry$$1(definition) {
            var args = this.args;

            if (!args && isCurriedComponentDefinition(definition)) {
                return definition;
            } else if (!definition) {
                return null;
            } else {
                return new CurriedComponentDefinition(definition, args);
            }
        };

        return CurryComponentReference;
    }();

    function _defaults$9(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$14(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$9(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$9(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$9(subClass, superClass); }

    var DynamicTextContent = function (_UpdatingOpcode) {
        _inherits$9(DynamicTextContent, _UpdatingOpcode);

        function DynamicTextContent(node, reference$$1, lastValue) {
            _classCallCheck$14(this, DynamicTextContent);

            var _this = _possibleConstructorReturn$9(this, _UpdatingOpcode.call(this));

            _this.node = node;
            _this.reference = reference$$1;
            _this.lastValue = lastValue;
            _this.type = 'dynamic-text';
            _this.tag = reference$$1.tag;
            _this.lastRevision = reference.value(_this.tag);
            return _this;
        }

        DynamicTextContent.prototype.evaluate = function evaluate() {
            var reference$$1 = this.reference,
                tag = this.tag;

            if (!reference.validate(tag, this.lastRevision)) {
                this.lastRevision = reference.value(tag);
                this.update(reference$$1.value());
            }
        };

        DynamicTextContent.prototype.update = function update(value) {
            var lastValue = this.lastValue;

            if (value === lastValue) return;
            var normalized = void 0;
            if (isEmpty(value)) {
                normalized = '';
            } else if (isString(value)) {
                normalized = value;
            } else {
                normalized = String(value);
            }
            if (normalized !== lastValue) {
                var textNode = this.node;
                textNode.nodeValue = this.lastValue = normalized;
            }
        };

        return DynamicTextContent;
    }(UpdatingOpcode);

    function _defaults$10(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$15(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$10(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$10(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$10(subClass, superClass); }
    var IsCurriedComponentDefinitionReference = function (_ConditionalReference) {
        _inherits$10(IsCurriedComponentDefinitionReference, _ConditionalReference);

        function IsCurriedComponentDefinitionReference() {
            _classCallCheck$15(this, IsCurriedComponentDefinitionReference);

            return _possibleConstructorReturn$10(this, _ConditionalReference.apply(this, arguments));
        }

        IsCurriedComponentDefinitionReference.create = function create(inner) {
            return new ConditionalReference(inner, isCurriedComponentDefinition);
        };

        return IsCurriedComponentDefinitionReference;
    }(ConditionalReference);
    var ContentTypeReference = function () {
        function ContentTypeReference(inner) {
            _classCallCheck$15(this, ContentTypeReference);

            this.inner = inner;
            this.tag = inner.tag;
        }

        ContentTypeReference.prototype.value = function value() {
            var value = this.inner.value();
            if (shouldCoerce(value)) {
                return 1 /* String */;
            } else if (isComponentDefinition(value)) {
                return 0 /* Component */;
            } else if (isSafeString(value)) {
                return 3 /* SafeString */;
            } else if (isFragment(value)) {
                return 4 /* Fragment */;
            } else if (isNode(value)) {
                return 5 /* Node */;
            } else {
                    return 1 /* String */;
                }
        };

        return ContentTypeReference;
    }();
    APPEND_OPCODES.add(42 /* AppendHTML */, function (vm$$1) {
        var reference$$1 = vm$$1.stack.pop();
        var rawValue = reference$$1.value();
        var value = isEmpty(rawValue) ? '' : String(rawValue);
        vm$$1.elements().appendDynamicHTML(value);
    });
    APPEND_OPCODES.add(43 /* AppendSafeHTML */, function (vm$$1) {
        var reference$$1 = vm$$1.stack.pop();
        var rawValue = reference$$1.value().toHTML();
        var value = isEmpty(rawValue) ? '' : rawValue;
        vm$$1.elements().appendDynamicHTML(value);
    });
    APPEND_OPCODES.add(46 /* AppendText */, function (vm$$1) {
        var reference$$1 = vm$$1.stack.pop();
        var rawValue = reference$$1.value();
        var value = isEmpty(rawValue) ? '' : String(rawValue);
        var node = vm$$1.elements().appendDynamicText(value);
        if (!reference.isConst(reference$$1)) {
            vm$$1.updateWith(new DynamicTextContent(node, reference$$1, value));
        }
    });
    APPEND_OPCODES.add(44 /* AppendDocumentFragment */, function (vm$$1) {
        var reference$$1 = vm$$1.stack.pop();
        var value = reference$$1.value();
        vm$$1.elements().appendDynamicFragment(value);
    });
    APPEND_OPCODES.add(45 /* AppendNode */, function (vm$$1) {
        var reference$$1 = vm$$1.stack.pop();
        var value = reference$$1.value();
        vm$$1.elements().appendDynamicNode(value);
    });

    function _defaults$11(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$16(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$11(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$11(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$11(subClass, superClass); }
    APPEND_OPCODES.add(38 /* ChildScope */, function (vm$$1) {
        return vm$$1.pushChildScope();
    });
    APPEND_OPCODES.add(39 /* PopScope */, function (vm$$1) {
        return vm$$1.popScope();
    });
    APPEND_OPCODES.add(58 /* PushDynamicScope */, function (vm$$1) {
        return vm$$1.pushDynamicScope();
    });
    APPEND_OPCODES.add(59 /* PopDynamicScope */, function (vm$$1) {
        return vm$$1.popDynamicScope();
    });
    APPEND_OPCODES.add(28 /* Constant */, function (vm$$1, _ref) {
        var other = _ref.op1;

        vm$$1.stack.push(vm$$1[CONSTANTS].getOther(other));
    });
    APPEND_OPCODES.add(29 /* Primitive */, function (vm$$1, _ref2) {
        var primitive = _ref2.op1;

        var stack = vm$$1.stack;
        var flag = primitive & 7; // 111
        var value = primitive >> 3;
        switch (flag) {
            case 0 /* NUMBER */:
                stack.push(value);
                break;
            case 1 /* FLOAT */:
                stack.push(vm$$1[CONSTANTS].getNumber(value));
                break;
            case 2 /* STRING */:
                stack.push(vm$$1[CONSTANTS].getString(value));
                break;
            case 3 /* BOOLEAN_OR_VOID */:
                stack.pushRaw(primitive);
                break;
            case 4 /* NEGATIVE */:
                stack.push(vm$$1[CONSTANTS].getNumber(value));
                break;
            case 5 /* BIG_NUM */:
                stack.push(vm$$1[CONSTANTS].getNumber(value));
                break;
        }
    });
    APPEND_OPCODES.add(30 /* PrimitiveReference */, function (vm$$1) {
        var stack = vm$$1.stack;
        stack.push(PrimitiveReference.create(stack.pop()));
    });
    APPEND_OPCODES.add(31 /* ReifyU32 */, function (vm$$1) {
        var stack = vm$$1.stack;
        stack.push(stack.peek().value());
    });
    APPEND_OPCODES.add(32 /* Dup */, function (vm$$1, _ref3) {
        var register = _ref3.op1,
            offset = _ref3.op2;

        var position = vm$$1.fetchValue(register) - offset;
        vm$$1.stack.dup(position);
    });
    APPEND_OPCODES.add(33 /* Pop */, function (vm$$1, _ref4) {
        var count = _ref4.op1;

        vm$$1.stack.pop(count);
    });
    APPEND_OPCODES.add(34 /* Load */, function (vm$$1, _ref5) {
        var register = _ref5.op1;

        vm$$1.load(register);
    });
    APPEND_OPCODES.add(35 /* Fetch */, function (vm$$1, _ref6) {
        var register = _ref6.op1;

        vm$$1.fetch(register);
    });
    APPEND_OPCODES.add(57 /* BindDynamicScope */, function (vm$$1, _ref7) {
        var _names = _ref7.op1;

        var names = vm$$1[CONSTANTS].getArray(_names);
        vm$$1.bindDynamicScope(names);
    });
    APPEND_OPCODES.add(68 /* Enter */, function (vm$$1, _ref8) {
        var args = _ref8.op1;

        vm$$1.enter(args);
    });
    APPEND_OPCODES.add(69 /* Exit */, function (vm$$1) {
        vm$$1.exit();
    });
    APPEND_OPCODES.add(62 /* PushSymbolTable */, function (vm$$1, _ref9) {
        var _table = _ref9.op1;

        var stack = vm$$1.stack;
        stack.push(vm$$1[CONSTANTS].getTemplateMeta(_table));
    });
    APPEND_OPCODES.add(61 /* PushBlockScope */, function (vm$$1) {
        var stack = vm$$1.stack;
        stack.push(vm$$1.scope());
    });
    APPEND_OPCODES.add(60 /* CompileBlock */, function (vm$$1) {
        var stack = vm$$1.stack;
        var block = stack.pop();
        if (block) {
            stack.push(vm$$1.compile(block));
        } else {
            stack.push(null);
        }
    }, 'jit');
    APPEND_OPCODES.add(63 /* InvokeYield */, function (vm$$1) {
        var stack = vm$$1.stack;

        var handle = stack.pop();
        var scope = stack.pop();
        var table = stack.pop();

        var args = stack.pop();
        if (table === null) {
            // To balance the pop{Frame,Scope}
            vm$$1.pushFrame();
            vm$$1.pushScope(scope); // Could be null but it doesnt matter as it is immediatelly popped.
            return;
        }
        var invokingScope = scope;
        // If necessary, create a child scope
        {
            var locals = table.parameters;
            var localsCount = locals.length;
            if (localsCount > 0) {
                invokingScope = invokingScope.child();
                for (var i = 0; i < localsCount; i++) {
                    invokingScope.bindSymbol(locals[i], args.at(i));
                }
            }
        }
        vm$$1.pushFrame();
        vm$$1.pushScope(invokingScope);
        vm$$1.call(handle);
    });
    APPEND_OPCODES.add(64 /* JumpIf */, function (vm$$1, _ref10) {
        var target = _ref10.op1;

        var reference$$1 = vm$$1.stack.pop();
        if (reference.isConst(reference$$1)) {
            if (reference$$1.value()) {
                vm$$1.goto(target);
            }
        } else {
            var cache = new reference.ReferenceCache(reference$$1);
            if (cache.peek()) {
                vm$$1.goto(target);
            }
            vm$$1.updateWith(new Assert(cache));
        }
    });
    APPEND_OPCODES.add(65 /* JumpUnless */, function (vm$$1, _ref11) {
        var target = _ref11.op1;

        var reference$$1 = vm$$1.stack.pop();
        if (reference.isConst(reference$$1)) {
            if (!reference$$1.value()) {
                vm$$1.goto(target);
            }
        } else {
            var cache = new reference.ReferenceCache(reference$$1);
            if (!cache.peek()) {
                vm$$1.goto(target);
            }
            vm$$1.updateWith(new Assert(cache));
        }
    });
    APPEND_OPCODES.add(66 /* JumpEq */, function (vm$$1, _ref12) {
        var target = _ref12.op1,
            comparison = _ref12.op2;

        var other = vm$$1.stack.peek();
        if (other === comparison) {
            vm$$1.goto(target);
        }
    });
    APPEND_OPCODES.add(67 /* AssertSame */, function (vm$$1) {
        var reference$$1 = vm$$1.stack.peek();
        if (!reference.isConst(reference$$1)) {
            vm$$1.updateWith(Assert.initialize(new reference.ReferenceCache(reference$$1)));
        }
    });
    APPEND_OPCODES.add(70 /* ToBoolean */, function (vm$$1) {
        var env = vm$$1.env,
            stack = vm$$1.stack;

        stack.push(env.toConditionalReference(stack.pop()));
    });
    var Assert = function (_UpdatingOpcode) {
        _inherits$11(Assert, _UpdatingOpcode);

        function Assert(cache) {
            _classCallCheck$16(this, Assert);

            var _this = _possibleConstructorReturn$11(this, _UpdatingOpcode.call(this));

            _this.type = 'assert';
            _this.tag = cache.tag;
            _this.cache = cache;
            return _this;
        }

        Assert.initialize = function initialize(cache) {
            var assert = new Assert(cache);
            cache.peek();
            return assert;
        };

        Assert.prototype.evaluate = function evaluate(vm$$1) {
            var cache = this.cache;

            if (reference.isModified(cache.revalidate())) {
                vm$$1.throw();
            }
        };

        return Assert;
    }(UpdatingOpcode);
    var JumpIfNotModifiedOpcode = function (_UpdatingOpcode2) {
        _inherits$11(JumpIfNotModifiedOpcode, _UpdatingOpcode2);

        function JumpIfNotModifiedOpcode(tag, target) {
            _classCallCheck$16(this, JumpIfNotModifiedOpcode);

            var _this2 = _possibleConstructorReturn$11(this, _UpdatingOpcode2.call(this));

            _this2.target = target;
            _this2.type = 'jump-if-not-modified';
            _this2.tag = tag;
            _this2.lastRevision = reference.value(tag);
            return _this2;
        }

        JumpIfNotModifiedOpcode.prototype.evaluate = function evaluate(vm$$1) {
            var tag = this.tag,
                target = this.target,
                lastRevision = this.lastRevision;

            if (!vm$$1.alwaysRevalidate && reference.validate(tag, lastRevision)) {
                vm$$1.goto(target);
            }
        };

        JumpIfNotModifiedOpcode.prototype.didModify = function didModify() {
            this.lastRevision = reference.value(this.tag);
        };

        return JumpIfNotModifiedOpcode;
    }(UpdatingOpcode);
    var DidModifyOpcode = function (_UpdatingOpcode3) {
        _inherits$11(DidModifyOpcode, _UpdatingOpcode3);

        function DidModifyOpcode(target) {
            _classCallCheck$16(this, DidModifyOpcode);

            var _this3 = _possibleConstructorReturn$11(this, _UpdatingOpcode3.call(this));

            _this3.target = target;
            _this3.type = 'did-modify';
            _this3.tag = reference.CONSTANT_TAG;
            return _this3;
        }

        DidModifyOpcode.prototype.evaluate = function evaluate() {
            this.target.didModify();
        };

        return DidModifyOpcode;
    }(UpdatingOpcode);
    var LabelOpcode = function () {
        function LabelOpcode(label) {
            _classCallCheck$16(this, LabelOpcode);

            this.tag = reference.CONSTANT_TAG;
            this.type = 'label';
            this.label = null;
            this.prev = null;
            this.next = null;
            util.initializeGuid(this);
            this.label = label;
        }

        LabelOpcode.prototype.evaluate = function evaluate() {};

        LabelOpcode.prototype.inspect = function inspect() {
            return this.label + ' [' + this._guid + ']';
        };

        return LabelOpcode;
    }();

    function _defaults$12(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$17(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$12(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$12(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$12(subClass, superClass); }

    APPEND_OPCODES.add(40 /* Text */, function (vm$$1, _ref) {
        var text = _ref.op1;

        vm$$1.elements().appendText(vm$$1[CONSTANTS].getString(text));
    });
    APPEND_OPCODES.add(41 /* Comment */, function (vm$$1, _ref2) {
        var text = _ref2.op1;

        vm$$1.elements().appendComment(vm$$1[CONSTANTS].getString(text));
    });
    APPEND_OPCODES.add(47 /* OpenElement */, function (vm$$1, _ref3) {
        var tag = _ref3.op1;

        vm$$1.elements().openElement(vm$$1[CONSTANTS].getString(tag));
    });
    APPEND_OPCODES.add(48 /* OpenDynamicElement */, function (vm$$1) {
        var tagName = vm$$1.stack.pop().value();
        vm$$1.elements().openElement(tagName);
    });
    APPEND_OPCODES.add(49 /* PushRemoteElement */, function (vm$$1) {
        var elementRef = vm$$1.stack.pop();
        var insertBeforeRef = vm$$1.stack.pop();
        var guidRef = vm$$1.stack.pop();
        var element = void 0;
        var insertBefore = void 0;
        var guid = guidRef.value();
        if (reference.isConst(elementRef)) {
            element = elementRef.value();
        } else {
            var cache = new reference.ReferenceCache(elementRef);
            element = cache.peek();
            vm$$1.updateWith(new Assert(cache));
        }
        if (insertBeforeRef.value() !== undefined) {
            if (reference.isConst(insertBeforeRef)) {
                insertBefore = insertBeforeRef.value();
            } else {
                var _cache = new reference.ReferenceCache(insertBeforeRef);
                insertBefore = _cache.peek();
                vm$$1.updateWith(new Assert(_cache));
            }
        }
        var block = vm$$1.elements().pushRemoteElement(element, guid, insertBefore);
        if (block) vm$$1.associateDestroyable(block);
    });
    APPEND_OPCODES.add(55 /* PopRemoteElement */, function (vm$$1) {
        vm$$1.elements().popRemoteElement();
    });
    APPEND_OPCODES.add(53 /* FlushElement */, function (vm$$1) {
        var operations = vm$$1.fetchValue(vm.$t0);
        var modifiers = null;
        if (operations) {
            modifiers = operations.flush(vm$$1);
            vm$$1.loadValue(vm.$t0, null);
        }
        vm$$1.elements().flushElement(modifiers);
    });
    APPEND_OPCODES.add(54 /* CloseElement */, function (vm$$1) {
        var modifiers = vm$$1.elements().closeElement();
        if (modifiers) {
            modifiers.forEach(function (_ref4) {
                var manager = _ref4[0],
                    modifier = _ref4[1];

                vm$$1.env.scheduleInstallModifier(modifier, manager);
                var d = manager.getDestructor(modifier);
                if (d) {
                    vm$$1.associateDestroyable(d);
                }
            });
        }
    });
    APPEND_OPCODES.add(56 /* Modifier */, function (vm$$1, _ref5) {
        var handle = _ref5.op1;

        var _vm$runtime$resolver$ = vm$$1.runtime.resolver.resolve(handle),
            manager = _vm$runtime$resolver$.manager,
            state = _vm$runtime$resolver$.state;

        var stack = vm$$1.stack;
        var args = stack.pop();

        var _vm$elements = vm$$1.elements(),
            constructing = _vm$elements.constructing,
            updateOperations = _vm$elements.updateOperations;

        var dynamicScope = vm$$1.dynamicScope();
        var modifier = manager.create(constructing, state, args, dynamicScope, updateOperations);
        var operations = vm$$1.fetchValue(vm.$t0);
        operations.addModifier(manager, modifier);
        var tag = manager.getTag(modifier);
        if (!reference.isConstTag(tag)) {
            vm$$1.updateWith(new UpdateModifierOpcode(tag, manager, modifier));
        }
    });
    var UpdateModifierOpcode = function (_UpdatingOpcode) {
        _inherits$12(UpdateModifierOpcode, _UpdatingOpcode);

        function UpdateModifierOpcode(tag, manager, modifier) {
            _classCallCheck$17(this, UpdateModifierOpcode);

            var _this = _possibleConstructorReturn$12(this, _UpdatingOpcode.call(this));

            _this.tag = tag;
            _this.manager = manager;
            _this.modifier = modifier;
            _this.type = 'update-modifier';
            _this.lastUpdated = reference.value(tag);
            return _this;
        }

        UpdateModifierOpcode.prototype.evaluate = function evaluate(vm$$1) {
            var manager = this.manager,
                modifier = this.modifier,
                tag = this.tag,
                lastUpdated = this.lastUpdated;

            if (!reference.validate(tag, lastUpdated)) {
                vm$$1.env.scheduleUpdateModifier(modifier, manager);
                this.lastUpdated = reference.value(tag);
            }
        };

        return UpdateModifierOpcode;
    }(UpdatingOpcode);
    APPEND_OPCODES.add(50 /* StaticAttr */, function (vm$$1, _ref6) {
        var _name = _ref6.op1,
            _value = _ref6.op2,
            _namespace = _ref6.op3;

        var name = vm$$1[CONSTANTS].getString(_name);
        var value = vm$$1[CONSTANTS].getString(_value);
        var namespace = _namespace ? vm$$1[CONSTANTS].getString(_namespace) : null;
        vm$$1.elements().setStaticAttribute(name, value, namespace);
    });
    APPEND_OPCODES.add(51 /* DynamicAttr */, function (vm$$1, _ref7) {
        var _name = _ref7.op1,
            trusting = _ref7.op2,
            _namespace = _ref7.op3;

        var name = vm$$1[CONSTANTS].getString(_name);
        var reference$$1 = vm$$1.stack.pop();
        var value = reference$$1.value();
        var namespace = _namespace ? vm$$1[CONSTANTS].getString(_namespace) : null;
        var attribute = vm$$1.elements().setDynamicAttribute(name, value, !!trusting, namespace);
        if (!reference.isConst(reference$$1)) {
            vm$$1.updateWith(new UpdateDynamicAttributeOpcode(reference$$1, attribute));
        }
    });
    var UpdateDynamicAttributeOpcode = function (_UpdatingOpcode2) {
        _inherits$12(UpdateDynamicAttributeOpcode, _UpdatingOpcode2);

        function UpdateDynamicAttributeOpcode(reference$$1, attribute) {
            _classCallCheck$17(this, UpdateDynamicAttributeOpcode);

            var _this2 = _possibleConstructorReturn$12(this, _UpdatingOpcode2.call(this));

            _this2.reference = reference$$1;
            _this2.attribute = attribute;
            _this2.type = 'patch-element';
            var tag = reference$$1.tag;

            _this2.tag = tag;
            _this2.lastRevision = reference.value(tag);
            return _this2;
        }

        UpdateDynamicAttributeOpcode.prototype.evaluate = function evaluate(vm$$1) {
            var attribute = this.attribute,
                reference$$1 = this.reference,
                tag = this.tag;

            if (!reference.validate(tag, this.lastRevision)) {
                this.lastRevision = reference.value(tag);
                attribute.update(reference$$1.value(), vm$$1.env);
            }
        };

        return UpdateDynamicAttributeOpcode;
    }(UpdatingOpcode);

    function _defaults$13(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _possibleConstructorReturn$13(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$13(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$13(subClass, superClass); }

    function _classCallCheck$18(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    /**
     * The VM creates a new ComponentInstance data structure for every component
     * invocation it encounters.
     *
     * Similar to how a ComponentDefinition contains state about all components of a
     * particular type, a ComponentInstance contains state specific to a particular
     * instance of a component type. It also contains a pointer back to its
     * component type's ComponentDefinition.
     */
    var COMPONENT_INSTANCE = 'COMPONENT_INSTANCE [c56c57de-e73a-4ef0-b137-07661da17029]';
    APPEND_OPCODES.add(76 /* IsComponent */, function (vm$$1) {
        var stack = vm$$1.stack;
        var ref = stack.pop();
        stack.push(new ConditionalReference(ref, isCurriedComponentDefinition));
    });
    APPEND_OPCODES.add(77 /* ContentType */, function (vm$$1) {
        var stack = vm$$1.stack;
        var ref = stack.peek();
        stack.push(new ContentTypeReference(ref));
    });
    APPEND_OPCODES.add(78 /* CurryComponent */, function (vm$$1, _ref) {
        var _meta = _ref.op1;

        var stack = vm$$1.stack;
        var definition = stack.pop();
        var capturedArgs = stack.pop();
        var meta = vm$$1[CONSTANTS].getTemplateMeta(_meta);
        var resolver = vm$$1.runtime.resolver;
        vm$$1.loadValue(vm.$v0, new CurryComponentReference(definition, resolver, meta, capturedArgs));
        // expectStackChange(vm.stack, -args.length - 1, 'CurryComponent');
    });
    APPEND_OPCODES.add(79 /* PushComponentDefinition */, function (vm$$1, _ref2) {
        var _instance;

        var handle = _ref2.op1;

        var definition = vm$$1.runtime.resolver.resolve(handle);

        var manager = definition.manager;

        var capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
        var instance = (_instance = {}, _instance[COMPONENT_INSTANCE] = true, _instance.definition = definition, _instance.manager = manager, _instance.capabilities = capabilities, _instance.state = null, _instance.handle = null, _instance.table = null, _instance.lookup = null, _instance);
        vm$$1.stack.push(instance);
    });
    APPEND_OPCODES.add(82 /* ResolveDynamicComponent */, function (vm$$1, _ref3) {
        var _meta = _ref3.op1;

        var stack = vm$$1.stack;
        var component = stack.pop().value();
        var meta = vm$$1[CONSTANTS].getTemplateMeta(_meta);
        vm$$1.loadValue(vm.$t1, null); // Clear the temp register
        var definition = void 0;
        if (typeof component === 'string') {
            var resolvedDefinition = resolveComponent(vm$$1.runtime.resolver, component, meta);
            definition = resolvedDefinition;
        } else if (isCurriedComponentDefinition(component)) {
            definition = component;
        } else {
            throw util.unreachable();
        }
        stack.push(definition);
    });
    APPEND_OPCODES.add(80 /* PushDynamicComponentInstance */, function (vm$$1) {
        var stack = vm$$1.stack;

        var definition = stack.pop();
        var capabilities = void 0,
            manager = void 0;
        if (isCurriedComponentDefinition(definition)) {
            manager = capabilities = null;
        } else {
            manager = definition.manager;
            capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
        }
        stack.push({ definition: definition, capabilities: capabilities, manager: manager, state: null, handle: null, table: null });
    });
    APPEND_OPCODES.add(81 /* PushCurriedComponent */, function (vm$$1) {
        var stack = vm$$1.stack;
        var component = stack.pop().value();
        var definition = void 0;
        if (isCurriedComponentDefinition(component)) {
            definition = component;
        } else {
            throw util.unreachable();
        }
        stack.push(definition);
    });
    APPEND_OPCODES.add(83 /* PushArgs */, function (vm$$1, _ref4) {
        var _names = _ref4.op1,
            flags = _ref4.op2;

        var stack = vm$$1.stack;
        var names = vm$$1[CONSTANTS].getStringArray(_names);
        var positionalCount = flags >> 4;
        var atNames = flags & 8;
        var blockNames = [];
        if (flags & 4) blockNames.push('main');
        if (flags & 2) blockNames.push('else');
        if (flags & 1) blockNames.push('attrs');
        vm$$1[ARGS].setup(stack, names, blockNames, positionalCount, !!atNames);
        stack.push(vm$$1[ARGS]);
    });
    APPEND_OPCODES.add(84 /* PushEmptyArgs */, function (vm$$1) {
        var stack = vm$$1.stack;

        stack.push(vm$$1[ARGS].empty(stack));
    });
    APPEND_OPCODES.add(87 /* CaptureArgs */, function (vm$$1) {
        var stack = vm$$1.stack;
        var args = stack.pop();
        var capturedArgs = args.capture();
        stack.push(capturedArgs);
    });
    APPEND_OPCODES.add(86 /* PrepareArgs */, function (vm$$1, _ref5) {
        var _state = _ref5.op1;

        var stack = vm$$1.stack;
        var instance = vm$$1.fetchValue(_state);
        var args = stack.pop();
        var definition = instance.definition;

        if (isCurriedComponentDefinition(definition)) {

            definition = resolveCurriedComponentDefinition(instance, definition, args);
        }
        var _definition = definition,
            manager = _definition.manager,
            state = _definition.state;

        var capabilities = instance.capabilities;
        if (!managerHasCapability(manager, capabilities, 4 /* PrepareArgs */)) {
            stack.push(args);
            return;
        }
        var blocks = args.blocks.values;
        var blockNames = args.blocks.names;
        var preparedArgs = manager.prepareArgs(state, args);
        if (preparedArgs) {
            args.clear();
            for (var i = 0; i < blocks.length; i++) {
                stack.push(blocks[i]);
            }
            var positional = preparedArgs.positional,
                named = preparedArgs.named;

            var positionalCount = positional.length;
            for (var _i = 0; _i < positionalCount; _i++) {
                stack.push(positional[_i]);
            }
            var names = Object.keys(named);
            for (var _i2 = 0; _i2 < names.length; _i2++) {
                stack.push(named[names[_i2]]);
            }
            args.setup(stack, names, blockNames, positionalCount, false);
        }
        stack.push(args);
    });
    function resolveCurriedComponentDefinition(instance, definition, args) {
        var unwrappedDefinition = instance.definition = definition.unwrap(args);
        var manager = unwrappedDefinition.manager,
            state = unwrappedDefinition.state;

        instance.manager = manager;
        instance.capabilities = capabilityFlagsFrom(manager.getCapabilities(state));
        return unwrappedDefinition;
    }
    APPEND_OPCODES.add(88 /* CreateComponent */, function (vm$$1, _ref6) {
        var flags = _ref6.op1,
            _state = _ref6.op2;

        var instance = vm$$1.fetchValue(_state);
        var definition = instance.definition,
            manager = instance.manager;

        var capabilities = instance.capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
        if (!managerHasCapability(manager, capabilities, 512 /* CreateInstance */)) {
            throw new Error('BUG');
        }
        var dynamicScope = null;
        if (managerHasCapability(manager, capabilities, 64 /* DynamicScope */)) {
            dynamicScope = vm$$1.dynamicScope();
        }
        var hasDefaultBlock = flags & 1;
        var args = null;
        if (managerHasCapability(manager, capabilities, 8 /* CreateArgs */)) {
            args = vm$$1.stack.peek();
        }
        var self = null;
        if (managerHasCapability(manager, capabilities, 128 /* CreateCaller */)) {
            self = vm$$1.getSelf();
        }
        var state = manager.create(vm$$1.env, definition.state, args, dynamicScope, self, !!hasDefaultBlock);
        // We want to reuse the `state` POJO here, because we know that the opcodes
        // only transition at exactly one place.
        instance.state = state;
        var tag = manager.getTag(state);
        if (managerHasCapability(manager, capabilities, 256 /* UpdateHook */) && !reference.isConstTag(tag)) {
            vm$$1.updateWith(new UpdateComponentOpcode(tag, state, manager, dynamicScope));
        }
    });
    APPEND_OPCODES.add(89 /* RegisterComponentDestructor */, function (vm$$1, _ref7) {
        var _state = _ref7.op1;

        var _vm$fetchValue = vm$$1.fetchValue(_state),
            manager = _vm$fetchValue.manager,
            state = _vm$fetchValue.state;

        var d = manager.getDestructor(state);
        if (d) vm$$1.associateDestroyable(d);
    });
    APPEND_OPCODES.add(99 /* BeginComponentTransaction */, function (vm$$1) {
        vm$$1.beginCacheGroup();
        vm$$1.elements().pushSimpleBlock();
    });
    APPEND_OPCODES.add(90 /* PutComponentOperations */, function (vm$$1) {
        vm$$1.loadValue(vm.$t0, new ComponentElementOperations());
    });
    APPEND_OPCODES.add(52 /* ComponentAttr */, function (vm$$1, _ref8) {
        var _name = _ref8.op1,
            trusting = _ref8.op2,
            _namespace = _ref8.op3;

        var name = vm$$1[CONSTANTS].getString(_name);
        var reference$$1 = vm$$1.stack.pop();
        var namespace = _namespace ? vm$$1[CONSTANTS].getString(_namespace) : null;
        vm$$1.fetchValue(vm.$t0).setAttribute(name, reference$$1, !!trusting, namespace);
    });
    var ComponentElementOperations = function () {
        function ComponentElementOperations() {
            _classCallCheck$18(this, ComponentElementOperations);

            this.attributes = util.dict();
            this.classes = [];
            this.modifiers = [];
        }

        ComponentElementOperations.prototype.setAttribute = function setAttribute(name, value, trusting, namespace) {
            var deferred = { value: value, namespace: namespace, trusting: trusting };
            if (name === 'class') {
                this.classes.push(value);
            }
            this.attributes[name] = deferred;
        };

        ComponentElementOperations.prototype.addModifier = function addModifier(manager, state) {
            this.modifiers.push([manager, state]);
        };

        ComponentElementOperations.prototype.flush = function flush(vm$$1) {
            for (var name in this.attributes) {
                var attr = this.attributes[name];
                var reference$$1 = attr.value,
                    namespace = attr.namespace,
                    trusting = attr.trusting;

                if (name === 'class') {
                    reference$$1 = new ClassListReference(this.classes);
                }
                if (name === 'type') {
                    continue;
                }
                var attribute = vm$$1.elements().setDynamicAttribute(name, reference$$1.value(), trusting, namespace);
                if (!reference.isConst(reference$$1)) {
                    vm$$1.updateWith(new UpdateDynamicAttributeOpcode(reference$$1, attribute));
                }
            }
            if ('type' in this.attributes) {
                var type = this.attributes.type;
                var _reference = type.value,
                    _namespace2 = type.namespace,
                    _trusting = type.trusting;

                var _attribute = vm$$1.elements().setDynamicAttribute('type', _reference.value(), _trusting, _namespace2);
                if (!reference.isConst(_reference)) {
                    vm$$1.updateWith(new UpdateDynamicAttributeOpcode(_reference, _attribute));
                }
            }
            return this.modifiers;
        };

        return ComponentElementOperations;
    }();
    APPEND_OPCODES.add(101 /* DidCreateElement */, function (vm$$1, _ref9) {
        var _state = _ref9.op1;

        var _vm$fetchValue2 = vm$$1.fetchValue(_state),
            definition = _vm$fetchValue2.definition,
            state = _vm$fetchValue2.state;

        var manager = definition.manager;

        var operations = vm$$1.fetchValue(vm.$t0);
        manager.didCreateElement(state, vm$$1.elements().constructing, operations);
    });
    APPEND_OPCODES.add(91 /* GetComponentSelf */, function (vm$$1, _ref10) {
        var _state = _ref10.op1;

        var _vm$fetchValue3 = vm$$1.fetchValue(_state),
            definition = _vm$fetchValue3.definition,
            state = _vm$fetchValue3.state;

        var manager = definition.manager;

        vm$$1.stack.push(manager.getSelf(state));
    });
    APPEND_OPCODES.add(92 /* GetComponentTagName */, function (vm$$1, _ref11) {
        var _state = _ref11.op1;

        var _vm$fetchValue4 = vm$$1.fetchValue(_state),
            definition = _vm$fetchValue4.definition,
            state = _vm$fetchValue4.state;

        var manager = definition.manager;

        vm$$1.stack.push(manager.getTagName(state));
    });
    // Dynamic Invocation Only
    APPEND_OPCODES.add(94 /* GetJitComponentLayout */, function (vm$$1, _ref12) {
        var _state = _ref12.op1;

        var instance = vm$$1.fetchValue(_state);
        var manager = instance.manager;
        var definition = instance.definition;
        var stack = vm$$1.stack;
        var capabilities = instance.capabilities;
        // let invoke: { handle: number; symbolTable: ProgramSymbolTable };

        var layout = void 0;
        if (hasStaticLayoutCapability(capabilities, manager)) {
            layout = manager.getJitStaticLayout(definition.state, vm$$1.runtime.resolver);
        } else if (hasDynamicLayoutCapability(capabilities, manager)) {
            var template = manager.getJitDynamicLayout(instance.state, vm$$1.runtime.resolver, vm$$1.context);
            if (hasCapability(capabilities, 1024 /* Wrapped */)) {
                layout = template.asWrappedLayout();
            } else {
                layout = template.asLayout();
            }
        } else {
            throw util.unreachable();
        }
        var handle = layout.compile(vm$$1.context);
        stack.push(layout.symbolTable);
        stack.push(handle);
    }, 'jit');
    // Dynamic Invocation Only
    APPEND_OPCODES.add(93 /* GetAotComponentLayout */, function (vm$$1, _ref13) {
        var _state = _ref13.op1;

        var instance = vm$$1.fetchValue(_state);
        var manager = instance.manager,
            definition = instance.definition;
        var stack = vm$$1.stack;
        var instanceState = instance.state,
            capabilities = instance.capabilities;
        var definitionState = definition.state;

        var invoke = void 0;
        if (hasStaticLayoutCapability(capabilities, manager)) {
            invoke = manager.getAotStaticLayout(definitionState, vm$$1.runtime.resolver);
        } else if (hasDynamicLayoutCapability(capabilities, manager)) {
            invoke = manager.getAotDynamicLayout(instanceState, vm$$1.runtime.resolver);
        } else {
            throw util.unreachable();
        }
        stack.push(invoke.symbolTable);
        stack.push(invoke.handle);
    });
    // These types are absurd here
    function hasStaticLayoutCapability(capabilities, _manager) {
        return managerHasCapability(_manager, capabilities, 1 /* DynamicLayout */) === false;
    }
    function hasDynamicLayoutCapability(capabilities, _manager) {
        return managerHasCapability(_manager, capabilities, 1 /* DynamicLayout */) === true;
    }
    APPEND_OPCODES.add(75 /* Main */, function (vm$$1, _ref14) {
        var _state2;

        var register = _ref14.op1;

        var definition = vm$$1.stack.pop();
        var invocation = vm$$1.stack.pop();
        var manager = definition.manager;

        var capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
        var state = (_state2 = {}, _state2[COMPONENT_INSTANCE] = true, _state2.definition = definition, _state2.manager = manager, _state2.capabilities = capabilities, _state2.state = null, _state2.handle = invocation.handle, _state2.table = invocation.symbolTable, _state2.lookup = null, _state2);
        vm$$1.loadValue(register, state);
    });
    APPEND_OPCODES.add(97 /* PopulateLayout */, function (vm$$1, _ref15) {
        var _state = _ref15.op1;
        var stack = vm$$1.stack;

        var handle = stack.pop();
        var table = stack.pop();
        var state = vm$$1.fetchValue(_state);
        state.handle = handle;
        state.table = table;
    });
    APPEND_OPCODES.add(37 /* VirtualRootScope */, function (vm$$1, _ref16) {
        var _state = _ref16.op1;
        var symbols = vm$$1.fetchValue(_state).table.symbols;

        vm$$1.pushRootScope(symbols.length + 1);
    });
    APPEND_OPCODES.add(96 /* SetupForEval */, function (vm$$1, _ref17) {
        var _state = _ref17.op1;

        var state = vm$$1.fetchValue(_state);
        if (state.table.hasEval) {
            var lookup = state.lookup = util.dict();
            vm$$1.scope().bindEvalScope(lookup);
        }
    });
    APPEND_OPCODES.add(17 /* SetNamedVariables */, function (vm$$1, _ref18) {
        var _state = _ref18.op1;

        var state = vm$$1.fetchValue(_state);
        var scope = vm$$1.scope();
        var args = vm$$1.stack.peek();
        var callerNames = args.named.atNames;
        for (var i = callerNames.length - 1; i >= 0; i--) {
            var atName = callerNames[i];
            var symbol = state.table.symbols.indexOf(callerNames[i]);
            var value = args.named.get(atName, true);
            if (symbol !== -1) scope.bindSymbol(symbol + 1, value);
            if (state.lookup) state.lookup[atName] = value;
        }
    });
    function bindBlock(symbolName, blockName, state, blocks, vm$$1) {
        var symbol = state.table.symbols.indexOf(symbolName);
        var block = blocks.get(blockName);
        if (symbol !== -1) {
            vm$$1.scope().bindBlock(symbol + 1, block);
        }
        if (state.lookup) state.lookup[symbolName] = block;
    }
    APPEND_OPCODES.add(18 /* SetBlocks */, function (vm$$1, _ref19) {
        var _state = _ref19.op1;

        var state = vm$$1.fetchValue(_state);

        var _vm$stack$peek = vm$$1.stack.peek(),
            blocks = _vm$stack$peek.blocks;

        bindBlock('&attrs', 'attrs', state, blocks, vm$$1);
        bindBlock('&else', 'else', state, blocks, vm$$1);
        bindBlock('&default', 'main', state, blocks, vm$$1);
    });
    // Dynamic Invocation Only
    APPEND_OPCODES.add(98 /* InvokeComponentLayout */, function (vm$$1, _ref20) {
        var _state = _ref20.op1;

        var state = vm$$1.fetchValue(_state);
        vm$$1.call(state.handle);
    });
    APPEND_OPCODES.add(102 /* DidRenderLayout */, function (vm$$1, _ref21) {
        var _state = _ref21.op1;

        var _vm$fetchValue5 = vm$$1.fetchValue(_state),
            manager = _vm$fetchValue5.manager,
            state = _vm$fetchValue5.state,
            capabilities = _vm$fetchValue5.capabilities;

        var bounds = vm$$1.elements().popBlock();
        if (!managerHasCapability(manager, capabilities, 512 /* CreateInstance */)) {
            throw new Error('BUG');
        }
        var mgr = manager;
        mgr.didRenderLayout(state, bounds);
        vm$$1.env.didCreate(state, manager);
        vm$$1.updateWith(new DidUpdateLayoutOpcode(manager, state, bounds));
    });
    APPEND_OPCODES.add(100 /* CommitComponentTransaction */, function (vm$$1) {
        vm$$1.commitCacheGroup();
    });
    var UpdateComponentOpcode = function (_UpdatingOpcode) {
        _inherits$13(UpdateComponentOpcode, _UpdatingOpcode);

        function UpdateComponentOpcode(tag, component, manager, dynamicScope) {
            _classCallCheck$18(this, UpdateComponentOpcode);

            var _this = _possibleConstructorReturn$13(this, _UpdatingOpcode.call(this));

            _this.tag = tag;
            _this.component = component;
            _this.manager = manager;
            _this.dynamicScope = dynamicScope;
            _this.type = 'update-component';
            return _this;
        }

        UpdateComponentOpcode.prototype.evaluate = function evaluate(_vm) {
            var component = this.component,
                manager = this.manager,
                dynamicScope = this.dynamicScope;

            manager.update(component, dynamicScope);
        };

        return UpdateComponentOpcode;
    }(UpdatingOpcode);
    var DidUpdateLayoutOpcode = function (_UpdatingOpcode2) {
        _inherits$13(DidUpdateLayoutOpcode, _UpdatingOpcode2);

        function DidUpdateLayoutOpcode(manager, component, bounds) {
            _classCallCheck$18(this, DidUpdateLayoutOpcode);

            var _this2 = _possibleConstructorReturn$13(this, _UpdatingOpcode2.call(this));

            _this2.manager = manager;
            _this2.component = component;
            _this2.bounds = bounds;
            _this2.type = 'did-update-layout';
            _this2.tag = reference.CONSTANT_TAG;
            return _this2;
        }

        DidUpdateLayoutOpcode.prototype.evaluate = function evaluate(vm$$1) {
            var manager = this.manager,
                component = this.component,
                bounds = this.bounds;

            manager.didUpdateLayout(component, bounds);
            vm$$1.env.didUpdate(component, manager);
        };

        return DidUpdateLayoutOpcode;
    }(UpdatingOpcode);

    function _classCallCheck$19(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function debugCallback(context, get) {
        console.info('Use `context`, and `get(<path>)` to debug this template.');
        // for example...
        // eslint-disable-next-line no-unused-expressions
        context === get('this');
        // eslint-disable-next-line no-debugger
        debugger;
    }
    var callback = debugCallback;
    // For testing purposes
    function setDebuggerCallback(cb) {
        callback = cb;
    }
    function resetDebuggerCallback() {
        callback = debugCallback;
    }

    var ScopeInspector = function () {
        function ScopeInspector(scope, symbols, evalInfo) {
            _classCallCheck$19(this, ScopeInspector);

            this.scope = scope;
            this.locals = util.dict();
            for (var i = 0; i < evalInfo.length; i++) {
                var slot = evalInfo[i];
                var name = symbols[slot - 1];
                var ref = scope.getSymbol(slot);
                this.locals[name] = ref;
            }
        }

        ScopeInspector.prototype.get = function get(path) {
            var scope = this.scope,
                locals = this.locals;

            var parts = path.split('.');

            var _path$split = path.split('.'),
                head = _path$split[0],
                tail = _path$split.slice(1);

            var evalScope = scope.getEvalScope();
            var ref = void 0;
            if (head === 'this') {
                ref = scope.getSelf();
            } else if (locals[head]) {
                ref = locals[head];
            } else if (head.indexOf('@') === 0 && evalScope[head]) {
                ref = evalScope[head];
            } else {
                ref = this.scope.getSelf();
                tail = parts;
            }
            return tail.reduce(function (r, part) {
                return r.get(part);
            }, ref);
        };

        return ScopeInspector;
    }();

    APPEND_OPCODES.add(105 /* Debugger */, function (vm$$1, _ref) {
        var _symbols = _ref.op1,
            _evalInfo = _ref.op2;

        var symbols = vm$$1[CONSTANTS].getStringArray(_symbols);
        var evalInfo = vm$$1[CONSTANTS].getArray(_evalInfo);
        var inspector = new ScopeInspector(vm$$1.scope(), symbols, evalInfo);
        callback(vm$$1.getSelf().value(), function (path) {
            return inspector.get(path).value();
        });
    });

    APPEND_OPCODES.add(103 /* InvokePartial */, function (vm$$1, _ref) {
        var _meta = _ref.op1,
            _symbols = _ref.op2,
            _evalInfo = _ref.op3;
        var constants = vm$$1[CONSTANTS],
            stack = vm$$1.stack;

        var name = stack.pop().value();

        var meta = constants.getTemplateMeta(_meta);
        var outerSymbols = constants.getStringArray(_symbols);
        var evalInfo = constants.getArray(_evalInfo);
        var handle = vm$$1.runtime.resolver.lookupPartial(name, meta);

        var definition = vm$$1.runtime.resolver.resolve(handle);

        var _definition$getPartia = definition.getPartial(vm$$1.context),
            symbolTable = _definition$getPartia.symbolTable,
            vmHandle = _definition$getPartia.handle;

        {
            var partialSymbols = symbolTable.symbols;
            var outerScope = vm$$1.scope();
            var partialScope = vm$$1.pushRootScope(partialSymbols.length);
            var evalScope = outerScope.getEvalScope();
            partialScope.bindEvalScope(evalScope);
            partialScope.bindSelf(outerScope.getSelf());
            var locals = Object.create(outerScope.getPartialMap());
            for (var i = 0; i < evalInfo.length; i++) {
                var slot = evalInfo[i];
                var _name = outerSymbols[slot - 1];
                var ref = outerScope.getSymbol(slot);
                locals[_name] = ref;
            }
            if (evalScope) {
                for (var _i = 0; _i < partialSymbols.length; _i++) {
                    var _name2 = partialSymbols[_i];
                    var symbol = _i + 1;
                    var value = evalScope[_name2];
                    if (value !== undefined) partialScope.bind(symbol, value);
                }
            }
            partialScope.bindPartialMap(locals);
            vm$$1.pushFrame(); // sp += 2
            vm$$1.call(vmHandle);
        }
    }, 'jit');

    function _classCallCheck$20(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var IterablePresenceReference = function () {
        function IterablePresenceReference(artifacts) {
            _classCallCheck$20(this, IterablePresenceReference);

            this.tag = artifacts.tag;
            this.artifacts = artifacts;
        }

        IterablePresenceReference.prototype.value = function value() {
            return !this.artifacts.isEmpty();
        };

        return IterablePresenceReference;
    }();

    APPEND_OPCODES.add(73 /* PutIterator */, function (vm$$1) {
        var stack = vm$$1.stack;
        var listRef = stack.pop();
        var key = stack.pop();
        var iterable = vm$$1.env.iterableFor(listRef, key.value());
        var iterator = new reference.ReferenceIterator(iterable);
        stack.push(iterator);
        stack.push(new IterablePresenceReference(iterator.artifacts));
    });
    APPEND_OPCODES.add(71 /* EnterList */, function (vm$$1, _ref) {
        var relativeStart = _ref.op1;

        vm$$1.enterList(relativeStart);
    });
    APPEND_OPCODES.add(72 /* ExitList */, function (vm$$1) {
        vm$$1.exitList();
    });
    APPEND_OPCODES.add(74 /* Iterate */, function (vm$$1, _ref2) {
        var breaks = _ref2.op1;

        var stack = vm$$1.stack;
        var item = stack.peek().next();
        if (item) {
            var tryOpcode = vm$$1.iterate(item.memo, item.value);
            vm$$1.enterItem(item.key, tryOpcode);
        } else {
            vm$$1.goto(breaks);
        }
    });

    /** @internal */
    var DEFAULT_CAPABILITIES = {
        dynamicLayout: true,
        dynamicTag: true,
        prepareArgs: true,
        createArgs: true,
        attributeHook: false,
        elementHook: false,
        dynamicScope: true,
        createCaller: false,
        updateHook: true,
        createInstance: true,
        wrapped: false
    };
    var MINIMAL_CAPABILITIES = {
        dynamicLayout: false,
        dynamicTag: false,
        prepareArgs: false,
        createArgs: false,
        attributeHook: false,
        elementHook: false,
        dynamicScope: false,
        createCaller: false,
        updateHook: false,
        createInstance: false,
        wrapped: false
    };

    function _classCallCheck$21(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    var SimpleComponentManager = function () {
        function SimpleComponentManager() {
            _classCallCheck$21(this, SimpleComponentManager);
        }

        SimpleComponentManager.prototype.getCapabilities = function getCapabilities(_state) {
            return MINIMAL_CAPABILITIES;
        };

        SimpleComponentManager.prototype.prepareArgs = function prepareArgs(_state, _args) {
            throw new Error('Unimplemented prepareArgs in SimpleComponentManager');
        };

        SimpleComponentManager.prototype.create = function create(_env, _state, _args, _dynamicScope, _caller, _hasDefaultBlock) {
            throw new Error('Unimplemented create in SimpleComponentManager');
        };

        SimpleComponentManager.prototype.getSelf = function getSelf(_state) {
            return UNDEFINED_REFERENCE;
        };

        SimpleComponentManager.prototype.getTag = function getTag(_state) {
            throw new Error('Unimplemented getTag in SimpleComponentManager');
        };

        SimpleComponentManager.prototype.didRenderLayout = function didRenderLayout(_state, _bounds) {
            throw new Error('Unimplemented didRenderLayout in SimpleComponentManager');
        };

        SimpleComponentManager.prototype.didCreate = function didCreate(_state) {
            throw new Error('Unimplemented didCreate in SimpleComponentManager');
        };

        SimpleComponentManager.prototype.update = function update(_state, _dynamicScope) {
            throw new Error('Unimplemented update in SimpleComponentManager');
        };

        SimpleComponentManager.prototype.didUpdateLayout = function didUpdateLayout(_state, _bounds) {
            throw new Error('Unimplemented didUpdateLayout in SimpleComponentManager');
        };

        SimpleComponentManager.prototype.didUpdate = function didUpdate(_state) {
            throw new Error('Unimplemented didUpdate in SimpleComponentManager');
        };

        SimpleComponentManager.prototype.getDestructor = function getDestructor(_state) {
            return null;
        };

        return SimpleComponentManager;
    }();
    var TEMPLATE_ONLY_COMPONENT = {
        state: null,
        manager: new SimpleComponentManager()
    };

    function _classCallCheck$22(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    var DefaultDynamicScope = function () {
        function DefaultDynamicScope(bucket) {
            _classCallCheck$22(this, DefaultDynamicScope);

            if (bucket) {
                this.bucket = util.assign({}, bucket);
            } else {
                this.bucket = {};
            }
        }

        DefaultDynamicScope.prototype.get = function get(key) {
            return this.bucket[key];
        };

        DefaultDynamicScope.prototype.set = function set(key, reference$$1) {
            return this.bucket[key] = reference$$1;
        };

        DefaultDynamicScope.prototype.child = function child() {
            return new DefaultDynamicScope(this.bucket);
        };

        return DefaultDynamicScope;
    }();

    function _classCallCheck$23(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var DynamicVarReference = function () {
        function DynamicVarReference(scope, nameRef) {
            _classCallCheck$23(this, DynamicVarReference);

            this.scope = scope;
            this.nameRef = nameRef;
            var varTag = this.varTag = reference.createUpdatableTag();
            this.tag = reference.combine([nameRef.tag, varTag]);
        }

        DynamicVarReference.prototype.value = function value() {
            return this.getVar().value();
        };

        DynamicVarReference.prototype.get = function get(key) {
            return this.getVar().get(key);
        };

        DynamicVarReference.prototype.getVar = function getVar() {
            var name = String(this.nameRef.value());
            var ref = this.scope.get(name);
            reference.update(this.varTag, ref.tag);
            return ref;
        };

        return DynamicVarReference;
    }();

    function getDynamicVar(args, vm$$1) {
        var scope = vm$$1.dynamicScope();
        var nameRef = args.positional.at(0);
        return new DynamicVarReference(scope, nameRef);
    }

    var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$24(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    /*
      The calling convention is:

      * 0-N block arguments at the bottom
      * 0-N positional arguments next (left-to-right)
      * 0-N named arguments next
    */
    var VMArgumentsImpl = function () {
        function VMArgumentsImpl() {
            _classCallCheck$24(this, VMArgumentsImpl);

            this.stack = null;
            this.positional = new PositionalArgumentsImpl();
            this.named = new NamedArgumentsImpl();
            this.blocks = new BlockArgumentsImpl();
        }

        VMArgumentsImpl.prototype.empty = function empty(stack) {
            var base = stack[REGISTERS][vm.$sp] + 1;
            this.named.empty(stack, base);
            this.positional.empty(stack, base);
            this.blocks.empty(stack, base);
            return this;
        };

        VMArgumentsImpl.prototype.setup = function setup(stack, names, blockNames, positionalCount, atNames) {
            this.stack = stack;
            /*
                   | ... | blocks      | positional  | named |
                   | ... | b0    b1    | p0 p1 p2 p3 | n0 n1 |
             index | ... | 4/5/6 7/8/9 | 10 11 12 13 | 14 15 |
                           ^             ^             ^  ^
                         bbase         pbase       nbase  sp
            */
            var named = this.named;
            var namedCount = names.length;
            var namedBase = stack[REGISTERS][vm.$sp] - namedCount + 1;
            named.setup(stack, namedBase, namedCount, names, atNames);
            var positional = this.positional;
            var positionalBase = namedBase - positionalCount;
            positional.setup(stack, positionalBase, positionalCount);
            var blocks = this.blocks;
            var blocksCount = blockNames.length;
            var blocksBase = positionalBase - blocksCount * 3;
            blocks.setup(stack, blocksBase, blocksCount, blockNames);
        };

        VMArgumentsImpl.prototype.at = function at(pos) {
            return this.positional.at(pos);
        };

        VMArgumentsImpl.prototype.realloc = function realloc(offset) {
            var stack = this.stack;

            if (offset > 0 && stack !== null) {
                var positional = this.positional,
                    named = this.named;

                var newBase = positional.base + offset;
                var length = positional.length + named.length;
                for (var i = length - 1; i >= 0; i--) {
                    stack.copy(i + positional.base, i + newBase);
                }
                positional.base += offset;
                named.base += offset;
                stack[REGISTERS][vm.$sp] += offset;
            }
        };

        VMArgumentsImpl.prototype.capture = function capture() {
            var positional = this.positional.length === 0 ? EMPTY_POSITIONAL : this.positional.capture();
            var named = this.named.length === 0 ? EMPTY_NAMED : this.named.capture();
            return new CapturedArgumentsImpl(this.tag, positional, named, this.length);
        };

        VMArgumentsImpl.prototype.clear = function clear() {
            var stack = this.stack,
                length = this.length;

            if (length > 0 && stack !== null) stack.pop(length);
        };

        _createClass$3(VMArgumentsImpl, [{
            key: 'tag',
            get: function get() {
                return reference.combineTagged([this.positional, this.named]);
            }
        }, {
            key: 'base',
            get: function get() {
                return this.blocks.base;
            }
        }, {
            key: 'length',
            get: function get() {
                return this.positional.length + this.named.length + this.blocks.length * 3;
            }
        }]);

        return VMArgumentsImpl;
    }();
    var PositionalArgumentsImpl = function () {
        function PositionalArgumentsImpl() {
            _classCallCheck$24(this, PositionalArgumentsImpl);

            this.base = 0;
            this.length = 0;
            this.stack = null;
            this._tag = null;
            this._references = null;
        }

        PositionalArgumentsImpl.prototype.empty = function empty(stack, base) {
            this.stack = stack;
            this.base = base;
            this.length = 0;
            this._tag = reference.CONSTANT_TAG;
            this._references = util.EMPTY_ARRAY;
        };

        PositionalArgumentsImpl.prototype.setup = function setup(stack, base, length) {
            this.stack = stack;
            this.base = base;
            this.length = length;
            if (length === 0) {
                this._tag = reference.CONSTANT_TAG;
                this._references = util.EMPTY_ARRAY;
            } else {
                this._tag = null;
                this._references = null;
            }
        };

        PositionalArgumentsImpl.prototype.at = function at(position) {
            var base = this.base,
                length = this.length,
                stack = this.stack;

            if (position < 0 || position >= length) {
                return UNDEFINED_REFERENCE;
            }
            return stack.get(position, base);
        };

        PositionalArgumentsImpl.prototype.capture = function capture() {
            return new CapturedPositionalArgumentsImpl(this.tag, this.references);
        };

        PositionalArgumentsImpl.prototype.prepend = function prepend(other) {
            var additions = other.length;
            if (additions > 0) {
                var base = this.base,
                    length = this.length,
                    stack = this.stack;

                this.base = base = base - additions;
                this.length = length + additions;
                for (var i = 0; i < additions; i++) {
                    stack.set(other.at(i), i, base);
                }
                this._tag = null;
                this._references = null;
            }
        };

        _createClass$3(PositionalArgumentsImpl, [{
            key: 'tag',
            get: function get() {
                var tag = this._tag;
                if (!tag) {
                    tag = this._tag = reference.combineTagged(this.references);
                }
                return tag;
            }
        }, {
            key: 'references',
            get: function get() {
                var references = this._references;
                if (!references) {
                    var stack = this.stack,
                        base = this.base,
                        length = this.length;

                    references = this._references = stack.sliceArray(base, base + length);
                }
                return references;
            }
        }]);

        return PositionalArgumentsImpl;
    }();
    var CapturedPositionalArgumentsImpl = function () {
        function CapturedPositionalArgumentsImpl(tag, references) {
            var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : references.length;

            _classCallCheck$24(this, CapturedPositionalArgumentsImpl);

            this.tag = tag;
            this.references = references;
            this.length = length;
        }

        CapturedPositionalArgumentsImpl.empty = function empty() {
            return new CapturedPositionalArgumentsImpl(reference.CONSTANT_TAG, util.EMPTY_ARRAY, 0);
        };

        CapturedPositionalArgumentsImpl.prototype.at = function at(position) {
            return this.references[position];
        };

        CapturedPositionalArgumentsImpl.prototype.value = function value() {
            return this.references.map(this.valueOf);
        };

        CapturedPositionalArgumentsImpl.prototype.get = function get(name) {
            var references = this.references,
                length = this.length;

            if (name === 'length') {
                return PrimitiveReference.create(length);
            } else {
                var idx = parseInt(name, 10);
                if (idx < 0 || idx >= length) {
                    return UNDEFINED_REFERENCE;
                } else {
                    return references[idx];
                }
            }
        };

        CapturedPositionalArgumentsImpl.prototype.valueOf = function valueOf(reference$$1) {
            return reference$$1.value();
        };

        return CapturedPositionalArgumentsImpl;
    }();
    var NamedArgumentsImpl = function () {
        function NamedArgumentsImpl() {
            _classCallCheck$24(this, NamedArgumentsImpl);

            this.base = 0;
            this.length = 0;
            this._references = null;
            this._names = util.EMPTY_ARRAY;
            this._atNames = util.EMPTY_ARRAY;
        }

        NamedArgumentsImpl.prototype.empty = function empty(stack, base) {
            this.stack = stack;
            this.base = base;
            this.length = 0;
            this._references = util.EMPTY_ARRAY;
            this._names = util.EMPTY_ARRAY;
            this._atNames = util.EMPTY_ARRAY;
        };

        NamedArgumentsImpl.prototype.setup = function setup(stack, base, length, names, atNames) {
            this.stack = stack;
            this.base = base;
            this.length = length;
            if (length === 0) {
                this._references = util.EMPTY_ARRAY;
                this._names = util.EMPTY_ARRAY;
                this._atNames = util.EMPTY_ARRAY;
            } else {
                this._references = null;
                if (atNames) {
                    this._names = null;
                    this._atNames = names;
                } else {
                    this._names = names;
                    this._atNames = null;
                }
            }
        };

        NamedArgumentsImpl.prototype.has = function has(name) {
            return this.names.indexOf(name) !== -1;
        };

        NamedArgumentsImpl.prototype.get = function get(name) {
            var atNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var base = this.base,
                stack = this.stack;

            var names = atNames ? this.atNames : this.names;
            var idx = names.indexOf(name);
            if (idx === -1) {
                return UNDEFINED_REFERENCE;
            }
            return stack.get(idx, base);
        };

        NamedArgumentsImpl.prototype.capture = function capture() {
            return new CapturedNamedArgumentsImpl(this.tag, this.names, this.references);
        };

        NamedArgumentsImpl.prototype.merge = function merge(other) {
            var extras = other.length;

            if (extras > 0) {
                var names = this.names,
                    length = this.length,
                    stack = this.stack;
                var extraNames = other.names;

                if (Object.isFrozen(names) && names.length === 0) {
                    names = [];
                }
                for (var i = 0; i < extras; i++) {
                    var name = extraNames[i];
                    var idx = names.indexOf(name);
                    if (idx === -1) {
                        length = names.push(name);
                        stack.push(other.references[i]);
                    }
                }
                this.length = length;
                this._references = null;
                this._names = names;
                this._atNames = null;
            }
        };

        NamedArgumentsImpl.prototype.toSyntheticName = function toSyntheticName(name) {
            return name.slice(1);
        };

        NamedArgumentsImpl.prototype.toAtName = function toAtName(name) {
            return '@' + name;
        };

        _createClass$3(NamedArgumentsImpl, [{
            key: 'tag',
            get: function get() {
                return reference.combineTagged(this.references);
            }
        }, {
            key: 'names',
            get: function get() {
                var names = this._names;
                if (!names) {
                    names = this._names = this._atNames.map(this.toSyntheticName);
                }
                return names;
            }
        }, {
            key: 'atNames',
            get: function get() {
                var atNames = this._atNames;
                if (!atNames) {
                    atNames = this._atNames = this._names.map(this.toAtName);
                }
                return atNames;
            }
        }, {
            key: 'references',
            get: function get() {
                var references = this._references;
                if (!references) {
                    var base = this.base,
                        length = this.length,
                        stack = this.stack;

                    references = this._references = stack.sliceArray(base, base + length);
                }
                return references;
            }
        }]);

        return NamedArgumentsImpl;
    }();
    var CapturedNamedArgumentsImpl = function () {
        function CapturedNamedArgumentsImpl(tag, names, references) {
            _classCallCheck$24(this, CapturedNamedArgumentsImpl);

            this.tag = tag;
            this.names = names;
            this.references = references;
            this.length = names.length;
            this._map = null;
        }

        CapturedNamedArgumentsImpl.prototype.has = function has(name) {
            return this.names.indexOf(name) !== -1;
        };

        CapturedNamedArgumentsImpl.prototype.get = function get(name) {
            var names = this.names,
                references = this.references;

            var idx = names.indexOf(name);
            if (idx === -1) {
                return UNDEFINED_REFERENCE;
            } else {
                return references[idx];
            }
        };

        CapturedNamedArgumentsImpl.prototype.value = function value() {
            var names = this.names,
                references = this.references;

            var out = util.dict();
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                out[name] = references[i].value();
            }
            return out;
        };

        _createClass$3(CapturedNamedArgumentsImpl, [{
            key: 'map',
            get: function get() {
                var map = this._map;
                if (!map) {
                    var names = this.names,
                        references = this.references;

                    map = this._map = util.dict();
                    for (var i = 0; i < names.length; i++) {
                        var name = names[i];
                        map[name] = references[i];
                    }
                }
                return map;
            }
        }]);

        return CapturedNamedArgumentsImpl;
    }();
    var BlockArgumentsImpl = function () {
        function BlockArgumentsImpl() {
            _classCallCheck$24(this, BlockArgumentsImpl);

            this.internalValues = null;
            this.internalTag = null;
            this.names = util.EMPTY_ARRAY;
            this.length = 0;
            this.base = 0;
        }

        BlockArgumentsImpl.prototype.empty = function empty(stack, base) {
            this.stack = stack;
            this.names = util.EMPTY_ARRAY;
            this.base = base;
            this.length = 0;
            this.internalTag = reference.CONSTANT_TAG;
            this.internalValues = util.EMPTY_ARRAY;
        };

        BlockArgumentsImpl.prototype.setup = function setup(stack, base, length, names) {
            this.stack = stack;
            this.names = names;
            this.base = base;
            this.length = length;
            if (length === 0) {
                this.internalTag = reference.CONSTANT_TAG;
                this.internalValues = util.EMPTY_ARRAY;
            } else {
                this.internalTag = null;
                this.internalValues = null;
            }
        };

        BlockArgumentsImpl.prototype.has = function has(name) {
            return this.names.indexOf(name) !== -1;
        };

        BlockArgumentsImpl.prototype.get = function get(name) {
            var base = this.base,
                stack = this.stack,
                names = this.names;

            var idx = names.indexOf(name);
            if (names.indexOf(name) === -1) {
                return null;
            }
            var table = stack.get(idx * 3, base);
            var scope = stack.get(idx * 3 + 1, base);
            var handle = stack.get(idx * 3 + 2, base);
            return handle === null ? null : [handle, scope, table];
        };

        BlockArgumentsImpl.prototype.capture = function capture() {
            return new CapturedBlockArgumentsImpl(this.names, this.values);
        };

        _createClass$3(BlockArgumentsImpl, [{
            key: 'values',
            get: function get() {
                var values = this.internalValues;
                if (!values) {
                    var base = this.base,
                        length = this.length,
                        stack = this.stack;

                    values = this.internalValues = stack.sliceArray(base, base + length * 3);
                }
                return values;
            }
        }]);

        return BlockArgumentsImpl;
    }();

    var CapturedBlockArgumentsImpl = function () {
        function CapturedBlockArgumentsImpl(names, values) {
            _classCallCheck$24(this, CapturedBlockArgumentsImpl);

            this.names = names;
            this.values = values;
            this.length = names.length;
        }

        CapturedBlockArgumentsImpl.prototype.has = function has(name) {
            return this.names.indexOf(name) !== -1;
        };

        CapturedBlockArgumentsImpl.prototype.get = function get(name) {
            var idx = this.names.indexOf(name);
            if (idx === -1) return null;
            return [this.values[idx * 3 + 2], this.values[idx * 3 + 1], this.values[idx * 3]];
        };

        return CapturedBlockArgumentsImpl;
    }();

    var CapturedArgumentsImpl = function () {
        function CapturedArgumentsImpl(tag, positional, named, length) {
            _classCallCheck$24(this, CapturedArgumentsImpl);

            this.tag = tag;
            this.positional = positional;
            this.named = named;
            this.length = length;
        }

        CapturedArgumentsImpl.prototype.value = function value() {
            return {
                named: this.named.value(),
                positional: this.positional.value()
            };
        };

        return CapturedArgumentsImpl;
    }();
    var EMPTY_NAMED = new CapturedNamedArgumentsImpl(reference.CONSTANT_TAG, util.EMPTY_ARRAY, util.EMPTY_ARRAY);
    var EMPTY_POSITIONAL = new CapturedPositionalArgumentsImpl(reference.CONSTANT_TAG, util.EMPTY_ARRAY);
    var EMPTY_ARGS = new CapturedArgumentsImpl(reference.CONSTANT_TAG, EMPTY_POSITIONAL, EMPTY_NAMED, 0);

    function _classCallCheck$25(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function initializeRegistersWithSP(sp) {
        return [0, -1, sp, 0];
    }

    var LowLevelVM = function () {
        function LowLevelVM(stack, heap, program$$1, externs, registers) {
            _classCallCheck$25(this, LowLevelVM);

            this.stack = stack;
            this.heap = heap;
            this.program = program$$1;
            this.externs = externs;
            this.registers = registers;
            this.currentOpSize = 0;
        }

        LowLevelVM.prototype.fetchRegister = function fetchRegister(register) {
            return this.registers[register];
        };

        LowLevelVM.prototype.loadRegister = function loadRegister(register, value) {
            this.registers[register] = value;
        };

        LowLevelVM.prototype.setPc = function setPc(pc) {

            this.registers[vm.$pc] = pc;
        };
        // Start a new frame and save $ra and $fp on the stack


        LowLevelVM.prototype.pushFrame = function pushFrame() {
            this.stack.push(this.registers[vm.$ra]);
            this.stack.push(this.registers[vm.$fp]);
            this.registers[vm.$fp] = this.registers[vm.$sp] - 1;
        };
        // Restore $ra, $sp and $fp


        LowLevelVM.prototype.popFrame = function popFrame() {
            this.registers[vm.$sp] = this.registers[vm.$fp] - 1;
            this.registers[vm.$ra] = this.stack.get(0);
            this.registers[vm.$fp] = this.stack.get(1);
        };

        LowLevelVM.prototype.pushSmallFrame = function pushSmallFrame() {
            this.stack.push(this.registers[vm.$ra]);
        };

        LowLevelVM.prototype.popSmallFrame = function popSmallFrame() {
            this.registers[vm.$ra] = this.stack.pop();
        };
        // Jump to an address in `program`


        LowLevelVM.prototype.goto = function goto(offset) {
            this.setPc(this.target(offset));
        };

        LowLevelVM.prototype.target = function target(offset) {
            return this.registers[vm.$pc] + offset - this.currentOpSize;
        };
        // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)


        LowLevelVM.prototype.call = function call(handle) {

            this.registers[vm.$ra] = this.registers[vm.$pc];
            this.setPc(this.heap.getaddr(handle));
        };
        // Put a specific `program` address in $ra


        LowLevelVM.prototype.returnTo = function returnTo(offset) {
            this.registers[vm.$ra] = this.target(offset);
        };
        // Return to the `program` address stored in $ra


        LowLevelVM.prototype.return = function _return() {
            this.setPc(this.registers[vm.$ra]);
        };

        LowLevelVM.prototype.nextStatement = function nextStatement() {
            var registers = this.registers,
                program$$1 = this.program;

            var pc = registers[vm.$pc];

            if (pc === -1) {
                return null;
            }
            // We have to save off the current operations size so that
            // when we do a jump we can calculate the correct offset
            // to where we are going. We can't simply ask for the size
            // in a jump because we have have already incremented the
            // program counter to the next instruction prior to executing.
            var opcode = program$$1.opcode(pc);
            var operationSize = this.currentOpSize = opcode.size;
            this.registers[vm.$pc] += operationSize;
            return opcode;
        };

        LowLevelVM.prototype.evaluateOuter = function evaluateOuter(opcode, vm$$1) {
            {
                this.evaluateInner(opcode, vm$$1);
            }
        };

        LowLevelVM.prototype.evaluateInner = function evaluateInner(opcode, vm$$1) {
            if (opcode.isMachine) {
                this.evaluateMachine(opcode);
            } else {
                this.evaluateSyscall(opcode, vm$$1);
            }
        };

        LowLevelVM.prototype.evaluateMachine = function evaluateMachine(opcode) {
            switch (opcode.type) {
                case 0 /* PushFrame */:
                    return this.pushFrame();
                case 1 /* PopFrame */:
                    return this.popFrame();
                case 3 /* InvokeStatic */:
                    return this.call(opcode.op1);
                case 2 /* InvokeVirtual */:
                    return this.call(this.stack.pop());
                case 4 /* Jump */:
                    return this.goto(opcode.op1);
                case 5 /* Return */:
                    return this.return();
                case 6 /* ReturnTo */:
                    return this.returnTo(opcode.op1);
            }
        };

        LowLevelVM.prototype.evaluateSyscall = function evaluateSyscall(opcode, vm$$1) {
            APPEND_OPCODES.evaluate(vm$$1, opcode, opcode.type);
        };

        return LowLevelVM;
    }();

    function _defaults$14(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _possibleConstructorReturn$14(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$14(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$14(subClass, superClass); }

    function _classCallCheck$26(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var UpdatingVM = function () {
        function UpdatingVM(env, _ref) {
            var _ref$alwaysRevalidate = _ref.alwaysRevalidate,
                alwaysRevalidate = _ref$alwaysRevalidate === undefined ? false : _ref$alwaysRevalidate;

            _classCallCheck$26(this, UpdatingVM);

            this.frameStack = new util.Stack();
            this.env = env;
            this.dom = env.getDOM();
            this.alwaysRevalidate = alwaysRevalidate;
        }

        UpdatingVM.prototype.execute = function execute(opcodes, handler) {
            var frameStack = this.frameStack;

            this.try(opcodes, handler);
            while (true) {
                if (frameStack.isEmpty()) break;
                var opcode = this.frame.nextStatement();
                if (opcode === null) {
                    frameStack.pop();
                    continue;
                }
                opcode.evaluate(this);
            }
        };

        UpdatingVM.prototype.goto = function goto(op) {
            this.frame.goto(op);
        };

        UpdatingVM.prototype.try = function _try(ops, handler) {
            this.frameStack.push(new UpdatingVMFrame(ops, handler));
        };

        UpdatingVM.prototype.throw = function _throw() {
            this.frame.handleException();
            this.frameStack.pop();
        };

        _createClass$4(UpdatingVM, [{
            key: 'frame',
            get: function get() {
                return this.frameStack.current;
            }
        }]);

        return UpdatingVM;
    }();

    var ResumableVMStateImpl = function () {
        function ResumableVMStateImpl(state, resumeCallback) {
            _classCallCheck$26(this, ResumableVMStateImpl);

            this.state = state;
            this.resumeCallback = resumeCallback;
        }

        ResumableVMStateImpl.prototype.resume = function resume(runtime, builder) {
            return this.resumeCallback(runtime, this.state, builder);
        };

        return ResumableVMStateImpl;
    }();
    var BlockOpcode = function (_UpdatingOpcode) {
        _inherits$14(BlockOpcode, _UpdatingOpcode);

        function BlockOpcode(state, runtime, bounds, children) {
            _classCallCheck$26(this, BlockOpcode);

            var _this = _possibleConstructorReturn$14(this, _UpdatingOpcode.call(this));

            _this.state = state;
            _this.runtime = runtime;
            _this.type = 'block';
            _this.next = null;
            _this.prev = null;
            _this.children = children;
            _this.bounds = bounds;
            return _this;
        }

        BlockOpcode.prototype.parentElement = function parentElement() {
            return this.bounds.parentElement();
        };

        BlockOpcode.prototype.firstNode = function firstNode() {
            return this.bounds.firstNode();
        };

        BlockOpcode.prototype.lastNode = function lastNode() {
            return this.bounds.lastNode();
        };

        BlockOpcode.prototype.evaluate = function evaluate(vm$$1) {
            vm$$1.try(this.children, null);
        };

        return BlockOpcode;
    }(UpdatingOpcode);
    var TryOpcode = function (_BlockOpcode) {
        _inherits$14(TryOpcode, _BlockOpcode);

        function TryOpcode(state, runtime, bounds, children) {
            _classCallCheck$26(this, TryOpcode);

            var _this2 = _possibleConstructorReturn$14(this, _BlockOpcode.call(this, state, runtime, bounds, children));

            _this2.type = 'try';
            _this2.tag = _this2._tag = reference.createUpdatableTag();
            return _this2;
        }

        TryOpcode.prototype.didInitializeChildren = function didInitializeChildren() {
            reference.update(this._tag, reference.combineSlice(this.children));
        };

        TryOpcode.prototype.evaluate = function evaluate(vm$$1) {
            vm$$1.try(this.children, this);
        };

        TryOpcode.prototype.handleException = function handleException() {
            var _this3 = this;

            var state = this.state,
                bounds = this.bounds,
                children = this.children,
                prev = this.prev,
                next = this.next,
                runtime = this.runtime;

            children.clear();
            asyncReset(this, runtime.env);
            var elementStack = NewElementBuilder.resume(runtime.env, bounds);
            var vm$$1 = state.resume(runtime, elementStack);
            var updating = new util.LinkedList();
            var result = vm$$1.execute(function (vm$$1) {
                vm$$1.pushUpdating(updating);
                vm$$1.updateWith(_this3);
                vm$$1.pushUpdating(children);
            });
            util.associate(this, result.drop);
            this.prev = prev;
            this.next = next;
        };

        return TryOpcode;
    }(BlockOpcode);

    var ListRevalidationDelegate = function () {
        function ListRevalidationDelegate(opcode, marker) {
            _classCallCheck$26(this, ListRevalidationDelegate);

            this.opcode = opcode;
            this.marker = marker;
            this.didInsert = false;
            this.didDelete = false;
            this.map = opcode.map;
            this.updating = opcode['children'];
        }

        ListRevalidationDelegate.prototype.insert = function insert(_env, key, item, memo, before) {
            var map = this.map,
                opcode = this.opcode,
                updating = this.updating;

            var nextSibling = null;
            var reference$$1 = null;
            if (typeof before === 'string') {
                reference$$1 = map.get(before);
                nextSibling = reference$$1['bounds'].firstNode();
            } else {
                nextSibling = this.marker;
            }
            var vm$$1 = opcode.vmForInsertion(nextSibling);
            var tryOpcode = null;
            vm$$1.execute(function (vm$$1) {
                tryOpcode = vm$$1.iterate(memo, item);
                map.set(key, tryOpcode);
                vm$$1.pushUpdating(new util.LinkedList());
                vm$$1.updateWith(tryOpcode);
                vm$$1.pushUpdating(tryOpcode.children);
            });
            updating.insertBefore(tryOpcode, reference$$1);
            this.didInsert = true;
        };

        ListRevalidationDelegate.prototype.retain = function retain(_env, _key, _item, _memo) {};

        ListRevalidationDelegate.prototype.move = function move$$1(_env, key, _item, _memo, before) {
            var map = this.map,
                updating = this.updating;

            var entry = map.get(key);
            if (before === reference.END) {
                move(entry, this.marker);
                updating.remove(entry);
                updating.append(entry);
            } else {
                var reference$$1 = map.get(before);
                move(entry, reference$$1.firstNode());
                updating.remove(entry);
                updating.insertBefore(entry, reference$$1);
            }
        };

        ListRevalidationDelegate.prototype.delete = function _delete(env, key) {
            var map = this.map,
                updating = this.updating;

            var opcode = map.get(key);
            detach(opcode, env);
            updating.remove(opcode);
            map.delete(key);
            this.didDelete = true;
        };

        ListRevalidationDelegate.prototype.done = function done() {
            this.opcode.didInitializeChildren(this.didInsert || this.didDelete);
        };

        return ListRevalidationDelegate;
    }();

    var ListBlockOpcode = function (_BlockOpcode2) {
        _inherits$14(ListBlockOpcode, _BlockOpcode2);

        function ListBlockOpcode(state, runtime, bounds, children, artifacts) {
            _classCallCheck$26(this, ListBlockOpcode);

            var _this4 = _possibleConstructorReturn$14(this, _BlockOpcode2.call(this, state, runtime, bounds, children));

            _this4.type = 'list-block';
            _this4.map = new Map();
            _this4.lastIterated = reference.INITIAL;
            _this4.artifacts = artifacts;
            var _tag = _this4._tag = reference.createUpdatableTag();
            _this4.tag = reference.combine([artifacts.tag, _tag]);
            return _this4;
        }

        ListBlockOpcode.prototype.didInitializeChildren = function didInitializeChildren() {
            var listDidChange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            this.lastIterated = reference.value(this.artifacts.tag);
            if (listDidChange) {
                reference.update(this._tag, reference.combineSlice(this.children));
            }
        };

        ListBlockOpcode.prototype.evaluate = function evaluate(vm$$1) {
            var artifacts = this.artifacts,
                lastIterated = this.lastIterated;

            if (!reference.validate(artifacts.tag, lastIterated)) {
                var bounds = this.bounds;
                var dom = vm$$1.dom;

                var marker = dom.createComment('');
                dom.insertAfter(bounds.parentElement(), marker, bounds.lastNode());
                var target = new ListRevalidationDelegate(this, marker);
                var synchronizer = new reference.IteratorSynchronizer({ target: target, artifacts: artifacts, env: vm$$1.env });
                synchronizer.sync();
                this.parentElement().removeChild(marker);
            }
            // Run now-updated updating opcodes
            _BlockOpcode2.prototype.evaluate.call(this, vm$$1);
        };

        ListBlockOpcode.prototype.vmForInsertion = function vmForInsertion(nextSibling) {
            var bounds = this.bounds,
                state = this.state,
                runtime = this.runtime;

            var elementStack = NewElementBuilder.forInitialRender(runtime.env, {
                element: bounds.parentElement(),
                nextSibling: nextSibling
            });
            return state.resume(runtime, elementStack);
        };

        return ListBlockOpcode;
    }(BlockOpcode);

    var UpdatingVMFrame = function () {
        function UpdatingVMFrame(ops, exceptionHandler) {
            _classCallCheck$26(this, UpdatingVMFrame);

            this.ops = ops;
            this.exceptionHandler = exceptionHandler;
            this.current = ops.head();
        }

        UpdatingVMFrame.prototype.goto = function goto(op) {
            this.current = op;
        };

        UpdatingVMFrame.prototype.nextStatement = function nextStatement() {
            var current = this.current,
                ops = this.ops;

            if (current) this.current = ops.nextNode(current);
            return current;
        };

        UpdatingVMFrame.prototype.handleException = function handleException() {
            if (this.exceptionHandler) {
                this.exceptionHandler.handleException();
            }
        };

        return UpdatingVMFrame;
    }();

    function _classCallCheck$27(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var RenderResultImpl = function () {
        function RenderResultImpl(env, updating, bounds, drop) {
            _classCallCheck$27(this, RenderResultImpl);

            this.env = env;
            this.updating = updating;
            this.bounds = bounds;
            this.drop = drop;
            util.associate(this, drop);
        }

        RenderResultImpl.prototype.rerender = function rerender() {
            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { alwaysRevalidate: false },
                _ref$alwaysRevalidate = _ref.alwaysRevalidate,
                alwaysRevalidate = _ref$alwaysRevalidate === undefined ? false : _ref$alwaysRevalidate;

            var env = this.env,
                updating = this.updating;

            var vm$$1 = new UpdatingVM(env, { alwaysRevalidate: alwaysRevalidate });
            vm$$1.execute(updating, this);
        };

        RenderResultImpl.prototype.parentElement = function parentElement() {
            return this.bounds.parentElement();
        };

        RenderResultImpl.prototype.firstNode = function firstNode() {
            return this.bounds.firstNode();
        };

        RenderResultImpl.prototype.lastNode = function lastNode() {
            return this.bounds.lastNode();
        };

        RenderResultImpl.prototype.handleException = function handleException() {
            throw 'this should never happen';
        };

        RenderResultImpl.prototype[util.DESTROY] = function () {
            clear(this.bounds);
        };
        // compat, as this is a user-exposed API


        RenderResultImpl.prototype.destroy = function destroy() {
            var _this = this;

            inTransaction(this.env, function () {
                return asyncDestroy(_this, _this.env);
            });
        };

        return RenderResultImpl;
    }();

    var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$28(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    var MAX_SMI = 0xfffffff;
    var InnerStack = function () {
        function InnerStack() {
            var inner = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new lowLevel.Stack();
            var js = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            _classCallCheck$28(this, InnerStack);

            this.inner = inner;
            this.js = js;
        }

        InnerStack.prototype.slice = function slice(start, end) {
            var inner = void 0;
            if (typeof start === 'number' && typeof end === 'number') {
                inner = this.inner.slice(start, end);
            } else if (typeof start === 'number' && end === undefined) {
                inner = this.inner.sliceFrom(start);
            } else {
                inner = this.inner.clone();
            }
            return new InnerStack(inner, this.js.slice(start, end));
        };

        InnerStack.prototype.sliceInner = function sliceInner(start, end) {
            var out = [];
            for (var i = start; i < end; i++) {
                out.push(this.get(i));
            }
            return out;
        };

        InnerStack.prototype.copy = function copy(from, to) {
            this.inner.copy(from, to);
        };

        InnerStack.prototype.write = function write(pos, value) {
            if (isImmediate(value)) {
                this.writeRaw(pos, encodeImmediate(value));
            } else {
                this.writeJs(pos, value);
            }
        };

        InnerStack.prototype.writeJs = function writeJs(pos, value) {
            var idx = this.js.length;
            this.js.push(value);
            this.inner.writeRaw(pos, ~idx);
        };

        InnerStack.prototype.writeRaw = function writeRaw(pos, value) {
            this.inner.writeRaw(pos, value);
        };

        InnerStack.prototype.get = function get(pos) {
            var value = this.inner.getRaw(pos);
            if (value < 0) {
                return this.js[~value];
            } else {
                return decodeImmediate(value);
            }
        };

        InnerStack.prototype.reset = function reset() {
            this.inner.reset();
            this.js.length = 0;
        };

        _createClass$5(InnerStack, [{
            key: 'length',
            get: function get() {
                return this.inner.len();
            }
        }]);

        return InnerStack;
    }();

    var EvaluationStackImpl = function () {
        // fp -> sp
        function EvaluationStackImpl(stack, registers) {
            _classCallCheck$28(this, EvaluationStackImpl);

            this.stack = stack;
            this[REGISTERS] = registers;
        }

        EvaluationStackImpl.restore = function restore(snapshot) {
            var stack = new InnerStack();
            for (var i = 0; i < snapshot.length; i++) {
                stack.write(i, snapshot[i]);
            }
            return new this(stack, initializeRegistersWithSP(snapshot.length - 1));
        };

        EvaluationStackImpl.prototype.push = function push(value) {
            this.stack.write(++this[REGISTERS][vm.$sp], value);
        };

        EvaluationStackImpl.prototype.pushRaw = function pushRaw(value) {
            this.stack.writeRaw(++this[REGISTERS][vm.$sp], value);
        };

        EvaluationStackImpl.prototype.pushNull = function pushNull() {
            this.stack.write(++this[REGISTERS][vm.$sp], null);
        };

        EvaluationStackImpl.prototype.dup = function dup() {
            var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this[REGISTERS][vm.$sp];

            this.stack.copy(position, ++this[REGISTERS][vm.$sp]);
        };

        EvaluationStackImpl.prototype.copy = function copy(from, to) {
            this.stack.copy(from, to);
        };

        EvaluationStackImpl.prototype.pop = function pop() {
            var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            var top = this.stack.get(this[REGISTERS][vm.$sp]);
            this[REGISTERS][vm.$sp] -= n;
            return top;
        };

        EvaluationStackImpl.prototype.peek = function peek() {
            var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            return this.stack.get(this[REGISTERS][vm.$sp] - offset);
        };

        EvaluationStackImpl.prototype.get = function get(offset) {
            var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[REGISTERS][vm.$fp];

            return this.stack.get(base + offset);
        };

        EvaluationStackImpl.prototype.set = function set(value, offset) {
            var base = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this[REGISTERS][vm.$fp];

            this.stack.write(base + offset, value);
        };

        EvaluationStackImpl.prototype.slice = function slice(start, end) {
            return this.stack.slice(start, end);
        };

        EvaluationStackImpl.prototype.sliceArray = function sliceArray(start, end) {
            return this.stack.sliceInner(start, end);
        };

        EvaluationStackImpl.prototype.capture = function capture(items) {
            var end = this[REGISTERS][vm.$sp] + 1;
            var start = end - items;
            return this.stack.sliceInner(start, end);
        };

        EvaluationStackImpl.prototype.reset = function reset() {
            this.stack.reset();
        };

        EvaluationStackImpl.prototype.toArray = function toArray() {
            console.log(this[REGISTERS]);
            return this.stack.sliceInner(this[REGISTERS][vm.$fp], this[REGISTERS][vm.$sp] + 1);
        };

        return EvaluationStackImpl;
    }();

    function isImmediate(value) {
        var type = typeof value;
        if (value === null || value === undefined) return true;
        switch (type) {
            case 'boolean':
            case 'undefined':
                return true;
            case 'number':
                // not an integer
                if (value % 1 !== 0) return false;
                var abs = Math.abs(value);
                // too big
                if (abs > MAX_SMI) return false;
                return true;
            default:
                return false;
        }
    }
    function encodeSmi(primitive) {
        if (primitive < 0) {
            return Math.abs(primitive) << 3 | 4 /* NEGATIVE */;
        } else {
            return primitive << 3 | 0 /* NUMBER */;
        }
    }
    function encodeImmediate(primitive) {
        switch (typeof primitive) {
            case 'number':
                return encodeSmi(primitive);
            case 'boolean':
                return primitive ? 11 /* True */ : 3 /* False */;
            case 'object':
                // assume null
                return 19 /* Null */;
            case 'undefined':
                return 27 /* Undef */;
            default:
                throw util.unreachable();
        }
    }
    function decodeSmi(smi) {
        switch (smi & 7) {
            case 0 /* NUMBER */:
                return smi >> 3;
            case 4 /* NEGATIVE */:
                return -(smi >> 3);
            default:
                throw util.unreachable();
        }
    }
    function decodeImmediate(immediate) {
        switch (immediate) {
            case 3 /* False */:
                return false;
            case 11 /* True */:
                return true;
            case 19 /* Null */:
                return null;
            case 27 /* Undef */:
                return undefined;
            default:
                return decodeSmi(immediate);
        }
    }

    function _defaults$15(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    var _createClass$6 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _possibleConstructorReturn$15(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$15(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$15(subClass, superClass); }

    function _classCallCheck$29(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var _a$3, _b;

    var Stacks = function Stacks() {
        _classCallCheck$29(this, Stacks);

        this.scope = new util.Stack();
        this.dynamicScope = new util.Stack();
        this.updating = new util.Stack();
        this.cache = new util.Stack();
        this.list = new util.Stack();
    };

    var VM = function () {
        /**
         * End of migrated.
         */
        function VM(runtime, _ref, elementStack) {
            var _this = this;

            var pc = _ref.pc,
                scope = _ref.scope,
                dynamicScope = _ref.dynamicScope,
                stack = _ref.stack;

            _classCallCheck$29(this, VM);

            this.runtime = runtime;
            this.elementStack = elementStack;
            this[_a$3] = new Stacks();
            this[_b] = new util.Stack();
            this.s0 = null;
            this.s1 = null;
            this.t0 = null;
            this.t1 = null;
            this.v0 = null;
            var evalStack = EvaluationStackImpl.restore(stack);

            evalStack[REGISTERS][vm.$pc] = pc;
            evalStack[REGISTERS][vm.$sp] = stack.length - 1;
            evalStack[REGISTERS][vm.$fp] = -1;
            this[HEAP] = this.program.heap;
            this[CONSTANTS] = this.program.constants;
            this.elementStack = elementStack;
            this[STACKS].scope.push(scope);
            this[STACKS].dynamicScope.push(dynamicScope);
            this[ARGS] = new VMArgumentsImpl();
            this[INNER_VM] = new LowLevelVM(evalStack, this[HEAP], runtime.program, {
                debugBefore: function debugBefore(opcode) {
                    return APPEND_OPCODES.debugBefore(_this, opcode);
                },
                debugAfter: function debugAfter(state) {
                    APPEND_OPCODES.debugAfter(_this, state);
                }
            }, evalStack[REGISTERS]);
            this.destructor = {};
            this[DESTRUCTOR_STACK].push(this.destructor);
        }

        VM.prototype.currentBlock = function currentBlock() {
            return this.elements().block();
        };
        /* Registers */


        // Fetch a value from a register onto the stack
        VM.prototype.fetch = function fetch(register) {
            this.stack.push(this.fetchValue(register));
        };
        // Load a value from the stack into a register


        VM.prototype.load = function load(register) {
            var value = this.stack.pop();
            this.loadValue(register, value);
        };

        VM.prototype.fetchValue = function fetchValue(register) {
            if (vm.isLowLevelRegister(register)) {
                return this[INNER_VM].fetchRegister(register);
            }
            switch (register) {
                case vm.$s0:
                    return this.s0;
                case vm.$s1:
                    return this.s1;
                case vm.$t0:
                    return this.t0;
                case vm.$t1:
                    return this.t1;
                case vm.$v0:
                    return this.v0;
            }
        };
        // Load a value into a register


        VM.prototype.loadValue = function loadValue(register, value) {
            if (vm.isLowLevelRegister(register)) {
                this[INNER_VM].loadRegister(register, value);
            }
            switch (register) {
                case vm.$s0:
                    this.s0 = value;
                    break;
                case vm.$s1:
                    this.s1 = value;
                    break;
                case vm.$t0:
                    this.t0 = value;
                    break;
                case vm.$t1:
                    this.t1 = value;
                    break;
                case vm.$v0:
                    this.v0 = value;
                    break;
            }
        };
        /**
         * Migrated to Inner
         */
        // Start a new frame and save $ra and $fp on the stack


        VM.prototype.pushFrame = function pushFrame() {
            this[INNER_VM].pushFrame();
        };
        // Restore $ra, $sp and $fp


        VM.prototype.popFrame = function popFrame() {
            this[INNER_VM].popFrame();
        };
        // Jump to an address in `program`


        VM.prototype.goto = function goto(offset) {
            this[INNER_VM].goto(offset);
        };
        // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)


        VM.prototype.call = function call(handle) {
            this[INNER_VM].call(handle);
        };
        // Put a specific `program` address in $ra


        VM.prototype.returnTo = function returnTo(offset) {
            this[INNER_VM].returnTo(offset);
        };
        // Return to the `program` address stored in $ra


        VM.prototype.return = function _return() {
            this[INNER_VM].return();
        };

        VM.prototype.captureState = function captureState(args) {
            var pc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[INNER_VM].fetchRegister(vm.$pc);

            return {
                pc: pc,
                dynamicScope: this.dynamicScope(),
                scope: this.scope(),
                stack: this.stack.capture(args)
            };
        };

        VM.prototype.beginCacheGroup = function beginCacheGroup() {
            this[STACKS].cache.push(this.updating().tail());
        };

        VM.prototype.commitCacheGroup = function commitCacheGroup() {
            var END = new LabelOpcode('END');
            var opcodes = this.updating();
            var marker = this[STACKS].cache.pop();
            var head = marker ? opcodes.nextNode(marker) : opcodes.head();
            var tail = opcodes.tail();
            var tag = reference.combineSlice(new util.ListSlice(head, tail));
            var guard = new JumpIfNotModifiedOpcode(tag, END);
            opcodes.insertBefore(guard, head);
            opcodes.append(new DidModifyOpcode(guard));
            opcodes.append(END);
        };

        VM.prototype.enter = function enter(args) {
            var updating = new util.LinkedList();
            var state = this.capture(args);
            var block = this.elements().pushUpdatableBlock();
            var tryOpcode = new TryOpcode(state, this.runtime, block, updating);
            this.didEnter(tryOpcode);
        };

        VM.prototype.iterate = function iterate(memo, value) {
            var stack = this.stack;
            stack.push(value);
            stack.push(memo);
            var state = this.capture(2);
            var block = this.elements().pushUpdatableBlock();
            // let ip = this.ip;
            // this.ip = end + 4;
            // this.frames.push(ip);
            return new TryOpcode(state, this.runtime, block, new util.LinkedList());
        };

        VM.prototype.enterItem = function enterItem(key, opcode) {
            this.listBlock().map.set(key, opcode);
            this.didEnter(opcode);
        };

        VM.prototype.enterList = function enterList(offset) {
            var updating = new util.LinkedList();
            var addr = this[INNER_VM].target(offset);
            var state = this.capture(0, addr);
            var list = this.elements().pushBlockList(updating);
            var artifacts = this.stack.peek().artifacts;
            var opcode = new ListBlockOpcode(state, this.runtime, list, updating, artifacts);
            this[STACKS].list.push(opcode);
            this.didEnter(opcode);
        };

        VM.prototype.didEnter = function didEnter(opcode) {
            this.associateDestructor(util.destructor(opcode));
            this[DESTRUCTOR_STACK].push(opcode);
            this.updateWith(opcode);
            this.pushUpdating(opcode.children);
        };

        VM.prototype.exit = function exit() {
            this[DESTRUCTOR_STACK].pop();
            this.elements().popBlock();
            this.popUpdating();
            var parent = this.updating().tail();
            parent.didInitializeChildren();
        };

        VM.prototype.exitList = function exitList() {
            this.exit();
            this[STACKS].list.pop();
        };

        VM.prototype.pushUpdating = function pushUpdating() {
            var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new util.LinkedList();

            this[STACKS].updating.push(list);
        };

        VM.prototype.popUpdating = function popUpdating() {
            return this[STACKS].updating.pop();
        };

        VM.prototype.updateWith = function updateWith(opcode) {
            this.updating().append(opcode);
        };

        VM.prototype.listBlock = function listBlock() {
            return this[STACKS].list.current;
        };

        VM.prototype.associateDestructor = function associateDestructor(child) {
            if (!util.isDrop(child)) return;
            var parent = this[DESTRUCTOR_STACK].current;
            util.associateDestructor(parent, child);
        };

        VM.prototype.associateDestroyable = function associateDestroyable(child) {
            this.associateDestructor(util.destructor(child));
        };

        VM.prototype.tryUpdating = function tryUpdating() {
            return this[STACKS].updating.current;
        };

        VM.prototype.updating = function updating() {
            return this[STACKS].updating.current;
        };

        VM.prototype.elements = function elements() {
            return this.elementStack;
        };

        VM.prototype.scope = function scope() {
            return this[STACKS].scope.current;
        };

        VM.prototype.dynamicScope = function dynamicScope() {
            return this[STACKS].dynamicScope.current;
        };

        VM.prototype.pushChildScope = function pushChildScope() {
            this[STACKS].scope.push(this.scope().child());
        };

        VM.prototype.pushDynamicScope = function pushDynamicScope() {
            var child = this.dynamicScope().child();
            this[STACKS].dynamicScope.push(child);
            return child;
        };

        VM.prototype.pushRootScope = function pushRootScope(size) {
            var scope = ScopeImpl.sized(size);
            this[STACKS].scope.push(scope);
            return scope;
        };

        VM.prototype.pushScope = function pushScope(scope) {
            this[STACKS].scope.push(scope);
        };

        VM.prototype.popScope = function popScope() {
            this[STACKS].scope.pop();
        };

        VM.prototype.popDynamicScope = function popDynamicScope() {
            this[STACKS].dynamicScope.pop();
        };
        /// SCOPE HELPERS


        VM.prototype.getSelf = function getSelf() {
            return this.scope().getSelf();
        };

        VM.prototype.referenceForSymbol = function referenceForSymbol(symbol) {
            return this.scope().getSymbol(symbol);
        };
        /// EXECUTION


        VM.prototype.execute = function execute(initialize) {
            if (initialize) initialize(this);
            var result = void 0;
            while (true) {
                result = this.next();
                if (result.done) break;
            }
            return result.value;
        };

        VM.prototype.next = function next() {
            var env = this.env,
                elementStack = this.elementStack;

            var opcode = this[INNER_VM].nextStatement();
            var result = void 0;
            if (opcode !== null) {
                this[INNER_VM].evaluateOuter(opcode, this);
                result = { done: false, value: null };
            } else {
                // Unload the stack
                this.stack.reset();
                result = {
                    done: true,
                    value: new RenderResultImpl(env, this.popUpdating(), elementStack.popBlock(), this.destructor)
                };
            }
            return result;
        };

        VM.prototype.bindDynamicScope = function bindDynamicScope(names) {
            var scope = this.dynamicScope();
            for (var i = names.length - 1; i >= 0; i--) {
                var name = this[CONSTANTS].getString(names[i]);
                scope.set(name, this.stack.pop());
            }
        };

        _createClass$6(VM, [{
            key: 'stack',
            get: function get() {
                return this[INNER_VM].stack;
            }
        }, {
            key: 'pc',
            get: function get() {
                return this[INNER_VM].fetchRegister(vm.$pc);
            }
        }, {
            key: 'program',
            get: function get() {
                return this.runtime.program;
            }
        }, {
            key: 'env',
            get: function get() {
                return this.runtime.env;
            }
        }]);

        return VM;
    }();

    _a$3 = STACKS, _b = DESTRUCTOR_STACK;
    function vmState(pc) {
        var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ScopeImpl.root(UNDEFINED_REFERENCE, 0);
        var dynamicScope = arguments[2];

        return {
            pc: pc,
            scope: scope,
            dynamicScope: dynamicScope,
            stack: []
        };
    }
    var AotVM = function (_VM) {
        _inherits$15(AotVM, _VM);

        function AotVM() {
            _classCallCheck$29(this, AotVM);

            return _possibleConstructorReturn$15(this, _VM.apply(this, arguments));
        }

        AotVM.empty = function empty(runtime, _ref2) {
            var handle = _ref2.handle,
                treeBuilder = _ref2.treeBuilder,
                dynamicScope = _ref2.dynamicScope;

            var vm$$1 = initAOT(runtime, vmState(runtime.program.heap.getaddr(handle), ScopeImpl.root(UNDEFINED_REFERENCE, 0), dynamicScope), treeBuilder);
            vm$$1.pushUpdating();
            return vm$$1;
        };

        AotVM.initial = function initial(runtime, _ref3) {
            var handle = _ref3.handle,
                self = _ref3.self,
                treeBuilder = _ref3.treeBuilder,
                dynamicScope = _ref3.dynamicScope;

            var scopeSize = runtime.program.heap.scopesizeof(handle);
            var scope = ScopeImpl.root(self, scopeSize);
            var pc = runtime.program.heap.getaddr(handle);
            var state = vmState(pc, scope, dynamicScope);
            var vm$$1 = initAOT(runtime, state, treeBuilder);
            vm$$1.pushUpdating();
            return vm$$1;
        };

        AotVM.prototype.capture = function capture(args) {
            var pc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[INNER_VM].fetchRegister(vm.$pc);

            return new ResumableVMStateImpl(this.captureState(args, pc), initAOT);
        };

        return AotVM;
    }(VM);
    function initAOT(runtime, state, builder) {
        return new AotVM(runtime, state, builder);
    }
    function initJIT(context) {
        return function (runtime, state, builder) {
            return new JitVM(runtime, state, builder, context);
        };
    }
    var JitVM = function (_VM2) {
        _inherits$15(JitVM, _VM2);

        function JitVM(runtime, state, elementStack, context) {
            _classCallCheck$29(this, JitVM);

            var _this3 = _possibleConstructorReturn$15(this, _VM2.call(this, runtime, state, elementStack));

            _this3.context = context;
            _this3.resume = initJIT(_this3.context);
            return _this3;
        }

        JitVM.initial = function initial(runtime, context, _ref4) {
            var handle = _ref4.handle,
                self = _ref4.self,
                dynamicScope = _ref4.dynamicScope,
                treeBuilder = _ref4.treeBuilder;

            var scopeSize = runtime.program.heap.scopesizeof(handle);
            var scope = ScopeImpl.root(self, scopeSize);
            var state = vmState(runtime.program.heap.getaddr(handle), scope, dynamicScope);
            var vm$$1 = initJIT(context)(runtime, state, treeBuilder);
            vm$$1.pushUpdating();
            return vm$$1;
        };

        JitVM.empty = function empty(runtime, _ref5, context) {
            var handle = _ref5.handle,
                treeBuilder = _ref5.treeBuilder,
                dynamicScope = _ref5.dynamicScope;

            var vm$$1 = initJIT(context)(runtime, vmState(runtime.program.heap.getaddr(handle), ScopeImpl.root(UNDEFINED_REFERENCE, 0), dynamicScope), treeBuilder);
            vm$$1.pushUpdating();
            return vm$$1;
        };

        JitVM.prototype.capture = function capture(args) {
            var pc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[INNER_VM].fetchRegister(vm.$pc);

            return new ResumableVMStateImpl(this.captureState(args, pc), this.resume);
        };

        JitVM.prototype.compile = function compile(block) {
            return block.compile(this.context);
        };

        return JitVM;
    }(VM);

    function _classCallCheck$30(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var TemplateIteratorImpl = function () {
        function TemplateIteratorImpl(vm$$1) {
            _classCallCheck$30(this, TemplateIteratorImpl);

            this.vm = vm$$1;
        }

        TemplateIteratorImpl.prototype.next = function next() {
            return this.vm.next();
        };

        TemplateIteratorImpl.prototype.sync = function sync() {
            return renderSync(this.vm.runtime.env, this);
        };

        return TemplateIteratorImpl;
    }();

    function renderSync(env, iterator) {
        env.begin();
        var iteratorResult = void 0;
        do {
            iteratorResult = iterator.next();
        } while (!iteratorResult.done);
        var result = iteratorResult.value;
        env.commit();
        return result;
    }
    function renderAotMain(runtime, self, treeBuilder, handle) {
        var dynamicScope = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : new DefaultDynamicScope();

        var vm$$1 = AotVM.initial(runtime, { self: self, dynamicScope: dynamicScope, treeBuilder: treeBuilder, handle: handle });
        return new TemplateIteratorImpl(vm$$1);
    }
    function renderAot(runtime, handle, cursor) {
        var self = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : UNDEFINED_REFERENCE;

        var treeBuilder = NewElementBuilder.forInitialRender(runtime.env, cursor);
        var dynamicScope = new DefaultDynamicScope();
        var vm$$1 = AotVM.initial(runtime, { self: self, dynamicScope: dynamicScope, treeBuilder: treeBuilder, handle: handle });
        return new TemplateIteratorImpl(vm$$1);
    }
    function renderJitMain(runtime, context, self, treeBuilder, handle) {
        var dynamicScope = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new DefaultDynamicScope();

        var vm$$1 = JitVM.initial(runtime, context, { self: self, dynamicScope: dynamicScope, treeBuilder: treeBuilder, handle: handle });
        return new TemplateIteratorImpl(vm$$1);
    }
    function renderInvocation(vm$$1, invocation, definition, args) {
        // Get a list of tuples of argument names and references, like
        // [['title', reference], ['name', reference]]
        var argList = Object.keys(args).map(function (key) {
            return [key, args[key]];
        });
        var blockNames = ['main', 'else', 'attrs'];
        // Prefix argument names with `@` symbol
        var argNames = argList.map(function (_ref) {
            var name = _ref[0];
            return '@' + name;
        });
        vm$$1.pushFrame();
        // Push blocks on to the stack, three stack values per block
        for (var i = 0; i < 3 * blockNames.length; i++) {
            vm$$1.stack.push(null);
        }
        vm$$1.stack.push(null);
        // For each argument, push its backing reference on to the stack
        argList.forEach(function (_ref2) {
            var reference$$1 = _ref2[1];

            vm$$1.stack.push(reference$$1);
        });
        // Configure VM based on blocks and args just pushed on to the stack.
        vm$$1[ARGS].setup(vm$$1.stack, argNames, blockNames, 0, true);
        // Needed for the Op.Main opcode: arguments, component invocation object, and
        // component definition.
        vm$$1.stack.push(vm$$1[ARGS]);
        vm$$1.stack.push(invocation);
        vm$$1.stack.push(definition);
        return new TemplateIteratorImpl(vm$$1);
    }
    function renderAotComponent(runtime, treeBuilder, main, name) {
        var args = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        var dynamicScope = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new DefaultDynamicScope();

        var vm$$1 = AotVM.empty(runtime, { treeBuilder: treeBuilder, handle: main, dynamicScope: dynamicScope });
        var definition = resolveComponent(vm$$1.runtime.resolver, name);
        var manager = definition.manager,
            state = definition.state;

        var capabilities = capabilityFlagsFrom(manager.getCapabilities(state));
        var invocation = void 0;
        if (hasStaticLayoutCapability(capabilities, manager)) {
            invocation = manager.getAotStaticLayout(state, vm$$1.runtime.resolver);
        } else {
            throw new Error('Cannot invoke components with dynamic layouts as a root component.');
        }
        return renderInvocation(vm$$1, invocation, definition, args);
    }
    function renderJitComponent(runtime, treeBuilder, context, main, name) {
        var args = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
        var dynamicScope = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : new DefaultDynamicScope();

        var vm$$1 = JitVM.empty(runtime, { treeBuilder: treeBuilder, handle: main, dynamicScope: dynamicScope }, context);
        var definition = resolveComponent(vm$$1.runtime.resolver, name);
        var manager = definition.manager,
            state = definition.state;

        var capabilities = capabilityFlagsFrom(manager.getCapabilities(state));
        var invocation = void 0;
        if (hasStaticLayoutCapability(capabilities, manager)) {
            var layout = manager.getJitStaticLayout(state, vm$$1.runtime.resolver);
            invocation = { handle: layout.compile(context), symbolTable: layout.symbolTable };
        } else {
            throw new Error('Cannot invoke components with dynamic layouts as a root component.');
        }
        return renderInvocation(vm$$1, invocation, definition, args);
    }

    var _createClass$7 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _defaults$16(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$31(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$16(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$16(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$16(subClass, superClass); }
    var SERIALIZATION_FIRST_NODE_STRING = '%+b:0%';
    function isSerializationFirstNode(node) {
        return node.nodeValue === SERIALIZATION_FIRST_NODE_STRING;
    }
    var RehydratingCursor = function (_CursorImpl) {
        _inherits$16(RehydratingCursor, _CursorImpl);

        function RehydratingCursor(element, nextSibling, startingBlockDepth) {
            _classCallCheck$31(this, RehydratingCursor);

            var _this = _possibleConstructorReturn$16(this, _CursorImpl.call(this, element, nextSibling));

            _this.startingBlockDepth = startingBlockDepth;
            _this.candidate = null;
            _this.injectedOmittedNode = false;
            _this.openBlockDepth = startingBlockDepth - 1;
            return _this;
        }

        return RehydratingCursor;
    }(CursorImpl);
    var RehydrateBuilder = function (_NewElementBuilder) {
        _inherits$16(RehydrateBuilder, _NewElementBuilder);

        // private candidate: Option<SimpleNode> = null;
        function RehydrateBuilder(env, parentNode, nextSibling) {
            _classCallCheck$31(this, RehydrateBuilder);

            var _this2 = _possibleConstructorReturn$16(this, _NewElementBuilder.call(this, env, parentNode, nextSibling));

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
                if (possibleEmptyMarker !== null && isEmpty$1(possibleEmptyMarker)) {
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
                } else if (candidate && (isSeparator(candidate) || isEmpty$1(candidate))) {
                    this.candidate = candidate.nextSibling;
                    this.remove(candidate);
                    return this.__appendText(string);
                } else if (isEmpty$1(candidate)) {
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

        _createClass$7(RehydrateBuilder, [{
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
    function isEmpty$1(node) {
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
    function rehydrationBuilder(env, cursor) {
        return RehydrateBuilder.forInitialRender(env, cursor);
    }

    exports.clear = clear;
    exports.ConcreteBounds = ConcreteBounds;
    exports.CursorImpl = CursorImpl;
    exports.capabilityFlagsFrom = capabilityFlagsFrom;
    exports.hasCapability = hasCapability;
    exports.resetDebuggerCallback = resetDebuggerCallback;
    exports.setDebuggerCallback = setDebuggerCallback;
    exports.CurriedComponentDefinition = CurriedComponentDefinition;
    exports.curry = curry;
    exports.isCurriedComponentDefinition = isCurriedComponentDefinition;
    exports.DEFAULT_CAPABILITIES = DEFAULT_CAPABILITIES;
    exports.MINIMAL_CAPABILITIES = MINIMAL_CAPABILITIES;
    exports.DOMChanges = helper$1;
    exports.IDOMChanges = DOMChangesImpl;
    exports.DOMTreeConstruction = DOMTreeConstruction;
    exports.isWhitespace = isWhitespace;
    exports.normalizeProperty = normalizeProperty;
    exports.DefaultDynamicScope = DefaultDynamicScope;
    exports.AotRuntime = AotRuntime;
    exports.EnvironmentImpl = EnvironmentImpl;
    exports.DefaultEnvironment = DefaultEnvironment;
    exports.CustomJitRuntime = CustomJitRuntime;
    exports.JitRuntimeFromProgram = JitRuntimeFromProgram;
    exports.JitRuntime = JitRuntime;
    exports.RuntimeEnvironment = RuntimeEnvironment;
    exports.ScopeImpl = ScopeImpl;
    exports.getDynamicVar = getDynamicVar;
    exports.ConditionalReference = ConditionalReference;
    exports.NULL_REFERENCE = NULL_REFERENCE;
    exports.PrimitiveReference = PrimitiveReference;
    exports.UNDEFINED_REFERENCE = UNDEFINED_REFERENCE;
    exports.renderAot = renderAot;
    exports.renderAotComponent = renderAotComponent;
    exports.renderAotMain = renderAotMain;
    exports.renderJitComponent = renderJitComponent;
    exports.renderJitMain = renderJitMain;
    exports.renderSync = renderSync;
    exports.UpdatingVM = UpdatingVM;
    exports.LowLevelVM = VM;
    exports.EMPTY_ARGS = EMPTY_ARGS;
    exports.DynamicAttribute = DynamicAttribute;
    exports.dynamicAttribute = dynamicAttribute;
    exports.SimpleDynamicAttribute = SimpleDynamicAttribute;
    exports.clientBuilder = clientBuilder;
    exports.NewElementBuilder = NewElementBuilder;
    exports.UpdatableBlockImpl = UpdatableBlockImpl;
    exports.RemoteLiveBlock = RemoteLiveBlock;
    exports.isSerializationFirstNode = isSerializationFirstNode;
    exports.RehydrateBuilder = RehydrateBuilder;
    exports.rehydrationBuilder = rehydrationBuilder;
    exports.SERIALIZATION_FIRST_NODE_STRING = SERIALIZATION_FIRST_NODE_STRING;
    exports.SimpleComponentManager = SimpleComponentManager;
    exports.TEMPLATE_ONLY_COMPONENT = TEMPLATE_ONLY_COMPONENT;

    Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci1ydW50aW1lLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9zeW1ib2xzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvYm91bmRzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvbGlmZXRpbWUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi92bS9lbGVtZW50LWJ1aWxkZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9kb20vb3BlcmF0aW9ucy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBhdC9zdmctaW5uZXItaHRtbC1maXgudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9jb21wYXQvdGV4dC1ub2RlLW1lcmdpbmctZml4LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvZG9tL2hlbHBlci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3JlZmVyZW5jZXMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9kb20vbm9ybWFsaXplLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvZG9tL3Byb3BzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvZG9tL3Nhbml0aXplZC12YWx1ZXMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi92bS9hdHRyaWJ1dGVzL2R5bmFtaWMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9lbnZpcm9ubWVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL29wY29kZXMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9jb21waWxlZC9leHByZXNzaW9ucy9jb25jYXQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9jb21waWxlZC9vcGNvZGVzL2V4cHJlc3Npb25zLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvY2FwYWJpbGl0aWVzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvY29tcG9uZW50L2N1cnJpZWQtY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvY29tcG9uZW50L3Jlc29sdmUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9yZWZlcmVuY2VzL2NsYXNzLWxpc3QudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9yZWZlcmVuY2VzL2N1cnJ5LWNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2NvbnRlbnQvdGV4dC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvY29udGVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvdm0udHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9jb21waWxlZC9vcGNvZGVzL2RvbS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvY29tcGlsZWQvb3Bjb2Rlcy9kZWJ1Z2dlci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvcGFydGlhbC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvbGlzdHMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9ydW50aW1lL2xpYi9jb21wb25lbnQvaW50ZXJmYWNlcy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBvbmVudC9tYW5hZ2VyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvZHluYW1pYy1zY29wZS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2hlbHBlcnMvZ2V0LWR5bmFtaWMtdmFyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvdm0vYXJndW1lbnRzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvdm0vbG93LWxldmVsLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvdm0vdXBkYXRlLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvdm0vcmVuZGVyLXJlc3VsdC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL3N0YWNrLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvdm0vYXBwZW5kLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvcmVuZGVyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcnVudGltZS9saWIvdm0vcmVoeWRyYXRlLWJ1aWxkZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlc2Ugc3ltYm9scyByZXByZXNlbnQgXCJmcmllbmRcIiBwcm9wZXJ0aWVzIHRoYXQgYXJlIHVzZWQgaW5zaWRlIG9mXG4vLyB0aGUgVk0gaW4gb3RoZXIgY2xhc3NlcywgYnV0IGFyZSBub3QgaW50ZW5kZWQgdG8gYmUgYSBwYXJ0IG9mXG4vLyBHbGltbWVyJ3MgQVBJLlxuXG5leHBvcnQgY29uc3QgSU5ORVJfVk0gPSAnSU5ORVJfVk0gW2RjYTFiN2ZlLWI0OGUtNDYyZS1iNzc1LTA4ZmQ3YTMxMDE3ZV0nO1xuZXhwb3J0IGNvbnN0IERFU1RSVUNUT1JfU1RBQ0sgPSAnREVTVFJVQ1RPUl9TVEFDSyBbZTQyYTgxZmYtOWQ4OS00ZDY1LTlhZDktYmU0Yzk1OTBmZGFkXSc7XG5leHBvcnQgY29uc3QgU1RBQ0tTID0gJ1NUQUNLUyBbNzA4NzZhMDYtODg5Ny00NjA5LWEzOTYtZTliMGNlYWM5NjdiXSc7XG5leHBvcnQgY29uc3QgUkVHSVNURVJTID0gJ1JFR0lTVEVSUyBbNDM1YzMzOTAtMmQ1Ny00MzBmLTk1NGEtMWJmOThkODgwY2UwXSc7XG5leHBvcnQgY29uc3QgSEVBUCA9ICdIRUFQIFswNjM3N2I1Yi1mMGIyLTQ5MzMtOTEzYS1kYTU3N2EwNDdhMGFdJztcbmV4cG9ydCBjb25zdCBDT05TVEFOVFMgPSAnQ09OU1RBTlRTIFszNDBmZDY5NS1kM2Y1LTQ0OTItOTFkYi03ZjkyM2FlOTVkOGVdJztcbmV4cG9ydCBjb25zdCBBUkdTID0gJ0FSR1MgWzVjZDJlNWIzLThhM2ItNGMyZi1hYzRmLTk2ZTM2MDI1M2Q2Zl0nO1xuZXhwb3J0IGNvbnN0IFBDID0gJ1BDIFtjYzY2YjMyNS05ZWQyLTQyZmQtYWQ5OS0yZjU0ZGJlYTc4MWNdJztcbiIsImltcG9ydCB7IEJvdW5kcywgQ3Vyc29yLCBTeW1ib2xEZXN0cm95YWJsZSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZXhwZWN0LCBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFNpbXBsZUVsZW1lbnQsIFNpbXBsZU5vZGUgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuXG5leHBvcnQgY2xhc3MgQ3Vyc29ySW1wbCBpbXBsZW1lbnRzIEN1cnNvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50OiBTaW1wbGVFbGVtZW50LCBwdWJsaWMgbmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPikge31cbn1cblxuZXhwb3J0IHR5cGUgRGVzdHJveWFibGVCb3VuZHMgPSBCb3VuZHMgJiBTeW1ib2xEZXN0cm95YWJsZTtcblxuZXhwb3J0IGNsYXNzIENvbmNyZXRlQm91bmRzIGltcGxlbWVudHMgQm91bmRzIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHBhcmVudE5vZGU6IFNpbXBsZUVsZW1lbnQsXG4gICAgcHJpdmF0ZSBmaXJzdDogU2ltcGxlTm9kZSxcbiAgICBwcml2YXRlIGxhc3Q6IFNpbXBsZU5vZGVcbiAgKSB7fVxuXG4gIHBhcmVudEVsZW1lbnQoKTogU2ltcGxlRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50Tm9kZTtcbiAgfVxuXG4gIGZpcnN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5maXJzdDtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmxhc3Q7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNpbmdsZU5vZGVCb3VuZHMgaW1wbGVtZW50cyBCb3VuZHMge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcmVudE5vZGU6IFNpbXBsZUVsZW1lbnQsIHByaXZhdGUgbm9kZTogU2ltcGxlTm9kZSkge31cblxuICBwYXJlbnRFbGVtZW50KCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLnBhcmVudE5vZGU7XG4gIH1cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLm5vZGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoYm91bmRzOiBCb3VuZHMsIHJlZmVyZW5jZTogT3B0aW9uPFNpbXBsZU5vZGU+KTogT3B0aW9uPFNpbXBsZU5vZGU+IHtcbiAgbGV0IHBhcmVudCA9IGJvdW5kcy5wYXJlbnRFbGVtZW50KCk7XG4gIGxldCBmaXJzdCA9IGJvdW5kcy5maXJzdE5vZGUoKTtcbiAgbGV0IGxhc3QgPSBib3VuZHMubGFzdE5vZGUoKTtcblxuICBsZXQgY3VycmVudDogU2ltcGxlTm9kZSA9IGZpcnN0O1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgbGV0IG5leHQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuXG4gICAgcGFyZW50Lmluc2VydEJlZm9yZShjdXJyZW50LCByZWZlcmVuY2UpO1xuXG4gICAgaWYgKGN1cnJlbnQgPT09IGxhc3QpIHtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH1cblxuICAgIGN1cnJlbnQgPSBleHBlY3QobmV4dCwgJ2ludmFsaWQgYm91bmRzJyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKGJvdW5kczogQm91bmRzKTogT3B0aW9uPFNpbXBsZU5vZGU+IHtcbiAgbGV0IHBhcmVudCA9IGJvdW5kcy5wYXJlbnRFbGVtZW50KCk7XG4gIGxldCBmaXJzdCA9IGJvdW5kcy5maXJzdE5vZGUoKTtcbiAgbGV0IGxhc3QgPSBib3VuZHMubGFzdE5vZGUoKTtcblxuICBsZXQgY3VycmVudDogU2ltcGxlTm9kZSA9IGZpcnN0O1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgbGV0IG5leHQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuXG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKGN1cnJlbnQpO1xuXG4gICAgaWYgKGN1cnJlbnQgPT09IGxhc3QpIHtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH1cblxuICAgIGN1cnJlbnQgPSBleHBlY3QobmV4dCwgJ2ludmFsaWQgYm91bmRzJyk7XG4gIH1cbn1cbiIsImltcG9ydCB7IHRha2VBc3NvY2lhdGVkLCBzbmFwc2hvdCwgZGVzdHJ1Y3RvciwgTElOS0VEIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCB7IGNsZWFyIH0gZnJvbSAnLi9ib3VuZHMnO1xuaW1wb3J0IHsgQmxvY2tPcGNvZGUgfSBmcm9tICcuL3ZtL3VwZGF0ZSc7XG5pbXBvcnQgeyBPcHRpb24sIEJvdW5kcywgRW52aXJvbm1lbnQgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFNpbXBsZU5vZGUgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuXG5leHBvcnQgZnVuY3Rpb24gYXN5bmNSZXNldChwYXJlbnQ6IG9iamVjdCwgZW52OiBFbnZpcm9ubWVudCkge1xuICBsZXQgbGlua2VkID0gdGFrZUFzc29jaWF0ZWQocGFyZW50KTtcblxuICBpZiAobGlua2VkKSB7XG4gICAgZW52LmRpZERlc3Ryb3koc25hcHNob3QobGlua2VkKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jRGVzdHJveShwYXJlbnQ6IG9iamVjdCwgZW52OiBFbnZpcm9ubWVudCkge1xuICBpZiAoREVCVUcpIHtcbiAgICBjb25zb2xlLmxvZygnYXN5bmNEZXN0cm95JywgcGFyZW50LCBMSU5LRUQuZ2V0KHBhcmVudCkpO1xuICB9XG5cbiAgZW52LmRpZERlc3Ryb3koZGVzdHJ1Y3RvcihwYXJlbnQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGFjaChwYXJlbnQ6IEJsb2NrT3Bjb2RlLCBlbnY6IEVudmlyb25tZW50KSB7XG4gIGlmIChERUJVRykge1xuICAgIGNvbnNvbGUubG9nKCdhc3luY0NsZWFyJywgcGFyZW50LCBMSU5LRUQuZ2V0KHBhcmVudCkpO1xuICB9XG5cbiAgY2xlYXIocGFyZW50KTtcbiAgYXN5bmNEZXN0cm95KHBhcmVudCwgZW52KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGFjaENoaWxkcmVuKHBhcmVudDogQm91bmRzLCBlbnY6IEVudmlyb25tZW50KTogT3B0aW9uPFNpbXBsZU5vZGU+IHtcbiAgaWYgKERFQlVHKSB7XG4gICAgY29uc29sZS5sb2coJ2FzeW5jQ2xlYXInLCBwYXJlbnQsIExJTktFRC5nZXQocGFyZW50KSk7XG4gIH1cblxuICBhc3luY1Jlc2V0KHBhcmVudCwgZW52KTtcbiAgcmV0dXJuIGNsZWFyKHBhcmVudCk7XG59XG4iLCJpbXBvcnQge1xuICBCb3VuZHMsXG4gIERpY3QsXG4gIEVsZW1lbnRPcGVyYXRpb25zLFxuICBFbnZpcm9ubWVudCxcbiAgR2xpbW1lclRyZWVDaGFuZ2VzLFxuICBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbixcbiAgU3ltYm9sRGVzdHJveWFibGUsXG4gIEVsZW1lbnRCdWlsZGVyLFxuICBMaXZlQmxvY2ssXG4gIEN1cnNvclN0YWNrU3ltYm9sLFxuICBVcGRhdGFibGVCbG9jayxcbiAgQ3Vyc29yLFxuICBNb2RpZmllck1hbmFnZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgYXNzZXJ0LFxuICBERVNUUk9ZLFxuICBleHBlY3QsXG4gIExpbmtlZExpc3QsXG4gIExpbmtlZExpc3ROb2RlLFxuICBPcHRpb24sXG4gIFN0YWNrLFxuICBNYXliZSxcbn0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQge1xuICBBdHRyTmFtZXNwYWNlLFxuICBTaW1wbGVDb21tZW50LFxuICBTaW1wbGVEb2N1bWVudEZyYWdtZW50LFxuICBTaW1wbGVFbGVtZW50LFxuICBTaW1wbGVOb2RlLFxuICBTaW1wbGVUZXh0LFxufSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgY2xlYXIsIENvbmNyZXRlQm91bmRzLCBDdXJzb3JJbXBsLCBTaW5nbGVOb2RlQm91bmRzIH0gZnJvbSAnLi4vYm91bmRzJztcbmltcG9ydCB7IGRldGFjaENoaWxkcmVuIH0gZnJvbSAnLi4vbGlmZXRpbWUnO1xuaW1wb3J0IHsgRHluYW1pY0F0dHJpYnV0ZSB9IGZyb20gJy4vYXR0cmlidXRlcy9keW5hbWljJztcblxuZXhwb3J0IGludGVyZmFjZSBGaXJzdE5vZGUge1xuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMYXN0Tm9kZSB7XG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGU7XG59XG5cbmNsYXNzIEZpcnN0IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBub2RlOiBTaW1wbGVOb2RlKSB7fVxuXG4gIGZpcnN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlO1xuICB9XG59XG5cbmNsYXNzIExhc3Qge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5vZGU6IFNpbXBsZU5vZGUpIHt9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRnJhZ21lbnQgaW1wbGVtZW50cyBCb3VuZHMge1xuICBwcml2YXRlIGJvdW5kczogQm91bmRzO1xuXG4gIGNvbnN0cnVjdG9yKGJvdW5kczogQm91bmRzKSB7XG4gICAgdGhpcy5ib3VuZHMgPSBib3VuZHM7XG4gIH1cblxuICBwYXJlbnRFbGVtZW50KCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5wYXJlbnRFbGVtZW50KCk7XG4gIH1cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmZpcnN0Tm9kZSgpO1xuICB9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmxhc3ROb2RlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IENVUlNPUl9TVEFDSzogQ3Vyc29yU3RhY2tTeW1ib2wgPVxuICAnQ1VSU09SX1NUQUNLIFszMWVhMGQyZi03YzIyLTQ4MTQtOWRiNy0yOGU0NDY5YjU0ZTZdJztcblxuZXhwb3J0IGNsYXNzIE5ld0VsZW1lbnRCdWlsZGVyIGltcGxlbWVudHMgRWxlbWVudEJ1aWxkZXIge1xuICBwdWJsaWMgZG9tOiBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbjtcbiAgcHVibGljIHVwZGF0ZU9wZXJhdGlvbnM6IEdsaW1tZXJUcmVlQ2hhbmdlcztcbiAgcHVibGljIGNvbnN0cnVjdGluZzogT3B0aW9uPFNpbXBsZUVsZW1lbnQ+ID0gbnVsbDtcbiAgcHVibGljIG9wZXJhdGlvbnM6IE9wdGlvbjxFbGVtZW50T3BlcmF0aW9ucz4gPSBudWxsO1xuICBwcml2YXRlIGVudjogRW52aXJvbm1lbnQ7XG5cbiAgW0NVUlNPUl9TVEFDS10gPSBuZXcgU3RhY2s8Q3Vyc29yPigpO1xuICBwcml2YXRlIG1vZGlmaWVyU3RhY2sgPSBuZXcgU3RhY2s8T3B0aW9uPFtNb2RpZmllck1hbmFnZXIsIHVua25vd25dW10+PigpO1xuICBwcml2YXRlIGJsb2NrU3RhY2sgPSBuZXcgU3RhY2s8TGl2ZUJsb2NrPigpO1xuXG4gIHN0YXRpYyBmb3JJbml0aWFsUmVuZGVyKGVudjogRW52aXJvbm1lbnQsIGN1cnNvcjogQ3Vyc29ySW1wbCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhlbnYsIGN1cnNvci5lbGVtZW50LCBjdXJzb3IubmV4dFNpYmxpbmcpLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIHN0YXRpYyByZXN1bWUoZW52OiBFbnZpcm9ubWVudCwgYmxvY2s6IFVwZGF0YWJsZUJsb2NrKTogTmV3RWxlbWVudEJ1aWxkZXIge1xuICAgIGxldCBwYXJlbnROb2RlID0gYmxvY2sucGFyZW50RWxlbWVudCgpO1xuICAgIGxldCBuZXh0U2libGluZyA9IGJsb2NrLnJlc2V0KGVudik7XG5cbiAgICBsZXQgc3RhY2sgPSBuZXcgdGhpcyhlbnYsIHBhcmVudE5vZGUsIG5leHRTaWJsaW5nKS5pbml0aWFsaXplKCk7XG4gICAgc3RhY2sucHVzaExpdmVCbG9jayhibG9jayk7XG5cbiAgICByZXR1cm4gc3RhY2s7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihlbnY6IEVudmlyb25tZW50LCBwYXJlbnROb2RlOiBTaW1wbGVFbGVtZW50LCBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+KSB7XG4gICAgdGhpcy5wdXNoRWxlbWVudChwYXJlbnROb2RlLCBuZXh0U2libGluZyk7XG5cbiAgICB0aGlzLmVudiA9IGVudjtcbiAgICB0aGlzLmRvbSA9IGVudi5nZXRBcHBlbmRPcGVyYXRpb25zKCk7XG4gICAgdGhpcy51cGRhdGVPcGVyYXRpb25zID0gZW52LmdldERPTSgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKTogdGhpcyB7XG4gICAgdGhpcy5wdXNoU2ltcGxlQmxvY2soKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRlYnVnQmxvY2tzKCk6IExpdmVCbG9ja1tdIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja1N0YWNrLnRvQXJyYXkoKTtcbiAgfVxuXG4gIGdldCBlbGVtZW50KCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzW0NVUlNPUl9TVEFDS10uY3VycmVudCEuZWxlbWVudDtcbiAgfVxuXG4gIGdldCBuZXh0U2libGluZygpOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICAgIHJldHVybiB0aGlzW0NVUlNPUl9TVEFDS10uY3VycmVudCEubmV4dFNpYmxpbmc7XG4gIH1cblxuICBibG9jaygpOiBMaXZlQmxvY2sge1xuICAgIHJldHVybiBleHBlY3QodGhpcy5ibG9ja1N0YWNrLmN1cnJlbnQsICdFeHBlY3RlZCBhIGN1cnJlbnQgbGl2ZSBibG9jaycpO1xuICB9XG5cbiAgcG9wRWxlbWVudCgpIHtcbiAgICB0aGlzW0NVUlNPUl9TVEFDS10ucG9wKCk7XG4gICAgZXhwZWN0KHRoaXNbQ1VSU09SX1NUQUNLXS5jdXJyZW50LCBcImNhbid0IHBvcCBwYXN0IHRoZSBsYXN0IGVsZW1lbnRcIik7XG4gIH1cblxuICBwdXNoU2ltcGxlQmxvY2soKTogTGl2ZUJsb2NrIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoTGl2ZUJsb2NrKG5ldyBTaW1wbGVMaXZlQmxvY2sodGhpcy5lbGVtZW50KSk7XG4gIH1cblxuICBwdXNoVXBkYXRhYmxlQmxvY2soKTogVXBkYXRhYmxlQmxvY2tJbXBsIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoTGl2ZUJsb2NrKG5ldyBVcGRhdGFibGVCbG9ja0ltcGwodGhpcy5lbGVtZW50KSk7XG4gIH1cblxuICBwdXNoQmxvY2tMaXN0KGxpc3Q6IExpbmtlZExpc3Q8TGlua2VkTGlzdE5vZGUgJiBMaXZlQmxvY2s+KTogTGl2ZUJsb2NrTGlzdCB7XG4gICAgcmV0dXJuIHRoaXMucHVzaExpdmVCbG9jayhuZXcgTGl2ZUJsb2NrTGlzdCh0aGlzLmVsZW1lbnQsIGxpc3QpKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBwdXNoTGl2ZUJsb2NrPFQgZXh0ZW5kcyBMaXZlQmxvY2s+KGJsb2NrOiBULCBpc1JlbW90ZSA9IGZhbHNlKTogVCB7XG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmJsb2NrU3RhY2suY3VycmVudDtcblxuICAgIGlmIChjdXJyZW50ICE9PSBudWxsKSB7XG4gICAgICBpZiAoIWlzUmVtb3RlKSB7XG4gICAgICAgIGN1cnJlbnQuZGlkQXBwZW5kQm91bmRzKGJsb2NrKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9fb3BlbkJsb2NrKCk7XG4gICAgdGhpcy5ibG9ja1N0YWNrLnB1c2goYmxvY2spO1xuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIHBvcEJsb2NrKCk6IExpdmVCbG9jayB7XG4gICAgdGhpcy5ibG9jaygpLmZpbmFsaXplKHRoaXMpO1xuICAgIHRoaXMuX19jbG9zZUJsb2NrKCk7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzLmJsb2NrU3RhY2sucG9wKCksICdFeHBlY3RlZCBwb3BCbG9jayB0byByZXR1cm4gYSBibG9jaycpO1xuICB9XG5cbiAgX19vcGVuQmxvY2soKTogdm9pZCB7fVxuICBfX2Nsb3NlQmxvY2soKTogdm9pZCB7fVxuXG4gIC8vIHRvZG8gcmV0dXJuIHNlZW1zIHVudXNlZFxuICBvcGVuRWxlbWVudCh0YWc6IHN0cmluZyk6IFNpbXBsZUVsZW1lbnQge1xuICAgIGxldCBlbGVtZW50ID0gdGhpcy5fX29wZW5FbGVtZW50KHRhZyk7XG4gICAgdGhpcy5jb25zdHJ1Y3RpbmcgPSBlbGVtZW50O1xuXG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICBfX29wZW5FbGVtZW50KHRhZzogc3RyaW5nKTogU2ltcGxlRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuZG9tLmNyZWF0ZUVsZW1lbnQodGFnLCB0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgZmx1c2hFbGVtZW50KG1vZGlmaWVyczogT3B0aW9uPFtNb2RpZmllck1hbmFnZXIsIHVua25vd25dW10+KSB7XG4gICAgbGV0IHBhcmVudCA9IHRoaXMuZWxlbWVudDtcbiAgICBsZXQgZWxlbWVudCA9IGV4cGVjdChcbiAgICAgIHRoaXMuY29uc3RydWN0aW5nLFxuICAgICAgYGZsdXNoRWxlbWVudCBzaG91bGQgb25seSBiZSBjYWxsZWQgd2hlbiBjb25zdHJ1Y3RpbmcgYW4gZWxlbWVudGBcbiAgICApO1xuXG4gICAgdGhpcy5fX2ZsdXNoRWxlbWVudChwYXJlbnQsIGVsZW1lbnQpO1xuXG4gICAgdGhpcy5jb25zdHJ1Y3RpbmcgPSBudWxsO1xuICAgIHRoaXMub3BlcmF0aW9ucyA9IG51bGw7XG5cbiAgICB0aGlzLnB1c2hNb2RpZmllcnMobW9kaWZpZXJzKTtcbiAgICB0aGlzLnB1c2hFbGVtZW50KGVsZW1lbnQsIG51bGwpO1xuICAgIHRoaXMuZGlkT3BlbkVsZW1lbnQoZWxlbWVudCk7XG4gIH1cblxuICBfX2ZsdXNoRWxlbWVudChwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsIGNvbnN0cnVjdGluZzogU2ltcGxlRWxlbWVudCkge1xuICAgIHRoaXMuZG9tLmluc2VydEJlZm9yZShwYXJlbnQsIGNvbnN0cnVjdGluZywgdGhpcy5uZXh0U2libGluZyk7XG4gIH1cblxuICBjbG9zZUVsZW1lbnQoKTogT3B0aW9uPFtNb2RpZmllck1hbmFnZXIsIHVua25vd25dW10+IHtcbiAgICB0aGlzLndpbGxDbG9zZUVsZW1lbnQoKTtcbiAgICB0aGlzLnBvcEVsZW1lbnQoKTtcbiAgICByZXR1cm4gdGhpcy5wb3BNb2RpZmllcnMoKTtcbiAgfVxuXG4gIHB1c2hSZW1vdGVFbGVtZW50KFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgZ3VpZDogc3RyaW5nLFxuICAgIGluc2VydEJlZm9yZTogTWF5YmU8U2ltcGxlTm9kZT5cbiAgKTogT3B0aW9uPFJlbW90ZUxpdmVCbG9jaz4ge1xuICAgIHJldHVybiB0aGlzLl9fcHVzaFJlbW90ZUVsZW1lbnQoZWxlbWVudCwgZ3VpZCwgaW5zZXJ0QmVmb3JlKTtcbiAgfVxuXG4gIF9fcHVzaFJlbW90ZUVsZW1lbnQoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBfZ3VpZDogc3RyaW5nLFxuICAgIGluc2VydEJlZm9yZTogTWF5YmU8U2ltcGxlTm9kZT5cbiAgKTogT3B0aW9uPFJlbW90ZUxpdmVCbG9jaz4ge1xuICAgIHRoaXMucHVzaEVsZW1lbnQoZWxlbWVudCwgaW5zZXJ0QmVmb3JlKTtcblxuICAgIGlmIChpbnNlcnRCZWZvcmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgd2hpbGUgKGVsZW1lbnQubGFzdENoaWxkKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudC5sYXN0Q2hpbGQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBibG9jayA9IG5ldyBSZW1vdGVMaXZlQmxvY2soZWxlbWVudCk7XG5cbiAgICByZXR1cm4gdGhpcy5wdXNoTGl2ZUJsb2NrKGJsb2NrLCB0cnVlKTtcbiAgfVxuXG4gIHBvcFJlbW90ZUVsZW1lbnQoKSB7XG4gICAgdGhpcy5wb3BCbG9jaygpO1xuICAgIHRoaXMucG9wRWxlbWVudCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHB1c2hFbGVtZW50KGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsIG5leHRTaWJsaW5nOiBNYXliZTxTaW1wbGVOb2RlPiA9IG51bGwpIHtcbiAgICB0aGlzW0NVUlNPUl9TVEFDS10ucHVzaChuZXcgQ3Vyc29ySW1wbChlbGVtZW50LCBuZXh0U2libGluZykpO1xuICB9XG5cbiAgcHJpdmF0ZSBwdXNoTW9kaWZpZXJzKG1vZGlmaWVyczogT3B0aW9uPFtNb2RpZmllck1hbmFnZXIsIHVua25vd25dW10+KTogdm9pZCB7XG4gICAgdGhpcy5tb2RpZmllclN0YWNrLnB1c2gobW9kaWZpZXJzKTtcbiAgfVxuXG4gIHByaXZhdGUgcG9wTW9kaWZpZXJzKCk6IE9wdGlvbjxbTW9kaWZpZXJNYW5hZ2VyLCB1bmtub3duXVtdPiB7XG4gICAgcmV0dXJuIHRoaXMubW9kaWZpZXJTdGFjay5wb3AoKTtcbiAgfVxuXG4gIGRpZEFwcGVuZEJvdW5kcyhib3VuZHM6IEJvdW5kcyk6IEJvdW5kcyB7XG4gICAgdGhpcy5ibG9jaygpLmRpZEFwcGVuZEJvdW5kcyhib3VuZHMpO1xuICAgIHJldHVybiBib3VuZHM7XG4gIH1cblxuICBkaWRBcHBlbmROb2RlPFQgZXh0ZW5kcyBTaW1wbGVOb2RlPihub2RlOiBUKTogVCB7XG4gICAgdGhpcy5ibG9jaygpLmRpZEFwcGVuZE5vZGUobm9kZSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBkaWRPcGVuRWxlbWVudChlbGVtZW50OiBTaW1wbGVFbGVtZW50KTogU2ltcGxlRWxlbWVudCB7XG4gICAgdGhpcy5ibG9jaygpLm9wZW5FbGVtZW50KGVsZW1lbnQpO1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgd2lsbENsb3NlRWxlbWVudCgpIHtcbiAgICB0aGlzLmJsb2NrKCkuY2xvc2VFbGVtZW50KCk7XG4gIH1cblxuICBhcHBlbmRUZXh0KHN0cmluZzogc3RyaW5nKTogU2ltcGxlVGV4dCB7XG4gICAgcmV0dXJuIHRoaXMuZGlkQXBwZW5kTm9kZSh0aGlzLl9fYXBwZW5kVGV4dChzdHJpbmcpKTtcbiAgfVxuXG4gIF9fYXBwZW5kVGV4dCh0ZXh0OiBzdHJpbmcpOiBTaW1wbGVUZXh0IHtcbiAgICBsZXQgeyBkb20sIGVsZW1lbnQsIG5leHRTaWJsaW5nIH0gPSB0aGlzO1xuICAgIGxldCBub2RlID0gZG9tLmNyZWF0ZVRleHROb2RlKHRleHQpO1xuICAgIGRvbS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgbm9kZSwgbmV4dFNpYmxpbmcpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgX19hcHBlbmROb2RlKG5vZGU6IFNpbXBsZU5vZGUpOiBTaW1wbGVOb2RlIHtcbiAgICB0aGlzLmRvbS5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBub2RlLCB0aGlzLm5leHRTaWJsaW5nKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIF9fYXBwZW5kRnJhZ21lbnQoZnJhZ21lbnQ6IFNpbXBsZURvY3VtZW50RnJhZ21lbnQpOiBCb3VuZHMge1xuICAgIGxldCBmaXJzdCA9IGZyYWdtZW50LmZpcnN0Q2hpbGQ7XG5cbiAgICBpZiAoZmlyc3QpIHtcbiAgICAgIGxldCByZXQgPSBuZXcgQ29uY3JldGVCb3VuZHModGhpcy5lbGVtZW50LCBmaXJzdCwgZnJhZ21lbnQubGFzdENoaWxkISk7XG4gICAgICB0aGlzLmRvbS5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBmcmFnbWVudCwgdGhpcy5uZXh0U2libGluZyk7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFNpbmdsZU5vZGVCb3VuZHModGhpcy5lbGVtZW50LCB0aGlzLl9fYXBwZW5kQ29tbWVudCgnJykpO1xuICAgIH1cbiAgfVxuXG4gIF9fYXBwZW5kSFRNTChodG1sOiBzdHJpbmcpOiBCb3VuZHMge1xuICAgIHJldHVybiB0aGlzLmRvbS5pbnNlcnRIVE1MQmVmb3JlKHRoaXMuZWxlbWVudCwgdGhpcy5uZXh0U2libGluZywgaHRtbCk7XG4gIH1cblxuICBhcHBlbmREeW5hbWljSFRNTCh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGJvdW5kcyA9IHRoaXMudHJ1c3RlZENvbnRlbnQodmFsdWUpO1xuICAgIHRoaXMuZGlkQXBwZW5kQm91bmRzKGJvdW5kcyk7XG4gIH1cblxuICBhcHBlbmREeW5hbWljVGV4dCh2YWx1ZTogc3RyaW5nKTogU2ltcGxlVGV4dCB7XG4gICAgbGV0IG5vZGUgPSB0aGlzLnVudHJ1c3RlZENvbnRlbnQodmFsdWUpO1xuICAgIHRoaXMuZGlkQXBwZW5kTm9kZShub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGFwcGVuZER5bmFtaWNGcmFnbWVudCh2YWx1ZTogU2ltcGxlRG9jdW1lbnRGcmFnbWVudCk6IHZvaWQge1xuICAgIGxldCBib3VuZHMgPSB0aGlzLl9fYXBwZW5kRnJhZ21lbnQodmFsdWUpO1xuICAgIHRoaXMuZGlkQXBwZW5kQm91bmRzKGJvdW5kcyk7XG4gIH1cblxuICBhcHBlbmREeW5hbWljTm9kZSh2YWx1ZTogU2ltcGxlTm9kZSk6IHZvaWQge1xuICAgIGxldCBub2RlID0gdGhpcy5fX2FwcGVuZE5vZGUodmFsdWUpO1xuICAgIGxldCBib3VuZHMgPSBuZXcgU2luZ2xlTm9kZUJvdW5kcyh0aGlzLmVsZW1lbnQsIG5vZGUpO1xuICAgIHRoaXMuZGlkQXBwZW5kQm91bmRzKGJvdW5kcyk7XG4gIH1cblxuICBwcml2YXRlIHRydXN0ZWRDb250ZW50KHZhbHVlOiBzdHJpbmcpOiBCb3VuZHMge1xuICAgIHJldHVybiB0aGlzLl9fYXBwZW5kSFRNTCh2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIHVudHJ1c3RlZENvbnRlbnQodmFsdWU6IHN0cmluZyk6IFNpbXBsZVRleHQge1xuICAgIHJldHVybiB0aGlzLl9fYXBwZW5kVGV4dCh2YWx1ZSk7XG4gIH1cblxuICBhcHBlbmRDb21tZW50KHN0cmluZzogc3RyaW5nKTogU2ltcGxlQ29tbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuZGlkQXBwZW5kTm9kZSh0aGlzLl9fYXBwZW5kQ29tbWVudChzdHJpbmcpKTtcbiAgfVxuXG4gIF9fYXBwZW5kQ29tbWVudChzdHJpbmc6IHN0cmluZyk6IFNpbXBsZUNvbW1lbnQge1xuICAgIGxldCB7IGRvbSwgZWxlbWVudCwgbmV4dFNpYmxpbmcgfSA9IHRoaXM7XG4gICAgbGV0IG5vZGUgPSBkb20uY3JlYXRlQ29tbWVudChzdHJpbmcpO1xuICAgIGRvbS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgbm9kZSwgbmV4dFNpYmxpbmcpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgX19zZXRBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPik6IHZvaWQge1xuICAgIHRoaXMuZG9tLnNldEF0dHJpYnV0ZSh0aGlzLmNvbnN0cnVjdGluZyEsIG5hbWUsIHZhbHVlLCBuYW1lc3BhY2UpO1xuICB9XG5cbiAgX19zZXRQcm9wZXJ0eShuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgKHRoaXMuY29uc3RydWN0aW5nISBhcyBEaWN0KVtuYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgc2V0U3RhdGljQXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT4pOiB2b2lkIHtcbiAgICB0aGlzLl9fc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlLCBuYW1lc3BhY2UpO1xuICB9XG5cbiAgc2V0RHluYW1pY0F0dHJpYnV0ZShcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdmFsdWU6IHVua25vd24sXG4gICAgdHJ1c3Rpbmc6IGJvb2xlYW4sXG4gICAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT5cbiAgKTogRHluYW1pY0F0dHJpYnV0ZSB7XG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmNvbnN0cnVjdGluZyE7XG4gICAgbGV0IGF0dHJpYnV0ZSA9IHRoaXMuZW52LmF0dHJpYnV0ZUZvcihlbGVtZW50LCBuYW1lLCB0cnVzdGluZywgbmFtZXNwYWNlKTtcbiAgICBhdHRyaWJ1dGUuc2V0KHRoaXMsIHZhbHVlLCB0aGlzLmVudik7XG4gICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2ltcGxlTGl2ZUJsb2NrIGltcGxlbWVudHMgTGl2ZUJsb2NrIHtcbiAgcHJvdGVjdGVkIGZpcnN0OiBPcHRpb248Rmlyc3ROb2RlPiA9IG51bGw7XG4gIHByb3RlY3RlZCBsYXN0OiBPcHRpb248TGFzdE5vZGU+ID0gbnVsbDtcbiAgcHJvdGVjdGVkIGRlc3Ryb3lhYmxlczogT3B0aW9uPFN5bWJvbERlc3Ryb3lhYmxlW10+ID0gbnVsbDtcbiAgcHJvdGVjdGVkIG5lc3RpbmcgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFyZW50OiBTaW1wbGVFbGVtZW50KSB7fVxuXG4gIHBhcmVudEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50O1xuICB9XG5cbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIGxldCBmaXJzdCA9IGV4cGVjdChcbiAgICAgIHRoaXMuZmlyc3QsXG4gICAgICAnY2Fubm90IGNhbGwgYGZpcnN0Tm9kZSgpYCB3aGlsZSBgU2ltcGxlTGl2ZUJsb2NrYCBpcyBzdGlsbCBpbml0aWFsaXppbmcnXG4gICAgKTtcblxuICAgIHJldHVybiBmaXJzdC5maXJzdE5vZGUoKTtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIGxldCBsYXN0ID0gZXhwZWN0KFxuICAgICAgdGhpcy5sYXN0LFxuICAgICAgJ2Nhbm5vdCBjYWxsIGBsYXN0Tm9kZSgpYCB3aGlsZSBgU2ltcGxlTGl2ZUJsb2NrYCBpcyBzdGlsbCBpbml0aWFsaXppbmcnXG4gICAgKTtcblxuICAgIHJldHVybiBsYXN0Lmxhc3ROb2RlKCk7XG4gIH1cblxuICBvcGVuRWxlbWVudChlbGVtZW50OiBTaW1wbGVFbGVtZW50KSB7XG4gICAgdGhpcy5kaWRBcHBlbmROb2RlKGVsZW1lbnQpO1xuICAgIHRoaXMubmVzdGluZysrO1xuICB9XG5cbiAgY2xvc2VFbGVtZW50KCkge1xuICAgIHRoaXMubmVzdGluZy0tO1xuICB9XG5cbiAgZGlkQXBwZW5kTm9kZShub2RlOiBTaW1wbGVOb2RlKSB7XG4gICAgaWYgKHRoaXMubmVzdGluZyAhPT0gMCkgcmV0dXJuO1xuXG4gICAgaWYgKCF0aGlzLmZpcnN0KSB7XG4gICAgICB0aGlzLmZpcnN0ID0gbmV3IEZpcnN0KG5vZGUpO1xuICAgIH1cblxuICAgIHRoaXMubGFzdCA9IG5ldyBMYXN0KG5vZGUpO1xuICB9XG5cbiAgZGlkQXBwZW5kQm91bmRzKGJvdW5kczogQm91bmRzKSB7XG4gICAgaWYgKHRoaXMubmVzdGluZyAhPT0gMCkgcmV0dXJuO1xuXG4gICAgaWYgKCF0aGlzLmZpcnN0KSB7XG4gICAgICB0aGlzLmZpcnN0ID0gYm91bmRzO1xuICAgIH1cblxuICAgIHRoaXMubGFzdCA9IGJvdW5kcztcbiAgfVxuXG4gIGZpbmFsaXplKHN0YWNrOiBFbGVtZW50QnVpbGRlcikge1xuICAgIGlmICh0aGlzLmZpcnN0ID09PSBudWxsKSB7XG4gICAgICBzdGFjay5hcHBlbmRDb21tZW50KCcnKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW90ZUxpdmVCbG9jayBleHRlbmRzIFNpbXBsZUxpdmVCbG9jayBpbXBsZW1lbnRzIFN5bWJvbERlc3Ryb3lhYmxlIHtcbiAgW0RFU1RST1ldKCkge1xuICAgIGNsZWFyKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGFibGVCbG9ja0ltcGwgZXh0ZW5kcyBTaW1wbGVMaXZlQmxvY2sgaW1wbGVtZW50cyBVcGRhdGFibGVCbG9jayB7XG4gIHJlc2V0KGVudjogRW52aXJvbm1lbnQpOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICAgIGxldCBuZXh0U2libGluZyA9IGRldGFjaENoaWxkcmVuKHRoaXMsIGVudik7XG5cbiAgICAvLyBsZXQgbmV4dFNpYmxpbmcgPSBjbGVhcih0aGlzKTtcblxuICAgIHRoaXMuZmlyc3QgPSBudWxsO1xuICAgIHRoaXMubGFzdCA9IG51bGw7XG4gICAgdGhpcy5kZXN0cm95YWJsZXMgPSBudWxsO1xuICAgIHRoaXMubmVzdGluZyA9IDA7XG5cbiAgICByZXR1cm4gbmV4dFNpYmxpbmc7XG4gIH1cbn1cblxuLy8gRklYTUU6IEFsbCB0aGUgbm9vcHMgaW4gaGVyZSBpbmRpY2F0ZSBhIG1vZGVsbGluZyBwcm9ibGVtXG5jbGFzcyBMaXZlQmxvY2tMaXN0IGltcGxlbWVudHMgTGl2ZUJsb2NrIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgcHJpdmF0ZSByZWFkb25seSBib3VuZExpc3Q6IExpbmtlZExpc3Q8TGlua2VkTGlzdE5vZGUgJiBMaXZlQmxvY2s+XG4gICkge1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuYm91bmRMaXN0ID0gYm91bmRMaXN0O1xuICB9XG5cbiAgcGFyZW50RWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQ7XG4gIH1cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgbGV0IGhlYWQgPSBleHBlY3QoXG4gICAgICB0aGlzLmJvdW5kTGlzdC5oZWFkKCksXG4gICAgICAnY2Fubm90IGNhbGwgYGZpcnN0Tm9kZSgpYCB3aGlsZSBgTGl2ZUJsb2NrTGlzdGAgaXMgc3RpbGwgaW5pdGlhbGl6aW5nJ1xuICAgICk7XG5cbiAgICByZXR1cm4gaGVhZC5maXJzdE5vZGUoKTtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIGxldCB0YWlsID0gZXhwZWN0KFxuICAgICAgdGhpcy5ib3VuZExpc3QudGFpbCgpLFxuICAgICAgJ2Nhbm5vdCBjYWxsIGBsYXN0Tm9kZSgpYCB3aGlsZSBgTGl2ZUJsb2NrTGlzdGAgaXMgc3RpbGwgaW5pdGlhbGl6aW5nJ1xuICAgICk7XG5cbiAgICByZXR1cm4gdGFpbC5sYXN0Tm9kZSgpO1xuICB9XG5cbiAgb3BlbkVsZW1lbnQoX2VsZW1lbnQ6IFNpbXBsZUVsZW1lbnQpIHtcbiAgICBhc3NlcnQoZmFsc2UsICdDYW5ub3Qgb3BlbkVsZW1lbnQgZGlyZWN0bHkgaW5zaWRlIGEgYmxvY2sgbGlzdCcpO1xuICB9XG5cbiAgY2xvc2VFbGVtZW50KCkge1xuICAgIGFzc2VydChmYWxzZSwgJ0Nhbm5vdCBjbG9zZUVsZW1lbnQgZGlyZWN0bHkgaW5zaWRlIGEgYmxvY2sgbGlzdCcpO1xuICB9XG5cbiAgZGlkQXBwZW5kTm9kZShfbm9kZTogU2ltcGxlTm9kZSkge1xuICAgIGFzc2VydChmYWxzZSwgJ0Nhbm5vdCBjcmVhdGUgYSBuZXcgbm9kZSBkaXJlY3RseSBpbnNpZGUgYSBibG9jayBsaXN0Jyk7XG4gIH1cblxuICBkaWRBcHBlbmRCb3VuZHMoX2JvdW5kczogQm91bmRzKSB7fVxuXG4gIGZpbmFsaXplKF9zdGFjazogRWxlbWVudEJ1aWxkZXIpIHtcbiAgICBhc3NlcnQodGhpcy5ib3VuZExpc3QuaGVhZCgpICE9PSBudWxsLCAnYm91bmRzTGlzdCBjYW5ub3QgYmUgZW1wdHknKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xpZW50QnVpbGRlcihlbnY6IEVudmlyb25tZW50LCBjdXJzb3I6IEN1cnNvckltcGwpOiBFbGVtZW50QnVpbGRlciB7XG4gIHJldHVybiBOZXdFbGVtZW50QnVpbGRlci5mb3JJbml0aWFsUmVuZGVyKGVudiwgY3Vyc29yKTtcbn1cbiIsImltcG9ydCB7XG4gIFNpbXBsZUVsZW1lbnQsXG4gIFNpbXBsZURvY3VtZW50LFxuICBOYW1lc3BhY2UsXG4gIFNpbXBsZU5vZGUsXG4gIEluc2VydFBvc2l0aW9uLFxuICBTaW1wbGVUZXh0LFxuICBTaW1wbGVDb21tZW50LFxufSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgRGljdCwgT3B0aW9uLCBCb3VuZHMgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IENvbmNyZXRlQm91bmRzIH0gZnJvbSAnLi4vYm91bmRzJztcbmltcG9ydCB7IGV4cGVjdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG4vLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sL3N5bnRheC5odG1sI2h0bWwtaW50ZWdyYXRpb24tcG9pbnRcbmNvbnN0IFNWR19JTlRFR1JBVElPTl9QT0lOVFMgPSB7IGZvcmVpZ25PYmplY3Q6IDEsIGRlc2M6IDEsIHRpdGxlOiAxIH07XG5cbi8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWwvc3ludGF4Lmh0bWwjYWRqdXN0LXN2Zy1hdHRyaWJ1dGVzXG4vLyBUT0RPOiBBZGp1c3QgU1ZHIGF0dHJpYnV0ZXNcblxuLy8gaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbC9zeW50YXguaHRtbCNwYXJzaW5nLW1haW4taW5mb3JlaWduXG4vLyBUT0RPOiBBZGp1c3QgU1ZHIGVsZW1lbnRzXG5cbi8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWwvc3ludGF4Lmh0bWwjcGFyc2luZy1tYWluLWluZm9yZWlnblxuZXhwb3J0IGNvbnN0IEJMQUNLTElTVF9UQUJMRSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbmV4cG9ydCBjbGFzcyBET01PcGVyYXRpb25zIHtcbiAgcHJvdGVjdGVkIHVzZWxlc3NFbGVtZW50ITogU2ltcGxlRWxlbWVudDsgLy8gU2V0IGJ5IHRoaXMuc2V0dXBVc2VsZXNzRWxlbWVudCgpIGluIGNvbnN0cnVjdG9yXG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCkge1xuICAgIHRoaXMuc2V0dXBVc2VsZXNzRWxlbWVudCgpO1xuICB9XG5cbiAgLy8gc3BsaXQgaW50byBzZXBlcmF0ZSBtZXRob2Qgc28gdGhhdCBOb2RlRE9NVHJlZUNvbnN0cnVjdGlvblxuICAvLyBjYW4gb3ZlcnJpZGUgaXQuXG4gIHByb3RlY3RlZCBzZXR1cFVzZWxlc3NFbGVtZW50KCkge1xuICAgIHRoaXMudXNlbGVzc0VsZW1lbnQgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB9XG5cbiAgY3JlYXRlRWxlbWVudCh0YWc6IHN0cmluZywgY29udGV4dD86IFNpbXBsZUVsZW1lbnQpOiBTaW1wbGVFbGVtZW50IHtcbiAgICBsZXQgaXNFbGVtZW50SW5TVkdOYW1lc3BhY2U6IGJvb2xlYW4sIGlzSFRNTEludGVncmF0aW9uUG9pbnQ6IGJvb2xlYW47XG5cbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgaXNFbGVtZW50SW5TVkdOYW1lc3BhY2UgPSBjb250ZXh0Lm5hbWVzcGFjZVVSSSA9PT0gTmFtZXNwYWNlLlNWRyB8fCB0YWcgPT09ICdzdmcnO1xuICAgICAgaXNIVE1MSW50ZWdyYXRpb25Qb2ludCA9ICEhKFNWR19JTlRFR1JBVElPTl9QT0lOVFMgYXMgRGljdDxudW1iZXI+KVtjb250ZXh0LnRhZ05hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBpc0VsZW1lbnRJblNWR05hbWVzcGFjZSA9IHRhZyA9PT0gJ3N2Zyc7XG4gICAgICBpc0hUTUxJbnRlZ3JhdGlvblBvaW50ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGlzRWxlbWVudEluU1ZHTmFtZXNwYWNlICYmICFpc0hUTUxJbnRlZ3JhdGlvblBvaW50KSB7XG4gICAgICAvLyBGSVhNRTogVGhpcyBkb2VzIG5vdCBwcm9wZXJseSBoYW5kbGUgPGZvbnQ+IHdpdGggY29sb3IsIGZhY2UsIG9yXG4gICAgICAvLyBzaXplIGF0dHJpYnV0ZXMsIHdoaWNoIGlzIGFsc28gZGlzYWxsb3dlZCBieSB0aGUgc3BlYy4gV2Ugc2hvdWxkIGZpeFxuICAgICAgLy8gdGhpcy5cbiAgICAgIGlmIChCTEFDS0xJU1RfVEFCTEVbdGFnXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBjcmVhdGUgYSAke3RhZ30gaW5zaWRlIGFuIFNWRyBjb250ZXh0YCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhOYW1lc3BhY2UuU1ZHLCB0YWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgfVxuICB9XG5cbiAgaW5zZXJ0QmVmb3JlKHBhcmVudDogU2ltcGxlRWxlbWVudCwgbm9kZTogU2ltcGxlTm9kZSwgcmVmZXJlbmNlOiBPcHRpb248U2ltcGxlTm9kZT4pIHtcbiAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIHJlZmVyZW5jZSk7XG4gIH1cblxuICBpbnNlcnRIVE1MQmVmb3JlKHBhcmVudDogU2ltcGxlRWxlbWVudCwgbmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPiwgaHRtbDogc3RyaW5nKTogQm91bmRzIHtcbiAgICBpZiAoaHRtbCA9PT0gJycpIHtcbiAgICAgIGxldCBjb21tZW50ID0gdGhpcy5jcmVhdGVDb21tZW50KCcnKTtcbiAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY29tbWVudCwgbmV4dFNpYmxpbmcpO1xuICAgICAgcmV0dXJuIG5ldyBDb25jcmV0ZUJvdW5kcyhwYXJlbnQsIGNvbW1lbnQsIGNvbW1lbnQpO1xuICAgIH1cblxuICAgIGxldCBwcmV2ID0gbmV4dFNpYmxpbmcgPyBuZXh0U2libGluZy5wcmV2aW91c1NpYmxpbmcgOiBwYXJlbnQubGFzdENoaWxkO1xuICAgIGxldCBsYXN0OiBTaW1wbGVOb2RlO1xuXG4gICAgaWYgKG5leHRTaWJsaW5nID09PSBudWxsKSB7XG4gICAgICBwYXJlbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKEluc2VydFBvc2l0aW9uLmJlZm9yZWVuZCwgaHRtbCk7XG4gICAgICBsYXN0ID0gZXhwZWN0KHBhcmVudC5sYXN0Q2hpbGQsICdidWcgaW4gaW5zZXJ0QWRqYWNlbnRIVE1MPycpO1xuICAgIH0gZWxzZSBpZiAobmV4dFNpYmxpbmcgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgbmV4dFNpYmxpbmcuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsIGh0bWwpO1xuICAgICAgbGFzdCA9IGV4cGVjdChuZXh0U2libGluZy5wcmV2aW91c1NpYmxpbmcsICdidWcgaW4gaW5zZXJ0QWRqYWNlbnRIVE1MPycpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOb24tZWxlbWVudCBub2RlcyBkbyBub3Qgc3VwcG9ydCBpbnNlcnRBZGphY2VudEhUTUwsIHNvIGFkZCBhblxuICAgICAgLy8gZWxlbWVudCBhbmQgY2FsbCBpdCBvbiB0aGF0IGVsZW1lbnQuIFRoZW4gcmVtb3ZlIHRoZSBlbGVtZW50LlxuICAgICAgLy9cbiAgICAgIC8vIFRoaXMgYWxzbyBwcm90ZWN0cyBFZGdlLCBJRSBhbmQgRmlyZWZveCB3L28gdGhlIGluc3BlY3RvciBvcGVuXG4gICAgICAvLyBmcm9tIG1lcmdpbmcgYWRqYWNlbnQgdGV4dCBub2Rlcy4gU2VlIC4vY29tcGF0L3RleHQtbm9kZS1tZXJnaW5nLWZpeC50c1xuICAgICAgbGV0IHsgdXNlbGVzc0VsZW1lbnQgfSA9IHRoaXM7XG5cbiAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodXNlbGVzc0VsZW1lbnQsIG5leHRTaWJsaW5nKTtcbiAgICAgIHVzZWxlc3NFbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChJbnNlcnRQb3NpdGlvbi5iZWZvcmViZWdpbiwgaHRtbCk7XG4gICAgICBsYXN0ID0gZXhwZWN0KHVzZWxlc3NFbGVtZW50LnByZXZpb3VzU2libGluZywgJ2J1ZyBpbiBpbnNlcnRBZGphY2VudEhUTUw/Jyk7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQodXNlbGVzc0VsZW1lbnQpO1xuICAgIH1cblxuICAgIGxldCBmaXJzdCA9IGV4cGVjdChwcmV2ID8gcHJldi5uZXh0U2libGluZyA6IHBhcmVudC5maXJzdENoaWxkLCAnYnVnIGluIGluc2VydEFkamFjZW50SFRNTD8nKTtcbiAgICByZXR1cm4gbmV3IENvbmNyZXRlQm91bmRzKHBhcmVudCwgZmlyc3QsIGxhc3QpO1xuICB9XG5cbiAgY3JlYXRlVGV4dE5vZGUodGV4dDogc3RyaW5nKTogU2ltcGxlVGV4dCB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gIH1cblxuICBjcmVhdGVDb21tZW50KGRhdGE6IHN0cmluZyk6IFNpbXBsZUNvbW1lbnQge1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoZGF0YSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVOb2Rlc0JlZm9yZShcbiAgc291cmNlOiBTaW1wbGVOb2RlLFxuICB0YXJnZXQ6IFNpbXBsZUVsZW1lbnQsXG4gIG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT5cbik6IEJvdW5kcyB7XG4gIGxldCBmaXJzdCA9IGV4cGVjdChzb3VyY2UuZmlyc3RDaGlsZCwgJ3NvdXJjZSBpcyBlbXB0eScpO1xuICBsZXQgbGFzdDogU2ltcGxlTm9kZSA9IGZpcnN0O1xuICBsZXQgY3VycmVudDogT3B0aW9uPFNpbXBsZU5vZGU+ID0gZmlyc3Q7XG5cbiAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICBsZXQgbmV4dDogT3B0aW9uPFNpbXBsZU5vZGU+ID0gY3VycmVudC5uZXh0U2libGluZztcblxuICAgIHRhcmdldC5pbnNlcnRCZWZvcmUoY3VycmVudCwgbmV4dFNpYmxpbmcpO1xuXG4gICAgbGFzdCA9IGN1cnJlbnQ7XG4gICAgY3VycmVudCA9IG5leHQ7XG4gIH1cblxuICByZXR1cm4gbmV3IENvbmNyZXRlQm91bmRzKHRhcmdldCwgZmlyc3QsIGxhc3QpO1xufVxuIiwiaW1wb3J0IHsgQm91bmRzIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NlcnQsIGNsZWFyRWxlbWVudCwgT3B0aW9uLCB1bndyYXAgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIEluc2VydFBvc2l0aW9uLFxuICBOYW1lc3BhY2UsXG4gIFNpbXBsZURvY3VtZW50LFxuICBTaW1wbGVFbGVtZW50LFxuICBTaW1wbGVOb2RlLFxufSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgRE9NT3BlcmF0aW9ucywgbW92ZU5vZGVzQmVmb3JlIH0gZnJvbSAnLi4vZG9tL29wZXJhdGlvbnMnO1xuXG5leHBvcnQgY29uc3QgU1ZHX05BTUVTUEFDRSA9IE5hbWVzcGFjZS5TVkc7XG5leHBvcnQgdHlwZSBTVkdfTkFNRVNQQUNFID0gdHlwZW9mIFNWR19OQU1FU1BBQ0U7XG5cbi8vIFBhdGNoOiAgICBpbnNlcnRBZGphY2VudEhUTUwgb24gU1ZHIEZpeFxuLy8gQnJvd3NlcnM6IFNhZmFyaSwgSUUsIEVkZ2UsIEZpcmVmb3ggfjMzLTM0XG4vLyBSZWFzb246ICAgaW5zZXJ0QWRqYWNlbnRIVE1MIGRvZXMgbm90IGV4aXN0IG9uIFNWRyBlbGVtZW50cyBpbiBTYWZhcmkuIEl0IGlzXG4vLyAgICAgICAgICAgcHJlc2VudCBidXQgdGhyb3dzIGFuIGV4Y2VwdGlvbiBvbiBJRSBhbmQgRWRnZS4gT2xkIHZlcnNpb25zIG9mXG4vLyAgICAgICAgICAgRmlyZWZveCBjcmVhdGUgbm9kZXMgaW4gdGhlIGluY29ycmVjdCBuYW1lc3BhY2UuXG4vLyBGaXg6ICAgICAgU2luY2UgSUUgYW5kIEVkZ2Ugc2lsZW50bHkgZmFpbCB0byBjcmVhdGUgU1ZHIG5vZGVzIHVzaW5nXG4vLyAgICAgICAgICAgaW5uZXJIVE1MLCBhbmQgYmVjYXVzZSBGaXJlZm94IG1heSBjcmVhdGUgbm9kZXMgaW4gdGhlIGluY29ycmVjdFxuLy8gICAgICAgICAgIG5hbWVzcGFjZSB1c2luZyBpbm5lckhUTUwgb24gU1ZHIGVsZW1lbnRzLCBhbiBIVE1MLXN0cmluZyB3cmFwcGluZ1xuLy8gICAgICAgICAgIGFwcHJvYWNoIGlzIHVzZWQuIEEgcHJlL3Bvc3QgU1ZHIHRhZyBpcyBhZGRlZCB0byB0aGUgc3RyaW5nLCB0aGVuXG4vLyAgICAgICAgICAgdGhhdCB3aG9sZSBzdHJpbmcgaXMgYWRkZWQgdG8gYSBkaXYuIFRoZSBjcmVhdGVkIG5vZGVzIGFyZSBwbHVja2VkXG4vLyAgICAgICAgICAgb3V0IGFuZCBhcHBsaWVkIHRvIHRoZSB0YXJnZXQgbG9jYXRpb24gb24gRE9NLlxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U1ZHSW5uZXJIVE1MRml4KFxuICBkb2N1bWVudDogT3B0aW9uPFNpbXBsZURvY3VtZW50PixcbiAgRE9NQ2xhc3M6IHR5cGVvZiBET01PcGVyYXRpb25zLFxuICBzdmdOYW1lc3BhY2U6IFNWR19OQU1FU1BBQ0Vcbik6IHR5cGVvZiBET01PcGVyYXRpb25zIHtcbiAgaWYgKCFkb2N1bWVudCkgcmV0dXJuIERPTUNsYXNzO1xuXG4gIGlmICghc2hvdWxkQXBwbHlGaXgoZG9jdW1lbnQsIHN2Z05hbWVzcGFjZSkpIHtcbiAgICByZXR1cm4gRE9NQ2xhc3M7XG4gIH1cblxuICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgYXMgU2ltcGxlRWxlbWVudDtcblxuICByZXR1cm4gY2xhc3MgRE9NQ2hhbmdlc1dpdGhTVkdJbm5lckhUTUxGaXggZXh0ZW5kcyBET01DbGFzcyB7XG4gICAgaW5zZXJ0SFRNTEJlZm9yZShwYXJlbnQ6IFNpbXBsZUVsZW1lbnQsIG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT4sIGh0bWw6IHN0cmluZyk6IEJvdW5kcyB7XG4gICAgICBpZiAoaHRtbCA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmluc2VydEhUTUxCZWZvcmUocGFyZW50LCBuZXh0U2libGluZywgaHRtbCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJlbnQubmFtZXNwYWNlVVJJICE9PSBzdmdOYW1lc3BhY2UpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmluc2VydEhUTUxCZWZvcmUocGFyZW50LCBuZXh0U2libGluZywgaHRtbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmaXhTVkcocGFyZW50LCBkaXYsIGh0bWwsIG5leHRTaWJsaW5nKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGZpeFNWRyhcbiAgcGFyZW50OiBTaW1wbGVFbGVtZW50LFxuICBkaXY6IFNpbXBsZUVsZW1lbnQsXG4gIGh0bWw6IHN0cmluZyxcbiAgcmVmZXJlbmNlOiBPcHRpb248U2ltcGxlTm9kZT5cbik6IEJvdW5kcyB7XG4gIGFzc2VydChodG1sICE9PSAnJywgJ2h0bWwgY2Fubm90IGJlIGVtcHR5Jyk7XG5cbiAgbGV0IHNvdXJjZTogU2ltcGxlTm9kZTtcblxuICAvLyBUaGlzIGlzIGltcG9ydGFudCwgYmVjYXVzZSBkZWNlbmRhbnRzIG9mIHRoZSA8Zm9yZWlnbk9iamVjdD4gaW50ZWdyYXRpb25cbiAgLy8gcG9pbnQgYXJlIHBhcnNlZCBpbiB0aGUgSFRNTCBuYW1lc3BhY2VcbiAgaWYgKHBhcmVudC50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdGT1JFSUdOT0JKRUNUJykge1xuICAgIC8vIElFLCBFZGdlOiBhbHNvIGRvIG5vdCBjb3JyZWN0bHkgc3VwcG9ydCB1c2luZyBgaW5uZXJIVE1MYCBvbiBTVkdcbiAgICAvLyBuYW1lc3BhY2VkIGVsZW1lbnRzLiBTbyBoZXJlIGEgd3JhcHBlciBpcyB1c2VkLlxuICAgIGxldCB3cmFwcGVkSHRtbCA9ICc8c3ZnPjxmb3JlaWduT2JqZWN0PicgKyBodG1sICsgJzwvZm9yZWlnbk9iamVjdD48L3N2Zz4nO1xuXG4gICAgY2xlYXJFbGVtZW50KGRpdik7XG4gICAgZGl2Lmluc2VydEFkamFjZW50SFRNTChJbnNlcnRQb3NpdGlvbi5hZnRlcmJlZ2luLCB3cmFwcGVkSHRtbCk7XG5cbiAgICBzb3VyY2UgPSBkaXYuZmlyc3RDaGlsZCEuZmlyc3RDaGlsZCE7XG4gIH0gZWxzZSB7XG4gICAgLy8gSUUsIEVkZ2U6IGFsc28gZG8gbm90IGNvcnJlY3RseSBzdXBwb3J0IHVzaW5nIGBpbm5lckhUTUxgIG9uIFNWR1xuICAgIC8vIG5hbWVzcGFjZWQgZWxlbWVudHMuIFNvIGhlcmUgYSB3cmFwcGVyIGlzIHVzZWQuXG4gICAgbGV0IHdyYXBwZWRIdG1sID0gJzxzdmc+JyArIGh0bWwgKyAnPC9zdmc+JztcblxuICAgIGNsZWFyRWxlbWVudChkaXYpO1xuICAgIGRpdi5pbnNlcnRBZGphY2VudEhUTUwoSW5zZXJ0UG9zaXRpb24uYWZ0ZXJiZWdpbiwgd3JhcHBlZEh0bWwpO1xuXG4gICAgc291cmNlID0gZGl2LmZpcnN0Q2hpbGQhO1xuICB9XG5cbiAgcmV0dXJuIG1vdmVOb2Rlc0JlZm9yZShzb3VyY2UsIHBhcmVudCwgcmVmZXJlbmNlKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkQXBwbHlGaXgoZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50LCBzdmdOYW1lc3BhY2U6IFNWR19OQU1FU1BBQ0UpIHtcbiAgbGV0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhzdmdOYW1lc3BhY2UsICdzdmcnKTtcblxuICB0cnkge1xuICAgIHN2Zy5pbnNlcnRBZGphY2VudEhUTUwoSW5zZXJ0UG9zaXRpb24uYmVmb3JlZW5kLCAnPGNpcmNsZT48L2NpcmNsZT4nKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElFLCBFZGdlOiBXaWxsIHRocm93LCBpbnNlcnRBZGphY2VudEhUTUwgaXMgdW5zdXBwb3J0ZWQgb24gU1ZHXG4gICAgLy8gU2FmYXJpOiBXaWxsIHRocm93LCBpbnNlcnRBZGphY2VudEhUTUwgaXMgbm90IHByZXNlbnQgb24gU1ZHXG4gIH0gZmluYWxseSB7XG4gICAgLy8gRkY6IE9sZCB2ZXJzaW9ucyB3aWxsIGNyZWF0ZSBhIG5vZGUgaW4gdGhlIHdyb25nIG5hbWVzcGFjZVxuICAgIGlmIChcbiAgICAgIHN2Zy5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgKHVud3JhcChzdmcuZmlyc3RDaGlsZCkgYXMgTm9kZSkubmFtZXNwYWNlVVJJID09PSBTVkdfTkFNRVNQQUNFXG4gICAgKSB7XG4gICAgICAvLyBUaGUgdGVzdCB3b3JrZWQgYXMgZXhwZWN0ZWQsIG5vIGZpeCByZXF1aXJlZFxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iLCJpbXBvcnQgeyBCb3VuZHMgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHtcbiAgU2ltcGxlRG9jdW1lbnQsXG4gIFNpbXBsZUNvbW1lbnQsXG4gIEluc2VydFBvc2l0aW9uLFxuICBTaW1wbGVFbGVtZW50LFxuICBTaW1wbGVOb2RlLFxufSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgRE9NT3BlcmF0aW9ucyB9IGZyb20gJy4uL2RvbS9vcGVyYXRpb25zJztcblxuLy8gUGF0Y2g6ICAgIEFkamFjZW50IHRleHQgbm9kZSBtZXJnaW5nIGZpeFxuLy8gQnJvd3NlcnM6IElFLCBFZGdlLCBGaXJlZm94IHcvbyBpbnNwZWN0b3Igb3BlblxuLy8gUmVhc29uOiAgIFRoZXNlIGJyb3dzZXJzIHdpbGwgbWVyZ2UgYWRqYWNlbnQgdGV4dCBub2Rlcy4gRm9yIGV4bWFwbGUgZ2l2ZW5cbi8vICAgICAgICAgICA8ZGl2PkhlbGxvPC9kaXY+IHdpdGggZGl2Lmluc2VydEFkamFjZW50SFRNTCgnIHdvcmxkJykgYnJvd3NlcnNcbi8vICAgICAgICAgICB3aXRoIHByb3BlciBiZWhhdmlvciB3aWxsIHBvcHVsYXRlIGRpdi5jaGlsZE5vZGVzIHdpdGggdHdvIGl0ZW1zLlxuLy8gICAgICAgICAgIFRoZXNlIGJyb3dzZXJzIHdpbGwgcG9wdWxhdGUgaXQgd2l0aCBvbmUgbWVyZ2VkIG5vZGUgaW5zdGVhZC5cbi8vIEZpeDogICAgICBBZGQgdGhlc2Ugbm9kZXMgdG8gYSB3cmFwcGVyIGVsZW1lbnQsIHRoZW4gaXRlcmF0ZSB0aGUgY2hpbGROb2Rlc1xuLy8gICAgICAgICAgIG9mIHRoYXQgd3JhcHBlciBhbmQgbW92ZSB0aGUgbm9kZXMgdG8gdGhlaXIgdGFyZ2V0IGxvY2F0aW9uLiBOb3RlXG4vLyAgICAgICAgICAgdGhhdCBwb3RlbnRpYWwgU1ZHIGJ1Z3Mgd2lsbCBoYXZlIGJlZW4gaGFuZGxlZCBiZWZvcmUgdGhpcyBmaXguXG4vLyAgICAgICAgICAgTm90ZSB0aGF0IHRoaXMgZml4IG11c3Qgb25seSBhcHBseSB0byB0aGUgcHJldmlvdXMgdGV4dCBub2RlLCBhc1xuLy8gICAgICAgICAgIHRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBpbnNlcnRIVE1MQmVmb3JlYCBhbHJlYWR5IGhhbmRsZXNcbi8vICAgICAgICAgICBmb2xsb3dpbmcgdGV4dCBub2RlcyBjb3JyZWN0bHkuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlUZXh0Tm9kZU1lcmdpbmdGaXgoXG4gIGRvY3VtZW50OiBPcHRpb248U2ltcGxlRG9jdW1lbnQ+LFxuICBET01DbGFzczogdHlwZW9mIERPTU9wZXJhdGlvbnNcbik6IHR5cGVvZiBET01PcGVyYXRpb25zIHtcbiAgaWYgKCFkb2N1bWVudCkgcmV0dXJuIERPTUNsYXNzO1xuXG4gIGlmICghc2hvdWxkQXBwbHlGaXgoZG9jdW1lbnQpKSB7XG4gICAgcmV0dXJuIERPTUNsYXNzO1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIERPTUNoYW5nZXNXaXRoVGV4dE5vZGVNZXJnaW5nRml4IGV4dGVuZHMgRE9NQ2xhc3Mge1xuICAgIHByaXZhdGUgdXNlbGVzc0NvbW1lbnQ6IFNpbXBsZUNvbW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQpIHtcbiAgICAgIHN1cGVyKGRvY3VtZW50KTtcbiAgICAgIHRoaXMudXNlbGVzc0NvbW1lbnQgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbiAgICB9XG5cbiAgICBpbnNlcnRIVE1MQmVmb3JlKHBhcmVudDogU2ltcGxlRWxlbWVudCwgbmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPiwgaHRtbDogc3RyaW5nKTogQm91bmRzIHtcbiAgICAgIGlmIChodG1sID09PSAnJykge1xuICAgICAgICByZXR1cm4gc3VwZXIuaW5zZXJ0SFRNTEJlZm9yZShwYXJlbnQsIG5leHRTaWJsaW5nLCBodG1sKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGRpZFNldFVzZWxlc3NDb21tZW50ID0gZmFsc2U7XG5cbiAgICAgIGxldCBuZXh0UHJldmlvdXMgPSBuZXh0U2libGluZyA/IG5leHRTaWJsaW5nLnByZXZpb3VzU2libGluZyA6IHBhcmVudC5sYXN0Q2hpbGQ7XG5cbiAgICAgIGlmIChuZXh0UHJldmlvdXMgJiYgbmV4dFByZXZpb3VzIGluc3RhbmNlb2YgVGV4dCkge1xuICAgICAgICBkaWRTZXRVc2VsZXNzQ29tbWVudCA9IHRydWU7XG4gICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodGhpcy51c2VsZXNzQ29tbWVudCwgbmV4dFNpYmxpbmcpO1xuICAgICAgfVxuXG4gICAgICBsZXQgYm91bmRzID0gc3VwZXIuaW5zZXJ0SFRNTEJlZm9yZShwYXJlbnQsIG5leHRTaWJsaW5nLCBodG1sKTtcblxuICAgICAgaWYgKGRpZFNldFVzZWxlc3NDb21tZW50KSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzLnVzZWxlc3NDb21tZW50KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHNob3VsZEFwcGx5Rml4KGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCkge1xuICBsZXQgbWVyZ2luZ1RleHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICBtZXJnaW5nVGV4dERpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnZmlyc3QnKSk7XG4gIG1lcmdpbmdUZXh0RGl2Lmluc2VydEFkamFjZW50SFRNTChJbnNlcnRQb3NpdGlvbi5iZWZvcmVlbmQsICdzZWNvbmQnKTtcblxuICBpZiAobWVyZ2luZ1RleHREaXYuY2hpbGROb2Rlcy5sZW5ndGggPT09IDIpIHtcbiAgICAvLyBJdCB3b3JrZWQgYXMgZXhwZWN0ZWQsIG5vIGZpeCByZXF1aXJlZFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIiwiaW1wb3J0IHsgR2xpbW1lclRyZWVDaGFuZ2VzLCBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbiB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQge1xuICBBdHRyTmFtZXNwYWNlLFxuICBFbGVtZW50TmFtZXNwYWNlLFxuICBOYW1lc3BhY2UsXG4gIFNpbXBsZURvY3VtZW50LFxuICBTaW1wbGVFbGVtZW50LFxuICBTaW1wbGVOb2RlLFxufSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgYXBwbHlTVkdJbm5lckhUTUxGaXggfSBmcm9tICcuLi9jb21wYXQvc3ZnLWlubmVyLWh0bWwtZml4JztcbmltcG9ydCB7IGFwcGx5VGV4dE5vZGVNZXJnaW5nRml4IH0gZnJvbSAnLi4vY29tcGF0L3RleHQtbm9kZS1tZXJnaW5nLWZpeCc7XG5pbXBvcnQgeyBET01PcGVyYXRpb25zLCBCTEFDS0xJU1RfVEFCTEUgfSBmcm9tICcuL29wZXJhdGlvbnMnO1xuXG5bXG4gICdiJyxcbiAgJ2JpZycsXG4gICdibG9ja3F1b3RlJyxcbiAgJ2JvZHknLFxuICAnYnInLFxuICAnY2VudGVyJyxcbiAgJ2NvZGUnLFxuICAnZGQnLFxuICAnZGl2JyxcbiAgJ2RsJyxcbiAgJ2R0JyxcbiAgJ2VtJyxcbiAgJ2VtYmVkJyxcbiAgJ2gxJyxcbiAgJ2gyJyxcbiAgJ2gzJyxcbiAgJ2g0JyxcbiAgJ2g1JyxcbiAgJ2g2JyxcbiAgJ2hlYWQnLFxuICAnaHInLFxuICAnaScsXG4gICdpbWcnLFxuICAnbGknLFxuICAnbGlzdGluZycsXG4gICdtYWluJyxcbiAgJ21ldGEnLFxuICAnbm9icicsXG4gICdvbCcsXG4gICdwJyxcbiAgJ3ByZScsXG4gICdydWJ5JyxcbiAgJ3MnLFxuICAnc21hbGwnLFxuICAnc3BhbicsXG4gICdzdHJvbmcnLFxuICAnc3RyaWtlJyxcbiAgJ3N1YicsXG4gICdzdXAnLFxuICAndGFibGUnLFxuICAndHQnLFxuICAndScsXG4gICd1bCcsXG4gICd2YXInLFxuXS5mb3JFYWNoKHRhZyA9PiAoQkxBQ0tMSVNUX1RBQkxFW3RhZ10gPSAxKSk7XG5cbmNvbnN0IFdISVRFU1BBQ0UgPSAvW1xcdC1cXHIgXFx4QTBcXHUxNjgwXFx1MTgwRVxcdTIwMDAtXFx1MjAwQVxcdTIwMjhcXHUyMDI5XFx1MjAyRlxcdTIwNUZcXHUzMDAwXFx1RkVGRl0vO1xuXG5sZXQgZG9jOiBPcHRpb248U2ltcGxlRG9jdW1lbnQ+ID1cbiAgdHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiAoZG9jdW1lbnQgYXMgU2ltcGxlRG9jdW1lbnQpO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKHN0cmluZzogc3RyaW5nKSB7XG4gIHJldHVybiBXSElURVNQQUNFLnRlc3Qoc3RyaW5nKTtcbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBET00ge1xuICBleHBvcnQgY2xhc3MgVHJlZUNvbnN0cnVjdGlvbiBleHRlbmRzIERPTU9wZXJhdGlvbnMgaW1wbGVtZW50cyBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbiB7XG4gICAgY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZTogRWxlbWVudE5hbWVzcGFjZSwgdGFnOiBzdHJpbmcpOiBTaW1wbGVFbGVtZW50IHtcbiAgICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIHRhZyk7XG4gICAgfVxuXG4gICAgc2V0QXR0cmlidXRlKFxuICAgICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPiA9IG51bGxcbiAgICApIHtcbiAgICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhuYW1lc3BhY2UsIG5hbWUsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsZXQgYXBwbGllZFRyZWVDb250cnVjdGlvbiA9IFRyZWVDb25zdHJ1Y3Rpb247XG4gIGFwcGxpZWRUcmVlQ29udHJ1Y3Rpb24gPSBhcHBseVRleHROb2RlTWVyZ2luZ0ZpeChcbiAgICBkb2MsXG4gICAgYXBwbGllZFRyZWVDb250cnVjdGlvblxuICApIGFzIHR5cGVvZiBUcmVlQ29uc3RydWN0aW9uO1xuICBhcHBsaWVkVHJlZUNvbnRydWN0aW9uID0gYXBwbHlTVkdJbm5lckhUTUxGaXgoXG4gICAgZG9jLFxuICAgIGFwcGxpZWRUcmVlQ29udHJ1Y3Rpb24sXG4gICAgTmFtZXNwYWNlLlNWR1xuICApIGFzIHR5cGVvZiBUcmVlQ29uc3RydWN0aW9uO1xuXG4gIGV4cG9ydCBjb25zdCBET01UcmVlQ29uc3RydWN0aW9uID0gYXBwbGllZFRyZWVDb250cnVjdGlvbjtcbiAgZXhwb3J0IHR5cGUgRE9NVHJlZUNvbnN0cnVjdGlvbiA9IFRyZWVDb25zdHJ1Y3Rpb247XG59XG5cbmV4cG9ydCBjbGFzcyBET01DaGFuZ2VzSW1wbCBleHRlbmRzIERPTU9wZXJhdGlvbnMgaW1wbGVtZW50cyBHbGltbWVyVHJlZUNoYW5nZXMge1xuICBwcm90ZWN0ZWQgbmFtZXNwYWNlOiBPcHRpb248c3RyaW5nPjtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50KSB7XG4gICAgc3VwZXIoZG9jdW1lbnQpO1xuICAgIHRoaXMubmFtZXNwYWNlID0gbnVsbDtcbiAgfVxuXG4gIHNldEF0dHJpYnV0ZShlbGVtZW50OiBTaW1wbGVFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gIH1cblxuICByZW1vdmVBdHRyaWJ1dGUoZWxlbWVudDogU2ltcGxlRWxlbWVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH1cblxuICBpbnNlcnRBZnRlcihlbGVtZW50OiBTaW1wbGVFbGVtZW50LCBub2RlOiBTaW1wbGVOb2RlLCByZWZlcmVuY2U6IFNpbXBsZU5vZGUpIHtcbiAgICB0aGlzLmluc2VydEJlZm9yZShlbGVtZW50LCBub2RlLCByZWZlcmVuY2UubmV4dFNpYmxpbmcpO1xuICB9XG59XG5cbmxldCBoZWxwZXIgPSBET01DaGFuZ2VzSW1wbDtcblxuaGVscGVyID0gYXBwbHlUZXh0Tm9kZU1lcmdpbmdGaXgoZG9jLCBoZWxwZXIpIGFzIHR5cGVvZiBET01DaGFuZ2VzSW1wbDtcbmhlbHBlciA9IGFwcGx5U1ZHSW5uZXJIVE1MRml4KGRvYywgaGVscGVyLCBOYW1lc3BhY2UuU1ZHKSBhcyB0eXBlb2YgRE9NQ2hhbmdlc0ltcGw7XG5cbmV4cG9ydCBkZWZhdWx0IGhlbHBlcjtcbmV4cG9ydCBjb25zdCBET01UcmVlQ29uc3RydWN0aW9uID0gRE9NLkRPTVRyZWVDb25zdHJ1Y3Rpb247XG5leHBvcnQgdHlwZSBET01UcmVlQ29uc3RydWN0aW9uID0gRE9NLkRPTVRyZWVDb25zdHJ1Y3Rpb247XG5leHBvcnQgdHlwZSBET01OYW1lc3BhY2UgPSBOYW1lc3BhY2U7XG4iLCJpbXBvcnQgeyBPcHRpb24sIFJlY2FzdCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQ29uc3RSZWZlcmVuY2UsIFBhdGhSZWZlcmVuY2UsIFJlZmVyZW5jZSwgVGFnIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcblxuZXhwb3J0IHR5cGUgUHJpbWl0aXZlID0gdW5kZWZpbmVkIHwgbnVsbCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmc7XG5cbmV4cG9ydCBjbGFzcyBQcmltaXRpdmVSZWZlcmVuY2U8VCBleHRlbmRzIFByaW1pdGl2ZT4gZXh0ZW5kcyBDb25zdFJlZmVyZW5jZTxUPlxuICBpbXBsZW1lbnRzIFBhdGhSZWZlcmVuY2U8VD4ge1xuICBzdGF0aWMgY3JlYXRlPFQgZXh0ZW5kcyBQcmltaXRpdmU+KHZhbHVlOiBUKTogUHJpbWl0aXZlUmVmZXJlbmNlPFQ+IHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIFVOREVGSU5FRF9SRUZFUkVOQ0UgYXMgUHJpbWl0aXZlUmVmZXJlbmNlPFQ+O1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBOVUxMX1JFRkVSRU5DRSBhcyBQcmltaXRpdmVSZWZlcmVuY2U8VD47XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIFRSVUVfUkVGRVJFTkNFIGFzIFByaW1pdGl2ZVJlZmVyZW5jZTxUPjtcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIEZBTFNFX1JFRkVSRU5DRSBhcyBQcmltaXRpdmVSZWZlcmVuY2U8VD47XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4gbmV3IFZhbHVlUmVmZXJlbmNlKHZhbHVlKSBhcyBQcmltaXRpdmVSZWZlcmVuY2U8VD47XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgU3RyaW5nUmVmZXJlbmNlKHZhbHVlIGFzIHN0cmluZykgYXMgUmVjYXN0PFN0cmluZ1JlZmVyZW5jZSwgUHJpbWl0aXZlUmVmZXJlbmNlPFQ+PjtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IodmFsdWU6IFQpIHtcbiAgICBzdXBlcih2YWx1ZSk7XG4gIH1cblxuICBnZXQoX2tleTogc3RyaW5nKTogUHJpbWl0aXZlUmVmZXJlbmNlPFByaW1pdGl2ZT4ge1xuICAgIHJldHVybiBVTkRFRklORURfUkVGRVJFTkNFO1xuICB9XG59XG5cbmNsYXNzIFN0cmluZ1JlZmVyZW5jZSBleHRlbmRzIFByaW1pdGl2ZVJlZmVyZW5jZTxzdHJpbmc+IHtcbiAgcHJpdmF0ZSBsZW5ndGhSZWZlcmVuY2U6IE9wdGlvbjxQcmltaXRpdmVSZWZlcmVuY2U8bnVtYmVyPj4gPSBudWxsO1xuXG4gIGdldChrZXk6IHN0cmluZyk6IFByaW1pdGl2ZVJlZmVyZW5jZTxQcmltaXRpdmU+IHtcbiAgICBpZiAoa2V5ID09PSAnbGVuZ3RoJykge1xuICAgICAgbGV0IHsgbGVuZ3RoUmVmZXJlbmNlIH0gPSB0aGlzO1xuXG4gICAgICBpZiAobGVuZ3RoUmVmZXJlbmNlID09PSBudWxsKSB7XG4gICAgICAgIGxlbmd0aFJlZmVyZW5jZSA9IHRoaXMubGVuZ3RoUmVmZXJlbmNlID0gbmV3IFZhbHVlUmVmZXJlbmNlKHRoaXMuaW5uZXIubGVuZ3RoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxlbmd0aFJlZmVyZW5jZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLmdldChrZXkpO1xuICAgIH1cbiAgfVxufVxuXG50eXBlIFZhbHVlID0gdW5kZWZpbmVkIHwgbnVsbCB8IG51bWJlciB8IGJvb2xlYW47XG5cbmNsYXNzIFZhbHVlUmVmZXJlbmNlPFQgZXh0ZW5kcyBWYWx1ZT4gZXh0ZW5kcyBQcmltaXRpdmVSZWZlcmVuY2U8VD4ge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZTogVCkge1xuICAgIHN1cGVyKHZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVU5ERUZJTkVEX1JFRkVSRU5DRTogUHJpbWl0aXZlUmVmZXJlbmNlPHVuZGVmaW5lZD4gPSBuZXcgVmFsdWVSZWZlcmVuY2UodW5kZWZpbmVkKTtcbmV4cG9ydCBjb25zdCBOVUxMX1JFRkVSRU5DRTogUHJpbWl0aXZlUmVmZXJlbmNlPG51bGw+ID0gbmV3IFZhbHVlUmVmZXJlbmNlKG51bGwpO1xuZXhwb3J0IGNvbnN0IFRSVUVfUkVGRVJFTkNFOiBQcmltaXRpdmVSZWZlcmVuY2U8Ym9vbGVhbj4gPSBuZXcgVmFsdWVSZWZlcmVuY2UodHJ1ZSk7XG5leHBvcnQgY29uc3QgRkFMU0VfUkVGRVJFTkNFOiBQcmltaXRpdmVSZWZlcmVuY2U8Ym9vbGVhbj4gPSBuZXcgVmFsdWVSZWZlcmVuY2UoZmFsc2UpO1xuXG5leHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxSZWZlcmVuY2UgaW1wbGVtZW50cyBSZWZlcmVuY2U8Ym9vbGVhbj4ge1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBpbm5lcjogUmVmZXJlbmNlPHVua25vd24+LFxuICAgIHByaXZhdGUgdG9Cb29sOiAodmFsdWU6IHVua25vd24pID0+IGJvb2xlYW4gPSBkZWZhdWx0VG9Cb29sXG4gICkge1xuICAgIHRoaXMudGFnID0gaW5uZXIudGFnO1xuICB9XG5cbiAgdmFsdWUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudG9Cb29sKHRoaXMuaW5uZXIudmFsdWUoKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmYXVsdFRvQm9vbCh2YWx1ZTogdW5rbm93bikge1xuICByZXR1cm4gISF2YWx1ZTtcbn1cbiIsImltcG9ydCB7IERpY3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFNpbXBsZU5vZGUsIFNpbXBsZURvY3VtZW50RnJhZ21lbnQgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNhZmVTdHJpbmcge1xuICB0b0hUTUwoKTogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBJbnNlcnRpb24gPSBDYXV0aW91c0luc2VydGlvbiB8IFRydXN0aW5nSW5zZXJ0aW9uO1xuZXhwb3J0IHR5cGUgQ2F1dGlvdXNJbnNlcnRpb24gPSBzdHJpbmcgfCBTYWZlU3RyaW5nIHwgU2ltcGxlTm9kZTtcbmV4cG9ydCB0eXBlIFRydXN0aW5nSW5zZXJ0aW9uID0gc3RyaW5nIHwgU2ltcGxlTm9kZTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmluZ1ZhbHVlKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgaWYgKGlzRW1wdHkodmFsdWUpKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiBTdHJpbmcodmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVHJ1c3RlZFZhbHVlKHZhbHVlOiB1bmtub3duKTogVHJ1c3RpbmdJbnNlcnRpb24ge1xuICBpZiAoaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTYWZlU3RyaW5nKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS50b0hUTUwoKTtcbiAgfVxuICBpZiAoaXNOb2RlKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZENvZXJjZSh2YWx1ZTogdW5rbm93bikge1xuICByZXR1cm4gKFxuICAgIGlzU3RyaW5nKHZhbHVlKSB8fCBpc0VtcHR5KHZhbHVlKSB8fCB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiAodmFsdWUgYXMgRGljdCkudG9TdHJpbmcgIT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NhZmVTdHJpbmcodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBTYWZlU3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mICh2YWx1ZSBhcyBhbnkpLnRvSFRNTCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTm9kZSh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFNpbXBsZU5vZGUge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgKHZhbHVlIGFzIGFueSkubm9kZVR5cGUgPT09ICdudW1iZXInO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGcmFnbWVudCh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFNpbXBsZURvY3VtZW50RnJhZ21lbnQge1xuICByZXR1cm4gaXNOb2RlKHZhbHVlKSAmJiB2YWx1ZS5ub2RlVHlwZSA9PT0gMTE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0cmluZyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIHN0cmluZyB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xufVxuIiwiaW1wb3J0IHsgRGljdCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgU2ltcGxlRWxlbWVudCB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5cbi8qXG4gKiBAbWV0aG9kIG5vcm1hbGl6ZVByb3BlcnR5XG4gKiBAcGFyYW0gZWxlbWVudCB7SFRNTEVsZW1lbnR9XG4gKiBAcGFyYW0gc2xvdE5hbWUge1N0cmluZ31cbiAqIEByZXR1cm5zIHtPYmplY3R9IHsgbmFtZSwgdHlwZSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0eShlbGVtZW50OiBTaW1wbGVFbGVtZW50LCBzbG90TmFtZTogc3RyaW5nKSB7XG4gIGxldCB0eXBlLCBub3JtYWxpemVkO1xuXG4gIGlmIChzbG90TmFtZSBpbiBlbGVtZW50KSB7XG4gICAgbm9ybWFsaXplZCA9IHNsb3ROYW1lO1xuICAgIHR5cGUgPSAncHJvcCc7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGxvd2VyID0gc2xvdE5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobG93ZXIgaW4gZWxlbWVudCkge1xuICAgICAgdHlwZSA9ICdwcm9wJztcbiAgICAgIG5vcm1hbGl6ZWQgPSBsb3dlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdHlwZSA9ICdhdHRyJztcbiAgICAgIG5vcm1hbGl6ZWQgPSBzbG90TmFtZTtcbiAgICB9XG4gIH1cblxuICBpZiAoXG4gICAgdHlwZSA9PT0gJ3Byb3AnICYmXG4gICAgKG5vcm1hbGl6ZWQudG9Mb3dlckNhc2UoKSA9PT0gJ3N0eWxlJyB8fCBwcmVmZXJBdHRyKGVsZW1lbnQudGFnTmFtZSwgbm9ybWFsaXplZCkpXG4gICkge1xuICAgIHR5cGUgPSAnYXR0cic7XG4gIH1cblxuICByZXR1cm4geyBub3JtYWxpemVkLCB0eXBlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0eVZhbHVlKHZhbHVlOiB1bmtub3duKTogdW5rbm93biB7XG4gIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLy8gcHJvcGVydGllcyB0aGF0IE1VU1QgYmUgc2V0IGFzIGF0dHJpYnV0ZXMsIGR1ZSB0bzpcbi8vICogYnJvd3NlciBidWdcbi8vICogc3RyYW5nZSBzcGVjIG91dGxpZXJcbmNvbnN0IEFUVFJfT1ZFUlJJREVTOiBEaWN0PERpY3Q+ID0ge1xuICBJTlBVVDoge1xuICAgIGZvcm06IHRydWUsXG4gICAgLy8gQ2hyb21lIDQ2LjAuMjQ2NC4wOiAnYXV0b2NvcnJlY3QnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgPT09IGZhbHNlXG4gICAgLy8gU2FmYXJpIDguMC43OiAnYXV0b2NvcnJlY3QnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgPT09IGZhbHNlXG4gICAgLy8gTW9iaWxlIFNhZmFyaSAoaU9TIDguNCBzaW11bGF0b3IpOiAnYXV0b2NvcnJlY3QnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgPT09IHRydWVcbiAgICBhdXRvY29ycmVjdDogdHJ1ZSxcbiAgICAvLyBDaHJvbWUgNTQuMC4yODQwLjk4OiAnbGlzdCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKSA9PT0gdHJ1ZVxuICAgIC8vIFNhZmFyaSA5LjEuMzogJ2xpc3QnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgPT09IGZhbHNlXG4gICAgbGlzdDogdHJ1ZSxcbiAgfSxcblxuICAvLyBlbGVtZW50LmZvcm0gaXMgYWN0dWFsbHkgYSBsZWdpdGltYXRlIHJlYWRPbmx5IHByb3BlcnR5LCB0aGF0IGlzIHRvIGJlXG4gIC8vIG11dGF0ZWQsIGJ1dCBtdXN0IGJlIG11dGF0ZWQgYnkgc2V0QXR0cmlidXRlLi4uXG4gIFNFTEVDVDogeyBmb3JtOiB0cnVlIH0sXG4gIE9QVElPTjogeyBmb3JtOiB0cnVlIH0sXG4gIFRFWFRBUkVBOiB7IGZvcm06IHRydWUgfSxcbiAgTEFCRUw6IHsgZm9ybTogdHJ1ZSB9LFxuICBGSUVMRFNFVDogeyBmb3JtOiB0cnVlIH0sXG4gIExFR0VORDogeyBmb3JtOiB0cnVlIH0sXG4gIE9CSkVDVDogeyBmb3JtOiB0cnVlIH0sXG4gIEJVVFRPTjogeyBmb3JtOiB0cnVlIH0sXG59O1xuXG5mdW5jdGlvbiBwcmVmZXJBdHRyKHRhZ05hbWU6IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZykge1xuICBsZXQgdGFnID0gQVRUUl9PVkVSUklERVNbdGFnTmFtZS50b1VwcGVyQ2FzZSgpXTtcbiAgcmV0dXJuICh0YWcgJiYgdGFnW3Byb3BOYW1lLnRvTG93ZXJDYXNlKCldKSB8fCBmYWxzZTtcbn1cbiIsImltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgbm9ybWFsaXplU3RyaW5nVmFsdWUsIGlzU2FmZVN0cmluZyB9IGZyb20gJy4uL2RvbS9ub3JtYWxpemUnO1xuaW1wb3J0IHsgRW52aXJvbm1lbnQgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFNpbXBsZUVsZW1lbnQgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuXG5jb25zdCBiYWRQcm90b2NvbHMgPSBbJ2phdmFzY3JpcHQ6JywgJ3Zic2NyaXB0OiddO1xuXG5jb25zdCBiYWRUYWdzID0gWydBJywgJ0JPRFknLCAnTElOSycsICdJTUcnLCAnSUZSQU1FJywgJ0JBU0UnLCAnRk9STSddO1xuXG5jb25zdCBiYWRUYWdzRm9yRGF0YVVSSSA9IFsnRU1CRUQnXTtcblxuY29uc3QgYmFkQXR0cmlidXRlcyA9IFsnaHJlZicsICdzcmMnLCAnYmFja2dyb3VuZCcsICdhY3Rpb24nXTtcblxuY29uc3QgYmFkQXR0cmlidXRlc0ZvckRhdGFVUkkgPSBbJ3NyYyddO1xuXG5mdW5jdGlvbiBoYXMoYXJyYXk6IEFycmF5PHN0cmluZz4sIGl0ZW06IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtKSAhPT0gLTE7XG59XG5cbmZ1bmN0aW9uIGNoZWNrVVJJKHRhZ05hbWU6IE9wdGlvbjxzdHJpbmc+LCBhdHRyaWJ1dGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gKHRhZ05hbWUgPT09IG51bGwgfHwgaGFzKGJhZFRhZ3MsIHRhZ05hbWUpKSAmJiBoYXMoYmFkQXR0cmlidXRlcywgYXR0cmlidXRlKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tEYXRhVVJJKHRhZ05hbWU6IE9wdGlvbjxzdHJpbmc+LCBhdHRyaWJ1dGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAodGFnTmFtZSA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gaGFzKGJhZFRhZ3NGb3JEYXRhVVJJLCB0YWdOYW1lKSAmJiBoYXMoYmFkQXR0cmlidXRlc0ZvckRhdGFVUkksIGF0dHJpYnV0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlc1Nhbml0aXphdGlvbih0YWdOYW1lOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBjaGVja1VSSSh0YWdOYW1lLCBhdHRyaWJ1dGUpIHx8IGNoZWNrRGF0YVVSSSh0YWdOYW1lLCBhdHRyaWJ1dGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVBdHRyaWJ1dGVWYWx1ZShcbiAgZW52OiBFbnZpcm9ubWVudCxcbiAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgYXR0cmlidXRlOiBzdHJpbmcsXG4gIHZhbHVlOiB1bmtub3duXG4pOiB1bmtub3duIHtcbiAgbGV0IHRhZ05hbWU6IE9wdGlvbjxzdHJpbmc+ID0gbnVsbDtcblxuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGlmIChpc1NhZmVTdHJpbmcodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvSFRNTCgpO1xuICB9XG5cbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgdGFnTmFtZSA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZS50b1VwcGVyQ2FzZSgpO1xuICB9XG5cbiAgbGV0IHN0ciA9IG5vcm1hbGl6ZVN0cmluZ1ZhbHVlKHZhbHVlKTtcblxuICBpZiAoY2hlY2tVUkkodGFnTmFtZSwgYXR0cmlidXRlKSkge1xuICAgIGxldCBwcm90b2NvbCA9IGVudi5wcm90b2NvbEZvclVSTChzdHIpO1xuICAgIGlmIChoYXMoYmFkUHJvdG9jb2xzLCBwcm90b2NvbCkpIHtcbiAgICAgIHJldHVybiBgdW5zYWZlOiR7c3RyfWA7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNoZWNrRGF0YVVSSSh0YWdOYW1lLCBhdHRyaWJ1dGUpKSB7XG4gICAgcmV0dXJuIGB1bnNhZmU6JHtzdHJ9YDtcbiAgfVxuXG4gIHJldHVybiBzdHI7XG59XG4iLCJpbXBvcnQgeyBEaWN0LCBFbnZpcm9ubWVudCwgT3B0aW9uLCBFbGVtZW50QnVpbGRlciB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQXR0ck5hbWVzcGFjZSwgTmFtZXNwYWNlLCBTaW1wbGVFbGVtZW50IH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IG5vcm1hbGl6ZVN0cmluZ1ZhbHVlIH0gZnJvbSAnLi4vLi4vZG9tL25vcm1hbGl6ZSc7XG5pbXBvcnQgeyBub3JtYWxpemVQcm9wZXJ0eSB9IGZyb20gJy4uLy4uL2RvbS9wcm9wcyc7XG5pbXBvcnQgeyByZXF1aXJlc1Nhbml0aXphdGlvbiwgc2FuaXRpemVBdHRyaWJ1dGVWYWx1ZSB9IGZyb20gJy4uLy4uL2RvbS9zYW5pdGl6ZWQtdmFsdWVzJztcbmltcG9ydCB7IEF0dHJpYnV0ZSwgQXR0cmlidXRlT3BlcmF0aW9uIH0gZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBkeW5hbWljQXR0cmlidXRlKFxuICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICBhdHRyOiBzdHJpbmcsXG4gIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+XG4pOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgbGV0IHsgdGFnTmFtZSwgbmFtZXNwYWNlVVJJIH0gPSBlbGVtZW50O1xuICBsZXQgYXR0cmlidXRlID0geyBlbGVtZW50LCBuYW1lOiBhdHRyLCBuYW1lc3BhY2UgfTtcblxuICBpZiAobmFtZXNwYWNlVVJJID09PSBOYW1lc3BhY2UuU1ZHKSB7XG4gICAgcmV0dXJuIGJ1aWxkRHluYW1pY0F0dHJpYnV0ZSh0YWdOYW1lLCBhdHRyLCBhdHRyaWJ1dGUpO1xuICB9XG5cbiAgbGV0IHsgdHlwZSwgbm9ybWFsaXplZCB9ID0gbm9ybWFsaXplUHJvcGVydHkoZWxlbWVudCwgYXR0cik7XG5cbiAgaWYgKHR5cGUgPT09ICdhdHRyJykge1xuICAgIHJldHVybiBidWlsZER5bmFtaWNBdHRyaWJ1dGUodGFnTmFtZSwgbm9ybWFsaXplZCwgYXR0cmlidXRlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYnVpbGREeW5hbWljUHJvcGVydHkodGFnTmFtZSwgbm9ybWFsaXplZCwgYXR0cmlidXRlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZER5bmFtaWNBdHRyaWJ1dGUoXG4gIHRhZ05hbWU6IHN0cmluZyxcbiAgbmFtZTogc3RyaW5nLFxuICBhdHRyaWJ1dGU6IEF0dHJpYnV0ZVxuKTogRHluYW1pY0F0dHJpYnV0ZSB7XG4gIGlmIChyZXF1aXJlc1Nhbml0aXphdGlvbih0YWdOYW1lLCBuYW1lKSkge1xuICAgIHJldHVybiBuZXcgU2FmZUR5bmFtaWNBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFNpbXBsZUR5bmFtaWNBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZER5bmFtaWNQcm9wZXJ0eShcbiAgdGFnTmFtZTogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIGF0dHJpYnV0ZTogQXR0cmlidXRlXG4pOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgaWYgKHJlcXVpcmVzU2FuaXRpemF0aW9uKHRhZ05hbWUsIG5hbWUpKSB7XG4gICAgcmV0dXJuIG5ldyBTYWZlRHluYW1pY1Byb3BlcnR5KG5hbWUsIGF0dHJpYnV0ZSk7XG4gIH1cblxuICBpZiAoaXNVc2VySW5wdXRWYWx1ZSh0YWdOYW1lLCBuYW1lKSkge1xuICAgIHJldHVybiBuZXcgSW5wdXRWYWx1ZUR5bmFtaWNBdHRyaWJ1dGUobmFtZSwgYXR0cmlidXRlKTtcbiAgfVxuXG4gIGlmIChpc09wdGlvblNlbGVjdGVkKHRhZ05hbWUsIG5hbWUpKSB7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25TZWxlY3RlZER5bmFtaWNBdHRyaWJ1dGUobmFtZSwgYXR0cmlidXRlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRGVmYXVsdER5bmFtaWNQcm9wZXJ0eShuYW1lLCBhdHRyaWJ1dGUpO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHluYW1pY0F0dHJpYnV0ZSBpbXBsZW1lbnRzIEF0dHJpYnV0ZU9wZXJhdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBhdHRyaWJ1dGU6IEF0dHJpYnV0ZSkge31cblxuICBhYnN0cmFjdCBzZXQoZG9tOiBFbGVtZW50QnVpbGRlciwgdmFsdWU6IHVua25vd24sIGVudjogRW52aXJvbm1lbnQpOiB2b2lkO1xuICBhYnN0cmFjdCB1cGRhdGUodmFsdWU6IHVua25vd24sIGVudjogRW52aXJvbm1lbnQpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgU2ltcGxlRHluYW1pY0F0dHJpYnV0ZSBleHRlbmRzIER5bmFtaWNBdHRyaWJ1dGUge1xuICBzZXQoZG9tOiBFbGVtZW50QnVpbGRlciwgdmFsdWU6IHVua25vd24sIF9lbnY6IEVudmlyb25tZW50KTogdm9pZCB7XG4gICAgbGV0IG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKTtcblxuICAgIGlmIChub3JtYWxpemVkVmFsdWUgIT09IG51bGwpIHtcbiAgICAgIGxldCB7IG5hbWUsIG5hbWVzcGFjZSB9ID0gdGhpcy5hdHRyaWJ1dGU7XG4gICAgICBkb20uX19zZXRBdHRyaWJ1dGUobmFtZSwgbm9ybWFsaXplZFZhbHVlLCBuYW1lc3BhY2UpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93biwgX2VudjogRW52aXJvbm1lbnQpOiB2b2lkIHtcbiAgICBsZXQgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpO1xuICAgIGxldCB7IGVsZW1lbnQsIG5hbWUgfSA9IHRoaXMuYXR0cmlidXRlO1xuXG4gICAgaWYgKG5vcm1hbGl6ZWRWYWx1ZSA9PT0gbnVsbCkge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIG5vcm1hbGl6ZWRWYWx1ZSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0RHluYW1pY1Byb3BlcnR5IGV4dGVuZHMgRHluYW1pY0F0dHJpYnV0ZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbm9ybWFsaXplZE5hbWU6IHN0cmluZywgYXR0cmlidXRlOiBBdHRyaWJ1dGUpIHtcbiAgICBzdXBlcihhdHRyaWJ1dGUpO1xuICB9XG5cbiAgdmFsdWU6IHVua25vd247XG4gIHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93biwgX2VudjogRW52aXJvbm1lbnQpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgZG9tLl9fc2V0UHJvcGVydHkodGhpcy5ub3JtYWxpemVkTmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93biwgX2VudjogRW52aXJvbm1lbnQpOiB2b2lkIHtcbiAgICBsZXQgeyBlbGVtZW50IH0gPSB0aGlzLmF0dHJpYnV0ZTtcblxuICAgIGlmICh0aGlzLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgKGVsZW1lbnQgYXMgRGljdClbdGhpcy5ub3JtYWxpemVkTmFtZV0gPSB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIHJlbW92ZUF0dHJpYnV0ZSgpIHtcbiAgICAvLyBUT0RPIHRoaXMgc3Vja3MgYnV0IHRvIHByZXNlcnZlIHByb3BlcnRpZXMgZmlyc3QgYW5kIHRvIG1lZXQgY3VycmVudFxuICAgIC8vIHNlbWFudGljcyB3ZSBtdXN0IGRvIHRoaXMuXG4gICAgbGV0IHsgZWxlbWVudCwgbmFtZXNwYWNlIH0gPSB0aGlzLmF0dHJpYnV0ZTtcblxuICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlTlMobmFtZXNwYWNlLCB0aGlzLm5vcm1hbGl6ZWROYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5ub3JtYWxpemVkTmFtZSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTYWZlRHluYW1pY1Byb3BlcnR5IGV4dGVuZHMgRGVmYXVsdER5bmFtaWNQcm9wZXJ0eSB7XG4gIHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCB7IGVsZW1lbnQsIG5hbWUgfSA9IHRoaXMuYXR0cmlidXRlO1xuICAgIGxldCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGVudiwgZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgIHN1cGVyLnNldChkb20sIHNhbml0aXplZCwgZW52KTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCB7IGVsZW1lbnQsIG5hbWUgfSA9IHRoaXMuYXR0cmlidXRlO1xuICAgIGxldCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGVudiwgZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgIHN1cGVyLnVwZGF0ZShzYW5pdGl6ZWQsIGVudik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhZmVEeW5hbWljQXR0cmlidXRlIGV4dGVuZHMgU2ltcGxlRHluYW1pY0F0dHJpYnV0ZSB7XG4gIHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCB7IGVsZW1lbnQsIG5hbWUgfSA9IHRoaXMuYXR0cmlidXRlO1xuICAgIGxldCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGVudiwgZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgIHN1cGVyLnNldChkb20sIHNhbml0aXplZCwgZW52KTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogdW5rbm93biwgZW52OiBFbnZpcm9ubWVudCk6IHZvaWQge1xuICAgIGxldCB7IGVsZW1lbnQsIG5hbWUgfSA9IHRoaXMuYXR0cmlidXRlO1xuICAgIGxldCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGVudiwgZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgIHN1cGVyLnVwZGF0ZShzYW5pdGl6ZWQsIGVudik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIElucHV0VmFsdWVEeW5hbWljQXR0cmlidXRlIGV4dGVuZHMgRGVmYXVsdER5bmFtaWNQcm9wZXJ0eSB7XG4gIHNldChkb206IEVsZW1lbnRCdWlsZGVyLCB2YWx1ZTogdW5rbm93bikge1xuICAgIGRvbS5fX3NldFByb3BlcnR5KCd2YWx1ZScsIG5vcm1hbGl6ZVN0cmluZ1ZhbHVlKHZhbHVlKSk7XG4gIH1cblxuICB1cGRhdGUodmFsdWU6IHVua25vd24pIHtcbiAgICBsZXQgaW5wdXQgPSB0aGlzLmF0dHJpYnV0ZS5lbGVtZW50IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgbGV0IGN1cnJlbnRWYWx1ZSA9IGlucHV0LnZhbHVlO1xuICAgIGxldCBub3JtYWxpemVkVmFsdWUgPSBub3JtYWxpemVTdHJpbmdWYWx1ZSh2YWx1ZSk7XG4gICAgaWYgKGN1cnJlbnRWYWx1ZSAhPT0gbm9ybWFsaXplZFZhbHVlKSB7XG4gICAgICBpbnB1dC52YWx1ZSA9IG5vcm1hbGl6ZWRWYWx1ZSE7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPcHRpb25TZWxlY3RlZER5bmFtaWNBdHRyaWJ1dGUgZXh0ZW5kcyBEZWZhdWx0RHluYW1pY1Byb3BlcnR5IHtcbiAgc2V0KGRvbTogRWxlbWVudEJ1aWxkZXIsIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IGZhbHNlKSB7XG4gICAgICBkb20uX19zZXRQcm9wZXJ0eSgnc2VsZWN0ZWQnLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUodmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBsZXQgb3B0aW9uID0gdGhpcy5hdHRyaWJ1dGUuZWxlbWVudCBhcyBIVE1MT3B0aW9uRWxlbWVudDtcblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9uLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzT3B0aW9uU2VsZWN0ZWQodGFnTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGU6IHN0cmluZykge1xuICByZXR1cm4gdGFnTmFtZSA9PT0gJ09QVElPTicgJiYgYXR0cmlidXRlID09PSAnc2VsZWN0ZWQnO1xufVxuXG5mdW5jdGlvbiBpc1VzZXJJbnB1dFZhbHVlKHRhZ05hbWU6IHN0cmluZywgYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgcmV0dXJuICh0YWdOYW1lID09PSAnSU5QVVQnIHx8IHRhZ05hbWUgPT09ICdURVhUQVJFQScpICYmIGF0dHJpYnV0ZSA9PT0gJ3ZhbHVlJztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWU6IHVua25vd24pOiBPcHRpb248c3RyaW5nPiB7XG4gIGlmIChcbiAgICB2YWx1ZSA9PT0gZmFsc2UgfHxcbiAgICB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgdmFsdWUgPT09IG51bGwgfHxcbiAgICB0eXBlb2YgKHZhbHVlIGFzIERpY3QpLnRvU3RyaW5nID09PSAndW5kZWZpbmVkJ1xuICApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgLy8gb25jbGljayBmdW5jdGlvbiBldGMgaW4gU1NSXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBTdHJpbmcodmFsdWUpO1xufVxuIiwiaW1wb3J0IHtcbiAgRGljdCxcbiAgRHJvcCxcbiAgRW52aXJvbm1lbnQsXG4gIEVudmlyb25tZW50T3B0aW9ucyxcbiAgR2xpbW1lclRyZWVDaGFuZ2VzLFxuICBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbixcbiAgSml0T3JBb3RCbG9jayxcbiAgUGFydGlhbFNjb3BlLFxuICBTY29wZSxcbiAgU2NvcGVCbG9jayxcbiAgU2NvcGVTbG90LFxuICBUcmFuc2FjdGlvbixcbiAgVHJhbnNhY3Rpb25TeW1ib2wsXG4gIENvbXBpbGVyQXJ0aWZhY3RzLFxuICBXaXRoQ3JlYXRlSW5zdGFuY2UsXG4gIFJlc29sdmVkVmFsdWUsXG4gIFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlLFxuICBSdW50aW1lUHJvZ3JhbSxcbiAgTW9kaWZpZXJNYW5hZ2VyLFxuICBUZW1wbGF0ZSxcbiAgQW90UnVudGltZVJlc29sdmVyLFxuICBJbnZvY2F0aW9uLFxuICBKaXRSdW50aW1lQ29udGV4dCxcbiAgQW90UnVudGltZUNvbnRleHQsXG4gIEppdFJ1bnRpbWVSZXNvbHZlcixcbiAgUnVudGltZVJlc29sdmVyLFxuICBTeW50YXhDb21waWxhdGlvbkNvbnRleHQsXG4gIFJ1bnRpbWVDb25zdGFudHMsXG4gIFJ1bnRpbWVIZWFwLFxuICBXaG9sZVByb2dyYW1Db21waWxhdGlvbkNvbnRleHQsXG4gIENvbXBpbGVUaW1lQ29uc3RhbnRzLFxuICBDb21waWxlVGltZUhlYXAsXG4gIE1hY3Jvcyxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQge1xuICBJdGVyYWJsZUltcGwsXG4gIEl0ZXJhYmxlS2V5RGVmaW5pdGlvbnMsXG4gIE9wYXF1ZUl0ZXJhYmxlLFxuICBQYXRoUmVmZXJlbmNlLFxuICBSZWZlcmVuY2UsXG4gIFZlcnNpb25lZFBhdGhSZWZlcmVuY2UsXG4gIFZlcnNpb25lZFJlZmVyZW5jZSxcbn0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IGFzc2VydCwgRFJPUCwgZXhwZWN0LCBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IEF0dHJOYW1lc3BhY2UsIFNpbXBsZURvY3VtZW50LCBTaW1wbGVFbGVtZW50IH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IERPTUNoYW5nZXNJbXBsLCBET01UcmVlQ29uc3RydWN0aW9uIH0gZnJvbSAnLi9kb20vaGVscGVyJztcbmltcG9ydCB7IENvbmRpdGlvbmFsUmVmZXJlbmNlLCBVTkRFRklORURfUkVGRVJFTkNFIH0gZnJvbSAnLi9yZWZlcmVuY2VzJztcbmltcG9ydCB7IER5bmFtaWNBdHRyaWJ1dGUsIGR5bmFtaWNBdHRyaWJ1dGUgfSBmcm9tICcuL3ZtL2F0dHJpYnV0ZXMvZHluYW1pYyc7XG5pbXBvcnQgeyBSdW50aW1lUHJvZ3JhbUltcGwsIENvbnN0YW50cywgSGVhcEltcGwgfSBmcm9tICdAZ2xpbW1lci9wcm9ncmFtJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2NvcGVSZWZlcmVuY2UoczogU2NvcGVTbG90KTogcyBpcyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgaWYgKHMgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheShzKSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGNsYXNzIFNjb3BlSW1wbDxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4gaW1wbGVtZW50cyBQYXJ0aWFsU2NvcGU8Qz4ge1xuICBzdGF0aWMgcm9vdDxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4oc2VsZjogUGF0aFJlZmVyZW5jZTx1bmtub3duPiwgc2l6ZSA9IDApOiBQYXJ0aWFsU2NvcGU8Qz4ge1xuICAgIGxldCByZWZzOiBQYXRoUmVmZXJlbmNlPHVua25vd24+W10gPSBuZXcgQXJyYXkoc2l6ZSArIDEpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gc2l6ZTsgaSsrKSB7XG4gICAgICByZWZzW2ldID0gVU5ERUZJTkVEX1JFRkVSRU5DRTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFNjb3BlSW1wbDxDPihyZWZzLCBudWxsLCBudWxsLCBudWxsKS5pbml0KHsgc2VsZiB9KTtcbiAgfVxuXG4gIHN0YXRpYyBzaXplZDxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4oc2l6ZSA9IDApOiBTY29wZTxDPiB7XG4gICAgbGV0IHJlZnM6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj5bXSA9IG5ldyBBcnJheShzaXplICsgMSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBzaXplOyBpKyspIHtcbiAgICAgIHJlZnNbaV0gPSBVTkRFRklORURfUkVGRVJFTkNFO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgU2NvcGVJbXBsKHJlZnMsIG51bGwsIG51bGwsIG51bGwpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLy8gdGhlIDB0aCBzbG90IGlzIGBzZWxmYFxuICAgIHJlYWRvbmx5IHNsb3RzOiBBcnJheTxTY29wZVNsb3Q8Qz4+LFxuICAgIHByaXZhdGUgY2FsbGVyU2NvcGU6IE9wdGlvbjxTY29wZTxDPj4sXG4gICAgLy8gbmFtZWQgYXJndW1lbnRzIGFuZCBibG9ja3MgcGFzc2VkIHRvIGEgbGF5b3V0IHRoYXQgdXNlcyBldmFsXG4gICAgcHJpdmF0ZSBldmFsU2NvcGU6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxDPj4+LFxuICAgIC8vIGxvY2FscyBpbiBzY29wZSB3aGVuIHRoZSBwYXJ0aWFsIHdhcyBpbnZva2VkXG4gICAgcHJpdmF0ZSBwYXJ0aWFsTWFwOiBPcHRpb248RGljdDxQYXRoUmVmZXJlbmNlPHVua25vd24+Pj5cbiAgKSB7fVxuXG4gIGluaXQoeyBzZWxmIH06IHsgc2VsZjogUGF0aFJlZmVyZW5jZTx1bmtub3duPiB9KTogdGhpcyB7XG4gICAgdGhpcy5zbG90c1swXSA9IHNlbGY7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXRTZWxmKCk6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4ge1xuICAgIHJldHVybiB0aGlzLmdldDxQYXRoUmVmZXJlbmNlPHVua25vd24+PigwKTtcbiAgfVxuXG4gIGdldFN5bWJvbChzeW1ib2w6IG51bWJlcik6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4ge1xuICAgIHJldHVybiB0aGlzLmdldDxQYXRoUmVmZXJlbmNlPHVua25vd24+PihzeW1ib2wpO1xuICB9XG5cbiAgZ2V0QmxvY2soc3ltYm9sOiBudW1iZXIpOiBPcHRpb248U2NvcGVCbG9jazxDPj4ge1xuICAgIGxldCBibG9jayA9IHRoaXMuZ2V0KHN5bWJvbCk7XG4gICAgcmV0dXJuIGJsb2NrID09PSBVTkRFRklORURfUkVGRVJFTkNFID8gbnVsbCA6IChibG9jayBhcyBTY29wZUJsb2NrPEM+KTtcbiAgfVxuXG4gIGdldEV2YWxTY29wZSgpOiBPcHRpb248RGljdDxTY29wZVNsb3Q8Qz4+PiB7XG4gICAgcmV0dXJuIHRoaXMuZXZhbFNjb3BlO1xuICB9XG5cbiAgZ2V0UGFydGlhbE1hcCgpOiBPcHRpb248RGljdDxQYXRoUmVmZXJlbmNlPHVua25vd24+Pj4ge1xuICAgIHJldHVybiB0aGlzLnBhcnRpYWxNYXA7XG4gIH1cblxuICBiaW5kKHN5bWJvbDogbnVtYmVyLCB2YWx1ZTogU2NvcGVTbG90PEM+KSB7XG4gICAgdGhpcy5zZXQoc3ltYm9sLCB2YWx1ZSk7XG4gIH1cblxuICBiaW5kU2VsZihzZWxmOiBQYXRoUmVmZXJlbmNlPHVua25vd24+KSB7XG4gICAgdGhpcy5zZXQ8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4oMCwgc2VsZik7XG4gIH1cblxuICBiaW5kU3ltYm9sKHN5bWJvbDogbnVtYmVyLCB2YWx1ZTogUGF0aFJlZmVyZW5jZTx1bmtub3duPikge1xuICAgIHRoaXMuc2V0KHN5bWJvbCwgdmFsdWUpO1xuICB9XG5cbiAgYmluZEJsb2NrKHN5bWJvbDogbnVtYmVyLCB2YWx1ZTogT3B0aW9uPFNjb3BlQmxvY2s8Qz4+KSB7XG4gICAgdGhpcy5zZXQ8T3B0aW9uPFNjb3BlQmxvY2s8Qz4+PihzeW1ib2wsIHZhbHVlKTtcbiAgfVxuXG4gIGJpbmRFdmFsU2NvcGUobWFwOiBPcHRpb248RGljdDxTY29wZVNsb3Q8Qz4+Pikge1xuICAgIHRoaXMuZXZhbFNjb3BlID0gbWFwO1xuICB9XG5cbiAgYmluZFBhcnRpYWxNYXAobWFwOiBEaWN0PFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KSB7XG4gICAgdGhpcy5wYXJ0aWFsTWFwID0gbWFwO1xuICB9XG5cbiAgYmluZENhbGxlclNjb3BlKHNjb3BlOiBPcHRpb248U2NvcGU8Qz4+KTogdm9pZCB7XG4gICAgdGhpcy5jYWxsZXJTY29wZSA9IHNjb3BlO1xuICB9XG5cbiAgZ2V0Q2FsbGVyU2NvcGUoKTogT3B0aW9uPFNjb3BlPEM+PiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbGVyU2NvcGU7XG4gIH1cblxuICBjaGlsZCgpOiBTY29wZTxDPiB7XG4gICAgcmV0dXJuIG5ldyBTY29wZUltcGwodGhpcy5zbG90cy5zbGljZSgpLCB0aGlzLmNhbGxlclNjb3BlLCB0aGlzLmV2YWxTY29wZSwgdGhpcy5wYXJ0aWFsTWFwKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0PFQgZXh0ZW5kcyBTY29wZVNsb3Q8Qz4+KGluZGV4OiBudW1iZXIpOiBUIHtcbiAgICBpZiAoaW5kZXggPj0gdGhpcy5zbG90cy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBCVUc6IGNhbm5vdCBnZXQgJCR7aW5kZXh9IGZyb20gc2NvcGU7IGxlbmd0aD0ke3RoaXMuc2xvdHMubGVuZ3RofWApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNsb3RzW2luZGV4XSBhcyBUO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXQ8VCBleHRlbmRzIFNjb3BlU2xvdDxDPj4oaW5kZXg6IG51bWJlciwgdmFsdWU6IFQpOiB2b2lkIHtcbiAgICBpZiAoaW5kZXggPj0gdGhpcy5zbG90cy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBCVUc6IGNhbm5vdCBnZXQgJCR7aW5kZXh9IGZyb20gc2NvcGU7IGxlbmd0aD0ke3RoaXMuc2xvdHMubGVuZ3RofWApO1xuICAgIH1cblxuICAgIHRoaXMuc2xvdHNbaW5kZXhdID0gdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFRSQU5TQUNUSU9OOiBUcmFuc2FjdGlvblN5bWJvbCA9ICdUUkFOU0FDVElPTiBbYzM5Mzg4ODUtYWJhMC00MjJmLWI1NDAtM2ZkMzQzMWM3OGI1XSc7XG5cbmNsYXNzIFRyYW5zYWN0aW9uSW1wbCBpbXBsZW1lbnRzIFRyYW5zYWN0aW9uIHtcbiAgcmVhZG9ubHkgW1RSQU5TQUNUSU9OXTogT3B0aW9uPFRyYW5zYWN0aW9uSW1wbD47XG5cbiAgcHVibGljIHNjaGVkdWxlZEluc3RhbGxNYW5hZ2VyczogTW9kaWZpZXJNYW5hZ2VyW10gPSBbXTtcbiAgcHVibGljIHNjaGVkdWxlZEluc3RhbGxNb2RpZmllcnM6IHVua25vd25bXSA9IFtdO1xuICBwdWJsaWMgc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJNYW5hZ2VyczogTW9kaWZpZXJNYW5hZ2VyW10gPSBbXTtcbiAgcHVibGljIHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyczogdW5rbm93bltdID0gW107XG4gIHB1YmxpYyBjcmVhdGVkQ29tcG9uZW50czogdW5rbm93bltdID0gW107XG4gIHB1YmxpYyBjcmVhdGVkTWFuYWdlcnM6IFdpdGhDcmVhdGVJbnN0YW5jZTx1bmtub3duPltdID0gW107XG4gIHB1YmxpYyB1cGRhdGVkQ29tcG9uZW50czogdW5rbm93bltdID0gW107XG4gIHB1YmxpYyB1cGRhdGVkTWFuYWdlcnM6IFdpdGhDcmVhdGVJbnN0YW5jZTx1bmtub3duPltdID0gW107XG4gIHB1YmxpYyBkZXN0cnVjdG9yczogRHJvcFtdID0gW107XG5cbiAgZGlkQ3JlYXRlKGNvbXBvbmVudDogdW5rbm93biwgbWFuYWdlcjogV2l0aENyZWF0ZUluc3RhbmNlKSB7XG4gICAgdGhpcy5jcmVhdGVkQ29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgdGhpcy5jcmVhdGVkTWFuYWdlcnMucHVzaChtYW5hZ2VyKTtcbiAgfVxuXG4gIGRpZFVwZGF0ZShjb21wb25lbnQ6IHVua25vd24sIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSkge1xuICAgIHRoaXMudXBkYXRlZENvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgIHRoaXMudXBkYXRlZE1hbmFnZXJzLnB1c2gobWFuYWdlcik7XG4gIH1cblxuICBzY2hlZHVsZUluc3RhbGxNb2RpZmllcihtb2RpZmllcjogdW5rbm93biwgbWFuYWdlcjogTW9kaWZpZXJNYW5hZ2VyKSB7XG4gICAgdGhpcy5zY2hlZHVsZWRJbnN0YWxsTW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpO1xuICAgIHRoaXMuc2NoZWR1bGVkSW5zdGFsbE1hbmFnZXJzLnB1c2gobWFuYWdlcik7XG4gIH1cblxuICBzY2hlZHVsZVVwZGF0ZU1vZGlmaWVyKG1vZGlmaWVyOiB1bmtub3duLCBtYW5hZ2VyOiBNb2RpZmllck1hbmFnZXIpIHtcbiAgICB0aGlzLnNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVycy5wdXNoKG1vZGlmaWVyKTtcbiAgICB0aGlzLnNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyTWFuYWdlcnMucHVzaChtYW5hZ2VyKTtcbiAgfVxuXG4gIGRpZERlc3Ryb3koZDogRHJvcCkge1xuICAgIHRoaXMuZGVzdHJ1Y3RvcnMucHVzaChkKTtcbiAgfVxuXG4gIGNvbW1pdCgpIHtcbiAgICBsZXQgeyBjcmVhdGVkQ29tcG9uZW50cywgY3JlYXRlZE1hbmFnZXJzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjcmVhdGVkQ29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGNvbXBvbmVudCA9IGNyZWF0ZWRDb21wb25lbnRzW2ldO1xuICAgICAgbGV0IG1hbmFnZXIgPSBjcmVhdGVkTWFuYWdlcnNbaV07XG4gICAgICBtYW5hZ2VyLmRpZENyZWF0ZShjb21wb25lbnQpO1xuICAgIH1cblxuICAgIGxldCB7IHVwZGF0ZWRDb21wb25lbnRzLCB1cGRhdGVkTWFuYWdlcnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVwZGF0ZWRDb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgY29tcG9uZW50ID0gdXBkYXRlZENvbXBvbmVudHNbaV07XG4gICAgICBsZXQgbWFuYWdlciA9IHVwZGF0ZWRNYW5hZ2Vyc1tpXTtcbiAgICAgIG1hbmFnZXIuZGlkVXBkYXRlKGNvbXBvbmVudCk7XG4gICAgfVxuXG4gICAgbGV0IHsgZGVzdHJ1Y3RvcnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlc3RydWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZXN0cnVjdG9yc1tpXVtEUk9QXSgpO1xuICAgIH1cblxuICAgIGxldCB7IHNjaGVkdWxlZEluc3RhbGxNYW5hZ2Vycywgc2NoZWR1bGVkSW5zdGFsbE1vZGlmaWVycyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NoZWR1bGVkSW5zdGFsbE1hbmFnZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbW9kaWZpZXIgPSBzY2hlZHVsZWRJbnN0YWxsTW9kaWZpZXJzW2ldO1xuICAgICAgbGV0IG1hbmFnZXIgPSBzY2hlZHVsZWRJbnN0YWxsTWFuYWdlcnNbaV07XG4gICAgICBtYW5hZ2VyLmluc3RhbGwobW9kaWZpZXIpO1xuICAgIH1cblxuICAgIGxldCB7IHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyTWFuYWdlcnMsIHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVycyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJNYW5hZ2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IG1vZGlmaWVyID0gc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJzW2ldO1xuICAgICAgbGV0IG1hbmFnZXIgPSBzY2hlZHVsZWRVcGRhdGVNb2RpZmllck1hbmFnZXJzW2ldO1xuICAgICAgbWFuYWdlci51cGRhdGUobW9kaWZpZXIpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUb0Jvb2wgPSAodmFsdWU6IHVua25vd24pID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIHRvQm9vbCh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gISF2YWx1ZTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVudmlyb25tZW50SW1wbCBpbXBsZW1lbnRzIEVudmlyb25tZW50IHtcbiAgW1RSQU5TQUNUSU9OXTogT3B0aW9uPFRyYW5zYWN0aW9uSW1wbD4gPSBudWxsO1xuXG4gIHByb3RlY3RlZCB1cGRhdGVPcGVyYXRpb25zOiBHbGltbWVyVHJlZUNoYW5nZXM7XG4gIHByb3RlY3RlZCBhcHBlbmRPcGVyYXRpb25zOiBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbjtcblxuICBjb25zdHJ1Y3Rvcih7IGFwcGVuZE9wZXJhdGlvbnMsIHVwZGF0ZU9wZXJhdGlvbnMgfTogRW52aXJvbm1lbnRPcHRpb25zKSB7XG4gICAgdGhpcy5hcHBlbmRPcGVyYXRpb25zID0gYXBwZW5kT3BlcmF0aW9ucztcbiAgICB0aGlzLnVwZGF0ZU9wZXJhdGlvbnMgPSB1cGRhdGVPcGVyYXRpb25zO1xuICB9XG5cbiAgdG9Db25kaXRpb25hbFJlZmVyZW5jZShyZWZlcmVuY2U6IFJlZmVyZW5jZSk6IFJlZmVyZW5jZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBDb25kaXRpb25hbFJlZmVyZW5jZShyZWZlcmVuY2UsIHRvQm9vbCk7XG4gIH1cblxuICBhYnN0cmFjdCBpdGVyYWJsZUZvcihyZWZlcmVuY2U6IFJlZmVyZW5jZSwga2V5OiB1bmtub3duKTogT3BhcXVlSXRlcmFibGU7XG4gIGFic3RyYWN0IHByb3RvY29sRm9yVVJMKHM6IHN0cmluZyk6IHN0cmluZztcblxuICBnZXRBcHBlbmRPcGVyYXRpb25zKCk6IEdsaW1tZXJUcmVlQ29uc3RydWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5hcHBlbmRPcGVyYXRpb25zO1xuICB9XG4gIGdldERPTSgpOiBHbGltbWVyVHJlZUNoYW5nZXMge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZU9wZXJhdGlvbnM7XG4gIH1cblxuICBiZWdpbigpIHtcbiAgICBhc3NlcnQoXG4gICAgICAhdGhpc1tUUkFOU0FDVElPTl0sXG4gICAgICAnQSBnbGltbWVyIHRyYW5zYWN0aW9uIHdhcyBiZWd1biwgYnV0IG9uZSBhbHJlYWR5IGV4aXN0cy4gWW91IG1heSBoYXZlIGEgbmVzdGVkIHRyYW5zYWN0aW9uLCBwb3NzaWJseSBjYXVzZWQgYnkgYW4gZWFybGllciBydW50aW1lIGV4Y2VwdGlvbiB3aGlsZSByZW5kZXJpbmcuIFBsZWFzZSBjaGVjayB5b3VyIGNvbnNvbGUgZm9yIHRoZSBzdGFjayB0cmFjZSBvZiBhbnkgcHJpb3IgZXhjZXB0aW9ucy4nXG4gICAgKTtcblxuICAgIHRoaXNbVFJBTlNBQ1RJT05dID0gbmV3IFRyYW5zYWN0aW9uSW1wbCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgdHJhbnNhY3Rpb24oKTogVHJhbnNhY3Rpb25JbXBsIHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXNbVFJBTlNBQ1RJT05dISwgJ211c3QgYmUgaW4gYSB0cmFuc2FjdGlvbicpO1xuICB9XG5cbiAgZGlkQ3JlYXRlKGNvbXBvbmVudDogdW5rbm93biwgbWFuYWdlcjogV2l0aENyZWF0ZUluc3RhbmNlKSB7XG4gICAgdGhpcy50cmFuc2FjdGlvbi5kaWRDcmVhdGUoY29tcG9uZW50LCBtYW5hZ2VyKTtcbiAgfVxuXG4gIGRpZFVwZGF0ZShjb21wb25lbnQ6IHVua25vd24sIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSkge1xuICAgIHRoaXMudHJhbnNhY3Rpb24uZGlkVXBkYXRlKGNvbXBvbmVudCwgbWFuYWdlcik7XG4gIH1cblxuICBzY2hlZHVsZUluc3RhbGxNb2RpZmllcihtb2RpZmllcjogdW5rbm93biwgbWFuYWdlcjogTW9kaWZpZXJNYW5hZ2VyKSB7XG4gICAgdGhpcy50cmFuc2FjdGlvbi5zY2hlZHVsZUluc3RhbGxNb2RpZmllcihtb2RpZmllciwgbWFuYWdlcik7XG4gIH1cblxuICBzY2hlZHVsZVVwZGF0ZU1vZGlmaWVyKG1vZGlmaWVyOiB1bmtub3duLCBtYW5hZ2VyOiBNb2RpZmllck1hbmFnZXIpIHtcbiAgICB0aGlzLnRyYW5zYWN0aW9uLnNjaGVkdWxlVXBkYXRlTW9kaWZpZXIobW9kaWZpZXIsIG1hbmFnZXIpO1xuICB9XG5cbiAgZGlkRGVzdHJveShkOiBEcm9wKSB7XG4gICAgdGhpcy50cmFuc2FjdGlvbi5kaWREZXN0cm95KGQpO1xuICB9XG5cbiAgY29tbWl0KCkge1xuICAgIGxldCB0cmFuc2FjdGlvbiA9IHRoaXMudHJhbnNhY3Rpb247XG4gICAgdGhpc1tUUkFOU0FDVElPTl0gPSBudWxsO1xuICAgIHRyYW5zYWN0aW9uLmNvbW1pdCgpO1xuICB9XG5cbiAgYXR0cmlidXRlRm9yKFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgYXR0cjogc3RyaW5nLFxuICAgIF9pc1RydXN0aW5nOiBib29sZWFuLFxuICAgIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+ID0gbnVsbFxuICApOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgICByZXR1cm4gZHluYW1pY0F0dHJpYnV0ZShlbGVtZW50LCBhdHRyLCBuYW1lc3BhY2UpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUge1xuICBwcm90b2NvbEZvclVSTD8odXJsOiBzdHJpbmcpOiBzdHJpbmc7XG4gIGl0ZXJhYmxlPzogSXRlcmFibGVLZXlEZWZpbml0aW9ucztcbiAgdG9Cb29sPyh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW47XG4gIGF0dHJpYnV0ZUZvcj8oXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBhdHRyOiBzdHJpbmcsXG4gICAgaXNUcnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPlxuICApOiBEeW5hbWljQXR0cmlidXRlO1xufVxuXG5leHBvcnQgY2xhc3MgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsIGltcGxlbWVudHMgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUge1xuICByZWFkb25seSB0b0Jvb2w6ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZSA9IHt9KSB7XG4gICAgaWYgKGlubmVyLnRvQm9vbCkge1xuICAgICAgdGhpcy50b0Jvb2wgPSBpbm5lci50b0Jvb2w7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudG9Cb29sID0gdmFsdWUgPT4gISF2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBwcm90b2NvbEZvclVSTCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuaW5uZXIucHJvdG9jb2xGb3JVUkwpIHtcbiAgICAgIHJldHVybiB0aGlzLmlubmVyLnByb3RvY29sRm9yVVJMKHVybCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgVVJMID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgVVJMID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGxlZ2FjeVByb3RvY29sRm9yVVJMKHVybCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gbmV3IFVSTCh1cmwsIGRvY3VtZW50LmJhc2VVUkkpLnByb3RvY29sO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFVSTCh1cmwsICdodHRwczovL3d3dy5leGFtcGxlLmNvbScpLnByb3RvY29sO1xuICAgIH1cbiAgfVxuXG4gIGF0dHJpYnV0ZUZvcihcbiAgICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIGF0dHI6IHN0cmluZyxcbiAgICBpc1RydXN0aW5nOiBib29sZWFuLFxuICAgIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+XG4gICk6IER5bmFtaWNBdHRyaWJ1dGUge1xuICAgIGlmICh0aGlzLmlubmVyLmF0dHJpYnV0ZUZvcikge1xuICAgICAgcmV0dXJuIHRoaXMuaW5uZXIuYXR0cmlidXRlRm9yKGVsZW1lbnQsIGF0dHIsIGlzVHJ1c3RpbmcsIG5hbWVzcGFjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkeW5hbWljQXR0cmlidXRlKGVsZW1lbnQsIGF0dHIsIG5hbWVzcGFjZSk7XG4gICAgfVxuICB9XG5cbiAgcmVhZG9ubHkgaXRlcmFibGU6IEl0ZXJhYmxlS2V5RGVmaW5pdGlvbnMgPSB7XG4gICAgbmFtZWQ6IHtcbiAgICAgICdAaW5kZXgnOiAoXywgaW5kZXgpID0+IFN0cmluZyhpbmRleCksXG4gICAgICAnQHByaW1pdGl2ZSc6IGl0ZW0gPT4gU3RyaW5nKGl0ZW0pLFxuICAgICAgJ0BpZGVudGl0eSc6IGl0ZW0gPT4gaXRlbSxcbiAgICB9LFxuICAgIGRlZmF1bHQ6IGtleSA9PiBpdGVtID0+IGl0ZW1ba2V5XSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbGVnYWN5UHJvdG9jb2xGb3JVUkwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsZXQgbWF0Y2ggPSAvXihbYS16XVthLXowLTkuKy1dKjopPyhcXC9cXC8pPyhbXFxTXFxzXSopL2kuZXhlYyh1cmwpO1xuICAgIHJldHVybiBtYXRjaCAmJiBtYXRjaFsxXSA/IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkgOiAnJztcbiAgfVxuXG4gIGxldCBhbmNob3IgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBhbmNob3IuaHJlZiA9IHVybDtcbiAgcmV0dXJuIGFuY2hvci5wcm90b2NvbDtcbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRSdW50aW1lUmVzb2x2ZXI8UiBleHRlbmRzIHsgbW9kdWxlOiBzdHJpbmcgfT5cbiAgaW1wbGVtZW50cyBKaXRSdW50aW1lUmVzb2x2ZXI8Uj4sIEFvdFJ1bnRpbWVSZXNvbHZlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlKSB7fVxuXG4gIGxvb2t1cENvbXBvbmVudChuYW1lOiBzdHJpbmcsIHJlZmVycmVyPzogdW5rbm93bik6IE9wdGlvbjxhbnk+IHtcbiAgICBpZiAodGhpcy5pbm5lci5sb29rdXBDb21wb25lbnQpIHtcbiAgICAgIGxldCBjb21wb25lbnQgPSB0aGlzLmlubmVyLmxvb2t1cENvbXBvbmVudChuYW1lLCByZWZlcnJlcik7XG5cbiAgICAgIGlmIChjb21wb25lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuZXhwZWN0ZWQgY29tcG9uZW50ICR7bmFtZX0gKGZyb20gJHtyZWZlcnJlcn0pIChsb29rdXBDb21wb25lbnQgcmV0dXJuZWQgdW5kZWZpbmVkKWBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb29rdXBDb21wb25lbnQgbm90IGltcGxlbWVudGVkIG9uIFJ1bnRpbWVSZXNvbHZlci4nKTtcbiAgICB9XG4gIH1cblxuICBsb29rdXBQYXJ0aWFsKG5hbWU6IHN0cmluZywgcmVmZXJyZXI/OiB1bmtub3duKTogT3B0aW9uPG51bWJlcj4ge1xuICAgIGlmICh0aGlzLmlubmVyLmxvb2t1cFBhcnRpYWwpIHtcbiAgICAgIGxldCBwYXJ0aWFsID0gdGhpcy5pbm5lci5sb29rdXBQYXJ0aWFsKG5hbWUsIHJlZmVycmVyKTtcblxuICAgICAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuZXhwZWN0ZWQgcGFydGlhbCAke25hbWV9IChmcm9tICR7cmVmZXJyZXJ9KSAobG9va3VwUGFydGlhbCByZXR1cm5lZCB1bmRlZmluZWQpYFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFydGlhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb29rdXBQYXJ0aWFsIG5vdCBpbXBsZW1lbnRlZCBvbiBSdW50aW1lUmVzb2x2ZXIuJyk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZTxVIGV4dGVuZHMgUmVzb2x2ZWRWYWx1ZT4oaGFuZGxlOiBudW1iZXIpOiBVIHtcbiAgICBpZiAodGhpcy5pbm5lci5yZXNvbHZlKSB7XG4gICAgICBsZXQgcmVzb2x2ZWQgPSB0aGlzLmlubmVyLnJlc29sdmUoaGFuZGxlKTtcblxuICAgICAgaWYgKHJlc29sdmVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIGhhbmRsZSAke2hhbmRsZX0gKHJlc29sdmUgcmV0dXJuZWQgdW5kZWZpbmVkKWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzb2x2ZWQgYXMgVTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZXNvbHZlIG5vdCBpbXBsZW1lbnRlZCBvbiBSdW50aW1lUmVzb2x2ZXIuJyk7XG4gICAgfVxuICB9XG5cbiAgY29tcGlsYWJsZShsb2NhdG9yOiB7IG1vZHVsZTogc3RyaW5nIH0pOiBUZW1wbGF0ZSB7XG4gICAgaWYgKHRoaXMuaW5uZXIuY29tcGlsYWJsZSkge1xuICAgICAgbGV0IHJlc29sdmVkID0gdGhpcy5pbm5lci5jb21waWxhYmxlKGxvY2F0b3IpO1xuXG4gICAgICBpZiAocmVzb2x2ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBjb21waWxlICR7bmFtZX0gKGNvbXBpbGFibGUgcmV0dXJuZWQgdW5kZWZpbmVkKWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY29tcGlsYWJsZSBub3QgaW1wbGVtZW50ZWQgb24gUnVudGltZVJlc29sdmVyLicpO1xuICAgIH1cbiAgfVxuXG4gIGdldEludm9jYXRpb24obG9jYXRvcjogUik6IEludm9jYXRpb24ge1xuICAgIGlmICh0aGlzLmlubmVyLmdldEludm9jYXRpb24pIHtcbiAgICAgIGxldCBpbnZvY2F0aW9uID0gdGhpcy5pbm5lci5nZXRJbnZvY2F0aW9uKGxvY2F0b3IpO1xuXG4gICAgICBpZiAoaW52b2NhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGdldCBpbnZvY2F0aW9uIGZvciAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgbG9jYXRvclxuICAgICAgICAgICl9IChnZXRJbnZvY2F0aW9uIHJldHVybmVkIHVuZGVmaW5lZClgXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpbnZvY2F0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dldEludm9jYXRpb24gbm90IGltcGxlbWVudGVkIG9uIFJ1bnRpbWVSZXNvbHZlci4nKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFvdFJ1bnRpbWUoXG4gIGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCxcbiAgcHJvZ3JhbTogQ29tcGlsZXJBcnRpZmFjdHMsXG4gIHJlc29sdmVyOiBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZSA9IHt9LFxuICBkZWxlZ2F0ZTogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUgPSB7fVxuKTogQW90UnVudGltZUNvbnRleHQge1xuICBsZXQgZW52ID0gbmV3IFJ1bnRpbWVFbnZpcm9ubWVudChkb2N1bWVudCwgbmV3IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbChkZWxlZ2F0ZSkpO1xuXG4gIHJldHVybiB7XG4gICAgZW52LFxuICAgIHJlc29sdmVyOiBuZXcgRGVmYXVsdFJ1bnRpbWVSZXNvbHZlcihyZXNvbHZlciksXG4gICAgcHJvZ3JhbTogUnVudGltZVByb2dyYW1JbXBsLmh5ZHJhdGUocHJvZ3JhbSksXG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSml0UHJvZ3JhbUNvbXBpbGF0aW9uQ29udGV4dCBleHRlbmRzIFdob2xlUHJvZ3JhbUNvbXBpbGF0aW9uQ29udGV4dCB7XG4gIHJlYWRvbmx5IGNvbnN0YW50czogQ29tcGlsZVRpbWVDb25zdGFudHMgJiBSdW50aW1lQ29uc3RhbnRzO1xuICByZWFkb25seSBoZWFwOiBDb21waWxlVGltZUhlYXAgJiBSdW50aW1lSGVhcDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKaXRTeW50YXhDb21waWxhdGlvbkNvbnRleHQgZXh0ZW5kcyBTeW50YXhDb21waWxhdGlvbkNvbnRleHQge1xuICByZWFkb25seSBwcm9ncmFtOiBKaXRQcm9ncmFtQ29tcGlsYXRpb25Db250ZXh0O1xuICByZWFkb25seSBtYWNyb3M6IE1hY3Jvcztcbn1cblxuLy8gVE9ETzogVGhlcmUgYXJlIGEgbG90IG9mIHZhcmlhbnRzIGhlcmUuIFNvbWUgYXJlIGhlcmUgZm9yIHRyYW5zaXRpb25hbCBwdXJwb3Nlc1xuLy8gYW5kIHNvbWUgbWlnaHQgYmUgR0NhYmxlIG9uY2UgdGhlIGRlc2lnbiBzdGFiaWxpemVzLlxuZXhwb3J0IGZ1bmN0aW9uIEN1c3RvbUppdFJ1bnRpbWUoXG4gIHJlc29sdmVyOiBSdW50aW1lUmVzb2x2ZXIsXG4gIGNvbnRleHQ6IFN5bnRheENvbXBpbGF0aW9uQ29udGV4dCAmIHtcbiAgICBwcm9ncmFtOiB7IGNvbnN0YW50czogUnVudGltZUNvbnN0YW50czsgaGVhcDogUnVudGltZUhlYXAgfTtcbiAgfSxcbiAgZW52OiBFbnZpcm9ubWVudFxuKTogSml0UnVudGltZUNvbnRleHQge1xuICBsZXQgcHJvZ3JhbSA9IG5ldyBSdW50aW1lUHJvZ3JhbUltcGwoY29udGV4dC5wcm9ncmFtLmNvbnN0YW50cywgY29udGV4dC5wcm9ncmFtLmhlYXApO1xuXG4gIHJldHVybiB7XG4gICAgZW52LFxuICAgIHJlc29sdmVyOiBuZXcgRGVmYXVsdFJ1bnRpbWVSZXNvbHZlcihyZXNvbHZlciksXG4gICAgcHJvZ3JhbSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEppdFJ1bnRpbWUoXG4gIGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCxcbiAgcmVzb2x2ZXI6IFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlID0ge30sXG4gIGRlbGVnYXRlOiBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZSA9IHt9XG4pOiBKaXRSdW50aW1lQ29udGV4dCB7XG4gIGxldCBlbnYgPSBuZXcgUnVudGltZUVudmlyb25tZW50KGRvY3VtZW50LCBuZXcgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsKGRlbGVnYXRlKSk7XG5cbiAgbGV0IGNvbnN0YW50cyA9IG5ldyBDb25zdGFudHMoKTtcbiAgbGV0IGhlYXAgPSBuZXcgSGVhcEltcGwoKTtcbiAgbGV0IHByb2dyYW0gPSBuZXcgUnVudGltZVByb2dyYW1JbXBsKGNvbnN0YW50cywgaGVhcCk7XG5cbiAgcmV0dXJuIHtcbiAgICBlbnYsXG4gICAgcmVzb2x2ZXI6IG5ldyBEZWZhdWx0UnVudGltZVJlc29sdmVyKHJlc29sdmVyKSxcbiAgICBwcm9ncmFtLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSml0UnVudGltZUZyb21Qcm9ncmFtKFxuICBkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQsXG4gIHByb2dyYW06IFJ1bnRpbWVQcm9ncmFtLFxuICByZXNvbHZlcjogUnVudGltZVJlc29sdmVyRGVsZWdhdGUgPSB7fSxcbiAgZGVsZWdhdGU6IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlID0ge31cbik6IEppdFJ1bnRpbWVDb250ZXh0IHtcbiAgbGV0IGVudiA9IG5ldyBSdW50aW1lRW52aXJvbm1lbnQoZG9jdW1lbnQsIG5ldyBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZUltcGwoZGVsZWdhdGUpKTtcblxuICByZXR1cm4ge1xuICAgIGVudixcbiAgICByZXNvbHZlcjogbmV3IERlZmF1bHRSdW50aW1lUmVzb2x2ZXIocmVzb2x2ZXIpLFxuICAgIHByb2dyYW0sXG4gIH07XG59XG5cbmV4cG9ydCBjbGFzcyBSdW50aW1lRW52aXJvbm1lbnQgZXh0ZW5kcyBFbnZpcm9ubWVudEltcGwge1xuICBwcml2YXRlIGRlbGVnYXRlOiBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZUltcGw7XG5cbiAgY29uc3RydWN0b3IoZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50LCBkZWxlZ2F0ZTogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsKSB7XG4gICAgc3VwZXIoe1xuICAgICAgYXBwZW5kT3BlcmF0aW9uczogbmV3IERPTVRyZWVDb25zdHJ1Y3Rpb24oZG9jdW1lbnQpLFxuICAgICAgdXBkYXRlT3BlcmF0aW9uczogbmV3IERPTUNoYW5nZXNJbXBsKGRvY3VtZW50KSxcbiAgICB9KTtcblxuICAgIHRoaXMuZGVsZWdhdGUgPSBuZXcgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsKGRlbGVnYXRlKTtcbiAgfVxuXG4gIHByb3RvY29sRm9yVVJMKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5wcm90b2NvbEZvclVSTCh1cmwpO1xuICB9XG5cbiAgaXRlcmFibGVGb3IocmVmOiBSZWZlcmVuY2UsIGlucHV0S2V5OiB1bmtub3duKTogT3BhcXVlSXRlcmFibGUge1xuICAgIGxldCBrZXkgPSBTdHJpbmcoaW5wdXRLZXkpO1xuICAgIGxldCBkZWYgPSB0aGlzLmRlbGVnYXRlLml0ZXJhYmxlO1xuXG4gICAgbGV0IGtleUZvciA9IGtleSBpbiBkZWYubmFtZWQgPyBkZWYubmFtZWRba2V5XSA6IGRlZi5kZWZhdWx0KGtleSk7XG5cbiAgICByZXR1cm4gbmV3IEl0ZXJhYmxlSW1wbChyZWYsIGtleUZvcik7XG4gIH1cblxuICB0b0NvbmRpdGlvbmFsUmVmZXJlbmNlKGlucHV0OiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlKTogVmVyc2lvbmVkUmVmZXJlbmNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsUmVmZXJlbmNlKGlucHV0LCB0aGlzLmRlbGVnYXRlLnRvQm9vbCk7XG4gIH1cblxuICBhdHRyaWJ1dGVGb3IoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBhdHRyOiBzdHJpbmcsXG4gICAgaXNUcnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPlxuICApOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5hdHRyaWJ1dGVGb3IoZWxlbWVudCwgYXR0ciwgaXNUcnVzdGluZywgbmFtZXNwYWNlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5UcmFuc2FjdGlvbihlbnY6IEVudmlyb25tZW50LCBjYjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICBpZiAoIWVudltUUkFOU0FDVElPTl0pIHtcbiAgICBlbnYuYmVnaW4oKTtcbiAgICB0cnkge1xuICAgICAgY2IoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgZW52LmNvbW1pdCgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjYigpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEZWZhdWx0RW52aXJvbm1lbnQgZXh0ZW5kcyBFbnZpcm9ubWVudEltcGwge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogRW52aXJvbm1lbnRPcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBsZXQgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQgYXMgU2ltcGxlRG9jdW1lbnQ7XG4gICAgICBsZXQgYXBwZW5kT3BlcmF0aW9ucyA9IG5ldyBET01UcmVlQ29uc3RydWN0aW9uKGRvY3VtZW50KTtcbiAgICAgIGxldCB1cGRhdGVPcGVyYXRpb25zID0gbmV3IERPTUNoYW5nZXNJbXBsKGRvY3VtZW50KTtcbiAgICAgIG9wdGlvbnMgPSB7IGFwcGVuZE9wZXJhdGlvbnMsIHVwZGF0ZU9wZXJhdGlvbnMgfTtcbiAgICB9XG5cbiAgICBzdXBlcihvcHRpb25zKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFbnZpcm9ubWVudEltcGw7XG4iLCJpbXBvcnQgeyBMb3dMZXZlbFZNLCBWTSwgVXBkYXRpbmdWTSB9IGZyb20gJy4vdm0nO1xuXG5pbXBvcnQgeyBPcHRpb24sIFNsaWNlIGFzIExpc3RTbGljZSwgaW5pdGlhbGl6ZUd1aWQsIGZpbGxOdWxscywgYXNzZXJ0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyByZWNvcmRTdGFja1NpemUsIG9wY29kZU1ldGFkYXRhIH0gZnJvbSAnQGdsaW1tZXIvZGVidWcnO1xuaW1wb3J0IHsgJHBjLCAkc3AsICRyYSwgJGZwIH0gZnJvbSAnQGdsaW1tZXIvdm0nO1xuaW1wb3J0IHsgVGFnIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IFJ1bnRpbWVPcCwgT3AsIEppdE9yQW90QmxvY2ssIE1heWJlLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBERUJVRywgREVWTU9ERSB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbi8vIHRoZXNlIGltcG9ydCBiaW5kaW5ncyB3aWxsIGJlIHN0cmlwcGVkIGZyb20gYnVpbGRcbmltcG9ydCB7IGRlYnVnLCBsb2dPcGNvZGUgfSBmcm9tICdAZ2xpbW1lci9vcGNvZGUtY29tcGlsZXInO1xuaW1wb3J0IHsgREVTVFJVQ1RPUl9TVEFDSywgSU5ORVJfVk0sIENPTlNUQU5UUywgU1RBQ0tTIH0gZnJvbSAnLi9zeW1ib2xzJztcbmltcG9ydCB7IEludGVybmFsVk0sIEludGVybmFsSml0Vk0gfSBmcm9tICcuL3ZtL2FwcGVuZCc7XG5pbXBvcnQgeyBDVVJTT1JfU1RBQ0sgfSBmcm9tICcuL3ZtL2VsZW1lbnQtYnVpbGRlcic7XG5pbXBvcnQgeyBpc1Njb3BlUmVmZXJlbmNlIH0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3Bjb2RlSlNPTiB7XG4gIHR5cGU6IG51bWJlciB8IHN0cmluZztcbiAgZ3VpZD86IE9wdGlvbjxudW1iZXI+O1xuICBkZW9wdGVkPzogYm9vbGVhbjtcbiAgYXJncz86IHN0cmluZ1tdO1xuICBkZXRhaWxzPzogRGljdDxPcHRpb248c3RyaW5nPj47XG4gIGNoaWxkcmVuPzogT3Bjb2RlSlNPTltdO1xufVxuXG5leHBvcnQgdHlwZSBPcGVyYW5kMSA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIE9wZXJhbmQyID0gbnVtYmVyO1xuZXhwb3J0IHR5cGUgT3BlcmFuZDMgPSBudW1iZXI7XG5cbmV4cG9ydCB0eXBlIFN5c2NhbGwgPSAodm06IEludGVybmFsVk08Sml0T3JBb3RCbG9jaz4sIG9wY29kZTogUnVudGltZU9wKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgSml0U3lzY2FsbCA9ICh2bTogSW50ZXJuYWxKaXRWTSwgb3Bjb2RlOiBSdW50aW1lT3ApID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBNYWNoaW5lT3Bjb2RlID0gKHZtOiBMb3dMZXZlbFZNLCBvcGNvZGU6IFJ1bnRpbWVPcCkgPT4gdm9pZDtcblxuZXhwb3J0IHR5cGUgRXZhbHVhdGUgPVxuICB8IHsgc3lzY2FsbDogdHJ1ZTsgZXZhbHVhdGU6IFN5c2NhbGwgfVxuICB8IHsgc3lzY2FsbDogZmFsc2U7IGV2YWx1YXRlOiBNYWNoaW5lT3Bjb2RlIH07XG5cbmV4cG9ydCB0eXBlIERlYnVnU3RhdGUgPSB7XG4gIHBjOiBudW1iZXI7XG4gIHNwOiBudW1iZXI7XG4gIHR5cGU6IG51bWJlcjtcbiAgaXNNYWNoaW5lOiAwIHwgMTtcbiAgc2l6ZTogbnVtYmVyO1xuICBwYXJhbXM/OiBNYXliZTxEaWN0PjtcbiAgbmFtZT86IHN0cmluZztcbiAgc3RhdGU6IHVua25vd247XG59O1xuXG5leHBvcnQgY2xhc3MgQXBwZW5kT3Bjb2RlcyB7XG4gIHByaXZhdGUgZXZhbHVhdGVPcGNvZGU6IEV2YWx1YXRlW10gPSBmaWxsTnVsbHM8RXZhbHVhdGU+KE9wLlNpemUpLnNsaWNlKCk7XG5cbiAgYWRkPE5hbWUgZXh0ZW5kcyBPcD4obmFtZTogTmFtZSwgZXZhbHVhdGU6IFN5c2NhbGwpOiB2b2lkO1xuICBhZGQ8TmFtZSBleHRlbmRzIE9wPihuYW1lOiBOYW1lLCBldmFsdWF0ZTogTWFjaGluZU9wY29kZSwga2luZDogJ21hY2hpbmUnKTogdm9pZDtcbiAgYWRkPE5hbWUgZXh0ZW5kcyBPcD4obmFtZTogTmFtZSwgZXZhbHVhdGU6IEppdFN5c2NhbGwsIGtpbmQ6ICdqaXQnKTogdm9pZDtcbiAgYWRkPE5hbWUgZXh0ZW5kcyBPcD4oXG4gICAgbmFtZTogTmFtZSxcbiAgICBldmFsdWF0ZTogU3lzY2FsbCB8IEppdFN5c2NhbGwgfCBNYWNoaW5lT3Bjb2RlLFxuICAgIGtpbmQgPSAnc3lzY2FsbCdcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5ldmFsdWF0ZU9wY29kZVtuYW1lIGFzIG51bWJlcl0gPSB7XG4gICAgICBzeXNjYWxsOiBraW5kICE9PSAnbWFjaGluZScsXG4gICAgICBldmFsdWF0ZSxcbiAgICB9IGFzIEV2YWx1YXRlO1xuICB9XG5cbiAgZGVidWdCZWZvcmUodm06IFZNPEppdE9yQW90QmxvY2s+LCBvcGNvZGU6IFJ1bnRpbWVPcCk6IERlYnVnU3RhdGUge1xuICAgIGxldCBwYXJhbXM6IE1heWJlPERpY3Q+ID0gdW5kZWZpbmVkO1xuICAgIGxldCBvcE5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgbGV0IHBvcyA9IHZtW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYykgLSBvcGNvZGUuc2l6ZTtcblxuICAgICAgW29wTmFtZSwgcGFyYW1zXSA9IGRlYnVnKHZtW0NPTlNUQU5UU10sIHZtLnJ1bnRpbWUucmVzb2x2ZXIsIG9wY29kZSwgb3Bjb2RlLmlzTWFjaGluZSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKGAke3R5cGVQb3Modm1bJ3BjJ10pfS5gKTtcbiAgICAgIGNvbnNvbGUubG9nKGAke3Bvc30uICR7bG9nT3Bjb2RlKG9wTmFtZSwgcGFyYW1zKX1gKTtcblxuICAgICAgbGV0IGRlYnVnUGFyYW1zID0gW107XG4gICAgICBmb3IgKGxldCBwcm9wIGluIHBhcmFtcykge1xuICAgICAgICBkZWJ1Z1BhcmFtcy5wdXNoKHByb3AsICc9JywgcGFyYW1zW3Byb3BdKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coLi4uZGVidWdQYXJhbXMpO1xuICAgIH1cblxuICAgIGxldCBzcDogbnVtYmVyO1xuXG4gICAgaWYgKERFVk1PREUpIHtcbiAgICAgIHNwID0gdm0uZmV0Y2hWYWx1ZSgkc3ApO1xuICAgIH1cblxuICAgIHJlY29yZFN0YWNrU2l6ZSh2bS5mZXRjaFZhbHVlKCRzcCkpO1xuICAgIHJldHVybiB7XG4gICAgICBzcDogc3AhLFxuICAgICAgcGM6IHZtLmZldGNoVmFsdWUoJHBjKSxcbiAgICAgIG5hbWU6IG9wTmFtZSxcbiAgICAgIHBhcmFtcyxcbiAgICAgIHR5cGU6IG9wY29kZS50eXBlLFxuICAgICAgaXNNYWNoaW5lOiBvcGNvZGUuaXNNYWNoaW5lLFxuICAgICAgc2l6ZTogb3Bjb2RlLnNpemUsXG4gICAgICBzdGF0ZTogdW5kZWZpbmVkLFxuICAgIH07XG4gIH1cblxuICBkZWJ1Z0FmdGVyKHZtOiBWTTxKaXRPckFvdEJsb2NrPiwgcHJlOiBEZWJ1Z1N0YXRlKSB7XG4gICAgbGV0IHsgc3AsIHR5cGUsIGlzTWFjaGluZSwgcGMgfSA9IHByZTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgbGV0IG1ldGEgPSBvcGNvZGVNZXRhZGF0YSh0eXBlLCBpc01hY2hpbmUpO1xuICAgICAgbGV0IGFjdHVhbENoYW5nZSA9IHZtLmZldGNoVmFsdWUoJHNwKSAtIHNwITtcbiAgICAgIGlmIChcbiAgICAgICAgbWV0YSAmJlxuICAgICAgICBtZXRhLmNoZWNrICYmXG4gICAgICAgIHR5cGVvZiBtZXRhLnN0YWNrQ2hhbmdlISA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgbWV0YS5zdGFja0NoYW5nZSEgIT09IGFjdHVhbENoYW5nZVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRXJyb3IgaW4gJHtwcmUubmFtZX06XFxuXFxuJHtwY30uICR7bG9nT3Bjb2RlKFxuICAgICAgICAgICAgcHJlLm5hbWUhLFxuICAgICAgICAgICAgcHJlLnBhcmFtcyFcbiAgICAgICAgICApfVxcblxcblN0YWNrIGNoYW5nZWQgYnkgJHthY3R1YWxDaGFuZ2V9LCBleHBlY3RlZCAke21ldGEuc3RhY2tDaGFuZ2UhfWBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICclYyAtPiBwYzogJWQsIHJhOiAlZCwgZnA6ICVkLCBzcDogJWQsIHMwOiAlTywgczE6ICVPLCB0MDogJU8sIHQxOiAlTywgdjA6ICVPJyxcbiAgICAgICAgJ2NvbG9yOiBvcmFuZ2UnLFxuICAgICAgICB2bVtJTk5FUl9WTV0ucmVnaXN0ZXJzWyRwY10sXG4gICAgICAgIHZtW0lOTkVSX1ZNXS5yZWdpc3RlcnNbJHJhXSxcbiAgICAgICAgdm1bSU5ORVJfVk1dLnJlZ2lzdGVyc1skZnBdLFxuICAgICAgICB2bVtJTk5FUl9WTV0ucmVnaXN0ZXJzWyRzcF0sXG4gICAgICAgIHZtWydzMCddLFxuICAgICAgICB2bVsnczEnXSxcbiAgICAgICAgdm1bJ3QwJ10sXG4gICAgICAgIHZtWyd0MSddLFxuICAgICAgICB2bVsndjAnXVxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKCclYyAtPiBldmFsIHN0YWNrJywgJ2NvbG9yOiByZWQnLCB2bS5zdGFjay50b0FycmF5KCkpO1xuICAgICAgY29uc29sZS5sb2coJyVjIC0+IGJsb2NrIHN0YWNrJywgJ2NvbG9yOiBtYWdlbnRhJywgdm0uZWxlbWVudHMoKS5kZWJ1Z0Jsb2NrcygpKTtcbiAgICAgIGNvbnNvbGUubG9nKCclYyAtPiBkZXN0cnVjdG9yIHN0YWNrJywgJ2NvbG9yOiB2aW9sZXQnLCB2bVtERVNUUlVDVE9SX1NUQUNLXS50b0FycmF5KCkpO1xuICAgICAgaWYgKHZtW1NUQUNLU10uc2NvcGUuY3VycmVudCA9PT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLmxvZygnJWMgLT4gc2NvcGUnLCAnY29sb3I6IGdyZWVuJywgJ251bGwnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICclYyAtPiBzY29wZScsXG4gICAgICAgICAgJ2NvbG9yOiBncmVlbicsXG4gICAgICAgICAgdm0uc2NvcGUoKS5zbG90cy5tYXAocyA9PiAoaXNTY29wZVJlZmVyZW5jZShzKSA/IHMudmFsdWUoKSA6IHMpKVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZygnJWMgLT4gZWxlbWVudHMnLCAnY29sb3I6IGJsdWUnLCB2bS5lbGVtZW50cygpW0NVUlNPUl9TVEFDS10uY3VycmVudCEuZWxlbWVudCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCclYyAtPiBjb25zdHJ1Y3RpbmcnLCAnY29sb3I6IGFxdWEnLCB2bS5lbGVtZW50cygpWydjb25zdHJ1Y3RpbmcnXSk7XG4gICAgfVxuICB9XG5cbiAgZXZhbHVhdGUodm06IFZNPEppdE9yQW90QmxvY2s+LCBvcGNvZGU6IFJ1bnRpbWVPcCwgdHlwZTogbnVtYmVyKSB7XG4gICAgbGV0IG9wZXJhdGlvbiA9IHRoaXMuZXZhbHVhdGVPcGNvZGVbdHlwZV07XG5cbiAgICBpZiAob3BlcmF0aW9uLnN5c2NhbGwpIHtcbiAgICAgIGFzc2VydChcbiAgICAgICAgIW9wY29kZS5pc01hY2hpbmUsXG4gICAgICAgIGBCVUc6IE1pc21hdGNoIGJldHdlZW4gb3BlcmF0aW9uLnN5c2NhbGwgKCR7b3BlcmF0aW9uLnN5c2NhbGx9KSBhbmQgb3Bjb2RlLmlzTWFjaGluZSAoJHtvcGNvZGUuaXNNYWNoaW5lfSkgZm9yICR7b3Bjb2RlLnR5cGV9YFxuICAgICAgKTtcbiAgICAgIG9wZXJhdGlvbi5ldmFsdWF0ZSh2bSwgb3Bjb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzZXJ0KFxuICAgICAgICBvcGNvZGUuaXNNYWNoaW5lLFxuICAgICAgICBgQlVHOiBNaXNtYXRjaCBiZXR3ZWVuIG9wZXJhdGlvbi5zeXNjYWxsICgke29wZXJhdGlvbi5zeXNjYWxsfSkgYW5kIG9wY29kZS5pc01hY2hpbmUgKCR7b3Bjb2RlLmlzTWFjaGluZX0pIGZvciAke29wY29kZS50eXBlfWBcbiAgICAgICk7XG4gICAgICBvcGVyYXRpb24uZXZhbHVhdGUodm1bSU5ORVJfVk1dLCBvcGNvZGUpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQVBQRU5EX09QQ09ERVMgPSBuZXcgQXBwZW5kT3Bjb2RlcygpO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RPcGNvZGUge1xuICBwdWJsaWMgYWJzdHJhY3QgdHlwZTogc3RyaW5nO1xuICBwdWJsaWMgX2d1aWQhOiBudW1iZXI7IC8vIFNldCBieSBpbml0aWFsaXplR3VpZCgpIGluIHRoZSBjb25zdHJ1Y3RvclxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGluaXRpYWxpemVHdWlkKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBVcGRhdGluZ09wY29kZSBleHRlbmRzIEFic3RyYWN0T3Bjb2RlIHtcbiAgcHVibGljIGFic3RyYWN0IHRhZzogVGFnO1xuXG4gIG5leHQ6IE9wdGlvbjxVcGRhdGluZ09wY29kZT4gPSBudWxsO1xuICBwcmV2OiBPcHRpb248VXBkYXRpbmdPcGNvZGU+ID0gbnVsbDtcblxuICBhYnN0cmFjdCBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSk6IHZvaWQ7XG59XG5cbmV4cG9ydCB0eXBlIFVwZGF0aW5nT3BTZXEgPSBMaXN0U2xpY2U8VXBkYXRpbmdPcGNvZGU+O1xuIiwiaW1wb3J0IHsgT3B0aW9uLCBEaWN0LCBNYXliZSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQ2FjaGVkUmVmZXJlbmNlLCBjb21iaW5lVGFnZ2VkLCBQYXRoUmVmZXJlbmNlLCBUYWcgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuXG5leHBvcnQgY2xhc3MgQ29uY2F0UmVmZXJlbmNlIGV4dGVuZHMgQ2FjaGVkUmVmZXJlbmNlPE9wdGlvbjxzdHJpbmc+PiB7XG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcnRzOiBBcnJheTxQYXRoUmVmZXJlbmNlPHVua25vd24+Pikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy50YWcgPSBjb21iaW5lVGFnZ2VkKHBhcnRzKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjb21wdXRlKCk6IE9wdGlvbjxzdHJpbmc+IHtcbiAgICBsZXQgcGFydHMgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLnBhcnRzW2ldLnZhbHVlKCkgYXMgTWF5YmU8RGljdD47XG5cbiAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBhcnRzW2ldID0gY2FzdFRvU3RyaW5nKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oJycpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhc3RUb1N0cmluZyh2YWx1ZTogRGljdCkge1xuICBpZiAodHlwZW9mIHZhbHVlLnRvU3RyaW5nICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG59XG4iLCJpbXBvcnQgeyBPcHRpb24sIE9wLCBKaXRTY29wZUJsb2NrLCBBb3RTY29wZUJsb2NrLCBWTSBhcyBQdWJsaWNWTSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyAkdjAgfSBmcm9tICdAZ2xpbW1lci92bSc7XG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUyB9IGZyb20gJy4uLy4uL29wY29kZXMnO1xuaW1wb3J0IHsgRkFMU0VfUkVGRVJFTkNFLCBUUlVFX1JFRkVSRU5DRSB9IGZyb20gJy4uLy4uL3JlZmVyZW5jZXMnO1xuaW1wb3J0IHsgQ29uY2F0UmVmZXJlbmNlIH0gZnJvbSAnLi4vZXhwcmVzc2lvbnMvY29uY2F0JztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgY2hlY2ssIENoZWNrT3B0aW9uLCBDaGVja0hhbmRsZSwgQ2hlY2tCbG9ja1N5bWJvbFRhYmxlLCBDaGVja09yIH0gZnJvbSAnQGdsaW1tZXIvZGVidWcnO1xuaW1wb3J0IHsgc3RhY2tBc3NlcnQgfSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge1xuICBDaGVja0FyZ3VtZW50cyxcbiAgQ2hlY2tQYXRoUmVmZXJlbmNlLFxuICBDaGVja0NvbXBpbGFibGVCbG9jayxcbiAgQ2hlY2tTY29wZSxcbiAgQ2hlY2tIZWxwZXIsXG59IGZyb20gJy4vLWRlYnVnLXN0cmlwJztcbmltcG9ydCB7IENPTlNUQU5UUyB9IGZyb20gJy4uLy4uL3N5bWJvbHMnO1xuXG5leHBvcnQgdHlwZSBGdW5jdGlvbkV4cHJlc3Npb248VD4gPSAodm06IFB1YmxpY1ZNKSA9PiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+O1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuSGVscGVyLCAodm0sIHsgb3AxOiBoYW5kbGUgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IGhlbHBlciA9IGNoZWNrKHZtLnJ1bnRpbWUucmVzb2x2ZXIucmVzb2x2ZShoYW5kbGUpLCBDaGVja0hlbHBlcik7XG4gIGxldCBhcmdzID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrQXJndW1lbnRzKTtcbiAgbGV0IHZhbHVlID0gaGVscGVyKGFyZ3MsIHZtKTtcblxuICB2bS5sb2FkVmFsdWUoJHYwLCB2YWx1ZSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkdldFZhcmlhYmxlLCAodm0sIHsgb3AxOiBzeW1ib2wgfSkgPT4ge1xuICBsZXQgZXhwciA9IHZtLnJlZmVyZW5jZUZvclN5bWJvbChzeW1ib2wpO1xuICB2bS5zdGFjay5wdXNoKGV4cHIpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TZXRWYXJpYWJsZSwgKHZtLCB7IG9wMTogc3ltYm9sIH0pID0+IHtcbiAgbGV0IGV4cHIgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKTtcbiAgdm0uc2NvcGUoKS5iaW5kU3ltYm9sKHN5bWJvbCwgZXhwcik7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKFxuICBPcC5TZXRKaXRCbG9jayxcbiAgKHZtLCB7IG9wMTogc3ltYm9sIH0pID0+IHtcbiAgICBsZXQgaGFuZGxlID0gY2hlY2sodm0uc3RhY2sucG9wKCksIENoZWNrT3B0aW9uKENoZWNrQ29tcGlsYWJsZUJsb2NrKSk7XG4gICAgbGV0IHNjb3BlID0gY2hlY2sodm0uc3RhY2sucG9wKCksIENoZWNrU2NvcGUpO1xuICAgIGxldCB0YWJsZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja09wdGlvbihDaGVja0Jsb2NrU3ltYm9sVGFibGUpKTtcblxuICAgIGxldCBibG9jazogT3B0aW9uPEppdFNjb3BlQmxvY2s+ID0gdGFibGUgPyBbaGFuZGxlISwgc2NvcGUsIHRhYmxlXSA6IG51bGw7XG5cbiAgICB2bS5zY29wZSgpLmJpbmRCbG9jayhzeW1ib2wsIGJsb2NrKTtcbiAgfSxcbiAgJ2ppdCdcbik7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TZXRBb3RCbG9jaywgKHZtLCB7IG9wMTogc3ltYm9sIH0pID0+IHtcbiAgbGV0IGhhbmRsZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja09wdGlvbihDaGVja0hhbmRsZSkpO1xuICBsZXQgc2NvcGUgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tTY29wZSk7XG4gIGxldCB0YWJsZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja09wdGlvbihDaGVja0Jsb2NrU3ltYm9sVGFibGUpKTtcblxuICBsZXQgYmxvY2s6IE9wdGlvbjxBb3RTY29wZUJsb2NrPiA9IHRhYmxlID8gW2hhbmRsZSEsIHNjb3BlLCB0YWJsZV0gOiBudWxsO1xuXG4gIHZtLnNjb3BlKCkuYmluZEJsb2NrKHN5bWJvbCwgYmxvY2spO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5SZXNvbHZlTWF5YmVMb2NhbCwgKHZtLCB7IG9wMTogX25hbWUgfSkgPT4ge1xuICBsZXQgbmFtZSA9IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lKTtcbiAgbGV0IGxvY2FscyA9IHZtLnNjb3BlKCkuZ2V0UGFydGlhbE1hcCgpITtcblxuICBsZXQgcmVmID0gbG9jYWxzW25hbWVdO1xuICBpZiAocmVmID09PSB1bmRlZmluZWQpIHtcbiAgICByZWYgPSB2bS5nZXRTZWxmKCkuZ2V0KG5hbWUpO1xuICB9XG5cbiAgdm0uc3RhY2sucHVzaChyZWYpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Sb290U2NvcGUsICh2bSwgeyBvcDE6IHN5bWJvbHMgfSkgPT4ge1xuICB2bS5wdXNoUm9vdFNjb3BlKHN5bWJvbHMpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5HZXRQcm9wZXJ0eSwgKHZtLCB7IG9wMTogX2tleSB9KSA9PiB7XG4gIGxldCBrZXkgPSB2bVtDT05TVEFOVFNdLmdldFN0cmluZyhfa2V5KTtcbiAgbGV0IGV4cHIgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKTtcbiAgdm0uc3RhY2sucHVzaChleHByLmdldChrZXkpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuR2V0QmxvY2ssICh2bSwgeyBvcDE6IF9ibG9jayB9KSA9PiB7XG4gIGxldCB7IHN0YWNrIH0gPSB2bTtcbiAgbGV0IGJsb2NrID0gdm0uc2NvcGUoKS5nZXRCbG9jayhfYmxvY2spO1xuXG4gIGlmIChibG9jaykge1xuICAgIHN0YWNrLnB1c2goYmxvY2tbMl0pO1xuICAgIHN0YWNrLnB1c2goYmxvY2tbMV0pO1xuICAgIHN0YWNrLnB1c2goYmxvY2tbMF0pO1xuICB9IGVsc2Uge1xuICAgIHN0YWNrLnB1c2gobnVsbCk7XG4gICAgc3RhY2sucHVzaChudWxsKTtcbiAgICBzdGFjay5wdXNoKG51bGwpO1xuICB9XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkhhc0Jsb2NrLCAodm0sIHsgb3AxOiBfYmxvY2sgfSkgPT4ge1xuICBsZXQgaGFzQmxvY2sgPSAhIXZtLnNjb3BlKCkuZ2V0QmxvY2soX2Jsb2NrKTtcbiAgdm0uc3RhY2sucHVzaChoYXNCbG9jayA/IFRSVUVfUkVGRVJFTkNFIDogRkFMU0VfUkVGRVJFTkNFKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuSGFzQmxvY2tQYXJhbXMsIHZtID0+IHtcbiAgLy8gRklYTUUobW11bik6IHNob3VsZCBvbmx5IG5lZWQgdG8gcHVzaCB0aGUgc3ltYm9sIHRhYmxlXG4gIGxldCBibG9jayA9IHZtLnN0YWNrLnBvcCgpO1xuICBsZXQgc2NvcGUgPSB2bS5zdGFjay5wb3AoKTtcbiAgY2hlY2soYmxvY2ssIENoZWNrT3B0aW9uKENoZWNrT3IoQ2hlY2tIYW5kbGUsIENoZWNrQ29tcGlsYWJsZUJsb2NrKSkpO1xuICBjaGVjayhzY29wZSwgQ2hlY2tPcHRpb24oQ2hlY2tTY29wZSkpO1xuICBsZXQgdGFibGUgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tPcHRpb24oQ2hlY2tCbG9ja1N5bWJvbFRhYmxlKSk7XG5cbiAgYXNzZXJ0KFxuICAgIHRhYmxlID09PSBudWxsIHx8ICh0YWJsZSAmJiB0eXBlb2YgdGFibGUgPT09ICdvYmplY3QnICYmIEFycmF5LmlzQXJyYXkodGFibGUucGFyYW1ldGVycykpLFxuICAgIHN0YWNrQXNzZXJ0KCdPcHRpb248QmxvY2tTeW1ib2xUYWJsZT4nLCB0YWJsZSlcbiAgKTtcblxuICBsZXQgaGFzQmxvY2tQYXJhbXMgPSB0YWJsZSAmJiB0YWJsZS5wYXJhbWV0ZXJzLmxlbmd0aDtcbiAgdm0uc3RhY2sucHVzaChoYXNCbG9ja1BhcmFtcyA/IFRSVUVfUkVGRVJFTkNFIDogRkFMU0VfUkVGRVJFTkNFKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ29uY2F0LCAodm0sIHsgb3AxOiBjb3VudCB9KSA9PiB7XG4gIGxldCBvdXQ6IEFycmF5PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+ID0gbmV3IEFycmF5KGNvdW50KTtcblxuICBmb3IgKGxldCBpID0gY291bnQ7IGkgPiAwOyBpLS0pIHtcbiAgICBsZXQgb2Zmc2V0ID0gaSAtIDE7XG4gICAgb3V0W29mZnNldF0gPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKTtcbiAgfVxuXG4gIHZtLnN0YWNrLnB1c2gobmV3IENvbmNhdFJlZmVyZW5jZShvdXQpKTtcbn0pO1xuIiwiaW1wb3J0IHtcbiAgQ29tcG9uZW50Q2FwYWJpbGl0aWVzLFxuICBDb21wb25lbnRNYW5hZ2VyLFxuICBXaXRoVXBkYXRlSG9vayxcbiAgV2l0aFByZXBhcmVBcmdzLFxuICBXaXRoQ3JlYXRlSW5zdGFuY2UsXG4gIFdpdGhKaXREeW5hbWljTGF5b3V0LFxuICBXaXRoQW90RHluYW1pY0xheW91dCxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBjaGVjaywgQ2hlY2tOdW1iZXIgfSBmcm9tICdAZ2xpbW1lci9kZWJ1Zyc7XG5cbmV4cG9ydCBjb25zdCBlbnVtIENhcGFiaWxpdHkge1xuICBEeW5hbWljTGF5b3V0ID0gMGIwMDAwMDAwMDAwMSxcbiAgRHluYW1pY1RhZyA9IDBiMDAwMDAwMDAwMTAsXG4gIFByZXBhcmVBcmdzID0gMGIwMDAwMDAwMDEwMCxcbiAgQ3JlYXRlQXJncyA9IDBiMDAwMDAwMDEwMDAsXG4gIEF0dHJpYnV0ZUhvb2sgPSAwYjAwMDAwMDEwMDAwLFxuICBFbGVtZW50SG9vayA9IDBiMDAwMDAxMDAwMDAsXG4gIER5bmFtaWNTY29wZSA9IDBiMDAwMDEwMDAwMDAsXG4gIENyZWF0ZUNhbGxlciA9IDBiMDAwMTAwMDAwMDAsXG4gIFVwZGF0ZUhvb2sgPSAwYjAwMTAwMDAwMDAwLFxuICBDcmVhdGVJbnN0YW5jZSA9IDBiMDEwMDAwMDAwMDAsXG4gIFdyYXBwZWQgPSAwYjEwMDAwMDAwMDAwLFxufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgQ29tcG9uZW50Q2FwYWJpbGl0aWVzIG9iamVjdCBpbnRvIGEgMzItYml0IGludGVnZXIgcmVwcmVzZW50YXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYXBhYmlsaXR5RmxhZ3NGcm9tKGNhcGFiaWxpdGllczogQ29tcG9uZW50Q2FwYWJpbGl0aWVzKTogQ2FwYWJpbGl0eSB7XG4gIHJldHVybiAoXG4gICAgMCB8XG4gICAgKGNhcGFiaWxpdGllcy5keW5hbWljTGF5b3V0ID8gQ2FwYWJpbGl0eS5EeW5hbWljTGF5b3V0IDogMCkgfFxuICAgIChjYXBhYmlsaXRpZXMuZHluYW1pY1RhZyA/IENhcGFiaWxpdHkuRHluYW1pY1RhZyA6IDApIHxcbiAgICAoY2FwYWJpbGl0aWVzLnByZXBhcmVBcmdzID8gQ2FwYWJpbGl0eS5QcmVwYXJlQXJncyA6IDApIHxcbiAgICAoY2FwYWJpbGl0aWVzLmNyZWF0ZUFyZ3MgPyBDYXBhYmlsaXR5LkNyZWF0ZUFyZ3MgOiAwKSB8XG4gICAgKGNhcGFiaWxpdGllcy5hdHRyaWJ1dGVIb29rID8gQ2FwYWJpbGl0eS5BdHRyaWJ1dGVIb29rIDogMCkgfFxuICAgIChjYXBhYmlsaXRpZXMuZWxlbWVudEhvb2sgPyBDYXBhYmlsaXR5LkVsZW1lbnRIb29rIDogMCkgfFxuICAgIChjYXBhYmlsaXRpZXMuZHluYW1pY1Njb3BlID8gQ2FwYWJpbGl0eS5EeW5hbWljU2NvcGUgOiAwKSB8XG4gICAgKGNhcGFiaWxpdGllcy5jcmVhdGVDYWxsZXIgPyBDYXBhYmlsaXR5LkNyZWF0ZUNhbGxlciA6IDApIHxcbiAgICAoY2FwYWJpbGl0aWVzLnVwZGF0ZUhvb2sgPyBDYXBhYmlsaXR5LlVwZGF0ZUhvb2sgOiAwKSB8XG4gICAgKGNhcGFiaWxpdGllcy5jcmVhdGVJbnN0YW5jZSA/IENhcGFiaWxpdHkuQ3JlYXRlSW5zdGFuY2UgOiAwKSB8XG4gICAgKGNhcGFiaWxpdGllcy53cmFwcGVkID8gQ2FwYWJpbGl0eS5XcmFwcGVkIDogMClcbiAgKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDYXBhYmlsaXR5TWFwIHtcbiAgW0NhcGFiaWxpdHkuRHluYW1pY0xheW91dF06IFdpdGhKaXREeW5hbWljTGF5b3V0IHwgV2l0aEFvdER5bmFtaWNMYXlvdXQ7XG4gIFtDYXBhYmlsaXR5LkR5bmFtaWNUYWddOiBDb21wb25lbnRNYW5hZ2VyO1xuICBbQ2FwYWJpbGl0eS5QcmVwYXJlQXJnc106IFdpdGhQcmVwYXJlQXJncztcbiAgW0NhcGFiaWxpdHkuQ3JlYXRlQXJnc106IENvbXBvbmVudE1hbmFnZXI7XG4gIFtDYXBhYmlsaXR5LkF0dHJpYnV0ZUhvb2tdOiBDb21wb25lbnRNYW5hZ2VyO1xuICBbQ2FwYWJpbGl0eS5FbGVtZW50SG9va106IENvbXBvbmVudE1hbmFnZXI7XG4gIFtDYXBhYmlsaXR5LkR5bmFtaWNTY29wZV06IENvbXBvbmVudE1hbmFnZXI7XG4gIFtDYXBhYmlsaXR5LkNyZWF0ZUNhbGxlcl06IENvbXBvbmVudE1hbmFnZXI7XG4gIFtDYXBhYmlsaXR5LlVwZGF0ZUhvb2tdOiBXaXRoVXBkYXRlSG9vaztcbiAgW0NhcGFiaWxpdHkuQ3JlYXRlSW5zdGFuY2VdOiBXaXRoQ3JlYXRlSW5zdGFuY2U7XG4gIFtDYXBhYmlsaXR5LldyYXBwZWRdOiBDb21wb25lbnRNYW5hZ2VyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFuYWdlckhhc0NhcGFiaWxpdHk8RiBleHRlbmRzIGtleW9mIENhcGFiaWxpdHlNYXA+KFxuICBfbWFuYWdlcjogQ29tcG9uZW50TWFuYWdlcixcbiAgY2FwYWJpbGl0aWVzOiBDYXBhYmlsaXR5LFxuICBjYXBhYmlsaXR5OiBGXG4pOiBfbWFuYWdlciBpcyBDYXBhYmlsaXR5TWFwW0ZdIHtcbiAgY2hlY2soY2FwYWJpbGl0aWVzLCBDaGVja051bWJlcik7XG4gIHJldHVybiAhIShjYXBhYmlsaXRpZXMgJiBjYXBhYmlsaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0NhcGFiaWxpdHk8RiBleHRlbmRzIGtleW9mIENhcGFiaWxpdHlNYXA+KFxuICBjYXBhYmlsaXRpZXM6IENhcGFiaWxpdHksXG4gIGNhcGFiaWxpdHk6IEZcbik6IGJvb2xlYW4ge1xuICBjaGVjayhjYXBhYmlsaXRpZXMsIENoZWNrTnVtYmVyKTtcbiAgcmV0dXJuICEhKGNhcGFiaWxpdGllcyAmIGNhcGFiaWxpdHkpO1xufVxuIiwiaW1wb3J0IHsgQ2FwdHVyZWRBcmd1bWVudHMsIENvbXBvbmVudERlZmluaXRpb24sIERpY3QsIE1heWJlIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFZNQXJndW1lbnRzSW1wbCB9IGZyb20gJy4uL3ZtL2FyZ3VtZW50cyc7XG5cbmNvbnN0IENVUlJJRURfQ09NUE9ORU5UX0RFRklOSVRJT05fQlJBTkQgPVxuICAnQ1VSUklFRCBDT01QT05FTlQgREVGSU5JVElPTiBbaWQ9NmYwMGZlYjktYTBlZi00NTQ3LTk5ZWEtYWMzMjhmODBhY2VhXSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKFxuICBkZWZpbml0aW9uOiB1bmtub3duXG4pOiBkZWZpbml0aW9uIGlzIEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uIHtcbiAgcmV0dXJuICEhKGRlZmluaXRpb24gJiYgKGRlZmluaXRpb24gYXMgRGljdClbQ1VSUklFRF9DT01QT05FTlRfREVGSU5JVElPTl9CUkFORF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb21wb25lbnREZWZpbml0aW9uKFxuICBkZWZpbml0aW9uOiBNYXliZTxEaWN0PlxuKTogZGVmaW5pdGlvbiBpcyBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbiB7XG4gIHJldHVybiAhIShkZWZpbml0aW9uICYmIGRlZmluaXRpb25bQ1VSUklFRF9DT01QT05FTlRfREVGSU5JVElPTl9CUkFORF0pO1xufVxuXG5leHBvcnQgY2xhc3MgQ3VycmllZENvbXBvbmVudERlZmluaXRpb24ge1xuICByZWFkb25seSBbQ1VSUklFRF9DT01QT05FTlRfREVGSU5JVElPTl9CUkFORF0gPSB0cnVlO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIGlubmVyOiBDb21wb25lbnREZWZpbml0aW9uIHwgQ3VycmllZENvbXBvbmVudERlZmluaXRpb24sXG4gICAgcHJvdGVjdGVkIGFyZ3M6IE9wdGlvbjxDYXB0dXJlZEFyZ3VtZW50cz5cbiAgKSB7fVxuXG4gIHVud3JhcChhcmdzOiBWTUFyZ3VtZW50c0ltcGwpOiBDb21wb25lbnREZWZpbml0aW9uIHtcbiAgICBhcmdzLnJlYWxsb2ModGhpcy5vZmZzZXQpO1xuXG4gICAgbGV0IGRlZmluaXRpb246IEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uID0gdGhpcztcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBsZXQgeyBhcmdzOiBjdXJyaWVkQXJncywgaW5uZXIgfSA9IGRlZmluaXRpb247XG5cbiAgICAgIGlmIChjdXJyaWVkQXJncykge1xuICAgICAgICBhcmdzLnBvc2l0aW9uYWwucHJlcGVuZChjdXJyaWVkQXJncy5wb3NpdGlvbmFsKTtcbiAgICAgICAgYXJncy5uYW1lZC5tZXJnZShjdXJyaWVkQXJncy5uYW1lZCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihpbm5lcikpIHtcbiAgICAgICAgcmV0dXJuIGlubmVyO1xuICAgICAgfVxuXG4gICAgICBkZWZpbml0aW9uID0gaW5uZXI7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBnZXQgb2Zmc2V0KCk6IG51bWJlciB7XG4gICAgbGV0IHsgaW5uZXIsIGFyZ3MgfSA9IHRoaXM7XG4gICAgbGV0IGxlbmd0aCA9IGFyZ3MgPyBhcmdzLnBvc2l0aW9uYWwubGVuZ3RoIDogMDtcbiAgICByZXR1cm4gaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihpbm5lcikgPyBsZW5ndGggKyBpbm5lci5vZmZzZXQgOiBsZW5ndGg7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1cnJ5KFxuICBzcGVjOiBDb21wb25lbnREZWZpbml0aW9uLFxuICBhcmdzOiBPcHRpb248Q2FwdHVyZWRBcmd1bWVudHM+ID0gbnVsbFxuKTogQ3VycmllZENvbXBvbmVudERlZmluaXRpb24ge1xuICByZXR1cm4gbmV3IEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKHNwZWMgYXMgQ29tcG9uZW50RGVmaW5pdGlvbiwgYXJncyk7XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnREZWZpbml0aW9uLCBSdW50aW1lUmVzb2x2ZXIgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IE9wdGlvbiwgYXNzZXJ0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50PEw+KFxuICByZXNvbHZlcjogUnVudGltZVJlc29sdmVyPEw+LFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldGE/OiBMXG4pOiBPcHRpb248Q29tcG9uZW50RGVmaW5pdGlvbj4ge1xuICBsZXQgZGVmaW5pdGlvbiA9IHJlc29sdmVyLmxvb2t1cENvbXBvbmVudChuYW1lLCBtZXRhKTtcbiAgYXNzZXJ0KGRlZmluaXRpb24sIGBDb3VsZCBub3QgZmluZCBhIGNvbXBvbmVudCBuYW1lZCBcIiR7bmFtZX1cImApO1xuICByZXR1cm4gZGVmaW5pdGlvbjtcbn1cbiIsImltcG9ydCB7IFJlZmVyZW5jZSwgVGFnLCBjb21iaW5lVGFnZ2VkIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5pbXBvcnQgeyBub3JtYWxpemVTdHJpbmdWYWx1ZSB9IGZyb20gJy4uL2RvbS9ub3JtYWxpemUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGFzc0xpc3RSZWZlcmVuY2UgaW1wbGVtZW50cyBSZWZlcmVuY2U8T3B0aW9uPHN0cmluZz4+IHtcbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbGlzdDogUmVmZXJlbmNlPHVua25vd24+W10pIHtcbiAgICB0aGlzLnRhZyA9IGNvbWJpbmVUYWdnZWQobGlzdCk7XG4gICAgdGhpcy5saXN0ID0gbGlzdDtcbiAgfVxuXG4gIHZhbHVlKCk6IE9wdGlvbjxzdHJpbmc+IHtcbiAgICBsZXQgcmV0OiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCB7IGxpc3QgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCB2YWx1ZSA9IG5vcm1hbGl6ZVN0cmluZ1ZhbHVlKGxpc3RbaV0udmFsdWUoKSk7XG4gICAgICBpZiAodmFsdWUpIHJldC5wdXNoKHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0Lmxlbmd0aCA9PT0gMCA/IG51bGwgOiByZXQuam9pbignICcpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBSZWZlcmVuY2UsIFBhdGhSZWZlcmVuY2UsIFRhZyB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIENhcHR1cmVkQXJndW1lbnRzLFxuICBDb21wb25lbnREZWZpbml0aW9uLFxuICBNYXliZSxcbiAgRGljdCxcbiAgUnVudGltZVJlc29sdmVyLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtcbiAgQ3VycmllZENvbXBvbmVudERlZmluaXRpb24sXG4gIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24sXG59IGZyb20gJy4uL2NvbXBvbmVudC9jdXJyaWVkLWNvbXBvbmVudCc7XG5pbXBvcnQgeyByZXNvbHZlQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50L3Jlc29sdmUnO1xuaW1wb3J0IHsgVU5ERUZJTkVEX1JFRkVSRU5DRSB9IGZyb20gJy4uL3JlZmVyZW5jZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDdXJyeUNvbXBvbmVudFJlZmVyZW5jZVxuICBpbXBsZW1lbnRzIFBhdGhSZWZlcmVuY2U8T3B0aW9uPEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uPj4ge1xuICBwdWJsaWMgdGFnOiBUYWc7XG4gIHByaXZhdGUgbGFzdFZhbHVlOiB1bmtub3duO1xuICBwcml2YXRlIGxhc3REZWZpbml0aW9uOiBPcHRpb248Q3VycmllZENvbXBvbmVudERlZmluaXRpb24+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaW5uZXI6IFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBwcml2YXRlIHJlc29sdmVyOiBSdW50aW1lUmVzb2x2ZXIsXG4gICAgcHJpdmF0ZSBtZXRhOiB1bmtub3duLFxuICAgIHByaXZhdGUgYXJnczogT3B0aW9uPENhcHR1cmVkQXJndW1lbnRzPlxuICApIHtcbiAgICB0aGlzLnRhZyA9IGlubmVyLnRhZztcbiAgICB0aGlzLmxhc3RWYWx1ZSA9IG51bGw7XG4gICAgdGhpcy5sYXN0RGVmaW5pdGlvbiA9IG51bGw7XG4gIH1cblxuICB2YWx1ZSgpOiBPcHRpb248Q3VycmllZENvbXBvbmVudERlZmluaXRpb24+IHtcbiAgICBsZXQgeyBpbm5lciwgbGFzdFZhbHVlIH0gPSB0aGlzO1xuXG4gICAgbGV0IHZhbHVlID0gaW5uZXIudmFsdWUoKSBhcyBNYXliZTxEaWN0PjtcblxuICAgIGlmICh2YWx1ZSA9PT0gbGFzdFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5sYXN0RGVmaW5pdGlvbjtcbiAgICB9XG5cbiAgICBsZXQgZGVmaW5pdGlvbjogT3B0aW9uPEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uIHwgQ29tcG9uZW50RGVmaW5pdGlvbj4gPSBudWxsO1xuXG4gICAgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24odmFsdWUpKSB7XG4gICAgICBkZWZpbml0aW9uID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlKSB7XG4gICAgICBsZXQgeyByZXNvbHZlciwgbWV0YSB9ID0gdGhpcztcbiAgICAgIGRlZmluaXRpb24gPSByZXNvbHZlQ29tcG9uZW50KHJlc29sdmVyLCB2YWx1ZSwgbWV0YSk7XG4gICAgfVxuXG4gICAgZGVmaW5pdGlvbiA9IHRoaXMuY3VycnkoZGVmaW5pdGlvbik7XG5cbiAgICB0aGlzLmxhc3RWYWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMubGFzdERlZmluaXRpb24gPSBkZWZpbml0aW9uO1xuXG4gICAgcmV0dXJuIGRlZmluaXRpb247XG4gIH1cblxuICBnZXQoKTogUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gIH1cblxuICBwcml2YXRlIGN1cnJ5KFxuICAgIGRlZmluaXRpb246IE9wdGlvbjxDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbiB8IENvbXBvbmVudERlZmluaXRpb24+XG4gICk6IE9wdGlvbjxDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbj4ge1xuICAgIGxldCB7IGFyZ3MgfSA9IHRoaXM7XG5cbiAgICBpZiAoIWFyZ3MgJiYgaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihkZWZpbml0aW9uKSkge1xuICAgICAgcmV0dXJuIGRlZmluaXRpb247XG4gICAgfSBlbHNlIGlmICghZGVmaW5pdGlvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oZGVmaW5pdGlvbiwgYXJncyk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBpc0VtcHR5LCBpc1N0cmluZyB9IGZyb20gJy4uLy4uL2RvbS9ub3JtYWxpemUnO1xuaW1wb3J0IHsgVXBkYXRpbmdPcGNvZGUgfSBmcm9tICcuLi8uLi9vcGNvZGVzJztcbmltcG9ydCB7IFRhZywgVmVyc2lvbmVkUmVmZXJlbmNlLCB2YWx1ZSwgdmFsaWRhdGUsIFJldmlzaW9uIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IFNpbXBsZVRleHQgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEeW5hbWljVGV4dENvbnRlbnQgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSB7XG4gIHB1YmxpYyB0eXBlID0gJ2R5bmFtaWMtdGV4dCc7XG5cbiAgcHVibGljIHRhZzogVGFnO1xuICBwdWJsaWMgbGFzdFJldmlzaW9uOiBSZXZpc2lvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbm9kZTogU2ltcGxlVGV4dCxcbiAgICBwcml2YXRlIHJlZmVyZW5jZTogVmVyc2lvbmVkUmVmZXJlbmNlPHVua25vd24+LFxuICAgIHByaXZhdGUgbGFzdFZhbHVlOiBzdHJpbmdcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnRhZyA9IHJlZmVyZW5jZS50YWc7XG4gICAgdGhpcy5sYXN0UmV2aXNpb24gPSB2YWx1ZSh0aGlzLnRhZyk7XG4gIH1cblxuICBldmFsdWF0ZSgpIHtcbiAgICBsZXQgeyByZWZlcmVuY2UsIHRhZyB9ID0gdGhpcztcblxuICAgIGlmICghdmFsaWRhdGUodGFnLCB0aGlzLmxhc3RSZXZpc2lvbikpIHtcbiAgICAgIHRoaXMubGFzdFJldmlzaW9uID0gdmFsdWUodGFnKTtcbiAgICAgIHRoaXMudXBkYXRlKHJlZmVyZW5jZS52YWx1ZSgpKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUodmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBsZXQgeyBsYXN0VmFsdWUgfSA9IHRoaXM7XG5cbiAgICBpZiAodmFsdWUgPT09IGxhc3RWYWx1ZSkgcmV0dXJuO1xuXG4gICAgbGV0IG5vcm1hbGl6ZWQ6IHN0cmluZztcblxuICAgIGlmIChpc0VtcHR5KHZhbHVlKSkge1xuICAgICAgbm9ybWFsaXplZCA9ICcnO1xuICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICBub3JtYWxpemVkID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vcm1hbGl6ZWQgPSBTdHJpbmcodmFsdWUpO1xuICAgIH1cblxuICAgIGlmIChub3JtYWxpemVkICE9PSBsYXN0VmFsdWUpIHtcbiAgICAgIGxldCB0ZXh0Tm9kZSA9IHRoaXMubm9kZTtcbiAgICAgIHRleHROb2RlLm5vZGVWYWx1ZSA9IHRoaXMubGFzdFZhbHVlID0gbm9ybWFsaXplZDtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IFJlZmVyZW5jZSwgVGFnLCBpc0NvbnN0IH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7XG4gIGNoZWNrLFxuICBDaGVja1N0cmluZyxcbiAgQ2hlY2tTYWZlU3RyaW5nLFxuICBDaGVja05vZGUsXG4gIENoZWNrRG9jdW1lbnRGcmFnbWVudCxcbn0gZnJvbSAnQGdsaW1tZXIvZGVidWcnO1xuXG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUyB9IGZyb20gJy4uLy4uL29wY29kZXMnO1xuaW1wb3J0IHsgQ29uZGl0aW9uYWxSZWZlcmVuY2UgfSBmcm9tICcuLi8uLi9yZWZlcmVuY2VzJztcbmltcG9ydCB7XG4gIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24sXG4gIGlzQ29tcG9uZW50RGVmaW5pdGlvbixcbn0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2N1cnJpZWQtY29tcG9uZW50JztcbmltcG9ydCB7IENoZWNrUGF0aFJlZmVyZW5jZSB9IGZyb20gJy4vLWRlYnVnLXN0cmlwJztcbmltcG9ydCB7IGlzRW1wdHksIGlzU2FmZVN0cmluZywgaXNGcmFnbWVudCwgaXNOb2RlLCBzaG91bGRDb2VyY2UgfSBmcm9tICcuLi8uLi9kb20vbm9ybWFsaXplJztcbmltcG9ydCBEeW5hbWljVGV4dENvbnRlbnQgZnJvbSAnLi4vLi4vdm0vY29udGVudC90ZXh0JztcbmltcG9ydCB7IENvbnRlbnRUeXBlLCBPcCwgRGljdCwgTWF5YmUgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGNsYXNzIElzQ3VycmllZENvbXBvbmVudERlZmluaXRpb25SZWZlcmVuY2UgZXh0ZW5kcyBDb25kaXRpb25hbFJlZmVyZW5jZSB7XG4gIHN0YXRpYyBjcmVhdGUoaW5uZXI6IFJlZmVyZW5jZTx1bmtub3duPik6IElzQ3VycmllZENvbXBvbmVudERlZmluaXRpb25SZWZlcmVuY2Uge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWxSZWZlcmVuY2UoaW5uZXIsIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZW50VHlwZVJlZmVyZW5jZSBpbXBsZW1lbnRzIFJlZmVyZW5jZTxDb250ZW50VHlwZT4ge1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogUmVmZXJlbmNlPHVua25vd24+KSB7XG4gICAgdGhpcy50YWcgPSBpbm5lci50YWc7XG4gIH1cblxuICB2YWx1ZSgpOiBDb250ZW50VHlwZSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5pbm5lci52YWx1ZSgpIGFzIE1heWJlPERpY3Q+O1xuXG4gICAgaWYgKHNob3VsZENvZXJjZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBDb250ZW50VHlwZS5TdHJpbmc7XG4gICAgfSBlbHNlIGlmIChpc0NvbXBvbmVudERlZmluaXRpb24odmFsdWUpKSB7XG4gICAgICByZXR1cm4gQ29udGVudFR5cGUuQ29tcG9uZW50O1xuICAgIH0gZWxzZSBpZiAoaXNTYWZlU3RyaW5nKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLlNhZmVTdHJpbmc7XG4gICAgfSBlbHNlIGlmIChpc0ZyYWdtZW50KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLkZyYWdtZW50O1xuICAgIH0gZWxzZSBpZiAoaXNOb2RlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLk5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBDb250ZW50VHlwZS5TdHJpbmc7XG4gICAgfVxuICB9XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5BcHBlbmRIVE1MLCB2bSA9PiB7XG4gIGxldCByZWZlcmVuY2UgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKTtcblxuICBsZXQgcmF3VmFsdWUgPSByZWZlcmVuY2UudmFsdWUoKTtcbiAgbGV0IHZhbHVlID0gaXNFbXB0eShyYXdWYWx1ZSkgPyAnJyA6IFN0cmluZyhyYXdWYWx1ZSk7XG5cbiAgdm0uZWxlbWVudHMoKS5hcHBlbmREeW5hbWljSFRNTCh2YWx1ZSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkFwcGVuZFNhZmVIVE1MLCB2bSA9PiB7XG4gIGxldCByZWZlcmVuY2UgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKTtcblxuICBsZXQgcmF3VmFsdWUgPSBjaGVjayhyZWZlcmVuY2UudmFsdWUoKSwgQ2hlY2tTYWZlU3RyaW5nKS50b0hUTUwoKTtcbiAgbGV0IHZhbHVlID0gaXNFbXB0eShyYXdWYWx1ZSkgPyAnJyA6IGNoZWNrKHJhd1ZhbHVlLCBDaGVja1N0cmluZyk7XG5cbiAgdm0uZWxlbWVudHMoKS5hcHBlbmREeW5hbWljSFRNTCh2YWx1ZSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkFwcGVuZFRleHQsIHZtID0+IHtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpO1xuXG4gIGxldCByYXdWYWx1ZSA9IHJlZmVyZW5jZS52YWx1ZSgpO1xuICBsZXQgdmFsdWUgPSBpc0VtcHR5KHJhd1ZhbHVlKSA/ICcnIDogU3RyaW5nKHJhd1ZhbHVlKTtcblxuICBsZXQgbm9kZSA9IHZtLmVsZW1lbnRzKCkuYXBwZW5kRHluYW1pY1RleHQodmFsdWUpO1xuXG4gIGlmICghaXNDb25zdChyZWZlcmVuY2UpKSB7XG4gICAgdm0udXBkYXRlV2l0aChuZXcgRHluYW1pY1RleHRDb250ZW50KG5vZGUsIHJlZmVyZW5jZSwgdmFsdWUpKTtcbiAgfVxufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5BcHBlbmREb2N1bWVudEZyYWdtZW50LCB2bSA9PiB7XG4gIGxldCByZWZlcmVuY2UgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKTtcblxuICBsZXQgdmFsdWUgPSBjaGVjayhyZWZlcmVuY2UudmFsdWUoKSwgQ2hlY2tEb2N1bWVudEZyYWdtZW50KTtcblxuICB2bS5lbGVtZW50cygpLmFwcGVuZER5bmFtaWNGcmFnbWVudCh2YWx1ZSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkFwcGVuZE5vZGUsIHZtID0+IHtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpO1xuXG4gIGxldCB2YWx1ZSA9IGNoZWNrKHJlZmVyZW5jZS52YWx1ZSgpLCBDaGVja05vZGUpO1xuXG4gIHZtLmVsZW1lbnRzKCkuYXBwZW5kRHluYW1pY05vZGUodmFsdWUpO1xufSk7XG4iLCJpbXBvcnQgeyBQcmltaXRpdmVUeXBlLCBDb21waWxhYmxlVGVtcGxhdGUsIE9wdGlvbiwgT3AgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7XG4gIENPTlNUQU5UX1RBRyxcbiAgaXNDb25zdCxcbiAgaXNNb2RpZmllZCxcbiAgUmVmZXJlbmNlQ2FjaGUsXG4gIFJldmlzaW9uLFxuICBUYWcsXG4gIHZhbHVlLFxuICB2YWxpZGF0ZSxcbn0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IGluaXRpYWxpemVHdWlkLCBhc3NlcnQgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIENoZWNrTnVtYmVyLFxuICBjaGVjayxcbiAgQ2hlY2tJbnN0YW5jZW9mLFxuICBDaGVja09wdGlvbixcbiAgQ2hlY2tCbG9ja1N5bWJvbFRhYmxlLFxuICBDaGVja0hhbmRsZSxcbiAgQ2hlY2tQcmltaXRpdmUsXG59IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcbmltcG9ydCB7IHN0YWNrQXNzZXJ0IH0gZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHsgQVBQRU5EX09QQ09ERVMsIFVwZGF0aW5nT3Bjb2RlIH0gZnJvbSAnLi4vLi4vb3Bjb2Rlcyc7XG5pbXBvcnQgeyBQcmltaXRpdmVSZWZlcmVuY2UgfSBmcm9tICcuLi8uLi9yZWZlcmVuY2VzJztcbmltcG9ydCB7IFVwZGF0aW5nVk0gfSBmcm9tICcuLi8uLi92bSc7XG5pbXBvcnQgeyBWTUFyZ3VtZW50c0ltcGwgfSBmcm9tICcuLi8uLi92bS9hcmd1bWVudHMnO1xuaW1wb3J0IHsgQ2hlY2tSZWZlcmVuY2UsIENoZWNrU2NvcGUgfSBmcm9tICcuLy1kZWJ1Zy1zdHJpcCc7XG5pbXBvcnQgeyBDT05TVEFOVFMgfSBmcm9tICcuLi8uLi9zeW1ib2xzJztcbmltcG9ydCB7IEludGVybmFsSml0Vk0gfSBmcm9tICcuLi8uLi92bS9hcHBlbmQnO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ2hpbGRTY29wZSwgdm0gPT4gdm0ucHVzaENoaWxkU2NvcGUoKSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Qb3BTY29wZSwgdm0gPT4gdm0ucG9wU2NvcGUoKSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXNoRHluYW1pY1Njb3BlLCB2bSA9PiB2bS5wdXNoRHluYW1pY1Njb3BlKCkpO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUG9wRHluYW1pY1Njb3BlLCB2bSA9PiB2bS5wb3BEeW5hbWljU2NvcGUoKSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Db25zdGFudCwgKHZtLCB7IG9wMTogb3RoZXIgfSkgPT4ge1xuICB2bS5zdGFjay5wdXNoKHZtW0NPTlNUQU5UU10uZ2V0T3RoZXIob3RoZXIpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHJpbWl0aXZlLCAodm0sIHsgb3AxOiBwcmltaXRpdmUgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IGZsYWcgPSBwcmltaXRpdmUgJiA3OyAvLyAxMTFcbiAgbGV0IHZhbHVlID0gcHJpbWl0aXZlID4+IDM7XG5cbiAgc3dpdGNoIChmbGFnKSB7XG4gICAgY2FzZSBQcmltaXRpdmVUeXBlLk5VTUJFUjpcbiAgICAgIHN0YWNrLnB1c2godmFsdWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBQcmltaXRpdmVUeXBlLkZMT0FUOlxuICAgICAgc3RhY2sucHVzaCh2bVtDT05TVEFOVFNdLmdldE51bWJlcih2YWx1ZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBQcmltaXRpdmVUeXBlLlNUUklORzpcbiAgICAgIHN0YWNrLnB1c2godm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcodmFsdWUpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgUHJpbWl0aXZlVHlwZS5CT09MRUFOX09SX1ZPSUQ6XG4gICAgICBzdGFjay5wdXNoUmF3KHByaW1pdGl2ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFByaW1pdGl2ZVR5cGUuTkVHQVRJVkU6XG4gICAgICBzdGFjay5wdXNoKHZtW0NPTlNUQU5UU10uZ2V0TnVtYmVyKHZhbHVlKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFByaW1pdGl2ZVR5cGUuQklHX05VTTpcbiAgICAgIHN0YWNrLnB1c2godm1bQ09OU1RBTlRTXS5nZXROdW1iZXIodmFsdWUpKTtcbiAgICAgIGJyZWFrO1xuICB9XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlByaW1pdGl2ZVJlZmVyZW5jZSwgdm0gPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgc3RhY2sucHVzaChQcmltaXRpdmVSZWZlcmVuY2UuY3JlYXRlKGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja1ByaW1pdGl2ZSkpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUmVpZnlVMzIsIHZtID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIHN0YWNrLnB1c2goY2hlY2soc3RhY2sucGVlaygpLCBDaGVja1JlZmVyZW5jZSkudmFsdWUoKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkR1cCwgKHZtLCB7IG9wMTogcmVnaXN0ZXIsIG9wMjogb2Zmc2V0IH0pID0+IHtcbiAgbGV0IHBvc2l0aW9uID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShyZWdpc3RlciksIENoZWNrTnVtYmVyKSAtIG9mZnNldDtcbiAgdm0uc3RhY2suZHVwKHBvc2l0aW9uKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUG9wLCAodm0sIHsgb3AxOiBjb3VudCB9KSA9PiB7XG4gIHZtLnN0YWNrLnBvcChjb3VudCk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkxvYWQsICh2bSwgeyBvcDE6IHJlZ2lzdGVyIH0pID0+IHtcbiAgdm0ubG9hZChyZWdpc3Rlcik7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkZldGNoLCAodm0sIHsgb3AxOiByZWdpc3RlciB9KSA9PiB7XG4gIHZtLmZldGNoKHJlZ2lzdGVyKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQmluZER5bmFtaWNTY29wZSwgKHZtLCB7IG9wMTogX25hbWVzIH0pID0+IHtcbiAgbGV0IG5hbWVzID0gdm1bQ09OU1RBTlRTXS5nZXRBcnJheShfbmFtZXMpO1xuICB2bS5iaW5kRHluYW1pY1Njb3BlKG5hbWVzKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuRW50ZXIsICh2bSwgeyBvcDE6IGFyZ3MgfSkgPT4ge1xuICB2bS5lbnRlcihhcmdzKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuRXhpdCwgdm0gPT4ge1xuICB2bS5leGl0KCk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hTeW1ib2xUYWJsZSwgKHZtLCB7IG9wMTogX3RhYmxlIH0pID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIHN0YWNrLnB1c2godm1bQ09OU1RBTlRTXS5nZXRUZW1wbGF0ZU1ldGEoX3RhYmxlKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hCbG9ja1Njb3BlLCB2bSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBzdGFjay5wdXNoKHZtLnNjb3BlKCkpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChcbiAgT3AuQ29tcGlsZUJsb2NrLFxuICAodm06IEludGVybmFsSml0Vk0pID0+IHtcbiAgICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgICBsZXQgYmxvY2sgPSBzdGFjay5wb3A8T3B0aW9uPENvbXBpbGFibGVUZW1wbGF0ZT4gfCAwPigpO1xuXG4gICAgaWYgKGJsb2NrKSB7XG4gICAgICBzdGFjay5wdXNoKHZtLmNvbXBpbGUoYmxvY2spKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhY2sucHVzaChudWxsKTtcbiAgICB9XG5cbiAgICBjaGVjayh2bS5zdGFjay5wZWVrKCksIENoZWNrT3B0aW9uKENoZWNrTnVtYmVyKSk7XG4gIH0sXG4gICdqaXQnXG4pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuSW52b2tlWWllbGQsIHZtID0+IHtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuXG4gIGxldCBoYW5kbGUgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tPcHRpb24oQ2hlY2tIYW5kbGUpKTtcbiAgbGV0IHNjb3BlID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrT3B0aW9uKENoZWNrU2NvcGUpKTtcbiAgbGV0IHRhYmxlID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrT3B0aW9uKENoZWNrQmxvY2tTeW1ib2xUYWJsZSkpO1xuXG4gIGFzc2VydChcbiAgICB0YWJsZSA9PT0gbnVsbCB8fCAodGFibGUgJiYgdHlwZW9mIHRhYmxlID09PSAnb2JqZWN0JyAmJiBBcnJheS5pc0FycmF5KHRhYmxlLnBhcmFtZXRlcnMpKSxcbiAgICBzdGFja0Fzc2VydCgnT3B0aW9uPEJsb2NrU3ltYm9sVGFibGU+JywgdGFibGUpXG4gICk7XG5cbiAgbGV0IGFyZ3MgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tJbnN0YW5jZW9mKFZNQXJndW1lbnRzSW1wbCkpO1xuXG4gIGlmICh0YWJsZSA9PT0gbnVsbCkge1xuICAgIC8vIFRvIGJhbGFuY2UgdGhlIHBvcHtGcmFtZSxTY29wZX1cbiAgICB2bS5wdXNoRnJhbWUoKTtcbiAgICB2bS5wdXNoU2NvcGUoc2NvcGUhKTsgLy8gQ291bGQgYmUgbnVsbCBidXQgaXQgZG9lc250IG1hdHRlciBhcyBpdCBpcyBpbW1lZGlhdGVsbHkgcG9wcGVkLlxuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBpbnZva2luZ1Njb3BlID0gc2NvcGUhO1xuXG4gIC8vIElmIG5lY2Vzc2FyeSwgY3JlYXRlIGEgY2hpbGQgc2NvcGVcbiAge1xuICAgIGxldCBsb2NhbHMgPSB0YWJsZS5wYXJhbWV0ZXJzO1xuICAgIGxldCBsb2NhbHNDb3VudCA9IGxvY2Fscy5sZW5ndGg7XG5cbiAgICBpZiAobG9jYWxzQ291bnQgPiAwKSB7XG4gICAgICBpbnZva2luZ1Njb3BlID0gaW52b2tpbmdTY29wZS5jaGlsZCgpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2Fsc0NvdW50OyBpKyspIHtcbiAgICAgICAgaW52b2tpbmdTY29wZS5iaW5kU3ltYm9sKGxvY2FscyFbaV0sIGFyZ3MuYXQoaSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZtLnB1c2hGcmFtZSgpO1xuICB2bS5wdXNoU2NvcGUoaW52b2tpbmdTY29wZSk7XG4gIHZtLmNhbGwoaGFuZGxlISk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkp1bXBJZiwgKHZtLCB7IG9wMTogdGFyZ2V0IH0pID0+IHtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG5cbiAgaWYgKGlzQ29uc3QocmVmZXJlbmNlKSkge1xuICAgIGlmIChyZWZlcmVuY2UudmFsdWUoKSkge1xuICAgICAgdm0uZ290byh0YXJnZXQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgY2FjaGUgPSBuZXcgUmVmZXJlbmNlQ2FjaGUocmVmZXJlbmNlKTtcblxuICAgIGlmIChjYWNoZS5wZWVrKCkpIHtcbiAgICAgIHZtLmdvdG8odGFyZ2V0KTtcbiAgICB9XG5cbiAgICB2bS51cGRhdGVXaXRoKG5ldyBBc3NlcnQoY2FjaGUpKTtcbiAgfVxufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5KdW1wVW5sZXNzLCAodm0sIHsgb3AxOiB0YXJnZXQgfSkgPT4ge1xuICBsZXQgcmVmZXJlbmNlID0gY2hlY2sodm0uc3RhY2sucG9wKCksIENoZWNrUmVmZXJlbmNlKTtcblxuICBpZiAoaXNDb25zdChyZWZlcmVuY2UpKSB7XG4gICAgaWYgKCFyZWZlcmVuY2UudmFsdWUoKSkge1xuICAgICAgdm0uZ290byh0YXJnZXQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgY2FjaGUgPSBuZXcgUmVmZXJlbmNlQ2FjaGUocmVmZXJlbmNlKTtcblxuICAgIGlmICghY2FjaGUucGVlaygpKSB7XG4gICAgICB2bS5nb3RvKHRhcmdldCk7XG4gICAgfVxuXG4gICAgdm0udXBkYXRlV2l0aChuZXcgQXNzZXJ0KGNhY2hlKSk7XG4gIH1cbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuSnVtcEVxLCAodm0sIHsgb3AxOiB0YXJnZXQsIG9wMjogY29tcGFyaXNvbiB9KSA9PiB7XG4gIGxldCBvdGhlciA9IGNoZWNrKHZtLnN0YWNrLnBlZWsoKSwgQ2hlY2tOdW1iZXIpO1xuXG4gIGlmIChvdGhlciA9PT0gY29tcGFyaXNvbikge1xuICAgIHZtLmdvdG8odGFyZ2V0KTtcbiAgfVxufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Bc3NlcnRTYW1lLCB2bSA9PiB7XG4gIGxldCByZWZlcmVuY2UgPSBjaGVjayh2bS5zdGFjay5wZWVrKCksIENoZWNrUmVmZXJlbmNlKTtcblxuICBpZiAoIWlzQ29uc3QocmVmZXJlbmNlKSkge1xuICAgIHZtLnVwZGF0ZVdpdGgoQXNzZXJ0LmluaXRpYWxpemUobmV3IFJlZmVyZW5jZUNhY2hlKHJlZmVyZW5jZSkpKTtcbiAgfVxufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Ub0Jvb2xlYW4sIHZtID0+IHtcbiAgbGV0IHsgZW52LCBzdGFjayB9ID0gdm07XG4gIHN0YWNrLnB1c2goZW52LnRvQ29uZGl0aW9uYWxSZWZlcmVuY2UoY2hlY2soc3RhY2sucG9wKCksIENoZWNrUmVmZXJlbmNlKSkpO1xufSk7XG5cbmV4cG9ydCBjbGFzcyBBc3NlcnQgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSB7XG4gIHN0YXRpYyBpbml0aWFsaXplKGNhY2hlOiBSZWZlcmVuY2VDYWNoZTx1bmtub3duPik6IEFzc2VydCB7XG4gICAgbGV0IGFzc2VydCA9IG5ldyBBc3NlcnQoY2FjaGUpO1xuICAgIGNhY2hlLnBlZWsoKTtcbiAgICByZXR1cm4gYXNzZXJ0O1xuICB9XG5cbiAgcHVibGljIHR5cGUgPSAnYXNzZXJ0JztcblxuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgcHJpdmF0ZSBjYWNoZTogUmVmZXJlbmNlQ2FjaGU8dW5rbm93bj47XG5cbiAgY29uc3RydWN0b3IoY2FjaGU6IFJlZmVyZW5jZUNhY2hlPHVua25vd24+KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnRhZyA9IGNhY2hlLnRhZztcbiAgICB0aGlzLmNhY2hlID0gY2FjaGU7XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIGxldCB7IGNhY2hlIH0gPSB0aGlzO1xuXG4gICAgaWYgKGlzTW9kaWZpZWQoY2FjaGUucmV2YWxpZGF0ZSgpKSkge1xuICAgICAgdm0udGhyb3coKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEp1bXBJZk5vdE1vZGlmaWVkT3Bjb2RlIGV4dGVuZHMgVXBkYXRpbmdPcGNvZGUge1xuICBwdWJsaWMgdHlwZSA9ICdqdW1wLWlmLW5vdC1tb2RpZmllZCc7XG5cbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIHByaXZhdGUgbGFzdFJldmlzaW9uOiBSZXZpc2lvbjtcblxuICBjb25zdHJ1Y3Rvcih0YWc6IFRhZywgcHJpdmF0ZSB0YXJnZXQ6IExhYmVsT3Bjb2RlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnRhZyA9IHRhZztcbiAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIGxldCB7IHRhZywgdGFyZ2V0LCBsYXN0UmV2aXNpb24gfSA9IHRoaXM7XG5cbiAgICBpZiAoIXZtLmFsd2F5c1JldmFsaWRhdGUgJiYgdmFsaWRhdGUodGFnLCBsYXN0UmV2aXNpb24pKSB7XG4gICAgICB2bS5nb3RvKHRhcmdldCk7XG4gICAgfVxuICB9XG5cbiAgZGlkTW9kaWZ5KCkge1xuICAgIHRoaXMubGFzdFJldmlzaW9uID0gdmFsdWUodGhpcy50YWcpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaWRNb2RpZnlPcGNvZGUgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSB7XG4gIHB1YmxpYyB0eXBlID0gJ2RpZC1tb2RpZnknO1xuXG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRhcmdldDogSnVtcElmTm90TW9kaWZpZWRPcGNvZGUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudGFnID0gQ09OU1RBTlRfVEFHO1xuICB9XG5cbiAgZXZhbHVhdGUoKSB7XG4gICAgdGhpcy50YXJnZXQuZGlkTW9kaWZ5KCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExhYmVsT3Bjb2RlIGltcGxlbWVudHMgVXBkYXRpbmdPcGNvZGUge1xuICBwdWJsaWMgdGFnOiBUYWcgPSBDT05TVEFOVF9UQUc7XG4gIHB1YmxpYyB0eXBlID0gJ2xhYmVsJztcbiAgcHVibGljIGxhYmVsOiBPcHRpb248c3RyaW5nPiA9IG51bGw7XG4gIHB1YmxpYyBfZ3VpZCE6IG51bWJlcjsgLy8gU2V0IGJ5IGluaXRpYWxpemVHdWlkKCkgaW4gdGhlIGNvbnN0cnVjdG9yXG5cbiAgcHJldjogYW55ID0gbnVsbDtcbiAgbmV4dDogYW55ID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihsYWJlbDogc3RyaW5nKSB7XG4gICAgaW5pdGlhbGl6ZUd1aWQodGhpcyk7XG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICB9XG5cbiAgZXZhbHVhdGUoKSB7fVxuXG4gIGluc3BlY3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5sYWJlbH0gWyR7dGhpcy5fZ3VpZH1dYDtcbiAgfVxufVxuIiwiaW1wb3J0IHtcbiAgUmVmZXJlbmNlLFxuICBSZWZlcmVuY2VDYWNoZSxcbiAgUmV2aXNpb24sXG4gIFRhZyxcbiAgVmVyc2lvbmVkUmVmZXJlbmNlLFxuICBpc0NvbnN0LFxuICBpc0NvbnN0VGFnLFxuICB2YWx1ZSxcbiAgdmFsaWRhdGUsXG59IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBjaGVjaywgQ2hlY2tTdHJpbmcsIENoZWNrRWxlbWVudCwgQ2hlY2tPcHRpb24sIENoZWNrTm9kZSB9IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcbmltcG9ydCB7IE9wLCBPcHRpb24sIE1vZGlmaWVyTWFuYWdlciB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgJHQwIH0gZnJvbSAnQGdsaW1tZXIvdm0nO1xuaW1wb3J0IHtcbiAgTW9kaWZpZXJEZWZpbml0aW9uLFxuICBJbnRlcm5hbE1vZGlmaWVyTWFuYWdlcixcbiAgTW9kaWZpZXJJbnN0YW5jZVN0YXRlLFxufSBmcm9tICcuLi8uLi9tb2RpZmllci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IEFQUEVORF9PUENPREVTLCBVcGRhdGluZ09wY29kZSB9IGZyb20gJy4uLy4uL29wY29kZXMnO1xuaW1wb3J0IHsgVXBkYXRpbmdWTSB9IGZyb20gJy4uLy4uL3ZtJztcbmltcG9ydCB7IEFzc2VydCB9IGZyb20gJy4vdm0nO1xuaW1wb3J0IHsgRHluYW1pY0F0dHJpYnV0ZSB9IGZyb20gJy4uLy4uL3ZtL2F0dHJpYnV0ZXMvZHluYW1pYyc7XG5pbXBvcnQgeyBDaGVja1JlZmVyZW5jZSwgQ2hlY2tBcmd1bWVudHMsIENoZWNrT3BlcmF0aW9ucyB9IGZyb20gJy4vLWRlYnVnLXN0cmlwJztcbmltcG9ydCB7IENPTlNUQU5UUyB9IGZyb20gJy4uLy4uL3N5bWJvbHMnO1xuaW1wb3J0IHsgU2ltcGxlRWxlbWVudCwgU2ltcGxlTm9kZSB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBleHBlY3QsIE1heWJlIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5UZXh0LCAodm0sIHsgb3AxOiB0ZXh0IH0pID0+IHtcbiAgdm0uZWxlbWVudHMoKS5hcHBlbmRUZXh0KHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKHRleHQpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ29tbWVudCwgKHZtLCB7IG9wMTogdGV4dCB9KSA9PiB7XG4gIHZtLmVsZW1lbnRzKCkuYXBwZW5kQ29tbWVudCh2bVtDT05TVEFOVFNdLmdldFN0cmluZyh0ZXh0KSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLk9wZW5FbGVtZW50LCAodm0sIHsgb3AxOiB0YWcgfSkgPT4ge1xuICB2bS5lbGVtZW50cygpLm9wZW5FbGVtZW50KHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKHRhZykpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5PcGVuRHluYW1pY0VsZW1lbnQsIHZtID0+IHtcbiAgbGV0IHRhZ05hbWUgPSBjaGVjayhjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpLnZhbHVlKCksIENoZWNrU3RyaW5nKTtcbiAgdm0uZWxlbWVudHMoKS5vcGVuRWxlbWVudCh0YWdOYW1lKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHVzaFJlbW90ZUVsZW1lbnQsIHZtID0+IHtcbiAgbGV0IGVsZW1lbnRSZWYgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuICBsZXQgaW5zZXJ0QmVmb3JlUmVmID0gY2hlY2sodm0uc3RhY2sucG9wKCksIENoZWNrUmVmZXJlbmNlKTtcbiAgbGV0IGd1aWRSZWYgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuXG4gIGxldCBlbGVtZW50OiBTaW1wbGVFbGVtZW50O1xuICBsZXQgaW5zZXJ0QmVmb3JlOiBNYXliZTxTaW1wbGVOb2RlPjtcbiAgbGV0IGd1aWQgPSBndWlkUmVmLnZhbHVlKCkgYXMgc3RyaW5nO1xuXG4gIGlmIChpc0NvbnN0KGVsZW1lbnRSZWYpKSB7XG4gICAgZWxlbWVudCA9IGNoZWNrKGVsZW1lbnRSZWYudmFsdWUoKSwgQ2hlY2tFbGVtZW50KTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgY2FjaGUgPSBuZXcgUmVmZXJlbmNlQ2FjaGUoZWxlbWVudFJlZiBhcyBSZWZlcmVuY2U8U2ltcGxlRWxlbWVudD4pO1xuICAgIGVsZW1lbnQgPSBjaGVjayhjYWNoZS5wZWVrKCksIENoZWNrRWxlbWVudCk7XG4gICAgdm0udXBkYXRlV2l0aChuZXcgQXNzZXJ0KGNhY2hlKSk7XG4gIH1cblxuICBpZiAoaW5zZXJ0QmVmb3JlUmVmLnZhbHVlKCkgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChpc0NvbnN0KGluc2VydEJlZm9yZVJlZikpIHtcbiAgICAgIGluc2VydEJlZm9yZSA9IGNoZWNrKGluc2VydEJlZm9yZVJlZi52YWx1ZSgpLCBDaGVja09wdGlvbihDaGVja05vZGUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGNhY2hlID0gbmV3IFJlZmVyZW5jZUNhY2hlKGluc2VydEJlZm9yZVJlZiBhcyBSZWZlcmVuY2U8T3B0aW9uPFNpbXBsZU5vZGU+Pik7XG4gICAgICBpbnNlcnRCZWZvcmUgPSBjaGVjayhjYWNoZS5wZWVrKCksIENoZWNrT3B0aW9uKENoZWNrTm9kZSkpO1xuICAgICAgdm0udXBkYXRlV2l0aChuZXcgQXNzZXJ0KGNhY2hlKSk7XG4gICAgfVxuICB9XG5cbiAgbGV0IGJsb2NrID0gdm0uZWxlbWVudHMoKS5wdXNoUmVtb3RlRWxlbWVudChlbGVtZW50LCBndWlkLCBpbnNlcnRCZWZvcmUpO1xuICBpZiAoYmxvY2spIHZtLmFzc29jaWF0ZURlc3Ryb3lhYmxlKGJsb2NrKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUG9wUmVtb3RlRWxlbWVudCwgdm0gPT4ge1xuICB2bS5lbGVtZW50cygpLnBvcFJlbW90ZUVsZW1lbnQoKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuRmx1c2hFbGVtZW50LCB2bSA9PiB7XG4gIGxldCBvcGVyYXRpb25zID0gY2hlY2sodm0uZmV0Y2hWYWx1ZSgkdDApLCBDaGVja09wZXJhdGlvbnMpO1xuICBsZXQgbW9kaWZpZXJzOiBPcHRpb248W01vZGlmaWVyTWFuYWdlciwgdW5rbm93bl1bXT4gPSBudWxsO1xuXG4gIGlmIChvcGVyYXRpb25zKSB7XG4gICAgbW9kaWZpZXJzID0gb3BlcmF0aW9ucy5mbHVzaCh2bSk7XG4gICAgdm0ubG9hZFZhbHVlKCR0MCwgbnVsbCk7XG4gIH1cblxuICB2bS5lbGVtZW50cygpLmZsdXNoRWxlbWVudChtb2RpZmllcnMpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5DbG9zZUVsZW1lbnQsIHZtID0+IHtcbiAgbGV0IG1vZGlmaWVycyA9IHZtLmVsZW1lbnRzKCkuY2xvc2VFbGVtZW50KCk7XG5cbiAgaWYgKG1vZGlmaWVycykge1xuICAgIG1vZGlmaWVycy5mb3JFYWNoKChbbWFuYWdlciwgbW9kaWZpZXJdKSA9PiB7XG4gICAgICB2bS5lbnYuc2NoZWR1bGVJbnN0YWxsTW9kaWZpZXIobW9kaWZpZXIsIG1hbmFnZXIpO1xuICAgICAgbGV0IGQgPSBtYW5hZ2VyLmdldERlc3RydWN0b3IobW9kaWZpZXIpO1xuXG4gICAgICBpZiAoZCkge1xuICAgICAgICB2bS5hc3NvY2lhdGVEZXN0cm95YWJsZShkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Nb2RpZmllciwgKHZtLCB7IG9wMTogaGFuZGxlIH0pID0+IHtcbiAgbGV0IHsgbWFuYWdlciwgc3RhdGUgfSA9IHZtLnJ1bnRpbWUucmVzb2x2ZXIucmVzb2x2ZTxNb2RpZmllckRlZmluaXRpb24+KGhhbmRsZSk7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBsZXQgYXJncyA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja0FyZ3VtZW50cyk7XG4gIGxldCB7IGNvbnN0cnVjdGluZywgdXBkYXRlT3BlcmF0aW9ucyB9ID0gdm0uZWxlbWVudHMoKTtcbiAgbGV0IGR5bmFtaWNTY29wZSA9IHZtLmR5bmFtaWNTY29wZSgpO1xuICBsZXQgbW9kaWZpZXIgPSBtYW5hZ2VyLmNyZWF0ZShcbiAgICBleHBlY3QoY29uc3RydWN0aW5nLCAnQlVHOiBFbGVtZW50TW9kaWZpZXIgY291bGQgbm90IGZpbmQgdGhlIGVsZW1lbnQgaXQgYXBwbGllcyB0bycpLFxuICAgIHN0YXRlLFxuICAgIGFyZ3MsXG4gICAgZHluYW1pY1Njb3BlLFxuICAgIHVwZGF0ZU9wZXJhdGlvbnNcbiAgKTtcblxuICBsZXQgb3BlcmF0aW9ucyA9IGV4cGVjdChcbiAgICBjaGVjayh2bS5mZXRjaFZhbHVlKCR0MCksIENoZWNrT3BlcmF0aW9ucyksXG4gICAgJ0JVRzogRWxlbWVudE1vZGlmaWVyIGNvdWxkIG5vdCBmaW5kIG9wZXJhdGlvbnMgdG8gYXBwZW5kIHRvJ1xuICApO1xuXG4gIG9wZXJhdGlvbnMuYWRkTW9kaWZpZXIobWFuYWdlciwgbW9kaWZpZXIpO1xuXG4gIGxldCB0YWcgPSBtYW5hZ2VyLmdldFRhZyhtb2RpZmllcik7XG5cbiAgaWYgKCFpc0NvbnN0VGFnKHRhZykpIHtcbiAgICB2bS51cGRhdGVXaXRoKG5ldyBVcGRhdGVNb2RpZmllck9wY29kZSh0YWcsIG1hbmFnZXIsIG1vZGlmaWVyKSk7XG4gIH1cbn0pO1xuXG5leHBvcnQgY2xhc3MgVXBkYXRlTW9kaWZpZXJPcGNvZGUgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSB7XG4gIHB1YmxpYyB0eXBlID0gJ3VwZGF0ZS1tb2RpZmllcic7XG4gIHByaXZhdGUgbGFzdFVwZGF0ZWQ6IFJldmlzaW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB0YWc6IFRhZyxcbiAgICBwcml2YXRlIG1hbmFnZXI6IEludGVybmFsTW9kaWZpZXJNYW5hZ2VyLFxuICAgIHByaXZhdGUgbW9kaWZpZXI6IE1vZGlmaWVySW5zdGFuY2VTdGF0ZVxuICApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubGFzdFVwZGF0ZWQgPSB2YWx1ZSh0YWcpO1xuICB9XG5cbiAgZXZhbHVhdGUodm06IFVwZGF0aW5nVk0pIHtcbiAgICBsZXQgeyBtYW5hZ2VyLCBtb2RpZmllciwgdGFnLCBsYXN0VXBkYXRlZCB9ID0gdGhpcztcblxuICAgIGlmICghdmFsaWRhdGUodGFnLCBsYXN0VXBkYXRlZCkpIHtcbiAgICAgIHZtLmVudi5zY2hlZHVsZVVwZGF0ZU1vZGlmaWVyKG1vZGlmaWVyLCBtYW5hZ2VyKTtcbiAgICAgIHRoaXMubGFzdFVwZGF0ZWQgPSB2YWx1ZSh0YWcpO1xuICAgIH1cbiAgfVxufVxuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuU3RhdGljQXR0ciwgKHZtLCB7IG9wMTogX25hbWUsIG9wMjogX3ZhbHVlLCBvcDM6IF9uYW1lc3BhY2UgfSkgPT4ge1xuICBsZXQgbmFtZSA9IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lKTtcbiAgbGV0IHZhbHVlID0gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcoX3ZhbHVlKTtcbiAgbGV0IG5hbWVzcGFjZSA9IF9uYW1lc3BhY2UgPyB2bVtDT05TVEFOVFNdLmdldFN0cmluZyhfbmFtZXNwYWNlKSA6IG51bGw7XG5cbiAgdm0uZWxlbWVudHMoKS5zZXRTdGF0aWNBdHRyaWJ1dGUobmFtZSwgdmFsdWUsIG5hbWVzcGFjZSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkR5bmFtaWNBdHRyLCAodm0sIHsgb3AxOiBfbmFtZSwgb3AyOiB0cnVzdGluZywgb3AzOiBfbmFtZXNwYWNlIH0pID0+IHtcbiAgbGV0IG5hbWUgPSB2bVtDT05TVEFOVFNdLmdldFN0cmluZyhfbmFtZSk7XG4gIGxldCByZWZlcmVuY2UgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuICBsZXQgdmFsdWUgPSByZWZlcmVuY2UudmFsdWUoKTtcbiAgbGV0IG5hbWVzcGFjZSA9IF9uYW1lc3BhY2UgPyB2bVtDT05TVEFOVFNdLmdldFN0cmluZyhfbmFtZXNwYWNlKSA6IG51bGw7XG5cbiAgbGV0IGF0dHJpYnV0ZSA9IHZtLmVsZW1lbnRzKCkuc2V0RHluYW1pY0F0dHJpYnV0ZShuYW1lLCB2YWx1ZSwgISF0cnVzdGluZywgbmFtZXNwYWNlKTtcblxuICBpZiAoIWlzQ29uc3QocmVmZXJlbmNlKSkge1xuICAgIHZtLnVwZGF0ZVdpdGgobmV3IFVwZGF0ZUR5bmFtaWNBdHRyaWJ1dGVPcGNvZGUocmVmZXJlbmNlLCBhdHRyaWJ1dGUpKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVEeW5hbWljQXR0cmlidXRlT3Bjb2RlIGV4dGVuZHMgVXBkYXRpbmdPcGNvZGUge1xuICBwdWJsaWMgdHlwZSA9ICdwYXRjaC1lbGVtZW50JztcblxuICBwdWJsaWMgdGFnOiBUYWc7XG4gIHB1YmxpYyBsYXN0UmV2aXNpb246IFJldmlzaW9uO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVmZXJlbmNlOiBWZXJzaW9uZWRSZWZlcmVuY2U8dW5rbm93bj4sIHByaXZhdGUgYXR0cmlidXRlOiBEeW5hbWljQXR0cmlidXRlKSB7XG4gICAgc3VwZXIoKTtcbiAgICBsZXQgeyB0YWcgfSA9IHJlZmVyZW5jZTtcbiAgICB0aGlzLnRhZyA9IHRhZztcbiAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIGxldCB7IGF0dHJpYnV0ZSwgcmVmZXJlbmNlLCB0YWcgfSA9IHRoaXM7XG4gICAgaWYgKCF2YWxpZGF0ZSh0YWcsIHRoaXMubGFzdFJldmlzaW9uKSkge1xuICAgICAgdGhpcy5sYXN0UmV2aXNpb24gPSB2YWx1ZSh0YWcpO1xuICAgICAgYXR0cmlidXRlLnVwZGF0ZShyZWZlcmVuY2UudmFsdWUoKSwgdm0uZW52KTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7XG4gIGNoZWNrLFxuICBDaGVja0Z1bmN0aW9uLFxuICBDaGVja0hhbmRsZSxcbiAgQ2hlY2tJbnN0YW5jZW9mLFxuICBDaGVja0ludGVyZmFjZSxcbiAgQ2hlY2tQcm9ncmFtU3ltYm9sVGFibGUsXG59IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcbmltcG9ydCB7XG4gIEJvdW5kcyxcbiAgQ29tcGlsYWJsZVRlbXBsYXRlLFxuICBDb21wb25lbnREZWZpbml0aW9uLFxuICBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsXG4gIENvbXBvbmVudEluc3RhbmNlU3RhdGUsXG4gIENvbXBvbmVudE1hbmFnZXIsXG4gIERpY3QsXG4gIER5bmFtaWNTY29wZSxcbiAgRWxlbWVudE9wZXJhdGlvbnMsXG4gIEludGVybmFsQ29tcG9uZW50TWFuYWdlcixcbiAgSml0T3JBb3RCbG9jayxcbiAgTWF5YmUsXG4gIE9wLFxuICBQcm9ncmFtU3ltYm9sVGFibGUsXG4gIFJlY2FzdCxcbiAgUnVudGltZVJlc29sdmVyRGVsZWdhdGUsXG4gIFNjb3BlU2xvdCxcbiAgVk1Bcmd1bWVudHMsXG4gIFdpdGhBb3REeW5hbWljTGF5b3V0LFxuICBXaXRoQW90U3RhdGljTGF5b3V0LFxuICBXaXRoRHluYW1pY1RhZ05hbWUsXG4gIFdpdGhFbGVtZW50SG9vayxcbiAgV2l0aEppdER5bmFtaWNMYXlvdXQsXG4gIFdpdGhKaXRTdGF0aWNMYXlvdXQsXG4gIFdpdGhVcGRhdGVIb29rLFxuICBXaXRoQ3JlYXRlSW5zdGFuY2UsXG4gIEppdFJ1bnRpbWVSZXNvbHZlcixcbiAgUnVudGltZVJlc29sdmVyLFxuICBNb2RpZmllck1hbmFnZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgQ09OU1RBTlRfVEFHLFxuICBpc0NvbnN0LFxuICBpc0NvbnN0VGFnLFxuICBUYWcsXG4gIFZlcnNpb25lZFBhdGhSZWZlcmVuY2UsXG4gIFZlcnNpb25lZFJlZmVyZW5jZSxcbn0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IGFzc2VydCwgZGljdCwgZXhwZWN0LCBPcHRpb24sIHVucmVhY2hhYmxlIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyAkdDAsICR0MSwgJHYwIH0gZnJvbSAnQGdsaW1tZXIvdm0nO1xuaW1wb3J0IHtcbiAgQ2FwYWJpbGl0eSxcbiAgY2FwYWJpbGl0eUZsYWdzRnJvbSxcbiAgbWFuYWdlckhhc0NhcGFiaWxpdHksXG4gIGhhc0NhcGFiaWxpdHksXG59IGZyb20gJy4uLy4uL2NhcGFiaWxpdGllcyc7XG5pbXBvcnQge1xuICBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbn0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2N1cnJpZWQtY29tcG9uZW50JztcbmltcG9ydCB7IHJlc29sdmVDb21wb25lbnQgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvcmVzb2x2ZSc7XG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUywgVXBkYXRpbmdPcGNvZGUgfSBmcm9tICcuLi8uLi9vcGNvZGVzJztcbmltcG9ydCBDbGFzc0xpc3RSZWZlcmVuY2UgZnJvbSAnLi4vLi4vcmVmZXJlbmNlcy9jbGFzcy1saXN0JztcbmltcG9ydCBDdXJyeUNvbXBvbmVudFJlZmVyZW5jZSBmcm9tICcuLi8uLi9yZWZlcmVuY2VzL2N1cnJ5LWNvbXBvbmVudCc7XG5pbXBvcnQgeyBBUkdTLCBDT05TVEFOVFMgfSBmcm9tICcuLi8uLi9zeW1ib2xzJztcbmltcG9ydCB7IFVwZGF0aW5nVk0gfSBmcm9tICcuLi8uLi92bSc7XG5pbXBvcnQgeyBJbnRlcm5hbFZNIH0gZnJvbSAnLi4vLi4vdm0vYXBwZW5kJztcbmltcG9ydCB7IEJsb2NrQXJndW1lbnRzSW1wbCwgVk1Bcmd1bWVudHNJbXBsIH0gZnJvbSAnLi4vLi4vdm0vYXJndW1lbnRzJztcbmltcG9ydCB7XG4gIENoZWNrQXJndW1lbnRzLFxuICBDaGVja0NhcHR1cmVkQXJndW1lbnRzLFxuICBDaGVja0NvbXBvbmVudERlZmluaXRpb24sXG4gIENoZWNrQ29tcG9uZW50SW5zdGFuY2UsXG4gIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSxcbiAgQ2hlY2tJbnZvY2F0aW9uLFxuICBDaGVja1BhdGhSZWZlcmVuY2UsXG4gIENoZWNrUmVmZXJlbmNlLFxufSBmcm9tICcuLy1kZWJ1Zy1zdHJpcCc7XG5pbXBvcnQgeyBDb250ZW50VHlwZVJlZmVyZW5jZSB9IGZyb20gJy4vY29udGVudCc7XG5pbXBvcnQgeyBVcGRhdGVEeW5hbWljQXR0cmlidXRlT3Bjb2RlIH0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHsgQ29uZGl0aW9uYWxSZWZlcmVuY2UgfSBmcm9tICcuLi8uLi9yZWZlcmVuY2VzJztcblxuLyoqXG4gKiBUaGUgVk0gY3JlYXRlcyBhIG5ldyBDb21wb25lbnRJbnN0YW5jZSBkYXRhIHN0cnVjdHVyZSBmb3IgZXZlcnkgY29tcG9uZW50XG4gKiBpbnZvY2F0aW9uIGl0IGVuY291bnRlcnMuXG4gKlxuICogU2ltaWxhciB0byBob3cgYSBDb21wb25lbnREZWZpbml0aW9uIGNvbnRhaW5zIHN0YXRlIGFib3V0IGFsbCBjb21wb25lbnRzIG9mIGFcbiAqIHBhcnRpY3VsYXIgdHlwZSwgYSBDb21wb25lbnRJbnN0YW5jZSBjb250YWlucyBzdGF0ZSBzcGVjaWZpYyB0byBhIHBhcnRpY3VsYXJcbiAqIGluc3RhbmNlIG9mIGEgY29tcG9uZW50IHR5cGUuIEl0IGFsc28gY29udGFpbnMgYSBwb2ludGVyIGJhY2sgdG8gaXRzXG4gKiBjb21wb25lbnQgdHlwZSdzIENvbXBvbmVudERlZmluaXRpb24uXG4gKi9cblxuZXhwb3J0IGNvbnN0IENPTVBPTkVOVF9JTlNUQU5DRSA9ICdDT01QT05FTlRfSU5TVEFOQ0UgW2M1NmM1N2RlLWU3M2EtNGVmMC1iMTM3LTA3NjYxZGExNzAyOV0nO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudEluc3RhbmNlIHtcbiAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWU7XG4gIGRlZmluaXRpb246IENvbXBvbmVudERlZmluaXRpb247XG4gIG1hbmFnZXI6IENvbXBvbmVudE1hbmFnZXI7XG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eTtcbiAgc3RhdGU6IENvbXBvbmVudEluc3RhbmNlU3RhdGU7XG4gIGhhbmRsZTogbnVtYmVyO1xuICB0YWJsZTogUHJvZ3JhbVN5bWJvbFRhYmxlO1xuICBsb29rdXA6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxKaXRPckFvdEJsb2NrPj4+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluaXRpYWxDb21wb25lbnRJbnN0YW5jZSB7XG4gIFtDT01QT05FTlRfSU5TVEFOQ0VdOiB0cnVlO1xuICBkZWZpbml0aW9uOiBQYXJ0aWFsQ29tcG9uZW50RGVmaW5pdGlvbjtcbiAgbWFuYWdlcjogT3B0aW9uPEludGVybmFsQ29tcG9uZW50TWFuYWdlcj47XG4gIGNhcGFiaWxpdGllczogT3B0aW9uPENhcGFiaWxpdHk+O1xuICBzdGF0ZTogbnVsbDtcbiAgaGFuZGxlOiBPcHRpb248bnVtYmVyPjtcbiAgdGFibGU6IE9wdGlvbjxQcm9ncmFtU3ltYm9sVGFibGU+O1xuICBsb29rdXA6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxKaXRPckFvdEJsb2NrPj4+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBvcHVsYXRlZENvbXBvbmVudEluc3RhbmNlIHtcbiAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWU7XG4gIGRlZmluaXRpb246IENvbXBvbmVudERlZmluaXRpb247XG4gIG1hbmFnZXI6IENvbXBvbmVudE1hbmFnZXI8dW5rbm93bj47XG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eTtcbiAgc3RhdGU6IG51bGw7XG4gIGhhbmRsZTogbnVtYmVyO1xuICB0YWJsZTogT3B0aW9uPFByb2dyYW1TeW1ib2xUYWJsZT47XG4gIGxvb2t1cDogT3B0aW9uPERpY3Q8U2NvcGVTbG90PEppdE9yQW90QmxvY2s+Pj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFydGlhbENvbXBvbmVudERlZmluaXRpb24ge1xuICBzdGF0ZTogT3B0aW9uPENvbXBvbmVudERlZmluaXRpb25TdGF0ZT47XG4gIG1hbmFnZXI6IEludGVybmFsQ29tcG9uZW50TWFuYWdlcjtcbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLklzQ29tcG9uZW50LCB2bSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBsZXQgcmVmID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrUmVmZXJlbmNlKTtcblxuICBzdGFjay5wdXNoKG5ldyBDb25kaXRpb25hbFJlZmVyZW5jZShyZWYsIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24pKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ29udGVudFR5cGUsIHZtID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIGxldCByZWYgPSBjaGVjayhzdGFjay5wZWVrKCksIENoZWNrUmVmZXJlbmNlKTtcblxuICBzdGFjay5wdXNoKG5ldyBDb250ZW50VHlwZVJlZmVyZW5jZShyZWYpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ3VycnlDb21wb25lbnQsICh2bSwgeyBvcDE6IF9tZXRhIH0pID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG5cbiAgbGV0IGRlZmluaXRpb24gPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuICBsZXQgY2FwdHVyZWRBcmdzID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrQ2FwdHVyZWRBcmd1bWVudHMpO1xuXG4gIGxldCBtZXRhID0gdm1bQ09OU1RBTlRTXS5nZXRUZW1wbGF0ZU1ldGEoX21ldGEpO1xuICBsZXQgcmVzb2x2ZXIgPSB2bS5ydW50aW1lLnJlc29sdmVyO1xuXG4gIHZtLmxvYWRWYWx1ZSgkdjAsIG5ldyBDdXJyeUNvbXBvbmVudFJlZmVyZW5jZShkZWZpbml0aW9uLCByZXNvbHZlciwgbWV0YSwgY2FwdHVyZWRBcmdzKSk7XG5cbiAgLy8gZXhwZWN0U3RhY2tDaGFuZ2Uodm0uc3RhY2ssIC1hcmdzLmxlbmd0aCAtIDEsICdDdXJyeUNvbXBvbmVudCcpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXNoQ29tcG9uZW50RGVmaW5pdGlvbiwgKHZtLCB7IG9wMTogaGFuZGxlIH0pID0+IHtcbiAgbGV0IGRlZmluaXRpb24gPSB2bS5ydW50aW1lLnJlc29sdmVyLnJlc29sdmU8Q29tcG9uZW50RGVmaW5pdGlvbj4oaGFuZGxlKTtcbiAgYXNzZXJ0KCEhZGVmaW5pdGlvbiwgYE1pc3NpbmcgY29tcG9uZW50IGZvciAke2hhbmRsZX1gKTtcblxuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuICBsZXQgY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhkZWZpbml0aW9uLnN0YXRlKSk7XG5cbiAgbGV0IGluc3RhbmNlOiBJbml0aWFsQ29tcG9uZW50SW5zdGFuY2UgPSB7XG4gICAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWUsXG4gICAgZGVmaW5pdGlvbixcbiAgICBtYW5hZ2VyLFxuICAgIGNhcGFiaWxpdGllcyxcbiAgICBzdGF0ZTogbnVsbCxcbiAgICBoYW5kbGU6IG51bGwsXG4gICAgdGFibGU6IG51bGwsXG4gICAgbG9va3VwOiBudWxsLFxuICB9O1xuXG4gIHZtLnN0YWNrLnB1c2goaW5zdGFuY2UpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5SZXNvbHZlRHluYW1pY0NvbXBvbmVudCwgKHZtLCB7IG9wMTogX21ldGEgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IGNvbXBvbmVudCA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpLnZhbHVlKCkgYXMgTWF5YmU8RGljdD47XG4gIGxldCBtZXRhID0gdm1bQ09OU1RBTlRTXS5nZXRUZW1wbGF0ZU1ldGEoX21ldGEpO1xuXG4gIHZtLmxvYWRWYWx1ZSgkdDEsIG51bGwpOyAvLyBDbGVhciB0aGUgdGVtcCByZWdpc3RlclxuXG4gIGxldCBkZWZpbml0aW9uOiBDb21wb25lbnREZWZpbml0aW9uIHwgQ3VycmllZENvbXBvbmVudERlZmluaXRpb247XG5cbiAgaWYgKHR5cGVvZiBjb21wb25lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgbGV0IHJlc29sdmVkRGVmaW5pdGlvbiA9IHJlc29sdmVDb21wb25lbnQodm0ucnVudGltZS5yZXNvbHZlciwgY29tcG9uZW50LCBtZXRhKTtcblxuICAgIGRlZmluaXRpb24gPSBleHBlY3QocmVzb2x2ZWREZWZpbml0aW9uLCBgQ291bGQgbm90IGZpbmQgYSBjb21wb25lbnQgbmFtZWQgXCIke2NvbXBvbmVudH1cImApO1xuICB9IGVsc2UgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oY29tcG9uZW50KSkge1xuICAgIGRlZmluaXRpb24gPSBjb21wb25lbnQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgfVxuXG4gIHN0YWNrLnB1c2goZGVmaW5pdGlvbik7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hEeW5hbWljQ29tcG9uZW50SW5zdGFuY2UsIHZtID0+IHtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuICBsZXQgZGVmaW5pdGlvbiA9IHN0YWNrLnBvcDxDb21wb25lbnREZWZpbml0aW9uPigpO1xuXG4gIGxldCBjYXBhYmlsaXRpZXMsIG1hbmFnZXI7XG5cbiAgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oZGVmaW5pdGlvbikpIHtcbiAgICBtYW5hZ2VyID0gY2FwYWJpbGl0aWVzID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICBtYW5hZ2VyID0gZGVmaW5pdGlvbi5tYW5hZ2VyO1xuICAgIGNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdHlGbGFnc0Zyb20obWFuYWdlci5nZXRDYXBhYmlsaXRpZXMoZGVmaW5pdGlvbi5zdGF0ZSkpO1xuICB9XG5cbiAgc3RhY2sucHVzaCh7IGRlZmluaXRpb24sIGNhcGFiaWxpdGllcywgbWFuYWdlciwgc3RhdGU6IG51bGwsIGhhbmRsZTogbnVsbCwgdGFibGU6IG51bGwgfSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hDdXJyaWVkQ29tcG9uZW50LCB2bSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuXG4gIGxldCBjb21wb25lbnQgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKS52YWx1ZSgpIGFzIE1heWJlPERpY3Q+O1xuICBsZXQgZGVmaW5pdGlvbjogQ3VycmllZENvbXBvbmVudERlZmluaXRpb247XG5cbiAgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oY29tcG9uZW50KSkge1xuICAgIGRlZmluaXRpb24gPSBjb21wb25lbnQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgfVxuXG4gIHN0YWNrLnB1c2goZGVmaW5pdGlvbik7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hBcmdzLCAodm0sIHsgb3AxOiBfbmFtZXMsIG9wMjogZmxhZ3MgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IG5hbWVzID0gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmdBcnJheShfbmFtZXMpO1xuXG4gIGxldCBwb3NpdGlvbmFsQ291bnQgPSBmbGFncyA+PiA0O1xuICBsZXQgYXROYW1lcyA9IGZsYWdzICYgMGIxMDAwO1xuICBsZXQgYmxvY2tOYW1lczogc3RyaW5nW10gPSBbXTtcblxuICBpZiAoZmxhZ3MgJiAwYjAxMDApIGJsb2NrTmFtZXMucHVzaCgnbWFpbicpO1xuICBpZiAoZmxhZ3MgJiAwYjAwMTApIGJsb2NrTmFtZXMucHVzaCgnZWxzZScpO1xuICBpZiAoZmxhZ3MgJiAwYjAwMDEpIGJsb2NrTmFtZXMucHVzaCgnYXR0cnMnKTtcblxuICB2bVtBUkdTXS5zZXR1cChzdGFjaywgbmFtZXMsIGJsb2NrTmFtZXMsIHBvc2l0aW9uYWxDb3VudCwgISFhdE5hbWVzKTtcbiAgc3RhY2sucHVzaCh2bVtBUkdTXSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hFbXB0eUFyZ3MsIHZtID0+IHtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuXG4gIHN0YWNrLnB1c2godm1bQVJHU10uZW1wdHkoc3RhY2spKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ2FwdHVyZUFyZ3MsIHZtID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG5cbiAgbGV0IGFyZ3MgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tJbnN0YW5jZW9mKFZNQXJndW1lbnRzSW1wbCkpO1xuICBsZXQgY2FwdHVyZWRBcmdzID0gYXJncy5jYXB0dXJlKCk7XG4gIHN0YWNrLnB1c2goY2FwdHVyZWRBcmdzKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHJlcGFyZUFyZ3MsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBsZXQgaW5zdGFuY2UgPSB2bS5mZXRjaFZhbHVlPENvbXBvbmVudEluc3RhbmNlPihfc3RhdGUpO1xuICBsZXQgYXJncyA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja0luc3RhbmNlb2YoVk1Bcmd1bWVudHNJbXBsKSk7XG5cbiAgbGV0IHsgZGVmaW5pdGlvbiB9ID0gaW5zdGFuY2U7XG5cbiAgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oZGVmaW5pdGlvbikpIHtcbiAgICBhc3NlcnQoXG4gICAgICAhZGVmaW5pdGlvbi5tYW5hZ2VyLFxuICAgICAgXCJJZiB0aGUgY29tcG9uZW50IGRlZmluaXRpb24gd2FzIGN1cnJpZWQsIHdlIGRvbid0IHlldCBoYXZlIGEgbWFuYWdlclwiXG4gICAgKTtcbiAgICBkZWZpbml0aW9uID0gcmVzb2x2ZUN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKGluc3RhbmNlLCBkZWZpbml0aW9uLCBhcmdzKTtcbiAgfVxuXG4gIGxldCB7IG1hbmFnZXIsIHN0YXRlIH0gPSBkZWZpbml0aW9uO1xuICBsZXQgY2FwYWJpbGl0aWVzID0gaW5zdGFuY2UuY2FwYWJpbGl0aWVzO1xuXG4gIGlmICghbWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LlByZXBhcmVBcmdzKSkge1xuICAgIHN0YWNrLnB1c2goYXJncyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IGJsb2NrcyA9IGFyZ3MuYmxvY2tzLnZhbHVlcztcbiAgbGV0IGJsb2NrTmFtZXMgPSBhcmdzLmJsb2Nrcy5uYW1lcztcbiAgbGV0IHByZXBhcmVkQXJncyA9IG1hbmFnZXIucHJlcGFyZUFyZ3Moc3RhdGUsIGFyZ3MpO1xuXG4gIGlmIChwcmVwYXJlZEFyZ3MpIHtcbiAgICBhcmdzLmNsZWFyKCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgc3RhY2sucHVzaChibG9ja3NbaV0pO1xuICAgIH1cblxuICAgIGxldCB7IHBvc2l0aW9uYWwsIG5hbWVkIH0gPSBwcmVwYXJlZEFyZ3M7XG5cbiAgICBsZXQgcG9zaXRpb25hbENvdW50ID0gcG9zaXRpb25hbC5sZW5ndGg7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9uYWxDb3VudDsgaSsrKSB7XG4gICAgICBzdGFjay5wdXNoKHBvc2l0aW9uYWxbaV0pO1xuICAgIH1cblxuICAgIGxldCBuYW1lcyA9IE9iamVjdC5rZXlzKG5hbWVkKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHN0YWNrLnB1c2gobmFtZWRbbmFtZXNbaV1dKTtcbiAgICB9XG5cbiAgICBhcmdzLnNldHVwKHN0YWNrLCBuYW1lcywgYmxvY2tOYW1lcywgcG9zaXRpb25hbENvdW50LCBmYWxzZSk7XG4gIH1cblxuICBzdGFjay5wdXNoKGFyZ3MpO1xufSk7XG5cbmZ1bmN0aW9uIHJlc29sdmVDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihcbiAgaW5zdGFuY2U6IENvbXBvbmVudEluc3RhbmNlLFxuICBkZWZpbml0aW9uOiBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgYXJnczogVk1Bcmd1bWVudHNJbXBsXG4pOiBDb21wb25lbnREZWZpbml0aW9uIHtcbiAgbGV0IHVud3JhcHBlZERlZmluaXRpb24gPSAoaW5zdGFuY2UuZGVmaW5pdGlvbiA9IGRlZmluaXRpb24udW53cmFwKGFyZ3MpKTtcbiAgbGV0IHsgbWFuYWdlciwgc3RhdGUgfSA9IHVud3JhcHBlZERlZmluaXRpb247XG5cbiAgYXNzZXJ0KGluc3RhbmNlLm1hbmFnZXIgPT09IG51bGwsICdjb21wb25lbnQgaW5zdGFuY2UgbWFuYWdlciBzaG91bGQgbm90IGJlIHBvcHVsYXRlZCB5ZXQnKTtcbiAgYXNzZXJ0KGluc3RhbmNlLmNhcGFiaWxpdGllcyA9PT0gbnVsbCwgJ2NvbXBvbmVudCBpbnN0YW5jZSBtYW5hZ2VyIHNob3VsZCBub3QgYmUgcG9wdWxhdGVkIHlldCcpO1xuXG4gIGluc3RhbmNlLm1hbmFnZXIgPSBtYW5hZ2VyO1xuICBpbnN0YW5jZS5jYXBhYmlsaXRpZXMgPSBjYXBhYmlsaXR5RmxhZ3NGcm9tKG1hbmFnZXIuZ2V0Q2FwYWJpbGl0aWVzKHN0YXRlKSk7XG5cbiAgcmV0dXJuIHVud3JhcHBlZERlZmluaXRpb247XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5DcmVhdGVDb21wb25lbnQsICh2bSwgeyBvcDE6IGZsYWdzLCBvcDI6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBpbnN0YW5jZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IGRlZmluaXRpb24sIG1hbmFnZXIgfSA9IGluc3RhbmNlO1xuXG4gIGxldCBjYXBhYmlsaXRpZXMgPSAoaW5zdGFuY2UuY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShcbiAgICBtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhkZWZpbml0aW9uLnN0YXRlKVxuICApKTtcblxuICBpZiAoIW1hbmFnZXJIYXNDYXBhYmlsaXR5KG1hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5DcmVhdGVJbnN0YW5jZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJVR2ApO1xuICB9XG5cbiAgbGV0IGR5bmFtaWNTY29wZTogT3B0aW9uPER5bmFtaWNTY29wZT4gPSBudWxsO1xuICBpZiAobWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkR5bmFtaWNTY29wZSkpIHtcbiAgICBkeW5hbWljU2NvcGUgPSB2bS5keW5hbWljU2NvcGUoKTtcbiAgfVxuXG4gIGxldCBoYXNEZWZhdWx0QmxvY2sgPSBmbGFncyAmIDE7XG4gIGxldCBhcmdzOiBPcHRpb248Vk1Bcmd1bWVudHM+ID0gbnVsbDtcblxuICBpZiAobWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkNyZWF0ZUFyZ3MpKSB7XG4gICAgYXJncyA9IGNoZWNrKHZtLnN0YWNrLnBlZWsoKSwgQ2hlY2tBcmd1bWVudHMpO1xuICB9XG5cbiAgbGV0IHNlbGY6IE9wdGlvbjxWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+PiA9IG51bGw7XG4gIGlmIChtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuQ3JlYXRlQ2FsbGVyKSkge1xuICAgIHNlbGYgPSB2bS5nZXRTZWxmKCk7XG4gIH1cblxuICBsZXQgc3RhdGUgPSBtYW5hZ2VyLmNyZWF0ZSh2bS5lbnYsIGRlZmluaXRpb24uc3RhdGUsIGFyZ3MsIGR5bmFtaWNTY29wZSwgc2VsZiwgISFoYXNEZWZhdWx0QmxvY2spO1xuXG4gIC8vIFdlIHdhbnQgdG8gcmV1c2UgdGhlIGBzdGF0ZWAgUE9KTyBoZXJlLCBiZWNhdXNlIHdlIGtub3cgdGhhdCB0aGUgb3Bjb2Rlc1xuICAvLyBvbmx5IHRyYW5zaXRpb24gYXQgZXhhY3RseSBvbmUgcGxhY2UuXG4gIGluc3RhbmNlLnN0YXRlID0gc3RhdGU7XG5cbiAgbGV0IHRhZyA9IG1hbmFnZXIuZ2V0VGFnKHN0YXRlKTtcblxuICBpZiAobWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LlVwZGF0ZUhvb2spICYmICFpc0NvbnN0VGFnKHRhZykpIHtcbiAgICB2bS51cGRhdGVXaXRoKG5ldyBVcGRhdGVDb21wb25lbnRPcGNvZGUodGFnLCBzdGF0ZSwgbWFuYWdlciwgZHluYW1pY1Njb3BlKSk7XG4gIH1cbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUmVnaXN0ZXJDb21wb25lbnREZXN0cnVjdG9yLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBtYW5hZ2VyLCBzdGF0ZSB9ID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcblxuICBsZXQgZCA9IG1hbmFnZXIuZ2V0RGVzdHJ1Y3RvcihzdGF0ZSk7XG4gIGlmIChkKSB2bS5hc3NvY2lhdGVEZXN0cm95YWJsZShkKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQmVnaW5Db21wb25lbnRUcmFuc2FjdGlvbiwgdm0gPT4ge1xuICB2bS5iZWdpbkNhY2hlR3JvdXAoKTtcbiAgdm0uZWxlbWVudHMoKS5wdXNoU2ltcGxlQmxvY2soKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHV0Q29tcG9uZW50T3BlcmF0aW9ucywgdm0gPT4ge1xuICB2bS5sb2FkVmFsdWUoJHQwLCBuZXcgQ29tcG9uZW50RWxlbWVudE9wZXJhdGlvbnMoKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkNvbXBvbmVudEF0dHIsICh2bSwgeyBvcDE6IF9uYW1lLCBvcDI6IHRydXN0aW5nLCBvcDM6IF9uYW1lc3BhY2UgfSkgPT4ge1xuICBsZXQgbmFtZSA9IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lKTtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG4gIGxldCBuYW1lc3BhY2UgPSBfbmFtZXNwYWNlID8gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcoX25hbWVzcGFjZSkgOiBudWxsO1xuXG4gIGNoZWNrKHZtLmZldGNoVmFsdWUoJHQwKSwgQ2hlY2tJbnN0YW5jZW9mKENvbXBvbmVudEVsZW1lbnRPcGVyYXRpb25zKSkuc2V0QXR0cmlidXRlKFxuICAgIG5hbWUsXG4gICAgcmVmZXJlbmNlLFxuICAgICEhdHJ1c3RpbmcsXG4gICAgbmFtZXNwYWNlXG4gICk7XG59KTtcblxuaW50ZXJmYWNlIERlZmVycmVkQXR0cmlidXRlIHtcbiAgdmFsdWU6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPjtcbiAgbmFtZXNwYWNlOiBPcHRpb248c3RyaW5nPjtcbiAgdHJ1c3Rpbmc6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRFbGVtZW50T3BlcmF0aW9ucyBpbXBsZW1lbnRzIEVsZW1lbnRPcGVyYXRpb25zIHtcbiAgcHJpdmF0ZSBhdHRyaWJ1dGVzID0gZGljdDxEZWZlcnJlZEF0dHJpYnV0ZT4oKTtcbiAgcHJpdmF0ZSBjbGFzc2VzOiBWZXJzaW9uZWRSZWZlcmVuY2U8dW5rbm93bj5bXSA9IFtdO1xuICBwcml2YXRlIG1vZGlmaWVyczogW01vZGlmaWVyTWFuYWdlcjx1bmtub3duPiwgdW5rbm93bl1bXSA9IFtdO1xuXG4gIHNldEF0dHJpYnV0ZShcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdmFsdWU6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPixcbiAgICB0cnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxzdHJpbmc+XG4gICkge1xuICAgIGxldCBkZWZlcnJlZCA9IHsgdmFsdWUsIG5hbWVzcGFjZSwgdHJ1c3RpbmcgfTtcblxuICAgIGlmIChuYW1lID09PSAnY2xhc3MnKSB7XG4gICAgICB0aGlzLmNsYXNzZXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5hdHRyaWJ1dGVzW25hbWVdID0gZGVmZXJyZWQ7XG4gIH1cblxuICBhZGRNb2RpZmllcjxTPihtYW5hZ2VyOiBNb2RpZmllck1hbmFnZXI8Uz4sIHN0YXRlOiBTKTogdm9pZCB7XG4gICAgdGhpcy5tb2RpZmllcnMucHVzaChbbWFuYWdlciwgc3RhdGVdKTtcbiAgfVxuXG4gIGZsdXNoKHZtOiBJbnRlcm5hbFZNPEppdE9yQW90QmxvY2s+KTogW01vZGlmaWVyTWFuYWdlcjx1bmtub3duPiwgdW5rbm93bl1bXSB7XG4gICAgZm9yIChsZXQgbmFtZSBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgIGxldCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgbGV0IHsgdmFsdWU6IHJlZmVyZW5jZSwgbmFtZXNwYWNlLCB0cnVzdGluZyB9ID0gYXR0cjtcblxuICAgICAgaWYgKG5hbWUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgcmVmZXJlbmNlID0gbmV3IENsYXNzTGlzdFJlZmVyZW5jZSh0aGlzLmNsYXNzZXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmFtZSA9PT0gJ3R5cGUnKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBsZXQgYXR0cmlidXRlID0gdm1cbiAgICAgICAgLmVsZW1lbnRzKClcbiAgICAgICAgLnNldER5bmFtaWNBdHRyaWJ1dGUobmFtZSwgcmVmZXJlbmNlLnZhbHVlKCksIHRydXN0aW5nLCBuYW1lc3BhY2UpO1xuXG4gICAgICBpZiAoIWlzQ29uc3QocmVmZXJlbmNlKSkge1xuICAgICAgICB2bS51cGRhdGVXaXRoKG5ldyBVcGRhdGVEeW5hbWljQXR0cmlidXRlT3Bjb2RlKHJlZmVyZW5jZSwgYXR0cmlidXRlKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCd0eXBlJyBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgIGxldCB0eXBlID0gdGhpcy5hdHRyaWJ1dGVzLnR5cGU7XG4gICAgICBsZXQgeyB2YWx1ZTogcmVmZXJlbmNlLCBuYW1lc3BhY2UsIHRydXN0aW5nIH0gPSB0eXBlO1xuXG4gICAgICBsZXQgYXR0cmlidXRlID0gdm1cbiAgICAgICAgLmVsZW1lbnRzKClcbiAgICAgICAgLnNldER5bmFtaWNBdHRyaWJ1dGUoJ3R5cGUnLCByZWZlcmVuY2UudmFsdWUoKSwgdHJ1c3RpbmcsIG5hbWVzcGFjZSk7XG5cbiAgICAgIGlmICghaXNDb25zdChyZWZlcmVuY2UpKSB7XG4gICAgICAgIHZtLnVwZGF0ZVdpdGgobmV3IFVwZGF0ZUR5bmFtaWNBdHRyaWJ1dGVPcGNvZGUocmVmZXJlbmNlLCBhdHRyaWJ1dGUpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5tb2RpZmllcnM7XG4gIH1cbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkRpZENyZWF0ZUVsZW1lbnQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IGRlZmluaXRpb24sIHN0YXRlIH0gPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuXG4gIGxldCBvcGVyYXRpb25zID0gY2hlY2sodm0uZmV0Y2hWYWx1ZSgkdDApLCBDaGVja0luc3RhbmNlb2YoQ29tcG9uZW50RWxlbWVudE9wZXJhdGlvbnMpKTtcblxuICAobWFuYWdlciBhcyBXaXRoRWxlbWVudEhvb2s8dW5rbm93bj4pLmRpZENyZWF0ZUVsZW1lbnQoXG4gICAgc3RhdGUsXG4gICAgZXhwZWN0KHZtLmVsZW1lbnRzKCkuY29uc3RydWN0aW5nLCBgRXhwZWN0ZWQgYSBjb25zdHJ1Y3RpbmcgZWxlbWV0IGluIERpZENyZWF0ZU9wY29kZWApLFxuICAgIG9wZXJhdGlvbnNcbiAgKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuR2V0Q29tcG9uZW50U2VsZiwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgZGVmaW5pdGlvbiwgc3RhdGUgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IG1hbmFnZXIgfSA9IGRlZmluaXRpb247XG5cbiAgdm0uc3RhY2sucHVzaChtYW5hZ2VyLmdldFNlbGYoc3RhdGUpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuR2V0Q29tcG9uZW50VGFnTmFtZSwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgZGVmaW5pdGlvbiwgc3RhdGUgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IG1hbmFnZXIgfSA9IGRlZmluaXRpb247XG5cbiAgdm0uc3RhY2sucHVzaChcbiAgICAobWFuYWdlciBhcyBSZWNhc3Q8SW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyLCBXaXRoRHluYW1pY1RhZ05hbWU8dW5rbm93bj4+KS5nZXRUYWdOYW1lKHN0YXRlKVxuICApO1xufSk7XG5cbi8vIER5bmFtaWMgSW52b2NhdGlvbiBPbmx5XG5BUFBFTkRfT1BDT0RFUy5hZGQoXG4gIE9wLkdldEppdENvbXBvbmVudExheW91dCxcbiAgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgICBsZXQgaW5zdGFuY2UgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuXG4gICAgbGV0IG1hbmFnZXIgPSBpbnN0YW5jZS5tYW5hZ2VyIGFzIFdpdGhKaXRTdGF0aWNMYXlvdXQgfCBXaXRoSml0RHluYW1pY0xheW91dDtcbiAgICBsZXQgeyBkZWZpbml0aW9uIH0gPSBpbnN0YW5jZTtcbiAgICBsZXQgeyBzdGFjayB9ID0gdm07XG5cbiAgICBsZXQgeyBjYXBhYmlsaXRpZXMgfSA9IGluc3RhbmNlO1xuXG4gICAgLy8gbGV0IGludm9rZTogeyBoYW5kbGU6IG51bWJlcjsgc3ltYm9sVGFibGU6IFByb2dyYW1TeW1ib2xUYWJsZSB9O1xuXG4gICAgbGV0IGxheW91dDogQ29tcGlsYWJsZVRlbXBsYXRlO1xuXG4gICAgaWYgKGhhc1N0YXRpY0xheW91dENhcGFiaWxpdHkoY2FwYWJpbGl0aWVzLCBtYW5hZ2VyKSkge1xuICAgICAgbGF5b3V0ID0gbWFuYWdlci5nZXRKaXRTdGF0aWNMYXlvdXQoZGVmaW5pdGlvbi5zdGF0ZSwgdm0ucnVudGltZS5yZXNvbHZlcik7XG4gICAgfSBlbHNlIGlmIChoYXNEeW5hbWljTGF5b3V0Q2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIG1hbmFnZXIpKSB7XG4gICAgICBsZXQgdGVtcGxhdGUgPSBtYW5hZ2VyLmdldEppdER5bmFtaWNMYXlvdXQoaW5zdGFuY2Uuc3RhdGUsIHZtLnJ1bnRpbWUucmVzb2x2ZXIsIHZtLmNvbnRleHQpO1xuXG4gICAgICBpZiAoaGFzQ2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuV3JhcHBlZCkpIHtcbiAgICAgICAgbGF5b3V0ID0gdGVtcGxhdGUuYXNXcmFwcGVkTGF5b3V0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYXlvdXQgPSB0ZW1wbGF0ZS5hc0xheW91dCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB1bnJlYWNoYWJsZSgpO1xuICAgIH1cblxuICAgIGxldCBoYW5kbGUgPSBsYXlvdXQuY29tcGlsZSh2bS5jb250ZXh0KTtcblxuICAgIHN0YWNrLnB1c2gobGF5b3V0LnN5bWJvbFRhYmxlKTtcbiAgICBzdGFjay5wdXNoKGhhbmRsZSk7XG4gIH0sXG4gICdqaXQnXG4pO1xuXG4vLyBEeW5hbWljIEludm9jYXRpb24gT25seVxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkdldEFvdENvbXBvbmVudExheW91dCwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IGluc3RhbmNlID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHsgbWFuYWdlciwgZGVmaW5pdGlvbiB9ID0gaW5zdGFuY2U7XG4gIGxldCB7IHN0YWNrIH0gPSB2bTtcblxuICBsZXQgeyBzdGF0ZTogaW5zdGFuY2VTdGF0ZSwgY2FwYWJpbGl0aWVzIH0gPSBpbnN0YW5jZTtcbiAgbGV0IHsgc3RhdGU6IGRlZmluaXRpb25TdGF0ZSB9ID0gZGVmaW5pdGlvbjtcblxuICBsZXQgaW52b2tlOiB7IGhhbmRsZTogbnVtYmVyOyBzeW1ib2xUYWJsZTogUHJvZ3JhbVN5bWJvbFRhYmxlIH07XG5cbiAgaWYgKGhhc1N0YXRpY0xheW91dENhcGFiaWxpdHkoY2FwYWJpbGl0aWVzLCBtYW5hZ2VyKSkge1xuICAgIGludm9rZSA9IChtYW5hZ2VyIGFzIFdpdGhBb3RTdGF0aWNMYXlvdXQ8XG4gICAgICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICAgICAgQ29tcG9uZW50RGVmaW5pdGlvblN0YXRlLFxuICAgICAgUnVudGltZVJlc29sdmVyRGVsZWdhdGVcbiAgICA+KS5nZXRBb3RTdGF0aWNMYXlvdXQoZGVmaW5pdGlvblN0YXRlLCB2bS5ydW50aW1lLnJlc29sdmVyKTtcbiAgfSBlbHNlIGlmIChoYXNEeW5hbWljTGF5b3V0Q2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIG1hbmFnZXIpKSB7XG4gICAgaW52b2tlID0gKG1hbmFnZXIgYXMgV2l0aEFvdER5bmFtaWNMYXlvdXQ8XG4gICAgICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICAgICAgUnVudGltZVJlc29sdmVyXG4gICAgPikuZ2V0QW90RHluYW1pY0xheW91dChpbnN0YW5jZVN0YXRlLCB2bS5ydW50aW1lLnJlc29sdmVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyB1bnJlYWNoYWJsZSgpO1xuICB9XG5cbiAgc3RhY2sucHVzaChpbnZva2Uuc3ltYm9sVGFibGUpO1xuICBzdGFjay5wdXNoKGludm9rZS5oYW5kbGUpO1xufSk7XG5cbi8vIFRoZXNlIHR5cGVzIGFyZSBhYnN1cmQgaGVyZVxuZXhwb3J0IGZ1bmN0aW9uIGhhc1N0YXRpY0xheW91dENhcGFiaWxpdHkoXG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eSxcbiAgX21hbmFnZXI6IEludGVybmFsQ29tcG9uZW50TWFuYWdlclxuKTogX21hbmFnZXIgaXNcbiAgfCBXaXRoSml0U3RhdGljTGF5b3V0PENvbXBvbmVudEluc3RhbmNlU3RhdGUsIENvbXBvbmVudERlZmluaXRpb25TdGF0ZSwgSml0UnVudGltZVJlc29sdmVyPlxuICB8IFdpdGhBb3RTdGF0aWNMYXlvdXQ8Q29tcG9uZW50SW5zdGFuY2VTdGF0ZSwgQ29tcG9uZW50RGVmaW5pdGlvblN0YXRlLCBSdW50aW1lUmVzb2x2ZXI+IHtcbiAgcmV0dXJuIG1hbmFnZXJIYXNDYXBhYmlsaXR5KF9tYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuRHluYW1pY0xheW91dCkgPT09IGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzSml0U3RhdGljTGF5b3V0Q2FwYWJpbGl0eShcbiAgY2FwYWJpbGl0aWVzOiBDYXBhYmlsaXR5LFxuICBfbWFuYWdlcjogSW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyXG4pOiBfbWFuYWdlciBpcyBXaXRoSml0U3RhdGljTGF5b3V0PFxuICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsXG4gIEppdFJ1bnRpbWVSZXNvbHZlclxuPiB7XG4gIHJldHVybiBtYW5hZ2VySGFzQ2FwYWJpbGl0eShfbWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkR5bmFtaWNMYXlvdXQpID09PSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0R5bmFtaWNMYXlvdXRDYXBhYmlsaXR5KFxuICBjYXBhYmlsaXRpZXM6IENhcGFiaWxpdHksXG4gIF9tYW5hZ2VyOiBJbnRlcm5hbENvbXBvbmVudE1hbmFnZXJcbik6IF9tYW5hZ2VyIGlzXG4gIHwgV2l0aEppdER5bmFtaWNMYXlvdXQ8Q29tcG9uZW50SW5zdGFuY2VTdGF0ZSwgSml0UnVudGltZVJlc29sdmVyPlxuICB8IFdpdGhBb3REeW5hbWljTGF5b3V0PENvbXBvbmVudEluc3RhbmNlU3RhdGUsIFJ1bnRpbWVSZXNvbHZlcj4ge1xuICByZXR1cm4gbWFuYWdlckhhc0NhcGFiaWxpdHkoX21hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5EeW5hbWljTGF5b3V0KSA9PT0gdHJ1ZTtcbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLk1haW4sICh2bSwgeyBvcDE6IHJlZ2lzdGVyIH0pID0+IHtcbiAgbGV0IGRlZmluaXRpb24gPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tDb21wb25lbnREZWZpbml0aW9uKTtcbiAgbGV0IGludm9jYXRpb24gPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tJbnZvY2F0aW9uKTtcblxuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuICBsZXQgY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhkZWZpbml0aW9uLnN0YXRlKSk7XG5cbiAgbGV0IHN0YXRlOiBQb3B1bGF0ZWRDb21wb25lbnRJbnN0YW5jZSA9IHtcbiAgICBbQ09NUE9ORU5UX0lOU1RBTkNFXTogdHJ1ZSxcbiAgICBkZWZpbml0aW9uLFxuICAgIG1hbmFnZXIsXG4gICAgY2FwYWJpbGl0aWVzLFxuICAgIHN0YXRlOiBudWxsLFxuICAgIGhhbmRsZTogaW52b2NhdGlvbi5oYW5kbGUsXG4gICAgdGFibGU6IGludm9jYXRpb24uc3ltYm9sVGFibGUsXG4gICAgbG9va3VwOiBudWxsLFxuICB9O1xuXG4gIHZtLmxvYWRWYWx1ZShyZWdpc3Rlciwgc3RhdGUpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Qb3B1bGF0ZUxheW91dCwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuXG4gIGxldCBoYW5kbGUgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tIYW5kbGUpO1xuICBsZXQgdGFibGUgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tQcm9ncmFtU3ltYm9sVGFibGUpO1xuXG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG5cbiAgc3RhdGUuaGFuZGxlID0gaGFuZGxlO1xuICBzdGF0ZS50YWJsZSA9IHRhYmxlO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5WaXJ0dWFsUm9vdFNjb3BlLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBzeW1ib2xzIH0gPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSkudGFibGU7XG5cbiAgdm0ucHVzaFJvb3RTY29wZShzeW1ib2xzLmxlbmd0aCArIDEpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TZXR1cEZvckV2YWwsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKTtcblxuICBpZiAoc3RhdGUudGFibGUuaGFzRXZhbCkge1xuICAgIGxldCBsb29rdXAgPSAoc3RhdGUubG9va3VwID0gZGljdDxTY29wZVNsb3Q8Sml0T3JBb3RCbG9jaz4+KCkpO1xuICAgIHZtLnNjb3BlKCkuYmluZEV2YWxTY29wZShsb29rdXApO1xuICB9XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlNldE5hbWVkVmFyaWFibGVzLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgc3RhdGUgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCBzY29wZSA9IHZtLnNjb3BlKCk7XG5cbiAgbGV0IGFyZ3MgPSBjaGVjayh2bS5zdGFjay5wZWVrKCksIENoZWNrQXJndW1lbnRzKTtcbiAgbGV0IGNhbGxlck5hbWVzID0gYXJncy5uYW1lZC5hdE5hbWVzO1xuXG4gIGZvciAobGV0IGkgPSBjYWxsZXJOYW1lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGxldCBhdE5hbWUgPSBjYWxsZXJOYW1lc1tpXTtcbiAgICBsZXQgc3ltYm9sID0gc3RhdGUudGFibGUuc3ltYm9scy5pbmRleE9mKGNhbGxlck5hbWVzW2ldKTtcbiAgICBsZXQgdmFsdWUgPSBhcmdzLm5hbWVkLmdldChhdE5hbWUsIHRydWUpO1xuXG4gICAgaWYgKHN5bWJvbCAhPT0gLTEpIHNjb3BlLmJpbmRTeW1ib2woc3ltYm9sICsgMSwgdmFsdWUpO1xuICAgIGlmIChzdGF0ZS5sb29rdXApIHN0YXRlLmxvb2t1cFthdE5hbWVdID0gdmFsdWU7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBiaW5kQmxvY2s8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+KFxuICBzeW1ib2xOYW1lOiBzdHJpbmcsXG4gIGJsb2NrTmFtZTogc3RyaW5nLFxuICBzdGF0ZTogQ29tcG9uZW50SW5zdGFuY2UsXG4gIGJsb2NrczogQmxvY2tBcmd1bWVudHNJbXBsPEM+LFxuICB2bTogSW50ZXJuYWxWTTxDPlxuKSB7XG4gIGxldCBzeW1ib2wgPSBzdGF0ZS50YWJsZS5zeW1ib2xzLmluZGV4T2Yoc3ltYm9sTmFtZSk7XG5cbiAgbGV0IGJsb2NrID0gYmxvY2tzLmdldChibG9ja05hbWUpO1xuXG4gIGlmIChzeW1ib2wgIT09IC0xKSB7XG4gICAgdm0uc2NvcGUoKS5iaW5kQmxvY2soc3ltYm9sICsgMSwgYmxvY2spO1xuICB9XG5cbiAgaWYgKHN0YXRlLmxvb2t1cCkgc3RhdGUubG9va3VwW3N5bWJvbE5hbWVdID0gYmxvY2s7XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TZXRCbG9ja3MsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHsgYmxvY2tzIH0gPSBjaGVjayh2bS5zdGFjay5wZWVrKCksIENoZWNrQXJndW1lbnRzKTtcblxuICBiaW5kQmxvY2soJyZhdHRycycsICdhdHRycycsIHN0YXRlLCBibG9ja3MsIHZtKTtcbiAgYmluZEJsb2NrKCcmZWxzZScsICdlbHNlJywgc3RhdGUsIGJsb2Nrcywgdm0pO1xuICBiaW5kQmxvY2soJyZkZWZhdWx0JywgJ21haW4nLCBzdGF0ZSwgYmxvY2tzLCB2bSk7XG59KTtcblxuLy8gRHluYW1pYyBJbnZvY2F0aW9uIE9ubHlcbkFQUEVORF9PUENPREVTLmFkZChPcC5JbnZva2VDb21wb25lbnRMYXlvdXQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKTtcblxuICB2bS5jYWxsKHN0YXRlLmhhbmRsZSEpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5EaWRSZW5kZXJMYXlvdXQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IG1hbmFnZXIsIHN0YXRlLCBjYXBhYmlsaXRpZXMgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCBib3VuZHMgPSB2bS5lbGVtZW50cygpLnBvcEJsb2NrKCk7XG5cbiAgaWYgKCFtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuQ3JlYXRlSW5zdGFuY2UpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBCVUdgKTtcbiAgfVxuXG4gIGxldCBtZ3IgPSBjaGVjayhtYW5hZ2VyLCBDaGVja0ludGVyZmFjZSh7IGRpZFJlbmRlckxheW91dDogQ2hlY2tGdW5jdGlvbiB9KSk7XG5cbiAgbWdyLmRpZFJlbmRlckxheW91dChzdGF0ZSwgYm91bmRzKTtcblxuICB2bS5lbnYuZGlkQ3JlYXRlKHN0YXRlLCBtYW5hZ2VyKTtcblxuICB2bS51cGRhdGVXaXRoKG5ldyBEaWRVcGRhdGVMYXlvdXRPcGNvZGUobWFuYWdlciwgc3RhdGUsIGJvdW5kcykpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Db21taXRDb21wb25lbnRUcmFuc2FjdGlvbiwgdm0gPT4ge1xuICB2bS5jb21taXRDYWNoZUdyb3VwKCk7XG59KTtcblxuZXhwb3J0IGNsYXNzIFVwZGF0ZUNvbXBvbmVudE9wY29kZSBleHRlbmRzIFVwZGF0aW5nT3Bjb2RlIHtcbiAgcHVibGljIHR5cGUgPSAndXBkYXRlLWNvbXBvbmVudCc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHRhZzogVGFnLFxuICAgIHByaXZhdGUgY29tcG9uZW50OiBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICAgIHByaXZhdGUgbWFuYWdlcjogV2l0aFVwZGF0ZUhvb2ssXG4gICAgcHJpdmF0ZSBkeW5hbWljU2NvcGU6IE9wdGlvbjxEeW5hbWljU2NvcGU+XG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBldmFsdWF0ZShfdm06IFVwZGF0aW5nVk0pIHtcbiAgICBsZXQgeyBjb21wb25lbnQsIG1hbmFnZXIsIGR5bmFtaWNTY29wZSB9ID0gdGhpcztcblxuICAgIG1hbmFnZXIudXBkYXRlKGNvbXBvbmVudCwgZHluYW1pY1Njb3BlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlkVXBkYXRlTGF5b3V0T3Bjb2RlIGV4dGVuZHMgVXBkYXRpbmdPcGNvZGUge1xuICBwdWJsaWMgdHlwZSA9ICdkaWQtdXBkYXRlLWxheW91dCc7XG4gIHB1YmxpYyB0YWc6IFRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSxcbiAgICBwcml2YXRlIGNvbXBvbmVudDogQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSxcbiAgICBwcml2YXRlIGJvdW5kczogQm91bmRzXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIGxldCB7IG1hbmFnZXIsIGNvbXBvbmVudCwgYm91bmRzIH0gPSB0aGlzO1xuXG4gICAgbWFuYWdlci5kaWRVcGRhdGVMYXlvdXQoY29tcG9uZW50LCBib3VuZHMpO1xuXG4gICAgdm0uZW52LmRpZFVwZGF0ZShjb21wb25lbnQsIG1hbmFnZXIpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBPcCwgSml0T3JBb3RCbG9jaywgU2NvcGUgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFZlcnNpb25lZFBhdGhSZWZlcmVuY2UgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgZGljdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgQVBQRU5EX09QQ09ERVMgfSBmcm9tICcuLi8uLi9vcGNvZGVzJztcbmltcG9ydCB7IENPTlNUQU5UUyB9IGZyb20gJy4uLy4uL3N5bWJvbHMnO1xuXG5leHBvcnQgdHlwZSBEZWJ1Z0dldCA9IChwYXRoOiBzdHJpbmcpID0+IHVua25vd247XG5cbmV4cG9ydCB0eXBlIERlYnVnQ2FsbGJhY2sgPSAoY29udGV4dDogdW5rbm93biwgZ2V0OiBEZWJ1Z0dldCkgPT4gdm9pZDtcblxuZnVuY3Rpb24gZGVidWdDYWxsYmFjayhjb250ZXh0OiB1bmtub3duLCBnZXQ6IERlYnVnR2V0KTogdm9pZCB7XG4gIGNvbnNvbGUuaW5mbygnVXNlIGBjb250ZXh0YCwgYW5kIGBnZXQoPHBhdGg+KWAgdG8gZGVidWcgdGhpcyB0ZW1wbGF0ZS4nKTtcblxuICAvLyBmb3IgZXhhbXBsZS4uLlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLWV4cHJlc3Npb25zXG4gIGNvbnRleHQgPT09IGdldCgndGhpcycpO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1kZWJ1Z2dlclxuICBkZWJ1Z2dlcjtcbn1cblxubGV0IGNhbGxiYWNrID0gZGVidWdDYWxsYmFjaztcblxuLy8gRm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBmdW5jdGlvbiBzZXREZWJ1Z2dlckNhbGxiYWNrKGNiOiBEZWJ1Z0NhbGxiYWNrKSB7XG4gIGNhbGxiYWNrID0gY2I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERlYnVnZ2VyQ2FsbGJhY2soKSB7XG4gIGNhbGxiYWNrID0gZGVidWdDYWxsYmFjaztcbn1cblxuY2xhc3MgU2NvcGVJbnNwZWN0b3I8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IHtcbiAgcHJpdmF0ZSBsb2NhbHMgPSBkaWN0PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBzY29wZTogU2NvcGU8Qz4sIHN5bWJvbHM6IHN0cmluZ1tdLCBldmFsSW5mbzogbnVtYmVyW10pIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2YWxJbmZvLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgc2xvdCA9IGV2YWxJbmZvW2ldO1xuICAgICAgbGV0IG5hbWUgPSBzeW1ib2xzW3Nsb3QgLSAxXTtcbiAgICAgIGxldCByZWYgPSBzY29wZS5nZXRTeW1ib2woc2xvdCk7XG4gICAgICB0aGlzLmxvY2Fsc1tuYW1lXSA9IHJlZjtcbiAgICB9XG4gIH1cblxuICBnZXQocGF0aDogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgbGV0IHsgc2NvcGUsIGxvY2FscyB9ID0gdGhpcztcbiAgICBsZXQgcGFydHMgPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgbGV0IFtoZWFkLCAuLi50YWlsXSA9IHBhdGguc3BsaXQoJy4nKTtcblxuICAgIGxldCBldmFsU2NvcGUgPSBzY29wZS5nZXRFdmFsU2NvcGUoKSE7XG4gICAgbGV0IHJlZjogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPjtcblxuICAgIGlmIChoZWFkID09PSAndGhpcycpIHtcbiAgICAgIHJlZiA9IHNjb3BlLmdldFNlbGYoKTtcbiAgICB9IGVsc2UgaWYgKGxvY2Fsc1toZWFkXSkge1xuICAgICAgcmVmID0gbG9jYWxzW2hlYWRdO1xuICAgIH0gZWxzZSBpZiAoaGVhZC5pbmRleE9mKCdAJykgPT09IDAgJiYgZXZhbFNjb3BlW2hlYWRdKSB7XG4gICAgICByZWYgPSBldmFsU2NvcGVbaGVhZF0gYXMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVmID0gdGhpcy5zY29wZS5nZXRTZWxmKCk7XG4gICAgICB0YWlsID0gcGFydHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhaWwucmVkdWNlKChyLCBwYXJ0KSA9PiByLmdldChwYXJ0KSwgcmVmKTtcbiAgfVxufVxuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuRGVidWdnZXIsICh2bSwgeyBvcDE6IF9zeW1ib2xzLCBvcDI6IF9ldmFsSW5mbyB9KSA9PiB7XG4gIGxldCBzeW1ib2xzID0gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmdBcnJheShfc3ltYm9scyk7XG4gIGxldCBldmFsSW5mbyA9IHZtW0NPTlNUQU5UU10uZ2V0QXJyYXkoX2V2YWxJbmZvKTtcbiAgbGV0IGluc3BlY3RvciA9IG5ldyBTY29wZUluc3BlY3Rvcih2bS5zY29wZSgpLCBzeW1ib2xzLCBldmFsSW5mbyk7XG4gIGNhbGxiYWNrKHZtLmdldFNlbGYoKS52YWx1ZSgpLCBwYXRoID0+IGluc3BlY3Rvci5nZXQocGF0aCkudmFsdWUoKSk7XG59KTtcbiIsImltcG9ydCB7IFZlcnNpb25lZFBhdGhSZWZlcmVuY2UgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgQVBQRU5EX09QQ09ERVMgfSBmcm9tICcuLi8uLi9vcGNvZGVzJztcbmltcG9ydCB7IFBhcnRpYWxEZWZpbml0aW9uIH0gZnJvbSAnQGdsaW1tZXIvb3Bjb2RlLWNvbXBpbGVyJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdAZ2xpbW1lci9kZWJ1Zyc7XG5pbXBvcnQgeyBPcCwgRGljdCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQ2hlY2tSZWZlcmVuY2UgfSBmcm9tICcuLy1kZWJ1Zy1zdHJpcCc7XG5pbXBvcnQgeyBDT05TVEFOVFMgfSBmcm9tICcuLi8uLi9zeW1ib2xzJztcblxuQVBQRU5EX09QQ09ERVMuYWRkKFxuICBPcC5JbnZva2VQYXJ0aWFsLFxuICAodm0sIHsgb3AxOiBfbWV0YSwgb3AyOiBfc3ltYm9scywgb3AzOiBfZXZhbEluZm8gfSkgPT4ge1xuICAgIGxldCB7IFtDT05TVEFOVFNdOiBjb25zdGFudHMsIHN0YWNrIH0gPSB2bTtcblxuICAgIGxldCBuYW1lID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrUmVmZXJlbmNlKS52YWx1ZSgpO1xuICAgIGFzc2VydCh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycsIGBDb3VsZCBub3QgZmluZCBhIHBhcnRpYWwgbmFtZWQgXCIke1N0cmluZyhuYW1lKX1cImApO1xuXG4gICAgbGV0IG1ldGEgPSBjb25zdGFudHMuZ2V0VGVtcGxhdGVNZXRhKF9tZXRhKTtcbiAgICBsZXQgb3V0ZXJTeW1ib2xzID0gY29uc3RhbnRzLmdldFN0cmluZ0FycmF5KF9zeW1ib2xzKTtcbiAgICBsZXQgZXZhbEluZm8gPSBjb25zdGFudHMuZ2V0QXJyYXkoX2V2YWxJbmZvKTtcblxuICAgIGxldCBoYW5kbGUgPSB2bS5ydW50aW1lLnJlc29sdmVyLmxvb2t1cFBhcnRpYWwobmFtZSBhcyBzdHJpbmcsIG1ldGEpO1xuXG4gICAgYXNzZXJ0KGhhbmRsZSAhPT0gbnVsbCwgYENvdWxkIG5vdCBmaW5kIGEgcGFydGlhbCBuYW1lZCBcIiR7bmFtZX1cImApO1xuXG4gICAgbGV0IGRlZmluaXRpb24gPSB2bS5ydW50aW1lLnJlc29sdmVyLnJlc29sdmU8UGFydGlhbERlZmluaXRpb24+KGhhbmRsZSEpO1xuXG4gICAgbGV0IHsgc3ltYm9sVGFibGUsIGhhbmRsZTogdm1IYW5kbGUgfSA9IGRlZmluaXRpb24uZ2V0UGFydGlhbCh2bS5jb250ZXh0KTtcblxuICAgIHtcbiAgICAgIGxldCBwYXJ0aWFsU3ltYm9scyA9IHN5bWJvbFRhYmxlLnN5bWJvbHM7XG4gICAgICBsZXQgb3V0ZXJTY29wZSA9IHZtLnNjb3BlKCk7XG4gICAgICBsZXQgcGFydGlhbFNjb3BlID0gdm0ucHVzaFJvb3RTY29wZShwYXJ0aWFsU3ltYm9scy5sZW5ndGgpO1xuICAgICAgbGV0IGV2YWxTY29wZSA9IG91dGVyU2NvcGUuZ2V0RXZhbFNjb3BlKCk7XG4gICAgICBwYXJ0aWFsU2NvcGUuYmluZEV2YWxTY29wZShldmFsU2NvcGUpO1xuICAgICAgcGFydGlhbFNjb3BlLmJpbmRTZWxmKG91dGVyU2NvcGUuZ2V0U2VsZigpKTtcblxuICAgICAgbGV0IGxvY2FscyA9IE9iamVjdC5jcmVhdGUob3V0ZXJTY29wZS5nZXRQYXJ0aWFsTWFwKCkpIGFzIERpY3Q8XG4gICAgICAgIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj5cbiAgICAgID47XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZhbEluZm8ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHNsb3QgPSBldmFsSW5mb1tpXTtcbiAgICAgICAgbGV0IG5hbWUgPSBvdXRlclN5bWJvbHNbc2xvdCAtIDFdO1xuICAgICAgICBsZXQgcmVmID0gb3V0ZXJTY29wZS5nZXRTeW1ib2woc2xvdCk7XG4gICAgICAgIGxvY2Fsc1tuYW1lXSA9IHJlZjtcbiAgICAgIH1cblxuICAgICAgaWYgKGV2YWxTY29wZSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRpYWxTeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IG5hbWUgPSBwYXJ0aWFsU3ltYm9sc1tpXTtcbiAgICAgICAgICBsZXQgc3ltYm9sID0gaSArIDE7XG4gICAgICAgICAgbGV0IHZhbHVlID0gZXZhbFNjb3BlW25hbWVdO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHBhcnRpYWxTY29wZS5iaW5kKHN5bWJvbCwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHBhcnRpYWxTY29wZS5iaW5kUGFydGlhbE1hcChsb2NhbHMpO1xuXG4gICAgICB2bS5wdXNoRnJhbWUoKTsgLy8gc3AgKz0gMlxuICAgICAgdm0uY2FsbCh2bUhhbmRsZSEpO1xuICAgIH1cbiAgfSxcbiAgJ2ppdCdcbik7XG4iLCJpbXBvcnQgeyBJdGVyYXRpb25BcnRpZmFjdHMsIFJlZmVyZW5jZSwgUmVmZXJlbmNlSXRlcmF0b3IsIFRhZyB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUyB9IGZyb20gJy4uLy4uL29wY29kZXMnO1xuaW1wb3J0IHsgQ2hlY2tQYXRoUmVmZXJlbmNlIH0gZnJvbSAnLi8tZGVidWctc3RyaXAnO1xuaW1wb3J0IHsgY2hlY2ssIENoZWNrSW5zdGFuY2VvZiB9IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcbmltcG9ydCB7IE9wIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmNsYXNzIEl0ZXJhYmxlUHJlc2VuY2VSZWZlcmVuY2UgaW1wbGVtZW50cyBSZWZlcmVuY2U8Ym9vbGVhbj4ge1xuICBwdWJsaWMgdGFnOiBUYWc7XG4gIHByaXZhdGUgYXJ0aWZhY3RzOiBJdGVyYXRpb25BcnRpZmFjdHM7XG5cbiAgY29uc3RydWN0b3IoYXJ0aWZhY3RzOiBJdGVyYXRpb25BcnRpZmFjdHMpIHtcbiAgICB0aGlzLnRhZyA9IGFydGlmYWN0cy50YWc7XG4gICAgdGhpcy5hcnRpZmFjdHMgPSBhcnRpZmFjdHM7XG4gIH1cblxuICB2YWx1ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuYXJ0aWZhY3RzLmlzRW1wdHkoKTtcbiAgfVxufVxuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHV0SXRlcmF0b3IsIHZtID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIGxldCBsaXN0UmVmID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrUGF0aFJlZmVyZW5jZSk7XG4gIGxldCBrZXkgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKTtcbiAgbGV0IGl0ZXJhYmxlID0gdm0uZW52Lml0ZXJhYmxlRm9yKGxpc3RSZWYsIGtleS52YWx1ZSgpKTtcbiAgbGV0IGl0ZXJhdG9yID0gbmV3IFJlZmVyZW5jZUl0ZXJhdG9yKGl0ZXJhYmxlKTtcblxuICBzdGFjay5wdXNoKGl0ZXJhdG9yKTtcbiAgc3RhY2sucHVzaChuZXcgSXRlcmFibGVQcmVzZW5jZVJlZmVyZW5jZShpdGVyYXRvci5hcnRpZmFjdHMpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuRW50ZXJMaXN0LCAodm0sIHsgb3AxOiByZWxhdGl2ZVN0YXJ0IH0pID0+IHtcbiAgdm0uZW50ZXJMaXN0KHJlbGF0aXZlU3RhcnQpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5FeGl0TGlzdCwgdm0gPT4ge1xuICB2bS5leGl0TGlzdCgpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5JdGVyYXRlLCAodm0sIHsgb3AxOiBicmVha3MgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IGl0ZW0gPSBjaGVjayhzdGFjay5wZWVrKCksIENoZWNrSW5zdGFuY2VvZihSZWZlcmVuY2VJdGVyYXRvcikpLm5leHQoKTtcblxuICBpZiAoaXRlbSkge1xuICAgIGxldCB0cnlPcGNvZGUgPSB2bS5pdGVyYXRlKGl0ZW0ubWVtbywgaXRlbS52YWx1ZSk7XG4gICAgdm0uZW50ZXJJdGVtKGl0ZW0ua2V5LCB0cnlPcGNvZGUpO1xuICB9IGVsc2Uge1xuICAgIHZtLmdvdG8oYnJlYWtzKTtcbiAgfVxufSk7XG4iLCJpbXBvcnQge1xuICBDb21wb25lbnRDYXBhYmlsaXRpZXMsXG4gIENvbXBvbmVudERlZmluaXRpb25TdGF0ZSxcbiAgQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSxcbiAgQ29tcG9uZW50TWFuYWdlcixcbiAgV2l0aEFvdER5bmFtaWNMYXlvdXQsXG4gIFdpdGhBb3RTdGF0aWNMYXlvdXQsXG4gIFdpdGhKaXREeW5hbWljTGF5b3V0LFxuICBXaXRoSml0U3RhdGljTGF5b3V0LFxuICBKaXRSdW50aW1lUmVzb2x2ZXIsXG4gIFJ1bnRpbWVSZXNvbHZlcixcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNTdGF0aWNMYXlvdXQ8XG4gIEQgZXh0ZW5kcyBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsXG4gIEkgZXh0ZW5kcyBDb21wb25lbnRJbnN0YW5jZVN0YXRlXG4+KFxuICBzdGF0ZTogRCxcbiAgbWFuYWdlcjogQ29tcG9uZW50TWFuYWdlcjxJLCBEPlxuKTogbWFuYWdlciBpc1xuICB8IFdpdGhBb3RTdGF0aWNMYXlvdXQ8SSwgRCwgUnVudGltZVJlc29sdmVyPlxuICB8IFdpdGhKaXRTdGF0aWNMYXlvdXQ8SSwgRCwgSml0UnVudGltZVJlc29sdmVyPiB7XG4gIHJldHVybiBtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhzdGF0ZSkuZHluYW1pY0xheW91dCA9PT0gZmFsc2U7XG59XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNEeW5hbWljTGF5b3V0PFxuICBEIGV4dGVuZHMgQ29tcG9uZW50RGVmaW5pdGlvblN0YXRlLFxuICBJIGV4dGVuZHMgQ29tcG9uZW50SW5zdGFuY2VTdGF0ZVxuPihcbiAgc3RhdGU6IEQsXG4gIG1hbmFnZXI6IENvbXBvbmVudE1hbmFnZXI8SSwgRD5cbik6IG1hbmFnZXIgaXMgV2l0aEFvdER5bmFtaWNMYXlvdXQ8SSwgUnVudGltZVJlc29sdmVyPiB8IFdpdGhKaXREeW5hbWljTGF5b3V0PEksIFJ1bnRpbWVSZXNvbHZlcj4ge1xuICByZXR1cm4gbWFuYWdlci5nZXRDYXBhYmlsaXRpZXMoc3RhdGUpLmR5bmFtaWNMYXlvdXQgPT09IHRydWU7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NBUEFCSUxJVElFUzogQ29tcG9uZW50Q2FwYWJpbGl0aWVzID0ge1xuICBkeW5hbWljTGF5b3V0OiB0cnVlLFxuICBkeW5hbWljVGFnOiB0cnVlLFxuICBwcmVwYXJlQXJnczogdHJ1ZSxcbiAgY3JlYXRlQXJnczogdHJ1ZSxcbiAgYXR0cmlidXRlSG9vazogZmFsc2UsXG4gIGVsZW1lbnRIb29rOiBmYWxzZSxcbiAgZHluYW1pY1Njb3BlOiB0cnVlLFxuICBjcmVhdGVDYWxsZXI6IGZhbHNlLFxuICB1cGRhdGVIb29rOiB0cnVlLFxuICBjcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgd3JhcHBlZDogZmFsc2UsXG59O1xuXG5leHBvcnQgY29uc3QgTUlOSU1BTF9DQVBBQklMSVRJRVM6IENvbXBvbmVudENhcGFiaWxpdGllcyA9IHtcbiAgZHluYW1pY0xheW91dDogZmFsc2UsXG4gIGR5bmFtaWNUYWc6IGZhbHNlLFxuICBwcmVwYXJlQXJnczogZmFsc2UsXG4gIGNyZWF0ZUFyZ3M6IGZhbHNlLFxuICBhdHRyaWJ1dGVIb29rOiBmYWxzZSxcbiAgZWxlbWVudEhvb2s6IGZhbHNlLFxuICBkeW5hbWljU2NvcGU6IGZhbHNlLFxuICBjcmVhdGVDYWxsZXI6IGZhbHNlLFxuICB1cGRhdGVIb29rOiBmYWxzZSxcbiAgY3JlYXRlSW5zdGFuY2U6IGZhbHNlLFxuICB3cmFwcGVkOiBmYWxzZSxcbn07XG4iLCJpbXBvcnQge1xuICBDb21wb25lbnRNYW5hZ2VyLFxuICBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsXG4gIFZNQXJndW1lbnRzLFxuICBDb21wb25lbnRDYXBhYmlsaXRpZXMsXG4gIE9wdGlvbixcbiAgRHluYW1pY1Njb3BlLFxuICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICBQcmVwYXJlZEFyZ3VtZW50cyxcbiAgQm91bmRzLFxuICBTeW1ib2xEZXN0cm95YWJsZSxcbiAgRGVzdHJveWFibGUsXG4gIEVudmlyb25tZW50LFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IE1JTklNQUxfQ0FQQUJJTElUSUVTIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFZlcnNpb25lZFBhdGhSZWZlcmVuY2UsIFRhZyB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBVTkRFRklORURfUkVGRVJFTkNFIH0gZnJvbSAnLi4vcmVmZXJlbmNlcyc7XG5cbmV4cG9ydCBjbGFzcyBTaW1wbGVDb21wb25lbnRNYW5hZ2VyIGltcGxlbWVudHMgQ29tcG9uZW50TWFuYWdlciB7XG4gIGdldENhcGFiaWxpdGllcyhfc3RhdGU6IENvbXBvbmVudERlZmluaXRpb25TdGF0ZSk6IENvbXBvbmVudENhcGFiaWxpdGllcyB7XG4gICAgcmV0dXJuIE1JTklNQUxfQ0FQQUJJTElUSUVTO1xuICB9XG5cbiAgcHJlcGFyZUFyZ3MoX3N0YXRlOiBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsIF9hcmdzOiBWTUFyZ3VtZW50cyk6IE9wdGlvbjxQcmVwYXJlZEFyZ3VtZW50cz4ge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5pbXBsZW1lbnRlZCBwcmVwYXJlQXJncyBpbiBTaW1wbGVDb21wb25lbnRNYW5hZ2VyYCk7XG4gIH1cblxuICBjcmVhdGUoXG4gICAgX2VudjogRW52aXJvbm1lbnQsXG4gICAgX3N0YXRlOiBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsXG4gICAgX2FyZ3M6IE9wdGlvbjxWTUFyZ3VtZW50cz4sXG4gICAgX2R5bmFtaWNTY29wZTogT3B0aW9uPER5bmFtaWNTY29wZT4sXG4gICAgX2NhbGxlcjogT3B0aW9uPFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+LFxuICAgIF9oYXNEZWZhdWx0QmxvY2s6IGJvb2xlYW5cbiAgKTogQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmltcGxlbWVudGVkIGNyZWF0ZSBpbiBTaW1wbGVDb21wb25lbnRNYW5hZ2VyYCk7XG4gIH1cblxuICBnZXRTZWxmKF9zdGF0ZTogQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2Uge1xuICAgIHJldHVybiBVTkRFRklORURfUkVGRVJFTkNFO1xuICB9XG5cbiAgZ2V0VGFnKF9zdGF0ZTogQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSk6IFRhZyB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmltcGxlbWVudGVkIGdldFRhZyBpbiBTaW1wbGVDb21wb25lbnRNYW5hZ2VyYCk7XG4gIH1cblxuICBkaWRSZW5kZXJMYXlvdXQoX3N0YXRlOiBDb21wb25lbnRJbnN0YW5jZVN0YXRlLCBfYm91bmRzOiBCb3VuZHMpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuaW1wbGVtZW50ZWQgZGlkUmVuZGVyTGF5b3V0IGluIFNpbXBsZUNvbXBvbmVudE1hbmFnZXJgKTtcbiAgfVxuXG4gIGRpZENyZWF0ZShfc3RhdGU6IENvbXBvbmVudEluc3RhbmNlU3RhdGUpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuaW1wbGVtZW50ZWQgZGlkQ3JlYXRlIGluIFNpbXBsZUNvbXBvbmVudE1hbmFnZXJgKTtcbiAgfVxuXG4gIHVwZGF0ZShfc3RhdGU6IENvbXBvbmVudEluc3RhbmNlU3RhdGUsIF9keW5hbWljU2NvcGU6IE9wdGlvbjxEeW5hbWljU2NvcGU+KTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmltcGxlbWVudGVkIHVwZGF0ZSBpbiBTaW1wbGVDb21wb25lbnRNYW5hZ2VyYCk7XG4gIH1cblxuICBkaWRVcGRhdGVMYXlvdXQoX3N0YXRlOiBDb21wb25lbnRJbnN0YW5jZVN0YXRlLCBfYm91bmRzOiBCb3VuZHMpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuaW1wbGVtZW50ZWQgZGlkVXBkYXRlTGF5b3V0IGluIFNpbXBsZUNvbXBvbmVudE1hbmFnZXJgKTtcbiAgfVxuXG4gIGRpZFVwZGF0ZShfc3RhdGU6IENvbXBvbmVudEluc3RhbmNlU3RhdGUpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuaW1wbGVtZW50ZWQgZGlkVXBkYXRlIGluIFNpbXBsZUNvbXBvbmVudE1hbmFnZXJgKTtcbiAgfVxuXG4gIGdldERlc3RydWN0b3IoX3N0YXRlOiBDb21wb25lbnRJbnN0YW5jZVN0YXRlKTogT3B0aW9uPFN5bWJvbERlc3Ryb3lhYmxlIHwgRGVzdHJveWFibGU+IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVEVNUExBVEVfT05MWV9DT01QT05FTlQgPSB7XG4gIHN0YXRlOiBudWxsLFxuICBtYW5hZ2VyOiBuZXcgU2ltcGxlQ29tcG9uZW50TWFuYWdlcigpLFxufTtcbiIsImltcG9ydCB7IER5bmFtaWNTY29wZSwgRGljdCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzaWduIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBQYXRoUmVmZXJlbmNlIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcblxuZXhwb3J0IGNsYXNzIERlZmF1bHREeW5hbWljU2NvcGUgaW1wbGVtZW50cyBEeW5hbWljU2NvcGUge1xuICBwcml2YXRlIGJ1Y2tldDogRGljdDxQYXRoUmVmZXJlbmNlPjtcblxuICBjb25zdHJ1Y3RvcihidWNrZXQ/OiBEaWN0PFBhdGhSZWZlcmVuY2U+KSB7XG4gICAgaWYgKGJ1Y2tldCkge1xuICAgICAgdGhpcy5idWNrZXQgPSBhc3NpZ24oe30sIGJ1Y2tldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVja2V0ID0ge307XG4gICAgfVxuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogUGF0aFJlZmVyZW5jZSB7XG4gICAgcmV0dXJuIHRoaXMuYnVja2V0W2tleV07XG4gIH1cblxuICBzZXQoa2V5OiBzdHJpbmcsIHJlZmVyZW5jZTogUGF0aFJlZmVyZW5jZSk6IFBhdGhSZWZlcmVuY2Uge1xuICAgIHJldHVybiAodGhpcy5idWNrZXRba2V5XSA9IHJlZmVyZW5jZSk7XG4gIH1cblxuICBjaGlsZCgpOiBEZWZhdWx0RHluYW1pY1Njb3BlIHtcbiAgICByZXR1cm4gbmV3IERlZmF1bHREeW5hbWljU2NvcGUodGhpcy5idWNrZXQpO1xuICB9XG59XG4iLCJpbXBvcnQge1xuICBUYWcsXG4gIFVwZGF0YWJsZVRhZyxcbiAgUGF0aFJlZmVyZW5jZSxcbiAgY29tYmluZSxcbiAgY3JlYXRlVXBkYXRhYmxlVGFnLFxuICB1cGRhdGUsXG59IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBEeW5hbWljU2NvcGUsIFZNIGFzIFB1YmxpY1ZNLCBWTUFyZ3VtZW50cywgSGVscGVyIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmNsYXNzIER5bmFtaWNWYXJSZWZlcmVuY2UgaW1wbGVtZW50cyBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgcHVibGljIHRhZzogVGFnO1xuICBwcml2YXRlIHZhclRhZzogVXBkYXRhYmxlVGFnO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc2NvcGU6IER5bmFtaWNTY29wZSwgcHJpdmF0ZSBuYW1lUmVmOiBQYXRoUmVmZXJlbmNlPHVua25vd24+KSB7XG4gICAgbGV0IHZhclRhZyA9ICh0aGlzLnZhclRhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpKTtcbiAgICB0aGlzLnRhZyA9IGNvbWJpbmUoW25hbWVSZWYudGFnLCB2YXJUYWddKTtcbiAgfVxuXG4gIHZhbHVlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLmdldFZhcigpLnZhbHVlKCk7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRWYXIoKS5nZXQoa2V5KTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VmFyKCk6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4ge1xuICAgIGxldCBuYW1lID0gU3RyaW5nKHRoaXMubmFtZVJlZi52YWx1ZSgpKTtcbiAgICBsZXQgcmVmID0gdGhpcy5zY29wZS5nZXQobmFtZSk7XG5cbiAgICB1cGRhdGUodGhpcy52YXJUYWcsIHJlZi50YWcpO1xuXG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREeW5hbWljVmFyKGFyZ3M6IFZNQXJndW1lbnRzLCB2bTogUHVibGljVk0pOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgbGV0IHNjb3BlID0gdm0uZHluYW1pY1Njb3BlKCk7XG4gIGxldCBuYW1lUmVmID0gYXJncy5wb3NpdGlvbmFsLmF0KDApO1xuXG4gIHJldHVybiBuZXcgRHluYW1pY1ZhclJlZmVyZW5jZShzY29wZSwgbmFtZVJlZik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldER5bmFtaWNWYXIgYXMgSGVscGVyO1xuIiwiaW1wb3J0IHsgRXZhbHVhdGlvblN0YWNrIH0gZnJvbSAnLi9zdGFjayc7XG5pbXBvcnQgeyBkaWN0LCBFTVBUWV9BUlJBWSB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgY29tYmluZVRhZ2dlZCB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQge1xuICBEaWN0LFxuICBPcHRpb24sXG4gIHVuc2FmZSxcbiAgQmxvY2tTeW1ib2xUYWJsZSxcbiAgVk1Bcmd1bWVudHMsXG4gIENhcHR1cmVkQXJndW1lbnRzLFxuICBQb3NpdGlvbmFsQXJndW1lbnRzLFxuICBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHMsXG4gIE5hbWVkQXJndW1lbnRzLFxuICBDYXB0dXJlZE5hbWVkQXJndW1lbnRzLFxuICBKaXRPckFvdEJsb2NrLFxuICBCbG9ja1ZhbHVlLFxuICBTY29wZUJsb2NrLFxuICBDYXB0dXJlZEJsb2NrQXJndW1lbnRzLFxuICBTY29wZSxcbiAgQmxvY2tBcmd1bWVudHMsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgVGFnLCBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLCBDT05TVEFOVF9UQUcgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgUHJpbWl0aXZlUmVmZXJlbmNlLCBVTkRFRklORURfUkVGRVJFTkNFIH0gZnJvbSAnLi4vcmVmZXJlbmNlcyc7XG5pbXBvcnQgeyBDaGVja0Jsb2NrU3ltYm9sVGFibGUsIGNoZWNrLCBDaGVja0hhbmRsZSwgQ2hlY2tPcHRpb24sIENoZWNrT3IgfSBmcm9tICdAZ2xpbW1lci9kZWJ1Zyc7XG5pbXBvcnQge1xuICBDaGVja1BhdGhSZWZlcmVuY2UsXG4gIENoZWNrQ29tcGlsYWJsZUJsb2NrLFxuICBDaGVja1Njb3BlLFxufSBmcm9tICcuLi9jb21waWxlZC9vcGNvZGVzLy1kZWJ1Zy1zdHJpcCc7XG5pbXBvcnQgeyBSRUdJU1RFUlMgfSBmcm9tICcuLi9zeW1ib2xzJztcbmltcG9ydCB7ICRzcCB9IGZyb20gJ0BnbGltbWVyL3ZtJztcblxuLypcbiAgVGhlIGNhbGxpbmcgY29udmVudGlvbiBpczpcblxuICAqIDAtTiBibG9jayBhcmd1bWVudHMgYXQgdGhlIGJvdHRvbVxuICAqIDAtTiBwb3NpdGlvbmFsIGFyZ3VtZW50cyBuZXh0IChsZWZ0LXRvLXJpZ2h0KVxuICAqIDAtTiBuYW1lZCBhcmd1bWVudHMgbmV4dFxuKi9cblxuZXhwb3J0IGNsYXNzIFZNQXJndW1lbnRzSW1wbCBpbXBsZW1lbnRzIFZNQXJndW1lbnRzIHtcbiAgcHJpdmF0ZSBzdGFjazogT3B0aW9uPEV2YWx1YXRpb25TdGFjaz4gPSBudWxsO1xuICBwdWJsaWMgcG9zaXRpb25hbCA9IG5ldyBQb3NpdGlvbmFsQXJndW1lbnRzSW1wbCgpO1xuICBwdWJsaWMgbmFtZWQgPSBuZXcgTmFtZWRBcmd1bWVudHNJbXBsKCk7XG4gIHB1YmxpYyBibG9ja3MgPSBuZXcgQmxvY2tBcmd1bWVudHNJbXBsKCk7XG5cbiAgZW1wdHkoc3RhY2s6IEV2YWx1YXRpb25TdGFjayk6IHRoaXMge1xuICAgIGxldCBiYXNlID0gc3RhY2tbUkVHSVNURVJTXVskc3BdICsgMTtcblxuICAgIHRoaXMubmFtZWQuZW1wdHkoc3RhY2ssIGJhc2UpO1xuICAgIHRoaXMucG9zaXRpb25hbC5lbXB0eShzdGFjaywgYmFzZSk7XG4gICAgdGhpcy5ibG9ja3MuZW1wdHkoc3RhY2ssIGJhc2UpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXR1cChcbiAgICBzdGFjazogRXZhbHVhdGlvblN0YWNrLFxuICAgIG5hbWVzOiBzdHJpbmdbXSxcbiAgICBibG9ja05hbWVzOiBzdHJpbmdbXSxcbiAgICBwb3NpdGlvbmFsQ291bnQ6IG51bWJlcixcbiAgICBhdE5hbWVzOiBib29sZWFuXG4gICkge1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcblxuICAgIC8qXG4gICAgICAgICAgIHwgLi4uIHwgYmxvY2tzICAgICAgfCBwb3NpdGlvbmFsICB8IG5hbWVkIHxcbiAgICAgICAgICAgfCAuLi4gfCBiMCAgICBiMSAgICB8IHAwIHAxIHAyIHAzIHwgbjAgbjEgfFxuICAgICBpbmRleCB8IC4uLiB8IDQvNS82IDcvOC85IHwgMTAgMTEgMTIgMTMgfCAxNCAxNSB8XG4gICAgICAgICAgICAgICAgICAgXiAgICAgICAgICAgICBeICAgICAgICAgICAgIF4gIF5cbiAgICAgICAgICAgICAgICAgYmJhc2UgICAgICAgICBwYmFzZSAgICAgICBuYmFzZSAgc3BcbiAgICAqL1xuXG4gICAgbGV0IG5hbWVkID0gdGhpcy5uYW1lZDtcbiAgICBsZXQgbmFtZWRDb3VudCA9IG5hbWVzLmxlbmd0aDtcbiAgICBsZXQgbmFtZWRCYXNlID0gc3RhY2tbUkVHSVNURVJTXVskc3BdIC0gbmFtZWRDb3VudCArIDE7XG5cbiAgICBuYW1lZC5zZXR1cChzdGFjaywgbmFtZWRCYXNlLCBuYW1lZENvdW50LCBuYW1lcywgYXROYW1lcyk7XG5cbiAgICBsZXQgcG9zaXRpb25hbCA9IHRoaXMucG9zaXRpb25hbDtcbiAgICBsZXQgcG9zaXRpb25hbEJhc2UgPSBuYW1lZEJhc2UgLSBwb3NpdGlvbmFsQ291bnQ7XG5cbiAgICBwb3NpdGlvbmFsLnNldHVwKHN0YWNrLCBwb3NpdGlvbmFsQmFzZSwgcG9zaXRpb25hbENvdW50KTtcblxuICAgIGxldCBibG9ja3MgPSB0aGlzLmJsb2NrcztcbiAgICBsZXQgYmxvY2tzQ291bnQgPSBibG9ja05hbWVzLmxlbmd0aDtcbiAgICBsZXQgYmxvY2tzQmFzZSA9IHBvc2l0aW9uYWxCYXNlIC0gYmxvY2tzQ291bnQgKiAzO1xuXG4gICAgYmxvY2tzLnNldHVwKHN0YWNrLCBibG9ja3NCYXNlLCBibG9ja3NDb3VudCwgYmxvY2tOYW1lcyk7XG4gIH1cblxuICBnZXQgdGFnKCk6IFRhZyB7XG4gICAgcmV0dXJuIGNvbWJpbmVUYWdnZWQoW3RoaXMucG9zaXRpb25hbCwgdGhpcy5uYW1lZF0pO1xuICB9XG5cbiAgZ2V0IGJhc2UoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja3MuYmFzZTtcbiAgfVxuXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbmFsLmxlbmd0aCArIHRoaXMubmFtZWQubGVuZ3RoICsgdGhpcy5ibG9ja3MubGVuZ3RoICogMztcbiAgfVxuXG4gIGF0PFQgZXh0ZW5kcyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+Pihwb3M6IG51bWJlcik6IFQge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uYWwuYXQ8VD4ocG9zKTtcbiAgfVxuXG4gIHJlYWxsb2Mob2Zmc2V0OiBudW1iZXIpIHtcbiAgICBsZXQgeyBzdGFjayB9ID0gdGhpcztcbiAgICBpZiAob2Zmc2V0ID4gMCAmJiBzdGFjayAhPT0gbnVsbCkge1xuICAgICAgbGV0IHsgcG9zaXRpb25hbCwgbmFtZWQgfSA9IHRoaXM7XG4gICAgICBsZXQgbmV3QmFzZSA9IHBvc2l0aW9uYWwuYmFzZSArIG9mZnNldDtcbiAgICAgIGxldCBsZW5ndGggPSBwb3NpdGlvbmFsLmxlbmd0aCArIG5hbWVkLmxlbmd0aDtcblxuICAgICAgZm9yIChsZXQgaSA9IGxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHN0YWNrLmNvcHkoaSArIHBvc2l0aW9uYWwuYmFzZSwgaSArIG5ld0Jhc2UpO1xuICAgICAgfVxuXG4gICAgICBwb3NpdGlvbmFsLmJhc2UgKz0gb2Zmc2V0O1xuICAgICAgbmFtZWQuYmFzZSArPSBvZmZzZXQ7XG4gICAgICBzdGFja1tSRUdJU1RFUlNdWyRzcF0gKz0gb2Zmc2V0O1xuICAgIH1cbiAgfVxuXG4gIGNhcHR1cmUoKTogQ2FwdHVyZWRBcmd1bWVudHMge1xuICAgIGxldCBwb3NpdGlvbmFsID0gdGhpcy5wb3NpdGlvbmFsLmxlbmd0aCA9PT0gMCA/IEVNUFRZX1BPU0lUSU9OQUwgOiB0aGlzLnBvc2l0aW9uYWwuY2FwdHVyZSgpO1xuICAgIGxldCBuYW1lZCA9IHRoaXMubmFtZWQubGVuZ3RoID09PSAwID8gRU1QVFlfTkFNRUQgOiB0aGlzLm5hbWVkLmNhcHR1cmUoKTtcblxuICAgIHJldHVybiBuZXcgQ2FwdHVyZWRBcmd1bWVudHNJbXBsKHRoaXMudGFnLCBwb3NpdGlvbmFsLCBuYW1lZCwgdGhpcy5sZW5ndGgpO1xuICB9XG5cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgbGV0IHsgc3RhY2ssIGxlbmd0aCB9ID0gdGhpcztcbiAgICBpZiAobGVuZ3RoID4gMCAmJiBzdGFjayAhPT0gbnVsbCkgc3RhY2sucG9wKGxlbmd0aCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBvc2l0aW9uYWxBcmd1bWVudHNJbXBsIGltcGxlbWVudHMgUG9zaXRpb25hbEFyZ3VtZW50cyB7XG4gIHB1YmxpYyBiYXNlID0gMDtcbiAgcHVibGljIGxlbmd0aCA9IDA7XG5cbiAgcHJpdmF0ZSBzdGFjazogRXZhbHVhdGlvblN0YWNrID0gbnVsbCBhcyBhbnk7XG5cbiAgcHJpdmF0ZSBfdGFnOiBPcHRpb248VGFnPiA9IG51bGw7XG4gIHByaXZhdGUgX3JlZmVyZW5jZXM6IE9wdGlvbjxWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+W10+ID0gbnVsbDtcblxuICBlbXB0eShzdGFjazogRXZhbHVhdGlvblN0YWNrLCBiYXNlOiBudW1iZXIpIHtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gICAgdGhpcy5iYXNlID0gYmFzZTtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG5cbiAgICB0aGlzLl90YWcgPSBDT05TVEFOVF9UQUc7XG4gICAgdGhpcy5fcmVmZXJlbmNlcyA9IEVNUFRZX0FSUkFZO1xuICB9XG5cbiAgc2V0dXAoc3RhY2s6IEV2YWx1YXRpb25TdGFjaywgYmFzZTogbnVtYmVyLCBsZW5ndGg6IG51bWJlcikge1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgICB0aGlzLmJhc2UgPSBiYXNlO1xuICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuXG4gICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fdGFnID0gQ09OU1RBTlRfVEFHO1xuICAgICAgdGhpcy5fcmVmZXJlbmNlcyA9IEVNUFRZX0FSUkFZO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl90YWcgPSBudWxsO1xuICAgICAgdGhpcy5fcmVmZXJlbmNlcyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHRhZygpOiBUYWcge1xuICAgIGxldCB0YWcgPSB0aGlzLl90YWc7XG5cbiAgICBpZiAoIXRhZykge1xuICAgICAgdGFnID0gdGhpcy5fdGFnID0gY29tYmluZVRhZ2dlZCh0aGlzLnJlZmVyZW5jZXMpO1xuICAgIH1cblxuICAgIHJldHVybiB0YWc7XG4gIH1cblxuICBhdDxUIGV4dGVuZHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4ocG9zaXRpb246IG51bWJlcik6IFQge1xuICAgIGxldCB7IGJhc2UsIGxlbmd0aCwgc3RhY2sgfSA9IHRoaXM7XG5cbiAgICBpZiAocG9zaXRpb24gPCAwIHx8IHBvc2l0aW9uID49IGxlbmd0aCkge1xuICAgICAgcmV0dXJuIChVTkRFRklORURfUkVGRVJFTkNFIGFzIHVuc2FmZSkgYXMgVDtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hlY2soc3RhY2suZ2V0KHBvc2l0aW9uLCBiYXNlKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKSBhcyBUO1xuICB9XG5cbiAgY2FwdHVyZSgpOiBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHNJbXBsIHtcbiAgICByZXR1cm4gbmV3IENhcHR1cmVkUG9zaXRpb25hbEFyZ3VtZW50c0ltcGwodGhpcy50YWcsIHRoaXMucmVmZXJlbmNlcyk7XG4gIH1cblxuICBwcmVwZW5kKG90aGVyOiBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHMpIHtcbiAgICBsZXQgYWRkaXRpb25zID0gb3RoZXIubGVuZ3RoO1xuXG4gICAgaWYgKGFkZGl0aW9ucyA+IDApIHtcbiAgICAgIGxldCB7IGJhc2UsIGxlbmd0aCwgc3RhY2sgfSA9IHRoaXM7XG5cbiAgICAgIHRoaXMuYmFzZSA9IGJhc2UgPSBiYXNlIC0gYWRkaXRpb25zO1xuICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGggKyBhZGRpdGlvbnM7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWRkaXRpb25zOyBpKyspIHtcbiAgICAgICAgc3RhY2suc2V0KG90aGVyLmF0KGkpLCBpLCBiYXNlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fdGFnID0gbnVsbDtcbiAgICAgIHRoaXMuX3JlZmVyZW5jZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHJlZmVyZW5jZXMoKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPltdIHtcbiAgICBsZXQgcmVmZXJlbmNlcyA9IHRoaXMuX3JlZmVyZW5jZXM7XG5cbiAgICBpZiAoIXJlZmVyZW5jZXMpIHtcbiAgICAgIGxldCB7IHN0YWNrLCBiYXNlLCBsZW5ndGggfSA9IHRoaXM7XG4gICAgICByZWZlcmVuY2VzID0gdGhpcy5fcmVmZXJlbmNlcyA9IHN0YWNrLnNsaWNlQXJyYXk8VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4oXG4gICAgICAgIGJhc2UsXG4gICAgICAgIGJhc2UgKyBsZW5ndGhcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZmVyZW5jZXM7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENhcHR1cmVkUG9zaXRpb25hbEFyZ3VtZW50c0ltcGwgaW1wbGVtZW50cyBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHMge1xuICBzdGF0aWMgZW1wdHkoKTogQ2FwdHVyZWRQb3NpdGlvbmFsQXJndW1lbnRzIHtcbiAgICByZXR1cm4gbmV3IENhcHR1cmVkUG9zaXRpb25hbEFyZ3VtZW50c0ltcGwoQ09OU1RBTlRfVEFHLCBFTVBUWV9BUlJBWSwgMCk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdGFnOiBUYWcsXG4gICAgcHVibGljIHJlZmVyZW5jZXM6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj5bXSxcbiAgICBwdWJsaWMgbGVuZ3RoID0gcmVmZXJlbmNlcy5sZW5ndGhcbiAgKSB7fVxuXG4gIGF0PFQgZXh0ZW5kcyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+Pihwb3NpdGlvbjogbnVtYmVyKTogVCB7XG4gICAgcmV0dXJuIHRoaXMucmVmZXJlbmNlc1twb3NpdGlvbl0gYXMgVDtcbiAgfVxuXG4gIHZhbHVlKCk6IHVua25vd25bXSB7XG4gICAgcmV0dXJuIHRoaXMucmVmZXJlbmNlcy5tYXAodGhpcy52YWx1ZU9mKTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICBsZXQgeyByZWZlcmVuY2VzLCBsZW5ndGggfSA9IHRoaXM7XG5cbiAgICBpZiAobmFtZSA9PT0gJ2xlbmd0aCcpIHtcbiAgICAgIHJldHVybiBQcmltaXRpdmVSZWZlcmVuY2UuY3JlYXRlKGxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBpZHggPSBwYXJzZUludChuYW1lLCAxMCk7XG5cbiAgICAgIGlmIChpZHggPCAwIHx8IGlkeCA+PSBsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVmZXJlbmNlc1tpZHhdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdmFsdWVPZih0aGlzOiB2b2lkLCByZWZlcmVuY2U6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4pOiB1bmtub3duIHtcbiAgICByZXR1cm4gcmVmZXJlbmNlLnZhbHVlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5hbWVkQXJndW1lbnRzSW1wbCBpbXBsZW1lbnRzIE5hbWVkQXJndW1lbnRzIHtcbiAgcHVibGljIGJhc2UgPSAwO1xuICBwdWJsaWMgbGVuZ3RoID0gMDtcblxuICBwcml2YXRlIHN0YWNrITogRXZhbHVhdGlvblN0YWNrO1xuXG4gIHByaXZhdGUgX3JlZmVyZW5jZXM6IE9wdGlvbjxWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+W10+ID0gbnVsbDtcblxuICBwcml2YXRlIF9uYW1lczogT3B0aW9uPHN0cmluZ1tdPiA9IEVNUFRZX0FSUkFZO1xuICBwcml2YXRlIF9hdE5hbWVzOiBPcHRpb248c3RyaW5nW10+ID0gRU1QVFlfQVJSQVk7XG5cbiAgZW1wdHkoc3RhY2s6IEV2YWx1YXRpb25TdGFjaywgYmFzZTogbnVtYmVyKSB7XG4gICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICAgIHRoaXMuYmFzZSA9IGJhc2U7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5fcmVmZXJlbmNlcyA9IEVNUFRZX0FSUkFZO1xuICAgIHRoaXMuX25hbWVzID0gRU1QVFlfQVJSQVk7XG4gICAgdGhpcy5fYXROYW1lcyA9IEVNUFRZX0FSUkFZO1xuICB9XG5cbiAgc2V0dXAoc3RhY2s6IEV2YWx1YXRpb25TdGFjaywgYmFzZTogbnVtYmVyLCBsZW5ndGg6IG51bWJlciwgbmFtZXM6IHN0cmluZ1tdLCBhdE5hbWVzOiBib29sZWFuKSB7XG4gICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICAgIHRoaXMuYmFzZSA9IGJhc2U7XG4gICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG5cbiAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9yZWZlcmVuY2VzID0gRU1QVFlfQVJSQVk7XG4gICAgICB0aGlzLl9uYW1lcyA9IEVNUFRZX0FSUkFZO1xuICAgICAgdGhpcy5fYXROYW1lcyA9IEVNUFRZX0FSUkFZO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZWZlcmVuY2VzID0gbnVsbDtcblxuICAgICAgaWYgKGF0TmFtZXMpIHtcbiAgICAgICAgdGhpcy5fbmFtZXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9hdE5hbWVzID0gbmFtZXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9uYW1lcyA9IG5hbWVzO1xuICAgICAgICB0aGlzLl9hdE5hbWVzID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQgdGFnKCk6IFRhZyB7XG4gICAgcmV0dXJuIGNvbWJpbmVUYWdnZWQodGhpcy5yZWZlcmVuY2VzKTtcbiAgfVxuXG4gIGdldCBuYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgbGV0IG5hbWVzID0gdGhpcy5fbmFtZXM7XG5cbiAgICBpZiAoIW5hbWVzKSB7XG4gICAgICBuYW1lcyA9IHRoaXMuX25hbWVzID0gdGhpcy5fYXROYW1lcyEubWFwKHRoaXMudG9TeW50aGV0aWNOYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZXMhO1xuICB9XG5cbiAgZ2V0IGF0TmFtZXMoKTogc3RyaW5nW10ge1xuICAgIGxldCBhdE5hbWVzID0gdGhpcy5fYXROYW1lcztcblxuICAgIGlmICghYXROYW1lcykge1xuICAgICAgYXROYW1lcyA9IHRoaXMuX2F0TmFtZXMgPSB0aGlzLl9uYW1lcyEubWFwKHRoaXMudG9BdE5hbWUpO1xuICAgIH1cblxuICAgIHJldHVybiBhdE5hbWVzITtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lcy5pbmRleE9mKG5hbWUpICE9PSAtMTtcbiAgfVxuXG4gIGdldDxUIGV4dGVuZHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4obmFtZTogc3RyaW5nLCBhdE5hbWVzID0gZmFsc2UpOiBUIHtcbiAgICBsZXQgeyBiYXNlLCBzdGFjayB9ID0gdGhpcztcblxuICAgIGxldCBuYW1lcyA9IGF0TmFtZXMgPyB0aGlzLmF0TmFtZXMgOiB0aGlzLm5hbWVzO1xuXG4gICAgbGV0IGlkeCA9IG5hbWVzLmluZGV4T2YobmFtZSk7XG5cbiAgICBpZiAoaWR4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIChVTkRFRklORURfUkVGRVJFTkNFIGFzIHVuc2FmZSkgYXMgVDtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhY2suZ2V0PFQ+KGlkeCwgYmFzZSk7XG4gIH1cblxuICBjYXB0dXJlKCk6IENhcHR1cmVkTmFtZWRBcmd1bWVudHMge1xuICAgIHJldHVybiBuZXcgQ2FwdHVyZWROYW1lZEFyZ3VtZW50c0ltcGwodGhpcy50YWcsIHRoaXMubmFtZXMsIHRoaXMucmVmZXJlbmNlcyk7XG4gIH1cblxuICBtZXJnZShvdGhlcjogQ2FwdHVyZWROYW1lZEFyZ3VtZW50cykge1xuICAgIGxldCB7IGxlbmd0aDogZXh0cmFzIH0gPSBvdGhlcjtcblxuICAgIGlmIChleHRyYXMgPiAwKSB7XG4gICAgICBsZXQgeyBuYW1lcywgbGVuZ3RoLCBzdGFjayB9ID0gdGhpcztcbiAgICAgIGxldCB7IG5hbWVzOiBleHRyYU5hbWVzIH0gPSBvdGhlcjtcblxuICAgICAgaWYgKE9iamVjdC5pc0Zyb3plbihuYW1lcykgJiYgbmFtZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIG5hbWVzID0gW107XG4gICAgICB9XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXh0cmFzOyBpKyspIHtcbiAgICAgICAgbGV0IG5hbWUgPSBleHRyYU5hbWVzW2ldO1xuICAgICAgICBsZXQgaWR4ID0gbmFtZXMuaW5kZXhPZihuYW1lKTtcblxuICAgICAgICBpZiAoaWR4ID09PSAtMSkge1xuICAgICAgICAgIGxlbmd0aCA9IG5hbWVzLnB1c2gobmFtZSk7XG4gICAgICAgICAgc3RhY2sucHVzaChvdGhlci5yZWZlcmVuY2VzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgIHRoaXMuX3JlZmVyZW5jZXMgPSBudWxsO1xuICAgICAgdGhpcy5fbmFtZXMgPSBuYW1lcztcbiAgICAgIHRoaXMuX2F0TmFtZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHJlZmVyZW5jZXMoKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPltdIHtcbiAgICBsZXQgcmVmZXJlbmNlcyA9IHRoaXMuX3JlZmVyZW5jZXM7XG5cbiAgICBpZiAoIXJlZmVyZW5jZXMpIHtcbiAgICAgIGxldCB7IGJhc2UsIGxlbmd0aCwgc3RhY2sgfSA9IHRoaXM7XG4gICAgICByZWZlcmVuY2VzID0gdGhpcy5fcmVmZXJlbmNlcyA9IHN0YWNrLnNsaWNlQXJyYXk8VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4oXG4gICAgICAgIGJhc2UsXG4gICAgICAgIGJhc2UgKyBsZW5ndGhcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZmVyZW5jZXM7XG4gIH1cblxuICBwcml2YXRlIHRvU3ludGhldGljTmFtZSh0aGlzOiB2b2lkLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBuYW1lLnNsaWNlKDEpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b0F0TmFtZSh0aGlzOiB2b2lkLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgQCR7bmFtZX1gO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDYXB0dXJlZE5hbWVkQXJndW1lbnRzSW1wbCBpbXBsZW1lbnRzIENhcHR1cmVkTmFtZWRBcmd1bWVudHMge1xuICBwdWJsaWMgbGVuZ3RoOiBudW1iZXI7XG4gIHByaXZhdGUgX21hcDogT3B0aW9uPERpY3Q8VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB0YWc6IFRhZyxcbiAgICBwdWJsaWMgbmFtZXM6IHN0cmluZ1tdLFxuICAgIHB1YmxpYyByZWZlcmVuY2VzOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+W11cbiAgKSB7XG4gICAgdGhpcy5sZW5ndGggPSBuYW1lcy5sZW5ndGg7XG4gICAgdGhpcy5fbWFwID0gbnVsbDtcbiAgfVxuXG4gIGdldCBtYXAoKSB7XG4gICAgbGV0IG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmICghbWFwKSB7XG4gICAgICBsZXQgeyBuYW1lcywgcmVmZXJlbmNlcyB9ID0gdGhpcztcbiAgICAgIG1hcCA9IHRoaXMuX21hcCA9IGRpY3Q8VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4oKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgICBtYXAhW25hbWVdID0gcmVmZXJlbmNlc1tpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFwO1xuICB9XG5cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm5hbWVzLmluZGV4T2YobmFtZSkgIT09IC0xO1xuICB9XG5cbiAgZ2V0PFQgZXh0ZW5kcyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+PihuYW1lOiBzdHJpbmcpOiBUIHtcbiAgICBsZXQgeyBuYW1lcywgcmVmZXJlbmNlcyB9ID0gdGhpcztcbiAgICBsZXQgaWR4ID0gbmFtZXMuaW5kZXhPZihuYW1lKTtcblxuICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICByZXR1cm4gKFVOREVGSU5FRF9SRUZFUkVOQ0UgYXMgdW5zYWZlKSBhcyBUO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVmZXJlbmNlc1tpZHhdIGFzIFQ7XG4gICAgfVxuICB9XG5cbiAgdmFsdWUoKTogRGljdDx1bmtub3duPiB7XG4gICAgbGV0IHsgbmFtZXMsIHJlZmVyZW5jZXMgfSA9IHRoaXM7XG4gICAgbGV0IG91dCA9IGRpY3Q8dW5rbm93bj4oKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBuYW1lID0gbmFtZXNbaV07XG4gICAgICBvdXRbbmFtZV0gPSByZWZlcmVuY2VzW2ldLnZhbHVlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQmxvY2tBcmd1bWVudHNJbXBsPEMgZXh0ZW5kcyBKaXRPckFvdEJsb2NrPiBpbXBsZW1lbnRzIEJsb2NrQXJndW1lbnRzPEM+IHtcbiAgcHJpdmF0ZSBzdGFjayE6IEV2YWx1YXRpb25TdGFjaztcbiAgcHJpdmF0ZSBpbnRlcm5hbFZhbHVlczogT3B0aW9uPG51bWJlcltdPiA9IG51bGw7XG5cbiAgcHVibGljIGludGVybmFsVGFnOiBPcHRpb248VGFnPiA9IG51bGw7XG4gIHB1YmxpYyBuYW1lczogc3RyaW5nW10gPSBFTVBUWV9BUlJBWTtcblxuICBwdWJsaWMgbGVuZ3RoID0gMDtcbiAgcHVibGljIGJhc2UgPSAwO1xuXG4gIGVtcHR5KHN0YWNrOiBFdmFsdWF0aW9uU3RhY2ssIGJhc2U6IG51bWJlcikge1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgICB0aGlzLm5hbWVzID0gRU1QVFlfQVJSQVk7XG4gICAgdGhpcy5iYXNlID0gYmFzZTtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG5cbiAgICB0aGlzLmludGVybmFsVGFnID0gQ09OU1RBTlRfVEFHO1xuICAgIHRoaXMuaW50ZXJuYWxWYWx1ZXMgPSBFTVBUWV9BUlJBWTtcbiAgfVxuXG4gIHNldHVwKHN0YWNrOiBFdmFsdWF0aW9uU3RhY2ssIGJhc2U6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIsIG5hbWVzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgICB0aGlzLm5hbWVzID0gbmFtZXM7XG4gICAgdGhpcy5iYXNlID0gYmFzZTtcbiAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcblxuICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuaW50ZXJuYWxUYWcgPSBDT05TVEFOVF9UQUc7XG4gICAgICB0aGlzLmludGVybmFsVmFsdWVzID0gRU1QVFlfQVJSQVk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW50ZXJuYWxUYWcgPSBudWxsO1xuICAgICAgdGhpcy5pbnRlcm5hbFZhbHVlcyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHZhbHVlcygpOiBCbG9ja1ZhbHVlW10ge1xuICAgIGxldCB2YWx1ZXMgPSB0aGlzLmludGVybmFsVmFsdWVzO1xuXG4gICAgaWYgKCF2YWx1ZXMpIHtcbiAgICAgIGxldCB7IGJhc2UsIGxlbmd0aCwgc3RhY2sgfSA9IHRoaXM7XG4gICAgICB2YWx1ZXMgPSB0aGlzLmludGVybmFsVmFsdWVzID0gc3RhY2suc2xpY2VBcnJheTxudW1iZXI+KGJhc2UsIGJhc2UgKyBsZW5ndGggKiAzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9XG5cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm5hbWVzIS5pbmRleE9mKG5hbWUpICE9PSAtMTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBPcHRpb248U2NvcGVCbG9jazxDPj4ge1xuICAgIGxldCB7IGJhc2UsIHN0YWNrLCBuYW1lcyB9ID0gdGhpcztcblxuICAgIGxldCBpZHggPSBuYW1lcyEuaW5kZXhPZihuYW1lKTtcblxuICAgIGlmIChuYW1lcyEuaW5kZXhPZihuYW1lKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCB0YWJsZSA9IGNoZWNrKHN0YWNrLmdldChpZHggKiAzLCBiYXNlKSwgQ2hlY2tPcHRpb24oQ2hlY2tCbG9ja1N5bWJvbFRhYmxlKSk7XG4gICAgbGV0IHNjb3BlID0gY2hlY2soc3RhY2suZ2V0KGlkeCAqIDMgKyAxLCBiYXNlKSwgQ2hlY2tPcHRpb24oQ2hlY2tTY29wZSkpO1xuICAgIGxldCBoYW5kbGUgPSBjaGVjayhcbiAgICAgIHN0YWNrLmdldChpZHggKiAzICsgMiwgYmFzZSksXG4gICAgICBDaGVja09wdGlvbihDaGVja09yKENoZWNrSGFuZGxlLCBDaGVja0NvbXBpbGFibGVCbG9jaykpXG4gICAgKTtcblxuICAgIHJldHVybiBoYW5kbGUgPT09IG51bGwgPyBudWxsIDogKFtoYW5kbGUsIHNjb3BlISwgdGFibGUhXSBhcyBTY29wZUJsb2NrPEM+KTtcbiAgfVxuXG4gIGNhcHR1cmUoKTogQ2FwdHVyZWRCbG9ja0FyZ3VtZW50cyB7XG4gICAgcmV0dXJuIG5ldyBDYXB0dXJlZEJsb2NrQXJndW1lbnRzSW1wbCh0aGlzLm5hbWVzLCB0aGlzLnZhbHVlcyk7XG4gIH1cbn1cblxuY2xhc3MgQ2FwdHVyZWRCbG9ja0FyZ3VtZW50c0ltcGwgaW1wbGVtZW50cyBDYXB0dXJlZEJsb2NrQXJndW1lbnRzIHtcbiAgcHVibGljIGxlbmd0aDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lczogc3RyaW5nW10sIHB1YmxpYyB2YWx1ZXM6IEJsb2NrVmFsdWVbXSkge1xuICAgIHRoaXMubGVuZ3RoID0gbmFtZXMubGVuZ3RoO1xuICB9XG5cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm5hbWVzLmluZGV4T2YobmFtZSkgIT09IC0xO1xuICB9XG5cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IE9wdGlvbjxTY29wZUJsb2NrPiB7XG4gICAgbGV0IGlkeCA9IHRoaXMubmFtZXMuaW5kZXhPZihuYW1lKTtcblxuICAgIGlmIChpZHggPT09IC0xKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiBbXG4gICAgICB0aGlzLnZhbHVlc1tpZHggKiAzICsgMl0gYXMgbnVtYmVyLFxuICAgICAgdGhpcy52YWx1ZXNbaWR4ICogMyArIDFdIGFzIFNjb3BlPEppdE9yQW90QmxvY2s+LFxuICAgICAgdGhpcy52YWx1ZXNbaWR4ICogM10gYXMgQmxvY2tTeW1ib2xUYWJsZSxcbiAgICBdO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDYXB0dXJlZEFyZ3VtZW50c0ltcGwgaW1wbGVtZW50cyBDYXB0dXJlZEFyZ3VtZW50cyB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB0YWc6IFRhZyxcbiAgICBwdWJsaWMgcG9zaXRpb25hbDogQ2FwdHVyZWRQb3NpdGlvbmFsQXJndW1lbnRzLFxuICAgIHB1YmxpYyBuYW1lZDogQ2FwdHVyZWROYW1lZEFyZ3VtZW50cyxcbiAgICBwdWJsaWMgbGVuZ3RoOiBudW1iZXJcbiAgKSB7fVxuXG4gIHZhbHVlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lZDogdGhpcy5uYW1lZC52YWx1ZSgpLFxuICAgICAgcG9zaXRpb25hbDogdGhpcy5wb3NpdGlvbmFsLnZhbHVlKCksXG4gICAgfTtcbiAgfVxufVxuXG5jb25zdCBFTVBUWV9OQU1FRCA9IG5ldyBDYXB0dXJlZE5hbWVkQXJndW1lbnRzSW1wbChDT05TVEFOVF9UQUcsIEVNUFRZX0FSUkFZLCBFTVBUWV9BUlJBWSk7XG5jb25zdCBFTVBUWV9QT1NJVElPTkFMID0gbmV3IENhcHR1cmVkUG9zaXRpb25hbEFyZ3VtZW50c0ltcGwoQ09OU1RBTlRfVEFHLCBFTVBUWV9BUlJBWSk7XG5leHBvcnQgY29uc3QgRU1QVFlfQVJHUyA9IG5ldyBDYXB0dXJlZEFyZ3VtZW50c0ltcGwoQ09OU1RBTlRfVEFHLCBFTVBUWV9QT1NJVElPTkFMLCBFTVBUWV9OQU1FRCwgMCk7XG4iLCJpbXBvcnQge1xuICBPcHRpb24sXG4gIFJ1bnRpbWVIZWFwLFxuICBNYWNoaW5lT3AsXG4gIFJ1bnRpbWVQcm9ncmFtLFxuICBSdW50aW1lT3AsXG4gIEppdE9yQW90QmxvY2ssXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQVBQRU5EX09QQ09ERVMgfSBmcm9tICcuLi9vcGNvZGVzJztcbmltcG9ydCBWTSBmcm9tICcuL2FwcGVuZCc7XG5pbXBvcnQgeyBERVZNT0RFIH0gZnJvbSAnQGdsaW1tZXIvbG9jYWwtZGVidWctZmxhZ3MnO1xuaW1wb3J0IHsgTWFjaGluZVJlZ2lzdGVyLCAkcGMsICRyYSwgJGZwLCAkc3AgfSBmcm9tICdAZ2xpbW1lci92bSc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBMb3dMZXZlbFJlZ2lzdGVycyB7XG4gIFtNYWNoaW5lUmVnaXN0ZXIucGNdOiBudW1iZXI7XG4gIFtNYWNoaW5lUmVnaXN0ZXIucmFdOiBudW1iZXI7XG4gIFtNYWNoaW5lUmVnaXN0ZXIuc3BdOiBudW1iZXI7XG4gIFtNYWNoaW5lUmVnaXN0ZXIuZnBdOiBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplUmVnaXN0ZXJzKCk6IExvd0xldmVsUmVnaXN0ZXJzIHtcbiAgcmV0dXJuIFswLCAtMSwgMCwgMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplUmVnaXN0ZXJzV2l0aFNQKHNwOiBudW1iZXIpOiBMb3dMZXZlbFJlZ2lzdGVycyB7XG4gIHJldHVybiBbMCwgLTEsIHNwLCAwXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVSZWdpc3RlcnNXaXRoUEMocGM6IG51bWJlcik6IExvd0xldmVsUmVnaXN0ZXJzIHtcbiAgcmV0dXJuIFtwYywgLTEsIDAsIDBdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrIHtcbiAgcHVzaCh2YWx1ZTogbnVtYmVyKTogdm9pZDtcbiAgZ2V0KHBvc2l0aW9uOiBudW1iZXIpOiBudW1iZXI7XG4gIHBvcCgpOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZXJucyB7XG4gIGRlYnVnQmVmb3JlKG9wY29kZTogUnVudGltZU9wKTogdW5rbm93bjtcbiAgZGVidWdBZnRlcihzdGF0ZTogdW5rbm93bik6IHZvaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvd0xldmVsVk0ge1xuICBwdWJsaWMgY3VycmVudE9wU2l6ZSA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHN0YWNrOiBTdGFjayxcbiAgICBwdWJsaWMgaGVhcDogUnVudGltZUhlYXAsXG4gICAgcHVibGljIHByb2dyYW06IFJ1bnRpbWVQcm9ncmFtLFxuICAgIHB1YmxpYyBleHRlcm5zOiBFeHRlcm5zLFxuICAgIHJlYWRvbmx5IHJlZ2lzdGVyczogTG93TGV2ZWxSZWdpc3RlcnNcbiAgKSB7fVxuXG4gIGZldGNoUmVnaXN0ZXIocmVnaXN0ZXI6IE1hY2hpbmVSZWdpc3Rlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJzW3JlZ2lzdGVyXTtcbiAgfVxuXG4gIGxvYWRSZWdpc3RlcihyZWdpc3RlcjogTWFjaGluZVJlZ2lzdGVyLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5yZWdpc3RlcnNbcmVnaXN0ZXJdID0gdmFsdWU7XG4gIH1cblxuICBzZXRQYyhwYzogbnVtYmVyKTogdm9pZCB7XG4gICAgYXNzZXJ0KHR5cGVvZiBwYyA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHBjKSwgJ3BjIGlzIHNldCB0byBhIG51bWJlcicpO1xuICAgIHRoaXMucmVnaXN0ZXJzWyRwY10gPSBwYztcbiAgfVxuXG4gIC8vIFN0YXJ0IGEgbmV3IGZyYW1lIGFuZCBzYXZlICRyYSBhbmQgJGZwIG9uIHRoZSBzdGFja1xuICBwdXNoRnJhbWUoKSB7XG4gICAgdGhpcy5zdGFjay5wdXNoKHRoaXMucmVnaXN0ZXJzWyRyYV0pO1xuICAgIHRoaXMuc3RhY2sucHVzaCh0aGlzLnJlZ2lzdGVyc1skZnBdKTtcbiAgICB0aGlzLnJlZ2lzdGVyc1skZnBdID0gdGhpcy5yZWdpc3RlcnNbJHNwXSAtIDE7XG4gIH1cblxuICAvLyBSZXN0b3JlICRyYSwgJHNwIGFuZCAkZnBcbiAgcG9wRnJhbWUoKSB7XG4gICAgdGhpcy5yZWdpc3RlcnNbJHNwXSA9IHRoaXMucmVnaXN0ZXJzWyRmcF0gLSAxO1xuICAgIHRoaXMucmVnaXN0ZXJzWyRyYV0gPSB0aGlzLnN0YWNrLmdldCgwKTtcbiAgICB0aGlzLnJlZ2lzdGVyc1skZnBdID0gdGhpcy5zdGFjay5nZXQoMSk7XG4gIH1cblxuICBwdXNoU21hbGxGcmFtZSgpIHtcbiAgICB0aGlzLnN0YWNrLnB1c2godGhpcy5yZWdpc3RlcnNbJHJhXSk7XG4gIH1cblxuICBwb3BTbWFsbEZyYW1lKCkge1xuICAgIHRoaXMucmVnaXN0ZXJzWyRyYV0gPSB0aGlzLnN0YWNrLnBvcCgpO1xuICB9XG5cbiAgLy8gSnVtcCB0byBhbiBhZGRyZXNzIGluIGBwcm9ncmFtYFxuICBnb3RvKG9mZnNldDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRQYyh0aGlzLnRhcmdldChvZmZzZXQpKTtcbiAgfVxuXG4gIHRhcmdldChvZmZzZXQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyc1skcGNdICsgb2Zmc2V0IC0gdGhpcy5jdXJyZW50T3BTaXplO1xuICB9XG5cbiAgLy8gU2F2ZSAkcGMgaW50byAkcmEsIHRoZW4ganVtcCB0byBhIG5ldyBhZGRyZXNzIGluIGBwcm9ncmFtYCAoamFsIGluIE1JUFMpXG4gIGNhbGwoaGFuZGxlOiBudW1iZXIpIHtcbiAgICBhc3NlcnQoaGFuZGxlIDwgMHhmZmZmZmZmZiwgYEp1bXBpbmcgdG8gcGxhY2Vob2RlciBhZGRyZXNzYCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyc1skcmFdID0gdGhpcy5yZWdpc3RlcnNbJHBjXTtcbiAgICB0aGlzLnNldFBjKHRoaXMuaGVhcC5nZXRhZGRyKGhhbmRsZSkpO1xuICB9XG5cbiAgLy8gUHV0IGEgc3BlY2lmaWMgYHByb2dyYW1gIGFkZHJlc3MgaW4gJHJhXG4gIHJldHVyblRvKG9mZnNldDogbnVtYmVyKSB7XG4gICAgdGhpcy5yZWdpc3RlcnNbJHJhXSA9IHRoaXMudGFyZ2V0KG9mZnNldCk7XG4gIH1cblxuICAvLyBSZXR1cm4gdG8gdGhlIGBwcm9ncmFtYCBhZGRyZXNzIHN0b3JlZCBpbiAkcmFcbiAgcmV0dXJuKCkge1xuICAgIHRoaXMuc2V0UGModGhpcy5yZWdpc3RlcnNbJHJhXSk7XG4gIH1cblxuICBuZXh0U3RhdGVtZW50KCk6IE9wdGlvbjxSdW50aW1lT3A+IHtcbiAgICBsZXQgeyByZWdpc3RlcnMsIHByb2dyYW0gfSA9IHRoaXM7XG5cbiAgICBsZXQgcGMgPSByZWdpc3RlcnNbJHBjXTtcblxuICAgIGFzc2VydCh0eXBlb2YgcGMgPT09ICdudW1iZXInLCAncGMgaXMgYSBudW1iZXInKTtcblxuICAgIGlmIChwYyA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFdlIGhhdmUgdG8gc2F2ZSBvZmYgdGhlIGN1cnJlbnQgb3BlcmF0aW9ucyBzaXplIHNvIHRoYXRcbiAgICAvLyB3aGVuIHdlIGRvIGEganVtcCB3ZSBjYW4gY2FsY3VsYXRlIHRoZSBjb3JyZWN0IG9mZnNldFxuICAgIC8vIHRvIHdoZXJlIHdlIGFyZSBnb2luZy4gV2UgY2FuJ3Qgc2ltcGx5IGFzayBmb3IgdGhlIHNpemVcbiAgICAvLyBpbiBhIGp1bXAgYmVjYXVzZSB3ZSBoYXZlIGhhdmUgYWxyZWFkeSBpbmNyZW1lbnRlZCB0aGVcbiAgICAvLyBwcm9ncmFtIGNvdW50ZXIgdG8gdGhlIG5leHQgaW5zdHJ1Y3Rpb24gcHJpb3IgdG8gZXhlY3V0aW5nLlxuICAgIGxldCBvcGNvZGUgPSBwcm9ncmFtLm9wY29kZShwYyk7XG4gICAgbGV0IG9wZXJhdGlvblNpemUgPSAodGhpcy5jdXJyZW50T3BTaXplID0gb3Bjb2RlLnNpemUpO1xuICAgIHRoaXMucmVnaXN0ZXJzWyRwY10gKz0gb3BlcmF0aW9uU2l6ZTtcblxuICAgIHJldHVybiBvcGNvZGU7XG4gIH1cblxuICBldmFsdWF0ZU91dGVyKG9wY29kZTogUnVudGltZU9wLCB2bTogVk08Sml0T3JBb3RCbG9jaz4pIHtcbiAgICBpZiAoREVWTU9ERSkge1xuICAgICAgbGV0IHtcbiAgICAgICAgZXh0ZXJuczogeyBkZWJ1Z0JlZm9yZSwgZGVidWdBZnRlciB9LFxuICAgICAgfSA9IHRoaXM7XG4gICAgICBsZXQgc3RhdGUgPSBkZWJ1Z0JlZm9yZShvcGNvZGUpO1xuICAgICAgdGhpcy5ldmFsdWF0ZUlubmVyKG9wY29kZSwgdm0pO1xuICAgICAgZGVidWdBZnRlcihzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZXZhbHVhdGVJbm5lcihvcGNvZGUsIHZtKTtcbiAgICB9XG4gIH1cblxuICBldmFsdWF0ZUlubmVyKG9wY29kZTogUnVudGltZU9wLCB2bTogVk08Sml0T3JBb3RCbG9jaz4pIHtcbiAgICBpZiAob3Bjb2RlLmlzTWFjaGluZSkge1xuICAgICAgdGhpcy5ldmFsdWF0ZU1hY2hpbmUob3Bjb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ldmFsdWF0ZVN5c2NhbGwob3Bjb2RlLCB2bSk7XG4gICAgfVxuICB9XG5cbiAgZXZhbHVhdGVNYWNoaW5lKG9wY29kZTogUnVudGltZU9wKSB7XG4gICAgc3dpdGNoIChvcGNvZGUudHlwZSkge1xuICAgICAgY2FzZSBNYWNoaW5lT3AuUHVzaEZyYW1lOlxuICAgICAgICByZXR1cm4gdGhpcy5wdXNoRnJhbWUoKTtcbiAgICAgIGNhc2UgTWFjaGluZU9wLlBvcEZyYW1lOlxuICAgICAgICByZXR1cm4gdGhpcy5wb3BGcmFtZSgpO1xuICAgICAgY2FzZSBNYWNoaW5lT3AuSW52b2tlU3RhdGljOlxuICAgICAgICByZXR1cm4gdGhpcy5jYWxsKG9wY29kZS5vcDEpO1xuICAgICAgY2FzZSBNYWNoaW5lT3AuSW52b2tlVmlydHVhbDpcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbCh0aGlzLnN0YWNrLnBvcCgpKTtcbiAgICAgIGNhc2UgTWFjaGluZU9wLkp1bXA6XG4gICAgICAgIHJldHVybiB0aGlzLmdvdG8ob3Bjb2RlLm9wMSk7XG4gICAgICBjYXNlIE1hY2hpbmVPcC5SZXR1cm46XG4gICAgICAgIHJldHVybiB0aGlzLnJldHVybigpO1xuICAgICAgY2FzZSBNYWNoaW5lT3AuUmV0dXJuVG86XG4gICAgICAgIHJldHVybiB0aGlzLnJldHVyblRvKG9wY29kZS5vcDEpO1xuICAgIH1cbiAgfVxuXG4gIGV2YWx1YXRlU3lzY2FsbChvcGNvZGU6IFJ1bnRpbWVPcCwgdm06IFZNPEppdE9yQW90QmxvY2s+KSB7XG4gICAgQVBQRU5EX09QQ09ERVMuZXZhbHVhdGUodm0sIG9wY29kZSwgb3Bjb2RlLnR5cGUpO1xuICB9XG59XG4iLCJpbXBvcnQge1xuICBCb3VuZHMsXG4gIER5bmFtaWNTY29wZSxcbiAgRW52aXJvbm1lbnQsXG4gIEV4Y2VwdGlvbkhhbmRsZXIsXG4gIEdsaW1tZXJUcmVlQ2hhbmdlcyxcbiAgSml0T3JBb3RCbG9jayxcbiAgUnVudGltZUNvbnRleHQsXG4gIFNjb3BlLFxuICBBb3RSdW50aW1lQ29udGV4dCxcbiAgSml0UnVudGltZUNvbnRleHQsXG4gIEVsZW1lbnRCdWlsZGVyLFxuICBMaXZlQmxvY2ssXG4gIFVwZGF0YWJsZUJsb2NrLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7XG4gIC8vIFRhZ3NcbiAgY29tYmluZSxcbiAgdmFsdWUsXG4gIHVwZGF0ZSxcbiAgdmFsaWRhdGUsXG4gIGNyZWF0ZVVwZGF0YWJsZVRhZyxcbiAgVGFnLFxuICBVcGRhdGFibGVUYWcsXG4gIFJldmlzaW9uLFxuICBjb21iaW5lU2xpY2UsXG4gIElOSVRJQUwsXG4gIEl0ZXJhdGlvbkFydGlmYWN0cyxcbiAgSXRlcmF0b3JTeW5jaHJvbml6ZXIsXG4gIEl0ZXJhdG9yU3luY2hyb25pemVyRGVsZWdhdGUsXG4gIFBhdGhSZWZlcmVuY2UsXG4gIEVORCxcbn0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IGFzc29jaWF0ZSwgZXhwZWN0LCBMaW5rZWRMaXN0LCBPcHRpb24sIFN0YWNrIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBTaW1wbGVDb21tZW50LCBTaW1wbGVOb2RlIH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IG1vdmUgYXMgbW92ZUJvdW5kcyB9IGZyb20gJy4uL2JvdW5kcyc7XG5pbXBvcnQgeyBhc3luY1Jlc2V0LCBkZXRhY2ggfSBmcm9tICcuLi9saWZldGltZSc7XG5pbXBvcnQgeyBVcGRhdGluZ09wY29kZSwgVXBkYXRpbmdPcFNlcSB9IGZyb20gJy4uL29wY29kZXMnO1xuaW1wb3J0IHsgSW50ZXJuYWxWTSwgVm1Jbml0Q2FsbGJhY2ssIEppdFZNIH0gZnJvbSAnLi9hcHBlbmQnO1xuaW1wb3J0IHsgTmV3RWxlbWVudEJ1aWxkZXIgfSBmcm9tICcuL2VsZW1lbnQtYnVpbGRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVwZGF0aW5nVk0ge1xuICBwdWJsaWMgZW52OiBFbnZpcm9ubWVudDtcbiAgcHVibGljIGRvbTogR2xpbW1lclRyZWVDaGFuZ2VzO1xuICBwdWJsaWMgYWx3YXlzUmV2YWxpZGF0ZTogYm9vbGVhbjtcblxuICBwcml2YXRlIGZyYW1lU3RhY2s6IFN0YWNrPFVwZGF0aW5nVk1GcmFtZT4gPSBuZXcgU3RhY2s8VXBkYXRpbmdWTUZyYW1lPigpO1xuXG4gIGNvbnN0cnVjdG9yKGVudjogRW52aXJvbm1lbnQsIHsgYWx3YXlzUmV2YWxpZGF0ZSA9IGZhbHNlIH0pIHtcbiAgICB0aGlzLmVudiA9IGVudjtcbiAgICB0aGlzLmRvbSA9IGVudi5nZXRET00oKTtcbiAgICB0aGlzLmFsd2F5c1JldmFsaWRhdGUgPSBhbHdheXNSZXZhbGlkYXRlO1xuICB9XG5cbiAgZXhlY3V0ZShvcGNvZGVzOiBVcGRhdGluZ09wU2VxLCBoYW5kbGVyOiBFeGNlcHRpb25IYW5kbGVyKSB7XG4gICAgbGV0IHsgZnJhbWVTdGFjayB9ID0gdGhpcztcblxuICAgIHRoaXMudHJ5KG9wY29kZXMsIGhhbmRsZXIpO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmIChmcmFtZVN0YWNrLmlzRW1wdHkoKSkgYnJlYWs7XG5cbiAgICAgIGxldCBvcGNvZGUgPSB0aGlzLmZyYW1lLm5leHRTdGF0ZW1lbnQoKTtcblxuICAgICAgaWYgKG9wY29kZSA9PT0gbnVsbCkge1xuICAgICAgICBmcmFtZVN0YWNrLnBvcCgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgb3Bjb2RlLmV2YWx1YXRlKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGZyYW1lKCkge1xuICAgIHJldHVybiBleHBlY3QodGhpcy5mcmFtZVN0YWNrLmN1cnJlbnQsICdidWc6IGV4cGVjdGVkIGEgZnJhbWUnKTtcbiAgfVxuXG4gIGdvdG8ob3A6IFVwZGF0aW5nT3Bjb2RlKSB7XG4gICAgdGhpcy5mcmFtZS5nb3RvKG9wKTtcbiAgfVxuXG4gIHRyeShvcHM6IFVwZGF0aW5nT3BTZXEsIGhhbmRsZXI6IE9wdGlvbjxFeGNlcHRpb25IYW5kbGVyPikge1xuICAgIHRoaXMuZnJhbWVTdGFjay5wdXNoKG5ldyBVcGRhdGluZ1ZNRnJhbWUob3BzLCBoYW5kbGVyKSk7XG4gIH1cblxuICB0aHJvdygpIHtcbiAgICB0aGlzLmZyYW1lLmhhbmRsZUV4Y2VwdGlvbigpO1xuICAgIHRoaXMuZnJhbWVTdGFjay5wb3AoKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZNU3RhdGUge1xuICByZWFkb25seSBwYzogbnVtYmVyO1xuICByZWFkb25seSBzY29wZTogU2NvcGU8Sml0T3JBb3RCbG9jaz47XG4gIHJlYWRvbmx5IGR5bmFtaWNTY29wZTogRHluYW1pY1Njb3BlO1xuICByZWFkb25seSBzdGFjazogdW5rbm93bltdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3VtYWJsZVZNU3RhdGU8ViBleHRlbmRzIEludGVybmFsVk0+IHtcbiAgcmVzdW1lKHJ1bnRpbWU6IFJ1bnRpbWVDb250ZXh0LCBidWlsZGVyOiBFbGVtZW50QnVpbGRlcik6IFY7XG59XG5cbmV4cG9ydCBjbGFzcyBSZXN1bWFibGVWTVN0YXRlSW1wbDxWIGV4dGVuZHMgSW50ZXJuYWxWTT4gaW1wbGVtZW50cyBSZXN1bWFibGVWTVN0YXRlPFY+IHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgc3RhdGU6IFZNU3RhdGUsIHByaXZhdGUgcmVzdW1lQ2FsbGJhY2s6IFZtSW5pdENhbGxiYWNrPFY+KSB7fVxuXG4gIHJlc3VtZShcbiAgICBydW50aW1lOiBWIGV4dGVuZHMgSml0Vk0gPyBKaXRSdW50aW1lQ29udGV4dCA6IEFvdFJ1bnRpbWVDb250ZXh0LFxuICAgIGJ1aWxkZXI6IEVsZW1lbnRCdWlsZGVyXG4gICk6IFYge1xuICAgIHJldHVybiB0aGlzLnJlc3VtZUNhbGxiYWNrKHJ1bnRpbWUsIHRoaXMuc3RhdGUsIGJ1aWxkZXIpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCbG9ja09wY29kZSBleHRlbmRzIFVwZGF0aW5nT3Bjb2RlIGltcGxlbWVudHMgQm91bmRzIHtcbiAgcHVibGljIHR5cGUgPSAnYmxvY2snO1xuICBwdWJsaWMgbmV4dCA9IG51bGw7XG4gIHB1YmxpYyBwcmV2ID0gbnVsbDtcbiAgcmVhZG9ubHkgY2hpbGRyZW46IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+O1xuXG4gIHByb3RlY3RlZCByZWFkb25seSBib3VuZHM6IExpdmVCbG9jaztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgc3RhdGU6IFJlc3VtYWJsZVZNU3RhdGU8SW50ZXJuYWxWTT4sXG4gICAgcHJvdGVjdGVkIHJ1bnRpbWU6IFJ1bnRpbWVDb250ZXh0LFxuICAgIGJvdW5kczogTGl2ZUJsb2NrLFxuICAgIGNoaWxkcmVuOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPlxuICApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIHRoaXMuYm91bmRzID0gYm91bmRzO1xuICB9XG5cbiAgYWJzdHJhY3QgZGlkSW5pdGlhbGl6ZUNoaWxkcmVuKCk6IHZvaWQ7XG5cbiAgcGFyZW50RWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMucGFyZW50RWxlbWVudCgpO1xuICB9XG5cbiAgZmlyc3ROb2RlKCkge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5maXJzdE5vZGUoKTtcbiAgfVxuXG4gIGxhc3ROb2RlKCkge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5sYXN0Tm9kZSgpO1xuICB9XG5cbiAgZXZhbHVhdGUodm06IFVwZGF0aW5nVk0pIHtcbiAgICB2bS50cnkodGhpcy5jaGlsZHJlbiwgbnVsbCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyeU9wY29kZSBleHRlbmRzIEJsb2NrT3Bjb2RlIGltcGxlbWVudHMgRXhjZXB0aW9uSGFuZGxlciB7XG4gIHB1YmxpYyB0eXBlID0gJ3RyeSc7XG5cbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIHByaXZhdGUgX3RhZzogVXBkYXRhYmxlVGFnO1xuXG4gIHByb3RlY3RlZCBib3VuZHMhOiBVcGRhdGFibGVCbG9jazsgLy8gSGlkZXMgcHJvcGVydHkgb24gYmFzZSBjbGFzc1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHN0YXRlOiBSZXN1bWFibGVWTVN0YXRlPEludGVybmFsVk0+LFxuICAgIHJ1bnRpbWU6IFJ1bnRpbWVDb250ZXh0LFxuICAgIGJvdW5kczogVXBkYXRhYmxlQmxvY2ssXG4gICAgY2hpbGRyZW46IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+XG4gICkge1xuICAgIHN1cGVyKHN0YXRlLCBydW50aW1lLCBib3VuZHMsIGNoaWxkcmVuKTtcbiAgICB0aGlzLnRhZyA9IHRoaXMuX3RhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpO1xuICB9XG5cbiAgZGlkSW5pdGlhbGl6ZUNoaWxkcmVuKCkge1xuICAgIHVwZGF0ZSh0aGlzLl90YWcsIGNvbWJpbmVTbGljZSh0aGlzLmNoaWxkcmVuKSk7XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIHZtLnRyeSh0aGlzLmNoaWxkcmVuLCB0aGlzKTtcbiAgfVxuXG4gIGhhbmRsZUV4Y2VwdGlvbigpIHtcbiAgICBsZXQgeyBzdGF0ZSwgYm91bmRzLCBjaGlsZHJlbiwgcHJldiwgbmV4dCwgcnVudGltZSB9ID0gdGhpcztcblxuICAgIGNoaWxkcmVuLmNsZWFyKCk7XG4gICAgYXN5bmNSZXNldCh0aGlzLCBydW50aW1lLmVudik7XG5cbiAgICBsZXQgZWxlbWVudFN0YWNrID0gTmV3RWxlbWVudEJ1aWxkZXIucmVzdW1lKHJ1bnRpbWUuZW52LCBib3VuZHMpO1xuICAgIGxldCB2bSA9IHN0YXRlLnJlc3VtZShydW50aW1lLCBlbGVtZW50U3RhY2spO1xuXG4gICAgbGV0IHVwZGF0aW5nID0gbmV3IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KCk7XG5cbiAgICBsZXQgcmVzdWx0ID0gdm0uZXhlY3V0ZSh2bSA9PiB7XG4gICAgICB2bS5wdXNoVXBkYXRpbmcodXBkYXRpbmcpO1xuICAgICAgdm0udXBkYXRlV2l0aCh0aGlzKTtcbiAgICAgIHZtLnB1c2hVcGRhdGluZyhjaGlsZHJlbik7XG4gICAgfSk7XG5cbiAgICBhc3NvY2lhdGUodGhpcywgcmVzdWx0LmRyb3ApO1xuXG4gICAgdGhpcy5wcmV2ID0gcHJldjtcbiAgICB0aGlzLm5leHQgPSBuZXh0O1xuICB9XG59XG5cbmNsYXNzIExpc3RSZXZhbGlkYXRpb25EZWxlZ2F0ZSBpbXBsZW1lbnRzIEl0ZXJhdG9yU3luY2hyb25pemVyRGVsZWdhdGU8RW52aXJvbm1lbnQ+IHtcbiAgcHJpdmF0ZSBtYXA6IE1hcDx1bmtub3duLCBCbG9ja09wY29kZT47XG4gIHByaXZhdGUgdXBkYXRpbmc6IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+O1xuXG4gIHByaXZhdGUgZGlkSW5zZXJ0ID0gZmFsc2U7XG4gIHByaXZhdGUgZGlkRGVsZXRlID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBvcGNvZGU6IExpc3RCbG9ja09wY29kZSwgcHJpdmF0ZSBtYXJrZXI6IFNpbXBsZUNvbW1lbnQpIHtcbiAgICB0aGlzLm1hcCA9IG9wY29kZS5tYXA7XG4gICAgdGhpcy51cGRhdGluZyA9IG9wY29kZVsnY2hpbGRyZW4nXTtcbiAgfVxuXG4gIGluc2VydChcbiAgICBfZW52OiBFbnZpcm9ubWVudCxcbiAgICBrZXk6IHVua25vd24sXG4gICAgaXRlbTogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBtZW1vOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LFxuICAgIGJlZm9yZTogdW5rbm93blxuICApIHtcbiAgICBsZXQgeyBtYXAsIG9wY29kZSwgdXBkYXRpbmcgfSA9IHRoaXM7XG4gICAgbGV0IG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT4gPSBudWxsO1xuICAgIGxldCByZWZlcmVuY2U6IE9wdGlvbjxCbG9ja09wY29kZT4gPSBudWxsO1xuXG4gICAgaWYgKHR5cGVvZiBiZWZvcmUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZWZlcmVuY2UgPSBtYXAuZ2V0KGJlZm9yZSkhO1xuICAgICAgbmV4dFNpYmxpbmcgPSByZWZlcmVuY2VbJ2JvdW5kcyddLmZpcnN0Tm9kZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0U2libGluZyA9IHRoaXMubWFya2VyO1xuICAgIH1cblxuICAgIGxldCB2bSA9IG9wY29kZS52bUZvckluc2VydGlvbihuZXh0U2libGluZyk7XG4gICAgbGV0IHRyeU9wY29kZTogT3B0aW9uPFRyeU9wY29kZT4gPSBudWxsO1xuXG4gICAgdm0uZXhlY3V0ZSh2bSA9PiB7XG4gICAgICB0cnlPcGNvZGUgPSB2bS5pdGVyYXRlKG1lbW8sIGl0ZW0pO1xuICAgICAgbWFwLnNldChrZXksIHRyeU9wY29kZSk7XG4gICAgICB2bS5wdXNoVXBkYXRpbmcobmV3IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KCkpO1xuICAgICAgdm0udXBkYXRlV2l0aCh0cnlPcGNvZGUpO1xuICAgICAgdm0ucHVzaFVwZGF0aW5nKHRyeU9wY29kZS5jaGlsZHJlbik7XG4gICAgfSk7XG5cbiAgICB1cGRhdGluZy5pbnNlcnRCZWZvcmUodHJ5T3Bjb2RlISwgcmVmZXJlbmNlKTtcblxuICAgIHRoaXMuZGlkSW5zZXJ0ID0gdHJ1ZTtcbiAgfVxuXG4gIHJldGFpbihcbiAgICBfZW52OiBFbnZpcm9ubWVudCxcbiAgICBfa2V5OiB1bmtub3duLFxuICAgIF9pdGVtOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LFxuICAgIF9tZW1vOiBQYXRoUmVmZXJlbmNlPHVua25vd24+XG4gICkge31cblxuICBtb3ZlKFxuICAgIF9lbnY6IEVudmlyb25tZW50LFxuICAgIGtleTogdW5rbm93bixcbiAgICBfaXRlbTogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBfbWVtbzogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBiZWZvcmU6IHVua25vd25cbiAgKSB7XG4gICAgbGV0IHsgbWFwLCB1cGRhdGluZyB9ID0gdGhpcztcblxuICAgIGxldCBlbnRyeSA9IG1hcC5nZXQoa2V5KSE7XG5cbiAgICBpZiAoYmVmb3JlID09PSBFTkQpIHtcbiAgICAgIG1vdmVCb3VuZHMoZW50cnksIHRoaXMubWFya2VyKTtcbiAgICAgIHVwZGF0aW5nLnJlbW92ZShlbnRyeSk7XG4gICAgICB1cGRhdGluZy5hcHBlbmQoZW50cnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVmZXJlbmNlID0gbWFwLmdldChiZWZvcmUpITtcbiAgICAgIG1vdmVCb3VuZHMoZW50cnksIHJlZmVyZW5jZS5maXJzdE5vZGUoKSk7XG4gICAgICB1cGRhdGluZy5yZW1vdmUoZW50cnkpO1xuICAgICAgdXBkYXRpbmcuaW5zZXJ0QmVmb3JlKGVudHJ5LCByZWZlcmVuY2UpO1xuICAgIH1cbiAgfVxuXG4gIGRlbGV0ZShlbnY6IEVudmlyb25tZW50LCBrZXk6IHVua25vd24pIHtcbiAgICBsZXQgeyBtYXAsIHVwZGF0aW5nIH0gPSB0aGlzO1xuICAgIGxldCBvcGNvZGUgPSBtYXAuZ2V0KGtleSkhO1xuICAgIGRldGFjaChvcGNvZGUsIGVudik7XG4gICAgdXBkYXRpbmcucmVtb3ZlKG9wY29kZSk7XG4gICAgbWFwLmRlbGV0ZShrZXkpO1xuXG4gICAgdGhpcy5kaWREZWxldGUgPSB0cnVlO1xuICB9XG5cbiAgZG9uZSgpIHtcbiAgICB0aGlzLm9wY29kZS5kaWRJbml0aWFsaXplQ2hpbGRyZW4odGhpcy5kaWRJbnNlcnQgfHwgdGhpcy5kaWREZWxldGUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMaXN0QmxvY2tPcGNvZGUgZXh0ZW5kcyBCbG9ja09wY29kZSB7XG4gIHB1YmxpYyB0eXBlID0gJ2xpc3QtYmxvY2snO1xuICBwdWJsaWMgbWFwID0gbmV3IE1hcDx1bmtub3duLCBCbG9ja09wY29kZT4oKTtcbiAgcHVibGljIGFydGlmYWN0czogSXRlcmF0aW9uQXJ0aWZhY3RzO1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgcHJpdmF0ZSBsYXN0SXRlcmF0ZWQ6IFJldmlzaW9uID0gSU5JVElBTDtcbiAgcHJpdmF0ZSBfdGFnOiBVcGRhdGFibGVUYWc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgc3RhdGU6IFJlc3VtYWJsZVZNU3RhdGU8SW50ZXJuYWxWTT4sXG4gICAgcnVudGltZTogUnVudGltZUNvbnRleHQsXG4gICAgYm91bmRzOiBMaXZlQmxvY2ssXG4gICAgY2hpbGRyZW46IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+LFxuICAgIGFydGlmYWN0czogSXRlcmF0aW9uQXJ0aWZhY3RzXG4gICkge1xuICAgIHN1cGVyKHN0YXRlLCBydW50aW1lLCBib3VuZHMsIGNoaWxkcmVuKTtcbiAgICB0aGlzLmFydGlmYWN0cyA9IGFydGlmYWN0cztcbiAgICBsZXQgX3RhZyA9ICh0aGlzLl90YWcgPSBjcmVhdGVVcGRhdGFibGVUYWcoKSk7XG4gICAgdGhpcy50YWcgPSBjb21iaW5lKFthcnRpZmFjdHMudGFnLCBfdGFnXSk7XG4gIH1cblxuICBkaWRJbml0aWFsaXplQ2hpbGRyZW4obGlzdERpZENoYW5nZSA9IHRydWUpIHtcbiAgICB0aGlzLmxhc3RJdGVyYXRlZCA9IHZhbHVlKHRoaXMuYXJ0aWZhY3RzLnRhZyk7XG5cbiAgICBpZiAobGlzdERpZENoYW5nZSkge1xuICAgICAgdXBkYXRlKHRoaXMuX3RhZywgY29tYmluZVNsaWNlKHRoaXMuY2hpbGRyZW4pKTtcbiAgICB9XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIGxldCB7IGFydGlmYWN0cywgbGFzdEl0ZXJhdGVkIH0gPSB0aGlzO1xuXG4gICAgaWYgKCF2YWxpZGF0ZShhcnRpZmFjdHMudGFnLCBsYXN0SXRlcmF0ZWQpKSB7XG4gICAgICBsZXQgeyBib3VuZHMgfSA9IHRoaXM7XG4gICAgICBsZXQgeyBkb20gfSA9IHZtO1xuXG4gICAgICBsZXQgbWFya2VyID0gZG9tLmNyZWF0ZUNvbW1lbnQoJycpO1xuICAgICAgZG9tLmluc2VydEFmdGVyKFxuICAgICAgICBib3VuZHMucGFyZW50RWxlbWVudCgpLFxuICAgICAgICBtYXJrZXIsXG4gICAgICAgIGV4cGVjdChib3VuZHMubGFzdE5vZGUoKSwgXCJjYW4ndCBpbnNlcnQgYWZ0ZXIgYW4gZW1wdHkgYm91bmRzXCIpXG4gICAgICApO1xuXG4gICAgICBsZXQgdGFyZ2V0ID0gbmV3IExpc3RSZXZhbGlkYXRpb25EZWxlZ2F0ZSh0aGlzLCBtYXJrZXIpO1xuICAgICAgbGV0IHN5bmNocm9uaXplciA9IG5ldyBJdGVyYXRvclN5bmNocm9uaXplcih7IHRhcmdldCwgYXJ0aWZhY3RzLCBlbnY6IHZtLmVudiB9KTtcblxuICAgICAgc3luY2hyb25pemVyLnN5bmMoKTtcblxuICAgICAgdGhpcy5wYXJlbnRFbGVtZW50KCkucmVtb3ZlQ2hpbGQobWFya2VyKTtcbiAgICB9XG5cbiAgICAvLyBSdW4gbm93LXVwZGF0ZWQgdXBkYXRpbmcgb3Bjb2Rlc1xuICAgIHN1cGVyLmV2YWx1YXRlKHZtKTtcbiAgfVxuXG4gIHZtRm9ySW5zZXJ0aW9uKG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT4pOiBJbnRlcm5hbFZNPEppdE9yQW90QmxvY2s+IHtcbiAgICBsZXQgeyBib3VuZHMsIHN0YXRlLCBydW50aW1lIH0gPSB0aGlzO1xuXG4gICAgbGV0IGVsZW1lbnRTdGFjayA9IE5ld0VsZW1lbnRCdWlsZGVyLmZvckluaXRpYWxSZW5kZXIocnVudGltZS5lbnYsIHtcbiAgICAgIGVsZW1lbnQ6IGJvdW5kcy5wYXJlbnRFbGVtZW50KCksXG4gICAgICBuZXh0U2libGluZyxcbiAgICB9KTtcblxuICAgIHJldHVybiBzdGF0ZS5yZXN1bWUocnVudGltZSwgZWxlbWVudFN0YWNrKTtcbiAgfVxufVxuXG5jbGFzcyBVcGRhdGluZ1ZNRnJhbWUge1xuICBwcml2YXRlIGN1cnJlbnQ6IE9wdGlvbjxVcGRhdGluZ09wY29kZT47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBvcHM6IFVwZGF0aW5nT3BTZXEsIHByaXZhdGUgZXhjZXB0aW9uSGFuZGxlcjogT3B0aW9uPEV4Y2VwdGlvbkhhbmRsZXI+KSB7XG4gICAgdGhpcy5jdXJyZW50ID0gb3BzLmhlYWQoKTtcbiAgfVxuXG4gIGdvdG8ob3A6IFVwZGF0aW5nT3Bjb2RlKSB7XG4gICAgdGhpcy5jdXJyZW50ID0gb3A7XG4gIH1cblxuICBuZXh0U3RhdGVtZW50KCk6IE9wdGlvbjxVcGRhdGluZ09wY29kZT4ge1xuICAgIGxldCB7IGN1cnJlbnQsIG9wcyB9ID0gdGhpcztcbiAgICBpZiAoY3VycmVudCkgdGhpcy5jdXJyZW50ID0gb3BzLm5leHROb2RlKGN1cnJlbnQpO1xuICAgIHJldHVybiBjdXJyZW50O1xuICB9XG5cbiAgaGFuZGxlRXhjZXB0aW9uKCkge1xuICAgIGlmICh0aGlzLmV4Y2VwdGlvbkhhbmRsZXIpIHtcbiAgICAgIHRoaXMuZXhjZXB0aW9uSGFuZGxlci5oYW5kbGVFeGNlcHRpb24oKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IEVudmlyb25tZW50LCBSZW5kZXJSZXN1bHQsIExpdmVCbG9jayB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzb2NpYXRlLCBERVNUUk9ZLCBMaW5rZWRMaXN0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBTaW1wbGVFbGVtZW50LCBTaW1wbGVOb2RlIH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IGNsZWFyIH0gZnJvbSAnLi4vYm91bmRzJztcbmltcG9ydCB7IGluVHJhbnNhY3Rpb24gfSBmcm9tICcuLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQgeyBhc3luY0Rlc3Ryb3kgfSBmcm9tICcuLi9saWZldGltZSc7XG5pbXBvcnQgeyBVcGRhdGluZ09wY29kZSB9IGZyb20gJy4uL29wY29kZXMnO1xuaW1wb3J0IFVwZGF0aW5nVk0gZnJvbSAnLi91cGRhdGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJSZXN1bHRJbXBsIGltcGxlbWVudHMgUmVuZGVyUmVzdWx0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVudjogRW52aXJvbm1lbnQsXG4gICAgcHJpdmF0ZSB1cGRhdGluZzogTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT4sXG4gICAgcHJpdmF0ZSBib3VuZHM6IExpdmVCbG9jayxcbiAgICByZWFkb25seSBkcm9wOiBvYmplY3RcbiAgKSB7XG4gICAgYXNzb2NpYXRlKHRoaXMsIGRyb3ApO1xuICB9XG5cbiAgcmVyZW5kZXIoeyBhbHdheXNSZXZhbGlkYXRlID0gZmFsc2UgfSA9IHsgYWx3YXlzUmV2YWxpZGF0ZTogZmFsc2UgfSkge1xuICAgIGxldCB7IGVudiwgdXBkYXRpbmcgfSA9IHRoaXM7XG4gICAgbGV0IHZtID0gbmV3IFVwZGF0aW5nVk0oZW52LCB7IGFsd2F5c1JldmFsaWRhdGUgfSk7XG4gICAgdm0uZXhlY3V0ZSh1cGRhdGluZywgdGhpcyk7XG4gIH1cblxuICBwYXJlbnRFbGVtZW50KCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5wYXJlbnRFbGVtZW50KCk7XG4gIH1cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmZpcnN0Tm9kZSgpO1xuICB9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmxhc3ROb2RlKCk7XG4gIH1cblxuICBoYW5kbGVFeGNlcHRpb24oKSB7XG4gICAgdGhyb3cgJ3RoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbic7XG4gIH1cblxuICBbREVTVFJPWV0oKSB7XG4gICAgY2xlYXIodGhpcy5ib3VuZHMpO1xuICB9XG5cbiAgLy8gY29tcGF0LCBhcyB0aGlzIGlzIGEgdXNlci1leHBvc2VkIEFQSVxuICBkZXN0cm95KCkge1xuICAgIGluVHJhbnNhY3Rpb24odGhpcy5lbnYsICgpID0+IGFzeW5jRGVzdHJveSh0aGlzLCB0aGlzLmVudikpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCB7IFByaW1pdGl2ZVR5cGUgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IHVucmVhY2hhYmxlIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBTdGFjayBhcyBXYXNtU3RhY2sgfSBmcm9tICdAZ2xpbW1lci9sb3ctbGV2ZWwnO1xuaW1wb3J0IHsgTWFjaGluZVJlZ2lzdGVyLCAkc3AsICRmcCB9IGZyb20gJ0BnbGltbWVyL3ZtJztcbmltcG9ydCB7IExvd0xldmVsUmVnaXN0ZXJzLCBpbml0aWFsaXplUmVnaXN0ZXJzV2l0aFNQIH0gZnJvbSAnLi9sb3ctbGV2ZWwnO1xuaW1wb3J0IHsgUkVHSVNURVJTIH0gZnJvbSAnLi4vc3ltYm9scyc7XG5cbmNvbnN0IE1BWF9TTUkgPSAweGZmZmZmZmY7XG5cbmV4cG9ydCBjbGFzcyBJbm5lclN0YWNrIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lciA9IG5ldyBXYXNtU3RhY2soKSwgcHJpdmF0ZSBqczogdW5rbm93bltdID0gW10pIHt9XG5cbiAgc2xpY2Uoc3RhcnQ/OiBudW1iZXIsIGVuZD86IG51bWJlcik6IElubmVyU3RhY2sge1xuICAgIGxldCBpbm5lcjogV2FzbVN0YWNrO1xuXG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGVuZCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGlubmVyID0gdGhpcy5pbm5lci5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ251bWJlcicgJiYgZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlubmVyID0gdGhpcy5pbm5lci5zbGljZUZyb20oc3RhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbm5lciA9IHRoaXMuaW5uZXIuY2xvbmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IElubmVyU3RhY2soaW5uZXIsIHRoaXMuanMuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICB9XG5cbiAgc2xpY2VJbm5lcjxUID0gdW5rbm93bj4oc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBUW10ge1xuICAgIGxldCBvdXQgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBvdXQucHVzaCh0aGlzLmdldChpKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGNvcHkoZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5pbm5lci5jb3B5KGZyb20sIHRvKTtcbiAgfVxuXG4gIHdyaXRlKHBvczogbnVtYmVyLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGlmIChpc0ltbWVkaWF0ZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMud3JpdGVSYXcocG9zLCBlbmNvZGVJbW1lZGlhdGUodmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy53cml0ZUpzKHBvcywgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgd3JpdGVKcyhwb3M6IG51bWJlciwgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBsZXQgaWR4ID0gdGhpcy5qcy5sZW5ndGg7XG4gICAgdGhpcy5qcy5wdXNoKHZhbHVlKTtcbiAgICB0aGlzLmlubmVyLndyaXRlUmF3KHBvcywgfmlkeCk7XG4gIH1cblxuICB3cml0ZVJhdyhwb3M6IG51bWJlciwgdmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuaW5uZXIud3JpdGVSYXcocG9zLCB2YWx1ZSk7XG4gIH1cblxuICBnZXQ8VD4ocG9zOiBudW1iZXIpOiBUIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLmlubmVyLmdldFJhdyhwb3MpO1xuXG4gICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgcmV0dXJuIHRoaXMuanNbfnZhbHVlXSBhcyBUO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZGVjb2RlSW1tZWRpYXRlKHZhbHVlKSBhcyBhbnk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5pbm5lci5yZXNldCgpO1xuICAgIHRoaXMuanMubGVuZ3RoID0gMDtcbiAgfVxuXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbm5lci5sZW4oKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEV2YWx1YXRpb25TdGFjayB7XG4gIFtSRUdJU1RFUlNdOiBMb3dMZXZlbFJlZ2lzdGVycztcblxuICBwdXNoKHZhbHVlOiB1bmtub3duKTogdm9pZDtcbiAgcHVzaE51bGwoKTogdm9pZDtcbiAgcHVzaFJhdyh2YWx1ZTogbnVtYmVyKTogdm9pZDtcbiAgZHVwKHBvc2l0aW9uPzogTWFjaGluZVJlZ2lzdGVyKTogdm9pZDtcbiAgY29weShmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIpOiB2b2lkO1xuICBwb3A8VD4obj86IG51bWJlcik6IFQ7XG4gIHBlZWs8VD4ob2Zmc2V0PzogbnVtYmVyKTogVDtcbiAgZ2V0PFQ+KG9mZnNldDogbnVtYmVyLCBiYXNlPzogbnVtYmVyKTogVDtcbiAgc2V0KHZhbHVlOiB1bmtub3duLCBvZmZzZXQ6IG51bWJlciwgYmFzZT86IG51bWJlcik6IHZvaWQ7XG4gIHNsaWNlKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogSW5uZXJTdGFjaztcbiAgc2xpY2VBcnJheTxUID0gdW5rbm93bj4oc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBUW107XG4gIGNhcHR1cmUoaXRlbXM6IG51bWJlcik6IHVua25vd25bXTtcbiAgcmVzZXQoKTogdm9pZDtcbiAgdG9BcnJheSgpOiB1bmtub3duW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2YWx1YXRpb25TdGFja0ltcGwgaW1wbGVtZW50cyBFdmFsdWF0aW9uU3RhY2sge1xuICBzdGF0aWMgcmVzdG9yZShzbmFwc2hvdDogdW5rbm93bltdKTogRXZhbHVhdGlvblN0YWNrIHtcbiAgICBsZXQgc3RhY2sgPSBuZXcgSW5uZXJTdGFjaygpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbmFwc2hvdC5sZW5ndGg7IGkrKykge1xuICAgICAgc3RhY2sud3JpdGUoaSwgc25hcHNob3RbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgdGhpcyhzdGFjaywgaW5pdGlhbGl6ZVJlZ2lzdGVyc1dpdGhTUChzbmFwc2hvdC5sZW5ndGggLSAxKSk7XG4gIH1cblxuICByZWFkb25seSBbUkVHSVNURVJTXTogTG93TGV2ZWxSZWdpc3RlcnM7XG5cbiAgLy8gZnAgLT4gc3BcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBzdGFjazogSW5uZXJTdGFjaywgcmVnaXN0ZXJzOiBMb3dMZXZlbFJlZ2lzdGVycykge1xuICAgIHRoaXNbUkVHSVNURVJTXSA9IHJlZ2lzdGVycztcblxuICAgIGlmIChERUJVRykge1xuICAgICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgcHVzaCh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMuc3RhY2sud3JpdGUoKyt0aGlzW1JFR0lTVEVSU11bJHNwXSwgdmFsdWUpO1xuICB9XG5cbiAgcHVzaFJhdyh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zdGFjay53cml0ZVJhdygrK3RoaXNbUkVHSVNURVJTXVskc3BdLCB2YWx1ZSk7XG4gIH1cblxuICBwdXNoTnVsbCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0YWNrLndyaXRlKCsrdGhpc1tSRUdJU1RFUlNdWyRzcF0sIG51bGwpO1xuICB9XG5cbiAgZHVwKHBvc2l0aW9uID0gdGhpc1tSRUdJU1RFUlNdWyRzcF0pOiB2b2lkIHtcbiAgICB0aGlzLnN0YWNrLmNvcHkocG9zaXRpb24sICsrdGhpc1tSRUdJU1RFUlNdWyRzcF0pO1xuICB9XG5cbiAgY29weShmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnN0YWNrLmNvcHkoZnJvbSwgdG8pO1xuICB9XG5cbiAgcG9wPFQ+KG4gPSAxKTogVCB7XG4gICAgbGV0IHRvcCA9IHRoaXMuc3RhY2suZ2V0PFQ+KHRoaXNbUkVHSVNURVJTXVskc3BdKTtcbiAgICB0aGlzW1JFR0lTVEVSU11bJHNwXSAtPSBuO1xuICAgIHJldHVybiB0b3A7XG4gIH1cblxuICBwZWVrPFQ+KG9mZnNldCA9IDApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjay5nZXQ8VD4odGhpc1tSRUdJU1RFUlNdWyRzcF0gLSBvZmZzZXQpO1xuICB9XG5cbiAgZ2V0PFQ+KG9mZnNldDogbnVtYmVyLCBiYXNlID0gdGhpc1tSRUdJU1RFUlNdWyRmcF0pOiBUIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjay5nZXQ8VD4oYmFzZSArIG9mZnNldCk7XG4gIH1cblxuICBzZXQodmFsdWU6IHVua25vd24sIG9mZnNldDogbnVtYmVyLCBiYXNlID0gdGhpc1tSRUdJU1RFUlNdWyRmcF0pIHtcbiAgICB0aGlzLnN0YWNrLndyaXRlKGJhc2UgKyBvZmZzZXQsIHZhbHVlKTtcbiAgfVxuXG4gIHNsaWNlKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogSW5uZXJTdGFjayB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2suc2xpY2Uoc3RhcnQsIGVuZCk7XG4gIH1cblxuICBzbGljZUFycmF5PFQgPSB1bmtub3duPihzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IFRbXSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2suc2xpY2VJbm5lcihzdGFydCwgZW5kKTtcbiAgfVxuXG4gIGNhcHR1cmUoaXRlbXM6IG51bWJlcik6IHVua25vd25bXSB7XG4gICAgbGV0IGVuZCA9IHRoaXNbUkVHSVNURVJTXVskc3BdICsgMTtcbiAgICBsZXQgc3RhcnQgPSBlbmQgLSBpdGVtcztcbiAgICByZXR1cm4gdGhpcy5zdGFjay5zbGljZUlubmVyKHN0YXJ0LCBlbmQpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5zdGFjay5yZXNldCgpO1xuICB9XG5cbiAgdG9BcnJheSgpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzW1JFR0lTVEVSU10pO1xuICAgIHJldHVybiB0aGlzLnN0YWNrLnNsaWNlSW5uZXIodGhpc1tSRUdJU1RFUlNdWyRmcF0sIHRoaXNbUkVHSVNURVJTXVskc3BdICsgMSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNJbW1lZGlhdGUodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBudW1iZXIgfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gIGxldCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdHJ1ZTtcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdib29sZWFuJzpcbiAgICBjYXNlICd1bmRlZmluZWQnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIC8vIG5vdCBhbiBpbnRlZ2VyXG4gICAgICBpZiAoKHZhbHVlIGFzIG51bWJlcikgJSAxICE9PSAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGxldCBhYnMgPSBNYXRoLmFicyh2YWx1ZSBhcyBudW1iZXIpO1xuXG4gICAgICAvLyB0b28gYmlnXG4gICAgICBpZiAoYWJzID4gTUFYX1NNSSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFR5cGUge1xuICBOVU1CRVIgPSAwYjAwMCxcbiAgRkxPQVQgPSAwYjAwMSxcbiAgU1RSSU5HID0gMGIwMTAsXG4gIEJPT0xFQU5fT1JfVk9JRCA9IDBiMDExLFxuICBORUdBVElWRSA9IDBiMTAwLFxufVxuXG5leHBvcnQgY29uc3QgZW51bSBJbW1lZGlhdGVzIHtcbiAgRmFsc2UgPSAoMCA8PCAzKSB8IFR5cGUuQk9PTEVBTl9PUl9WT0lELFxuICBUcnVlID0gKDEgPDwgMykgfCBUeXBlLkJPT0xFQU5fT1JfVk9JRCxcbiAgTnVsbCA9ICgyIDw8IDMpIHwgVHlwZS5CT09MRUFOX09SX1ZPSUQsXG4gIFVuZGVmID0gKDMgPDwgMykgfCBUeXBlLkJPT0xFQU5fT1JfVk9JRCxcbn1cblxuZnVuY3Rpb24gZW5jb2RlU21pKHByaW1pdGl2ZTogbnVtYmVyKSB7XG4gIGlmIChwcmltaXRpdmUgPCAwKSB7XG4gICAgcmV0dXJuIChNYXRoLmFicyhwcmltaXRpdmUpIDw8IDMpIHwgUHJpbWl0aXZlVHlwZS5ORUdBVElWRTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKHByaW1pdGl2ZSA8PCAzKSB8IFByaW1pdGl2ZVR5cGUuTlVNQkVSO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuY29kZUltbWVkaWF0ZShwcmltaXRpdmU6IG51bWJlciB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgc3dpdGNoICh0eXBlb2YgcHJpbWl0aXZlKSB7XG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBlbmNvZGVTbWkocHJpbWl0aXZlIGFzIG51bWJlcik7XG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gcHJpbWl0aXZlID8gSW1tZWRpYXRlcy5UcnVlIDogSW1tZWRpYXRlcy5GYWxzZTtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgLy8gYXNzdW1lIG51bGxcbiAgICAgIHJldHVybiBJbW1lZGlhdGVzLk51bGw7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgIHJldHVybiBJbW1lZGlhdGVzLlVuZGVmO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyB1bnJlYWNoYWJsZSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlY29kZVNtaShzbWk6IG51bWJlcik6IG51bWJlciB7XG4gIHN3aXRjaCAoc21pICYgMGIxMTEpIHtcbiAgICBjYXNlIFByaW1pdGl2ZVR5cGUuTlVNQkVSOlxuICAgICAgcmV0dXJuIHNtaSA+PiAzO1xuICAgIGNhc2UgUHJpbWl0aXZlVHlwZS5ORUdBVElWRTpcbiAgICAgIHJldHVybiAtKHNtaSA+PiAzKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWNvZGVJbW1lZGlhdGUoaW1tZWRpYXRlOiBudW1iZXIpOiBudW1iZXIgfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAoaW1tZWRpYXRlKSB7XG4gICAgY2FzZSBJbW1lZGlhdGVzLkZhbHNlOlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNhc2UgSW1tZWRpYXRlcy5UcnVlOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY2FzZSBJbW1lZGlhdGVzLk51bGw6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICBjYXNlIEltbWVkaWF0ZXMuVW5kZWY6XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZGVjb2RlU21pKGltbWVkaWF0ZSk7XG4gIH1cbn1cbiIsImltcG9ydCB7XG4gIENvbXBpbGFibGVCbG9jayxcbiAgQ29tcGlsYWJsZVRlbXBsYXRlLFxuICBEZXN0cm95YWJsZSxcbiAgRHJvcCxcbiAgRHluYW1pY1Njb3BlLFxuICBFbnZpcm9ubWVudCxcbiAgSml0T3JBb3RCbG9jayxcbiAgUGFydGlhbFNjb3BlLFxuICBSZW5kZXJSZXN1bHQsXG4gIFJpY2hJdGVyYXRvclJlc3VsdCxcbiAgUnVudGltZUNvbnRleHQsXG4gIFJ1bnRpbWVDb25zdGFudHMsXG4gIFJ1bnRpbWVIZWFwLFxuICBSdW50aW1lUHJvZ3JhbSxcbiAgU2NvcGUsXG4gIFN5bWJvbERlc3Ryb3lhYmxlLFxuICBTeW50YXhDb21waWxhdGlvbkNvbnRleHQsXG4gIFZNIGFzIFB1YmxpY1ZNLFxuICBKaXRSdW50aW1lQ29udGV4dCxcbiAgQW90UnVudGltZUNvbnRleHQsXG4gIExpdmVCbG9jayxcbiAgRWxlbWVudEJ1aWxkZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5pbXBvcnQgeyBSdW50aW1lT3BJbXBsIH0gZnJvbSAnQGdsaW1tZXIvcHJvZ3JhbSc7XG5pbXBvcnQge1xuICBjb21iaW5lU2xpY2UsXG4gIFBhdGhSZWZlcmVuY2UsXG4gIFJlZmVyZW5jZUl0ZXJhdG9yLFxuICBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLFxufSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHtcbiAgYXNzb2NpYXRlRGVzdHJ1Y3RvcixcbiAgZGVzdHJ1Y3RvcixcbiAgZXhwZWN0LFxuICBpc0Ryb3AsXG4gIExpbmtlZExpc3QsXG4gIExpc3RTbGljZSxcbiAgT3B0aW9uLFxuICBTdGFjayxcbiAgYXNzZXJ0LFxufSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gICRmcCxcbiAgJHBjLFxuICAkczAsXG4gICRzMSxcbiAgJHNwLFxuICAkdDAsXG4gICR0MSxcbiAgJHYwLFxuICBpc0xvd0xldmVsUmVnaXN0ZXIsXG4gIE1hY2hpbmVSZWdpc3RlcixcbiAgUmVnaXN0ZXIsXG4gIFN5c2NhbGxSZWdpc3Rlcixcbn0gZnJvbSAnQGdsaW1tZXIvdm0nO1xuaW1wb3J0IHsgRGlkTW9kaWZ5T3Bjb2RlLCBKdW1wSWZOb3RNb2RpZmllZE9wY29kZSwgTGFiZWxPcGNvZGUgfSBmcm9tICcuLi9jb21waWxlZC9vcGNvZGVzL3ZtJztcbmltcG9ydCB7IFNjb3BlSW1wbCB9IGZyb20gJy4uL2Vudmlyb25tZW50JztcbmltcG9ydCB7IEFQUEVORF9PUENPREVTLCBEZWJ1Z1N0YXRlLCBVcGRhdGluZ09wY29kZSB9IGZyb20gJy4uL29wY29kZXMnO1xuaW1wb3J0IHsgVU5ERUZJTkVEX1JFRkVSRU5DRSB9IGZyb20gJy4uL3JlZmVyZW5jZXMnO1xuaW1wb3J0IHsgQVJHUywgQ09OU1RBTlRTLCBERVNUUlVDVE9SX1NUQUNLLCBIRUFQLCBJTk5FUl9WTSwgUkVHSVNURVJTLCBTVEFDS1MgfSBmcm9tICcuLi9zeW1ib2xzJztcbmltcG9ydCB7IFZNQXJndW1lbnRzSW1wbCB9IGZyb20gJy4vYXJndW1lbnRzJztcbmltcG9ydCBMb3dMZXZlbFZNIGZyb20gJy4vbG93LWxldmVsJztcbmltcG9ydCBSZW5kZXJSZXN1bHRJbXBsIGZyb20gJy4vcmVuZGVyLXJlc3VsdCc7XG5pbXBvcnQgRXZhbHVhdGlvblN0YWNrSW1wbCwgeyBFdmFsdWF0aW9uU3RhY2sgfSBmcm9tICcuL3N0YWNrJztcbmltcG9ydCB7XG4gIEJsb2NrT3Bjb2RlLFxuICBMaXN0QmxvY2tPcGNvZGUsXG4gIFJlc3VtYWJsZVZNU3RhdGUsXG4gIFJlc3VtYWJsZVZNU3RhdGVJbXBsLFxuICBUcnlPcGNvZGUsXG4gIFZNU3RhdGUsXG59IGZyb20gJy4vdXBkYXRlJztcbmltcG9ydCB7IENoZWNrTnVtYmVyLCBjaGVjayB9IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcblxuLyoqXG4gKiBUaGlzIGludGVyZmFjZSBpcyB1c2VkIGJ5IGludGVybmFsIG9wY29kZXMsIGFuZCBpcyBtb3JlIHN0YWJsZSB0aGFuXG4gKiB0aGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIEFwcGVuZCBWTSBpdHNlbGYuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJuYWxWTTxDIGV4dGVuZHMgSml0T3JBb3RCbG9jayA9IEppdE9yQW90QmxvY2s+IHtcbiAgcmVhZG9ubHkgW0NPTlNUQU5UU106IFJ1bnRpbWVDb25zdGFudHM7XG4gIHJlYWRvbmx5IFtBUkdTXTogVk1Bcmd1bWVudHNJbXBsO1xuXG4gIHJlYWRvbmx5IGVudjogRW52aXJvbm1lbnQ7XG4gIHJlYWRvbmx5IHN0YWNrOiBFdmFsdWF0aW9uU3RhY2s7XG4gIHJlYWRvbmx5IHJ1bnRpbWU6IFJ1bnRpbWVDb250ZXh0O1xuXG4gIGxvYWRWYWx1ZShyZWdpc3RlcjogTWFjaGluZVJlZ2lzdGVyLCB2YWx1ZTogbnVtYmVyKTogdm9pZDtcbiAgbG9hZFZhbHVlKHJlZ2lzdGVyOiBSZWdpc3RlciwgdmFsdWU6IHVua25vd24pOiB2b2lkO1xuICBsb2FkVmFsdWUocmVnaXN0ZXI6IFJlZ2lzdGVyIHwgTWFjaGluZVJlZ2lzdGVyLCB2YWx1ZTogdW5rbm93bik6IHZvaWQ7XG5cbiAgZmV0Y2hWYWx1ZShyZWdpc3RlcjogTWFjaGluZVJlZ2lzdGVyLnJhIHwgTWFjaGluZVJlZ2lzdGVyLnBjKTogbnVtYmVyO1xuICAvLyBUT0RPOiBTb21ldGhpbmcgYmV0dGVyIHRoYW4gYSB0eXBlIGFzc2VydGlvbj9cbiAgZmV0Y2hWYWx1ZTxUPihyZWdpc3RlcjogUmVnaXN0ZXIpOiBUO1xuICBmZXRjaFZhbHVlKHJlZ2lzdGVyOiBSZWdpc3Rlcik6IHVua25vd247XG5cbiAgbG9hZChyZWdpc3RlcjogUmVnaXN0ZXIpOiB2b2lkO1xuICBmZXRjaChyZWdpc3RlcjogUmVnaXN0ZXIpOiB2b2lkO1xuXG4gIHNjb3BlKCk6IFNjb3BlPEM+O1xuICBlbGVtZW50cygpOiBFbGVtZW50QnVpbGRlcjtcblxuICBnZXRTZWxmKCk6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG5cbiAgdXBkYXRlV2l0aChvcGNvZGU6IFVwZGF0aW5nT3Bjb2RlKTogdm9pZDtcblxuICBhc3NvY2lhdGVEZXN0cm95YWJsZShkOiBTeW1ib2xEZXN0cm95YWJsZSB8IERlc3Ryb3lhYmxlKTogdm9pZDtcblxuICBiZWdpbkNhY2hlR3JvdXAoKTogdm9pZDtcbiAgY29tbWl0Q2FjaGVHcm91cCgpOiB2b2lkO1xuXG4gIC8vLyBJdGVyYXRpb24gLy8vXG5cbiAgZW50ZXJMaXN0KG9mZnNldDogbnVtYmVyKTogdm9pZDtcbiAgZXhpdExpc3QoKTogdm9pZDtcbiAgaXRlcmF0ZShtZW1vOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LCBpdGVtOiBQYXRoUmVmZXJlbmNlPHVua25vd24+KTogVHJ5T3Bjb2RlO1xuICBlbnRlckl0ZW0oa2V5OiB1bmtub3duLCBvcGNvZGU6IFRyeU9wY29kZSk6IHZvaWQ7XG5cbiAgcHVzaFJvb3RTY29wZShzaXplOiBudW1iZXIpOiBQYXJ0aWFsU2NvcGU8Qz47XG4gIHB1c2hDaGlsZFNjb3BlKCk6IHZvaWQ7XG4gIHBvcFNjb3BlKCk6IHZvaWQ7XG4gIHB1c2hTY29wZShzY29wZTogU2NvcGU8Qz4pOiB2b2lkO1xuXG4gIGR5bmFtaWNTY29wZSgpOiBEeW5hbWljU2NvcGU7XG4gIGJpbmREeW5hbWljU2NvcGUobmFtZXM6IG51bWJlcltdKTogdm9pZDtcbiAgcHVzaER5bmFtaWNTY29wZSgpOiB2b2lkO1xuICBwb3BEeW5hbWljU2NvcGUoKTogdm9pZDtcblxuICBlbnRlcihhcmdzOiBudW1iZXIpOiB2b2lkO1xuICBleGl0KCk6IHZvaWQ7XG5cbiAgZ290byhwYzogbnVtYmVyKTogdm9pZDtcbiAgY2FsbChoYW5kbGU6IG51bWJlcik6IHZvaWQ7XG4gIHB1c2hGcmFtZSgpOiB2b2lkO1xuXG4gIHJlZmVyZW5jZUZvclN5bWJvbChzeW1ib2w6IG51bWJlcik6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG5cbiAgZXhlY3V0ZShpbml0aWFsaXplPzogKHZtOiB0aGlzKSA9PiB2b2lkKTogUmVuZGVyUmVzdWx0O1xuICBwdXNoVXBkYXRpbmcobGlzdD86IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KTogdm9pZDtcbiAgbmV4dCgpOiBSaWNoSXRlcmF0b3JSZXN1bHQ8bnVsbCwgUmVuZGVyUmVzdWx0Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbnRlcm5hbEppdFZNIGV4dGVuZHMgSW50ZXJuYWxWTTxDb21waWxhYmxlQmxvY2s+IHtcbiAgY29tcGlsZShibG9jazogQ29tcGlsYWJsZVRlbXBsYXRlKTogbnVtYmVyO1xuICByZWFkb25seSBydW50aW1lOiBKaXRSdW50aW1lQ29udGV4dDtcbiAgcmVhZG9ubHkgY29udGV4dDogU3ludGF4Q29tcGlsYXRpb25Db250ZXh0O1xufVxuXG5jbGFzcyBTdGFja3M8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IHtcbiAgcmVhZG9ubHkgc2NvcGUgPSBuZXcgU3RhY2s8U2NvcGU8Qz4+KCk7XG4gIHJlYWRvbmx5IGR5bmFtaWNTY29wZSA9IG5ldyBTdGFjazxEeW5hbWljU2NvcGU+KCk7XG4gIHJlYWRvbmx5IHVwZGF0aW5nID0gbmV3IFN0YWNrPExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+PigpO1xuICByZWFkb25seSBjYWNoZSA9IG5ldyBTdGFjazxPcHRpb248VXBkYXRpbmdPcGNvZGU+PigpO1xuICByZWFkb25seSBsaXN0ID0gbmV3IFN0YWNrPExpc3RCbG9ja09wY29kZT4oKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgVk08QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IGltcGxlbWVudHMgUHVibGljVk0sIEludGVybmFsVk08Qz4ge1xuICBwcml2YXRlIHJlYWRvbmx5IFtTVEFDS1NdID0gbmV3IFN0YWNrczxDPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IFtIRUFQXTogUnVudGltZUhlYXA7XG4gIHByaXZhdGUgcmVhZG9ubHkgZGVzdHJ1Y3Rvcjogb2JqZWN0O1xuICBwcml2YXRlIHJlYWRvbmx5IFtERVNUUlVDVE9SX1NUQUNLXSA9IG5ldyBTdGFjazxvYmplY3Q+KCk7XG4gIHJlYWRvbmx5IFtDT05TVEFOVFNdOiBSdW50aW1lQ29uc3RhbnRzO1xuICByZWFkb25seSBbQVJHU106IFZNQXJndW1lbnRzSW1wbDtcbiAgcmVhZG9ubHkgW0lOTkVSX1ZNXTogTG93TGV2ZWxWTTtcblxuICBnZXQgc3RhY2soKTogRXZhbHVhdGlvblN0YWNrIHtcbiAgICByZXR1cm4gdGhpc1tJTk5FUl9WTV0uc3RhY2sgYXMgRXZhbHVhdGlvblN0YWNrO1xuICB9XG5cbiAgY3VycmVudEJsb2NrKCk6IExpdmVCbG9jayB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHMoKS5ibG9jaygpO1xuICB9XG5cbiAgLyogUmVnaXN0ZXJzICovXG5cbiAgZ2V0IHBjKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXNbSU5ORVJfVk1dLmZldGNoUmVnaXN0ZXIoJHBjKTtcbiAgfVxuXG4gIHB1YmxpYyBzMDogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyBzMTogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyB0MDogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyB0MTogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyB2MDogdW5rbm93biA9IG51bGw7XG5cbiAgLy8gRmV0Y2ggYSB2YWx1ZSBmcm9tIGEgcmVnaXN0ZXIgb250byB0aGUgc3RhY2tcbiAgZmV0Y2gocmVnaXN0ZXI6IFN5c2NhbGxSZWdpc3Rlcik6IHZvaWQge1xuICAgIHRoaXMuc3RhY2sucHVzaCh0aGlzLmZldGNoVmFsdWUocmVnaXN0ZXIpKTtcbiAgfVxuXG4gIC8vIExvYWQgYSB2YWx1ZSBmcm9tIHRoZSBzdGFjayBpbnRvIGEgcmVnaXN0ZXJcbiAgbG9hZChyZWdpc3RlcjogU3lzY2FsbFJlZ2lzdGVyKSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5zdGFjay5wb3AoKTtcblxuICAgIHRoaXMubG9hZFZhbHVlKHJlZ2lzdGVyLCB2YWx1ZSk7XG4gIH1cblxuICAvLyBGZXRjaCBhIHZhbHVlIGZyb20gYSByZWdpc3RlclxuICBmZXRjaFZhbHVlKHJlZ2lzdGVyOiBNYWNoaW5lUmVnaXN0ZXIpOiBudW1iZXI7XG4gIGZldGNoVmFsdWU8VD4ocmVnaXN0ZXI6IFJlZ2lzdGVyKTogVDtcbiAgZmV0Y2hWYWx1ZShyZWdpc3RlcjogUmVnaXN0ZXIgfCBNYWNoaW5lUmVnaXN0ZXIpOiB1bmtub3duIHtcbiAgICBpZiAoaXNMb3dMZXZlbFJlZ2lzdGVyKHJlZ2lzdGVyKSkge1xuICAgICAgcmV0dXJuIHRoaXNbSU5ORVJfVk1dLmZldGNoUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIH1cblxuICAgIHN3aXRjaCAocmVnaXN0ZXIpIHtcbiAgICAgIGNhc2UgJHMwOlxuICAgICAgICByZXR1cm4gdGhpcy5zMDtcbiAgICAgIGNhc2UgJHMxOlxuICAgICAgICByZXR1cm4gdGhpcy5zMTtcbiAgICAgIGNhc2UgJHQwOlxuICAgICAgICByZXR1cm4gdGhpcy50MDtcbiAgICAgIGNhc2UgJHQxOlxuICAgICAgICByZXR1cm4gdGhpcy50MTtcbiAgICAgIGNhc2UgJHYwOlxuICAgICAgICByZXR1cm4gdGhpcy52MDtcbiAgICB9XG4gIH1cblxuICAvLyBMb2FkIGEgdmFsdWUgaW50byBhIHJlZ2lzdGVyXG5cbiAgbG9hZFZhbHVlPFQ+KHJlZ2lzdGVyOiBSZWdpc3RlciB8IE1hY2hpbmVSZWdpc3RlciwgdmFsdWU6IFQpOiB2b2lkIHtcbiAgICBpZiAoaXNMb3dMZXZlbFJlZ2lzdGVyKHJlZ2lzdGVyKSkge1xuICAgICAgdGhpc1tJTk5FUl9WTV0ubG9hZFJlZ2lzdGVyKHJlZ2lzdGVyLCAodmFsdWUgYXMgYW55KSBhcyBudW1iZXIpO1xuICAgIH1cblxuICAgIHN3aXRjaCAocmVnaXN0ZXIpIHtcbiAgICAgIGNhc2UgJHMwOlxuICAgICAgICB0aGlzLnMwID0gdmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAkczE6XG4gICAgICAgIHRoaXMuczEgPSB2YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICR0MDpcbiAgICAgICAgdGhpcy50MCA9IHZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJHQxOlxuICAgICAgICB0aGlzLnQxID0gdmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAkdjA6XG4gICAgICAgIHRoaXMudjAgPSB2YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1pZ3JhdGVkIHRvIElubmVyXG4gICAqL1xuXG4gIC8vIFN0YXJ0IGEgbmV3IGZyYW1lIGFuZCBzYXZlICRyYSBhbmQgJGZwIG9uIHRoZSBzdGFja1xuICBwdXNoRnJhbWUoKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucHVzaEZyYW1lKCk7XG4gIH1cblxuICAvLyBSZXN0b3JlICRyYSwgJHNwIGFuZCAkZnBcbiAgcG9wRnJhbWUoKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucG9wRnJhbWUoKTtcbiAgfVxuXG4gIC8vIEp1bXAgdG8gYW4gYWRkcmVzcyBpbiBgcHJvZ3JhbWBcbiAgZ290byhvZmZzZXQ6IG51bWJlcikge1xuICAgIHRoaXNbSU5ORVJfVk1dLmdvdG8ob2Zmc2V0KTtcbiAgfVxuXG4gIC8vIFNhdmUgJHBjIGludG8gJHJhLCB0aGVuIGp1bXAgdG8gYSBuZXcgYWRkcmVzcyBpbiBgcHJvZ3JhbWAgKGphbCBpbiBNSVBTKVxuICBjYWxsKGhhbmRsZTogbnVtYmVyKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0uY2FsbChoYW5kbGUpO1xuICB9XG5cbiAgLy8gUHV0IGEgc3BlY2lmaWMgYHByb2dyYW1gIGFkZHJlc3MgaW4gJHJhXG4gIHJldHVyblRvKG9mZnNldDogbnVtYmVyKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucmV0dXJuVG8ob2Zmc2V0KTtcbiAgfVxuXG4gIC8vIFJldHVybiB0byB0aGUgYHByb2dyYW1gIGFkZHJlc3Mgc3RvcmVkIGluICRyYVxuICByZXR1cm4oKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucmV0dXJuKCk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIG9mIG1pZ3JhdGVkLlxuICAgKi9cblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBydW50aW1lOiBSdW50aW1lQ29udGV4dCxcbiAgICB7IHBjLCBzY29wZSwgZHluYW1pY1Njb3BlLCBzdGFjayB9OiBWTVN0YXRlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZWxlbWVudFN0YWNrOiBFbGVtZW50QnVpbGRlclxuICApIHtcbiAgICBsZXQgZXZhbFN0YWNrID0gRXZhbHVhdGlvblN0YWNrSW1wbC5yZXN0b3JlKHN0YWNrKTtcblxuICAgIGFzc2VydCh0eXBlb2YgcGMgPT09ICdudW1iZXInLCAncGMgaXMgYSBudW1iZXInKTtcblxuICAgIGV2YWxTdGFja1tSRUdJU1RFUlNdWyRwY10gPSBwYztcbiAgICBldmFsU3RhY2tbUkVHSVNURVJTXVskc3BdID0gc3RhY2subGVuZ3RoIC0gMTtcbiAgICBldmFsU3RhY2tbUkVHSVNURVJTXVskZnBdID0gLTE7XG5cbiAgICB0aGlzW0hFQVBdID0gdGhpcy5wcm9ncmFtLmhlYXA7XG4gICAgdGhpc1tDT05TVEFOVFNdID0gdGhpcy5wcm9ncmFtLmNvbnN0YW50cztcbiAgICB0aGlzLmVsZW1lbnRTdGFjayA9IGVsZW1lbnRTdGFjaztcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucHVzaChzY29wZSk7XG4gICAgdGhpc1tTVEFDS1NdLmR5bmFtaWNTY29wZS5wdXNoKGR5bmFtaWNTY29wZSk7XG4gICAgdGhpc1tBUkdTXSA9IG5ldyBWTUFyZ3VtZW50c0ltcGwoKTtcbiAgICB0aGlzW0lOTkVSX1ZNXSA9IG5ldyBMb3dMZXZlbFZNKFxuICAgICAgZXZhbFN0YWNrLFxuICAgICAgdGhpc1tIRUFQXSxcbiAgICAgIHJ1bnRpbWUucHJvZ3JhbSxcbiAgICAgIHtcbiAgICAgICAgZGVidWdCZWZvcmU6IChvcGNvZGU6IFJ1bnRpbWVPcEltcGwpOiBEZWJ1Z1N0YXRlID0+IHtcbiAgICAgICAgICByZXR1cm4gQVBQRU5EX09QQ09ERVMuZGVidWdCZWZvcmUodGhpcywgb3Bjb2RlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWJ1Z0FmdGVyOiAoc3RhdGU6IERlYnVnU3RhdGUpOiB2b2lkID0+IHtcbiAgICAgICAgICBBUFBFTkRfT1BDT0RFUy5kZWJ1Z0FmdGVyKHRoaXMsIHN0YXRlKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBldmFsU3RhY2tbUkVHSVNURVJTXVxuICAgICk7XG5cbiAgICB0aGlzLmRlc3RydWN0b3IgPSB7fTtcbiAgICB0aGlzW0RFU1RSVUNUT1JfU1RBQ0tdLnB1c2godGhpcy5kZXN0cnVjdG9yKTtcbiAgfVxuXG4gIGdldCBwcm9ncmFtKCk6IFJ1bnRpbWVQcm9ncmFtIHtcbiAgICByZXR1cm4gdGhpcy5ydW50aW1lLnByb2dyYW07XG4gIH1cblxuICBnZXQgZW52KCk6IEVudmlyb25tZW50IHtcbiAgICByZXR1cm4gdGhpcy5ydW50aW1lLmVudjtcbiAgfVxuXG4gIGNhcHR1cmVTdGF0ZShhcmdzOiBudW1iZXIsIHBjID0gdGhpc1tJTk5FUl9WTV0uZmV0Y2hSZWdpc3RlcigkcGMpKTogVk1TdGF0ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBjLFxuICAgICAgZHluYW1pY1Njb3BlOiB0aGlzLmR5bmFtaWNTY29wZSgpLFxuICAgICAgc2NvcGU6IHRoaXMuc2NvcGUoKSxcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLmNhcHR1cmUoYXJncyksXG4gICAgfTtcbiAgfVxuXG4gIGFic3RyYWN0IGNhcHR1cmUoYXJnczogbnVtYmVyLCBwYz86IG51bWJlcik6IFJlc3VtYWJsZVZNU3RhdGU8SW50ZXJuYWxWTT47XG5cbiAgYmVnaW5DYWNoZUdyb3VwKCkge1xuICAgIHRoaXNbU1RBQ0tTXS5jYWNoZS5wdXNoKHRoaXMudXBkYXRpbmcoKS50YWlsKCkpO1xuICB9XG5cbiAgY29tbWl0Q2FjaGVHcm91cCgpIHtcbiAgICBsZXQgRU5EID0gbmV3IExhYmVsT3Bjb2RlKCdFTkQnKTtcblxuICAgIGxldCBvcGNvZGVzID0gdGhpcy51cGRhdGluZygpO1xuICAgIGxldCBtYXJrZXIgPSB0aGlzW1NUQUNLU10uY2FjaGUucG9wKCk7XG4gICAgbGV0IGhlYWQgPSBtYXJrZXIgPyBvcGNvZGVzLm5leHROb2RlKG1hcmtlcikgOiBvcGNvZGVzLmhlYWQoKTtcbiAgICBsZXQgdGFpbCA9IG9wY29kZXMudGFpbCgpO1xuICAgIGxldCB0YWcgPSBjb21iaW5lU2xpY2UobmV3IExpc3RTbGljZShoZWFkLCB0YWlsKSk7XG5cbiAgICBsZXQgZ3VhcmQgPSBuZXcgSnVtcElmTm90TW9kaWZpZWRPcGNvZGUodGFnLCBFTkQpO1xuXG4gICAgb3Bjb2Rlcy5pbnNlcnRCZWZvcmUoZ3VhcmQsIGhlYWQpO1xuICAgIG9wY29kZXMuYXBwZW5kKG5ldyBEaWRNb2RpZnlPcGNvZGUoZ3VhcmQpKTtcbiAgICBvcGNvZGVzLmFwcGVuZChFTkQpO1xuICB9XG5cbiAgZW50ZXIoYXJnczogbnVtYmVyKSB7XG4gICAgbGV0IHVwZGF0aW5nID0gbmV3IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KCk7XG5cbiAgICBsZXQgc3RhdGUgPSB0aGlzLmNhcHR1cmUoYXJncyk7XG4gICAgbGV0IGJsb2NrID0gdGhpcy5lbGVtZW50cygpLnB1c2hVcGRhdGFibGVCbG9jaygpO1xuXG4gICAgbGV0IHRyeU9wY29kZSA9IG5ldyBUcnlPcGNvZGUoc3RhdGUsIHRoaXMucnVudGltZSwgYmxvY2ssIHVwZGF0aW5nKTtcblxuICAgIHRoaXMuZGlkRW50ZXIodHJ5T3Bjb2RlKTtcbiAgfVxuXG4gIGl0ZXJhdGUoXG4gICAgbWVtbzogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICB2YWx1ZTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPlxuICApOiBUcnlPcGNvZGUge1xuICAgIGxldCBzdGFjayA9IHRoaXMuc3RhY2s7XG4gICAgc3RhY2sucHVzaCh2YWx1ZSk7XG4gICAgc3RhY2sucHVzaChtZW1vKTtcblxuICAgIGxldCBzdGF0ZSA9IHRoaXMuY2FwdHVyZSgyKTtcbiAgICBsZXQgYmxvY2sgPSB0aGlzLmVsZW1lbnRzKCkucHVzaFVwZGF0YWJsZUJsb2NrKCk7XG5cbiAgICAvLyBsZXQgaXAgPSB0aGlzLmlwO1xuICAgIC8vIHRoaXMuaXAgPSBlbmQgKyA0O1xuICAgIC8vIHRoaXMuZnJhbWVzLnB1c2goaXApO1xuXG4gICAgcmV0dXJuIG5ldyBUcnlPcGNvZGUoc3RhdGUsIHRoaXMucnVudGltZSwgYmxvY2ssIG5ldyBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPigpKTtcbiAgfVxuXG4gIGVudGVySXRlbShrZXk6IHN0cmluZywgb3Bjb2RlOiBUcnlPcGNvZGUpIHtcbiAgICB0aGlzLmxpc3RCbG9jaygpLm1hcC5zZXQoa2V5LCBvcGNvZGUpO1xuICAgIHRoaXMuZGlkRW50ZXIob3Bjb2RlKTtcbiAgfVxuXG4gIGVudGVyTGlzdChvZmZzZXQ6IG51bWJlcikge1xuICAgIGxldCB1cGRhdGluZyA9IG5ldyBMaW5rZWRMaXN0PEJsb2NrT3Bjb2RlPigpO1xuXG4gICAgbGV0IGFkZHIgPSB0aGlzW0lOTkVSX1ZNXS50YXJnZXQob2Zmc2V0KTtcbiAgICBsZXQgc3RhdGUgPSB0aGlzLmNhcHR1cmUoMCwgYWRkcik7XG4gICAgbGV0IGxpc3QgPSB0aGlzLmVsZW1lbnRzKCkucHVzaEJsb2NrTGlzdCh1cGRhdGluZyk7XG4gICAgbGV0IGFydGlmYWN0cyA9IHRoaXMuc3RhY2sucGVlazxSZWZlcmVuY2VJdGVyYXRvcj4oKS5hcnRpZmFjdHM7XG5cbiAgICBsZXQgb3Bjb2RlID0gbmV3IExpc3RCbG9ja09wY29kZShzdGF0ZSwgdGhpcy5ydW50aW1lLCBsaXN0LCB1cGRhdGluZywgYXJ0aWZhY3RzKTtcblxuICAgIHRoaXNbU1RBQ0tTXS5saXN0LnB1c2gob3Bjb2RlKTtcblxuICAgIHRoaXMuZGlkRW50ZXIob3Bjb2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgZGlkRW50ZXIob3Bjb2RlOiBCbG9ja09wY29kZSkge1xuICAgIHRoaXMuYXNzb2NpYXRlRGVzdHJ1Y3RvcihkZXN0cnVjdG9yKG9wY29kZSkpO1xuICAgIHRoaXNbREVTVFJVQ1RPUl9TVEFDS10ucHVzaChvcGNvZGUpO1xuICAgIHRoaXMudXBkYXRlV2l0aChvcGNvZGUpO1xuICAgIHRoaXMucHVzaFVwZGF0aW5nKG9wY29kZS5jaGlsZHJlbik7XG4gIH1cblxuICBleGl0KCkge1xuICAgIHRoaXNbREVTVFJVQ1RPUl9TVEFDS10ucG9wKCk7XG4gICAgdGhpcy5lbGVtZW50cygpLnBvcEJsb2NrKCk7XG4gICAgdGhpcy5wb3BVcGRhdGluZygpO1xuXG4gICAgbGV0IHBhcmVudCA9IHRoaXMudXBkYXRpbmcoKS50YWlsKCkgYXMgQmxvY2tPcGNvZGU7XG5cbiAgICBwYXJlbnQuZGlkSW5pdGlhbGl6ZUNoaWxkcmVuKCk7XG4gIH1cblxuICBleGl0TGlzdCgpIHtcbiAgICB0aGlzLmV4aXQoKTtcbiAgICB0aGlzW1NUQUNLU10ubGlzdC5wb3AoKTtcbiAgfVxuXG4gIHB1c2hVcGRhdGluZyhsaXN0ID0gbmV3IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KCkpOiB2b2lkIHtcbiAgICB0aGlzW1NUQUNLU10udXBkYXRpbmcucHVzaChsaXN0KTtcbiAgfVxuXG4gIHBvcFVwZGF0aW5nKCk6IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+IHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXNbU1RBQ0tTXS51cGRhdGluZy5wb3AoKSwgXCJjYW4ndCBwb3AgYW4gZW1wdHkgc3RhY2tcIik7XG4gIH1cblxuICB1cGRhdGVXaXRoKG9wY29kZTogVXBkYXRpbmdPcGNvZGUpIHtcbiAgICB0aGlzLnVwZGF0aW5nKCkuYXBwZW5kKG9wY29kZSk7XG4gIH1cblxuICBsaXN0QmxvY2soKTogTGlzdEJsb2NrT3Bjb2RlIHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXNbU1RBQ0tTXS5saXN0LmN1cnJlbnQsICdleHBlY3RlZCBhIGxpc3QgYmxvY2snKTtcbiAgfVxuXG4gIGFzc29jaWF0ZURlc3RydWN0b3IoY2hpbGQ6IERyb3ApOiB2b2lkIHtcbiAgICBpZiAoIWlzRHJvcChjaGlsZCkpIHJldHVybjtcbiAgICBsZXQgcGFyZW50ID0gZXhwZWN0KHRoaXNbREVTVFJVQ1RPUl9TVEFDS10uY3VycmVudCwgJ0V4cGVjdGVkIGRlc3RydWN0b3IgcGFyZW50Jyk7XG4gICAgYXNzb2NpYXRlRGVzdHJ1Y3RvcihwYXJlbnQsIGNoaWxkKTtcbiAgfVxuXG4gIGFzc29jaWF0ZURlc3Ryb3lhYmxlKGNoaWxkOiBTeW1ib2xEZXN0cm95YWJsZSB8IERlc3Ryb3lhYmxlKTogdm9pZCB7XG4gICAgdGhpcy5hc3NvY2lhdGVEZXN0cnVjdG9yKGRlc3RydWN0b3IoY2hpbGQpKTtcbiAgfVxuXG4gIHRyeVVwZGF0aW5nKCk6IE9wdGlvbjxMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPj4ge1xuICAgIHJldHVybiB0aGlzW1NUQUNLU10udXBkYXRpbmcuY3VycmVudDtcbiAgfVxuXG4gIHVwZGF0aW5nKCk6IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+IHtcbiAgICByZXR1cm4gZXhwZWN0KFxuICAgICAgdGhpc1tTVEFDS1NdLnVwZGF0aW5nLmN1cnJlbnQsXG4gICAgICAnZXhwZWN0ZWQgdXBkYXRpbmcgb3Bjb2RlIG9uIHRoZSB1cGRhdGluZyBvcGNvZGUgc3RhY2snXG4gICAgKTtcbiAgfVxuXG4gIGVsZW1lbnRzKCk6IEVsZW1lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2s7XG4gIH1cblxuICBzY29wZSgpOiBTY29wZTxDPiB7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzW1NUQUNLU10uc2NvcGUuY3VycmVudCwgJ2V4cGVjdGVkIHNjb3BlIG9uIHRoZSBzY29wZSBzdGFjaycpO1xuICB9XG5cbiAgZHluYW1pY1Njb3BlKCk6IER5bmFtaWNTY29wZSB7XG4gICAgcmV0dXJuIGV4cGVjdChcbiAgICAgIHRoaXNbU1RBQ0tTXS5keW5hbWljU2NvcGUuY3VycmVudCxcbiAgICAgICdleHBlY3RlZCBkeW5hbWljIHNjb3BlIG9uIHRoZSBkeW5hbWljIHNjb3BlIHN0YWNrJ1xuICAgICk7XG4gIH1cblxuICBwdXNoQ2hpbGRTY29wZSgpIHtcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucHVzaCh0aGlzLnNjb3BlKCkuY2hpbGQoKSk7XG4gIH1cblxuICBwdXNoRHluYW1pY1Njb3BlKCk6IER5bmFtaWNTY29wZSB7XG4gICAgbGV0IGNoaWxkID0gdGhpcy5keW5hbWljU2NvcGUoKS5jaGlsZCgpO1xuICAgIHRoaXNbU1RBQ0tTXS5keW5hbWljU2NvcGUucHVzaChjaGlsZCk7XG4gICAgcmV0dXJuIGNoaWxkO1xuICB9XG5cbiAgcHVzaFJvb3RTY29wZShzaXplOiBudW1iZXIpOiBQYXJ0aWFsU2NvcGU8Qz4ge1xuICAgIGxldCBzY29wZSA9IFNjb3BlSW1wbC5zaXplZDxDPihzaXplKTtcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucHVzaChzY29wZSk7XG4gICAgcmV0dXJuIHNjb3BlO1xuICB9XG5cbiAgcHVzaFNjb3BlKHNjb3BlOiBTY29wZTxDPikge1xuICAgIHRoaXNbU1RBQ0tTXS5zY29wZS5wdXNoKHNjb3BlKTtcbiAgfVxuXG4gIHBvcFNjb3BlKCkge1xuICAgIHRoaXNbU1RBQ0tTXS5zY29wZS5wb3AoKTtcbiAgfVxuXG4gIHBvcER5bmFtaWNTY29wZSgpIHtcbiAgICB0aGlzW1NUQUNLU10uZHluYW1pY1Njb3BlLnBvcCgpO1xuICB9XG5cbiAgLy8vIFNDT1BFIEhFTFBFUlNcblxuICBnZXRTZWxmKCk6IFBhdGhSZWZlcmVuY2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc2NvcGUoKS5nZXRTZWxmKCk7XG4gIH1cblxuICByZWZlcmVuY2VGb3JTeW1ib2woc3ltYm9sOiBudW1iZXIpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gdGhpcy5zY29wZSgpLmdldFN5bWJvbChzeW1ib2wpO1xuICB9XG5cbiAgLy8vIEVYRUNVVElPTlxuXG4gIGV4ZWN1dGUoaW5pdGlhbGl6ZT86ICh2bTogdGhpcykgPT4gdm9pZCk6IFJlbmRlclJlc3VsdCB7XG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zb2xlLmxvZyhgRVhFQ1VUSU5HIEZST00gJHt0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYyl9YCk7XG4gICAgfVxuXG4gICAgaWYgKGluaXRpYWxpemUpIGluaXRpYWxpemUodGhpcyk7XG5cbiAgICBsZXQgcmVzdWx0OiBSaWNoSXRlcmF0b3JSZXN1bHQ8bnVsbCwgUmVuZGVyUmVzdWx0PjtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLm5leHQoKTtcbiAgICAgIGlmIChyZXN1bHQuZG9uZSkgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdC52YWx1ZTtcbiAgfVxuXG4gIG5leHQoKTogUmljaEl0ZXJhdG9yUmVzdWx0PG51bGwsIFJlbmRlclJlc3VsdD4ge1xuICAgIGxldCB7IGVudiwgZWxlbWVudFN0YWNrIH0gPSB0aGlzO1xuICAgIGxldCBvcGNvZGUgPSB0aGlzW0lOTkVSX1ZNXS5uZXh0U3RhdGVtZW50KCk7XG4gICAgbGV0IHJlc3VsdDogUmljaEl0ZXJhdG9yUmVzdWx0PG51bGwsIFJlbmRlclJlc3VsdD47XG4gICAgaWYgKG9wY29kZSAhPT0gbnVsbCkge1xuICAgICAgdGhpc1tJTk5FUl9WTV0uZXZhbHVhdGVPdXRlcihvcGNvZGUsIHRoaXMpO1xuICAgICAgcmVzdWx0ID0geyBkb25lOiBmYWxzZSwgdmFsdWU6IG51bGwgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVW5sb2FkIHRoZSBzdGFja1xuICAgICAgdGhpcy5zdGFjay5yZXNldCgpO1xuXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIGRvbmU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgUmVuZGVyUmVzdWx0SW1wbChcbiAgICAgICAgICBlbnYsXG4gICAgICAgICAgdGhpcy5wb3BVcGRhdGluZygpLFxuICAgICAgICAgIGVsZW1lbnRTdGFjay5wb3BCbG9jaygpLFxuICAgICAgICAgIHRoaXMuZGVzdHJ1Y3RvclxuICAgICAgICApLFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGJpbmREeW5hbWljU2NvcGUobmFtZXM6IG51bWJlcltdKSB7XG4gICAgbGV0IHNjb3BlID0gdGhpcy5keW5hbWljU2NvcGUoKTtcblxuICAgIGZvciAobGV0IGkgPSBuYW1lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgbGV0IG5hbWUgPSB0aGlzW0NPTlNUQU5UU10uZ2V0U3RyaW5nKG5hbWVzW2ldKTtcbiAgICAgIHNjb3BlLnNldChuYW1lLCB0aGlzLnN0YWNrLnBvcDxWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+PigpKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdm1TdGF0ZTxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4oXG4gIHBjOiBudW1iZXIsXG4gIHNjb3BlOiBTY29wZTxDPiA9IFNjb3BlSW1wbC5yb290PEM+KFVOREVGSU5FRF9SRUZFUkVOQ0UsIDApLFxuICBkeW5hbWljU2NvcGU6IER5bmFtaWNTY29wZVxuKSB7XG4gIHJldHVybiB7XG4gICAgcGMsXG4gICAgc2NvcGUsXG4gICAgZHluYW1pY1Njb3BlLFxuICAgIHN0YWNrOiBbXSxcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNaW5pbWFsSW5pdE9wdGlvbnMge1xuICBoYW5kbGU6IG51bWJlcjtcbiAgdHJlZUJ1aWxkZXI6IEVsZW1lbnRCdWlsZGVyO1xuICBkeW5hbWljU2NvcGU6IER5bmFtaWNTY29wZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbml0T3B0aW9ucyBleHRlbmRzIE1pbmltYWxJbml0T3B0aW9ucyB7XG4gIHNlbGY6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG59XG5cbmV4cG9ydCBjbGFzcyBBb3RWTSBleHRlbmRzIFZNPG51bWJlcj4gaW1wbGVtZW50cyBJbnRlcm5hbFZNPG51bWJlcj4ge1xuICBzdGF0aWMgZW1wdHkoXG4gICAgcnVudGltZTogQW90UnVudGltZUNvbnRleHQsXG4gICAgeyBoYW5kbGUsIHRyZWVCdWlsZGVyLCBkeW5hbWljU2NvcGUgfTogTWluaW1hbEluaXRPcHRpb25zXG4gICk6IEludGVybmFsVk08bnVtYmVyPiB7XG4gICAgbGV0IHZtID0gaW5pdEFPVChcbiAgICAgIHJ1bnRpbWUsXG4gICAgICB2bVN0YXRlKFxuICAgICAgICBydW50aW1lLnByb2dyYW0uaGVhcC5nZXRhZGRyKGhhbmRsZSksXG4gICAgICAgIFNjb3BlSW1wbC5yb290PG51bWJlcj4oVU5ERUZJTkVEX1JFRkVSRU5DRSwgMCksXG4gICAgICAgIGR5bmFtaWNTY29wZVxuICAgICAgKSxcbiAgICAgIHRyZWVCdWlsZGVyXG4gICAgKTtcbiAgICB2bS5wdXNoVXBkYXRpbmcoKTtcbiAgICByZXR1cm4gdm07XG4gIH1cblxuICBzdGF0aWMgaW5pdGlhbChcbiAgICBydW50aW1lOiBBb3RSdW50aW1lQ29udGV4dCxcbiAgICB7IGhhbmRsZSwgc2VsZiwgdHJlZUJ1aWxkZXIsIGR5bmFtaWNTY29wZSB9OiBJbml0T3B0aW9uc1xuICApIHtcbiAgICBsZXQgc2NvcGVTaXplID0gcnVudGltZS5wcm9ncmFtLmhlYXAuc2NvcGVzaXplb2YoaGFuZGxlKTtcbiAgICBsZXQgc2NvcGUgPSBTY29wZUltcGwucm9vdChzZWxmLCBzY29wZVNpemUpO1xuICAgIGxldCBwYyA9IGNoZWNrKHJ1bnRpbWUucHJvZ3JhbS5oZWFwLmdldGFkZHIoaGFuZGxlKSwgQ2hlY2tOdW1iZXIpO1xuICAgIGxldCBzdGF0ZSA9IHZtU3RhdGUocGMsIHNjb3BlLCBkeW5hbWljU2NvcGUpO1xuICAgIGxldCB2bSA9IGluaXRBT1QocnVudGltZSwgc3RhdGUsIHRyZWVCdWlsZGVyKTtcbiAgICB2bS5wdXNoVXBkYXRpbmcoKTtcbiAgICByZXR1cm4gdm07XG4gIH1cblxuICBjYXB0dXJlKGFyZ3M6IG51bWJlciwgcGMgPSB0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYykpOiBSZXN1bWFibGVWTVN0YXRlPEFvdFZNPiB7XG4gICAgcmV0dXJuIG5ldyBSZXN1bWFibGVWTVN0YXRlSW1wbCh0aGlzLmNhcHR1cmVTdGF0ZShhcmdzLCBwYyksIGluaXRBT1QpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFZtSW5pdENhbGxiYWNrPFYgZXh0ZW5kcyBJbnRlcm5hbFZNID0gSW50ZXJuYWxWTT4gPSAoXG4gIHRoaXM6IHZvaWQsXG4gIHJ1bnRpbWU6IFYgZXh0ZW5kcyBKaXRWTSA/IEppdFJ1bnRpbWVDb250ZXh0IDogQW90UnVudGltZUNvbnRleHQsXG4gIHN0YXRlOiBWTVN0YXRlLFxuICBidWlsZGVyOiBFbGVtZW50QnVpbGRlclxuKSA9PiBWO1xuXG5leHBvcnQgdHlwZSBKaXRWbUluaXRDYWxsYmFjazxWIGV4dGVuZHMgSW50ZXJuYWxWTT4gPSAoXG4gIHRoaXM6IHZvaWQsXG4gIHJ1bnRpbWU6IEppdFJ1bnRpbWVDb250ZXh0LFxuICBzdGF0ZTogVk1TdGF0ZSxcbiAgYnVpbGRlcjogRWxlbWVudEJ1aWxkZXJcbikgPT4gVjtcblxuZnVuY3Rpb24gaW5pdEFPVChydW50aW1lOiBBb3RSdW50aW1lQ29udGV4dCwgc3RhdGU6IFZNU3RhdGUsIGJ1aWxkZXI6IEVsZW1lbnRCdWlsZGVyKTogQW90Vk0ge1xuICByZXR1cm4gbmV3IEFvdFZNKHJ1bnRpbWUsIHN0YXRlLCBidWlsZGVyKTtcbn1cblxuZnVuY3Rpb24gaW5pdEpJVChjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHQpOiBKaXRWbUluaXRDYWxsYmFjazxKaXRWTT4ge1xuICByZXR1cm4gKHJ1bnRpbWUsIHN0YXRlLCBidWlsZGVyKSA9PiBuZXcgSml0Vk0ocnVudGltZSwgc3RhdGUsIGJ1aWxkZXIsIGNvbnRleHQpO1xufVxuXG5leHBvcnQgY2xhc3MgSml0Vk0gZXh0ZW5kcyBWTTxDb21waWxhYmxlQmxvY2s+IGltcGxlbWVudHMgSW50ZXJuYWxKaXRWTSB7XG4gIHN0YXRpYyBpbml0aWFsKFxuICAgIHJ1bnRpbWU6IEppdFJ1bnRpbWVDb250ZXh0LFxuICAgIGNvbnRleHQ6IFN5bnRheENvbXBpbGF0aW9uQ29udGV4dCxcbiAgICB7IGhhbmRsZSwgc2VsZiwgZHluYW1pY1Njb3BlLCB0cmVlQnVpbGRlciB9OiBJbml0T3B0aW9uc1xuICApIHtcbiAgICBsZXQgc2NvcGVTaXplID0gcnVudGltZS5wcm9ncmFtLmhlYXAuc2NvcGVzaXplb2YoaGFuZGxlKTtcbiAgICBsZXQgc2NvcGUgPSBTY29wZUltcGwucm9vdChzZWxmLCBzY29wZVNpemUpO1xuICAgIGxldCBzdGF0ZSA9IHZtU3RhdGUocnVudGltZS5wcm9ncmFtLmhlYXAuZ2V0YWRkcihoYW5kbGUpLCBzY29wZSwgZHluYW1pY1Njb3BlKTtcbiAgICBsZXQgdm0gPSBpbml0SklUKGNvbnRleHQpKHJ1bnRpbWUsIHN0YXRlLCB0cmVlQnVpbGRlcik7XG4gICAgdm0ucHVzaFVwZGF0aW5nKCk7XG4gICAgcmV0dXJuIHZtO1xuICB9XG5cbiAgc3RhdGljIGVtcHR5KFxuICAgIHJ1bnRpbWU6IEppdFJ1bnRpbWVDb250ZXh0LFxuICAgIHsgaGFuZGxlLCB0cmVlQnVpbGRlciwgZHluYW1pY1Njb3BlIH06IE1pbmltYWxJbml0T3B0aW9ucyxcbiAgICBjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHRcbiAgKSB7XG4gICAgbGV0IHZtID0gaW5pdEpJVChjb250ZXh0KShcbiAgICAgIHJ1bnRpbWUsXG4gICAgICB2bVN0YXRlKFxuICAgICAgICBydW50aW1lLnByb2dyYW0uaGVhcC5nZXRhZGRyKGhhbmRsZSksXG4gICAgICAgIFNjb3BlSW1wbC5yb290PENvbXBpbGFibGVCbG9jaz4oVU5ERUZJTkVEX1JFRkVSRU5DRSwgMCksXG4gICAgICAgIGR5bmFtaWNTY29wZVxuICAgICAgKSxcbiAgICAgIHRyZWVCdWlsZGVyXG4gICAgKTtcbiAgICB2bS5wdXNoVXBkYXRpbmcoKTtcbiAgICByZXR1cm4gdm07XG4gIH1cblxuICByZWFkb25seSBydW50aW1lITogSml0UnVudGltZUNvbnRleHQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcnVudGltZTogSml0UnVudGltZUNvbnRleHQsXG4gICAgc3RhdGU6IFZNU3RhdGUsXG4gICAgZWxlbWVudFN0YWNrOiBFbGVtZW50QnVpbGRlcixcbiAgICByZWFkb25seSBjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHRcbiAgKSB7XG4gICAgc3VwZXIocnVudGltZSwgc3RhdGUsIGVsZW1lbnRTdGFjayk7XG4gIH1cblxuICBjYXB0dXJlKGFyZ3M6IG51bWJlciwgcGMgPSB0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYykpOiBSZXN1bWFibGVWTVN0YXRlPEppdFZNPiB7XG4gICAgcmV0dXJuIG5ldyBSZXN1bWFibGVWTVN0YXRlSW1wbCh0aGlzLmNhcHR1cmVTdGF0ZShhcmdzLCBwYyksIHRoaXMucmVzdW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdW1lOiBWbUluaXRDYWxsYmFjazxKaXRWTT4gPSBpbml0SklUKHRoaXMuY29udGV4dCk7XG5cbiAgY29tcGlsZShibG9jazogQ29tcGlsYWJsZVRlbXBsYXRlKTogbnVtYmVyIHtcbiAgICByZXR1cm4gYmxvY2suY29tcGlsZSh0aGlzLmNvbnRleHQpO1xuICB9XG59XG4iLCJpbXBvcnQge1xuICBEaWN0LFxuICBEeW5hbWljU2NvcGUsXG4gIEVudmlyb25tZW50LFxuICBJbnZvY2F0aW9uLFxuICBKaXRPckFvdEJsb2NrLFxuICBSZW5kZXJSZXN1bHQsXG4gIFJpY2hJdGVyYXRvclJlc3VsdCxcbiAgU3ludGF4Q29tcGlsYXRpb25Db250ZXh0LFxuICBXaXRoQW90U3RhdGljTGF5b3V0LFxuICBXaXRoSml0U3RhdGljTGF5b3V0LFxuICBUZW1wbGF0ZUl0ZXJhdG9yLFxuICBDdXJzb3IsXG4gIENvbXBvbmVudERlZmluaXRpb24sXG4gIEppdFJ1bnRpbWVDb250ZXh0LFxuICBBb3RSdW50aW1lQ29udGV4dCxcbiAgRWxlbWVudEJ1aWxkZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgUGF0aFJlZmVyZW5jZSB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBleHBlY3QgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IGNhcGFiaWxpdHlGbGFnc0Zyb20gfSBmcm9tICcuL2NhcGFiaWxpdGllcyc7XG5pbXBvcnQgeyBoYXNTdGF0aWNMYXlvdXRDYXBhYmlsaXR5IH0gZnJvbSAnLi9jb21waWxlZC9vcGNvZGVzL2NvbXBvbmVudCc7XG5pbXBvcnQgeyByZXNvbHZlQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnQvcmVzb2x2ZSc7XG5pbXBvcnQgeyBBUkdTIH0gZnJvbSAnLi9zeW1ib2xzJztcbmltcG9ydCB7IEFvdFZNLCBJbnRlcm5hbFZNLCBKaXRWTSB9IGZyb20gJy4vdm0vYXBwZW5kJztcbmltcG9ydCB7IE5ld0VsZW1lbnRCdWlsZGVyIH0gZnJvbSAnLi92bS9lbGVtZW50LWJ1aWxkZXInO1xuaW1wb3J0IHsgRGVmYXVsdER5bmFtaWNTY29wZSB9IGZyb20gJy4vZHluYW1pYy1zY29wZSc7XG5pbXBvcnQgeyBVTkRFRklORURfUkVGRVJFTkNFIH0gZnJvbSAnLi9yZWZlcmVuY2VzJztcblxuY2xhc3MgVGVtcGxhdGVJdGVyYXRvckltcGw8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IGltcGxlbWVudHMgVGVtcGxhdGVJdGVyYXRvciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdm06IEludGVybmFsVk08Qz4pIHt9XG4gIG5leHQoKTogUmljaEl0ZXJhdG9yUmVzdWx0PG51bGwsIFJlbmRlclJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLnZtLm5leHQoKTtcbiAgfVxuXG4gIHN5bmMoKTogUmVuZGVyUmVzdWx0IHtcbiAgICByZXR1cm4gcmVuZGVyU3luYyh0aGlzLnZtLnJ1bnRpbWUuZW52LCB0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU3luYyhlbnY6IEVudmlyb25tZW50LCBpdGVyYXRvcjogVGVtcGxhdGVJdGVyYXRvcik6IFJlbmRlclJlc3VsdCB7XG4gIGVudi5iZWdpbigpO1xuXG4gIGxldCBpdGVyYXRvclJlc3VsdDogSXRlcmF0b3JSZXN1bHQ8UmVuZGVyUmVzdWx0PjtcblxuICBkbyB7XG4gICAgaXRlcmF0b3JSZXN1bHQgPSBpdGVyYXRvci5uZXh0KCkgYXMgSXRlcmF0b3JSZXN1bHQ8UmVuZGVyUmVzdWx0PjtcbiAgfSB3aGlsZSAoIWl0ZXJhdG9yUmVzdWx0LmRvbmUpO1xuXG4gIGxldCByZXN1bHQgPSBpdGVyYXRvclJlc3VsdC52YWx1ZTtcblxuICBlbnYuY29tbWl0KCk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckFvdE1haW4oXG4gIHJ1bnRpbWU6IEFvdFJ1bnRpbWVDb250ZXh0LFxuICBzZWxmOiBQYXRoUmVmZXJlbmNlLFxuICB0cmVlQnVpbGRlcjogRWxlbWVudEJ1aWxkZXIsXG4gIGhhbmRsZTogbnVtYmVyLFxuICBkeW5hbWljU2NvcGU6IER5bmFtaWNTY29wZSA9IG5ldyBEZWZhdWx0RHluYW1pY1Njb3BlKClcbik6IFRlbXBsYXRlSXRlcmF0b3Ige1xuICBsZXQgdm0gPSBBb3RWTS5pbml0aWFsKHJ1bnRpbWUsIHsgc2VsZiwgZHluYW1pY1Njb3BlLCB0cmVlQnVpbGRlciwgaGFuZGxlIH0pO1xuICByZXR1cm4gbmV3IFRlbXBsYXRlSXRlcmF0b3JJbXBsKHZtKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckFvdChcbiAgcnVudGltZTogQW90UnVudGltZUNvbnRleHQsXG4gIGhhbmRsZTogbnVtYmVyLFxuICBjdXJzb3I6IEN1cnNvcixcbiAgc2VsZjogUGF0aFJlZmVyZW5jZSA9IFVOREVGSU5FRF9SRUZFUkVOQ0Vcbik6IFRlbXBsYXRlSXRlcmF0b3Ige1xuICBsZXQgdHJlZUJ1aWxkZXIgPSBOZXdFbGVtZW50QnVpbGRlci5mb3JJbml0aWFsUmVuZGVyKHJ1bnRpbWUuZW52LCBjdXJzb3IpO1xuICBsZXQgZHluYW1pY1Njb3BlID0gbmV3IERlZmF1bHREeW5hbWljU2NvcGUoKTtcbiAgbGV0IHZtID0gQW90Vk0uaW5pdGlhbChydW50aW1lLCB7IHNlbGYsIGR5bmFtaWNTY29wZSwgdHJlZUJ1aWxkZXIsIGhhbmRsZSB9KTtcbiAgcmV0dXJuIG5ldyBUZW1wbGF0ZUl0ZXJhdG9ySW1wbCh2bSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJKaXRNYWluKFxuICBydW50aW1lOiBKaXRSdW50aW1lQ29udGV4dCxcbiAgY29udGV4dDogU3ludGF4Q29tcGlsYXRpb25Db250ZXh0LFxuICBzZWxmOiBQYXRoUmVmZXJlbmNlLFxuICB0cmVlQnVpbGRlcjogRWxlbWVudEJ1aWxkZXIsXG4gIGhhbmRsZTogbnVtYmVyLFxuICBkeW5hbWljU2NvcGU6IER5bmFtaWNTY29wZSA9IG5ldyBEZWZhdWx0RHluYW1pY1Njb3BlKClcbik6IFRlbXBsYXRlSXRlcmF0b3Ige1xuICBsZXQgdm0gPSBKaXRWTS5pbml0aWFsKHJ1bnRpbWUsIGNvbnRleHQsIHsgc2VsZiwgZHluYW1pY1Njb3BlLCB0cmVlQnVpbGRlciwgaGFuZGxlIH0pO1xuICByZXR1cm4gbmV3IFRlbXBsYXRlSXRlcmF0b3JJbXBsKHZtKTtcbn1cblxuZXhwb3J0IHR5cGUgUmVuZGVyQ29tcG9uZW50QXJncyA9IERpY3Q8UGF0aFJlZmVyZW5jZT47XG5cbmZ1bmN0aW9uIHJlbmRlckludm9jYXRpb248QyBleHRlbmRzIEppdE9yQW90QmxvY2s+KFxuICB2bTogSW50ZXJuYWxWTTxDPixcbiAgaW52b2NhdGlvbjogSW52b2NhdGlvbixcbiAgZGVmaW5pdGlvbjogQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgYXJnczogUmVuZGVyQ29tcG9uZW50QXJnc1xuKTogVGVtcGxhdGVJdGVyYXRvciB7XG4gIC8vIEdldCBhIGxpc3Qgb2YgdHVwbGVzIG9mIGFyZ3VtZW50IG5hbWVzIGFuZCByZWZlcmVuY2VzLCBsaWtlXG4gIC8vIFtbJ3RpdGxlJywgcmVmZXJlbmNlXSwgWyduYW1lJywgcmVmZXJlbmNlXV1cbiAgY29uc3QgYXJnTGlzdCA9IE9iamVjdC5rZXlzKGFyZ3MpLm1hcChrZXkgPT4gW2tleSwgYXJnc1trZXldXSk7XG5cbiAgY29uc3QgYmxvY2tOYW1lcyA9IFsnbWFpbicsICdlbHNlJywgJ2F0dHJzJ107XG4gIC8vIFByZWZpeCBhcmd1bWVudCBuYW1lcyB3aXRoIGBAYCBzeW1ib2xcbiAgY29uc3QgYXJnTmFtZXMgPSBhcmdMaXN0Lm1hcCgoW25hbWVdKSA9PiBgQCR7bmFtZX1gKTtcblxuICB2bS5wdXNoRnJhbWUoKTtcblxuICAvLyBQdXNoIGJsb2NrcyBvbiB0byB0aGUgc3RhY2ssIHRocmVlIHN0YWNrIHZhbHVlcyBwZXIgYmxvY2tcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAzICogYmxvY2tOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgIHZtLnN0YWNrLnB1c2gobnVsbCk7XG4gIH1cblxuICB2bS5zdGFjay5wdXNoKG51bGwpO1xuXG4gIC8vIEZvciBlYWNoIGFyZ3VtZW50LCBwdXNoIGl0cyBiYWNraW5nIHJlZmVyZW5jZSBvbiB0byB0aGUgc3RhY2tcbiAgYXJnTGlzdC5mb3JFYWNoKChbLCByZWZlcmVuY2VdKSA9PiB7XG4gICAgdm0uc3RhY2sucHVzaChyZWZlcmVuY2UpO1xuICB9KTtcblxuICAvLyBDb25maWd1cmUgVk0gYmFzZWQgb24gYmxvY2tzIGFuZCBhcmdzIGp1c3QgcHVzaGVkIG9uIHRvIHRoZSBzdGFjay5cbiAgdm1bQVJHU10uc2V0dXAodm0uc3RhY2ssIGFyZ05hbWVzLCBibG9ja05hbWVzLCAwLCB0cnVlKTtcblxuICAvLyBOZWVkZWQgZm9yIHRoZSBPcC5NYWluIG9wY29kZTogYXJndW1lbnRzLCBjb21wb25lbnQgaW52b2NhdGlvbiBvYmplY3QsIGFuZFxuICAvLyBjb21wb25lbnQgZGVmaW5pdGlvbi5cbiAgdm0uc3RhY2sucHVzaCh2bVtBUkdTXSk7XG4gIHZtLnN0YWNrLnB1c2goaW52b2NhdGlvbik7XG4gIHZtLnN0YWNrLnB1c2goZGVmaW5pdGlvbik7XG5cbiAgcmV0dXJuIG5ldyBUZW1wbGF0ZUl0ZXJhdG9ySW1wbCh2bSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJBb3RDb21wb25lbnQ8Uj4oXG4gIHJ1bnRpbWU6IEFvdFJ1bnRpbWVDb250ZXh0PFI+LFxuICB0cmVlQnVpbGRlcjogRWxlbWVudEJ1aWxkZXIsXG4gIG1haW46IG51bWJlcixcbiAgbmFtZTogc3RyaW5nLFxuICBhcmdzOiBSZW5kZXJDb21wb25lbnRBcmdzID0ge30sXG4gIGR5bmFtaWNTY29wZTogRHluYW1pY1Njb3BlID0gbmV3IERlZmF1bHREeW5hbWljU2NvcGUoKVxuKTogVGVtcGxhdGVJdGVyYXRvciB7XG4gIGxldCB2bSA9IEFvdFZNLmVtcHR5KHJ1bnRpbWUsIHsgdHJlZUJ1aWxkZXIsIGhhbmRsZTogbWFpbiwgZHluYW1pY1Njb3BlIH0pO1xuXG4gIGNvbnN0IGRlZmluaXRpb24gPSBleHBlY3QoXG4gICAgcmVzb2x2ZUNvbXBvbmVudCh2bS5ydW50aW1lLnJlc29sdmVyLCBuYW1lKSxcbiAgICBgY291bGQgbm90IGZpbmQgY29tcG9uZW50IFwiJHtuYW1lfVwiYFxuICApO1xuXG4gIGNvbnN0IHsgbWFuYWdlciwgc3RhdGUgfSA9IGRlZmluaXRpb247XG5cbiAgY29uc3QgY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhzdGF0ZSkpO1xuXG4gIGxldCBpbnZvY2F0aW9uO1xuXG4gIGlmIChoYXNTdGF0aWNMYXlvdXRDYXBhYmlsaXR5KGNhcGFiaWxpdGllcywgbWFuYWdlcikpIHtcbiAgICBpbnZvY2F0aW9uID0gKG1hbmFnZXIgYXMgV2l0aEFvdFN0YXRpY0xheW91dCkuZ2V0QW90U3RhdGljTGF5b3V0KHN0YXRlLCB2bS5ydW50aW1lLnJlc29sdmVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBpbnZva2UgY29tcG9uZW50cyB3aXRoIGR5bmFtaWMgbGF5b3V0cyBhcyBhIHJvb3QgY29tcG9uZW50LicpO1xuICB9XG5cbiAgcmV0dXJuIHJlbmRlckludm9jYXRpb24odm0sIGludm9jYXRpb24sIGRlZmluaXRpb24sIGFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVySml0Q29tcG9uZW50KFxuICBydW50aW1lOiBKaXRSdW50aW1lQ29udGV4dCxcbiAgdHJlZUJ1aWxkZXI6IEVsZW1lbnRCdWlsZGVyLFxuICBjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHQsXG4gIG1haW46IG51bWJlcixcbiAgbmFtZTogc3RyaW5nLFxuICBhcmdzOiBSZW5kZXJDb21wb25lbnRBcmdzID0ge30sXG4gIGR5bmFtaWNTY29wZTogRHluYW1pY1Njb3BlID0gbmV3IERlZmF1bHREeW5hbWljU2NvcGUoKVxuKTogVGVtcGxhdGVJdGVyYXRvciB7XG4gIGxldCB2bSA9IEppdFZNLmVtcHR5KHJ1bnRpbWUsIHsgdHJlZUJ1aWxkZXIsIGhhbmRsZTogbWFpbiwgZHluYW1pY1Njb3BlIH0sIGNvbnRleHQpO1xuXG4gIGNvbnN0IGRlZmluaXRpb24gPSBleHBlY3QoXG4gICAgcmVzb2x2ZUNvbXBvbmVudCh2bS5ydW50aW1lLnJlc29sdmVyLCBuYW1lKSxcbiAgICBgY291bGQgbm90IGZpbmQgY29tcG9uZW50IFwiJHtuYW1lfVwiYFxuICApO1xuXG4gIGNvbnN0IHsgbWFuYWdlciwgc3RhdGUgfSA9IGRlZmluaXRpb247XG5cbiAgY29uc3QgY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhzdGF0ZSkpO1xuXG4gIGxldCBpbnZvY2F0aW9uOiBJbnZvY2F0aW9uO1xuXG4gIGlmIChoYXNTdGF0aWNMYXlvdXRDYXBhYmlsaXR5KGNhcGFiaWxpdGllcywgbWFuYWdlcikpIHtcbiAgICBsZXQgbGF5b3V0ID0gKG1hbmFnZXIgYXMgV2l0aEppdFN0YXRpY0xheW91dCkuZ2V0Sml0U3RhdGljTGF5b3V0KHN0YXRlLCB2bS5ydW50aW1lLnJlc29sdmVyKTtcbiAgICBpbnZvY2F0aW9uID0geyBoYW5kbGU6IGxheW91dC5jb21waWxlKGNvbnRleHQpLCBzeW1ib2xUYWJsZTogbGF5b3V0LnN5bWJvbFRhYmxlIH07XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgaW52b2tlIGNvbXBvbmVudHMgd2l0aCBkeW5hbWljIGxheW91dHMgYXMgYSByb290IGNvbXBvbmVudC4nKTtcbiAgfVxuXG4gIHJldHVybiByZW5kZXJJbnZvY2F0aW9uKHZtLCBpbnZvY2F0aW9uLCBkZWZpbml0aW9uLCBhcmdzKTtcbn1cbiIsImltcG9ydCB7IEJvdW5kcywgRW52aXJvbm1lbnQsIE9wdGlvbiwgRWxlbWVudEJ1aWxkZXIgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2VydCwgZXhwZWN0LCBTdGFjaywgTWF5YmUgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIEF0dHJOYW1lc3BhY2UsXG4gIE5hbWVzcGFjZSxcbiAgU2ltcGxlQXR0cixcbiAgU2ltcGxlQ29tbWVudCxcbiAgU2ltcGxlRWxlbWVudCxcbiAgU2ltcGxlTm9kZSxcbiAgU2ltcGxlVGV4dCxcbn0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IENvbmNyZXRlQm91bmRzLCBDdXJzb3JJbXBsIH0gZnJvbSAnLi4vYm91bmRzJztcbmltcG9ydCB7IENVUlNPUl9TVEFDSywgTmV3RWxlbWVudEJ1aWxkZXIsIFJlbW90ZUxpdmVCbG9jayB9IGZyb20gJy4vZWxlbWVudC1idWlsZGVyJztcblxuZXhwb3J0IGNvbnN0IFNFUklBTElaQVRJT05fRklSU1RfTk9ERV9TVFJJTkcgPSAnJStiOjAlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2VyaWFsaXphdGlvbkZpcnN0Tm9kZShub2RlOiBTaW1wbGVOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLm5vZGVWYWx1ZSA9PT0gU0VSSUFMSVpBVElPTl9GSVJTVF9OT0RFX1NUUklORztcbn1cblxuZXhwb3J0IGNsYXNzIFJlaHlkcmF0aW5nQ3Vyc29yIGV4dGVuZHMgQ3Vyc29ySW1wbCB7XG4gIGNhbmRpZGF0ZTogT3B0aW9uPFNpbXBsZU5vZGU+ID0gbnVsbDtcbiAgb3BlbkJsb2NrRGVwdGg6IG51bWJlcjtcbiAgaW5qZWN0ZWRPbWl0dGVkTm9kZSA9IGZhbHNlO1xuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT4sXG4gICAgcHVibGljIHJlYWRvbmx5IHN0YXJ0aW5nQmxvY2tEZXB0aDogbnVtYmVyXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnQsIG5leHRTaWJsaW5nKTtcbiAgICB0aGlzLm9wZW5CbG9ja0RlcHRoID0gc3RhcnRpbmdCbG9ja0RlcHRoIC0gMTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVoeWRyYXRlQnVpbGRlciBleHRlbmRzIE5ld0VsZW1lbnRCdWlsZGVyIGltcGxlbWVudHMgRWxlbWVudEJ1aWxkZXIge1xuICBwcml2YXRlIHVubWF0Y2hlZEF0dHJpYnV0ZXM6IE9wdGlvbjxTaW1wbGVBdHRyW10+ID0gbnVsbDtcbiAgW0NVUlNPUl9TVEFDS10hOiBTdGFjazxSZWh5ZHJhdGluZ0N1cnNvcj47IC8vIEhpZGVzIHByb3BlcnR5IG9uIGJhc2UgY2xhc3NcbiAgcHJpdmF0ZSBibG9ja0RlcHRoID0gMDtcblxuICAvLyBwcml2YXRlIGNhbmRpZGF0ZTogT3B0aW9uPFNpbXBsZU5vZGU+ID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihlbnY6IEVudmlyb25tZW50LCBwYXJlbnROb2RlOiBTaW1wbGVFbGVtZW50LCBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+KSB7XG4gICAgc3VwZXIoZW52LCBwYXJlbnROb2RlLCBuZXh0U2libGluZyk7XG4gICAgaWYgKG5leHRTaWJsaW5nKSB0aHJvdyBuZXcgRXJyb3IoJ1JlaHlkcmF0aW9uIHdpdGggbmV4dFNpYmxpbmcgbm90IHN1cHBvcnRlZCcpO1xuXG4gICAgbGV0IG5vZGUgPSB0aGlzLmN1cnJlbnRDdXJzb3IhLmVsZW1lbnQuZmlyc3RDaGlsZDtcblxuICAgIHdoaWxlIChub2RlICE9PSBudWxsKSB7XG4gICAgICBpZiAoaXNDb21tZW50KG5vZGUpICYmIGlzU2VyaWFsaXphdGlvbkZpcnN0Tm9kZShub2RlKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgIH1cblxuICAgIGFzc2VydChcbiAgICAgIG5vZGUsXG4gICAgICBgTXVzdCBoYXZlIG9wZW5pbmcgY29tbWVudCA8IS0tJHtTRVJJQUxJWkFUSU9OX0ZJUlNUX05PREVfU1RSSU5HfS0tPiBmb3IgcmVoeWRyYXRpb24uYFxuICAgICk7XG4gICAgdGhpcy5jYW5kaWRhdGUgPSBub2RlO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRDdXJzb3IoKTogT3B0aW9uPFJlaHlkcmF0aW5nQ3Vyc29yPiB7XG4gICAgcmV0dXJuIHRoaXNbQ1VSU09SX1NUQUNLXS5jdXJyZW50O1xuICB9XG5cbiAgZ2V0IGNhbmRpZGF0ZSgpOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICAgIGlmICh0aGlzLmN1cnJlbnRDdXJzb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRDdXJzb3IuY2FuZGlkYXRlITtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHNldCBjYW5kaWRhdGUobm9kZTogT3B0aW9uPFNpbXBsZU5vZGU+KSB7XG4gICAgdGhpcy5jdXJyZW50Q3Vyc29yIS5jYW5kaWRhdGUgPSBub2RlO1xuICB9XG5cbiAgcHVzaEVsZW1lbnQoZWxlbWVudDogU2ltcGxlRWxlbWVudCwgbmV4dFNpYmxpbmc6IE1heWJlPFNpbXBsZU5vZGU+ID0gbnVsbCkge1xuICAgIGxldCB7IGJsb2NrRGVwdGggPSAwIH0gPSB0aGlzO1xuICAgIGxldCBjdXJzb3IgPSBuZXcgUmVoeWRyYXRpbmdDdXJzb3IoZWxlbWVudCwgbmV4dFNpYmxpbmcsIGJsb2NrRGVwdGgpO1xuICAgIGxldCBjdXJyZW50Q3Vyc29yID0gdGhpcy5jdXJyZW50Q3Vyc29yO1xuICAgIGlmIChjdXJyZW50Q3Vyc29yKSB7XG4gICAgICBpZiAoY3VycmVudEN1cnNvci5jYW5kaWRhdGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIDxkaXY+ICAgPC0tLS0tLS0tLS0tLS0tLSAgY3VycmVudEN1cnNvci5lbGVtZW50XG4gICAgICAgICAqICAgPCEtLSUrYjoxJS0tPlxuICAgICAgICAgKiAgIDxkaXY+IDwtLS0tLS0tLS0tLS0tLS0gIGN1cnJlbnRDdXJzb3IuY2FuZGlkYXRlIC0+IGN1cnNvci5lbGVtZW50XG4gICAgICAgICAqICAgICA8IS0tJStiOjIlLS0+IDwtICBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZS5maXJzdENoaWxkIC0+IGN1cnNvci5jYW5kaWRhdGVcbiAgICAgICAgICogICAgIEZvb1xuICAgICAgICAgKiAgICAgPCEtLSUtYjoyJS0tPlxuICAgICAgICAgKiAgIDwvZGl2PlxuICAgICAgICAgKiAgIDwhLS0lLWI6MSUtLT4gIDwtLSAgYmVjb21lcyBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZVxuICAgICAgICAgKi9cblxuICAgICAgICAvLyB3aGVyZSB0byByZWh5ZHJhdGUgZnJvbSBpZiB3ZSBhcmUgaW4gcmVoeWRyYXRpb24gbW9kZVxuICAgICAgICBjdXJzb3IuY2FuZGlkYXRlID0gZWxlbWVudC5maXJzdENoaWxkO1xuICAgICAgICAvLyB3aGVyZSB0byBjb250aW51ZSB3aGVuIHdlIHBvcFxuICAgICAgICBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZSA9IGVsZW1lbnQubmV4dFNpYmxpbmc7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXNbQ1VSU09SX1NUQUNLXS5wdXNoKGN1cnNvcik7XG4gIH1cblxuICBwcml2YXRlIGNsZWFyTWlzbWF0Y2goY2FuZGlkYXRlOiBTaW1wbGVOb2RlKSB7XG4gICAgbGV0IGN1cnJlbnQ6IE9wdGlvbjxTaW1wbGVOb2RlPiA9IGNhbmRpZGF0ZTtcbiAgICBsZXQgY3VycmVudEN1cnNvciA9IHRoaXMuY3VycmVudEN1cnNvcjtcbiAgICBpZiAoY3VycmVudEN1cnNvciAhPT0gbnVsbCkge1xuICAgICAgbGV0IG9wZW5CbG9ja0RlcHRoID0gY3VycmVudEN1cnNvci5vcGVuQmxvY2tEZXB0aDtcbiAgICAgIGlmIChvcGVuQmxvY2tEZXB0aCA+PSBjdXJyZW50Q3Vyc29yLnN0YXJ0aW5nQmxvY2tEZXB0aCkge1xuICAgICAgICB3aGlsZSAoY3VycmVudCAmJiAhKGlzQ29tbWVudChjdXJyZW50KSAmJiBnZXRDbG9zZUJsb2NrRGVwdGgoY3VycmVudCkgPT09IG9wZW5CbG9ja0RlcHRoKSkge1xuICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLnJlbW92ZShjdXJyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBhc3NlcnQoY3VycmVudCAhPT0gbnVsbCwgJ3Nob3VsZCBoYXZlIGZvdW5kIGNsb3NpbmcgYmxvY2snKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgY3VycmVudCA9IHRoaXMucmVtb3ZlKGN1cnJlbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBjdXJyZW50IGN1cnNvciBwYXJlbnROb2RlIHNob3VsZCBiZSBvcGVuQ2FuZGlkYXRlIGlmIGVsZW1lbnRcbiAgICAgIC8vIG9yIG9wZW5DYW5kaWRhdGUucGFyZW50Tm9kZSBpZiBjb21tZW50XG4gICAgICBjdXJyZW50Q3Vyc29yLm5leHRTaWJsaW5nID0gY3VycmVudDtcbiAgICAgIC8vIGRpc2FibGUgcmVoeWRyYXRpb24gdW50aWwgd2UgcG9wRWxlbWVudCBvciBjbG9zZUJsb2NrIGZvciBvcGVuQmxvY2tEZXB0aFxuICAgICAgY3VycmVudEN1cnNvci5jYW5kaWRhdGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9fb3BlbkJsb2NrKCk6IHZvaWQge1xuICAgIGxldCB7IGN1cnJlbnRDdXJzb3IgfSA9IHRoaXM7XG4gICAgaWYgKGN1cnJlbnRDdXJzb3IgPT09IG51bGwpIHJldHVybjtcblxuICAgIGxldCBibG9ja0RlcHRoID0gdGhpcy5ibG9ja0RlcHRoO1xuXG4gICAgdGhpcy5ibG9ja0RlcHRoKys7XG5cbiAgICBsZXQgeyBjYW5kaWRhdGUgfSA9IGN1cnJlbnRDdXJzb3I7XG4gICAgaWYgKGNhbmRpZGF0ZSA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgbGV0IHsgdGFnTmFtZSB9ID0gY3VycmVudEN1cnNvci5lbGVtZW50O1xuXG4gICAgaWYgKGlzQ29tbWVudChjYW5kaWRhdGUpICYmIGdldE9wZW5CbG9ja0RlcHRoKGNhbmRpZGF0ZSkgPT09IGJsb2NrRGVwdGgpIHtcbiAgICAgIGN1cnJlbnRDdXJzb3IuY2FuZGlkYXRlID0gdGhpcy5yZW1vdmUoY2FuZGlkYXRlKTtcbiAgICAgIGN1cnJlbnRDdXJzb3Iub3BlbkJsb2NrRGVwdGggPSBibG9ja0RlcHRoO1xuICAgIH0gZWxzZSBpZiAodGFnTmFtZSAhPT0gJ1RJVExFJyAmJiB0YWdOYW1lICE9PSAnU0NSSVBUJyAmJiB0YWdOYW1lICE9PSAnU1RZTEUnKSB7XG4gICAgICB0aGlzLmNsZWFyTWlzbWF0Y2goY2FuZGlkYXRlKTtcbiAgICB9XG4gIH1cblxuICBfX2Nsb3NlQmxvY2soKTogdm9pZCB7XG4gICAgbGV0IHsgY3VycmVudEN1cnNvciB9ID0gdGhpcztcbiAgICBpZiAoY3VycmVudEN1cnNvciA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgLy8gb3BlbkJsb2NrIGlzIHRoZSBsYXN0IHJlaHlkcmF0ZWQgb3BlbiBibG9ja1xuICAgIGxldCBvcGVuQmxvY2tEZXB0aCA9IGN1cnJlbnRDdXJzb3Iub3BlbkJsb2NrRGVwdGg7XG5cbiAgICAvLyB0aGlzIGN1cnJlbnRseSBpcyB0aGUgZXhwZWN0ZWQgbmV4dCBvcGVuIGJsb2NrIGRlcHRoXG4gICAgdGhpcy5ibG9ja0RlcHRoLS07XG5cbiAgICBsZXQgeyBjYW5kaWRhdGUgfSA9IGN1cnJlbnRDdXJzb3I7XG4gICAgLy8gcmVoeWRyYXRpbmdcbiAgICBpZiAoY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICBhc3NlcnQoXG4gICAgICAgIG9wZW5CbG9ja0RlcHRoID09PSB0aGlzLmJsb2NrRGVwdGgsXG4gICAgICAgICd3aGVuIHJlaHlkcmF0aW5nLCBvcGVuQmxvY2tEZXB0aCBzaG91bGQgbWF0Y2ggdGhpcy5ibG9ja0RlcHRoIGhlcmUnXG4gICAgICApO1xuICAgICAgaWYgKGlzQ29tbWVudChjYW5kaWRhdGUpICYmIGdldENsb3NlQmxvY2tEZXB0aChjYW5kaWRhdGUpID09PSBvcGVuQmxvY2tEZXB0aCkge1xuICAgICAgICBjdXJyZW50Q3Vyc29yLmNhbmRpZGF0ZSA9IHRoaXMucmVtb3ZlKGNhbmRpZGF0ZSk7XG4gICAgICAgIGN1cnJlbnRDdXJzb3Iub3BlbkJsb2NrRGVwdGgtLTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2xlYXJNaXNtYXRjaChjYW5kaWRhdGUpO1xuICAgICAgfVxuICAgICAgLy8gaWYgdGhlIG9wZW5CbG9ja0RlcHRoIG1hdGNoZXMgdGhlIGJsb2NrRGVwdGggd2UganVzdCBjbG9zZWQgdG9cbiAgICAgIC8vIHRoZW4gcmVzdG9yZSByZWh5ZHJhdGlvblxuICAgIH1cbiAgICBpZiAoY3VycmVudEN1cnNvci5vcGVuQmxvY2tEZXB0aCA9PT0gdGhpcy5ibG9ja0RlcHRoKSB7XG4gICAgICBhc3NlcnQoXG4gICAgICAgIGN1cnJlbnRDdXJzb3IubmV4dFNpYmxpbmcgIT09IG51bGwgJiZcbiAgICAgICAgICBpc0NvbW1lbnQoY3VycmVudEN1cnNvci5uZXh0U2libGluZykgJiZcbiAgICAgICAgICBnZXRDbG9zZUJsb2NrRGVwdGgoY3VycmVudEN1cnNvci5uZXh0U2libGluZykgPT09IG9wZW5CbG9ja0RlcHRoLFxuICAgICAgICAnZXhwZWN0ZWQgY2xvc2UgYmxvY2sgdG8gbWF0Y2ggcmVoeWRyYXRlZCBvcGVuIGJsb2NrJ1xuICAgICAgKTtcbiAgICAgIGN1cnJlbnRDdXJzb3IuY2FuZGlkYXRlID0gdGhpcy5yZW1vdmUoY3VycmVudEN1cnNvci5uZXh0U2libGluZyEpO1xuICAgICAgY3VycmVudEN1cnNvci5vcGVuQmxvY2tEZXB0aC0tO1xuICAgIH1cbiAgfVxuXG4gIF9fYXBwZW5kTm9kZShub2RlOiBTaW1wbGVOb2RlKTogU2ltcGxlTm9kZSB7XG4gICAgbGV0IHsgY2FuZGlkYXRlIH0gPSB0aGlzO1xuXG4gICAgLy8gVGhpcyBjb2RlIHBhdGggaXMgb25seSB1c2VkIHdoZW4gaW5zZXJ0aW5nIHByZWNpc2VseSBvbmUgbm9kZS4gSXQgbmVlZHMgbW9yZVxuICAgIC8vIGNvbXBhcmlzb24gbG9naWMsIGJ1dCB3ZSBjYW4gcHJvYmFibHkgbGVhbiBvbiB0aGUgY2FzZXMgd2hlcmUgdGhpcyBjb2RlIHBhdGhcbiAgICAvLyBpcyBhY3R1YWxseSB1c2VkLlxuICAgIGlmIChjYW5kaWRhdGUpIHtcbiAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdXBlci5fX2FwcGVuZE5vZGUobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgX19hcHBlbmRIVE1MKGh0bWw6IHN0cmluZyk6IEJvdW5kcyB7XG4gICAgbGV0IGNhbmRpZGF0ZUJvdW5kcyA9IHRoaXMubWFya2VyQm91bmRzKCk7XG5cbiAgICBpZiAoY2FuZGlkYXRlQm91bmRzKSB7XG4gICAgICBsZXQgZmlyc3QgPSBjYW5kaWRhdGVCb3VuZHMuZmlyc3ROb2RlKCkhO1xuICAgICAgbGV0IGxhc3QgPSBjYW5kaWRhdGVCb3VuZHMubGFzdE5vZGUoKSE7XG5cbiAgICAgIGxldCBuZXdCb3VuZHMgPSBuZXcgQ29uY3JldGVCb3VuZHModGhpcy5lbGVtZW50LCBmaXJzdC5uZXh0U2libGluZyEsIGxhc3QucHJldmlvdXNTaWJsaW5nISk7XG5cbiAgICAgIGxldCBwb3NzaWJsZUVtcHR5TWFya2VyID0gdGhpcy5yZW1vdmUoZmlyc3QpO1xuICAgICAgdGhpcy5yZW1vdmUobGFzdCk7XG5cbiAgICAgIGlmIChwb3NzaWJsZUVtcHR5TWFya2VyICE9PSBudWxsICYmIGlzRW1wdHkocG9zc2libGVFbXB0eU1hcmtlcikpIHtcbiAgICAgICAgdGhpcy5jYW5kaWRhdGUgPSB0aGlzLnJlbW92ZShwb3NzaWJsZUVtcHR5TWFya2VyKTtcblxuICAgICAgICBpZiAodGhpcy5jYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmNsZWFyTWlzbWF0Y2godGhpcy5jYW5kaWRhdGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXdCb3VuZHM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdXBlci5fX2FwcGVuZEhUTUwoaHRtbCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIHJlbW92ZShub2RlOiBTaW1wbGVOb2RlKTogT3B0aW9uPFNpbXBsZU5vZGU+IHtcbiAgICBsZXQgZWxlbWVudCA9IGV4cGVjdChub2RlLnBhcmVudE5vZGUsIGBjYW5ub3QgcmVtb3ZlIGEgZGV0YWNoZWQgbm9kZWApIGFzIFNpbXBsZUVsZW1lbnQ7XG4gICAgbGV0IG5leHQgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgcmV0dXJuIG5leHQ7XG4gIH1cblxuICBwcml2YXRlIG1hcmtlckJvdW5kcygpOiBPcHRpb248Qm91bmRzPiB7XG4gICAgbGV0IF9jYW5kaWRhdGUgPSB0aGlzLmNhbmRpZGF0ZTtcblxuICAgIGlmIChfY2FuZGlkYXRlICYmIGlzTWFya2VyKF9jYW5kaWRhdGUpKSB7XG4gICAgICBsZXQgZmlyc3QgPSBfY2FuZGlkYXRlO1xuICAgICAgbGV0IGxhc3QgPSBleHBlY3QoZmlyc3QubmV4dFNpYmxpbmcsIGBCVUc6IHNlcmlhbGl6YXRpb24gbWFya2VycyBtdXN0IGJlIHBhaXJlZGApO1xuXG4gICAgICB3aGlsZSAobGFzdCAmJiAhaXNNYXJrZXIobGFzdCkpIHtcbiAgICAgICAgbGFzdCA9IGV4cGVjdChsYXN0Lm5leHRTaWJsaW5nLCBgQlVHOiBzZXJpYWxpemF0aW9uIG1hcmtlcnMgbXVzdCBiZSBwYWlyZWRgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBDb25jcmV0ZUJvdW5kcyh0aGlzLmVsZW1lbnQsIGZpcnN0LCBsYXN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgX19hcHBlbmRUZXh0KHN0cmluZzogc3RyaW5nKTogU2ltcGxlVGV4dCB7XG4gICAgbGV0IHsgY2FuZGlkYXRlIH0gPSB0aGlzO1xuXG4gICAgaWYgKGNhbmRpZGF0ZSkge1xuICAgICAgaWYgKGlzVGV4dE5vZGUoY2FuZGlkYXRlKSkge1xuICAgICAgICBpZiAoY2FuZGlkYXRlLm5vZGVWYWx1ZSAhPT0gc3RyaW5nKSB7XG4gICAgICAgICAgY2FuZGlkYXRlLm5vZGVWYWx1ZSA9IHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbmRpZGF0ZSA9IGNhbmRpZGF0ZS5uZXh0U2libGluZztcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgIH0gZWxzZSBpZiAoY2FuZGlkYXRlICYmIChpc1NlcGFyYXRvcihjYW5kaWRhdGUpIHx8IGlzRW1wdHkoY2FuZGlkYXRlKSkpIHtcbiAgICAgICAgdGhpcy5jYW5kaWRhdGUgPSBjYW5kaWRhdGUubmV4dFNpYmxpbmc7XG4gICAgICAgIHRoaXMucmVtb3ZlKGNhbmRpZGF0ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLl9fYXBwZW5kVGV4dChzdHJpbmcpO1xuICAgICAgfSBlbHNlIGlmIChpc0VtcHR5KGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLnJlbW92ZShjYW5kaWRhdGUpO1xuICAgICAgICB0aGlzLmNhbmRpZGF0ZSA9IG5leHQ7XG4gICAgICAgIGxldCB0ZXh0ID0gdGhpcy5kb20uY3JlYXRlVGV4dE5vZGUoc3RyaW5nKTtcbiAgICAgICAgdGhpcy5kb20uaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgdGV4dCwgbmV4dCk7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbGVhck1pc21hdGNoKGNhbmRpZGF0ZSk7XG4gICAgICAgIHJldHVybiBzdXBlci5fX2FwcGVuZFRleHQoc3RyaW5nKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLl9fYXBwZW5kVGV4dChzdHJpbmcpO1xuICAgIH1cbiAgfVxuXG4gIF9fYXBwZW5kQ29tbWVudChzdHJpbmc6IHN0cmluZyk6IFNpbXBsZUNvbW1lbnQge1xuICAgIGxldCBfY2FuZGlkYXRlID0gdGhpcy5jYW5kaWRhdGU7XG4gICAgaWYgKF9jYW5kaWRhdGUgJiYgaXNDb21tZW50KF9jYW5kaWRhdGUpKSB7XG4gICAgICBpZiAoX2NhbmRpZGF0ZS5ub2RlVmFsdWUgIT09IHN0cmluZykge1xuICAgICAgICBfY2FuZGlkYXRlLm5vZGVWYWx1ZSA9IHN0cmluZztcbiAgICAgIH1cblxuICAgICAgdGhpcy5jYW5kaWRhdGUgPSBfY2FuZGlkYXRlLm5leHRTaWJsaW5nO1xuICAgICAgcmV0dXJuIF9jYW5kaWRhdGU7XG4gICAgfSBlbHNlIGlmIChfY2FuZGlkYXRlKSB7XG4gICAgICB0aGlzLmNsZWFyTWlzbWF0Y2goX2NhbmRpZGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyLl9fYXBwZW5kQ29tbWVudChzdHJpbmcpO1xuICB9XG5cbiAgX19vcGVuRWxlbWVudCh0YWc6IHN0cmluZyk6IFNpbXBsZUVsZW1lbnQge1xuICAgIGxldCBfY2FuZGlkYXRlID0gdGhpcy5jYW5kaWRhdGU7XG5cbiAgICBpZiAoX2NhbmRpZGF0ZSAmJiBpc0VsZW1lbnQoX2NhbmRpZGF0ZSkgJiYgaXNTYW1lTm9kZVR5cGUoX2NhbmRpZGF0ZSwgdGFnKSkge1xuICAgICAgdGhpcy51bm1hdGNoZWRBdHRyaWJ1dGVzID0gW10uc2xpY2UuY2FsbChfY2FuZGlkYXRlLmF0dHJpYnV0ZXMpO1xuICAgICAgcmV0dXJuIF9jYW5kaWRhdGU7XG4gICAgfSBlbHNlIGlmIChfY2FuZGlkYXRlKSB7XG4gICAgICBpZiAoaXNFbGVtZW50KF9jYW5kaWRhdGUpICYmIF9jYW5kaWRhdGUudGFnTmFtZSA9PT0gJ1RCT0RZJykge1xuICAgICAgICB0aGlzLnB1c2hFbGVtZW50KF9jYW5kaWRhdGUsIG51bGwpO1xuICAgICAgICB0aGlzLmN1cnJlbnRDdXJzb3IhLmluamVjdGVkT21pdHRlZE5vZGUgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcy5fX29wZW5FbGVtZW50KHRhZyk7XG4gICAgICB9XG4gICAgICB0aGlzLmNsZWFyTWlzbWF0Y2goX2NhbmRpZGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyLl9fb3BlbkVsZW1lbnQodGFnKTtcbiAgfVxuXG4gIF9fc2V0QXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT4pOiB2b2lkIHtcbiAgICBsZXQgdW5tYXRjaGVkID0gdGhpcy51bm1hdGNoZWRBdHRyaWJ1dGVzO1xuXG4gICAgaWYgKHVubWF0Y2hlZCkge1xuICAgICAgbGV0IGF0dHIgPSBmaW5kQnlOYW1lKHVubWF0Y2hlZCwgbmFtZSk7XG4gICAgICBpZiAoYXR0cikge1xuICAgICAgICBpZiAoYXR0ci52YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICBhdHRyLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdW5tYXRjaGVkLnNwbGljZSh1bm1hdGNoZWQuaW5kZXhPZihhdHRyKSwgMSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIuX19zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUsIG5hbWVzcGFjZSk7XG4gIH1cblxuICBfX3NldFByb3BlcnR5KG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGxldCB1bm1hdGNoZWQgPSB0aGlzLnVubWF0Y2hlZEF0dHJpYnV0ZXM7XG5cbiAgICBpZiAodW5tYXRjaGVkKSB7XG4gICAgICBsZXQgYXR0ciA9IGZpbmRCeU5hbWUodW5tYXRjaGVkLCBuYW1lKTtcbiAgICAgIGlmIChhdHRyKSB7XG4gICAgICAgIGlmIChhdHRyLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgIGF0dHIudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB1bm1hdGNoZWQuc3BsaWNlKHVubWF0Y2hlZC5pbmRleE9mKGF0dHIpLCAxKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdXBlci5fX3NldFByb3BlcnR5KG5hbWUsIHZhbHVlKTtcbiAgfVxuXG4gIF9fZmx1c2hFbGVtZW50KHBhcmVudDogU2ltcGxlRWxlbWVudCwgY29uc3RydWN0aW5nOiBTaW1wbGVFbGVtZW50KTogdm9pZCB7XG4gICAgbGV0IHsgdW5tYXRjaGVkQXR0cmlidXRlczogdW5tYXRjaGVkIH0gPSB0aGlzO1xuICAgIGlmICh1bm1hdGNoZWQpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5tYXRjaGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuY29uc3RydWN0aW5nIS5yZW1vdmVBdHRyaWJ1dGUodW5tYXRjaGVkW2ldLm5hbWUpO1xuICAgICAgfVxuICAgICAgdGhpcy51bm1hdGNoZWRBdHRyaWJ1dGVzID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIuX19mbHVzaEVsZW1lbnQocGFyZW50LCBjb25zdHJ1Y3RpbmcpO1xuICAgIH1cbiAgfVxuXG4gIHdpbGxDbG9zZUVsZW1lbnQoKSB7XG4gICAgbGV0IHsgY2FuZGlkYXRlLCBjdXJyZW50Q3Vyc29yIH0gPSB0aGlzO1xuXG4gICAgaWYgKGNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5jbGVhck1pc21hdGNoKGNhbmRpZGF0ZSk7XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRDdXJzb3IgJiYgY3VycmVudEN1cnNvci5pbmplY3RlZE9taXR0ZWROb2RlKSB7XG4gICAgICB0aGlzLnBvcEVsZW1lbnQoKTtcbiAgICB9XG5cbiAgICBzdXBlci53aWxsQ2xvc2VFbGVtZW50KCk7XG4gIH1cblxuICBnZXRNYXJrZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGd1aWQ6IHN0cmluZyk6IE9wdGlvbjxTaW1wbGVOb2RlPiB7XG4gICAgbGV0IG1hcmtlciA9IGVsZW1lbnQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2dsbXI9XCIke2d1aWR9XCJdYCk7XG4gICAgaWYgKG1hcmtlcikge1xuICAgICAgcmV0dXJuIG1hcmtlciBhcyBTaW1wbGVOb2RlO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIF9fcHVzaFJlbW90ZUVsZW1lbnQoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBjdXJzb3JJZDogc3RyaW5nLFxuICAgIGluc2VydEJlZm9yZTogTWF5YmU8U2ltcGxlTm9kZT5cbiAgKTogT3B0aW9uPFJlbW90ZUxpdmVCbG9jaz4ge1xuICAgIGxldCBtYXJrZXIgPSB0aGlzLmdldE1hcmtlcihlbGVtZW50IGFzIEhUTUxFbGVtZW50LCBjdXJzb3JJZCk7XG5cbiAgICBhc3NlcnQoXG4gICAgICAhbWFya2VyIHx8IG1hcmtlci5wYXJlbnROb2RlID09PSBlbGVtZW50LFxuICAgICAgYGV4cGVjdGVkIHJlbW90ZSBlbGVtZW50IG1hcmtlcidzIHBhcmVudCBub2RlIHRvIG1hdGNoIHJlbW90ZSBlbGVtZW50YFxuICAgICk7XG5cbiAgICBpZiAoaW5zZXJ0QmVmb3JlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHdoaWxlIChlbGVtZW50Lmxhc3RDaGlsZCAhPT0gbWFya2VyKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKGVsZW1lbnQubGFzdENoaWxkISk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbnRDdXJzb3IgPSB0aGlzLmN1cnJlbnRDdXJzb3I7XG4gICAgbGV0IGNhbmRpZGF0ZSA9IGN1cnJlbnRDdXJzb3IhLmNhbmRpZGF0ZTtcblxuICAgIHRoaXMucHVzaEVsZW1lbnQoZWxlbWVudCwgaW5zZXJ0QmVmb3JlKTtcblxuICAgIGN1cnJlbnRDdXJzb3IhLmNhbmRpZGF0ZSA9IGNhbmRpZGF0ZTtcbiAgICB0aGlzLmNhbmRpZGF0ZSA9IG1hcmtlciA/IHRoaXMucmVtb3ZlKG1hcmtlcikgOiBudWxsO1xuXG4gICAgbGV0IGJsb2NrID0gbmV3IFJlbW90ZUxpdmVCbG9jayhlbGVtZW50KTtcbiAgICByZXR1cm4gdGhpcy5wdXNoTGl2ZUJsb2NrKGJsb2NrLCB0cnVlKTtcbiAgfVxuXG4gIGRpZEFwcGVuZEJvdW5kcyhib3VuZHM6IEJvdW5kcyk6IEJvdW5kcyB7XG4gICAgc3VwZXIuZGlkQXBwZW5kQm91bmRzKGJvdW5kcyk7XG4gICAgaWYgKHRoaXMuY2FuZGlkYXRlKSB7XG4gICAgICBsZXQgbGFzdCA9IGJvdW5kcy5sYXN0Tm9kZSgpO1xuICAgICAgdGhpcy5jYW5kaWRhdGUgPSBsYXN0ICYmIGxhc3QubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIHJldHVybiBib3VuZHM7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNUZXh0Tm9kZShub2RlOiBTaW1wbGVOb2RlKTogbm9kZSBpcyBTaW1wbGVUZXh0IHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5cbmZ1bmN0aW9uIGlzQ29tbWVudChub2RlOiBTaW1wbGVOb2RlKTogbm9kZSBpcyBTaW1wbGVDb21tZW50IHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDg7XG59XG5cbmZ1bmN0aW9uIGdldE9wZW5CbG9ja0RlcHRoKG5vZGU6IFNpbXBsZUNvbW1lbnQpOiBPcHRpb248bnVtYmVyPiB7XG4gIGxldCBib3VuZHNEZXB0aCA9IG5vZGUubm9kZVZhbHVlIS5tYXRjaCgvXiVcXCtiOihcXGQrKSUkLyk7XG5cbiAgaWYgKGJvdW5kc0RlcHRoICYmIGJvdW5kc0RlcHRoWzFdKSB7XG4gICAgcmV0dXJuIE51bWJlcihib3VuZHNEZXB0aFsxXSBhcyBzdHJpbmcpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldENsb3NlQmxvY2tEZXB0aChub2RlOiBTaW1wbGVDb21tZW50KTogT3B0aW9uPG51bWJlcj4ge1xuICBsZXQgYm91bmRzRGVwdGggPSBub2RlLm5vZGVWYWx1ZSEubWF0Y2goL14lXFwtYjooXFxkKyklJC8pO1xuXG4gIGlmIChib3VuZHNEZXB0aCAmJiBib3VuZHNEZXB0aFsxXSkge1xuICAgIHJldHVybiBOdW1iZXIoYm91bmRzRGVwdGhbMV0gYXMgc3RyaW5nKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0VsZW1lbnQobm9kZTogU2ltcGxlTm9kZSk6IG5vZGUgaXMgU2ltcGxlRWxlbWVudCB7XG4gIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAxO1xufVxuXG5mdW5jdGlvbiBpc01hcmtlcihub2RlOiBTaW1wbGVOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLm5vZGVUeXBlID09PSA4ICYmIG5vZGUubm9kZVZhbHVlID09PSAnJWdsbXIlJztcbn1cblxuZnVuY3Rpb24gaXNTZXBhcmF0b3Iobm9kZTogU2ltcGxlTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gOCAmJiBub2RlLm5vZGVWYWx1ZSA9PT0gJyV8JSc7XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHkobm9kZTogU2ltcGxlTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gOCAmJiBub2RlLm5vZGVWYWx1ZSA9PT0gJyUgJSc7XG59XG5mdW5jdGlvbiBpc1NhbWVOb2RlVHlwZShjYW5kaWRhdGU6IFNpbXBsZUVsZW1lbnQsIHRhZzogc3RyaW5nKSB7XG4gIGlmIChjYW5kaWRhdGUubmFtZXNwYWNlVVJJID09PSBOYW1lc3BhY2UuU1ZHKSB7XG4gICAgcmV0dXJuIGNhbmRpZGF0ZS50YWdOYW1lID09PSB0YWc7XG4gIH1cbiAgcmV0dXJuIGNhbmRpZGF0ZS50YWdOYW1lID09PSB0YWcudG9VcHBlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gZmluZEJ5TmFtZShhcnJheTogU2ltcGxlQXR0cltdLCBuYW1lOiBzdHJpbmcpOiBTaW1wbGVBdHRyIHwgdW5kZWZpbmVkIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIGxldCBhdHRyID0gYXJyYXlbaV07XG4gICAgaWYgKGF0dHIubmFtZSA9PT0gbmFtZSkgcmV0dXJuIGF0dHI7XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVoeWRyYXRpb25CdWlsZGVyKGVudjogRW52aXJvbm1lbnQsIGN1cnNvcjogQ3Vyc29ySW1wbCk6IEVsZW1lbnRCdWlsZGVyIHtcbiAgcmV0dXJuIFJlaHlkcmF0ZUJ1aWxkZXIuZm9ySW5pdGlhbFJlbmRlcihlbnYsIGN1cnNvcik7XG59XG4iXSwibmFtZXMiOlsicmVmZXJlbmNlIiwidGFrZUFzc29jaWF0ZWQiLCJzbmFwc2hvdCIsImRlc3RydWN0b3IiLCJTdGFjayIsIkRFU1RST1kiLCJzaG91bGRBcHBseUZpeCIsIkNvbnN0UmVmZXJlbmNlIiwiRFJPUCIsIl9hIiwicHJvZ3JhbSIsIlJ1bnRpbWVQcm9ncmFtSW1wbCIsIkNvbnN0YW50cyIsIkhlYXBJbXBsIiwiSXRlcmFibGVJbXBsIiwiZmlsbE51bGxzIiwidm0iLCIkcGMiLCJjb21iaW5lVGFnZ2VkIiwiQ2FjaGVkUmVmZXJlbmNlIiwiJHYwIiwidmFsdWUiLCJ2YWxpZGF0ZSIsImlzQ29uc3QiLCJSZWZlcmVuY2VDYWNoZSIsImlzTW9kaWZpZWQiLCJDT05TVEFOVF9UQUciLCIkdDAiLCJpc0NvbnN0VGFnIiwiJHQxIiwidW5yZWFjaGFibGUiLCJkaWN0IiwiUmVmZXJlbmNlSXRlcmF0b3IiLCJhc3NpZ24iLCJjcmVhdGVVcGRhdGFibGVUYWciLCJjb21iaW5lIiwiJHNwIiwiRU1QVFlfQVJSQVkiLCIkcmEiLCIkZnAiLCJjb21iaW5lU2xpY2UiLCJMaW5rZWRMaXN0IiwiRU5EIiwiSU5JVElBTCIsIkl0ZXJhdG9yU3luY2hyb25pemVyIiwiV2FzbVN0YWNrIiwiaXNMb3dMZXZlbFJlZ2lzdGVyIiwiJHMwIiwiJHMxIiwiTGlzdFNsaWNlIiwiaXNEcm9wIiwiaXNFbXB0eSJdLCJtYXBwaW5ncyI6Ijs7O0lBQ0E7SUFDQTtBQUVBLElBQU8sSUFBTSxXQUFOLGlEQUFBO0FBQ1AsSUFBTyxJQUFNLG1CQUFOLHlEQUFBO0FBQ1AsSUFBTyxJQUFNLFNBQU4sK0NBQUE7QUFDUCxJQUFPLElBQU0sWUFBTixrREFBQTtBQUNQLElBQU8sSUFBTSxPQUFO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