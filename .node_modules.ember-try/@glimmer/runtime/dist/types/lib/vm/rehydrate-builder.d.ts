import { Bounds, Environment, Option, ElementBuilder } from '@glimmer/interfaces';
import { Stack, Maybe } from '@glimmer/util';
import { AttrNamespace, SimpleComment, SimpleElement, SimpleNode, SimpleText } from '@simple-dom/interface';
import { CursorImpl } from '../bounds';
import { CURSOR_STACK, NewElementBuilder, RemoteLiveBlock } from './element-builder';
export declare const SERIALIZATION_FIRST_NODE_STRING = "%+b:0%";
export declare function isSerializationFirstNode(node: SimpleNode): boolean;
export declare class RehydratingCursor extends CursorImpl {
    readonly startingBlockDepth: number;
    candidate: Option<SimpleNode>;
    openBlockDepth: number;
    injectedOmittedNode: boolean;
    constructor(element: SimpleElement, nextSibling: Option<SimpleNode>, startingBlockDepth: number);
}
export declare class RehydrateBuilder extends NewElementBuilder implements ElementBuilder {
    private unmatchedAttributes;
    [CURSOR_STACK]: Stack<RehydratingCursor>;
    private blockDepth;
    constructor(env: Environment, parentNode: SimpleElement, nextSibling: Option<SimpleNode>);
    readonly currentCursor: Option<RehydratingCursor>;
    candidate: Option<SimpleNode>;
    pushElement(element: SimpleElement, nextSibling?: Maybe<SimpleNode>): void;
    private clearMismatch;
    __openBlock(): void;
    __closeBlock(): void;
    __appendNode(node: SimpleNode): SimpleNode;
    __appendHTML(html: string): Bounds;
    protected remove(node: SimpleNode): Option<SimpleNode>;
    private markerBounds;
    __appendText(string: string): SimpleText;
    __appendComment(string: string): SimpleComment;
    __openElement(tag: string): SimpleElement;
    __setAttribute(name: string, value: string, namespace: Option<AttrNamespace>): void;
    __setProperty(name: string, value: string): void;
    __flushElement(parent: SimpleElement, constructing: SimpleElement): void;
    willCloseElement(): void;
    getMarker(element: HTMLElement, guid: string): Option<SimpleNode>;
    __pushRemoteElement(element: SimpleElement, cursorId: string, insertBefore: Maybe<SimpleNode>): Option<RemoteLiveBlock>;
    didAppendBounds(bounds: Bounds): Bounds;
}
export declare function rehydrationBuilder(env: Environment, cursor: CursorImpl): ElementBuilder;
//# sourceMappingURL=rehydrate-builder.d.ts.map