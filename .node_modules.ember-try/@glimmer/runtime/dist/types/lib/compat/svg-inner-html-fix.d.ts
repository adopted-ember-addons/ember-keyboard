import { Option } from '@glimmer/util';
import { Namespace, SimpleDocument } from '@simple-dom/interface';
import { DOMOperations } from '../dom/operations';
export declare const SVG_NAMESPACE = Namespace.SVG;
export declare type SVG_NAMESPACE = typeof SVG_NAMESPACE;
export declare function applySVGInnerHTMLFix(document: Option<SimpleDocument>, DOMClass: typeof DOMOperations, svgNamespace: SVG_NAMESPACE): typeof DOMOperations;
//# sourceMappingURL=svg-inner-html-fix.d.ts.map