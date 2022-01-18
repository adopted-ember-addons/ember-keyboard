export declare const protocol = "__embroider_portable_values__";
export interface PortableResult {
    value: any;
    isParallelSafe: boolean;
    needsHydrate: boolean;
}
export interface PortableHint {
    requireFile: string;
    useMethod?: string;
}
export declare class Portable {
    private opts;
    constructor(opts?: {
        dehydrate?: (value: any, accessPath: string[]) => PortableResult | undefined;
        hydrate?: (value: any, accessPath: string[]) => {
            value: any;
        } | undefined;
        hints?: PortableHint[];
    });
    dehydrate(value: any, accessPath?: string[]): PortableResult;
    hydrate(input: any, accessPath?: string[]): any;
    get foundHints(): Map<any, PortableHint>;
}
