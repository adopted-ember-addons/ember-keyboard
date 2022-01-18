import { Tag, UpdatableTag } from './validators';
import { Option } from '@glimmer/interfaces';
declare class Tracker {
    private tags;
    private last;
    add(tag: Tag): void;
    readonly size: number;
    combine(): UpdatableTag;
}
export declare function pushTrackFrame(): Option<Tracker>;
export declare function popTrackFrame(old: Option<Tracker>): UpdatableTag;
export declare type Getter<T, K extends keyof T> = (self: T) => T[K] | undefined;
export declare type Setter<T, K extends keyof T> = (self: T, value: T[K]) => void;
export declare function trackedData<T extends object, K extends keyof T>(key: K): {
    getter: Getter<T, K>;
    setter: Setter<T, K>;
};
export {};
//# sourceMappingURL=autotrack.d.ts.map