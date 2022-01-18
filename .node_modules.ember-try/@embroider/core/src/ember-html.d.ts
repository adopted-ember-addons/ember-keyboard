import { JSDOM } from 'jsdom';
import { EmberAsset } from './asset';
export interface EmberHTML {
    javascript: Node;
    styles: Node;
    implicitScripts: Node;
    implicitStyles: Node;
    testJavascript?: Node;
    implicitTestScripts?: Node;
    implicitTestStyles?: Node;
}
declare class NodeRange {
    end: Node;
    start: Node;
    constructor(initial: Node);
    clear(): void;
    insert(node: Node): void;
}
export declare class PreparedEmberHTML {
    private asset;
    dom: JSDOM;
    javascript: NodeRange;
    styles: NodeRange;
    implicitScripts: NodeRange;
    implicitStyles: NodeRange;
    testJavascript: NodeRange;
    implicitTestScripts: NodeRange;
    implicitTestStyles: NodeRange;
    constructor(asset: EmberAsset);
    private allRanges;
    clear(): void;
    insertScriptTag(location: NodeRange, relativeSrc: string, opts?: {
        type?: string;
        tag?: string;
    }): void;
    insertStyleLink(location: NodeRange, relativeHref: string): void;
}
export declare function insertNewline(at: Node): void;
export {};
