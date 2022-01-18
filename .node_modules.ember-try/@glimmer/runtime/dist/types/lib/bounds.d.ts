import { Bounds, Cursor, SymbolDestroyable } from '@glimmer/interfaces';
import { Option } from '@glimmer/util';
import { SimpleElement, SimpleNode } from '@simple-dom/interface';
export declare class CursorImpl implements Cursor {
    element: SimpleElement;
    nextSibling: Option<SimpleNode>;
    constructor(element: SimpleElement, nextSibling: Option<SimpleNode>);
}
export declare type DestroyableBounds = Bounds & SymbolDestroyable;
export declare class ConcreteBounds implements Bounds {
    parentNode: SimpleElement;
    private first;
    private last;
    constructor(parentNode: SimpleElement, first: SimpleNode, last: SimpleNode);
    parentElement(): SimpleElement;
    firstNode(): SimpleNode;
    lastNode(): SimpleNode;
}
export declare class SingleNodeBounds implements Bounds {
    private parentNode;
    private node;
    constructor(parentNode: SimpleElement, node: SimpleNode);
    parentElement(): SimpleElement;
    firstNode(): SimpleNode;
    lastNode(): SimpleNode;
}
export declare function move(bounds: Bounds, reference: Option<SimpleNode>): Option<SimpleNode>;
export declare function clear(bounds: Bounds): Option<SimpleNode>;
//# sourceMappingURL=bounds.d.ts.map