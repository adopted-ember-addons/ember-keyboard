export declare function makeFirstTransform(opts: {
    userConfigs: {
        [packageRoot: string]: unknown;
    };
    baseDir?: string;
}): (env: {
    syntax: {
        builders: any;
    };
    meta: {
        moduleName: string;
    };
    filename: string;
}) => {
    name: string;
    visitor: {
        Program: {
            enter(node: any): void;
            exit(node: any): void;
        };
        SubExpression(node: any): any;
        MustacheStatement(node: any): any;
    };
};
export declare function makeSecondTransform(): (env: {
    syntax: {
        builders: any;
    };
}) => {
    name: string;
    visitor: {
        Program: {
            enter(node: any): void;
            exit(node: any): void;
        };
        BlockStatement(node: any): any;
        SubExpression(node: any): any;
        ElementNode(node: any): void;
        MustacheStatement(node: any): any;
    };
};
