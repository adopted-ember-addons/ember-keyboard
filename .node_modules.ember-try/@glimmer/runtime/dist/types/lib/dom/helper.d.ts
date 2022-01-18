import { GlimmerTreeChanges, GlimmerTreeConstruction } from '@glimmer/interfaces';
import { Option } from '@glimmer/util';
import { AttrNamespace, ElementNamespace, Namespace, SimpleDocument, SimpleElement, SimpleNode } from '@simple-dom/interface';
import { DOMOperations } from './operations';
export declare function isWhitespace(string: string): boolean;
export declare namespace DOM {
    class TreeConstruction extends DOMOperations implements GlimmerTreeConstruction {
        createElementNS(namespace: ElementNamespace, tag: string): SimpleElement;
        setAttribute(element: SimpleElement, name: string, value: string, namespace?: Option<AttrNamespace>): void;
    }
    const DOMTreeConstruction: typeof TreeConstruction;
    type DOMTreeConstruction = TreeConstruction;
}
export declare class DOMChangesImpl extends DOMOperations implements GlimmerTreeChanges {
    protected document: SimpleDocument;
    protected namespace: Option<string>;
    constructor(document: SimpleDocument);
    setAttribute(element: SimpleElement, name: string, value: string): void;
    removeAttribute(element: SimpleElement, name: string): void;
    insertAfter(element: SimpleElement, node: SimpleNode, reference: SimpleNode): void;
}
declare let helper: typeof DOMChangesImpl;
export default helper;
export declare const DOMTreeConstruction: typeof DOM.TreeConstruction;
export declare type DOMTreeConstruction = DOM.DOMTreeConstruction;
export declare type DOMNamespace = Namespace;
//# sourceMappingURL=helper.d.ts.map