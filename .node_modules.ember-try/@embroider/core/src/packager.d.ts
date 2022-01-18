export interface Variant {
    name: string;
    runtime: 'all' | 'browser' | 'fastboot';
    optimizeForProduction: boolean;
}
export interface Packager<Options> {
    new (inputPath: string, outputPath: string, variants: Variant[], consoleWrite: (message: string) => void, options?: Options): PackagerInstance;
    annotation: string;
}
export interface PackagerInstance {
    build(): Promise<void>;
}
export declare function applyVariantToBabelConfig(variant: Variant, babelConfig: any): any;
export declare function applyVariantToTemplateCompiler(_variant: Variant, templateCompiler: any): any;
