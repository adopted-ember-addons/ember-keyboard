import Package, { V2AddonPackage } from './package';
import AppDiffer from './app-differ';
export interface RouteFiles {
    route?: string;
    template?: string;
    controller?: string;
    children: Map<string, RouteFiles>;
}
export declare class AppFiles {
    readonly tests: ReadonlyArray<string>;
    readonly components: ReadonlyArray<string>;
    readonly helpers: ReadonlyArray<string>;
    private perRoute;
    readonly otherAppFiles: ReadonlyArray<string>;
    readonly relocatedFiles: Map<string, string>;
    readonly isFastbootOnly: Map<string, boolean>;
    constructor(appDiffer: AppDiffer, resolvableExtensions: RegExp, podModulePrefix?: string);
    private handleClassicRouteFile;
    private handlePodsRouteFile;
    get routeFiles(): Readonly<RouteFiles>;
}
export interface EngineSummary {
    package: Package;
    addons: Set<V2AddonPackage>;
    parent: EngineSummary | undefined;
    sourcePath: string;
    destPath: string;
    modulePrefix: string;
    appRelativePath: string;
}
export interface Engine extends EngineSummary {
    appFiles: AppFiles;
}
