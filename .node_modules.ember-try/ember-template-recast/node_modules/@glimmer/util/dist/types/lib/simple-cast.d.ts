import { SimpleDocument, SimpleElement, SimpleNode } from '@simple-dom/interface';
interface GenericElementTags {
    HTML: HTMLElement;
    SVG: SVGElement;
    ELEMENT: HTMLElement | SVGElement;
}
interface GenericNodeTags {
    NODE: Node;
}
declare type GenericNodeTag = keyof GenericNodeTags;
interface BrowserElementTags extends HTMLElementTagNameMap, GenericElementTags {
}
declare type BrowserElementTag = keyof BrowserElementTags;
interface BrowserTags extends BrowserElementTags, GenericNodeTags {
}
declare type BrowserTag = keyof BrowserTags;
declare type NodeCheck<N extends Node> = (node: Node) => node is N;
declare type SugaryNodeCheck<K extends BrowserTag = BrowserTag> = NodeCheck<BrowserTags[K]> | K | K[];
declare type NodeForSugaryCheck<S extends SugaryNodeCheck<BrowserTag>> = S extends NodeCheck<infer N> ? N : S extends keyof BrowserTags ? BrowserTags[S] : S extends (keyof BrowserTags)[] ? BrowserTags[S[number]] : never;
declare type BrowserNode = Element | Document | DocumentFragment | Text | Comment | Node;
export declare function castToSimple(doc: Document | SimpleDocument): SimpleDocument;
export declare function castToSimple(elem: Element | SimpleElement): SimpleElement;
export declare function castToSimple(node: Node | SimpleNode): SimpleNode;
export declare function castToBrowser(doc: Document | SimpleDocument): Document;
export declare function castToBrowser<S extends SugaryNodeCheck<BrowserElementTag>>(node: BrowserNode | SimpleNode, check: S): NodeForSugaryCheck<S>;
export declare function castToBrowser<S extends SugaryNodeCheck<GenericNodeTag>>(element: BrowserNode | SimpleNode, check: S): NodeForSugaryCheck<S>;
export declare function castToBrowser<K extends keyof HTMLElementTagNameMap>(element: SimpleElement | Element, check: K): HTMLElementTagNameMap[K];
export declare function checkNode<S extends SugaryNodeCheck>(node: Node | null, check: S): NodeForSugaryCheck<S>;
export {};
//# sourceMappingURL=simple-cast.d.ts.map