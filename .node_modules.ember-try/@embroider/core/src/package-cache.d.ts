import Package from './package';
export default class PackageCache {
    resolve(packageName: string, fromPackage: Package): Package;
    getApp(packageRoot: string): Package;
    seed(pkg: Package): void;
    protected rootCache: Map<string, Package>;
    protected resolutionCache: Map<Package, Map<string, Package | null>>;
    basedir(pkg: Package): string;
    get(packageRoot: string): Package;
    ownerOfFile(filename: string): Package | undefined;
    shareAs(identifier: string): void;
    static shared(identifier: string): PackageCache;
}
