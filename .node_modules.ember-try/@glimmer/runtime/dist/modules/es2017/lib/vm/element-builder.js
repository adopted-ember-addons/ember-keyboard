var _a;
import { assert, DESTROY, Stack } from '@glimmer/util';
import { clear, ConcreteBounds, CursorImpl, SingleNodeBounds } from '../bounds';
import { detachChildren } from '../lifetime';
class First {
    constructor(node) {
        this.node = node;
    }
    firstNode() {
        return this.node;
    }
}
class Last {
    constructor(node) {
        this.node = node;
    }
    lastNode() {
        return this.node;
    }
}
export class Fragment {
    constructor(bounds) {
        this.bounds = bounds;
    }
    parentElement() {
        return this.bounds.parentElement();
    }
    firstNode() {
        return this.bounds.firstNode();
    }
    lastNode() {
        return this.bounds.lastNode();
    }
}
export const CURSOR_STACK = 'CURSOR_STACK [31ea0d2f-7c22-4814-9db7-28e4469b54e6]';
export class NewElementBuilder {
    constructor(env, parentNode, nextSibling) {
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
    static forInitialRender(env, cursor) {
        return new this(env, cursor.element, cursor.nextSibling).initialize();
    }
    static resume(env, block) {
        let parentNode = block.parentElement();
        let nextSibling = block.reset(env);
        let stack = new this(env, parentNode, nextSibling).initialize();
        stack.pushLiveBlock(block);
        return stack;
    }
    initialize() {
        this.pushSimpleBlock();
        return this;
    }
    debugBlocks() {
        return this.blockStack.toArray();
    }
    get element() {
        return this[CURSOR_STACK].current.element;
    }
    get nextSibling() {
        return this[CURSOR_STACK].current.nextSibling;
    }
    block() {
        return this.blockStack.current;
    }
    popElement() {
        this[CURSOR_STACK].pop();
        this[CURSOR_STACK].current;
    }
    pushSimpleBlock() {
        return this.pushLiveBlock(new SimpleLiveBlock(this.element));
    }
    pushUpdatableBlock() {
        return this.pushLiveBlock(new UpdatableBlockImpl(this.element));
    }
    pushBlockList(list) {
        return this.pushLiveBlock(new LiveBlockList(this.element, list));
    }
    pushLiveBlock(block, isRemote = false) {
        let current = this.blockStack.current;
        if (current !== null) {
            if (!isRemote) {
                current.didAppendBounds(block);
            }
        }
        this.__openBlock();
        this.blockStack.push(block);
        return block;
    }
    popBlock() {
        this.block().finalize(this);
        this.__closeBlock();
        return this.blockStack.pop();
    }
    __openBlock() {}
    __closeBlock() {}
    // todo return seems unused
    openElement(tag) {
        let element = this.__openElement(tag);
        this.constructing = element;
        return element;
    }
    __openElement(tag) {
        return this.dom.createElement(tag, this.element);
    }
    flushElement(modifiers) {
        let parent = this.element;
        let element = this.constructing;
        this.__flushElement(parent, element);
        this.constructing = null;
        this.operations = null;
        this.pushModifiers(modifiers);
        this.pushElement(element, null);
        this.didOpenElement(element);
    }
    __flushElement(parent, constructing) {
        this.dom.insertBefore(parent, constructing, this.nextSibling);
    }
    closeElement() {
        this.willCloseElement();
        this.popElement();
        return this.popModifiers();
    }
    pushRemoteElement(element, guid, insertBefore) {
        return this.__pushRemoteElement(element, guid, insertBefore);
    }
    __pushRemoteElement(element, _guid, insertBefore) {
        this.pushElement(element, insertBefore);
        if (insertBefore === undefined) {
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }
        }
        let block = new RemoteLiveBlock(element);
        return this.pushLiveBlock(block, true);
    }
    popRemoteElement() {
        this.popBlock();
        this.popElement();
    }
    pushElement(element, nextSibling = null) {
        this[CURSOR_STACK].push(new CursorImpl(element, nextSibling));
    }
    pushModifiers(modifiers) {
        this.modifierStack.push(modifiers);
    }
    popModifiers() {
        return this.modifierStack.pop();
    }
    didAppendBounds(bounds) {
        this.block().didAppendBounds(bounds);
        return bounds;
    }
    didAppendNode(node) {
        this.block().didAppendNode(node);
        return node;
    }
    didOpenElement(element) {
        this.block().openElement(element);
        return element;
    }
    willCloseElement() {
        this.block().closeElement();
    }
    appendText(string) {
        return this.didAppendNode(this.__appendText(string));
    }
    __appendText(text) {
        let { dom, element, nextSibling } = this;
        let node = dom.createTextNode(text);
        dom.insertBefore(element, node, nextSibling);
        return node;
    }
    __appendNode(node) {
        this.dom.insertBefore(this.element, node, this.nextSibling);
        return node;
    }
    __appendFragment(fragment) {
        let first = fragment.firstChild;
        if (first) {
            let ret = new ConcreteBounds(this.element, first, fragment.lastChild);
            this.dom.insertBefore(this.element, fragment, this.nextSibling);
            return ret;
        } else {
            return new SingleNodeBounds(this.element, this.__appendComment(''));
        }
    }
    __appendHTML(html) {
        return this.dom.insertHTMLBefore(this.element, this.nextSibling, html);
    }
    appendDynamicHTML(value) {
        let bounds = this.trustedContent(value);
        this.didAppendBounds(bounds);
    }
    appendDynamicText(value) {
        let node = this.untrustedContent(value);
        this.didAppendNode(node);
        return node;
    }
    appendDynamicFragment(value) {
        let bounds = this.__appendFragment(value);
        this.didAppendBounds(bounds);
    }
    appendDynamicNode(value) {
        let node = this.__appendNode(value);
        let bounds = new SingleNodeBounds(this.element, node);
        this.didAppendBounds(bounds);
    }
    trustedContent(value) {
        return this.__appendHTML(value);
    }
    untrustedContent(value) {
        return this.__appendText(value);
    }
    appendComment(string) {
        return this.didAppendNode(this.__appendComment(string));
    }
    __appendComment(string) {
        let { dom, element, nextSibling } = this;
        let node = dom.createComment(string);
        dom.insertBefore(element, node, nextSibling);
        return node;
    }
    __setAttribute(name, value, namespace) {
        this.dom.setAttribute(this.constructing, name, value, namespace);
    }
    __setProperty(name, value) {
        this.constructing[name] = value;
    }
    setStaticAttribute(name, value, namespace) {
        this.__setAttribute(name, value, namespace);
    }
    setDynamicAttribute(name, value, trusting, namespace) {
        let element = this.constructing;
        let attribute = this.env.attributeFor(element, name, trusting, namespace);
        attribute.set(this, value, this.env);
        return attribute;
    }
}
_a = CURSOR_STACK;
export class SimpleLiveBlock {
    constructor(parent) {
        this.parent = parent;
        this.first = null;
        this.last = null;
        this.destroyables = null;
        this.nesting = 0;
    }
    parentElement() {
        return this.parent;
    }
    firstNode() {
        let first = this.first;
        return first.firstNode();
    }
    lastNode() {
        let last = this.last;
        return last.lastNode();
    }
    openElement(element) {
        this.didAppendNode(element);
        this.nesting++;
    }
    closeElement() {
        this.nesting--;
    }
    didAppendNode(node) {
        if (this.nesting !== 0) return;
        if (!this.first) {
            this.first = new First(node);
        }
        this.last = new Last(node);
    }
    didAppendBounds(bounds) {
        if (this.nesting !== 0) return;
        if (!this.first) {
            this.first = bounds;
        }
        this.last = bounds;
    }
    finalize(stack) {
        if (this.first === null) {
            stack.appendComment('');
        }
    }
}
export class RemoteLiveBlock extends SimpleLiveBlock {
    [DESTROY]() {
        clear(this);
    }
}
export class UpdatableBlockImpl extends SimpleLiveBlock {
    reset(env) {
        let nextSibling = detachChildren(this, env);
        // let nextSibling = clear(this);
        this.first = null;
        this.last = null;
        this.destroyables = null;
        this.nesting = 0;
        return nextSibling;
    }
}
// FIXME: All the noops in here indicate a modelling problem
class LiveBlockList {
    constructor(parent, boundList) {
        this.parent = parent;
        this.boundList = boundList;
        this.parent = parent;
        this.boundList = boundList;
    }
    parentElement() {
        return this.parent;
    }
    firstNode() {
        let head = this.boundList.head();
        return head.firstNode();
    }
    lastNode() {
        let tail = this.boundList.tail();
        return tail.lastNode();
    }
    openElement(_element) {
        (false && assert(false, 'Cannot openElement directly inside a block list'));
    }
    closeElement() {
        (false && assert(false, 'Cannot closeElement directly inside a block list'));
    }
    didAppendNode(_node) {
        (false && assert(false, 'Cannot create a new node directly inside a block list'));
    }
    didAppendBounds(_bounds) {}
    finalize(_stack) {
        (false && assert(this.boundList.head() !== null, 'boundsList cannot be empty'));
    }
}
export function clientBuilder(env, cursor) {
    return NewElementBuilder.forInitialRender(env, cursor);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2VsZW1lbnQtYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBZUEsU0FDRSxNQURGLEVBRUUsT0FGRixFQU9FLEtBUEYsUUFTTyxlQVRQO0FBa0JBLFNBQVMsS0FBVCxFQUFnQixjQUFoQixFQUFnQyxVQUFoQyxFQUE0QyxnQkFBNUMsUUFBb0UsV0FBcEU7QUFDQSxTQUFTLGNBQVQsUUFBK0IsYUFBL0I7QUFXQSxNQUFNLEtBQU4sQ0FBVztBQUNULGdCQUFvQixJQUFwQixFQUFvQztBQUFoQixhQUFBLElBQUEsR0FBQSxJQUFBO0FBQW9CO0FBRXhDLGdCQUFTO0FBQ1AsZUFBTyxLQUFLLElBQVo7QUFDRDtBQUxRO0FBUVgsTUFBTSxJQUFOLENBQVU7QUFDUixnQkFBb0IsSUFBcEIsRUFBb0M7QUFBaEIsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUFvQjtBQUV4QyxlQUFRO0FBQ04sZUFBTyxLQUFLLElBQVo7QUFDRDtBQUxPO0FBUVYsT0FBTSxNQUFPLFFBQVAsQ0FBZTtBQUduQixnQkFBWSxNQUFaLEVBQTBCO0FBQ3hCLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDRDtBQUVELG9CQUFhO0FBQ1gsZUFBTyxLQUFLLE1BQUwsQ0FBWSxhQUFaLEVBQVA7QUFDRDtBQUVELGdCQUFTO0FBQ1AsZUFBTyxLQUFLLE1BQUwsQ0FBWSxTQUFaLEVBQVA7QUFDRDtBQUVELGVBQVE7QUFDTixlQUFPLEtBQUssTUFBTCxDQUFZLFFBQVosRUFBUDtBQUNEO0FBakJrQjtBQW9CckIsT0FBTyxNQUFNLGVBQ1gscURBREs7QUFHUCxPQUFNLE1BQU8saUJBQVAsQ0FBd0I7QUF5QjVCLGdCQUFZLEdBQVosRUFBOEIsVUFBOUIsRUFBeUQsV0FBekQsRUFBd0Y7QUF0QmpGLGFBQUEsWUFBQSxHQUFzQyxJQUF0QztBQUNBLGFBQUEsVUFBQSxHQUF3QyxJQUF4QztBQUdQLGFBQUEsRUFB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QUVELG1CQUFZO0FBQUEsa0JBQ1YsT0FBTyxLQUFQLEVBQWMsa0RBQWQsQ0FEVTtBQUVYO0FBRUQsa0JBQWMsS0FBZCxFQUErQjtBQUFBLGtCQUM3QixPQUFPLEtBQVAsRUFBYyx1REFBZCxDQUQ2QjtBQUU5QjtBQUVELG9CQUFnQixPQUFoQixFQUErQixDQUFJO0FBRW5DLGFBQVMsTUFBVCxFQUErQjtBQUFBLGtCQUM3QixPQUFPLEtBQUssU0FBTCxDQUFlLElBQWYsT0FBMEIsSUFBakMsRUFBdUMsNEJBQXZDLENBRDZCO0FBRTlCO0FBL0NnQjtBQWtEbkIsT0FBTSxTQUFVLGFBQVYsQ0FBd0IsR0FBeEIsRUFBMEMsTUFBMUMsRUFBNEQ7QUFDaEUsV0FBTyxrQkFBa0IsZ0JBQWxCLENBQW1DLEdBQW5DLEVBQXdDLE1BQXhDLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEJvdW5kcyxcbiAgRGljdCxcbiAgRWxlbWVudE9wZXJhdGlvbnMsXG4gIEVudmlyb25tZW50LFxuICBHbGltbWVyVHJlZUNoYW5nZXMsXG4gIEdsaW1tZXJUcmVlQ29uc3RydWN0aW9uLFxuICBTeW1ib2xEZXN0cm95YWJsZSxcbiAgRWxlbWVudEJ1aWxkZXIsXG4gIExpdmVCbG9jayxcbiAgQ3Vyc29yU3RhY2tTeW1ib2wsXG4gIFVwZGF0YWJsZUJsb2NrLFxuICBDdXJzb3IsXG4gIE1vZGlmaWVyTWFuYWdlcixcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQge1xuICBhc3NlcnQsXG4gIERFU1RST1ksXG4gIGV4cGVjdCxcbiAgTGlua2VkTGlzdCxcbiAgTGlua2VkTGlzdE5vZGUsXG4gIE9wdGlvbixcbiAgU3RhY2ssXG4gIE1heWJlLFxufSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIEF0dHJOYW1lc3BhY2UsXG4gIFNpbXBsZUNvbW1lbnQsXG4gIFNpbXBsZURvY3VtZW50RnJhZ21lbnQsXG4gIFNpbXBsZUVsZW1lbnQsXG4gIFNpbXBsZU5vZGUsXG4gIFNpbXBsZVRleHQsXG59IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBjbGVhciwgQ29uY3JldGVCb3VuZHMsIEN1cnNvckltcGwsIFNpbmdsZU5vZGVCb3VuZHMgfSBmcm9tICcuLi9ib3VuZHMnO1xuaW1wb3J0IHsgZGV0YWNoQ2hpbGRyZW4gfSBmcm9tICcuLi9saWZldGltZSc7XG5pbXBvcnQgeyBEeW5hbWljQXR0cmlidXRlIH0gZnJvbSAnLi9hdHRyaWJ1dGVzL2R5bmFtaWMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpcnN0Tm9kZSB7XG4gIGZpcnN0Tm9kZSgpOiBTaW1wbGVOb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExhc3ROb2RlIHtcbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZTtcbn1cblxuY2xhc3MgRmlyc3Qge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5vZGU6IFNpbXBsZU5vZGUpIHt9XG5cbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLm5vZGU7XG4gIH1cbn1cblxuY2xhc3MgTGFzdCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbm9kZTogU2ltcGxlTm9kZSkge31cblxuICBsYXN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGcmFnbWVudCBpbXBsZW1lbnRzIEJvdW5kcyB7XG4gIHByaXZhdGUgYm91bmRzOiBCb3VuZHM7XG5cbiAgY29uc3RydWN0b3IoYm91bmRzOiBCb3VuZHMpIHtcbiAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcbiAgfVxuXG4gIHBhcmVudEVsZW1lbnQoKTogU2ltcGxlRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLnBhcmVudEVsZW1lbnQoKTtcbiAgfVxuXG4gIGZpcnN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMuZmlyc3ROb2RlKCk7XG4gIH1cblxuICBsYXN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMubGFzdE5vZGUoKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ1VSU09SX1NUQUNLOiBDdXJzb3JTdGFja1N5bWJvbCA9XG4gICdDVVJTT1JfU1RBQ0sgWzMxZWEwZDJmLTdjMjItNDgxNC05ZGI3LTI4ZTQ0NjliNTRlNl0nO1xuXG5leHBvcnQgY2xhc3MgTmV3RWxlbWVudEJ1aWxkZXIgaW1wbGVtZW50cyBFbGVtZW50QnVpbGRlciB7XG4gIHB1YmxpYyBkb206IEdsaW1tZXJUcmVlQ29uc3RydWN0aW9uO1xuICBwdWJsaWMgdXBkYXRlT3BlcmF0aW9uczogR2xpbW1lclRyZWVDaGFuZ2VzO1xuICBwdWJsaWMgY29uc3RydWN0aW5nOiBPcHRpb248U2ltcGxlRWxlbWVudD4gPSBudWxsO1xuICBwdWJsaWMgb3BlcmF0aW9uczogT3B0aW9uPEVsZW1lbnRPcGVyYXRpb25zPiA9IG51bGw7XG4gIHByaXZhdGUgZW52OiBFbnZpcm9ubWVudDtcblxuICBbQ1VSU09SX1NUQUNLXSA9IG5ldyBTdGFjazxDdXJzb3I+KCk7XG4gIHByaXZhdGUgbW9kaWZpZXJTdGFjayA9IG5ldyBTdGFjazxPcHRpb248W01vZGlmaWVyTWFuYWdlciwgdW5rbm93bl1bXT4+KCk7XG4gIHByaXZhdGUgYmxvY2tTdGFjayA9IG5ldyBTdGFjazxMaXZlQmxvY2s+KCk7XG5cbiAgc3RhdGljIGZvckluaXRpYWxSZW5kZXIoZW52OiBFbnZpcm9ubWVudCwgY3Vyc29yOiBDdXJzb3JJbXBsKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGVudiwgY3Vyc29yLmVsZW1lbnQsIGN1cnNvci5uZXh0U2libGluZykuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgc3RhdGljIHJlc3VtZShlbnY6IEVudmlyb25tZW50LCBibG9jazogVXBkYXRhYmxlQmxvY2spOiBOZXdFbGVtZW50QnVpbGRlciB7XG4gICAgbGV0IHBhcmVudE5vZGUgPSBibG9jay5wYXJlbnRFbGVtZW50KCk7XG4gICAgbGV0IG5leHRTaWJsaW5nID0gYmxvY2sucmVzZXQoZW52KTtcblxuICAgIGxldCBzdGFjayA9IG5ldyB0aGlzKGVudiwgcGFyZW50Tm9kZSwgbmV4dFNpYmxpbmcpLmluaXRpYWxpemUoKTtcbiAgICBzdGFjay5wdXNoTGl2ZUJsb2NrKGJsb2NrKTtcblxuICAgIHJldHVybiBzdGFjaztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVudjogRW52aXJvbm1lbnQsIHBhcmVudE5vZGU6IFNpbXBsZUVsZW1lbnQsIG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT4pIHtcbiAgICB0aGlzLnB1c2hFbGVtZW50KHBhcmVudE5vZGUsIG5leHRTaWJsaW5nKTtcblxuICAgIHRoaXMuZW52ID0gZW52O1xuICAgIHRoaXMuZG9tID0gZW52LmdldEFwcGVuZE9wZXJhdGlvbnMoKTtcbiAgICB0aGlzLnVwZGF0ZU9wZXJhdGlvbnMgPSBlbnYuZ2V0RE9NKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpOiB0aGlzIHtcbiAgICB0aGlzLnB1c2hTaW1wbGVCbG9jaygpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZGVidWdCbG9ja3MoKTogTGl2ZUJsb2NrW10ge1xuICAgIHJldHVybiB0aGlzLmJsb2NrU3RhY2sudG9BcnJheSgpO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnQoKTogU2ltcGxlRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXNbQ1VSU09SX1NUQUNLXS5jdXJyZW50IS5lbGVtZW50O1xuICB9XG5cbiAgZ2V0IG5leHRTaWJsaW5nKCk6IE9wdGlvbjxTaW1wbGVOb2RlPiB7XG4gICAgcmV0dXJuIHRoaXNbQ1VSU09SX1NUQUNLXS5jdXJyZW50IS5uZXh0U2libGluZztcbiAgfVxuXG4gIGJsb2NrKCk6IExpdmVCbG9jayB7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzLmJsb2NrU3RhY2suY3VycmVudCwgJ0V4cGVjdGVkIGEgY3VycmVudCBsaXZlIGJsb2NrJyk7XG4gIH1cblxuICBwb3BFbGVtZW50KCkge1xuICAgIHRoaXNbQ1VSU09SX1NUQUNLXS5wb3AoKTtcbiAgICBleHBlY3QodGhpc1tDVVJTT1JfU1RBQ0tdLmN1cnJlbnQsIFwiY2FuJ3QgcG9wIHBhc3QgdGhlIGxhc3QgZWxlbWVudFwiKTtcbiAgfVxuXG4gIHB1c2hTaW1wbGVCbG9jaygpOiBMaXZlQmxvY2sge1xuICAgIHJldHVybiB0aGlzLnB1c2hMaXZlQmxvY2sobmV3IFNpbXBsZUxpdmVCbG9jayh0aGlzLmVsZW1lbnQpKTtcbiAgfVxuXG4gIHB1c2hVcGRhdGFibGVCbG9jaygpOiBVcGRhdGFibGVCbG9ja0ltcGwge1xuICAgIHJldHVybiB0aGlzLnB1c2hMaXZlQmxvY2sobmV3IFVwZGF0YWJsZUJsb2NrSW1wbCh0aGlzLmVsZW1lbnQpKTtcbiAgfVxuXG4gIHB1c2hCbG9ja0xpc3QobGlzdDogTGlua2VkTGlzdDxMaW5rZWRMaXN0Tm9kZSAmIExpdmVCbG9jaz4pOiBMaXZlQmxvY2tMaXN0IHtcbiAgICByZXR1cm4gdGhpcy5wdXNoTGl2ZUJsb2NrKG5ldyBMaXZlQmxvY2tMaXN0KHRoaXMuZWxlbWVudCwgbGlzdCkpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHB1c2hMaXZlQmxvY2s8VCBleHRlbmRzIExpdmVCbG9jaz4oYmxvY2s6IFQsIGlzUmVtb3RlID0gZmFsc2UpOiBUIHtcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuYmxvY2tTdGFjay5jdXJyZW50O1xuXG4gICAgaWYgKGN1cnJlbnQgIT09IG51bGwpIHtcbiAgICAgIGlmICghaXNSZW1vdGUpIHtcbiAgICAgICAgY3VycmVudC5kaWRBcHBlbmRCb3VuZHMoYmxvY2spO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX19vcGVuQmxvY2soKTtcbiAgICB0aGlzLmJsb2NrU3RhY2sucHVzaChibG9jayk7XG4gICAgcmV0dXJuIGJsb2NrO1xuICB9XG5cbiAgcG9wQmxvY2soKTogTGl2ZUJsb2NrIHtcbiAgICB0aGlzLmJsb2NrKCkuZmluYWxpemUodGhpcyk7XG4gICAgdGhpcy5fX2Nsb3NlQmxvY2soKTtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXMuYmxvY2tTdGFjay5wb3AoKSwgJ0V4cGVjdGVkIHBvcEJsb2NrIHRvIHJldHVybiBhIGJsb2NrJyk7XG4gIH1cblxuICBfX29wZW5CbG9jaygpOiB2b2lkIHt9XG4gIF9fY2xvc2VCbG9jaygpOiB2b2lkIHt9XG5cbiAgLy8gdG9kbyByZXR1cm4gc2VlbXMgdW51c2VkXG4gIG9wZW5FbGVtZW50KHRhZzogc3RyaW5nKTogU2ltcGxlRWxlbWVudCB7XG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLl9fb3BlbkVsZW1lbnQodGFnKTtcbiAgICB0aGlzLmNvbnN0cnVjdGluZyA9IGVsZW1lbnQ7XG5cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIF9fb3BlbkVsZW1lbnQodGFnOiBzdHJpbmcpOiBTaW1wbGVFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5kb20uY3JlYXRlRWxlbWVudCh0YWcsIHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBmbHVzaEVsZW1lbnQobW9kaWZpZXJzOiBPcHRpb248W01vZGlmaWVyTWFuYWdlciwgdW5rbm93bl1bXT4pIHtcbiAgICBsZXQgcGFyZW50ID0gdGhpcy5lbGVtZW50O1xuICAgIGxldCBlbGVtZW50ID0gZXhwZWN0KFxuICAgICAgdGhpcy5jb25zdHJ1Y3RpbmcsXG4gICAgICBgZmx1c2hFbGVtZW50IHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIGNvbnN0cnVjdGluZyBhbiBlbGVtZW50YFxuICAgICk7XG5cbiAgICB0aGlzLl9fZmx1c2hFbGVtZW50KHBhcmVudCwgZWxlbWVudCk7XG5cbiAgICB0aGlzLmNvbnN0cnVjdGluZyA9IG51bGw7XG4gICAgdGhpcy5vcGVyYXRpb25zID0gbnVsbDtcblxuICAgIHRoaXMucHVzaE1vZGlmaWVycyhtb2RpZmllcnMpO1xuICAgIHRoaXMucHVzaEVsZW1lbnQoZWxlbWVudCwgbnVsbCk7XG4gICAgdGhpcy5kaWRPcGVuRWxlbWVudChlbGVtZW50KTtcbiAgfVxuXG4gIF9fZmx1c2hFbGVtZW50KHBhcmVudDogU2ltcGxlRWxlbWVudCwgY29uc3RydWN0aW5nOiBTaW1wbGVFbGVtZW50KSB7XG4gICAgdGhpcy5kb20uaW5zZXJ0QmVmb3JlKHBhcmVudCwgY29uc3RydWN0aW5nLCB0aGlzLm5leHRTaWJsaW5nKTtcbiAgfVxuXG4gIGNsb3NlRWxlbWVudCgpOiBPcHRpb248W01vZGlmaWVyTWFuYWdlciwgdW5rbm93bl1bXT4ge1xuICAgIHRoaXMud2lsbENsb3NlRWxlbWVudCgpO1xuICAgIHRoaXMucG9wRWxlbWVudCgpO1xuICAgIHJldHVybiB0aGlzLnBvcE1vZGlmaWVycygpO1xuICB9XG5cbiAgcHVzaFJlbW90ZUVsZW1lbnQoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBndWlkOiBzdHJpbmcsXG4gICAgaW5zZXJ0QmVmb3JlOiBNYXliZTxTaW1wbGVOb2RlPlxuICApOiBPcHRpb248UmVtb3RlTGl2ZUJsb2NrPiB7XG4gICAgcmV0dXJuIHRoaXMuX19wdXNoUmVtb3RlRWxlbWVudChlbGVtZW50LCBndWlkLCBpbnNlcnRCZWZvcmUpO1xuICB9XG5cbiAgX19wdXNoUmVtb3RlRWxlbWVudChcbiAgICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIF9ndWlkOiBzdHJpbmcsXG4gICAgaW5zZXJ0QmVmb3JlOiBNYXliZTxTaW1wbGVOb2RlPlxuICApOiBPcHRpb248UmVtb3RlTGl2ZUJsb2NrPiB7XG4gICAgdGhpcy5wdXNoRWxlbWVudChlbGVtZW50LCBpbnNlcnRCZWZvcmUpO1xuXG4gICAgaWYgKGluc2VydEJlZm9yZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB3aGlsZSAoZWxlbWVudC5sYXN0Q2hpbGQpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50Lmxhc3RDaGlsZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGJsb2NrID0gbmV3IFJlbW90ZUxpdmVCbG9jayhlbGVtZW50KTtcblxuICAgIHJldHVybiB0aGlzLnB1c2hMaXZlQmxvY2soYmxvY2ssIHRydWUpO1xuICB9XG5cbiAgcG9wUmVtb3RlRWxlbWVudCgpIHtcbiAgICB0aGlzLnBvcEJsb2NrKCk7XG4gICAgdGhpcy5wb3BFbGVtZW50KCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcHVzaEVsZW1lbnQoZWxlbWVudDogU2ltcGxlRWxlbWVudCwgbmV4dFNpYmxpbmc6IE1heWJlPFNpbXBsZU5vZGU+ID0gbnVsbCkge1xuICAgIHRoaXNbQ1VSU09SX1NUQUNLXS5wdXNoKG5ldyBDdXJzb3JJbXBsKGVsZW1lbnQsIG5leHRTaWJsaW5nKSk7XG4gIH1cblxuICBwcml2YXRlIHB1c2hNb2RpZmllcnMobW9kaWZpZXJzOiBPcHRpb248W01vZGlmaWVyTWFuYWdlciwgdW5rbm93bl1bXT4pOiB2b2lkIHtcbiAgICB0aGlzLm1vZGlmaWVyU3RhY2sucHVzaChtb2RpZmllcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBwb3BNb2RpZmllcnMoKTogT3B0aW9uPFtNb2RpZmllck1hbmFnZXIsIHVua25vd25dW10+IHtcbiAgICByZXR1cm4gdGhpcy5tb2RpZmllclN0YWNrLnBvcCgpO1xuICB9XG5cbiAgZGlkQXBwZW5kQm91bmRzKGJvdW5kczogQm91bmRzKTogQm91bmRzIHtcbiAgICB0aGlzLmJsb2NrKCkuZGlkQXBwZW5kQm91bmRzKGJvdW5kcyk7XG4gICAgcmV0dXJuIGJvdW5kcztcbiAgfVxuXG4gIGRpZEFwcGVuZE5vZGU8VCBleHRlbmRzIFNpbXBsZU5vZGU+KG5vZGU6IFQpOiBUIHtcbiAgICB0aGlzLmJsb2NrKCkuZGlkQXBwZW5kTm9kZShub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGRpZE9wZW5FbGVtZW50KGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQpOiBTaW1wbGVFbGVtZW50IHtcbiAgICB0aGlzLmJsb2NrKCkub3BlbkVsZW1lbnQoZWxlbWVudCk7XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICB3aWxsQ2xvc2VFbGVtZW50KCkge1xuICAgIHRoaXMuYmxvY2soKS5jbG9zZUVsZW1lbnQoKTtcbiAgfVxuXG4gIGFwcGVuZFRleHQoc3RyaW5nOiBzdHJpbmcpOiBTaW1wbGVUZXh0IHtcbiAgICByZXR1cm4gdGhpcy5kaWRBcHBlbmROb2RlKHRoaXMuX19hcHBlbmRUZXh0KHN0cmluZykpO1xuICB9XG5cbiAgX19hcHBlbmRUZXh0KHRleHQ6IHN0cmluZyk6IFNpbXBsZVRleHQge1xuICAgIGxldCB7IGRvbSwgZWxlbWVudCwgbmV4dFNpYmxpbmcgfSA9IHRoaXM7XG4gICAgbGV0IG5vZGUgPSBkb20uY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gICAgZG9tLmluc2VydEJlZm9yZShlbGVtZW50LCBub2RlLCBuZXh0U2libGluZyk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBfX2FwcGVuZE5vZGUobm9kZTogU2ltcGxlTm9kZSk6IFNpbXBsZU5vZGUge1xuICAgIHRoaXMuZG9tLmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIG5vZGUsIHRoaXMubmV4dFNpYmxpbmcpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgX19hcHBlbmRGcmFnbWVudChmcmFnbWVudDogU2ltcGxlRG9jdW1lbnRGcmFnbWVudCk6IEJvdW5kcyB7XG4gICAgbGV0IGZpcnN0ID0gZnJhZ21lbnQuZmlyc3RDaGlsZDtcblxuICAgIGlmIChmaXJzdCkge1xuICAgICAgbGV0IHJldCA9IG5ldyBDb25jcmV0ZUJvdW5kcyh0aGlzLmVsZW1lbnQsIGZpcnN0LCBmcmFnbWVudC5sYXN0Q2hpbGQhKTtcbiAgICAgIHRoaXMuZG9tLmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIGZyYWdtZW50LCB0aGlzLm5leHRTaWJsaW5nKTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgU2luZ2xlTm9kZUJvdW5kcyh0aGlzLmVsZW1lbnQsIHRoaXMuX19hcHBlbmRDb21tZW50KCcnKSk7XG4gICAgfVxuICB9XG5cbiAgX19hcHBlbmRIVE1MKGh0bWw6IHN0cmluZyk6IEJvdW5kcyB7XG4gICAgcmV0dXJuIHRoaXMuZG9tLmluc2VydEhUTUxCZWZvcmUodGhpcy5lbGVtZW50LCB0aGlzLm5leHRTaWJsaW5nLCBodG1sKTtcbiAgfVxuXG4gIGFwcGVuZER5bmFtaWNIVE1MKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgYm91bmRzID0gdGhpcy50cnVzdGVkQ29udGVudCh2YWx1ZSk7XG4gICAgdGhpcy5kaWRBcHBlbmRCb3VuZHMoYm91bmRzKTtcbiAgfVxuXG4gIGFwcGVuZER5bmFtaWNUZXh0KHZhbHVlOiBzdHJpbmcpOiBTaW1wbGVUZXh0IHtcbiAgICBsZXQgbm9kZSA9IHRoaXMudW50cnVzdGVkQ29udGVudCh2YWx1ZSk7XG4gICAgdGhpcy5kaWRBcHBlbmROb2RlKG5vZGUpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgYXBwZW5kRHluYW1pY0ZyYWdtZW50KHZhbHVlOiBTaW1wbGVEb2N1bWVudEZyYWdtZW50KTogdm9pZCB7XG4gICAgbGV0IGJvdW5kcyA9IHRoaXMuX19hcHBlbmRGcmFnbWVudCh2YWx1ZSk7XG4gICAgdGhpcy5kaWRBcHBlbmRCb3VuZHMoYm91bmRzKTtcbiAgfVxuXG4gIGFwcGVuZER5bmFtaWNOb2RlKHZhbHVlOiBTaW1wbGVOb2RlKTogdm9pZCB7XG4gICAgbGV0IG5vZGUgPSB0aGlzLl9fYXBwZW5kTm9kZSh2YWx1ZSk7XG4gICAgbGV0IGJvdW5kcyA9IG5ldyBTaW5nbGVOb2RlQm91bmRzKHRoaXMuZWxlbWVudCwgbm9kZSk7XG4gICAgdGhpcy5kaWRBcHBlbmRCb3VuZHMoYm91bmRzKTtcbiAgfVxuXG4gIHByaXZhdGUgdHJ1c3RlZENvbnRlbnQodmFsdWU6IHN0cmluZyk6IEJvdW5kcyB7XG4gICAgcmV0dXJuIHRoaXMuX19hcHBlbmRIVE1MKHZhbHVlKTtcbiAgfVxuXG4gIHByaXZhdGUgdW50cnVzdGVkQ29udGVudCh2YWx1ZTogc3RyaW5nKTogU2ltcGxlVGV4dCB7XG4gICAgcmV0dXJuIHRoaXMuX19hcHBlbmRUZXh0KHZhbHVlKTtcbiAgfVxuXG4gIGFwcGVuZENvbW1lbnQoc3RyaW5nOiBzdHJpbmcpOiBTaW1wbGVDb21tZW50IHtcbiAgICByZXR1cm4gdGhpcy5kaWRBcHBlbmROb2RlKHRoaXMuX19hcHBlbmRDb21tZW50KHN0cmluZykpO1xuICB9XG5cbiAgX19hcHBlbmRDb21tZW50KHN0cmluZzogc3RyaW5nKTogU2ltcGxlQ29tbWVudCB7XG4gICAgbGV0IHsgZG9tLCBlbGVtZW50LCBuZXh0U2libGluZyB9ID0gdGhpcztcbiAgICBsZXQgbm9kZSA9IGRvbS5jcmVhdGVDb21tZW50KHN0cmluZyk7XG4gICAgZG9tLmluc2VydEJlZm9yZShlbGVtZW50LCBub2RlLCBuZXh0U2libGluZyk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBfX3NldEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+KTogdm9pZCB7XG4gICAgdGhpcy5kb20uc2V0QXR0cmlidXRlKHRoaXMuY29uc3RydWN0aW5nISwgbmFtZSwgdmFsdWUsIG5hbWVzcGFjZSk7XG4gIH1cblxuICBfX3NldFByb3BlcnR5KG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICAodGhpcy5jb25zdHJ1Y3RpbmchIGFzIERpY3QpW25hbWVdID0gdmFsdWU7XG4gIH1cblxuICBzZXRTdGF0aWNBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPik6IHZvaWQge1xuICAgIHRoaXMuX19zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUsIG5hbWVzcGFjZSk7XG4gIH1cblxuICBzZXREeW5hbWljQXR0cmlidXRlKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICB2YWx1ZTogdW5rbm93bixcbiAgICB0cnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPlxuICApOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuY29uc3RydWN0aW5nITtcbiAgICBsZXQgYXR0cmlidXRlID0gdGhpcy5lbnYuYXR0cmlidXRlRm9yKGVsZW1lbnQsIG5hbWUsIHRydXN0aW5nLCBuYW1lc3BhY2UpO1xuICAgIGF0dHJpYnV0ZS5zZXQodGhpcywgdmFsdWUsIHRoaXMuZW52KTtcbiAgICByZXR1cm4gYXR0cmlidXRlO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTaW1wbGVMaXZlQmxvY2sgaW1wbGVtZW50cyBMaXZlQmxvY2sge1xuICBwcm90ZWN0ZWQgZmlyc3Q6IE9wdGlvbjxGaXJzdE5vZGU+ID0gbnVsbDtcbiAgcHJvdGVjdGVkIGxhc3Q6IE9wdGlvbjxMYXN0Tm9kZT4gPSBudWxsO1xuICBwcm90ZWN0ZWQgZGVzdHJveWFibGVzOiBPcHRpb248U3ltYm9sRGVzdHJveWFibGVbXT4gPSBudWxsO1xuICBwcm90ZWN0ZWQgbmVzdGluZyA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJlbnQ6IFNpbXBsZUVsZW1lbnQpIHt9XG5cbiAgcGFyZW50RWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQ7XG4gIH1cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgbGV0IGZpcnN0ID0gZXhwZWN0KFxuICAgICAgdGhpcy5maXJzdCxcbiAgICAgICdjYW5ub3QgY2FsbCBgZmlyc3ROb2RlKClgIHdoaWxlIGBTaW1wbGVMaXZlQmxvY2tgIGlzIHN0aWxsIGluaXRpYWxpemluZydcbiAgICApO1xuXG4gICAgcmV0dXJuIGZpcnN0LmZpcnN0Tm9kZSgpO1xuICB9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgbGV0IGxhc3QgPSBleHBlY3QoXG4gICAgICB0aGlzLmxhc3QsXG4gICAgICAnY2Fubm90IGNhbGwgYGxhc3ROb2RlKClgIHdoaWxlIGBTaW1wbGVMaXZlQmxvY2tgIGlzIHN0aWxsIGluaXRpYWxpemluZydcbiAgICApO1xuXG4gICAgcmV0dXJuIGxhc3QubGFzdE5vZGUoKTtcbiAgfVxuXG4gIG9wZW5FbGVtZW50KGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQpIHtcbiAgICB0aGlzLmRpZEFwcGVuZE5vZGUoZWxlbWVudCk7XG4gICAgdGhpcy5uZXN0aW5nKys7XG4gIH1cblxuICBjbG9zZUVsZW1lbnQoKSB7XG4gICAgdGhpcy5uZXN0aW5nLS07XG4gIH1cblxuICBkaWRBcHBlbmROb2RlKG5vZGU6IFNpbXBsZU5vZGUpIHtcbiAgICBpZiAodGhpcy5uZXN0aW5nICE9PSAwKSByZXR1cm47XG5cbiAgICBpZiAoIXRoaXMuZmlyc3QpIHtcbiAgICAgIHRoaXMuZmlyc3QgPSBuZXcgRmlyc3Qobm9kZSk7XG4gICAgfVxuXG4gICAgdGhpcy5sYXN0ID0gbmV3IExhc3Qobm9kZSk7XG4gIH1cblxuICBkaWRBcHBlbmRCb3VuZHMoYm91bmRzOiBCb3VuZHMpIHtcbiAgICBpZiAodGhpcy5uZXN0aW5nICE9PSAwKSByZXR1cm47XG5cbiAgICBpZiAoIXRoaXMuZmlyc3QpIHtcbiAgICAgIHRoaXMuZmlyc3QgPSBib3VuZHM7XG4gICAgfVxuXG4gICAgdGhpcy5sYXN0ID0gYm91bmRzO1xuICB9XG5cbiAgZmluYWxpemUoc3RhY2s6IEVsZW1lbnRCdWlsZGVyKSB7XG4gICAgaWYgKHRoaXMuZmlyc3QgPT09IG51bGwpIHtcbiAgICAgIHN0YWNrLmFwcGVuZENvbW1lbnQoJycpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3RlTGl2ZUJsb2NrIGV4dGVuZHMgU2ltcGxlTGl2ZUJsb2NrIGltcGxlbWVudHMgU3ltYm9sRGVzdHJveWFibGUge1xuICBbREVTVFJPWV0oKSB7XG4gICAgY2xlYXIodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVwZGF0YWJsZUJsb2NrSW1wbCBleHRlbmRzIFNpbXBsZUxpdmVCbG9jayBpbXBsZW1lbnRzIFVwZGF0YWJsZUJsb2NrIHtcbiAgcmVzZXQoZW52OiBFbnZpcm9ubWVudCk6IE9wdGlvbjxTaW1wbGVOb2RlPiB7XG4gICAgbGV0IG5leHRTaWJsaW5nID0gZGV0YWNoQ2hpbGRyZW4odGhpcywgZW52KTtcblxuICAgIC8vIGxldCBuZXh0U2libGluZyA9IGNsZWFyKHRoaXMpO1xuXG4gICAgdGhpcy5maXJzdCA9IG51bGw7XG4gICAgdGhpcy5sYXN0ID0gbnVsbDtcbiAgICB0aGlzLmRlc3Ryb3lhYmxlcyA9IG51bGw7XG4gICAgdGhpcy5uZXN0aW5nID0gMDtcblxuICAgIHJldHVybiBuZXh0U2libGluZztcbiAgfVxufVxuXG4vLyBGSVhNRTogQWxsIHRoZSBub29wcyBpbiBoZXJlIGluZGljYXRlIGEgbW9kZWxsaW5nIHByb2JsZW1cbmNsYXNzIExpdmVCbG9ja0xpc3QgaW1wbGVtZW50cyBMaXZlQmxvY2sge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IHBhcmVudDogU2ltcGxlRWxlbWVudCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGJvdW5kTGlzdDogTGlua2VkTGlzdDxMaW5rZWRMaXN0Tm9kZSAmIExpdmVCbG9jaz5cbiAgKSB7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5ib3VuZExpc3QgPSBib3VuZExpc3Q7XG4gIH1cblxuICBwYXJlbnRFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLnBhcmVudDtcbiAgfVxuXG4gIGZpcnN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICBsZXQgaGVhZCA9IGV4cGVjdChcbiAgICAgIHRoaXMuYm91bmRMaXN0LmhlYWQoKSxcbiAgICAgICdjYW5ub3QgY2FsbCBgZmlyc3ROb2RlKClgIHdoaWxlIGBMaXZlQmxvY2tMaXN0YCBpcyBzdGlsbCBpbml0aWFsaXppbmcnXG4gICAgKTtcblxuICAgIHJldHVybiBoZWFkLmZpcnN0Tm9kZSgpO1xuICB9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgbGV0IHRhaWwgPSBleHBlY3QoXG4gICAgICB0aGlzLmJvdW5kTGlzdC50YWlsKCksXG4gICAgICAnY2Fubm90IGNhbGwgYGxhc3ROb2RlKClgIHdoaWxlIGBMaXZlQmxvY2tMaXN0YCBpcyBzdGlsbCBpbml0aWFsaXppbmcnXG4gICAgKTtcblxuICAgIHJldHVybiB0YWlsLmxhc3ROb2RlKCk7XG4gIH1cblxuICBvcGVuRWxlbWVudChfZWxlbWVudDogU2ltcGxlRWxlbWVudCkge1xuICAgIGFzc2VydChmYWxzZSwgJ0Nhbm5vdCBvcGVuRWxlbWVudCBkaXJlY3RseSBpbnNpZGUgYSBibG9jayBsaXN0Jyk7XG4gIH1cblxuICBjbG9zZUVsZW1lbnQoKSB7XG4gICAgYXNzZXJ0KGZhbHNlLCAnQ2Fubm90IGNsb3NlRWxlbWVudCBkaXJlY3RseSBpbnNpZGUgYSBibG9jayBsaXN0Jyk7XG4gIH1cblxuICBkaWRBcHBlbmROb2RlKF9ub2RlOiBTaW1wbGVOb2RlKSB7XG4gICAgYXNzZXJ0KGZhbHNlLCAnQ2Fubm90IGNyZWF0ZSBhIG5ldyBub2RlIGRpcmVjdGx5IGluc2lkZSBhIGJsb2NrIGxpc3QnKTtcbiAgfVxuXG4gIGRpZEFwcGVuZEJvdW5kcyhfYm91bmRzOiBCb3VuZHMpIHt9XG5cbiAgZmluYWxpemUoX3N0YWNrOiBFbGVtZW50QnVpbGRlcikge1xuICAgIGFzc2VydCh0aGlzLmJvdW5kTGlzdC5oZWFkKCkgIT09IG51bGwsICdib3VuZHNMaXN0IGNhbm5vdCBiZSBlbXB0eScpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGllbnRCdWlsZGVyKGVudjogRW52aXJvbm1lbnQsIGN1cnNvcjogQ3Vyc29ySW1wbCk6IEVsZW1lbnRCdWlsZGVyIHtcbiAgcmV0dXJuIE5ld0VsZW1lbnRCdWlsZGVyLmZvckluaXRpYWxSZW5kZXIoZW52LCBjdXJzb3IpO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==