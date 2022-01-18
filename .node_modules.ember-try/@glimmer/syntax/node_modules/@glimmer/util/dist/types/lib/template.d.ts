import { HandleResult, Template, TemplateOk, OkHandle, ErrHandle } from '@glimmer/interfaces';
export declare function unwrapHandle(handle: HandleResult): number;
export declare function unwrapTemplate(template: Template): TemplateOk;
export declare function extractHandle(handle: HandleResult): number;
export declare function isOkHandle(handle: HandleResult): handle is OkHandle;
export declare function isErrHandle(handle: HandleResult): handle is ErrHandle;
//# sourceMappingURL=template.d.ts.map