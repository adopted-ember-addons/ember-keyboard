export default interface Options {
    staticHelpers?: boolean;
    staticComponents?: boolean;
    splitAtRoutes?: (RegExp | string)[];
    staticAppPaths?: string[];
    skipBabel?: {
        package: string;
        semverRange?: string;
    }[];
    pluginHints?: {
        resolve: string[];
        useMethod?: string;
    }[];
}
export declare function optionsWithDefaults(options?: Options): Required<Options>;
