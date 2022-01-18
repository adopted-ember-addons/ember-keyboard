import { Node } from 'broccoli-node-api';
import PackageCache from './package-cache';
export default interface Stage {
    readonly tree: Node;
    readonly inputPath: string;
    ready(): Promise<{
        readonly outputPath: string;
        readonly packageCache?: PackageCache;
    }>;
}
