import { V2AddonPackage } from './package';
import { TransformOptions } from '@babel/core';
export default class AppDiffer {
    private outputPath;
    private ownAppJSDir;
    private ownFastbootJSDir?;
    private babelParserConfig?;
    private differ;
    private sourceDirs;
    private firstFastbootTree;
    readonly files: Map<string, string | null>;
    isFastbootOnly: Map<string, boolean>;
    constructor(outputPath: string, ownAppJSDir: string, activeAddonDescendants: V2AddonPackage[], fastbootEnabled?: boolean, ownFastbootJSDir?: string | undefined, babelParserConfig?: TransformOptions | undefined);
    update(): void;
    private updateFiles;
}
