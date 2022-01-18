import { TransformOptions } from '@babel/core';
import { PortableHint } from './portable';
export declare type ResolveOptions = {
    basedir: string;
} | {
    resolve: (name: string) => any;
};
export declare function makePortable(config: TransformOptions, resolveOptions: ResolveOptions, hints: PortableHint[]): {
    config: TransformOptions;
    isParallelSafe: boolean;
};
