import makeDebug from 'debug';
declare const todo: makeDebug.IDebugger;
declare const unsupported: makeDebug.IDebugger;
declare const debug: makeDebug.IDebugger;
export declare function warn(message: string, ...params: any[]): void;
export declare function throwOnWarnings(): void;
export declare function expectWarning(pattern: RegExp, fn: () => void): boolean;
export { todo, unsupported, debug };
