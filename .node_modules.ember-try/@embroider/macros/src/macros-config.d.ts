import { PluginItem } from '@babel/core';
export declare type Merger = (configs: unknown[]) => unknown;
export default class MacrosConfig {
    static for(key: any): MacrosConfig;
    private mode;
    private globalConfig;
    private isDevelopingPackageRoots;
    private appPackageRoot;
    enableRuntimeMode(): void;
    enableAppDevelopment(appPackageRoot: string): void;
    enablePackageDevelopment(packageRoot: string): void;
    private constructor();
    private _configWritable;
    private configs;
    private mergers;
    setConfig(fromPath: string, packageName: string, config: unknown): void;
    setOwnConfig(fromPath: string, config: unknown): void;
    setGlobalConfig(fromPath: string, key: string, value: unknown): void;
    private internalSetConfig;
    useMerger(fromPath: string, merger: Merger): void;
    private cachedUserConfigs;
    private get userConfigs();
    babelPluginConfig(owningPackageRoot?: string): PluginItem;
    static astPlugins(owningPackageRoot?: string): {
        plugins: Function[];
        setConfig: (config: MacrosConfig) => void;
    };
    private mergerFor;
    packageMoved(oldPath: string, newPath: string): void;
    private moves;
    getConfig(fromPath: string, packageName: string): unknown;
    getOwnConfig(fromPath: string): unknown;
    private resolvePackage;
    finalize(): void;
}
