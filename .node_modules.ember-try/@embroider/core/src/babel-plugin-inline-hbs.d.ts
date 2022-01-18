import { TemplateCompiler, TemplateCompilerParams } from './template-compiler';
import { ResolvedDep } from './resolver';
interface State {
    opts: {
        templateCompiler: TemplateCompilerParams;
        stage: 1 | 3;
    };
    file: {
        code: string;
        opts: {
            filename: string;
        };
    };
    dependencies: Map<string, ResolvedDep>;
    templateCompiler: TemplateCompiler | undefined;
}
export declare type Params = State['opts'];
declare function inlineHBSTransform(): unknown;
declare namespace inlineHBSTransform {
    var _parallelBabel: {
        requireFile: string;
    };
    var baseDir: () => string;
}
export default inlineHBSTransform;
