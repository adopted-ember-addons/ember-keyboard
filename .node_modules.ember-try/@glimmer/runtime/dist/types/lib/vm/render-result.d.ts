import { Environment, RenderResult, LiveBlock } from '@glimmer/interfaces';
import { DESTROY, LinkedList } from '@glimmer/util';
import { SimpleElement, SimpleNode } from '@simple-dom/interface';
import { UpdatingOpcode } from '../opcodes';
export default class RenderResultImpl implements RenderResult {
    env: Environment;
    private updating;
    private bounds;
    readonly drop: object;
    constructor(env: Environment, updating: LinkedList<UpdatingOpcode>, bounds: LiveBlock, drop: object);
    rerender({ alwaysRevalidate }?: {
        alwaysRevalidate?: false;
    }): void;
    parentElement(): SimpleElement;
    firstNode(): SimpleNode;
    lastNode(): SimpleNode;
    handleException(): void;
    [DESTROY](): void;
    destroy(): void;
}
//# sourceMappingURL=render-result.d.ts.map