import Dependencies = require('../dependencies');
export declare type ProcessStringResult<Data = {}> = Record<'output', string> & Data;
export interface Context {
    processString(contents: string, relativePath: string): string | ProcessStringResult | Promise<string | ProcessStringResult>;
    postProcess(v: ProcessStringResult, relativePath: string): ProcessStringResult | Promise<ProcessStringResult>;
    cacheKey?(): string;
    cacheKeyProcessString?(contents: string, relativePath: string): string;
}
export interface InstrumentationSchema {
    persistentCacheHit: number;
    persistentCachePrime: number;
}
export interface Strategy {
    init(ctx: Context): void;
    processString(ctx: Context, contents: string, relativePath: string, forceInvalidation: boolean, instrumentation: InstrumentationSchema): string | ProcessStringResult | Promise<string | ProcessStringResult>;
    initialDependencies(rootFS: Dependencies.FSFacade, inputEncoding: string): Dependencies;
    sealDependencies(dependencies: Dependencies): void;
}
//# sourceMappingURL=strategy.d.ts.map