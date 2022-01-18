import { TransformOptions } from '@babel/core';
export declare function describeExports(code: string, babelParserConfig: TransformOptions): {
    names: Set<string>;
    hasDefaultExport: boolean;
};
