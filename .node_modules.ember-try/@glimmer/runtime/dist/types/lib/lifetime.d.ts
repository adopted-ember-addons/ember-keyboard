import { BlockOpcode } from './vm/update';
import { Option, Bounds, Environment } from '@glimmer/interfaces';
import { SimpleNode } from '@simple-dom/interface';
export declare function asyncReset(parent: object, env: Environment): void;
export declare function asyncDestroy(parent: object, env: Environment): void;
export declare function detach(parent: BlockOpcode, env: Environment): void;
export declare function detachChildren(parent: Bounds, env: Environment): Option<SimpleNode>;
//# sourceMappingURL=lifetime.d.ts.map