import { OutputPaths } from './wait-for-trees';
import PackageCache from './package-cache';
import Stage from './stage';
import { Node } from 'broccoli-node-api';
export default class BuildStage<NamedTrees> implements Stage {
    private prevStage;
    private inTrees;
    private annotation;
    private instantiate;
    private active;
    private outputPath;
    private packageCache;
    constructor(prevStage: Stage, inTrees: NamedTrees, annotation: string, instantiate: (root: string, appSrcDir: string, packageCache: PackageCache) => Promise<BuilderInstance<NamedTrees>>);
    get tree(): Node;
    get inputPath(): string;
    ready(): Promise<{
        outputPath: string;
        packageCache: PackageCache;
    }>;
    private get deferReady();
    private augment;
    private deAugment;
}
interface BuilderInstance<NamedTrees> {
    build(inputPaths: OutputPaths<NamedTrees>): Promise<void>;
}
export {};
