import { SimpleElement, SimpleDocument, SimpleNode, SimpleText, SimpleComment } from '@simple-dom/interface';
import { Option, Bounds } from '@glimmer/interfaces';
export declare const BLACKLIST_TABLE: any;
export declare class DOMOperations {
    protected document: SimpleDocument;
    protected uselessElement: SimpleElement;
    constructor(document: SimpleDocument);
    protected setupUselessElement(): void;
    createElement(tag: string, context?: SimpleElement): SimpleElement;
    insertBefore(parent: SimpleElement, node: SimpleNode, reference: Option<SimpleNode>): void;
    insertHTMLBefore(parent: SimpleElement, nextSibling: Option<SimpleNode>, html: string): Bounds;
    createTextNode(text: string): SimpleText;
    createComment(data: string): SimpleComment;
}
export declare function moveNodesBefore(source: SimpleNode, target: SimpleElement, nextSibling: Option<SimpleNode>): Bounds;
//# sourceMappingURL=operations.d.ts.map