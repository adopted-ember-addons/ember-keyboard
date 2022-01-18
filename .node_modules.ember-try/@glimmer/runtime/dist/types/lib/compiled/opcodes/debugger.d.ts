export declare type DebugGet = (path: string) => unknown;
export declare type DebugCallback = (context: unknown, get: DebugGet) => void;
export declare function setDebuggerCallback(cb: DebugCallback): void;
export declare function resetDebuggerCallback(): void;
//# sourceMappingURL=debugger.d.ts.map