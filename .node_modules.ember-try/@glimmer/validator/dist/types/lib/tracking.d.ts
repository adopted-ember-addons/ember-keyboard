import { Tag } from './validators';
export declare function beginTrackFrame(debuggingContext?: string | false): void;
export declare function endTrackFrame(): Tag;
export declare function beginUntrackFrame(): void;
export declare function endUntrackFrame(): void;
export declare function resetTracking(): string | void;
export declare function isTracking(): boolean;
export declare function consumeTag(tag: Tag): void;
declare const CACHE_KEY: unique symbol;
export interface Cache<T = unknown> {
    [CACHE_KEY]: T;
}
export declare function createCache<T>(fn: () => T, debuggingLabel?: string | false): Cache<T>;
export declare function getValue<T>(cache: Cache<T>): T | undefined;
export declare function isConst(cache: Cache): boolean;
export declare function track(callback: () => void, debugLabel?: string | false): Tag;
export declare function untrack<T>(callback: () => T): T;
export {};
//# sourceMappingURL=tracking.d.ts.map