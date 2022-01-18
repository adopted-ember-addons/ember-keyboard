import { Node } from '../types/nodes';
export default class Path<N extends Node> {
    node: N;
    parent: Path<Node> | null;
    parentKey: string | null;
    constructor(node: N, parent?: Path<Node> | null, parentKey?: string | null);
    get parentNode(): Node | null;
    parents(): Iterable<Path<Node> | null>;
}
//# sourceMappingURL=path.d.ts.map