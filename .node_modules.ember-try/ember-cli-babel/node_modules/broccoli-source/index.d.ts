interface DirectoryOptions {
    annotation?: string;
    name?: string;
}
interface BroccoliFeatures {
    persistentOutputFlag?: boolean;
    sourceDirectories?: boolean;
}
interface BroccoliGetInfo {
    nodeType: string;
    sourceDirectory: string;
    watched: boolean;
    instantiationStack: string | undefined;
    name: string;
    annotation: string | undefined;
}
declare type ReadTreeCallback = (sourceDirectory: string) => void;
declare class Directory {
    _directoryPath: string;
    _watched: boolean;
    _name: string;
    _annotation: string | undefined;
    _instantiationStack: string | undefined;
    __broccoliFeatures__: BroccoliFeatures;
    constructor(directoryPath: string, watched?: boolean | string, options?: DirectoryOptions);
    __broccoliGetInfo__(builderFeatures?: BroccoliFeatures): BroccoliGetInfo;
    read(readTree: ReadTreeCallback): string | void;
    cleanup(): void;
}
declare class WatchedDir extends Directory {
    constructor(directoryPath: string, options?: DirectoryOptions);
}
declare class UnwatchedDir extends Directory {
    constructor(directoryPath: string, options?: DirectoryOptions);
}
declare const _default: {
    Directory: typeof Directory;
    WatchedDir: typeof WatchedDir;
    UnwatchedDir: typeof UnwatchedDir;
};
export = _default;
