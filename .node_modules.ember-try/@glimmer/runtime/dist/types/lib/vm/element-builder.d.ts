import { Bounds, ElementOperations, Environment, GlimmerTreeChanges, GlimmerTreeConstruction, SymbolDestroyable, ElementBuilder, LiveBlock, CursorStackSymbol, UpdatableBlock, Cursor, ModifierManager } from '@glimmer/interfaces';
import { DESTROY, LinkedList, LinkedListNode, Option, Stack, Maybe } from '@glimmer/util';
import { AttrNamespace, SimpleComment, SimpleDocumentFragment, SimpleElement, SimpleNode, SimpleText } from '@simple-dom/interface';
import { CursorImpl } from '../bounds';
import { DynamicAttribute } from './attributes/dynamic';
export interface FirstNode {
    firstNode(): SimpleNode;
}
export interface LastNode {
    lastNode(): SimpleNode;
}
export declare class Fragment implements Bounds {
    private bounds;
    constructor(bounds: Bounds);
    parentElement(): SimpleElement;
    firstNode(): SimpleNode;
    lastNode(): SimpleNode;
}
export declare const CURSOR_STACK: CursorStackSymbol;
export declare class NewElementBuilder implements ElementBuilder {
    dom: GlimmerTreeConstruction;
    updateOperations: GlimmerTreeChanges;
    constructing: Option<SimpleElement>;
    operations: Option<ElementOperations>;
    private env;
    [CURSOR_STACK]: Stack<Cursor>;
    private modifierStack;
    private blockStack;
    static forInitialRender(env: Environment, cursor: CursorImpl): NewElementBuilder;
    static resume(env: Environment, block: UpdatableBlock): NewElementBuilder;
    constructor(env: Environment, parentNode: SimpleElement, nextSibling: Option<SimpleNode>);
    protected initialize(): this;
    debugBlocks(): LiveBlock[];
    readonly element: SimpleElement;
    readonly nextSibling: Option<SimpleNode>;
    block(): LiveBlock;
    popElement(): void;
    pushSimpleBlock(): LiveBlock;
    pushUpdatableBlock(): UpdatableBlockImpl;
    pushBlockList(list: LinkedList<LinkedListNode & LiveBlock>): LiveBlockList;
    protected pushLiveBlock<T extends LiveBlock>(block: T, isRemote?: boolean): T;
    popBlock(): LiveBlock;
    __openBlock(): void;
    __closeBlock(): void;
    openElement(tag: string): SimpleElement;
    __openElement(tag: string): SimpleElement;
    flushElement(modifiers: Option<[ModifierManager, unknown][]>): void;
    __flushElement(parent: SimpleElement, constructing: SimpleElement): void;
    closeElement(): Option<[ModifierManager, unknown][]>;
    pushRemoteElement(element: SimpleElement, guid: string, insertBefore: Maybe<SimpleNode>): Option<RemoteLiveBlock>;
    __pushRemoteElement(element: SimpleElement, _guid: string, insertBefore: Maybe<SimpleNode>): Option<RemoteLiveBlock>;
    popRemoteElement(): void;
    protected pushElement(element: SimpleElement, nextSibling?: Maybe<SimpleNode>): void;
    private pushModifiers;
    private popModifiers;
    didAppendBounds(bounds: Bounds): Bounds;
    didAppendNode<T extends SimpleNode>(node: T): T;
    didOpenElement(element: SimpleElement): SimpleElement;
    willCloseElement(): void;
    appendText(string: string): SimpleText;
    __appendText(text: string): SimpleText;
    __appendNode(node: SimpleNode): SimpleNode;
    __appendFragment(fragment: SimpleDocumentFragment): Bounds;
    __appendHTML(html: string): Bounds;
    appendDynamicHTML(value: string): void;
    appendDynamicText(value: string): SimpleText;
    appendDynamicFragment(value: SimpleDocumentFragment): void;
    appendDynamicNode(value: SimpleNode): void;
    private trustedContent;
    private untrustedContent;
    appendComment(string: string): SimpleComment;
    __appendComment(string: string): SimpleComment;
    __setAttribute(name: string, value: string, namespace: Option<AttrNamespace>): void;
    __setProperty(name: string, value: unknown): void;
    setStaticAttribute(name: string, value: string, namespace: Option<AttrNamespace>): void;
    setDynamicAttribute(name: string, value: unknown, trusting: boolean, namespace: Option<AttrNamespace>): DynamicAttribute;
}
export declare class SimpleLiveBlock implements LiveBlock {
    private parent;
    protected first: Option<FirstNode>;
    protected last: Option<LastNode>;
    protected destroyables: Option<SymbolDestroyable[]>;
    protected nesting: number;
    constructor(parent: SimpleElement);
    parentElement(): SimpleElement;
    firstNode(): SimpleNode;
    lastNode(): SimpleNode;
    openElement(element: SimpleElement): void;
    closeElement(): void;
    didAppendNode(node: SimpleNode): void;
    didAppendBounds(bounds: Bounds): void;
    finalize(stack: ElementBuilder): void;
}
export declare class RemoteLiveBlock extends SimpleLiveBlock implements SymbolDestroyable {
    [DESTROY](): void;
}
export declare class UpdatableBlockImpl extends SimpleLiveBlock implements UpdatableBlock {
    reset(env: Environment): Option<SimpleNode>;
}
declare class LiveBlockList implements LiveBlock {
    private readonly parent;
    private readonly boundList;
    constructor(parent: SimpleElement, boundList: LinkedList<LinkedListNode & LiveBlock>);
    parentElement(): SimpleElement;
    firstNode(): SimpleNode;
    lastNode(): SimpleNode;
    openElement(_element: SimpleElement): void;
    closeElement(): void;
    didAppendNode(_node: SimpleNode): void;
    didAppendBounds(_bounds: Bounds): void;
    finalize(_stack: ElementBuilder): void;
}
export declare function clientBuilder(env: Environment, cursor: CursorImpl): ElementBuilder;
export {};
//# sourceMappingURL=element-builder.d.ts.map